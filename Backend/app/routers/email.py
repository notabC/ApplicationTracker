# app/routers/email.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.email import Email, EmailProcessRequest
from ..services.email_service import EmailService

router = APIRouter()
email_service = EmailService()

@router.get("/", response_model=List[Email])
async def get_emails():
    return await email_service.get_all()

@router.post("/", response_model=Email)
async def create_email(email: Email):
    return await email_service.create(email)

@router.post("/process")
async def process_emails(request: EmailProcessRequest):
    processed = await email_service.mark_as_processed(request.email_ids)
    if not processed:
        raise HTTPException(status_code=404, detail="No emails were processed")
    return {"message": "Emails marked as processed"}