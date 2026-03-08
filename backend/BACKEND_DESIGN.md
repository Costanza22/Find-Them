# FindThem Backend API – Design

## Overview

Python **FastAPI** backend that:
- Registers missing persons (metadata + photo)
- Accepts sighting image uploads
- Processes images, extracts **facial embeddings** (128-D)
- Stores embeddings in a **vector store** and relational data in a DB
- Compares sighting embeddings against missing-person embeddings and returns **similarity scores**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Missing persons** | | |
| `POST` | `/api/missing-persons` | Register a missing person (multipart: photo + JSON metadata) |
| `GET` | `/api/missing-persons` | List missing persons (optional `limit`, `offset`) |
| `GET` | `/api/missing-persons/{id}` | Get one missing person |
| **Sightings** | | |
| `POST` | `/api/sightings` | Upload a sighting (multipart: image + optional notes, location) |
| `GET` | `/api/sightings` | List sightings (optional `limit`, `offset`) |
| `GET` | `/api/sightings/{id}` | Get one sighting |
| **Matches** | | |
| `GET` | `/api/matches` | List possible matches (sighting vs missing persons) with similarity scores |
| `GET` | `/api/matches?sighting_id={id}` | Matches for a specific sighting |
| `GET` | `/api/matches?missing_person_id={id}` | Matches for a specific missing person |
| **Health** | | |
| `GET` | `/health` | Health check |

### Request/Response Examples

**POST /api/missing-persons** (multipart/form-data)
- `photo`: image file (required)
- `name`: string (required)
- `description`: string (optional)
- `date_missing`: date (optional)
- `last_seen`: string (optional)
- `contact_info`: string (optional)

Response: `201` + `{ "id": "uuid", "name": "...", "photo_url": "/uploads/...", ... }`

**POST /api/sightings** (multipart/form-data)
- `image`: image file (required)
- `notes`: string (optional)
- `location`: string (optional)

Response: `201` + `{ "id": "uuid", "image_url": "...", "matches": [ { "missing_person_id": "...", "similarity_score": 0.87 }, ... ] }`  
(Backend computes matches on upload and returns them in the response.)

**GET /api/matches**
- Query: `sighting_id`, `missing_person_id`, `min_score`, `limit`
- Response: `{ "matches": [ { "id", "missing_person", "sighting", "similarity_score" }, ... ] }`
- `similarity_score` is in **0.0–1.0**; frontend can display as 0–100 by multiplying by 100.

---

## Database Schema

### Relational (PostgreSQL / SQLite)

**missing_persons**
| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| date_missing | DATE | |
| last_seen | VARCHAR(500) | |
| contact_info | VARCHAR(500) | |
| photo_path | VARCHAR(1024) | path on disk or object key |
| created_at | TIMESTAMP | |

**sightings**
| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| image_path | VARCHAR(1024) | |
| notes | TEXT | |
| location | VARCHAR(500) | |
| created_at | TIMESTAMP | |

**matches**
| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| missing_person_id | UUID FK → missing_persons | |
| sighting_id | UUID FK → sightings | |
| similarity_score | FLOAT | 0.0–1.0 (or 0–100) |
| created_at | TIMESTAMP | |
| UNIQUE(missing_person_id, sighting_id) | | |

### Vector store (embeddings)

Each **face** is represented by a **128-dimensional** vector (e.g. dlib/face_recognition).

**Option A – pgvector (PostgreSQL)**  
- Table `face_embeddings`: `id`, `entity_type` ('missing_person' | 'sighting'), `entity_id` (UUID), `embedding` vector(128).  
- Index: HNSW or IVFFlat on `embedding` for fast similarity search.

**Option B – Chroma / Qdrant / FAISS**  
- Collection per entity type or one collection with metadata filter.  
- Store `entity_id` and optional metadata; query by embedding, return entity IDs and distances.

Similarity: **cosine similarity** or **1 / (1 + euclidean_distance)** mapped to 0–1 (or 0–100).  
Only include in “matches” if score above a threshold (e.g. ≥ 0.6).

---

## Processing Pipeline

1. **Register missing person**  
   - Save photo to disk (or object storage).  
   - Detect face(s) in photo → extract 128-D embedding(s).  
   - Store metadata in DB; store embedding(s) in vector DB linked to `missing_person_id`.

2. **Upload sighting**  
   - Save image.  
   - Detect face(s) → extract embedding(s).  
   - For each sighting embedding, query vector DB for nearest missing-person embeddings (e.g. top K, score ≥ threshold).  
   - Insert rows in `matches` (missing_person_id, sighting_id, similarity_score).  
   - Return sighting + matches in response.

3. **Get matches**  
   - Read from `matches` (and optionally re-query vector DB if you need live similarity).  
   - Filter by `sighting_id` and/or `missing_person_id`, `min_score`.  
   - Return list with missing person + sighting info and similarity_score.

---

## Example Code Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, router includes
│   ├── config.py            # Settings (DB URL, upload dir, embedding dim)
│   ├── database.py          # SQLAlchemy engine, session, Base
│   ├── models/              # SQLAlchemy ORM
│   │   ├── __init__.py
│   │   ├── missing_person.py
│   │   ├── sighting.py
│   │   └── match.py
│   ├── schemas/             # Pydantic request/response
│   │   ├── __init__.py
│   │   ├── missing_person.py
│   │   ├── sighting.py
│   │   └── match.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── missing_persons.py
│   │   ├── sightings.py
│   │   └── matches.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── face_embedding.py   # Extract 128-D from image
│   │   ├── vector_store.py    # Add/query embeddings (abstract interface)
│   │   └── matching.py        # Compare sighting vs missing persons
│   └── storage/
│       ├── __init__.py
│       └── local.py           # Save files to disk, return path/URL
├── uploads/                  # Photo/image storage (gitignore)
├── requirements.txt
├── .env.example
└── BACKEND_DESIGN.md
```

---

## Tech Stack

- **API**: FastAPI
- **ORM**: SQLAlchemy 2.x
- **DB**: SQLite (dev) / PostgreSQL (prod)
- **Vector**: In-memory (NumPy) or pgvector / Chroma (see `vector_store.py`)
- **Face embeddings**: `face_recognition` (dlib 128-D) or replace with InsightFace/DeepFace in `face_embedding.py`

---

## Security & Deployment Notes

- Validate file types (e.g. image only) and size limits on upload.
- Store files outside web root; serve via FastAPI static or a separate CDN.
- Use env vars for `DATABASE_URL`, `UPLOAD_DIR`, `EMBEDDING_DIM`.
- Optional: auth (e.g. API key or JWT) for POST endpoints.
