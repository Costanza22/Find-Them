"""Save uploaded files to local disk; return relative path for DB."""
import uuid
from pathlib import Path

from app.config import settings


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def save_upload(file, subdir: str = "") -> str:
    """
    Save uploaded file to settings.upload_dir / subdir with a unique name.
    Return relative path (subdir/filename) for storing in DB.
    """
    suffix = Path(file.filename or "img").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        suffix = ".jpg"
    name = f"{uuid.uuid4().hex}{suffix}"
    dest_dir = settings.upload_dir / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / name
    with open(dest, "wb") as f:
        f.write(file.file.read())
    return f"{subdir}/{name}".lstrip("/") if subdir else name
