# backend/app/routers/workflow.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.workflow import Workflow
from ..services.workflow_service import WorkflowService

router = APIRouter()
workflow_service = WorkflowService()

@router.get("/", response_model=List[Workflow])
async def get_workflows():
    return await workflow_service.get_all()

@router.get("/default", response_model=Workflow)
async def get_default_workflow():
    workflow = await workflow_service.get_default()
    if not workflow:
        raise HTTPException(status_code=404, detail="Default workflow not found")
    return workflow

@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str):
    workflow = await workflow_service.get_by_id(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/", response_model=Workflow)
async def create_workflow(workflow: Workflow):
    return await workflow_service.create(workflow)

@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, workflow: Workflow):
    updated = await workflow_service.update(workflow_id, workflow)
    if not updated:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return updated

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str):
    deleted = await workflow_service.delete(workflow_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted"}