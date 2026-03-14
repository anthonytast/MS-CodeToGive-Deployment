# Backend (FastAPI + Supabase)

## Setup

(Would suggest at least Python 3.11)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
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
│           ├── auth.py      # /api/v1/auth/* (signup, login, logout)
│           ├── events.py    # /api/v1/events/* (CRUD + nearby resources)
│           ├── admin.py     # /api/v1/admin/* (admin only)
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

---

## API Endpoints

Full interactive docs available at `http://localhost:8000/docs`

### Auth (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | No | Register a new user |
| `POST` | `/api/v1/auth/login` | No | Login and receive JWT |
| `POST` | `/api/v1/auth/logout` | Yes | Logout current user |

### Events (`/api/v1/events`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/events/` | No | List all public events. Filters: `status`, `date_from`, `date_to`, `page`, `limit` |
| `POST` | `/api/v1/events/` | Yes | Create a new flyering event |
| `GET` | `/api/v1/events/my/created` | Yes | Get events created by the current user |
| `GET` | `/api/v1/events/my/joined` | Yes | Get events the current user has signed up for |
| `GET` | `/api/v1/events/{event_id}` | No | Get a single event by ID |
| `PUT` | `/api/v1/events/{event_id}` | Yes (leader only) | Update an event |
| `DELETE` | `/api/v1/events/{event_id}` | Yes (leader only) | Soft-cancel an event |
| `GET` | `/api/v1/events/{event_id}/nearby-resources` | No | Fetch nearby food resources from Lemontree API. Param: `count` (1-10, default 4) |

### Admin (`/api/v1/admin`)

> All admin endpoints require a valid JWT from a user with `role = "admin"`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/analytics` | Yes (admin) | Get total user and event counts |
| `GET` | `/api/v1/admin/users` | Yes (admin) | List all users. Params: `skip`, `limit` |
| `PUT` | `/api/v1/admin/users/{user_id}/role` | Yes (admin) | Update a user's role |
| `GET` | `/api/v1/admin/events` | Yes (admin) | List all events. Params: `skip`, `limit` |
| `DELETE` | `/api/v1/admin/events/{event_id}` | Yes (admin) | Force delete an event |
