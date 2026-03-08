# FindThem — System Architecture

**AI-powered missing persons identification using facial recognition and computer vision.**

This document describes a **production-oriented** architecture: face detection, embedding generation, vector similarity search, backend design, data model, repository layout, development roadmap, and ethical considerations.

---

## 1. System Overview

```
┌─────────────┐     ┌──────────────────────────────────────────────────────────┐
│   Client    │────▶│                      API Layer (FastAPI)                 │
│  (React)    │     │  POST /missing-persons  POST /sightings  GET /matches     │
└─────────────┘     └─────────────────────────────┬────────────────────────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              │                              │
                    ▼                              ▼                              ▼
           ┌────────────────┐            ┌────────────────┐            ┌────────────────┐
           │  Relational DB  │            │  Face Pipeline  │            │  Vector Store  │
           │  (PostgreSQL)   │            │  (InsightFace)  │            │  (FAISS/Qdrant)│
           │  persons,       │            │  detect → align │            │  embeddings    │
           │  sightings,     │            │  → embed        │            │  similarity    │
           │  matches        │            │                 │            │  search        │
           └────────────────┘            └────────────────┘            └────────────────┘
```

**Flow (high level):**

1. **Register missing person:** Upload photo → face detection → one or more 512-D embeddings → store in relational DB + vector store.
2. **File sighting:** Upload image → face detection → embeddings → similarity search against all missing-person embeddings → store sighting + match candidates (with scores) in DB → return matches.
3. **Review matches:** Query relational DB for matches (optionally filtered by `min_score`, `sighting_id`, `missing_person_id`).

---

## 2. Face Detection and Embedding Pipeline

### 2.1 Recommended Models

| Concern | Recommendation | Rationale |
|--------|----------------|-----------|
| **Primary** | **InsightFace** (ArcFace backbone) | Production-grade, actively maintained, 512-D embeddings, detection + alignment + recognition in one stack. [InsightFace](https://github.com/deepinsight/insightface) |
| **Embedding dim** | **512** | Standard for ArcFace; good trade-off between discriminative power and index size. |
| **Alternative** | **FaceNet** (dlib/face_recognition) | 128-D, simpler setup; use for lightweight or legacy compatibility. Less actively maintained. |

For a **technically solid, production-ready** system, **InsightFace** is the recommended choice: better accuracy, consistent preprocessing, and options like `buffalo_sc` (speed) vs `antelopev2` (accuracy).

### 2.2 Pipeline Steps

1. **Load image** (from disk or memory; support JPEG, PNG, WebP).
2. **Face detection**  
   - InsightFace: use the model’s built-in detector (e.g. RetinaFace).  
   - Output: bounding boxes (and optionally landmarks).
3. **Alignment (optional but recommended)**  
   - Crop and align each face to a canonical pose (e.g. 112×112) using landmarks.  
   - Reduces pose/illumination variance and improves embedding quality.
4. **Normalization**  
   - InsightFace/ArcFace: typically (pixel - 127.5) / 128 or dataset-specific mean/std.  
   - Must match the model’s training preprocessing.
5. **Embedding**  
   - Forward pass through the recognition model → 512-D vector per face.  
   - Store as float32 array; use **L2-normalized** vectors for cosine similarity via dot product.

### 2.3 Handling Multiple Faces

- **Missing person photo:** Use the **single best** face (e.g. largest, or highest detection score). If multiple are stored, treat as multiple “reference” embeddings for that person (see schema).
- **Sighting photo:** Extract **all** faces; run similarity search for each; aggregate matches (e.g. best score per missing person across all faces in the image).

### 2.4 Libraries (Python)

- **InsightFace:** `insightface` (PyTorch/MXNet); use `app.FaceAnalysis()` or equivalent for detection + embedding.
- **Image I/O and preprocessing:** `opencv-python`, `numpy`, `Pillow`.
- **Optional:** `onnxruntime` if using ONNX-exported InsightFace models for deployment flexibility.

---

## 3. Vector Similarity Search

### 3.1 Similarity Metric

- **Cosine similarity** (on L2-normalized vectors) = dot product.  
- Range [-1, 1]; for faces we expect positive values; typical threshold **≥ 0.4–0.6** for “possible match” (tune with your data and policy).
- Alternatively store **L2-normalized** vectors and use **squared L2 distance**; convert to a score (e.g. `score = 1 / (1 + distance)`).

### 3.2 Recommended Approaches

| Stage / scale | Option | Pros | Cons |
|---------------|--------|------|------|
| **MVP / single node** | **FAISS** (IndexFlatIP or IVF) | Very fast, simple, no extra service. | No persistence by default; you must save/load index; no built-in API or metadata filtering. |
| **Production / scalable** | **Qdrant** or **pgvector** | Persistence, filtering by metadata, REST/gRPC API, horizontal scaling. | Extra service; latency higher than FAISS on a single machine. |
| **Hybrid** | **FAISS + your own persistence** | Speed + control. | You implement index serialization, reload on restart, and metadata filtering in application layer. |

**Recommendation:**

- **Phase 1 (MVP):** FAISS in-process, with index saved to disk (e.g. `faiss.write_index`) and reload on startup; metadata (e.g. `entity_id`, `entity_type`) in your application DB and in a side structure (e.g. list of IDs in same order as FAISS index).
- **Phase 2 (Production):** Migrate to **Qdrant** or **PostgreSQL + pgvector** for persistence, filtering (e.g. by date, region), and operational robustness. Keep the same 512-D normalized vectors and cosine similarity.

### 3.3 Index Types (FAISS)

- **IndexFlatIP:** Exact search, dot product. Use for &lt; ~100K vectors.
- **IVFFlat / IVFPQ:** Approximate search for larger scale; trade-off between recall and speed. Tune `nlist` and `nprobe`.

### 3.4 Filtering and Scope

- Store **only missing-person** embeddings in the vector store for “sighting → candidates” search.
- For “all matches for sighting X,” run similarity search for each face in sighting X, then join with relational DB to attach metadata and apply business rules (e.g. min score, deduplication).

---

## 4. Backend Architecture

### 4.1 Components

- **API:** FastAPI (async, OpenAPI, multipart uploads).
- **Relational DB:** PostgreSQL (persons, sightings, matches, audit).
- **Vector store:** FAISS (Phase 1) or Qdrant / pgvector (Phase 2).
- **File store:** Local disk or S3-compatible object storage for photos.
- **Optional:** Background worker (Celery, RQ, or FastAPI BackgroundTasks) for heavy embedding jobs so uploads return quickly (e.g. 202 Accepted + job id, then poll or webhook for results).

### 4.2 Service Layout (Single Repo)

```
backend/
├── app/
│   ├── main.py              # FastAPI app, routes, middleware
│   ├── config.py            # Settings (DB, vector, paths)
│   ├── database.py          # SQLAlchemy, sessions
│   ├── models/              # ORM: Person, Sighting, Match, etc.
│   ├── schemas/             # Pydantic request/response
│   ├── routers/             # API route modules
│   ├── services/
│   │   ├── face.py          # Detection + embedding (InsightFace)
│   │   ├── vector_store.py  # FAISS or Qdrant client
│   │   └── matching.py      # Orchestrate search + DB writes
│   ├── storage/             # File upload/serve (local or S3)
│   └── tasks/               # Optional: Celery/RQ tasks
├── uploads/                 # Local file store (gitignore)
├── data/                    # FAISS index files (gitignore)
├── requirements.txt
├── Dockerfile
└── docker-compose.yml      # app + postgres + (optional) qdrant/redis
```

### 4.3 API Design (Summary)

- **POST /api/missing-persons** — Multipart: photo + metadata. Sync or async: compute embedding, insert person + embedding, return 201.
- **POST /api/sightings** — Multipart: image + metadata. Compute face embeddings, similarity search, insert sighting + match rows, return 201 with matches in body.
- **GET /api/matches** — Query params: `sighting_id`, `missing_person_id`, `min_score`, `limit`. Read from relational DB; optionally re-run vector search if “live” score is required.
- **GET /api/missing-persons**, **GET /api/sightings** — List with pagination.

(Detailed API and request/response shapes are in `backend/BACKEND_DESIGN.md`.)

### 4.4 Configuration

- **Environment:** `DATABASE_URL`, `VECTOR_INDEX_PATH` (FAISS) or `QDRANT_URL`, `UPLOAD_DIR`, `INSIGHTFACE_MODEL` (e.g. `buffalo_sc`).
- **Secrets:** No embedding model keys; optional API keys for external services (e.g. object storage).

---

## 5. Database Schema

### 5.1 Relational (PostgreSQL)

**missing_persons**

| Column        | Type         | Notes                    |
|---------------|--------------|--------------------------|
| id            | UUID PK      |                          |
| name          | VARCHAR(255) | NOT NULL                 |
| description   | TEXT         |                          |
| date_missing  | DATE         |                          |
| last_seen     | VARCHAR(500) |                          |
| contact_info  | VARCHAR(500) |                          |
| photo_path    | VARCHAR(1024)|                          |
| created_at    | TIMESTAMPTZ  |                          |
| updated_at    | TIMESTAMPTZ  |                          |

**face_embeddings** (links entity → vector store or stores vector in DB if using pgvector)

| Column           | Type         | Notes                          |
|------------------|--------------|--------------------------------|
| id               | UUID PK      |                                |
| entity_type      | VARCHAR(32)  | 'missing_person' \| 'sighting' |
| entity_id        | UUID         | FK to missing_persons or sightings |
| face_index       | INT          | 0 if single face               |
| embedding        | VECTOR(512)  | If pgvector; else omit and use external index |
| created_at       | TIMESTAMPTZ  |                                |

If using **FAISS**, `embedding` can be omitted; keep `(entity_type, entity_id, face_index)` and maintain a parallel list/array that mirrors FAISS index order so you can map FAISS indices back to `entity_id`.

**sightings**

| Column      | Type         | Notes        |
|-------------|--------------|-------------|
| id          | UUID PK      |             |
| image_path  | VARCHAR(1024)|             |
| notes       | TEXT         |             |
| location    | VARCHAR(500) |             |
| created_at  | TIMESTAMPTZ  |             |

**matches**

| Column             | Type    | Notes                    |
|--------------------|---------|--------------------------|
| id                 | UUID PK |                          |
| missing_person_id  | UUID FK | → missing_persons        |
| sighting_id        | UUID FK | → sightings              |
| similarity_score   | FLOAT   | 0.0–1.0 (cosine or mapped) |
| created_at         | TIMESTAMPTZ |                   |
| UNIQUE(missing_person_id, sighting_id) | | One row per pair |

### 5.2 Vector Store (FAISS)

- Single index of **L2-normalized** 512-D vectors.
- Side table or in-memory list: index position → `(entity_type, entity_id, face_index)`.
- On new missing person: append embedding(s), update side structure, `faiss.write_index()` (and save side structure to disk).

### 5.3 Vector Store (Qdrant)

- Collection: e.g. `findthem_faces`.
- Points: `id` (UUID), `vector` (512-D), payload: `entity_type`, `entity_id`, `face_index`, optional `created_at`.
- Search: top_k by cosine; filter by `entity_type == 'missing_person'` when searching from a sighting.

---

## 6. Repository Structure (GitHub)

```
FindThem/
├── .github/
│   └── workflows/          # CI: lint, test, build
├── docs/                   # Optional: runbooks, deployment
├── front-end/              # React app (existing)
│   ├── public/
│   ├── src/
│   └── package.json
├── backend/                # Python FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   │   ├── face.py
│   │   │   ├── vector_store.py
│   │   │   └── matching.py
│   │   └── storage/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
├── ARCHITECTURE.md         # This file
├── README.md               # Project overview, quick start
├── docker-compose.yml      # app + postgres (+ qdrant if used)
└── .gitignore
```

---

## 7. Development Roadmap

### Phase 1 — Core pipeline (weeks 1–2)

1. **Environment:** Python 3.10+, venv, `requirements.txt` (FastAPI, SQLAlchemy, InsightFace, opencv, numpy, faiss-cpu or faiss-gpu).
2. **Face pipeline:**  
   - Load InsightFace model (e.g. buffalo_sc).  
   - Implement: image → detect → align → embed → 512-D list.  
   - Unit tests with a few sample images (single/multiple faces).
3. **Vector store (FAISS):**  
   - IndexFlatIP, L2-normalized vectors.  
   - Add/update/delete by rebuilding index from DB + serialized “side” list; save/load index to disk.
4. **DB:**  
   - PostgreSQL (or SQLite for local dev): tables `missing_persons`, `sightings`, `matches`; optional `face_embeddings` if you store only metadata and keep vectors in FAISS.
5. **API:**  
   - POST missing person (upload photo, run pipeline, insert person + add to FAISS).  
   - POST sighting (upload image, run pipeline, search FAISS, insert sighting + matches).  
   - GET matches (from DB with filters).

### Phase 2 — Production hardening (weeks 3–4)

1. **Persistence and recovery:** Reliable save/load of FAISS index and ID mapping; startup checks.
2. **Threshold and tuning:** Configurable `min_similarity`; document how to choose it; optional calibration on held-out data.
3. **Background jobs:** Offload embedding and indexing to a worker so uploads return quickly; expose job status/result.
4. **Object storage:** Store images in S3-compatible storage; serve via pre-signed URLs or internal proxy.
5. **Tests:** Integration tests for full flow (register → sighting → match); test edge cases (no face, multiple faces).

### Phase 3 — Scale and observability (weeks 5–6)

1. **Vector DB migration:** Introduce Qdrant or pgvector; dual-write or one-time migration from FAISS; switch reads to new store.
2. **Filtering:** Use metadata (e.g. region, date) in vector store or in application layer to narrow search.
3. **Monitoring:** Metrics (latency, throughput, embedding errors); logging (no PII in logs); alerting on failures.
4. **Docs and runbooks:** Deployment, scaling, incident response.

### Phase 4 — Ethics and compliance (ongoing)

1. **Bias and fairness:** Use NIST FRVT-style evaluations if available for your model; test across demographics; document limitations.  
2. **Privacy and consent:** See Section 8.  
3. **Human-in-the-loop:** Treat system as “candidate generator”; require human review before any action.  
4. **Retention and deletion:** Policies and implementation for deleting persons/sightings and associated embeddings.

---

## 8. Ethical Considerations and Privacy

### 8.1 Use and Purpose

- FindThem is for **assisting** in identifying missing persons (e.g. reunification, investigations), not for mass surveillance or identifying individuals without a clear, legitimate purpose.
- Limit access to authorized operators and systems; document purpose and legal basis (e.g. consent, legitimate interest, legal obligation under local law).

### 8.2 Consent and Legal Basis

- **Missing persons:** Where possible, obtain consent from family or legal guardian before registering a person. In some jurisdictions, registration by authorities may be under a different legal basis (e.g. public interest).
- **Sighting reporters:** Inform that images will be processed by automated facial recognition and used only for matching against the missing-persons registry; obtain consent where required (e.g. GDPR for EU).
- **Biometric data:** In many jurisdictions (e.g. EU GDPR, UK GDPR), facial embeddings are biometric data and attract stricter rules (lawful basis, purpose limitation, retention, rights of access/erasure). [ICO biometric guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/) is a useful reference.

### 8.3 Bias and Fairness

- **Accuracy differentials:** NIST FRVT and similar studies show that face recognition accuracy can vary by demographic (e.g. higher false negatives or false positives for some groups). [NIST FRVT demographics](https://pages.nist.gov/frvt/reports/demographics/) and [Scientific American summary](https://www.scientificamerican.com/article/how-nist-tested-facial-recognition-algorithms-for-racial-bias/).
- **Mitigation:** Choose models with better fairness profiles; tune thresholds conservatively; document known limitations; avoid using a single match as definitive identification; always pair with human review.

### 8.4 Transparency and Human Oversight

- **Probabilistic nature:** Scores are similarity metrics, not “ground truth.” Expose this in UI and to operators (e.g. “possible match — requires review”).
- **Human-in-the-loop:** Design workflows so that any decision that affects a person (e.g. contacting family, sharing with authorities) requires human verification.
- **Audit:** Log who registered or queried what and when (without logging raw images or embeddings in plain form); support audits and investigations.

### 8.5 Data Minimization and Retention

- Store only what is necessary: reference photos for missing persons; sighting images and derived embeddings; match results.
- Define retention periods for sightings and matches; automate deletion or anonymization when no longer needed.
- Support **right to erasure:** Delete person/sighting and all associated embeddings and matches when requested and legally required.

### 8.6 Security

- **In transit:** HTTPS only.  
- **At rest:** Encrypt databases and object storage; restrict access to embeddings and images.  
- **Access control:** Role-based access; no casual or bulk export of biometric data.

---

## 9. References and Further Reading

- [InsightFace](https://github.com/deepinsight/insightface) — Face analysis and recognition.  
- [FAISS](https://github.com/facebookresearch/faiss) — Similarity search library.  
- [Qdrant](https://qdrant.tech/) — Vector database.  
- [pgvector](https://github.com/pgvector/pgvector) — Vector type and indexes for PostgreSQL.  
- NIST Face Recognition Vendor Test (FRVT), including [demographics report](https://pages.nist.gov/frvt/reports/demographics/).  
- ICO, [Biometric data and recognition](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/).

---

*This architecture aligns with the existing FindThem backend design in `backend/BACKEND_DESIGN.md` and extends it with production-grade models, vector search options, and ethical guidance.*
