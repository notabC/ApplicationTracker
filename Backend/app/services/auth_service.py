# app/services/auth_service.py
from datetime import datetime, timedelta
import bcrypt
import jwt
import os
import uuid
from fastapi import HTTPException
from app.database import get_database
from app.models.user import User
from app.models.auth import RegisterRequest, LoginRequest
from app.services.mail_sender_service import MailSenderService

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_to_a_secure_random_value")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60
PASSWORD_RESET_EXPIRATION_MINUTES = 30

class AuthService:
    @staticmethod
    async def register(data: RegisterRequest) -> dict:
        db = await get_database()
        existing_user = await db["users"].find_one({"email": data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use.")

        hashed_pw = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        now = datetime.utcnow()

        # Initialize token_version to 0 for new users
        new_user_data = User(
            email=data.email,
            name=data.name,
            created_at=now,
            last_login=now,
            is_active=True,
            hashed_password=hashed_pw
        ).dict()
        new_user_data["token_version"] = 0  # Add token_version field

        await db["users"].insert_one(new_user_data)
        return {"message": "User registered successfully."}

    @staticmethod
    async def login(data: LoginRequest) -> dict:
        db = await get_database()
        user = await db["users"].find_one({"email": data.email})

        if not user or not user.get("hashed_password"):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        if not bcrypt.checkpw(data.password.encode('utf-8'), user["hashed_password"].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        exp = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
        # Include token_version in the JWT payload
        token_payload = {
            "sub": user["id"],
            "exp": exp,
            "token_version": user.get("token_version", 0)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        await db["users"].update_one({"id": user["id"]}, {"$set": {"last_login": datetime.utcnow()}})
        return {"access_token": token, "token_type": "bearer"}

    @staticmethod
    async def logout() -> dict:
        # Stateless JWT logout means client discards token;
        # If you had a token blacklist or versioning, you'd handle it differently.
        return {"message": "Logged out successfully."}

    @staticmethod
    async def request_password_reset(email: str):
        db = await get_database()
        user = await db["users"].find_one({"email": email})
        if not user:
            # Don't reveal if user exists or not
            return {"message": "If that email is registered, a password reset link will be sent."}

        reset_token = str(uuid.uuid4())
        exp = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_EXPIRATION_MINUTES)

        await db["password_reset_tokens"].insert_one({
            "user_id": user["id"],
            "token": reset_token,
            "expires_at": exp,
            "used": False
        })

        MailSenderService.send_password_reset_email(email, reset_token)
        return {"message": "If that email is registered, a password reset link has been sent."}

    @staticmethod
    async def reset_password(token: str, new_password: str) -> dict:
        db = await get_database()
        record = await db["password_reset_tokens"].find_one({"token": token})
        if not record:
            raise HTTPException(status_code=400, detail="Invalid token")

        if record["used"]:
            raise HTTPException(status_code=400, detail="Token already used")

        if record["expires_at"] < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Token expired")

        hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Increase token_version to invalidate old tokens
        # Fetch the user to get current token_version, increment it
        user = await db["users"].find_one({"id": record["user_id"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        current_version = user.get("token_version", 0)
        new_version = current_version + 1

        await db["users"].update_one({"id": record["user_id"]}, {
            "$set": {
                "hashed_password": hashed_pw,
                "token_version": new_version
            }
        })

        await db["password_reset_tokens"].update_one({"token": token}, {"$set": {"used": True}})
        return {"message": "Password has been reset successfully. All old sessions are now invalid."}