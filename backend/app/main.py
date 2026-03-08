"""FindThem API – FastAPI application."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import matches, missing_persons, sightings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="FindThem API",
    description="Register missing persons, upload sightings, get similarity matches",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(missing_persons.router, prefix=settings.api_prefix)
app.include_router(sightings.router, prefix=settings.api_prefix)
app.include_router(matches.router, prefix=settings.api_prefix)

# Serve uploaded files at /uploads
app.mount("/uploads", StaticFiles(directory=str(settings.upload_dir)), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}
