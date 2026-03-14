"""Auth routes — thin wrappers around Supabase auth so the frontend can call a
single API rather than talking to Supabase directly."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/auth", tags=["auth"])


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def sign_up(body: SignUpRequest):
    client = get_supabase_client()
    response = client.auth.sign_up({"email": body.email, "password": body.password})
    if response.user is None:
        raise HTTPException(status_code=400, detail="Sign-up failed")
    return {"message": "Check your email to confirm your account", "user_id": response.user.id}


@router.post("/signin")
async def sign_in(body: SignInRequest):
    client = get_supabase_client()
    response = client.auth.sign_in_with_password({"email": body.email, "password": body.password})
    if response.user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "token_type": "bearer",
    }


@router.post("/signout")
async def sign_out(access_token: str):
    client = get_supabase_client()
    client.auth.sign_out()
    return {"message": "Signed out"}
