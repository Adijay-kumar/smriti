from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, field_validator
from datetime import date, datetime, timedelta
from typing import List, Optional
import uuid

from database import get_db
from models import GameSession, Patient

router = APIRouter(tags=["sessions"])


# ─────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    patient_id: str
    accuracy: int
    avg_response_time: float
    score: int
    attempts: int
    correct_matches: int
    total_pairs: int
    time_taken: float
    difficulty: int
    completed: bool

class SessionResponse(BaseModel):
    id:                 str
    patient_id:         str
    session_date:       date
    accuracy:           int
    avg_response_time:  float
    score:              int
    attempts:           int
    correct_matches:    int
    total_pairs:        int
    time_taken:         float
    difficulty:         int
    completed:          bool

    @field_validator("id", "patient_id", mode="before")
    @classmethod
    def convert_uuid_to_str(cls, v):
        return str(v) if v else v

    class Config:
        from_attributes = True

class AdaptationResult(BaseModel):
    """Returned after saving a session — tells app if difficulty should change"""
    recommendation:  str    # "increase" | "decrease" | "maintain"
    reason:          str
    new_difficulty:  int

class SessionSaveResponse(BaseModel):
    session:    SessionResponse
    adaptation: AdaptationResult


class StatsResponse(BaseModel):
    """Aggregated stats for caregiver dashboard"""
    avg_accuracy:      float
    avg_response_time: float
    completion_rate:   float
    total_sessions:    int
    total_score:       int
    trend:             float   # positive = improving, negative = declining


# ─────────────────────────────────────────────────────────
# ADAPTIVE ENGINE
# Same logic as your utils/adaptive.ts but in Python.
# Keeping it in the backend means the rules are consistent
# no matter which device the patient uses.
# ─────────────────────────────────────────────────────────

def evaluate_performance(
    sessions: List[GameSession],
    current_difficulty: int
) -> AdaptationResult:
    """
    Rule-based adaptive engine.
    Takes last 3 sessions and decides: harder / easier / same.
    """
    if len(sessions) < 2:
        return AdaptationResult(
            recommendation = "maintain",
            reason         = "Not enough sessions yet — keep going!",
            new_difficulty = current_difficulty
        )

    recent      = sessions[:3]   # look at last 3 only
    avg_acc     = sum(s.accuracy for s in recent) / len(recent)
    avg_time    = sum(s.avg_response_time for s in recent) / len(recent)
    comp_rate   = sum(1 for s in recent if s.completed) / len(recent)

    # Rule 1: Doing great → increase difficulty
    if avg_acc >= 85 and avg_time <= 4.0 and comp_rate >= 0.8:
        new_diff = min(3, current_difficulty + 1)
        return AdaptationResult(
            recommendation = "increase",
            reason         = f"Accuracy {avg_acc:.0f}%, avg {avg_time:.1f}s — excellent work!",
            new_difficulty = new_diff
        )

    # Rule 2: Struggling → decrease difficulty
    if avg_acc < 50 or avg_time > 8.0 or comp_rate < 0.5:
        new_diff = max(1, current_difficulty - 1)
        return AdaptationResult(
            recommendation = "decrease",
            reason         = f"Accuracy {avg_acc:.0f}%, avg {avg_time:.1f}s — let's try an easier level",
            new_difficulty = new_diff
        )

    # Rule 3: Steady — keep current difficulty
    return AdaptationResult(
        recommendation = "maintain",
        reason         = f"Accuracy {avg_acc:.0f}% — steady progress, keep it up!",
        new_difficulty = current_difficulty
    )


def calculate_stats(sessions: List[GameSession]) -> Optional[StatsResponse]:
    if not sessions:
        return None

    n            = len(sessions)
    avg_accuracy = sum(s.accuracy for s in sessions) / n
    avg_rt       = sum(s.avg_response_time for s in sessions) / n
    comp_rate    = sum(1 for s in sessions if s.completed) / n * 100
    total_score  = sum(s.score for s in sessions)

    # Trend: compare first half vs second half accuracy
    # positive = improving over time
    if n >= 4:
        half     = n // 2
        newer    = sum(s.accuracy for s in sessions[:half]) / half
        older    = sum(s.accuracy for s in sessions[half:]) / (n - half)
        trend    = newer - older
    else:
        trend = 0.0

    return StatsResponse(
        avg_accuracy      = round(avg_accuracy, 1),
        avg_response_time = round(avg_rt, 1),
        completion_rate   = round(comp_rate, 1),
        total_sessions    = n,
        total_score       = total_score,
        trend             = round(trend, 1),
    )


# ─────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────

# @router.post("/", response_model=SessionSaveResponse, status_code=201)
# def save_session(body: SessionCreate, db: Session = Depends(get_db)):
#     """
#     POST /sessions/
#     Called by the app when a game ends.
#     Saves result + runs adaptive engine + updates patient difficulty.
    
#     This replaces your utils/storage.ts saveSession() + applyAdaptation().
#     """

#     # 1. Verify patient exists
#     patient = db.query(Patient).filter(Patient.id == body.patient_id).first()
#     if not patient:
#         raise HTTPException(status_code=404, detail="Patient not found")

#     # 2. Save the session
#     session = GameSession(
#         patient_id        = body.patient_id,
#         session_date      = date.today(),
#         accuracy          = body.accuracy,
#         avg_response_time = body.avg_response_time,
#         score             = body.score,
#         attempts          = body.attempts,
#         difficulty        = body.difficulty,
#         completed         = body.completed,
#     )
#     db.add(session)
#     db.commit()
#     db.refresh(session)

#     # 3. Run adaptive engine on last 3 sessions
#     recent_sessions = (
#         db.query(GameSession)
#         .filter(GameSession.patient_id == body.patient_id)
#         .order_by(desc(GameSession.session_date))
#         .limit(3)
#         .all()
#     )
#     adaptation = evaluate_performance(recent_sessions, patient.difficulty)

#     # 4. Update patient difficulty if recommendation changed
#     if adaptation.new_difficulty != patient.difficulty:
#         patient.difficulty = adaptation.new_difficulty
#         db.commit()

#     return SessionSaveResponse(
#         session    = session,
#         adaptation = adaptation,
#     )

@router.post("/", response_model=SessionSaveResponse, status_code=201)
def save_session(body: SessionCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == body.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    session = GameSession(
        patient_id        = body.patient_id,
        session_date      = date.today(),
        accuracy          = body.accuracy,
        avg_response_time = body.avg_response_time,
        score             = body.score,
        attempts          = body.attempts,
        correct_matches   = body.correct_matches,   # ← NEW
        total_pairs       = body.total_pairs,       # ← NEW
        time_taken        = body.time_taken,        # ← NEW
        difficulty        = body.difficulty,
        completed         = body.completed,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    recent_sessions = (
        db.query(GameSession)
        .filter(GameSession.patient_id == body.patient_id)
        .order_by(desc(GameSession.session_date))
        .limit(3)
        .all()
    )
    adaptation = evaluate_performance(recent_sessions, patient.difficulty)

    if adaptation.new_difficulty != patient.difficulty:
        patient.difficulty = adaptation.new_difficulty
        db.commit()

    return SessionSaveResponse(session=session, adaptation=adaptation)

@router.get("/patient/{patient_id}", response_model=List[SessionResponse])
def get_sessions(
    patient_id: str,
    days: int = 7,                  # default: last 7 days
    db: Session = Depends(get_db)
):
    """
    GET /sessions/patient/{patient_id}?days=7
    
    Returns recent sessions for a patient.
    The caregiver dashboard and analysis screen use this.
    """
    cutoff = datetime.utcnow().date() - timedelta(days=days)

    sessions = (
        db.query(GameSession)
        .filter(
            GameSession.patient_id  == patient_id,
            GameSession.session_date >= cutoff
        )
        .order_by(desc(GameSession.session_date))
        .all()
    )
    return sessions


@router.get("/patient/{patient_id}/stats", response_model=Optional[StatsResponse])
def get_stats(
    patient_id: str,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    GET /sessions/patient/{patient_id}/stats?days=7
    
    Returns aggregated stats for the caregiver dashboard cards
    (avg accuracy, completion rate, trend, etc.)
    """
    cutoff = datetime.utcnow().date() - timedelta(days=days)

    sessions = (
        db.query(GameSession)
        .filter(
            GameSession.patient_id  == patient_id,
            GameSession.session_date >= cutoff
        )
        .order_by(desc(GameSession.session_date))
        .all()
    )
    return calculate_stats(sessions)
