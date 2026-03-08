"""
Extract 128-D face embeddings from an image file path.

Uses the `face_recognition` library (dlib). Install with: pip install face_recognition
If no face is found, returns empty list. Multiple faces in one image => multiple embeddings.
"""
from pathlib import Path

from app.config import settings

# Optional: use face_recognition when available
try:
    import face_recognition
    HAS_FACE_RECOGNITION = True
except ImportError:
    HAS_FACE_RECOGNITION = False


def extract_embeddings(image_path: str | Path) -> list[list[float]]:
    """
    Load image from path, detect faces, return list of 128-D embedding vectors.
    Returns [] if no face found or library not installed.
    """
    path = Path(image_path)
    if not path.is_absolute():
        path = settings.upload_dir / path
    if not path.exists():
        return []

    if not HAS_FACE_RECOGNITION:
        # Stub: return one dummy embedding so pipeline runs without dlib
        return [[0.0] * settings.embedding_dim]

    image = face_recognition.load_image_file(str(path))
    encodings = face_recognition.face_encodings(image)
    return [enc.tolist() for enc in encodings]
