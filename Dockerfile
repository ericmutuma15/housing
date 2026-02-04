FROM python:3.13.4-slim

# Set working directory
WORKDIR /

# Ensure python output is unbuffered (helpful for logs)
ENV PYTHONUNBUFFERED=1
ENV FRONTEND_ORIGIN=https://ahp-dashboards.vercel.app
ENV PYTHONPATH=/app/backend

# Install system dependencies needed for some Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies for backend
COPY backend/requirements.txt /app/backend/requirements.txt

# Upgrade pip/setuptools/wheel first (reduces build issues), then install requirements
RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy the rest of the repository
COPY . /app

EXPOSE 8000

# Use gunicorn with one worker (uvicorn worker)
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "1", "-b", "0.0.0.0:8000", "app.main:app"]
