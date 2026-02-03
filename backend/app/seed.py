import random
import json
from faker import Faker
from datetime import datetime
from app.database import SessionLocal, init_db
from app import models

fake = Faker()

KENYA_BBOX = {
    "min_lon": 33.5,
    "max_lon": 41.9,
    "min_lat": -4.7,
    "max_lat": 4.6,
}


def random_point_in_kenya():
    lon = random.uniform(KENYA_BBOX["min_lon"], KENYA_BBOX["max_lon"])
    lat = random.uniform(KENYA_BBOX["min_lat"], KENYA_BBOX["max_lat"])
    return {"type": "Point", "coordinates": [lon, lat]}


def seed(db, units=1000, projects=50, items=200):
    # create locations (simple counties)
    locations = []
    for i in range(1, 11):
        loc = models.Location(name=f"County {i}", region_code=f"C{i}", boundary=json.dumps({"type": "Polygon", "coordinates": []}))
        db.add(loc)
        locations.append(loc)
    db.commit()

    # projects
    project_objs = []
    for i in range(projects):
        p = models.Project(name=fake.company(), status=random.choice(["active", "completed", "planning"]), budget=round(random.uniform(100000, 5000000), 2))
        p.region = random.choice(locations)
        db.add(p)
        project_objs.append(p)
    db.commit()

    # units
    for i in range(units):
        u = models.Unit(
            project=random.choice(project_objs),
            unit_type=random.choice(["Studio", "1BR", "2BR", "3BR", "4BR"]),
            status=random.choice(["occupied", "vacant"]),
            build_year=random.randint(2000, 2025),
            geo_location=json.dumps(random_point_in_kenya()),
            beneficiaries=random.randint(1, 8),
        )
        db.add(u)
    db.commit()

    # inventory
    material_categories = {
        "Cement & Concrete": ["Cement (50kg)", "Concrete mix", "Concrete mixer"],
        "Structural Steel": ["Rebar", "Steel beams", "Steel plates"],
        "Timber & Lumber": ["Timber plank", "Plywood", "Roof trusses"],
        "Finishes": ["Paint", "Tiles", "Doors", "Windows"],
        "Plumbing": ["PVC pipes", "Valves", "Faucets"],
        "Electrical": ["Wiring", "Switches", "Distribution board"],
        "Tools & Equipment": ["Hammer", "Nails", "Drill", "Wheelbarrow"],
        "Vehicles": ["Pickup truck", "Excavator", "Generator"],
    }

    cats = list(material_categories.keys())
    for i in range(items):
        cat = random.choice(cats)
        name = random.choice(material_categories[cat])
        it = models.InventoryItem(
            sku=f"MAT{i+1:05}",
            name=name,
            category=cat,
            quantity=random.randint(0, 500),
            unit_cost=round(random.uniform(10, 10000), 2),
            last_updated=str(datetime.utcnow()),
        )
        it.location = random.choice(locations)
        db.add(it)
    db.commit()


if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    seed(db, units=1000, projects=100, items=300)
    print("Seeding complete")
