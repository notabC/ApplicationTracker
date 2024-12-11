import os
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET", "change_this_to_a_secure_random_value")
ALGORITHM = "HS256"

def create_jwt_for_user(user: dict):
    # user is a dict containing user's id, email, etc.
    expiration = datetime.utcnow() + timedelta(hours=1)
    payload = {
        "sub": user.id,
        "exp": expiration,
        "email": user.email
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
