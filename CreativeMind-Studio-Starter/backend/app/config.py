from __future__ import annotations

from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_HERE = Path(__file__).resolve().parent.parent
_ENV_FILE = _HERE / ".env" if (_HERE / ".env").exists() else _HERE.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── AI Provider selection ─────────────────────────────────────────────────
    # Options: "groq" | "openai" | "grok" | "replicate" | "watsonx"
    AI_PROVIDER: str = "watsonx"

    # ── Groq  (FREE — https://console.groq.com) ───────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # ── Grok / OpenAI / Compatible LLM API ────────────────────────────────────
    OPENAI_API_KEY: str = ""
    GROK_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_BASE_URL: str = ""

    # ── IBM Granite via Replicate  (FREE — https://replicate.com) ────────────
    REPLICATE_API_TOKEN: str = ""
    REPLICATE_MODEL: str = "ibm-granite/granite-3.3-8b-instruct"

    # ── IBM watsonx.ai  (Paid — original) ────────────────────────────────────
    WATSONX_API_KEY: str = ""
    WATSONX_PROJECT_ID: str = ""
    WATSONX_URL: str = "https://us-south.ml.cloud.ibm.com"
    WATSONX_MODEL_ID: str = "ibm/granite-4-h-small"

    # ── Shared model params ───────────────────────────────────────────────────
    GRANITE_TIMEOUT_SECONDS: int = 60
    GRANITE_MAX_NEW_TOKENS: int = 1024
    GRANITE_TEMPERATURE: float = 0.7

    # ── Supabase / PostgreSQL ─────────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    DATABASE_URL_SYNC: str = "sqlite:///./dev.db"

    # ── Application ───────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    DEBUG: bool = False
    APP_VERSION: str = "0.1.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: object) -> str:
        if isinstance(v, list):
            return ",".join(v)
        return str(v)

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"


settings = Settings()