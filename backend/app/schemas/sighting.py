"""Sighting request/response schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, computed_field

from app.schemas.match import MatchRead


class SightingCreate(BaseModel):
    """From multipart form (except image)."""
    notes: str | None = None
    location: str | None = None


class SightingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    image_path: str
    notes: str | None
    location: str | None
    created_at: datetime

    @computed_field
    @property
    def image_url(self) -> str:
        return f"/uploads/{self.image_path}" if not self.image_path.startswith("/") else self.image_path


class SightingReadWithMatches(SightingRead):
    matches: list[MatchRead] = []
