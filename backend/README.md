# FindThem Backend

FastAPI backend for missing person registration, sighting uploads, and face-similarity matching.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Optional: install `face_recognition` (requires dlib). Without it, the app uses a stub embedding so the API runs but matches are dummy.

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

## Env

Copy `.env.example` to `.env` and set `DATABASE_URL`, `UPLOAD_DIR`, etc. Defaults work with SQLite and `./uploads`.

## Design

See [BACKEND_DESIGN.md](BACKEND_DESIGN.md) for API endpoints, database schema, and pipeline (embeddings, vector store, matching).
