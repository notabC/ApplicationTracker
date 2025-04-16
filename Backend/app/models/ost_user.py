from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import uuid


class UserPreference(BaseModel):
    """Model for a specific user preference value"""
    key: str
    value: float
    data_type: str = "number"
    description: Optional[str] = None


class UserProfileCreate(BaseModel):
    """Model for creating a new user profile for OST"""
    resume_text: Optional[str] = None
    job_field: str
    preferences: List[UserPreference]
    
    
class UserProfileResponse(BaseModel):
    """Model for returning a user profile with preferences"""
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_field: str
    experience_level: Optional[str] = "mid"
    preferences: Dict[str, float] = {}
    field_specific_data: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "abc123",
                "job_field": "software_engineering",
                "experience_level": "mid",
                "preferences": {
                    "min_salary": 90000,
                    "work_life_balance_weight": 4.5,
                    "compensation_weight": 3.2
                }
            }
        }


class ResumeUpload(BaseModel):
    """Model for uploading a resume"""
    file_content: str  # Base64 encoded PDF
    file_name: str


class ResumeAnalysisResponse(BaseModel):
    """Model for the response after analyzing a resume"""
    job_field: str
    suggested_questions: List[Dict[str, str]]


class QuestionSubmission(BaseModel):
    """Model for submitting answers to the onboarding questions"""
    job_field: str
    user_data: List[Dict[str, Any]]  # Format from main.py's dynamic_question_manager 