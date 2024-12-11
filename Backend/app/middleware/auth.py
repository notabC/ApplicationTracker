# app/middleware/auth.py
from fastapi import Request, HTTPException, Depends
import jwt
import os
from app.database import get_database
from datetime import datetime

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_to_a_secure_random_value")
JWT_ALGORITHM = "HS256"

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format. Use 'Bearer <token>'")

    token = auth_header.split(" ")[1]

    # Decode JWT
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = await get_database()
    user = await db["users"].find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is inactive")

    # Return user dict (already in MongoDB dict format)
    return {
        "id": user["id"],
        "name": user.get("name"),
        "email": user.get("email"),
        "created_at": user.get("created_at")
    }