# app/routers/workflow.py
from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List
from ..models.workflow import Workflow, WorkflowStage
from ..services.workflow_service import WorkflowService
from ..middleware.auth import get_current_user

router = APIRouter()
workflow_service = WorkflowService()

@router.get("/", response_model=List[Workflow])
async def get_workflows(current_user: dict = Depends(get_current_user)):
    return await workflow_service.get_all(current_user)

@router.post("/", response_model=Workflow)
async def create_workflow(
    workflow: Workflow,
    current_user: dict = Depends(get_current_user)
):
    created_workflow = await workflow_service.create(workflow, current_user)
    if not created_workflow:
        raise HTTPException(status_code=500, detail="Failed to create workflow")
    return created_workflow

@router.get("/default", response_model=Workflow)
async def get_default_workflow(current_user: dict = Depends(get_current_user)):
    workflow = await workflow_service.get_default(current_user)
    if not workflow:
        workflow = await workflow_service.create_initial_workflow(current_user)
        if not workflow:
            raise HTTPException(status_code=500, detail="Failed to create default workflow")
    return workflow

@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    workflow = await workflow_service.get_by_id(workflow_id, current_user)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    workflow: Workflow,
    current_user: dict = Depends(get_current_user)
):
    updated_workflow = await workflow_service.update(workflow_id, workflow, current_user)
    if not updated_workflow:
        raise HTTPException(status_code=404, detail="Update failed")
    return updated_workflow

@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not await workflow_service.delete(workflow_id, current_user):
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}

@router.put("/{workflow_id}/stages/{stage_id}", response_model=Workflow)
async def update_stage(
    workflow_id: str,
    stage_id: str,
    stage: WorkflowStage,
    current_user: dict = Depends(get_current_user)
):
    workflow = await workflow_service.update_stage(workflow_id, stage_id, stage, current_user)
    if not workflow:
        raise HTTPException(status_code=404, detail="Update failed")
    return workflow

@router.put("/{workflow_id}/order", response_model=Workflow)
async def update_stage_order(
    workflow_id: str,
    stage_order: List[str] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    workflow = await workflow_service.update_stage_order(workflow_id, stage_order, current_user)
    if not workflow:
        raise HTTPException(status_code=404, detail="Update failed")
    return workflow

@router.put("/{workflow_id}/visibility/{stage_id}", response_model=Workflow)
async def update_stage_visibility(
    workflow_id: str,
    stage_id: str,
    visible: bool = Body(...),
    current_user: dict = Depends(get_current_user)
):
    workflow = await workflow_service.update_stage_visibility(workflow_id, stage_id, visible, current_user)
    if not workflow:
        raise HTTPException(status_code=404, detail="Update failed")
    return workflow