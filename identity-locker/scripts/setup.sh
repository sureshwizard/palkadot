#!/bin/bash
# Setup script for local development (non-docker)
echo "Installing backend deps..."
python3 -m venv .venv || true
source .venv/bin/activate
pip install -r backend/requirements.txt
echo "Installing frontend deps..."
cd frontend
npm install
echo "Done. Run backend: .venv/bin/uvicorn backend.app.main:app --reload --port 8000"
echo "Run frontend: cd frontend && npm start"
