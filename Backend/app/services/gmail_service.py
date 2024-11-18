# app/services/gmail_service.py
import base64
from bs4 import BeautifulSoup
from app.models.email import Email
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from typing import List, Optional
import os
from ..models.gmail import GmailCredentials, GmailFetchParams
from ..database import get_database

class GmailService:
    def __init__(self):
        self.collection_name = "gmail_credentials"
        self.client_config = self._load_client_config()
        
    def _load_client_config(self):
        # Load from environment variable or file
        return {
            "web": {
                "client_id": os.getenv("GMAIL_CLIENT_ID"),
                "client_secret": os.getenv("GMAIL_CLIENT_SECRET"),
                "redirect_uris": [os.getenv("GMAIL_REDIRECT_URI")],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

    def create_auth_url(self, user_id: str) -> str:
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

        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=user_id
        )
        return auth_url

    async def store_credentials(self, user_id: str, flow: Flow, code: str) -> GmailCredentials:
        token = flow.fetch_token(code=code)
        creds = flow.credentials  # Use flow.credentials instead of creating new Credentials
        
        credentials = GmailCredentials(
            user_id=user_id,
            access_token=creds.token,
            refresh_token=creds.refresh_token,
            token_expiry=datetime.fromtimestamp(creds.expiry.timestamp()),
            email=self._get_user_email(creds)
        )
        
        db = await get_database()
        await db[self.collection_name].update_one(
            {"user_id": user_id},
            {"$set": credentials.model_dump()},
            upsert=True
        )
        return credentials

    def _get_user_email(self, credentials: Credentials) -> str:
        service = build("gmail", "v1", credentials=credentials)
        profile = service.users().getProfile(userId="me").execute()
        return profile["emailAddress"]

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

    async def fetch_emails(self, user_id: str, params: GmailFetchParams) -> List[Email]:
        db = await get_database()
        creds_doc = await db[self.collection_name].find_one({"user_id": user_id})
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
        
        messages = []
        response = service.users().messages().list(
            userId="me",
            q=query,
            maxResults=params.limit
        ).execute()

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
                date=date
            ))
            
        return messages

    def _build_search_query(self, params: GmailFetchParams) -> str:
        query_parts = []
        
        if params.tags:
            query_parts.extend(f"label:{tag}" for tag in params.tags)
        
        if params.start_date:
            query_parts.append(f"after:{params.start_date.strftime('%Y/%m/%d')}")
            
        if params.end_date:
            query_parts.append(f"before:{params.end_date.strftime('%Y/%m/%d')}")
            
        if params.search_query:
            query_parts.append(params.search_query)
            
        return " ".join(query_parts)

    def _parse_email(self, email: dict) -> dict:
        headers = {h["name"]: h["value"] for h in email["payload"]["headers"]}
        return {
            "id": email["id"],
            "subject": headers.get("Subject", ""),
            "from": headers.get("From", ""),
            "date": headers.get("Date", ""),
            "snippet": email["snippet"]
        }
