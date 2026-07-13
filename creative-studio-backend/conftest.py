"""
conftest.py — loaded automatically by pytest before any test file.
Bootstraps the environment so tests can import app modules without a local .env.
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend folder, falling back to the workspace root
_here = Path(__file__).resolve().parent          # creative-studio-backend/
_env_local = _here / ".env"
_env_parent = _here.parent / ".env"              # workspace root

if _env_local.exists():
    load_dotenv(_env_local, override=False)
elif _env_parent.exists():
    load_dotenv(_env_parent, override=False)

# Override DB settings for tests — use in-memory SQLite so no live DB needed
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL_SYNC", "sqlite:///:memory:")
