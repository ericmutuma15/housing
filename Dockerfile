FROM python:3.11.8-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for some Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies for backend
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy the rest of the repository
COPY . /app

ENV PYTHONUNBUFFERED=1
ENV FRONTEND_ORIGIN=https://ahp-dashboards.vercel.app
ENV PYTHONPATH=/app/backend

EXPOSE 8000

# Use gunicorn with one worker (uvicorn worker)
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "1", "-b", "0.0.0.0:8000", "backend.app.main:app"]
