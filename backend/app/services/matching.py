"""
Compute matches: sighting embeddings vs missing-person embeddings via vector store.
"""
from sqlalchemy.orm import Session

from app.models import Match, MissingPerson, Sighting
from app.services.face_embedding import extract_embeddings
from app.services.vector_store import add_embedding, get_vector_store, search_similar


def compute_matches_for_sighting(
    db: Session,
    sighting: Sighting,
) -> list[Match]:
    """
    Extract face embeddings from sighting image, search vector store for similar
    missing persons, create Match rows, and return them.
    """
    # image_path is relative to upload_dir (e.g. "sightings/abc.jpg")
    embeddings = extract_embeddings(sighting.image_path)
    if not embeddings:
        return []

    created: list[Match] = []
    for emb in embeddings:
        results = search_similar(emb, "missing_person", top_k=10)
        for missing_person_id, score in results:
            existing = db.query(Match).filter(
                Match.missing_person_id == missing_person_id,
                Match.sighting_id == sighting.id,
            ).first()
            if existing:
                continue
            match = Match(
                missing_person_id=missing_person_id,
                sighting_id=sighting.id,
                similarity_score=round(score, 4),
            )
            db.add(match)
            created.append(match)
    db.commit()
    for m in created:
        db.refresh(m)
    return created
