import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

logger = logging.getLogger("db")


class Base(DeclarativeBase):
    pass


# Connect engine with safety fallback
_engine = None
_SessionLocal = None
_db_available = False

try:
    _engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)
    # Test connection
    with _engine.connect() as conn:
        _db_available = True
        logger.info("Connected to PostgreSQL/PostGIS database successfully.")
except Exception as e:
    logger.warning(f"PostgreSQL connection to {settings.DATABASE_URL} failed ({e}). Running in resilient fallback mode (Direct ERDDAP + Local Cache).")
    # Use in-memory sqlite as local metadata fallback
    try:
        _engine = create_engine("sqlite:///:memory:", echo=False)
        _db_available = False
    except Exception:
        pass

if _engine:
    _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def get_db():
    if _SessionLocal is None:
        yield None
        return
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def is_db_connected() -> bool:
    return _db_available
