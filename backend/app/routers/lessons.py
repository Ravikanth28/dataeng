"""CMS lessons: public read, admin create/update/delete."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_admin
from ..models import Lesson, User
from ..schemas import LessonIn, LessonOut

router = APIRouter(tags=["lessons"])


@router.get("/lessons", response_model=list[LessonOut])
def list_lessons(db: Session = Depends(get_db)):
    return db.query(Lesson).order_by(Lesson.track_id, Lesson.order).all()


@router.post("/admin/lessons", response_model=LessonOut)
def create_lesson(
    data: LessonIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    lesson = Lesson(**data.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.put("/admin/lessons/{lesson_id}", response_model=LessonOut)
def update_lesson(
    lesson_id: int,
    data: LessonIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    for k, v in data.model_dump().items():
        setattr(lesson, k, v)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/admin/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"ok": True}
