# backend/models/workflow.py
from pydantic import BaseModel, Field
from typing import List
from bson import ObjectId

class WorkflowStage(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    name: str
    order: int
    color: str

class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    stages: List[WorkflowStage]
    default: bool = False

    model_config = {
        "json_schema_extra": {
            "example": {
                "stages": [
                    {"name": "Applied", "order": 1, "color": "#4A90E2"},
                    {"name": "Interview", "order": 2, "color": "#F5A623"},
                    {"name": "Offer", "order": 3, "color": "#7ED321"}
                ],
                "default": True
            }
        }
    }