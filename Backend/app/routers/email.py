# app/routers/email.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.email import Email, EmailProcessRequest
from ..services.email_service import EmailService
from ..middleware.auth import get_current_user  # Import the auth middleware

router = APIRouter()
email_service = EmailService()

@router.get("/", response_model=List[Email])
async def get_emails(current_user: dict = Depends(get_current_user)):
    return await email_service.get_all(current_user)

@router.post("/", response_model=Email)
async def create_email(
    email: Email,
    current_user: dict = Depends(get_current_user)
):
    return await email_service.create(email, current_user)

@router.post("/process")
async def process_emails(
    request: EmailProcessRequest,
    current_user: dict = Depends(get_current_user)
):
    processed = await email_service.mark_as_processed(request.email_ids, current_user)
    if not processed:
        raise HTTPException(status_code=404, detail="No emails were processed")
    return {"message": "Emails marked as processed"}