from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from sqlalchemy import text
from app.db.client import engine
from app.db.models import Base

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook with graceful exception handling."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            alter_statements = [
                "ALTER TABLE research_packs ADD COLUMN IF NOT EXISTS questions JSON;",
                "ALTER TABLE research_packs ADD COLUMN IF NOT EXISTS facts JSON;",
                "ALTER TABLE research_packs ADD COLUMN IF NOT EXISTS sources JSON;",
                "ALTER TABLE research_packs ADD COLUMN IF NOT EXISTS confidence_score FLOAT;",
                "ALTER TABLE creative_blueprints ADD COLUMN IF NOT EXISTS narrative TEXT;",
                "ALTER TABLE creative_blueprints ADD COLUMN IF NOT EXISTS script TEXT;",
                "ALTER TABLE creative_blueprints ADD COLUMN IF NOT EXISTS scenes JSON;",
                "ALTER TABLE creative_blueprints ADD COLUMN IF NOT EXISTS broll JSON;",
                "ALTER TABLE creative_blueprints ADD COLUMN IF NOT EXISTS editing_notes TEXT;",
                "ALTER TABLE creative_blueprints ADD COLUMN IF NOT EXISTS platform_adaptations JSON;",
                "ALTER TABLE creative_blueprints ADD COLUMN IF NOT EXISTS production_timeline JSON;",
            ]
            for stmt in alter_statements:
                try:
                    await conn.execute(text(stmt))
                except Exception:
                    pass
    except Exception as e:
        logger.warning("Lifespan DB setup warning (continuing startup): %s", e)
    yield


def create_app() -> FastAPI:
    application = FastAPI(
        title="CreativeMind Studio — Silent Killer",
        description=(
            "IBM Granite-powered multi-agent boardroom debate API. "
            "Submit a raw creative idea and receive a structured, validated analysis "
            "from a panel of AI agents powered by IBM watsonx.ai."
        ),
        version=settings.APP_VERSION,
        contact={
            "name": "CreativeMind Studio",
        },
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Enable CORS for all origins — Vercel frontend → Render backend
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    from app.api import (
        blueprint,
        boardroom,
        endpoints_sprint2,
        export,
        health,
        pipeline,
        projects,
        research,
        strategy_virality,
        workflow,
        generate,
    )

    application.include_router(health.router)
    application.include_router(projects.router, prefix="/api")
    application.include_router(boardroom.router, prefix="/api")
    application.include_router(research.router, prefix="/api")
    application.include_router(blueprint.router, prefix="/api")
    application.include_router(export.router, prefix="/api")
    application.include_router(endpoints_sprint2.router, prefix="/api")
    application.include_router(workflow.router, prefix="/api")
    application.include_router(pipeline.router, prefix="/api")
    application.include_router(strategy_virality.router, prefix="/api")
    application.include_router(generate.router, prefix="/api")

    return application


app = create_app()
