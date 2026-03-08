"""Matches API."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Match
from app.schemas.match import MatchRead, MatchReadList
from app.schemas.missing_person import MissingPersonRead
from app.schemas.sighting import SightingRead

router = APIRouter(prefix="/matches", tags=["matches"])


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


@router.get("", response_model=MatchReadList)
def list_matches(
    db: Annotated[Session, Depends(get_db)],
    sighting_id: str | None = Query(None, description="Filter by sighting"),
    missing_person_id: str | None = Query(None, description="Filter by missing person"),
    min_score: float | None = Query(None, ge=0, le=1, description="Minimum similarity (0–1)"),
    limit: int = Query(100, le=200),
    offset: int = 0,
):
    """List possible matches, optionally filtered by sighting or missing person."""
    q = db.query(Match)
    if sighting_id:
        q = q.filter(Match.sighting_id == sighting_id)
    if missing_person_id:
        q = q.filter(Match.missing_person_id == missing_person_id)
    if min_score is not None:
        q = q.filter(Match.similarity_score >= min_score)
    rows = q.order_by(Match.similarity_score.desc()).offset(offset).limit(limit).all()
    return MatchReadList(matches=[_match_to_read(m) for m in rows])
