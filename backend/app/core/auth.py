"""Helpers for validating Supabase JWTs in FastAPI route dependencies."""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
) -> dict:
    """Decode and validate a Supabase JWT; return the payload as a dict."""
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.supabase_anon_key,  # Supabase signs JWTs with the JWT secret (anon key for HS256)
            algorithms=[settings.algorithm],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    return payload


CurrentUser = Annotated[dict, Depends(get_current_user)]
