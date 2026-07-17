"""Admin-only endpoints: stats, user management, announcements."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_admin
from ..models import Announcement, Progress, Project, Setting, User
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


@router.get("/analytics")
def analytics(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    per_lesson = (
        db.query(Progress.lesson_id, func.count(Progress.id))
        .filter(Progress.status == "completed")
        .group_by(Progress.lesson_id)
        .order_by(func.count(Progress.id).desc())
        .all()
    )
    return {
        "total_users": db.query(func.count(User.id)).scalar() or 0,
        "total_completions": db.query(func.count(Progress.id)).filter(Progress.status == "completed").scalar() or 0,
        "total_projects": db.query(func.count(Project.id)).scalar() or 0,
        "per_lesson": [{"lesson_id": lid, "completions": c} for lid, c in per_lesson],
    }


@router.get("/projects")
def all_projects(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = (
        db.query(Project, User)
        .join(User, User.id == Project.user_id)
        .order_by(Project.updated_at.desc())
        .limit(100)
        .all()
    )
    return [
        {"id": p.id, "title": p.title, "type": p.type, "updated_at": p.updated_at,
         "user_name": u.name, "user_email": u.email}
        for p, u in rows
    ]


@router.get("/settings")
def get_settings(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {s.key: s.value for s in db.query(Setting).all()}


@router.put("/settings")
def update_settings(
    data: dict, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    for key, value in data.items():
        row = db.get(Setting, key)
        if row:
            row.value = str(value)
        else:
            db.add(Setting(key=key, value=str(value)))
    db.commit()
    return {"ok": True}


@router.delete("/announcements/{ann_id}")
def delete_announcement(
    ann_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    row = db.get(Announcement, ann_id)
    if row:
        db.delete(row)
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
