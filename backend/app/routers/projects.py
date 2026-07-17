"""CRUD for a student's saved projects."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import Project, User
from ..schemas import ProjectIn, ProjectOut

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .filter(Project.user_id == user.id)
        .order_by(Project.updated_at.desc())
        .all()
    )


@router.post("", response_model=ProjectOut)
def create_project(
    data: ProjectIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = Project(
        user_id=user.id,
        title=data.title,
        type=data.type,
        content_json=data.content_json,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def _get_owned(project_id: int, user: User, db: Session) -> Project:
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    data: ProjectIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned(project_id, user, db)
    project.title = data.title
    project.type = data.type
    project.content_json = data.content_json
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned(project_id, user, db)
    db.delete(project)
    db.commit()
    return {"ok": True}
