from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app import schemas
from app.auth import get_password_hash


def create_user(db: Session, user_in: schemas.UserCreate):
    hashed = get_password_hash(user_in.password)
    user = models.User(name=user_in.name, email=user_in.email, role=user_in.role, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_units(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Unit).offset(skip).limit(limit).all()


def units_time_series(db: Session):
    # simple aggregation by build_year and sum beneficiaries
    rows = db.query(models.Unit.build_year, func.sum(models.Unit.beneficiaries).label('benefitted'), func.count(models.Unit.id).label('units')).group_by(models.Unit.build_year).order_by(models.Unit.build_year).all()
    return rows


def get_unit(db: Session, unit_id: int):
    return db.query(models.Unit).filter(models.Unit.id == unit_id).first()


def list_inventory(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.InventoryItem).offset(skip).limit(limit).all()


def create_inventory(db: Session, item_in: schemas.InventoryItemIn):
    item = models.InventoryItem(**item_in.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_inventory(db: Session, item_id: int, data: dict):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not item:
        return None
    for k, v in data.items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


def delete_inventory(db: Session, item_id: int):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
