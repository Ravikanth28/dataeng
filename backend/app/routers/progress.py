"""Save & fetch a student's lesson progress."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import Progress, User
from ..schemas import ProgressIn, ProgressOut

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=list[ProgressOut])
def list_progress(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Progress).filter(Progress.user_id == user.id).all()


@router.post("", response_model=ProgressOut)
def upsert_progress(
    data: ProgressIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Progress)
        .filter(Progress.user_id == user.id, Progress.lesson_id == data.lesson_id)
        .first()
    )
    if row:
        row.status = data.status
        row.score = data.score
    else:
        row = Progress(
            user_id=user.id,
            lesson_id=data.lesson_id,
            status=data.status,
            score=data.score,
        )
        db.add(row)
    db.commit()
    db.refresh(row)
    return row
