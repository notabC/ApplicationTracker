import os
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET", "change_this_to_a_secure_random_value")
ALGORITHM = "HS256"

def create_jwt_for_user(user: dict):
    token_version = user.token_version
    exp = datetime.utcnow() + timedelta(minutes=60)
    payload = {
        "sub": user.id,
        "exp": exp,
        "token_version": token_version
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
