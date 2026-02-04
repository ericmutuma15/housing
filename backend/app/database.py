import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Database URL handling
# -------------------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

# Local development fallback ONLY
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./housing.db"
    logger.warning("DATABASE_URL not set — falling back to SQLite for local development")

# -------------------------------------------------------------------
# Enforce psycopg v3 for PostgreSQL
# -------------------------------------------------------------------

if DATABASE_URL.startswith("postgresql://"):
    # Force psycopg v3 explicitly
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1,
    )

# -------------------------------------------------------------------
# Engine configuration
# -------------------------------------------------------------------

engine_kwargs = {}

if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    **engine_kwargs,
)

# Log which driver SQLAlchemy actually picked
try:
    logger.info(
        "SQLAlchemy engine initialized | dialect=%s | driver=%s",
        engine.dialect.name,
        engine.dialect.driver,
    )
except Exception:
    logger.exception("Could not determine SQLAlchemy dialect/driver")

# -------------------------------------------------------------------
# Session / Base
# -------------------------------------------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

# -------------------------------------------------------------------
# DB initialization
# -------------------------------------------------------------------

def init_db():
    import app.models  # noqa: F401

    # Optional destructive reset for SQLite (local dev only)
    if DATABASE_URL.startswith("sqlite") and os.getenv("RESET_DB") == "1":
        db_path = None
        if DATABASE_URL.startswith("sqlite:///"):
            db_path = DATABASE_URL[len("sqlite:///") :]
        elif DATABASE_URL.startswith("sqlite://"):
            db_path = DATABASE_URL[len("sqlite://") :]

        if db_path and os.path.exists(db_path):
            try:
                os.remove(db_path)
                logger.warning("Removed existing SQLite DB at %s", db_path)
            except Exception as e:
                logger.error("Failed to remove SQLite DB %s: %s", db_path, e)

    Base.metadata.create_all(bind=engine)
