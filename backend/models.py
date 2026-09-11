from sqlalchemy import Column, String, Integer, Float, Boolean, Date, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class User(Base):
    """
    Login accounts — both caregivers AND patients have one.
    Role field determines which UI they see after login.
    """
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name          = Column(String,  nullable=False)
    email         = Column(String,  unique=True, nullable=False)
    password_hash = Column(String,  nullable=False)
    role          = Column(String,  nullable=False)          # "caregiver" | "patient"
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships (like Prisma's @relation)
    patients_managed = relationship("Patient", foreign_keys="Patient.caregiver_id", back_populates="caregiver")
    voice_notes_sent = relationship("VoiceNote", foreign_keys="VoiceNote.caregiver_id", back_populates="caregiver")


class Patient(Base):
    """
    Patient profiles — managed by a caregiver.
    One caregiver → many patients.
    """
    __tablename__ = "patients"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)   # patient's own login, optional
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name         = Column(String,  nullable=False)
    age          = Column(Integer)
    date_of_birth = Column(Date, nullable=True)  # ADD THIS
    language     = Column(String,  default="English")
    difficulty   = Column(Integer, default=1)               # 1=Easy 2=Medium 3=Hard
    # avatar       = Column(String,  default="👴")
    photo_url    = Column(String,  nullable=True)  # ADD THIS — store image URL/path
    location     = Column(String,  nullable=True)  # ADD THIS — "City, State" or place name
    blood_group  = Column(String,  nullable=True)  # ADD THIS
    emergency_contact = Column(String, nullable=True)  # ADD THIS
    emergency_contact_name = Column(String, nullable=True)  # ADD THIS
    medical_info = Column(String, nullable=True)  # ADD THIS — JSON string with diagnosis, meds, allergies, conditions
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    caregiver    = relationship("User", foreign_keys=[caregiver_id], back_populates="patients_managed")
    sessions     = relationship("GameSession", back_populates="patient", cascade="all, delete-orphan")
    voice_notes  = relationship("VoiceNote",   foreign_keys="VoiceNote.patient_id", back_populates="patient")
    reminders    = relationship("Reminder",    back_populates="patient", cascade="all, delete-orphan")


class GameSession(Base):
    __tablename__ = "game_sessions"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id        = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    session_date      = Column(Date, nullable=False)
    accuracy          = Column(Integer)
    avg_response_time = Column(Float)
    score             = Column(Integer)
    attempts          = Column(Integer)
    correct_matches   = Column(Integer, default=0)   # ← NEW
    total_pairs       = Column(Integer, default=4)   # ← NEW
    time_taken        = Column(Float,   default=0)   # ← NEW total seconds
    difficulty        = Column(Integer)
    completed         = Column(Boolean, default=True)

    patient = relationship("Patient", back_populates="sessions")


class VoiceNote(Base):
    """
    Voice messages caregiver records for patient.
    Stored as audio file on disk + metadata here.
    """
    __tablename__ = "voice_notes"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caregiver_id   = Column(UUID(as_uuid=True), ForeignKey("users.id"),   nullable=False)
    patient_id     = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    file_url       = Column(String,  nullable=False)    # URL to audio file
    scheduled_time = Column(String,  nullable=False)    # "14:30" 24hr
    label          = Column(String,  nullable=False)    # human-readable label
    played         = Column(Boolean, default=False)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    caregiver = relationship("User",    foreign_keys=[caregiver_id], back_populates="voice_notes_sent")
    patient   = relationship("Patient", foreign_keys=[patient_id],   back_populates="voice_notes")


class Reminder(Base):
    """
    Daily reminders shown on patient home screen.
    Caregiver sets these from the settings screen.
    """
    __tablename__ = "reminders"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    time       = Column(String,  nullable=False)    # "08:00"
    label      = Column(String,  nullable=False)    # "Morning Medication 💊"
    active     = Column(Boolean, default=True)

    patient = relationship("Patient", back_populates="reminders")
