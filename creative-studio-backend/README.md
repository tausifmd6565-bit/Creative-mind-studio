# CreativeMind Studio — Silent Killer Backend

IBM Granite-powered multi-agent boardroom debate API. Submit a raw creative idea and receive a structured, validated analysis from a panel of AI agents powered by **IBM watsonx.ai (Granite 4)**.

---

## Overview

The Silent Killer backend is a Python + FastAPI service that:

1. Accepts a raw creative idea via REST API
2. Runs it through a **LangGraph**-orchestrated debate with IBM Granite agents
3. Persists everything to **Supabase** (Postgres)
4. Returns fully validated JSON — the frontend never sees raw model text

**AI Engine:** `ibm/granite-4-h-small` via IBM watsonx.ai  
**Sprint 1 agents:** Creative Director → Risk Critic → Technical/Market Agent → Synthesis

---

## Requirements

- **Python 3.11+**
- **IBM watsonx.ai** account with a project and API key → [cloud.ibm.com](https://cloud.ibm.com)
- **Supabase** project (free tier is sufficient) → [supabase.com](https://supabase.com)

---

## Setup

### 1. Enter the backend folder

```bash
cd creative-studio-backend
```

### 2. Create and activate a virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -e ".[dev]"
# or
make install
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in these required values:

| Variable | Where to get it |
|---|---|
| `WATSONX_API_KEY` | IBM Cloud → Manage → Access (IAM) → API Keys → **Create** |
| `WATSONX_PROJECT_ID` | watsonx.ai → Projects → your project → **Manage** tab → Project ID |
| `WATSONX_URL` | Always `https://us-south.ml.cloud.ibm.com` (or your region) — **not** the dashboard URL |
| `WATSONX_MODEL_ID` | `ibm/granite-4-h-small` |
| `SUPABASE_URL` | Supabase → Settings → API → **Project URL** |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → **service_role** key |
| `DATABASE_URL` | Supabase → Settings → Database → Connection pooling → Session mode → add `+asyncpg` prefix |
| `DATABASE_URL_SYNC` | Same as above without `+asyncpg` (used by Alembic) |

> **Common mistake:** `WATSONX_URL` must be the API endpoint (`https://us-south.ml.cloud.ibm.com`), not the browser dashboard URL.

### 5. Apply database migrations

```bash
make migrate
# or
.venv/Scripts/alembic upgrade head
```

This creates 6 tables in your Supabase project: `projects`, `boardroom_sessions`, `agent_messages`, `scorecards`, `idea_versions`, `follow_ups`.

### 6. Start the development server

```bash
make dev
# or
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at **`http://localhost:8000`**  
OpenAPI docs: **`http://localhost:8000/docs`**

---

## Running Tests

```bash
make test
# or
pytest tests/ -v
```

All 63 tests run against an **in-memory SQLite database** with **mocked IBM Granite calls** — no live credentials needed for the test suite.

---

## Linting

```bash
make lint
```

---

## API Reference (Sprint 1)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Backend, DB and IBM Granite status |
| `POST` | `/api/projects` | Create a project with a raw idea |
| `GET` | `/api/projects/{id}` | Retrieve a project by ID |
| `POST` | `/api/projects/{id}/boardroom` | Run IBM Granite boardroom debate (synchronous) |
| `GET` | `/api/projects/{id}/boardroom` | Retrieve the latest stored debate result |

All responses include `"ai_engine": "IBM Granite"` at the top level.

### Example — Create a project

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title": "AI Hiking App", "raw_idea": "A mobile app that helps people find local hiking trails with AI-powered difficulty ratings and personalised route suggestions."}'
```

### Example — Run boardroom debate

```bash
curl -X POST http://localhost:8000/api/projects/{id}/boardroom
```

Response (truncated):
```json
{
  "project_id": "...",
  "session_id": "...",
  "ai_engine": "IBM Granite",
  "overall_recommendation": "Build",
  "strengths": ["Strong originality", "Clear market gap"],
  "weaknesses": ["High competition", "Privacy concerns"],
  "scored_dimensions": [...],
  "synthesis_summary": "...",
  "debate": [...],
  "fallback_used": false
}
```

---

## Architecture

```
creative-studio-backend/
├── app/
│   ├── config.py            # pydantic-settings — loads and validates .env
│   ├── main.py              # FastAPI app factory, CORS, lifespan, router registration
│   ├── agents/
│   │   ├── base.py          # BaseAgent — shared call_granite(), fallback handling
│   │   ├── creative_director.py   # Originality, emotional direction, key themes
│   │   ├── risk_critic.py         # Risks, assumptions, risk level
│   │   ├── technical_market.py    # Feasibility, cost, market, recommendation
│   │   └── synthesis.py           # Unified summary, scored dimensions, final recommendation
│   ├── api/
│   │   ├── health.py        # GET /health
│   │   ├── projects.py      # POST/GET /api/projects
│   │   └── boardroom.py     # POST/GET /api/projects/{id}/boardroom
│   ├── db/
│   │   ├── models.py        # SQLAlchemy ORM models (6 tables)
│   │   ├── client.py        # Async engine + session factory
│   │   └── repository.py    # CRUD helpers
│   ├── graph/
│   │   ├── state.py         # DebateState TypedDict
│   │   └── graph.py         # LangGraph StateGraph + build_boardroom_result()
│   └── schemas/
│       ├── granite.py       # GraniteResponse
│       ├── agents.py        # Per-agent Pydantic output schemas
│       ├── boardroom.py     # BoardroomResult (top-level API response)
│       └── requests.py      # Request/response schemas
├── tests/                   # 63 tests — all mocked, no live creds needed
├── alembic/                 # DB migration scripts
├── .env.example             # Template — copy to .env
├── pyproject.toml           # Dependencies + tool config
└── Makefile                 # Developer shortcuts
```

---

## Environment Variables

See [`.env.example`](.env.example) for the full annotated list.

| Variable | Required | Default | Description |
|---|---|---|---|
| `WATSONX_API_KEY` | ✅ | — | IBM Cloud API key |
| `WATSONX_PROJECT_ID` | ✅ | — | watsonx.ai project ID |
| `WATSONX_URL` | ✅ | `https://us-south.ml.cloud.ibm.com` | Regional API endpoint |
| `WATSONX_MODEL_ID` | ✅ | `ibm/granite-4-h-small` | Granite model to use |
| `GRANITE_TIMEOUT_SECONDS` | | `60` | Per-call timeout |
| `GRANITE_MAX_NEW_TOKENS` | | `1024` | Max tokens per response |
| `GRANITE_TEMPERATURE` | | `0.7` | Sampling temperature |
| `SUPABASE_URL` | ✅ | — | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | — | Supabase service role key |
| `DATABASE_URL` | ✅ | — | Async PostgreSQL URL (`+asyncpg`) |
| `DATABASE_URL_SYNC` | ✅ | — | Sync PostgreSQL URL (Alembic only) |
| `APP_ENV` | | `development` | `development` / `staging` / `production` |
| `DEBUG` | | `false` | Enable SQLAlchemy echo logging |
| `CORS_ORIGINS` | | `http://localhost:3000` | Comma-separated allowed origins |
| `APP_VERSION` | | `0.1.0` | Shown in `/health` and `/docs` |

---

## Security Notes

- Never commit `.env` — it is in `.gitignore`
- Use the `service_role` Supabase key **server-side only** — never expose it to clients
- IBM credentials are loaded exclusively from environment variables at startup
- No credentials are logged or returned in any API response
