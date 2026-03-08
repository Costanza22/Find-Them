"""Application settings."""
import os
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Load from environment or .env."""

    # Database
    database_url: str = "sqlite:///./findthem.db"

    # Uploads
    upload_dir: Path = Path(__file__).resolve().parent.parent / "uploads"
    max_upload_bytes: int = 10 * 1024 * 1024  # 10 MB

    # Face embedding
    embedding_dim: int = 128
    # Minimum similarity (0–1) to create a match
    min_similarity_threshold: float = 0.5

    # API
    api_prefix: str = "/api"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.upload_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
