from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import os
from dotenv import load_dotenv

from database import get_db
from models import User, Patient

load_dotenv()

router = APIRouter(tags=["auth"])

SECRET_KEY   = os.getenv("SECRET_KEY", "change-this-in-production")
ALGORITHM    = "HS256"
TOKEN_EXPIRY = 60 * 24 * 7   # 7 days in minutes


# ─────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str
    role:     str   # "caregiver" or "patient"

class LoginRequest(BaseModel):
    email:    str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      str
    name:         str
    role:         str
    patient_id:   Optional[str] = None

class UserResponse(BaseModel):
    id:         str
    name:       str
    email:      str
    role:       str
    patient_id: Optional[str] = None


# ─────────────────────────────────────────────────────────
# HELPERS
# Using bcrypt directly (no passlib) — avoids the 72-byte
# passlib bug on Windows. bcrypt itself still has the limit
# but we handle it cleanly with encode+slice below.
# ─────────────────────────────────────────────────────────

def _safe_encode(plain: str) -> bytes:
    """
    bcrypt hard limit = 72 bytes (algorithm, not library).
    Slice BYTES not chars — Hindi/emoji are multi-byte in UTF-8.
    "नमस्ते" = 6 chars but 18 bytes, so [:72] on chars is wrong.
    """
    return plain.encode("utf-8")[:72]

def hash_password(plain: str) -> str:
    hashed = bcrypt.hashpw(_safe_encode(plain), bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_safe_encode(plain), hashed.encode("utf-8"))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub":  str(user_id),
        "role": role,
        "exp":  datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


# ─────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if body.role not in ("caregiver", "patient"):
        raise HTTPException(status_code=400, detail="Role must be 'caregiver' or 'patient'")

    user = User(
        name          = body.name,
        email         = body.email,
        password_hash = hash_password(body.password),
        role          = body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token = create_token(str(user.id), user.role),
        user_id      = str(user.id),
        name         = user.name,
        role         = user.role,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    patient_id = None
    if user.role == "patient":
        patient = db.query(Patient).filter(Patient.user_id == user.id).first()
        if patient:
            patient_id = str(patient.id)

    return TokenResponse(
        access_token = create_token(str(user.id), user.role),
        user_id      = str(user.id),
        name         = user.name,
        role         = user.role,
        patient_id   = patient_id,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user(token: str, db: Session = Depends(get_db)):
    payload = decode_token(token)
    user_id = payload.get("sub")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    patient_id = None
    if user.role == "patient":
        patient = db.query(Patient).filter(Patient.user_id == user.id).first()
        if patient:
            patient_id = str(patient.id)

    return UserResponse(
        id         = str(user.id),
        name       = user.name,
        email      = user.email,
        role       = user.role,
        patient_id = patient_id,
    )
