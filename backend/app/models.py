from sqlalchemy import Column, Integer, String, Date, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="viewer")
    hashed_password = Column(String, nullable=False)


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String)
    budget = Column(Float)
    region_id = Column(Integer, ForeignKey("locations.id"))
    region = relationship("Location")


class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    region_code = Column(String)
    boundary = Column(Text)  # GeoJSON WKT or GeoJSON string


class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    unit_type = Column(String)
    status = Column(String, index=True)
    build_year = Column(Integer)
    geo_location = Column(Text)  # store GeoJSON point
    beneficiaries = Column(Integer, default=1)
    project = relationship("Project")


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, index=True)
    name = Column(String)
    category = Column(String, index=True)
    quantity = Column(Integer, default=0)
    unit_cost = Column(Float, default=0.0)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    last_updated = Column(String)
    location = relationship("Location")
