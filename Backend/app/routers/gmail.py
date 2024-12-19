# app/routers/gmail.py
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import RedirectResponse
from app.utils import create_jwt_for_user
from app.database import get_database
from google_auth_oauthlib.flow import Flow
from typing import Optional, List
from datetime import datetime
from ..models.gmail import GmailFetchParams
from ..services.gmail_service import GmailService
from app.config import settings
from ..middleware.auth import get_current_user

router = APIRouter()
gmail_service = GmailService()

@router.get("/auth/url")
async def get_auth_url():
    """Auth URL endpoint does not need user_id now"""
    try:
        auth_url = gmail_service.create_auth_url()  # No user_id passed
        return {"url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

        credentials, user = await gmail_service.store_credentials(flow, code)
        jwt_token = create_jwt_for_user(user)

        return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?token={jwt_token}")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    try:
        await gmail_service.logout(current_user["id"])
        return {"message": "Logged out successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check-auth")
async def check_auth(current_user: dict = Depends(get_current_user)):
    result = await gmail_service.check_auth(current_user["id"])
    return result

@router.get("/emails")
async def get_gmail_emails(
    tags: Optional[List[str]] = Query(...),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search_query: Optional[str] = Query(""),
    limit: int = Query(20),
    page_token: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        start_date_obj = None
        end_date_obj = None
        if start_date:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')

        params = GmailFetchParams(
            tags=tags,
            start_date=start_date_obj,
            end_date=end_date_obj,
            search_query=search_query,
            limit=limit,
            page_token=page_token
        )

        result = await gmail_service.fetch_emails(
            user_id=current_user["id"],
            user_email=current_user["email"],
            params=params
        )

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error fetching Gmail emails: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch emails from Gmail")