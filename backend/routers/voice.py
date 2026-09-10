from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import os, uuid, shutil

from database import get_db
from models import VoiceNote

router = APIRouter(tags=["voice-notes"])

# Where audio files are saved on the server
# In production this would be an S3 bucket URL instead
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "voice")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ─────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────

class VoiceNoteResponse(BaseModel):
    """What the app receives when fetching voice notes"""
    id:             str
    caregiver_id:   str
    patient_id:     str
    file_url:       str       # URL the app uses to stream/download the audio
    scheduled_time: str       # "14:30" — 24hr format
    label:          str       # "Take your evening medicine"
    played:         bool
    created_at:     datetime

    class Config:
        from_attributes = True

class MarkPlayedRequest(BaseModel):
    note_id: str


# ─────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────

@router.post("/", response_model=VoiceNoteResponse, status_code=201)
async def create_voice_note(
    patient_id:     str       = Form(...),   # Form(...) means required form field
    caregiver_id:   str       = Form(...),
    scheduled_time: str       = Form(...),   # "14:30"
    label:          str       = Form(...),   # human-readable description
    audio:          UploadFile = File(...),  # the actual audio file
    db:             Session   = Depends(get_db)
):
    """
    POST /voice-notes/
    Content-Type: multipart/form-data  (because we're uploading a file)

    Caregiver records a voice note and picks a scheduled time.
    The app sends the audio file + metadata in one request.

    Web dev equivalent: like a file upload endpoint in Express
        app.post('/upload', upload.single('audio'), (req, res) => { ... })
    
    In React Native (how the app calls this):
        const formData = new FormData()
        formData.append('audio', { uri, type: 'audio/m4a', name: 'note.m4a' })
        formData.append('patient_id', patientId)
        formData.append('scheduled_time', '14:30')
        formData.append('label', 'Take your medicine')
        fetch('/voice-notes/', { method: 'POST', body: formData })
    """

    # 1. Give the file a unique name so files never overwrite each other
    extension = audio.filename.split(".")[-1] if "." in audio.filename else "m4a"
    filename  = f"{uuid.uuid4()}.{extension}"
    filepath  = os.path.join(UPLOAD_DIR, filename)

    # 2. Save file to disk
    #    In production: upload to S3 and store the S3 URL instead
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    # 3. Build a URL the app can use to fetch the file later
    #    This assumes your server is running at SERVER_URL
    server_url = os.getenv("SERVER_URL", "http://192.168.1.100:8000")
    file_url   = f"{server_url}/voice-notes/file/{filename}"

    # 4. Save metadata to DB
    note = VoiceNote(
        caregiver_id   = caregiver_id,
        patient_id     = patient_id,
        file_url       = file_url,
        scheduled_time = scheduled_time,
        label          = label,
        played         = False,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return note


@router.get("/patient/{patient_id}", response_model=List[VoiceNoteResponse])
def get_voice_notes(patient_id: str, db: Session = Depends(get_db)):
    """
    GET /voice-notes/patient/{patient_id}
    
    Returns ALL scheduled voice notes for a patient.
    The patient app calls this on startup to know what to play and when.
    
    Flow:
      App starts → fetch all voice notes → 
      start timer that runs every 60s → 
      check if current time matches any note's scheduled_time →
      if yes and not played → play audio → 
      call PATCH /voice-notes/{id}/played to mark as done
    """
    notes = (
        db.query(VoiceNote)
        .filter(VoiceNote.patient_id == patient_id)
        .order_by(VoiceNote.scheduled_time)
        .all()
    )
    return notes


@router.get("/patient/{patient_id}/due", response_model=List[VoiceNoteResponse])
def get_due_notes(patient_id: str, db: Session = Depends(get_db)):
    """
    GET /voice-notes/patient/{patient_id}/due
    
    Returns only voice notes that are due RIGHT NOW and not yet played.
    The app timer calls this every minute instead of checking locally.
    Simpler than doing time math on the phone.
    
    "Due" = scheduled_time is within the current minute window
    Example: if now is 14:32, returns notes scheduled for "14:32"
    """
    now          = datetime.now()
    current_time = now.strftime("%H:%M")   # "14:32"

    due_notes = (
        db.query(VoiceNote)
        .filter(
            VoiceNote.patient_id     == patient_id,
            VoiceNote.scheduled_time == current_time,
            VoiceNote.played         == False,
        )
        .all()
    )
    return due_notes


@router.patch("/{note_id}/played")
def mark_as_played(note_id: str, db: Session = Depends(get_db)):
    """
    PATCH /voice-notes/{note_id}/played
    
    Called by the patient app AFTER the audio finishes playing.
    Marks the note as played so it doesn't play again.
    
    Like marking a notification as read.
    """
    note = db.query(VoiceNote).filter(VoiceNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Voice note not found")

    note.played = True
    db.commit()
    return {"ok": True, "note_id": note_id}


@router.delete("/{note_id}")
def delete_voice_note(note_id: str, db: Session = Depends(get_db)):
    """
    DELETE /voice-notes/{note_id}
    
    Caregiver deletes a scheduled note.
    Also removes the audio file from disk.
    """
    note = db.query(VoiceNote).filter(VoiceNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Voice note not found")

    # Delete audio file from disk
    filename = note.file_url.split("/")[-1]
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    db.delete(note)
    db.commit()
    return {"ok": True}


@router.get("/file/{filename}")
def serve_audio_file(filename: str):
    """
    GET /voice-notes/file/{filename}
    
    Serves the actual audio file to the patient app for playback.
    In production: redirect to an S3 pre-signed URL instead.
    
    The patient app uses expo-av to stream from this URL:
        const { sound } = await Audio.Sound.createAsync({ uri: note.file_url })
        await sound.playAsync()
    """
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(
        path         = filepath,
        media_type   = "audio/m4a",
        filename     = filename,
    )


@router.get("/caregiver/{caregiver_id}", response_model=List[VoiceNoteResponse])
def get_caregiver_notes(caregiver_id: str, db: Session = Depends(get_db)):
    """
    GET /voice-notes/caregiver/{caregiver_id}
    
    Returns all voice notes the caregiver has scheduled
    across ALL their patients. For the caregiver management screen.
    """
    notes = (
        db.query(VoiceNote)
        .filter(VoiceNote.caregiver_id == caregiver_id)
        .order_by(VoiceNote.scheduled_time)
        .all()
    )
    return notes
