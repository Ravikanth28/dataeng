"""Database engine + session setup.

TiDB Cloud (Serverless) requires a TLS connection. When the DATABASE_URL points
at TiDB Cloud we attach an SSL context backed by certifi's CA bundle so the
connection is encrypted and verified.
"""
import certifi
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

connect_args: dict = {}

# TiDB Cloud / most managed MySQL require SSL. Enable it for pymysql.
if settings.DATABASE_URL.startswith("mysql+pymysql"):
    connect_args["ssl"] = {"ca": certifi.where()}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,   # reconnect if a pooled connection went stale
    pool_recycle=280,     # TiDB closes idle connections; recycle before that
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
