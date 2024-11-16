# backend/app/routers/applications.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.application import Application
from ..services.application_service import ApplicationService

router = APIRouter()
application_service = ApplicationService()

@router.get("/", response_model=List[Application])
async def get_applications():
    return await application_service.get_all()

@router.get("/{application_id}", response_model=Application)
async def get_application(application_id: str):
    application = await application_service.get_by_id(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.post("/", response_model=Application)
async def create_application(application: Application):
    return await application_service.create(application)

@router.put("/{application_id}", response_model=Application)
async def update_application(application_id: str, application: Application):
    updated = await application_service.update(application_id, application)
    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated

@router.delete("/{application_id}")
async def delete_application(application_id: str):
    deleted = await application_service.delete(application_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}