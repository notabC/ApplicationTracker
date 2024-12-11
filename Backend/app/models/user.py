# app/models/user.py

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
import uuid

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: Optional[str] = None
    created_at: datetime
    last_login: datetime
    is_active: bool = True
    hashed_password: Optional[str] = None  # New field for password storage

    class Config:
        orm_mode = True