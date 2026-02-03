# Backend (FastAPI) prototype

Requirements: use the `backend/requirements.txt` to install dependencies.

Run locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m app.seed  # creates sqlite DB with mock data
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

By default the app uses SQLite for quick demo. To use Postgres, set `DATABASE_URL` in env.

Cleanup invalid units:

```bash
python -m app.cleanup
```

