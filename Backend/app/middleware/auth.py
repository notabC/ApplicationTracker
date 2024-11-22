# app/middleware/auth.py
from fastapi import Request, HTTPException
from ..services.gmail_service import GmailService
from functools import wraps

gmail_service = GmailService()

async def get_current_user(request: Request):
    user_id = request.headers.get("Authorization")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    auth_status = await gmail_service.check_auth(user_id)
    if not auth_status["isAuthenticated"]:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return auth_status["user"]