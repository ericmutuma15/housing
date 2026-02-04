import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Database URL handling
# -------------------------------------------------------------------

# Prefer explicit DATABASE_URL environment variable (production).
DATABASE_URL = os.getenv("DATABASE_URL")

# Local development fallback ONLY
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./housing.db"
    logger.warning("DATABASE_URL not set — falling back to SQLite for local development")

# -------------------------------------------------------------------
# Enforce psycopg v3 dialect token for PostgreSQL (psycopg v3)
# -------------------------------------------------------------------
# If user has an URL like "postgresql://", replace with SQLAlchemy dialect
# that explicitly uses psycopg (psycopg v3). This ensures SQLAlchemy picks
# the psycopg driver (psycopg) rather than expecting psycopg2.
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    logger.info("Normalized DATABASE_URL to use psycopg driver for SQLAlchemy")

# -------------------------------------------------------------------
# Engine configuration
# -------------------------------------------------------------------
engine_kwargs = {}

if DATABASE_URL.startswith("sqlite"):
    # sqlite needs check_same_thread False for local dev
    engine_kwargs["connect_args"] = {"check_same_thread": False}

# Use pool_pre_ping to avoid stale connections (helpful on cloud DBs)
engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True, **engine_kwargs)

# Log which dialect/driver SQLAlchemy ended up initializing
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
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()

# -------------------------------------------------------------------
# DB initialization helper (safe)
# -------------------------------------------------------------------
def init_db():
    """
    Create tables **only for local SQLite** when explicitly allowed.

    Behavior:
      - If using SQLite (DATABASE_URL starts with "sqlite"), this will create tables.
      - If RESET_DB=1 is set and using SQLite, the existing sqlite file will be removed
        (destructive) before creating a fresh database.
      - If using Postgres/Supabase, this function will NOT auto-create tables to avoid
        accidental schema operations and network/authentication attempts at import time.

    To enable auto-init for local dev set:
        AUTO_INIT_DB=1  (in addition to using sqlite)

    To force a destructive reset of local sqlite:
        RESET_DB=1
    """
    # Import models so they register themselves on Base for metadata
    import app.models  # noqa: F401

    if DATABASE_URL.startswith("sqlite"):
        # Optional destructive reset for SQLite (local dev only)
        if os.getenv("RESET_DB") == "1":
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

        # Require AUTO_INIT_DB=1 to create automatically (avoid surprises)
        if os.getenv("AUTO_INIT_DB", "0") != "1" and os.getenv("RESET_DB") != "1":
            logger.info(
                "Skipping automatic SQLite schema creation — set AUTO_INIT_DB=1 to enable."
            )
            return

        # Finally create tables for SQLite
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("SQLite schema created (or already exists).")
        except Exception:
            logger.exception("Failed to create SQLite schema")
    else:
        # Explicitly do not auto-create schema on Postgres/Supabase
        logger.info(
            "Not creating schema automatically for non-sqlite DATABASE_URL — handle migrations separately."
        )
