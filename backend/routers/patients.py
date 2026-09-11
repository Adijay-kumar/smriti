from fastapi import APIRouter, Depends, HTTPException, Header
from jose import jwt, JWTError
import os
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional
from database import get_db
from models import Patient, User
from routers.auth import hash_password

router = APIRouter(tags=["patients"])


class PatientCreate(BaseModel):
    caregiver_id: str
    name: str
    age: int

    email: str
    password: str

    date_of_birth: Optional[date] = None
    language: str = "English"
    difficulty: int = 1
    photo_url: Optional[str] = None
    location: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    medical_info: Optional[str] = None

class PatientUpdate(BaseModel):
    name:       Optional[str] = None
    age:        Optional[int] = None
    language:   Optional[str] = None
    difficulty: Optional[int] = None
    #avatar:     Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    medical_info: Optional[str] = None



class PatientResponse(BaseModel):
    id: str
    caregiver_id: str
    name: str
    age: int
    date_of_birth: Optional[date] = None
    language: str
    difficulty: int
    photo_url: Optional[str] = None
    location: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    medical_info: Optional[str] = None

    @field_validator("id", "caregiver_id", mode="before")
    @classmethod
    def convert_uuid_to_str(cls, v):
        return str(v) if v else v

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PatientResponse])
def get_patients(caregiver_id: str, db: Session = Depends(get_db)):
    return db.query(Patient).filter(Patient.caregiver_id == caregiver_id).all()

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """GET /patients/{id}"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/", response_model=PatientResponse, status_code=201)
def create_patient(body: PatientCreate, db: Session = Depends(get_db)):

    # Check whether email is already used
    existing_user = db.query(User).filter(User.email == body.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create login account
    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        role="patient"
    )

    db.add(user)
    db.flush()  # gives us user.id before committing

    # Create patient profile and link it to the user
    patient_data = body.model_dump(
        exclude={"email", "password"}
    )

    patient = Patient(
        **patient_data,
        user_id=user.id
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient

@router.patch("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: str, body: PatientUpdate, db: Session = Depends(get_db)):
    """
    PATCH /patients/{id}
    Partial update — only fields sent are changed.
    The caregiver uses this to override difficulty.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Only update fields that were actually sent
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient
