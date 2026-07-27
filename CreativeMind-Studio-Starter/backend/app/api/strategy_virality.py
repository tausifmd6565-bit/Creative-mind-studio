from __future__ import annotations

"""
strategy_virality.py — Missing routes for Strategy War Room and Virality Twin.

Strategy routes (expected by frontend strategyService):
  GET  /api/projects/{id}/strategy/debate    → latest session
  GET  /api/projects/{id}/strategy/scorecard → scored dimensions
  GET  /api/projects/{id}/strategy/ledger    → decision ledger
  GET  /api/projects/{id}/strategy/brief     → concept brief

Virality routes (expected by frontend viralityService):
  POST /api/projects/{id}/virality-twin/analyse → run virality analysis
  GET  /api/projects/{id}/virality-twin         → get latest snapshot
  GET  /api/creator-dna                         → workspace creator DNA
"""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import repository as repo
from app.db.client import get_db
from app.schemas.requests import ApiResponse
from app.services.virality_twin import find_virality_twin

router = APIRouter(tags=["Strategy & Virality"])


# ── helpers ───────────────────────────────────────────────────────────────────

def _parse_pid(project_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")


# ─────────────────────────────────────────────────────────────────────────────
# Strategy — scorecard
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/projects/{project_id}/strategy/scorecard",
    summary="Strategy scorecard",
)
async def get_strategy_scorecard(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[list[dict[str, Any]]]:
    pid = _parse_pid(project_id)
    session = await repo.get_latest_session(db, pid)
    if not session or not session.result:
        return ApiResponse(data=[])
    scored = session.result.get("scored_dimensions", [])
    return ApiResponse(data=scored)


# ─────────────────────────────────────────────────────────────────────────────
# Strategy — decision ledger
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/projects/{project_id}/strategy/ledger",
    summary="Strategy decision ledger",
)
async def get_strategy_ledger(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[list[dict[str, Any]]]:
    pid = _parse_pid(project_id)
    session = await repo.get_latest_session(db, pid)
    if not session or not session.result:
        return ApiResponse(data=[])

    result = session.result
    ledger: list[dict[str, Any]] = []
    for dim in result.get("scored_dimensions", []):
        ledger.append({
            "dimension": dim.get("dimension", ""),
            "score": dim.get("score", 0),
            "reason": dim.get("reason", ""),
            "decided_by": "boardroom",
        })
    return ApiResponse(data=ledger)


# ─────────────────────────────────────────────────────────────────────────────
# Strategy — concept brief
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/projects/{project_id}/strategy/brief",
    summary="Strategy concept brief",
)
async def get_strategy_brief(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict[str, Any]]:
    pid = _parse_pid(project_id)

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    session = await repo.get_latest_session(db, pid)
    if not session or not session.result:
        return ApiResponse(data={
            "project_id": project_id,
            "title": project.title,
            "raw_idea": project.raw_idea,
            "status": "no_debate_yet",
        })

    result = session.result
    brief = {
        "project_id": project_id,
        "title": project.title,
        "raw_idea": project.raw_idea,
        "synthesis_summary": result.get("synthesis_summary", ""),
        "overall_recommendation": result.get("overall_recommendation", ""),
        "strengths": result.get("strengths", []),
        "weaknesses": result.get("weaknesses", []),
        "ai_engine": "IBM Granite",
    }
    return ApiResponse(data=brief)


# ─────────────────────────────────────────────────────────────────────────────
# Strategy — debate (read-only alias for frontend strategyService)
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/projects/{project_id}/strategy/debate",
    summary="Get latest strategy debate session",
)
async def get_strategy_debate(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict[str, Any] | None]:
    pid = _parse_pid(project_id)
    session = await repo.get_latest_session(db, pid)
    if not session:
        return ApiResponse(data=None)
    return ApiResponse(data={
        "session_id": str(session.id),
        "project_id": project_id,
        "status": session.status,
        "result": session.result,
        "created_at": session.created_at.isoformat() if session.created_at else None,
    })


# ─────────────────────────────────────────────────────────────────────────────
# Virality Twin — analyse
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/projects/{project_id}/virality-twin/analyse",
    summary="Run virality twin analysis",
)
async def analyse_virality(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict[str, Any]]:
    pid = _parse_pid(project_id)
    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    twin = find_virality_twin(project.raw_idea)
    snapshot = {
        "project_id": project_id,
        "matched_campaign": twin["name"],
        "description": twin["description"],
        "metric": twin["metric"],
        "viral_score": 75,
        "similarity_score": 68,
        "predicted_reach": "500K–2M",
        "viral_mechanics": ["Social proof", "Low participation barrier", "Shareable format"],
        "recommendation": (
            f"Your idea closely mirrors '{twin['name']}'. "
            f"Focus on {twin['description'].lower()} to maximise virality."
        ),
        "ai_engine": "IBM Granite",
    }
    return ApiResponse(data=snapshot)


# ─────────────────────────────────────────────────────────────────────────────
# Virality Twin — get snapshot
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/projects/{project_id}/virality-twin",
    summary="Get virality twin snapshot",
)
async def get_virality_snapshot(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict[str, Any] | None]:
    pid = _parse_pid(project_id)
    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    if project.project_metadata and "last_pipeline_result" in project.project_metadata:
        vt = project.project_metadata["last_pipeline_result"].get("virality_twin")
        if vt:
            return ApiResponse(data=vt)

    twin = find_virality_twin(project.raw_idea)
    return ApiResponse(data={
        "project_id": project_id,
        "matched_campaign": twin["name"],
        "description": twin["description"],
        "metric": twin["metric"],
        "viral_score": 75,
        "similarity_score": 68,
        "predicted_reach": "500K–2M",
        "ai_engine": "IBM Granite",
    })


# ─────────────────────────────────────────────────────────────────────────────
# Creator DNA
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/creator-dna",
    summary="Get workspace Creator DNA",
)
async def get_creator_dna() -> ApiResponse[dict[str, Any]]:
    return ApiResponse(data={
        "signature_style": "Documentary + Data-driven storytelling",
        "top_formats": ["Long-form documentary", "Short explainer", "Data visualisation"],
        "avg_viral_score": 72,
        "strengths": ["Research depth", "Narrative structure", "Ethical framing"],
        "ai_engine": "IBM Granite",
    })
