"""Auth routes — thin wrappers around Supabase auth so the frontend can call a
single API rather than talking to Supabase directly."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from enum import Enum
from app.core.auth import CurrentUser
from app.core.supabase import get_supabase_admin, get_supabase_client

router = APIRouter(prefix="/auth", tags=["auth"])

class Role(Enum):
    LEADER = 'Event leader'
    PARTICIPANT = 'Event participant'
    PROMOTER = 'Event promoter'

class Organization(Enum):
    CORPORATE = 'Corporate'
    LEADERSHIP_GROUP = 'Leadership group'
    STUDENT = 'student'
    OTHER = 'other'

class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    role: Role
    organization: str
    referral: str | None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def sign_up(body: SignUpRequest):
    client = get_supabase_client()
    response = client.auth.sign_up({
        "email": body.email,
        "password": body.password,
        "options": {"data": {"name": body.name}},
    })
    if response.user is None:
        raise HTTPException(status_code=400, detail="Sign-up failed")
    if not response.user.identities:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    admin = get_supabase_admin()
    admin.table("User").insert({
        "Name": body.name,
        "Email": body.email,
        "Role": body.role.value,
    }).execute()

    return {"message": "Check your email to confirm your account", "user_id": response.user.id}


@router.post("/login")
async def log_in(body: LoginRequest):
    client = get_supabase_client()
    response = client.auth.sign_in_with_password({"email": body.email, "password": body.password})
    if response.user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout")
async def log_out(current_user: CurrentUser):
    get_supabase_admin().auth.admin.sign_out(current_user["sub"], scope="global")
    return {"message": "Signed out"}
