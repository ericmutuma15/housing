from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)


class UnitOut(BaseModel):
    id: int
    unit_type: Optional[str] = None
    status: Optional[str] = None
    build_year: Optional[int] = None
    geo_location: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)


class InventoryItemIn(BaseModel):
    sku: str
    name: str
    category: str
    quantity: int
    unit_cost: float


class InventoryItemOut(InventoryItemIn):
    id: int

    model_config = ConfigDict(from_attributes=True)
