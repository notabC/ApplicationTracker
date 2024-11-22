from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

class ApplicationLog(BaseModel):
    id: str
    date: datetime
    fromStage: Optional[str] = None
    toStage: str
    message: str
    source: str
    emailId: Optional[str] = None
    emailTitle: Optional[str] = None
    emailBody: Optional[str] = None

class Application(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: str  # Add user ID field
    user_email: EmailStr  # Add user email field
    company: str
    position: str
    dateApplied: datetime
    stage: str
    type: str
    tags: List[str]
    lastUpdated: datetime
    description: Optional[str] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    logs: List[ApplicationLog] = []
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "company": "Example Corp",
                "position": "Software Engineer",
                "dateApplied": "2024-01-01T00:00:00Z",
                "stage": "Applied",
                "type": "Full-time",
                "tags": ["Remote", "Python"],
                "lastUpdated": "2024-01-01T00:00:00Z",
                "user_id": "12345",
                "user_email": "abc@gmail.com",
            }
        }
    }