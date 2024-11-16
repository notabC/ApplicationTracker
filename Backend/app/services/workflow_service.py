# backend/app/services/workflow_service.py
from bson import ObjectId
from typing import List, Optional
from ..models.workflow import Workflow
from ..database import get_database

class WorkflowService:
    def __init__(self):
        self.collection_name = "workflows"

    async def get_collection(self):
        db = await get_database()
        return db[self.collection_name]

    async def get_all(self) -> List[Workflow]:
        collection = await self.get_collection()
        workflows = []
        async for wf in collection.find():
            wf["id"] = str(wf.pop("_id"))
            workflows.append(Workflow(**wf))
        return workflows

    async def get_by_id(self, workflow_id: str) -> Optional[Workflow]:
        collection = await self.get_collection()
        wf = await collection.find_one({"_id": ObjectId(workflow_id)})
        if wf:
            wf["id"] = str(wf.pop("_id"))
            return Workflow(**wf)
        return None

    async def get_default(self) -> Optional[Workflow]:
        collection = await self.get_collection()
        wf = await collection.find_one({"default": True})
        if wf:
            wf["id"] = str(wf.pop("_id"))
            return Workflow(**wf)
        return None

    async def create(self, workflow: Workflow) -> Workflow:
        collection = await self.get_collection()
        workflow_dict = workflow.dict()
        workflow_dict["_id"] = ObjectId(workflow_dict.pop("id"))
        await collection.insert_one(workflow_dict)
        return workflow

    async def update(self, workflow_id: str, workflow: Workflow) -> Optional[Workflow]:
        collection = await self.get_collection()
        workflow_dict = workflow.dict()
        workflow_dict["_id"] = ObjectId(workflow_id)
        del workflow_dict["id"]
        result = await collection.replace_one(
            {"_id": ObjectId(workflow_id)},
            workflow_dict
        )
        if result.modified_count:
            return workflow
        return None

    async def delete(self, workflow_id: str) -> bool:
        collection = await self.get_collection()
        result = await collection.delete_one({"_id": ObjectId(workflow_id)})
        return result.deleted_count > 0