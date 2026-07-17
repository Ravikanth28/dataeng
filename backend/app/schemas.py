"""Pydantic schemas = the shapes of API request/response bodies."""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class SignupIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Progress ----------
class ProgressIn(BaseModel):
    lesson_id: str
    status: str = "completed"
    score: int = 0


class ProgressOut(BaseModel):
    lesson_id: str
    status: str
    score: int

    class Config:
        from_attributes = True


# ---------- Projects ----------
class ProjectIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    type: str = "capstone"
    content_json: str = "{}"


class ProjectOut(BaseModel):
    id: int
    title: str
    type: str
    content_json: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Lessons (CMS) ----------
class LessonIn(BaseModel):
    track_id: str
    title: str = Field(min_length=1, max_length=200)
    level: str = "easy"
    minutes: int = 8
    body: str = ""
    practice_json: str = ""
    order: int = 100


class LessonOut(BaseModel):
    id: int
    track_id: str
    title: str
    level: str
    minutes: int
    body: str
    practice_json: str
    order: int

    class Config:
        from_attributes = True


# ---------- Pipeline runs ----------
class RunIn(BaseModel):
    project_id: int | None = None
    title: str = ""
    template_id: str = ""
    status: str = "success"
    duration_ms: int = 0
    log: str = ""


class RunOut(BaseModel):
    id: int
    project_id: int | None
    title: str
    template_id: str
    status: str
    duration_ms: int
    log: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Announcements ----------
class AnnouncementIn(BaseModel):
    title: str
    body: str = ""


class AnnouncementOut(BaseModel):
    id: int
    title: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True
