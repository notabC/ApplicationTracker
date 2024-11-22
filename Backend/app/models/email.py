# app/models/email.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class Email(BaseModel):
    id: Optional[str] = None
    user_id: str  # Add user ID field
    user_email: EmailStr  # Add user email field
    subject: str
    body: str
    sender: str
    date: datetime
    processed: bool = False

class EmailProcessRequest(BaseModel):
    email_ids: List[str]