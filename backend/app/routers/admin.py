"""Admin-only endpoints: stats, user management, announcements."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_admin
from ..models import Announcement, Progress, Project, User
from ..schemas import AnnouncementIn, AnnouncementOut, UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "total_users": db.query(func.count(User.id)).scalar() or 0,
        "active_users": db.query(func.count(User.id)).filter(User.is_active).scalar() or 0,
        "total_projects": db.query(func.count(Project.id)).scalar() or 0,
        "lessons_completed": db.query(func.count(Progress.id))
        .filter(Progress.status == "completed")
        .scalar()
        or 0,
    }


@router.get("/users", response_model=list[UserOut])
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    is_active: bool | None = None,
    role: str | None = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if is_active is not None:
        user.is_active = is_active
    if role in ("student", "admin"):
        user.role = role
    db.commit()
    return {"ok": True}


@router.get("/announcements", response_model=list[AnnouncementOut])
def list_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@router.post("/announcements", response_model=AnnouncementOut)
def create_announcement(
    data: AnnouncementIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = Announcement(title=data.title, body=data.body, created_by=admin.id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
