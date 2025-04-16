from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import uuid


class JobOffer(BaseModel):
    """Model for a job offer to be evaluated by OST"""
    company: str
    position: str
    salary: float
    benefits: Optional[Dict[str, Any]] = None
    location: Optional[str] = None
    remote_option: bool = False
    work_life_balance: Optional[float] = None
    career_growth: Optional[float] = None
    company_culture: Optional[float] = None
    job_security: Optional[float] = None
    tech_stack_alignment: Optional[float] = None
    
    class Config:
        schema_extra = {
            "example": {
                "company": "Tech Co",
                "position": "Senior Software Engineer",
                "salary": 120000,
                "benefits": {
                    "health_insurance": True,
                    "401k_match": 4,
                    "vacation_days": 20,
                    "stock_options": 1000
                },
                "location": "San Francisco, CA",
                "remote_option": True,
                "work_life_balance": 3.5,
                "career_growth": 4.2,
                "company_culture": 4.0
            }
        }


class ApplicationData(BaseModel):
    """Model for application data to be processed"""
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    position: str
    job_description: Optional[str] = None
    salary_information: Optional[str] = None
    application_date: Optional[datetime] = None
    additional_info: Optional[Dict[str, Any]] = None


class ApplicationProcessRequest(BaseModel):
    """Model for requesting an application process"""
    application_data: ApplicationData
    user_id: Optional[str] = None


class ApplicationAnalysisResult(BaseModel):
    """Model for the result of application analysis"""
    application_id: str
    metrics: Dict[str, float]
    overall_score: float
    reasoning: Dict[str, str]
    recommendation: str
    knowledge_gaps: Optional[List[str]] = None


class MetricDefinition(BaseModel):
    """Model for defining a job quality metric"""
    key: str
    name: str
    description: str
    min_val: float = 0
    max_val: float = 10
    weight: float = 1.0
    

class JobQualityAssessment(BaseModel):
    """Model for comprehensive job quality assessment result"""
    job_id: str
    user_id: Optional[str] = None
    overall_score: float
    metrics: Dict[str, float]
    reasoning: Dict[str, str]
    recommendation: str
    recommendation_confidence: float
    comparisons: Optional[List[Dict[str, Any]]] = None
    created_at: datetime = Field(default_factory=datetime.now)
    

class WebSocketMessage(BaseModel):
    """Model for WebSocket messages during application processing"""
    message_type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now) 