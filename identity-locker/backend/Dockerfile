# backend/Dockerfile
FROM python:3.11-slim

# Install basic tools and node (apt-install NodeJS & npm)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg dirmngr build-essential \
    nodejs npm \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy app source and requirements
COPY ./app /app
COPY requirements.txt /app/requirements.txt

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Install Node deps (package.json present in app/)
WORKDIR /app
RUN if [ -f package.json ]; then npm install; fi

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
