"""FastAPI entry point for DataFlow Academy."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import Base, engine
from .routers import admin, auth, lessons, progress, projects

# Create tables in TiDB on startup (safe: only creates what's missing).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DataFlow Academy API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(progress.router)
app.include_router(projects.router)
app.include_router(lessons.router)
app.include_router(admin.router)


@app.get("/")
def health():
    return {"status": "ok", "service": "DataFlow Academy API"}
