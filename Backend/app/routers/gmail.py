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
    

# Add the new Gmail emails endpoint
@router.get("/emails")
async def get_gmail_emails(
    tags: Optional[List[str]] = Query(..., description="List of Gmail labels"),  # Changed to List[str]
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    search_query: Optional[str] = Query("", description="Search query string"),
    limit: int = Query(20, description="Maximum number of emails to return"),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Parse dates if provided
        start_date_obj = None
        end_date_obj = None
        if start_date:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
        
        # Create the params object
        params = GmailFetchParams(
            tags=tags,  # Pass the list directly
            start_date=start_date_obj,
            end_date=end_date_obj,
            search_query=search_query,
            limit=limit
        )
                
        emails = await gmail_service.fetch_emails(
            user_id=current_user["id"],
            user_email=current_user["email"],
            params=params
        )
        
        return emails
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error fetching Gmail emails: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch emails from Gmail")