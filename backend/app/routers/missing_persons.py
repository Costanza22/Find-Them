"""Missing persons API."""
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import MissingPerson
from app.schemas.missing_person import MissingPersonCreate, MissingPersonRead
from app.services.face_embedding import extract_embeddings
from app.services.vector_store import add_embedding, get_vector_store
from app.storage.local import save_upload

router = APIRouter(prefix="/missing-persons", tags=["missing-persons"])


@router.post("", response_model=MissingPersonRead, status_code=201)
def register_missing_person(
    db: Annotated[Session, Depends(get_db)],
    name: Annotated[str, Form()],
    photo: UploadFile,
    description: str | None = Form(None),
    date_missing: date | None = Form(None),
    last_seen: str | None = Form(None),
    contact_info: str | None = Form(None),
):
    """Register a missing person (photo + metadata). Extracts face embedding and indexes it."""
    if not photo.filename or not photo.content_type or not photo.content_type.startswith("image/"):
        raise HTTPException(400, "Photo file required")

    photo_path = save_upload(photo, subdir="missing_persons")
    person = MissingPerson(
        name=name.strip(),
        description=description.strip() if description else None,
        date_missing=date_missing,
        last_seen=last_seen.strip() if last_seen else None,
        contact_info=contact_info.strip() if contact_info else None,
        photo_path=photo_path,
    )
    db.add(person)
    db.commit()
    db.refresh(person)

    # Extract face embedding(s) and add to vector store
    full_path = settings.upload_dir / photo_path
    for emb in extract_embeddings(str(full_path)):
        add_embedding("missing_person", person.id, emb)

    return person


@router.get("", response_model=list[MissingPersonRead])
def list_missing_persons(
    db: Annotated[Session, Depends(get_db)],
    limit: int = 50,
    offset: int = 0,
):
    """List missing persons with pagination."""
    return db.query(MissingPerson).order_by(MissingPerson.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{person_id}", response_model=MissingPersonRead)
def get_missing_person(
    db: Annotated[Session, Depends(get_db)],
    person_id: str,
):
    """Get one missing person by id."""
    person = db.query(MissingPerson).filter(MissingPerson.id == person_id).first()
    if not person:
        raise HTTPException(404, "Missing person not found")
    return person
