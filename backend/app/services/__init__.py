"""Business logic: face embedding, vector store, matching."""
from app.services.face_embedding import extract_embeddings
from app.services.vector_store import get_vector_store
from app.services.matching import compute_matches_for_sighting

__all__ = ["extract_embeddings", "get_vector_store", "compute_matches_for_sighting"]
