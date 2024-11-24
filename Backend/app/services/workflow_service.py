# app/services/workflow_service.py
import logging
from fastapi import HTTPException
from app.database import get_database
from bson import ObjectId
from typing import List, Optional, Dict
from ..models.workflow import Workflow, WorkflowStage

logger = logging.getLogger(__name__)

class WorkflowService:
    def __init__(self):
        self.collection_name = "workflows"

    async def get_collection(self):
        db = await get_database()
        return db[self.collection_name]

    async def get_all(self, user: Dict) -> List[Workflow]:
        collection = await self.get_collection()
        workflows = []
        async for wf in collection.find({"user_email": user["email"]}):
            wf["id"] = str(wf.pop("_id"))
            workflows.append(Workflow(**wf))
        return workflows

    async def get_default(self, user: Dict) -> Optional[Workflow]:
        collection = await self.get_collection()
        wf = await collection.find_one({
            "default": True,
            "user_email": user["email"]
        })
        if wf:
            wf["id"] = str(wf.pop("_id"))
            return Workflow(**wf)
        return None

    async def update_stage(self, workflow_id: str, stage_id: str, stage: WorkflowStage, user: Dict) -> Optional[Workflow]:
        collection = await self.get_collection()
        workflow = await self.get_by_id(workflow_id, user)
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
            
        stage_index = next((i for i, s in enumerate(workflow.stages) if s.id == stage_id), -1)
        if stage_index == -1:
            raise HTTPException(status_code=404, detail="Stage not found")
            
        if not workflow.stages[stage_index].editable:
            raise HTTPException(status_code=400, detail="Stage is not editable")
            
        workflow.stages[stage_index] = stage
        return await self.update(workflow_id, workflow, user)

    async def update_stage_order(self, workflow_id: str, stage_order: List[str], user: Dict) -> Optional[Workflow]:
        workflow = await self.get_by_id(workflow_id, user)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
            
        if set(stage_order) != set(workflow.stage_order):
            raise HTTPException(status_code=400, detail="Invalid stage order")
            
        workflow.stage_order = stage_order
        return await self.update(workflow_id, workflow, user)

    async def update_stage_visibility(self, workflow_id: str, stage_id: str, visible: bool, user: Dict) -> Optional[Workflow]:
        workflow = await self.get_by_id(workflow_id, user)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
            
        stage = next((s for s in workflow.stages if s.id == stage_id), None)
        if not stage:
            raise HTTPException(status_code=404, detail="Stage not found")
            
        if not stage.editable:
            raise HTTPException(status_code=400, detail="Stage is not editable")
            
        stage.visible = visible
        return await self.update(workflow_id, workflow, user)
    
    async def create(self, workflow: Workflow, user: Dict) -> Optional[Workflow]:
        collection = await self.get_collection()
        workflow_dict = workflow.model_dump()
        workflow_dict["_id"] = ObjectId(workflow_dict.pop("id"))
        workflow_dict["user_id"] = user["id"]
        workflow_dict["user_email"] = user["email"]
        
        try:
            await collection.insert_one(workflow_dict)
            return workflow
        except Exception as e:
            logger.error(f"Failed to create workflow: {e}")
            return None
        
    async def get_by_id(self, workflow_id: str, user: Dict) -> Optional[Workflow]:
        collection = await self.get_collection()
        wf = await collection.find_one({
            "_id": ObjectId(workflow_id),
            "user_email": user["email"]
        })
        if wf:
            wf["id"] = str(wf.pop("_id"))
            return Workflow(**wf)
        return None
    
    async def update(self, workflow_id: str, workflow: Workflow, user: Dict) -> Optional[Workflow]:
        collection = await self.get_collection()
        workflow_dict = workflow.model_dump()
        workflow_dict["_id"] = ObjectId(workflow_id)
        workflow_dict["user_id"] = user["id"]
        workflow_dict["user_email"] = user["email"]
        del workflow_dict["id"]
        
        result = await collection.replace_one(
            {
                "_id": ObjectId(workflow_id),
                "user_email": user["email"]
            },
            workflow_dict
        )
        if result.modified_count:
            workflow.id = workflow_id
            return workflow
        return None

    async def delete(self, workflow_id: str, user: Dict) -> bool:
        collection = await self.get_collection()
        result = await collection.delete_one({
            "_id": ObjectId(workflow_id),
            "user_email": user["email"]
        })
        return result.deleted_count > 0

    async def create_initial_workflow(self, user: Dict) -> Optional[Workflow]:
        default = Workflow(
            id=str(ObjectId()),
            user_id=user["id"],
            user_email=user["email"],
            stages=[
                WorkflowStage(id="unassigned", name="Unassigned", color="gray", editable=False, visible=True),
                WorkflowStage(id="resume-submitted", name="Resume Submitted", color="blue", editable=True, visible=True),
                WorkflowStage(id="online-assessment", name="Online Assessment", color="yellow", editable=True, visible=True),
                WorkflowStage(id="interview-process", name="Interview Process", color="purple", editable=True, visible=True),
                WorkflowStage(id="offer", name="Offer", color="green", editable=True, visible=True),
                WorkflowStage(id="rejected", name="Rejected", color="red", editable=True, visible=True)
            ],
            stage_order=["unassigned", "resume-submitted", "online-assessment", "interview-process", "offer", "rejected"],
            default=True
        )
        return await self.create(default, user)
