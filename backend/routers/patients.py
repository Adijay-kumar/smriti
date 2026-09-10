from fastapi import APIRouter, Depends, HTTPException, Header
from jose import jwt, JWTError
import os
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from pydantic import BaseModel, field_validator

from database import get_db
from models import Patient

router = APIRouter(tags=["patients"])


class PatientCreate(BaseModel):
    caregiver_id: str
    name:         str
    age:          int
    language:     str = "English"
    difficulty:   int = 1
    avatar:       str = "👴"

class PatientUpdate(BaseModel):
    name:       Optional[str] = None
    age:        Optional[int] = None
    language:   Optional[str] = None
    difficulty: Optional[int] = None
    avatar:     Optional[str] = None



class PatientResponse(BaseModel):
    id:           str
    caregiver_id: str
    name:         str
    age:          int
    language:     str
    difficulty:   int
    avatar:       str

    @field_validator('id', 'caregiver_id', mode='before')
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
    patient = Patient(**body.model_dump())
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
