# backend/app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.middleware.auth import get_current_user
from ..models.application import Application
from ..services.application_service import ApplicationService

router = APIRouter()
application_service = ApplicationService()

@router.get("/", response_model=List[Application])
async def get_applications(current_user: dict = Depends(get_current_user)):
    return await application_service.get_all(current_user["email"])

@router.get("/{application_id}", response_model=Application)
async def get_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    application = await application_service.get_by_id(application_id, current_user["email"])
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.post("/", response_model=Application)
async def create_application(
    application: Application,
    current_user: dict = Depends(get_current_user)
):
    return await application_service.create(application, current_user)

@router.put("/{application_id}", response_model=Application)
async def update_application(
    application_id: str,
    application: Application,
    current_user: dict = Depends(get_current_user)
):
    updated = await application_service.update(application_id, application, current_user["email"])
    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated

@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    deleted = await application_service.delete(application_id, current_user["email"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}