"""Test missing persons API endpoint (GET list)."""
import os

import pytest
from fastapi.testclient import TestClient

# Use in-memory SQLite for tests to avoid touching a real DB file
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from app.main import app

client = TestClient(app)


def test_get_missing_persons_empty():
    """GET /api/missing-persons returns 200 and a list (possibly empty)."""
    response = client.get("/api/missing-persons")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_health():
    """GET /health returns ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
