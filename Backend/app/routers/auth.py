# app/routers/auth.py
from fastapi import APIRouter, HTTPException
from app.models.auth import LoginRequest, RegisterRequest
from app.services.auth_service import AuthService
from pydantic import BaseModel

router = APIRouter()

class PasswordResetRequest(BaseModel):
    email: str

class FinishResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register")
async def register(data: RegisterRequest):
    return await AuthService.register(data)

@router.post("/login")
async def login(data: LoginRequest):
    return await AuthService.login(data)

@router.post("/logout")
async def logout():
    return await AuthService.logout()

@router.post("/forgot-password")
async def forgot_password(data: PasswordResetRequest):
    return await AuthService.request_password_reset(data.email)

@router.post("/reset-password")
async def reset_password(data: FinishResetPasswordRequest):
    return await AuthService.reset_password(data.token, data.new_password)