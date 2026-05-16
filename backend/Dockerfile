FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Command is handled by docker-compose for dev, but this is the production default
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
