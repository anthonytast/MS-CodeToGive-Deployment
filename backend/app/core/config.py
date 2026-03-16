from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


# Resolve .env relative to this file: backend/app/core/config.py → ../../.. → repo root
_ENV_FILE = Path(__file__).resolve().parents[3] / ".env"
# Only use .env file if it exists (for local development)
_ENV_FILE_TO_USE = _ENV_FILE if _ENV_FILE.exists() else None


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE_TO_USE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # JWT (used when verifying Supabase JWTs or issuing your own)
    secret_key: str
    supabase_jwt_secret: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: str = "http://localhost:3000"


try:
    settings = Settings()
except Exception as e:
    print(f"ERROR: Failed to load settings: {e}")
    print(f"Missing or invalid environment variables")
    # List which env vars are missing
    required_vars = [
        "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_JWT_SECRET", "SECRET_KEY"
    ]
    for var in required_vars:
        print(f"  {var}: {'✓' if os.getenv(var) else '✗ MISSING'}")
    raise

