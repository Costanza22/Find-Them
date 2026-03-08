"""
Vector store for face embeddings.

In-memory implementation: stores (entity_type, entity_id, embedding) and supports
similarity search. For production, replace with pgvector, Chroma, or Qdrant.
"""
from __future__ import annotations

import uuid
from typing import Literal

from app.config import settings

EntityType = Literal["missing_person", "sighting"]

# In-memory store: list of (id, entity_type, entity_id, embedding)
_store: list[tuple[str, EntityType, str, list[float]]] = []


def get_vector_store():
    """Return the module-level store (singleton)."""
    return _store


def add_embedding(entity_type: EntityType, entity_id: str, embedding: list[float]) -> str:
    """Append one embedding; return record id (for consistency, not used in-mem)."""
    record_id = str(uuid.uuid4())
    _store.append((record_id, entity_type, entity_id, embedding))
    return record_id


def search_similar(
    query_embedding: list[float],
    entity_type: EntityType,
    top_k: int = 20,
    min_similarity: float | None = None,
) -> list[tuple[str, float]]:
    """
    Return list of (entity_id, similarity_score) for entities of given type.
    Similarity in [0, 1]; higher = more similar.
    Uses cosine similarity; fallback to 1 / (1 + euclidean) if needed.
    """
    if min_similarity is None:
        min_similarity = settings.min_similarity_threshold

    import math

    def cosine_sim(a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        na = math.sqrt(sum(x * x for x in a))
        nb = math.sqrt(sum(x * x for x in b))
        if na == 0 or nb == 0:
            return 0.0
        return max(0.0, min(1.0, dot / (na * nb)))

    candidates: list[tuple[str, float]] = []
    for _id, etype, eid, emb in _store:
        if etype != entity_type:
            continue
        sim = cosine_sim(query_embedding, emb)
        if sim >= min_similarity:
            candidates.append((eid, sim))

    candidates.sort(key=lambda x: -x[1])
    return candidates[:top_k]
