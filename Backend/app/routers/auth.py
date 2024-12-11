from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from app.models.auth import LoginRequest, RegisterRequest
from app.database import get_database
from app.models.user import User
import bcrypt
import jwt
import os

# Load from environment variables or config
JWT_SECRET = os.getenv("JWT_SECRET", "change_this_to_a_secure_random_value")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60  # Example: tokens valid for 60 minutes

router = APIRouter()

@router.post("/register")
async def register(data: RegisterRequest):
    db = await get_database()
    existing_user = await db["users"].find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already in use.")

    # Hash the password
    hashed_pw = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    now = datetime.utcnow()
    new_user = User(
        email=data.email,
        name=data.name,
        created_at=now,
        last_login=now,
        is_active=True,
        hashed_password=hashed_pw
    )

    await db["users"].insert_one(new_user.dict())
    return {"message": "User registered successfully."}

@router.post("/login")
async def login(data: LoginRequest):
    db = await get_database()
    user = await db["users"].find_one({"email": data.email})

    if not user or not user.get("hashed_password"):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Verify password
    if not bcrypt.checkpw(data.password.encode('utf-8'), user["hashed_password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Create JWT token
    exp = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    token_payload = {
        "sub": user["id"],
        "exp": exp
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # Update last_login
    await db["users"].update_one({"id": user["id"]}, {"$set": {"last_login": datetime.utcnow()}})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/logout")
async def logout():
    # If using JWT, stateless logout means client just discards token.
    # For stateful revocation, you'd need a token blacklist mechanism.
    # Here we assume client-side token discard.
    return {"message": "Logged out successfully."}
