# app/models/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
import uuid

class User(BaseModel):
    """User model for account management"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))  # Generate unique ID
    email: EmailStr  # Still unique identifier
    name: Optional[str] = None
    created_at: datetime
    last_login: datetime
    is_active: bool = True

    class Config:
        orm_mode = True