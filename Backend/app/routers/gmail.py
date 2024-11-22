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
from ..middleware.auth import get_current_user  # Import auth middleware

router = APIRouter()
gmail_service = GmailService()

@router.get("/auth/url")
async def get_auth_url(user_id: str):
    """Auth URL endpoint doesn't need auth check"""
    try:
        auth_url = gmail_service.create_auth_url(user_id)
        return {"url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/callback")
async def auth_callback(code: str, state: str):
    """Callback endpoint doesn't need auth check"""
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
        
        credentials, user = await gmail_service.store_credentials(state, flow, code)
        return RedirectResponse(url=f"{settings.FRONTEND_URL}")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/emails")
async def fetch_emails(
    tags: Optional[List[str]] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search_query: Optional[str] = Query(None),
    limit: Optional[int] = Query(20),
    current_user: dict = Depends(get_current_user)  # Add auth dependency
):
    """
    Endpoint to fetch emails based on provided parameters
    """
    try:
        params = GmailFetchParams(
            tags=tags,
            start_date=datetime.fromisoformat(start_date) if start_date else None,
            end_date=datetime.fromisoformat(end_date) if end_date else None,
            search_query=search_query,
            limit=limit
        )
        # Use the user ID from the authenticated user
        emails = await gmail_service.fetch_emails(current_user["id"], current_user["email"], params)
        return emails
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Endpoint to logout a user by removing their Gmail credentials
    """
    try:
        await gmail_service.logout(current_user["id"])
        return {"message": "Logged out successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check-auth")
async def check_auth(user_id: str):
    """
    Auth check endpoint doesn't need auth check as it's used to verify auth
    """
    try:
        auth_status = await gmail_service.check_auth(user_id)
        return auth_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))