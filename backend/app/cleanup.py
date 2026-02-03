"""Cleanup script to remove units with geo coordinates outside Kenya bounding box."""
import json
from app.database import SessionLocal, init_db
from app import models

KENYA = {"min_lon": 33.5, "max_lon": 41.9, "min_lat": -4.7, "max_lat": 4.6}


def is_point_inside(geo_json_str: str) -> bool:
    try:
        geo = json.loads(geo_json_str)
        if geo.get("type") != "Point":
            return False
        lon, lat = geo.get("coordinates", [None, None])
        if lon is None or lat is None:
            return False
        return KENYA["min_lon"] <= lon <= KENYA["max_lon"] and KENYA["min_lat"] <= lat <= KENYA["max_lat"]
    except Exception:
        return False


def cleanup():
    db = SessionLocal()
    try:
        units = db.query(models.Unit).all()
        removed = 0
        for u in units:
            if not u.geo_location or not is_point_inside(u.geo_location):
                db.delete(u)
                removed += 1
        db.commit()
        print(f"Removed {removed} units with out-of-range or invalid geo_location")
    finally:
        db.close()


if __name__ == "__main__":
    cleanup()
