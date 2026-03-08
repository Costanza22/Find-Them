"""Missing person request/response schemas."""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, computed_field


class MissingPersonCreate(BaseModel):
    """From multipart form (except photo)."""
    name: str
    description: str | None = None
    date_missing: date | None = None
    last_seen: str | None = None
    contact_info: str | None = None


class MissingPersonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    date_missing: date | None
    last_seen: str | None
    contact_info: str | None
    photo_path: str | None
    created_at: datetime

    @computed_field
    @property
    def photo_url(self) -> str | None:
        if not self.photo_path:
            return None
        return f"/uploads/{self.photo_path}" if not self.photo_path.startswith("/") else self.photo_path
