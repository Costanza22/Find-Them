"""SQLAlchemy engine, session, and base."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """ORM base."""
    pass


def get_db():
    """Dependency: yield a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
