FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  netcat-openbsd \
  libpq-dev \
  gcc \
  build-essential && \
  rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY data-ingestion.py .

COPY entrypoint.sh .