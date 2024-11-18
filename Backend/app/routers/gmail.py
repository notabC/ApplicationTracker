
# app/routers/gmail.py
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import HTMLResponse, RedirectResponse
from app.database import get_database
from google_auth_oauthlib.flow import Flow
from typing import Optional, List
from datetime import datetime
from ..models.gmail import GmailFetchParams
from ..services.gmail_service import GmailService
from app.config import settings

router = APIRouter()
gmail_service = GmailService()

@router.get("/auth/url")
async def get_auth_url(user_id: str):
    return {"url": gmail_service.create_auth_url(user_id)}

@router.get("/auth/callback")
async def auth_callback(code: str, state: str):
    try:
        flow = Flow.from_client_config(
            gmail_service.client_config,
            scopes=[
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "openid"
            ],
            redirect_uri=gmail_service.client_config["web"]["redirect_uris"][0]
        )
        
        await gmail_service.store_credentials(state, flow, code)
        
        return RedirectResponse(url=f"{settings.FRONTEND_URL}")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/emails")
async def fetch_emails(
    user_id: str,
    tags: Optional[List[str]] = Query(None),
    start_date: Optional[str] = None,  # Changed to str
    end_date: Optional[str] = None,    # Changed to str
    search_query: Optional[str] = None,
    limit: Optional[int] = 20
):
    try:
        params = GmailFetchParams(
            tags=tags,
            start_date=datetime.fromisoformat(start_date) if start_date else None,
            end_date=datetime.fromisoformat(end_date) if end_date else None,
            search_query=search_query,
            limit=limit
        )
        emails = await gmail_service.fetch_emails(user_id, params)
        return emails
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout/{user_id}")
async def logout(user_id: str):
    db = await get_database()
    result = await db["gmail_credentials"].delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Logged out successfully"}

@router.get("/check-auth")
async def check_auth(user_id: str):
    db = await get_database()
    creds = await db["gmail_credentials"].find_one({"user_id": user_id})
    return {
        "isAuthenticated": bool(creds),
        "email": creds["email"] if creds else None
    }