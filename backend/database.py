from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Like your DATABASE_URL in Next.js / Prisma
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/smriti")

# create_engine = like PrismaClient() — one connection pool for the whole app
engine = create_engine(DATABASE_URL)

# SessionLocal = like a DB transaction factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = all models inherit from this — SQLAlchemy needs it to find your tables
Base = declarative_base()


def get_db():
    """
    FastAPI dependency — like middleware in Express.
    Every route that needs the DB gets a fresh session,
    and it's automatically closed when the request ends.
    
    Usage in a route:
        def my_route(db: Session = Depends(get_db)):
            db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
