import os
import sys
from typing import List

# 3.13 compatibility best-effort patch for Pydantic forwardref differences
if sys.version_info >= (3, 13):
    try:
        from pydantic.typing import evaluate_forwardref as old_evaluate_forwardref

        def patched_evaluate_forwardref(value, globalns, localns=None):
            try:
                # Try the newer direct private API (may differ on 3.13)
                return value._evaluate(globalns, localns, set())
            except TypeError:
                # Fallback to original function
                return old_evaluate_forwardref(value, globalns, localns)

        import pydantic.typing  # type: ignore

        pydantic.typing.evaluate_forwardref = patched_evaluate_forwardref
    except Exception:
        # Non-fatal: if patch can't be applied, continue and let imports raise normally if incompatible
        pass

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from app import models, schemas, crud
from app.database import SessionLocal, init_db, DATABASE_URL  # database.py exports these
from app.auth import verify_password, create_access_token, get_current_user

# ---------------------------
# FastAPI app + CORS config
# ---------------------------
app = FastAPI(title="Housing Dashboards - Prototype")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "https://ahp-dashboards.vercel.app")
origins = [
    FRONTEND_ORIGIN,
    "https://ahp-dashboards.vercel.app",
    "https://housing-1-yxt5.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Global exception handler (ensures CORS header on internal errors)
# ---------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Return a sanitized 500 with CORS headers so the browser won't treat internal errors
    as CORS failures when the server crashed early.
    """
    # Log the exception server-side as needed
    # (avoid leaking internal details to client)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
            "Access-Control-Allow-Credentials": "true",
        },
    )


# ---------------------------
# DB dependency (safe)
# ---------------------------
def get_db():
    """
    Provide a DB session for endpoints. If engine/session creation fails, raise HTTP 503.
    """
    try:
        db = SessionLocal()
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass


# ---------------------------
# AUTH + API endpoints
# ---------------------------
@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(models.User).filter(models.User.email == form_data.username).first()
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, user_in)
    return user


@app.get("/api/kpis")
def kpis(db: Session = Depends(get_db)):
    try:
        total_units = db.query(models.Unit).count()
        occupied = db.query(models.Unit).filter(models.Unit.status == "occupied").count()
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return {"total_units": total_units, "occupied": occupied}


@app.get("/api/units/time_series")
def units_time_series(db: Session = Depends(get_db)):
    try:
        rows = db.query(models.Unit.build_year, models.Unit.beneficiaries).all()
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    # aggregate by year
    agg = {}
    for year, ben in rows:
        if year not in agg:
            agg[year] = {"benefitted": 0, "units": 0}
        agg[year]["benefitted"] += ben or 0
        agg[year]["units"] += 1
    result = [{"year": y, **agg[y]} for y in sorted(agg.keys())]
    return result


@app.get("/api/units", response_model=List[schemas.UnitOut])
def get_units(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_units(db, skip=skip, limit=limit)


@app.get("/api/units/{unit_id}")
def get_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = crud.get_unit(db, unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit


@app.get("/api/inventory", response_model=List[schemas.InventoryItemOut])
def list_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_inventory(db, skip=skip, limit=limit)


@app.post("/api/inventory", response_model=schemas.InventoryItemOut)
def create_inventory(item_in: schemas.InventoryItemIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # only inventory manager or admin allowed - simple check
    if user.role not in ("inventory_manager", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    return crud.create_inventory(db, item_in)


@app.put("/api/inventory/{item_id}")
def update_inventory(item_id: int, item_in: schemas.InventoryItemIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role not in ("inventory_manager", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    updated = crud.update_inventory(db, item_id, item_in.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated


@app.delete("/api/inventory/{item_id}")
def delete_inventory(item_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role not in ("inventory_manager", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    ok = crud.delete_inventory(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": True}


# ---------------------------
# Local-development main
# ---------------------------
if __name__ == "__main__":
    # Initialize DB only for local dev / sqlite if AUTO_INIT_DB=1 or RESET_DB=1
    init_db()
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, log_level="info")
