import os
import sys

# Python 3.13 compatibility patch for Pydantic 1.10.12 (best-effort)
# If running under a Python runtime where ForwardRef signatures changed,
# this attempts a safe fallback. Prefer setting Python 3.11 on the host.
if sys.version_info >= (3, 13):
    try:
        from pydantic.typing import evaluate_forwardref as old_evaluate_forwardref

        def patched_evaluate_forwardref(value, globalns, localns=None):
            try:
                return value._evaluate(globalns, localns, set())
            except TypeError:
                return old_evaluate_forwardref(value, globalns, localns)

        import pydantic.typing

        pydantic.typing.evaluate_forwardref = patched_evaluate_forwardref
    except Exception:
        # If patching fails, we'll let the import error surface later.
        pass

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, crud
from app.database import SessionLocal, init_db
from app.auth import verify_password, create_access_token, get_current_user, get_password_hash
from app.database import engine

init_db()

app = FastAPI(title="Housing Dashboards - Prototype")

# Configure CORS: allow the deployed frontend and local dev addresses.
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "https://ahp-dashboards.vercel.app")
origins = [
    FRONTEND_ORIGIN,
    "https://housing-iem3.onrender.com",
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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, user_in)
    return user


@app.get("/api/kpis")
def kpis(db: Session = Depends(get_db)):
    total_units = db.query(models.Unit).count()
    occupied = db.query(models.Unit).filter(models.Unit.status == "occupied").count()
    return {"total_units": total_units, "occupied": occupied}


@app.get("/api/units/time_series")
def units_time_series(db: Session = Depends(get_db)):
    rows = db.query(models.Unit.build_year, models.Unit.beneficiaries).all()
    # aggregate by year
    agg = {}
    for year, ben in rows:
        if year not in agg:
            agg[year] = {"benefitted": 0, "units": 0}
        agg[year]["benefitted"] += ben or 0
        agg[year]["units"] += 1
    result = [{"year": y, **agg[y]} for y in sorted(agg.keys() if agg.keys() else [])]
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


if __name__ == "__main__":
    # When running directly (local dev), bind to PORT env or 8000.
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, log_level="info")
