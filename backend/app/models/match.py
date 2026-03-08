"""Match ORM model (sighting vs missing person + similarity score)."""
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.sqlite import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.missing_person import MissingPerson
    from app.models.sighting import Sighting


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("missing_person_id", "sighting_id", name="uq_match_pair"),)

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    missing_person_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("missing_persons.id"), nullable=False)
    sighting_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("sightings.id"), nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0–1.0
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    missing_person: Mapped["MissingPerson"] = relationship("MissingPerson", back_populates="matches")
    sighting: Mapped["Sighting"] = relationship("Sighting", back_populates="matches")
