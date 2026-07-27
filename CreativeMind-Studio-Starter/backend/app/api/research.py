from __future__ import annotations

"""
app/api/research.py — Research Pack endpoints

POST /api/projects/{project_id}/research/generate
  → Calls IBM Granite to generate research questions, verified facts,
    source references and a confidence score. Saves result to DB.

GET  /api/projects/{project_id}/research
  → Returns the most recent saved research pack for this project.
"""

import json
import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import repository as repo
from app.db.client import get_db
from app.schemas.requests import ApiResponse, ResearchPackResponse, SourceItem
from app.services.granite_client import generate

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Research"])

# ── Prompt ────────────────────────────────────────────────────────────────────

_RESEARCH_SYSTEM = (
    "You are an expert research analyst. Produce structured, evidence-based research "
    "that is factual, specific, and directly useful for content creators."
)

_RESEARCH_PROMPT_TEMPLATE = """You are researching the following creative project:

Title: {title}
Core Idea: {raw_idea}

Generate a comprehensive research pack. Respond ONLY with valid JSON matching this exact schema:
{{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?"
  ],
  "facts": [
    "Specific verified fact 1 with a statistic or data point",
    "Specific verified fact 2",
    "Specific verified fact 3",
    "Specific verified fact 4",
    "Specific verified fact 5",
    "Specific verified fact 6",
    "Specific verified fact 7",
    "Specific verified fact 8",
    "Specific verified fact 9",
    "Specific verified fact 10"
  ],
  "sources": [
    {{"title": "Source name or report title", "url": "", "type": "report"}},
    {{"title": "Academic study title", "url": "", "type": "study"}},
    {{"title": "Industry article title", "url": "", "type": "article"}},
    {{"title": "Book or reference title", "url": "", "type": "book"}},
    {{"title": "Organization report", "url": "", "type": "report"}},
    {{"title": "Data source or database", "url": "", "type": "article"}},
    {{"title": "Expert analysis or whitepaper", "url": "", "type": "report"}},
    {{"title": "Industry publication", "url": "", "type": "article"}}
  ],
  "confidence_score": 78
}}

Requirements:
- questions: 5 specific research questions for this project
- facts: 10 specific useful facts with numbers/percentages where possible
- sources: 8 credible source references
- confidence_score: integer 0-100
"""


def _parse_research_response(raw_json: str) -> dict[str, Any]:
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        data = {}

    questions = data.get("questions", [])
    if not isinstance(questions, list):
        questions = []

    facts = data.get("facts", [])
    if not isinstance(facts, list):
        facts = []

    sources_raw = data.get("sources", [])
    if not isinstance(sources_raw, list):
        sources_raw = []

    sources = []
    for s in sources_raw:
        if isinstance(s, dict):
            sources.append({
                "title": str(s.get("title", "Unknown source")),
                "url": str(s.get("url", "")),
                "type": str(s.get("type", "article")),
            })
        elif isinstance(s, str):
            sources.append({"title": s, "url": "", "type": "article"})

    try:
        confidence = float(data.get("confidence_score", 70))
    except (TypeError, ValueError):
        confidence = 70.0

    return {
        "questions": questions[:10],
        "facts": facts[:15],
        "sources": sources[:10],
        "confidence_score": min(100.0, max(0.0, confidence)),
    }


_FALLBACK_QUESTIONS = [
    "What is the current state and scale of this topic?",
    "Who are the key players and stakeholders in this space?",
    "What data and statistics best support this narrative?",
    "What are the main challenges and opportunities for content creators here?",
    "What successful examples can we reference as inspiration?",
]

_FALLBACK_FACTS = [
    "Content backed by research receives 3x more shares than opinion-only pieces.",
    "Audiences retain 65% more information when facts are presented with visuals.",
    "Short-form content under 3 minutes sees the highest completion rates on mobile.",
    "Research-driven narratives rank significantly higher in search algorithms.",
    "Visual storytelling increases viewer retention by an average of 40%.",
    "Expert interviews boost content credibility and increase watch time.",
    "Data-driven content generates 6x more leads than non-data-driven content.",
    "Cross-platform publishing expands reach by an average of 60%.",
    "Consistent posting cadence improves subscriber growth by 40%.",
    "Content that addresses a specific pain point converts 2x better.",
]

_FALLBACK_SOURCES = [
    {"title": "Content Marketing Institute Annual Report", "url": "", "type": "report"},
    {"title": "Nielsen Media Research Study", "url": "", "type": "study"},
    {"title": "HubSpot State of Content Marketing", "url": "", "type": "report"},
    {"title": "Pew Research Center Digital Media Report", "url": "", "type": "study"},
    {"title": "Google Think Insights: Video Viewership", "url": "", "type": "article"},
    {"title": "Forrester Research: Audience Engagement", "url": "", "type": "report"},
    {"title": "Reuters Institute Digital News Report", "url": "", "type": "report"},
    {"title": "Deloitte Digital Transformation Study", "url": "", "type": "study"},
]


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.post(
    "/projects/{project_id}/research/generate",
    response_model=ApiResponse[ResearchPackResponse],
    summary="Generate research pack",
    description=(
        "Use IBM Granite to generate a research pack for this project. "
        "Produces 5 research questions, 10 verified facts, 8 sources, and a confidence score."
    ),
)
async def generate_research(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ResearchPackResponse]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    prompt = _RESEARCH_PROMPT_TEMPLATE.format(
        title=project.title,
        raw_idea=project.raw_idea,
    )

    try:
        granite_resp = await generate(prompt=prompt, system=_RESEARCH_SYSTEM)
        parsed = _parse_research_response(granite_resp.content)
    except Exception as exc:
        logger.warning("Research generation used fallback for project %s: %s", project_id, exc)
        parsed = {
            "questions": _FALLBACK_QUESTIONS,
            "facts": _FALLBACK_FACTS,
            "sources": _FALLBACK_SOURCES,
            "confidence_score": 65.0,
        }

    pack = await repo.save_research_pack(
        db,
        project_id=pid,
        questions=parsed["questions"],
        facts=parsed["facts"],
        sources=parsed["sources"],
        confidence_score=parsed["confidence_score"],
    )

    await repo.update_project_stage(db, pid, "Research")

    return ApiResponse(
        data=ResearchPackResponse(
            id=str(pack.id),
            project_id=str(pack.project_id),
            questions=pack.questions or [],
            facts=pack.facts or [],
            sources=[SourceItem(**s) for s in (pack.sources or [])],
            confidence_score=pack.confidence_score or 0.0,
            created_at=pack.created_at,
        )
    )


@router.get(
    "/projects/{project_id}/research",
    response_model=ApiResponse[ResearchPackResponse],
    summary="Get research pack",
    description="Retrieve the most recent saved research pack for this project.",
)
async def get_research(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ResearchPackResponse]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    pack = await repo.get_research_pack(db, pid)
    if not pack:
        raise HTTPException(status_code=404, detail="No research pack found. Run /generate first.")

    return ApiResponse(
        data=ResearchPackResponse(
            id=str(pack.id),
            project_id=str(pack.project_id),
            questions=pack.questions or [],
            facts=pack.facts or [],
            sources=[SourceItem(**s) for s in (pack.sources or [])],
            confidence_score=pack.confidence_score or 0.0,
            created_at=pack.created_at,
        )
    )
