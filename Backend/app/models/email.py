# app/models/email.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class Email(BaseModel):
    id: Optional[str] = None
    subject: str
    body: str
    sender: str
    date: datetime
    processed: bool = False

class EmailProcessRequest(BaseModel):
    email_ids: List[str]