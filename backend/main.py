# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from database import Base, engine
# from routers import auth, patients, sessions, voice
# import os

# # Create all DB tables on startup
# # Like running `prisma db push` or `prisma migrate dev`
# # Safe to run multiple times — only creates tables that don't exist yet
# Base.metadata.create_all(bind=engine)

# # Create uploads folder if it doesn't exist
# os.makedirs("uploads/voice", exist_ok=True)

# app = FastAPI(
#     title       = "Smriti API",
#     description = "Backend for Smriti dementia care app",
#     version     = "1.0.0",
#     # /docs gives you interactive Swagger UI — like Postman built in
#     # /redoc gives you clean reference docs
# )

# # CORS — allows your React Native app to call this API
# # In production: replace "*" with your actual app domain
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins     = ["*"],
#     allow_credentials = True,
#     allow_methods     = ["*"],
#     allow_headers     = ["*"],
# )

# # Register routers — like app.use('/auth', authRouter) in Express
# app.include_router(auth.router,     prefix="/auth")
# app.include_router(patients.router, prefix="/patients")
# app.include_router(sessions.router, prefix="/sessions")
# app.include_router(voice.router,    prefix="/voice-notes")

# @app.get("/")
# def root():
#     return {
#         "status":  "Smriti API is running",
#         "docs":    "/docs",
#         "version": "1.0.0",
#     }

# # ─────────────────────────────────────────────────────────
# # HOW TO RUN:
# #   cd backend
# #   source venv/bin/activate
# #   uvicorn main:app --reload --port 8000
# #
# # Then open: http://localhost:8000/docs
# # You get a full interactive API tester — no Postman needed
# # ─────────────────────────────────────────────────────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import Base, engine
from routers import auth, patients, sessions, voice
import os

# Create all DB tables on startup
# Like running `prisma db push` or `prisma migrate dev`
# Safe to run multiple times — only creates tables that don't exist yet
Base.metadata.create_all(bind=engine)

# Create uploads folder if it doesn't exist
os.makedirs("uploads/voice", exist_ok=True)

app = FastAPI(
    title       = "Smriti API",
    description = "Backend for Smriti dementia care app",
    version     = "1.0.0",
    # /docs gives you interactive Swagger UI — like Postman built in
    # /redoc gives you clean reference docs
)

# CORS — allows your React Native app to call this API
# In production: replace "*" with your actual app domain
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# Register routers — like app.use('/auth', authRouter) in Express
app.include_router(auth.router,     prefix="/auth")
app.include_router(patients.router, prefix="/patients")
app.include_router(sessions.router, prefix="/sessions")
app.include_router(voice.router,    prefix="/voice-notes")

@app.get("/")
def root():
    return {
        "status":  "Smriti API is running",
        "docs":    "/docs",
        "version": "1.0.0",
    }

# ─────────────────────────────────────────────────────────
# HOW TO RUN:
#   cd backend
#   source venv/bin/activate
#   uvicorn main:app --reload --port 8000
#
# Then open: http://localhost:8000/docs
# You get a full interactive API tester — no Postman needed
# ─────────────────────────────────────────────────────────
