# backend/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# OS deps (good to have build tools even for SQLite projects)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps
# Make sure backend/requirements.txt exists and is committed
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy app code
COPY manage.py /app/manage.py
COPY backend /app
COPY core /app/core

# Expose Django port
EXPOSE 8000

# Default command; compose will override to run migrations then gunicorn
CMD ["gunicorn","backend.wsgi:application","--bind","0.0.0.0:8000","--workers","3"]
