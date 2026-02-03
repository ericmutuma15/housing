import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./housing.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    import app.models as models  # noqa: F401
    # For local development with SQLite, optionally remove existing DB to recreate schema when models change.
    # Set environment variable RESET_DB=1 to enable destructive reset. By default this is non-destructive.
    if DATABASE_URL.startswith("sqlite") and os.getenv("RESET_DB") == "1":
        # derive file path from URL (supports sqlite:///relative/path or sqlite:////absolute/path)
        db_path = None
        if DATABASE_URL.startswith("sqlite:///"):
            db_path = DATABASE_URL[len("sqlite:///"):]
        elif DATABASE_URL.startswith("sqlite://"):
            db_path = DATABASE_URL[len("sqlite://"):]
        if db_path and os.path.exists(db_path):
            try:
                os.remove(db_path)
                print(f"Removed existing SQLite DB at {db_path} to recreate schema")
            except Exception as e:
                print(f"Could not remove existing DB file {db_path}: {e}")
    Base.metadata.create_all(bind=engine)
