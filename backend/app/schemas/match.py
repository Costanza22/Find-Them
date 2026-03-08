"""Match request/response schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.missing_person import MissingPersonRead
from app.schemas.sighting import SightingRead


class MatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    missing_person_id: str
    sighting_id: str
    similarity_score: float  # 0.0–1.0; frontend can show as 0–100
    created_at: datetime

    missing_person: MissingPersonRead | None = None
    sighting: SightingRead | None = None


class MatchReadList(BaseModel):
    matches: list[MatchRead]
