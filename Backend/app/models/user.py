# app/models/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class User(BaseModel):
    """User model for account management"""
    id: str  # This will be the same as user_id in GmailCredentials
    email: EmailStr
    name: Optional[str] = None
    created_at: datetime
    last_login: datetime
    is_active: bool = True

    class Config:
        orm_mode = True
