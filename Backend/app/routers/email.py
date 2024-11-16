# backend/app/routers/email.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class EmailBase(BaseModel):
    subject: str
    body: str
    recipient: str

class EmailResponse(BaseModel):
    message: str
    email_id: str

@router.post("/", response_model=EmailResponse)
async def send_email(email: EmailBase):
    # Implement your email sending logic here
    # This is just a placeholder response
    return EmailResponse(
        message="Email sent successfully",
        email_id="temp_id"
    )

@router.get("/templates", response_model=List[str])
async def get_email_templates():
    # Implement your template fetching logic here
    return ["template1", "template2"]