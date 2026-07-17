"""Pipeline run history for the Project Builder."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import Run, User
from ..schemas import RunIn, RunOut

router = APIRouter(prefix="/runs", tags=["runs"])


@router.get("", response_model=list[RunOut])
def list_runs(
    project_id: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Run).filter(Run.user_id == user.id)
    if project_id is not None:
        q = q.filter(Run.project_id == project_id)
    return q.order_by(Run.created_at.desc()).limit(20).all()


@router.post("", response_model=RunOut)
def create_run(
    data: RunIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    run = Run(user_id=user.id, **data.model_dump())
    db.add(run)
    db.commit()
    db.refresh(run)
    return run
