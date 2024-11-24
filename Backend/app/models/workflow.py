# app/models/workflow.py
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from bson import ObjectId

class WorkflowStage(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    name: str
    color: str = "gray"
    editable: bool = True
    visible: bool = True
    
class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: Optional[str] = None  # Add user ID field
    user_email: Optional[EmailStr] = None  # Add user email field
    stages: List[WorkflowStage]
    stage_order: List[str]
    default: bool = False

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "user123",
                "user_email": "user@example.com",
                "stages": [
                    {"id": "unassigned", "name": "Unassigned", "color": "gray", "editable": False, "visible": True},
                    {"id": "resume-submitted", "name": "Resume Submitted", "color": "blue", "editable": True, "visible": True}
                ],
                "stage_order": ["unassigned", "resume-submitted"],
                "default": True
            }
        }
    }