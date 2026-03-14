# Backend (FastAPI + Supabase)

## Setup

(Would suggest at least Python 3.11)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Copy the root `.env.example` to `.env` and fill in your values:

```bash
cp ../.env.example ../.env
```

## Run

```bash
uvicorn app.main:app --reload
```

API docs available at http://localhost:8000/docs

## Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app + middleware
│   ├── core/
│   │   ├── config.py        # Settings (reads from root .env)
│   │   ├── supabase.py      # Supabase client factory
│   │   └── auth.py          # JWT dependency for protected routes
│   └── api/
│       └── routes/
│           ├── auth.py      # /api/v1/auth/* (signup, signin, signout)
│           └── health.py    # /health
└── requirements.txt
```

## Using the auth dependency

```python
from app.core.auth import CurrentUser

@router.get("/me")
async def me(user: CurrentUser):
    return {"user_id": user["sub"]}
```
