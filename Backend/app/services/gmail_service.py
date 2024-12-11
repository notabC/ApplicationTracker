# app/services/gmail_service.py
import base64
import uuid
from bs4 import BeautifulSoup
from app.models.email import Email
from app.models.user import User
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from datetime import datetime
from typing import List, Optional, Tuple
import os
from ..models.gmail import GmailCredentials, GmailFetchParams
from ..database import get_database

class GmailService:
    def __init__(self):
        self.credentials_collection = "gmail_credentials"
        self.users_collection = "users"
        self.client_config = self._load_client_config()
        
    def _load_client_config(self):
        # Load from environment variables or secure storage
        return {
            "web": {
                "client_id": os.getenv("GMAIL_CLIENT_ID"),
                "client_secret": os.getenv("GMAIL_CLIENT_SECRET"),
                "redirect_uris": [os.getenv("GMAIL_REDIRECT_URI")],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

    async def _get_user_info(self, credentials: Credentials) -> Tuple[str, Optional[str]]:
        """
        Fetch user's email and name from Google API
        Returns tuple of (email, name)
        """
        service = build("oauth2", "v2", credentials=credentials)
        user_info = service.userinfo().get().execute()
        return user_info.get("email"), user_info.get("name")

    async def store_credentials(self, flow: Flow, code: str) -> Tuple[GmailCredentials, User]:
        # Exchange authorization code
        flow.fetch_token(code=code)
        creds = flow.credentials
        email, name = await self._get_user_info(creds)

        db = await get_database()

        # Find user by email instead of user_id
        existing_user = await db[self.users_collection].find_one({"email": email})
        if not existing_user:
            raise ValueError("User does not exist. Please register before linking Gmail account.")

        # Update Gmail credentials keyed by email instead of user_id
        credentials = GmailCredentials(
            user_id=existing_user["id"],  # We can still store it if needed, but not as the primary key
            access_token=creds.token,
            refresh_token=creds.refresh_token,
            token_expiry=creds.expiry,
            email=email
        )
        # Instead of {"user_id": user_id}, we use {"email": email} as our unique query
        await db[self.credentials_collection].update_one(
            {"email": email},
            {"$set": credentials.model_dump()},
            upsert=True
        )

        # Update user's last_login and name by email
        now = datetime.utcnow()
        await db[self.users_collection].update_one(
            {"email": email},
            {
                "$set": {
                    "name": name,
                    "last_login": now,
                    "email": email
                }
            }
        )

        updated_user = await db[self.users_collection].find_one({"email": email})
        return credentials, User(**updated_user)

    async def logout(self, user_id: str) -> None:
        """
        Handle user logout by removing credentials but keeping user account
        """
        db = await get_database()
        # Only remove credentials, keep user account
        result = await db[self.credentials_collection].delete_one({"user_id": user_id})
        if result.deleted_count == 0:
            raise ValueError("User not found")

    async def check_auth(self, user_id: str) -> dict:
        """
        Check authentication status and return user info
        """
        db = await get_database()
        creds = await db[self.credentials_collection].find_one({"user_id": user_id})
        
        if not creds:
            return {
                "isAuthenticated": False,
                "email": None,
                "user": None
            }
        
        # Look up user by email and return full user object
        user = await db[self.users_collection].find_one({"email": creds["email"]})
        
        return {
            "isAuthenticated": bool(creds),
            "email": creds["email"] if creds else None,
            "user": {
                "id": user["id"],
                "name": user.get("name"),
                "email": user.get("email"),
                "created_at": user.get("created_at")
            } if user else None
        }
    
    def create_auth_url(self) -> str:
        flow = Flow.from_client_config(
            self.client_config,
            scopes=[
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "openid"
            ],
            redirect_uri=self.client_config["web"]["redirect_uris"][0]
        )

        # You can still use state if desired for CSRF protection
        state = str(uuid.uuid4())
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=state
        )
        return auth_url

    def _clean_html(self, html_content: str) -> str:
        """Strips HTML tags and returns plain text."""
        soup = BeautifulSoup(html_content, 'html.parser')
        return soup.get_text(separator=' ', strip=True)

    def _get_email_body(self, message_part) -> str:
        """Recursively extracts and decodes email body from message parts."""
        if message_part.get("body", {}).get("data"):
            data = base64.urlsafe_b64decode(message_part["body"]["data"].encode("UTF-8"))
            return self._clean_html(data.decode("UTF-8"))
        
        if message_part.get("parts"):
            text_content = []
            for part in message_part["parts"]:
                # Prefer text/plain over text/html
                if part["mimeType"] == "text/plain":
                    if part["body"].get("data"):
                        data = base64.urlsafe_b64decode(part["body"]["data"].encode("UTF-8"))
                        return data.decode("UTF-8")
                elif part["mimeType"] == "text/html":
                    if part["body"].get("data"):
                        data = base64.urlsafe_b64decode(part["body"]["data"].encode("UTF-8"))
                        text_content.append(self._clean_html(data.decode("UTF-8")))
                elif part["mimeType"].startswith("multipart/"):
                    text_content.append(self._get_email_body(part))
            
            return "\n".join(filter(None, text_content))
        
        return ""

    async def fetch_emails(self, user_id: str, user_email: str, params: GmailFetchParams) -> dict:
        db = await get_database()
        creds_doc = await db[self.credentials_collection].find_one({"user_id": user_id})
        if not creds_doc:
            raise ValueError("User not authenticated")
        
        credentials = Credentials(
            token=creds_doc["access_token"],
            refresh_token=creds_doc["refresh_token"],
            token_uri=self.client_config["web"]["token_uri"],
            client_id=self.client_config["web"]["client_id"],
            client_secret=self.client_config["web"]["client_secret"]
        )
        
        service = build("gmail", "v1", credentials=credentials)
        query = self._build_search_query(params)
        
        response = service.users().messages().list(
            userId="me",
            q=query,
            maxResults=params.limit,
            pageToken=params.page_token
        ).execute()

        messages = []
        for msg in response.get("messages", []):
            email = service.users().messages().get(
                userId="me",
                id=msg["id"],
                format="full"
            ).execute()
            
            headers = {h["name"]: h["value"] for h in email["payload"]["headers"]}
            date_str = headers.get("Date", "")
            try:
                date = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
            except ValueError:
                try:
                    date = datetime.strptime(date_str, "%d %b %Y %H:%M:%S %z")
                except ValueError:
                    date = datetime.utcnow()
            
            body = self._get_email_body(email["payload"])
            
            messages.append(Email(
                id=email["id"],
                subject=headers.get("Subject", ""),
                body=body,
                sender=headers.get("From", ""),
                date=date,
                user_email=user_email,
                user_id=user_id
            ))
          
        return {
            "emails": messages,
            "nextPageToken": response.get("nextPageToken"),
            "hasMore": bool(response.get("nextPageToken"))
        }
    
    def _build_search_query(self, params: GmailFetchParams) -> str:
        query_parts = []
        
        if params.tags and len(params.tags) > 0:
            # Build the label query
            if len(params.tags) > 1:
                tag_query = " OR ".join(f"label:{tag.strip()}" for tag in params.tags)
                query_parts.append(f"({tag_query})")
            else:
                query_parts.append(f"label:{params.tags[0].strip()}")
        
        if params.start_date:
            query_parts.append(f"after:{params.start_date.strftime('%Y/%m/%d')}")
            
        if params.end_date:
            query_parts.append(f"before:{params.end_date.strftime('%Y/%m/%d')}")
            
        if params.search_query:
            query_parts.append(params.search_query)
        
        final_query = " ".join(query_parts)
        return final_query

    def _parse_email(self, email: dict) -> dict:
        headers = {h["name"]: h["value"] for h in email["payload"]["headers"]}
        return {
            "id": email["id"],
            "subject": headers.get("Subject", ""),
            "from": headers.get("From", ""),
            "date": headers.get("Date", ""),
            "snippet": email["snippet"]
        }
