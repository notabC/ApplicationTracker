# app/models/gmail.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GmailCredentials(BaseModel):
    user_id: str
    access_token: str
    refresh_token: str
    token_expiry: datetime
    email: str

class GmailFetchParams(BaseModel):
    tags: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    search_query: Optional[str] = None
    limit: Optional[int] = 20