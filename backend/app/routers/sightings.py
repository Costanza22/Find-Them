"""Sightings API."""
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Match, Sighting
from app.schemas.match import MatchRead
from app.schemas.missing_person import MissingPersonRead
from app.schemas.sighting import SightingRead, SightingReadWithMatches
from app.services.matching import compute_matches_for_sighting
from app.storage.local import save_upload

router = APIRouter(prefix="/sightings", tags=["sightings"])


def _match_to_read(m: Match) -> MatchRead:
    return MatchRead(
        id=m.id,
        missing_person_id=m.missing_person_id,
        sighting_id=m.sighting_id,
        similarity_score=m.similarity_score,
        created_at=m.created_at,
        missing_person=MissingPersonRead.model_validate(m.missing_person),
        sighting=SightingRead.model_validate(m.sighting),
    )


@router.post("", response_model=SightingReadWithMatches, status_code=201)
def upload_sighting(
    db: Annotated[Session, Depends(get_db)],
    image: UploadFile,
    notes: str | None = Form(None),
    location: str | None = Form(None),
):
    """Upload a sighting image. Backend computes matches and returns them in the response."""
    if not image.filename or not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(400, "Image file required")

    image_path = save_upload(image, subdir="sightings")
    sighting = Sighting(
        image_path=image_path,
        notes=notes.strip() if notes else None,
        location=location.strip() if location else None,
    )
    db.add(sighting)
    db.commit()
    db.refresh(sighting)

    compute_matches_for_sighting(db, sighting)

    # Reload with matches and nested objects
    db.refresh(sighting)
    matches = db.query(Match).filter(Match.sighting_id == sighting.id).all()
    match_reads = [_match_to_read(m) for m in matches]
    return SightingReadWithMatches(
        id=sighting.id,
        image_path=sighting.image_path,
        notes=sighting.notes,
        location=sighting.location,
        created_at=sighting.created_at,
        matches=match_reads,
    )


@router.get("", response_model=list[SightingRead])
def list_sightings(
    db: Annotated[Session, Depends(get_db)],
    limit: int = 50,
    offset: int = 0,
):
    """List sightings."""
    return db.query(Sighting).order_by(Sighting.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{sighting_id}", response_model=SightingReadWithMatches)
def get_sighting(
    db: Annotated[Session, Depends(get_db)],
    sighting_id: str,
):
    """Get one sighting with its matches."""
    sighting = db.query(Sighting).filter(Sighting.id == sighting_id).first()
    if not sighting:
        raise HTTPException(404, "Sighting not found")
    matches = db.query(Match).filter(Match.sighting_id == sighting_id).all()
    return SightingReadWithMatches(
        id=sighting.id,
        image_path=sighting.image_path,
        notes=sighting.notes,
        location=sighting.location,
        created_at=sighting.created_at,
        matches=[_match_to_read(m) for m in matches],
    )
