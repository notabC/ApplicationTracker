from fastapi import APIRouter, HTTPException, Body
from typing import List
from ..models.workflow import Workflow, WorkflowStage
from ..services.workflow_service import WorkflowService

router = APIRouter()
workflow_service = WorkflowService()

@router.get("/", response_model=List[Workflow])
async def get_workflows():
    return await workflow_service.get_all()

@router.post("/", response_model=Workflow)
async def create_workflow(workflow: Workflow):
    created_workflow = await workflow_service.create(workflow)
    if not created_workflow:
        raise HTTPException(status_code=500, detail="Failed to create workflow")
    return created_workflow

@router.get("/default", response_model=Workflow)
async def get_default_workflow():
    workflow = await workflow_service.get_default()
    if not workflow:
        workflow = await workflow_service.create_initial_workflow()
        if not workflow:
            raise HTTPException(status_code=500, detail="Failed to create default workflow")
    return workflow

@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str):
    workflow = await workflow_service.get_by_id(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, workflow: Workflow):
    updated_workflow = await workflow_service.update(workflow_id, workflow)
    if not updated_workflow:
        raise HTTPException(status_code=404, detail="Update failed")
    return updated_workflow

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str):
    if not await workflow_service.delete(workflow_id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}

@router.put("/{workflow_id}/stages/{stage_id}", response_model=Workflow)
async def update_stage(workflow_id: str, stage_id: str, stage: WorkflowStage):
    workflow = await workflow_service.update_stage(workflow_id, stage_id, stage)
    if not workflow:
        raise HTTPException(status_code=404, detail="Update failed")
    return workflow

@router.put("/{workflow_id}/order", response_model=Workflow)
async def update_stage_order(workflow_id: str, stage_order: List[str] = Body(...)):
    workflow = await workflow_service.update_stage_order(workflow_id, stage_order)
    if not workflow:
        raise HTTPException(status_code=404, detail="Update failed")
    return workflow

@router.put("/{workflow_id}/visibility/{stage_id}", response_model=Workflow)
async def update_stage_visibility(workflow_id: str, stage_id: str, visible: bool = Body(...)):
    workflow = await workflow_service.update_stage_visibility(workflow_id, stage_id, visible)
    if not workflow:
        raise HTTPException(status_code=404, detail="Update failed")
    return workflow