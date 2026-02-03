from pydantic import BaseModel
from typing import Optional, List, Any


class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "viewer"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        orm_mode = True


class UnitOut(BaseModel):
    id: int
    unit_type: Optional[str]
    status: Optional[str]
    build_year: Optional[int]
    geo_location: Optional[Any]

    class Config:
        orm_mode = True


class InventoryItemIn(BaseModel):
    sku: str
    name: str
    category: str
    quantity: int
    unit_cost: float


class InventoryItemOut(InventoryItemIn):
    id: int

    class Config:
        orm_mode = True
