from __future__ import annotations

"""
app/api/blueprint.py — Creative Blueprint endpoints

POST /api/projects/{project_id}/blueprint/generate
  → Uses approved strategy as context to call IBM Granite.
    Generates: narrative arc, full script, scene breakdown, B-roll list,
    editing notes, platform adaptations, production timeline.
    Saves to DB and returns.

GET /api/projects/{project_id}/blueprint
  → Returns the most recent saved creative blueprint.
"""

import json
import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import repository as repo
from app.db.client import get_db
from app.schemas.requests import ApiResponse, BlueprintResponse, SceneItem, TimelinePhase
from app.services.granite_client import generate

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Blueprint"])

_BLUEPRINT_SYSTEM = (
    "You are an award-winning Creative Director and Script Writer. "
    "Produce detailed, production-ready creative blueprints that are "
    "specific, actionable, and directly usable by a production team."
)

_BLUEPRINT_PROMPT_TEMPLATE = """Create a full Creative Blueprint for this project:

Title: {title}
Core Idea: {raw_idea}
Strategy: {strategy_summary}
Research: {research_context}

Respond ONLY with valid JSON:
{{
  "narrative": "3-act narrative arc. Act 1: Setup — [description]. Act 2: Development — [description]. Act 3: Resolution — [description].",
  "script": "OPENING (0:00-0:30)\\nHook: [compelling opening]\\n\\nSECTION 1 (0:30-3:00)\\n[content]\\n\\nSECTION 2 (3:00-6:00)\\n[content]\\n\\nSECTION 3 (6:00-8:30)\\n[content]\\n\\nCLOSING (8:30-9:00)\\nCTA: [call to action]",
  "scenes": [
    {{"scene_number": 1, "title": "Opening Hook", "duration": "0:00-0:30", "description": "[scene description]", "broll": ["shot 1", "shot 2"], "notes": "[director notes]"}},
    {{"scene_number": 2, "title": "Introduction", "duration": "0:30-2:00", "description": "[scene description]", "broll": ["shot 1"], "notes": "[notes]"}},
    {{"scene_number": 3, "title": "Core Content", "duration": "2:00-5:00", "description": "[scene description]", "broll": ["shot 1", "shot 2"], "notes": "[notes]"}},
    {{"scene_number": 4, "title": "Evidence & Examples", "duration": "5:00-7:00", "description": "[scene description]", "broll": ["shot 1"], "notes": "[notes]"}},
    {{"scene_number": 5, "title": "Conclusion & CTA", "duration": "7:00-8:30", "description": "[scene description]", "broll": ["shot 1"], "notes": "[notes]"}}
  ],
  "broll": ["specific B-roll shot 1", "specific B-roll shot 2", "specific B-roll shot 3", "specific B-roll shot 4", "specific B-roll shot 5", "specific B-roll shot 6"],
  "editing_notes": "Pacing and editing guidelines. Include music, colour grade, and graphics notes.",
  "platform_adaptations": {{
    "youtube": {{"hook": "[hook strategy]", "format": "[format]", "cta": "[cta]", "notes": "[notes]"}},
    "instagram": {{"hook": "[hook strategy]", "format": "[format]", "cta": "[cta]", "notes": "[notes]"}},
    "linkedin": {{"hook": "[hook strategy]", "format": "[format]", "cta": "[cta]", "notes": "[notes]"}}
  }},
  "production_timeline": [
    {{"phase": "Pre-Production", "days": 3, "tasks": ["task 1", "task 2", "task 3"]}},
    {{"phase": "Production", "days": 2, "tasks": ["task 1", "task 2"]}},
    {{"phase": "Post-Production", "days": 5, "tasks": ["task 1", "task 2", "task 3", "task 4"]}},
    {{"phase": "Review & Approval", "days": 2, "tasks": ["task 1", "task 2"]}},
    {{"phase": "Distribution", "days": 1, "tasks": ["task 1", "task 2"]}}
  ]
}}
"""


def _parse_blueprint_response(raw_json: str) -> dict[str, Any]:
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        data = {}

    scenes_raw = data.get("scenes", [])
    scenes = []
    for i, s in enumerate(scenes_raw):
        if isinstance(s, dict):
            scenes.append({
                "scene_number": int(s.get("scene_number", i + 1)),
                "title": str(s.get("title", f"Scene {i + 1}")),
                "duration": str(s.get("duration", "")),
                "description": str(s.get("description", "")),
                "broll": s.get("broll", []) if isinstance(s.get("broll"), list) else [],
                "notes": str(s.get("notes", "")),
            })

    timeline_raw = data.get("production_timeline", [])
    timeline = []
    for t in timeline_raw:
        if isinstance(t, dict):
            timeline.append({
                "phase": str(t.get("phase", "Phase")),
                "days": int(t.get("days", 1)),
                "tasks": t.get("tasks", []) if isinstance(t.get("tasks"), list) else [],
            })

    broll = data.get("broll", [])
    if not isinstance(broll, list):
        broll = []

    pa = data.get("platform_adaptations", {})
    if not isinstance(pa, dict):
        pa = {}

    return {
        "narrative": str(data.get("narrative", "Narrative not generated.")),
        "script": str(data.get("script", "Script not generated.")),
        "scenes": scenes,
        "broll": [str(b) for b in broll],
        "editing_notes": str(data.get("editing_notes", "")),
        "platform_adaptations": pa,
        "production_timeline": timeline,
    }


def _get_strategy_summary(result: dict | None) -> str:
    if not result:
        return "No strategy yet. Generating blueprint from raw idea."
    try:
        synthesis = result.get("synthesis", {})
        if synthesis:
            rec = synthesis.get("final_recommendation", "")
            summary = synthesis.get("executive_summary", "")
            return f"{summary}\nRecommendation: {rec}".strip()
        return "Strategy approved."
    except Exception:
        return "Strategy approved."


def _get_research_context(pack) -> str:
    if not pack:
        return "No research available."
    try:
        facts = (pack.facts or [])[:5]
        return "Key facts:\n" + "\n".join(f"- {f}" for f in facts)
    except Exception:
        return "Research context unavailable."


_FALLBACK_BLUEPRINT: dict[str, Any] = {
    "narrative": (
        "Act 1 — Setup: Open with a compelling hook that immediately establishes "
        "the core question or tension. Introduce the subject and why it matters now. "
        "Act 2 — Development: Explore the key insights through expert perspectives, "
        "data, and real-world examples. Build tension and complexity. "
        "Act 3 — Resolution: Bring clarity to the chaos. Deliver actionable takeaways "
        "and a strong call to action that leaves the audience inspired."
    ),
    "script": (
        "OPENING (0:00-0:30)\n"
        "Hook: [Start with your most compelling fact or question]\n\n"
        "SECTION 1 (0:30-3:00)\n"
        "Establish the context and why this topic matters to your audience.\n\n"
        "SECTION 2 (3:00-6:00)\n"
        "Present the core insights, data, and evidence.\n\n"
        "SECTION 3 (6:00-8:00)\n"
        "Human stories and emotional resonance.\n\n"
        "CLOSING (8:00-9:00)\n"
        "CTA: Subscribe, share, and apply what you've learned today."
    ),
    "scenes": [
        {"scene_number": 1, "title": "Opening Hook", "duration": "0:00-0:30",
         "description": "Cold open with the most compelling fact or provocative question.",
         "broll": ["Close-up establishing shot", "Wide environmental shot"], "notes": "Fast pace, high energy"},
        {"scene_number": 2, "title": "Context Setup", "duration": "0:30-2:30",
         "description": "Introduce the core topic and establish why it matters.",
         "broll": ["Relevant subject B-roll"], "notes": "Set the tone"},
        {"scene_number": 3, "title": "Core Insights", "duration": "2:30-6:00",
         "description": "Present research, data, and key insights.",
         "broll": ["Data visualization", "Expert interview footage"], "notes": "Include motion graphics"},
        {"scene_number": 4, "title": "Human Angle", "duration": "6:00-7:30",
         "description": "Add emotional depth through real stories.",
         "broll": ["Human-focused shots"], "notes": "Warmer colour grade"},
        {"scene_number": 5, "title": "Conclusion & CTA", "duration": "7:30-9:00",
         "description": "Wrap up with clear takeaways and a strong call to action.",
         "broll": ["Closing shot"], "notes": "End on an inspiring note"},
    ],
    "broll": [
        "Wide establishing shot of subject environment",
        "Close-up of key detail or subject interaction",
        "Aerial/overhead shot for context and scale",
        "Emotion-driven reaction shot",
        "Data visualization or animated infographic",
        "Closing cinematic wide shot",
    ],
    "editing_notes": (
        "Pacing: Keep cuts under 3 seconds in the opening. Slow at emotional moments. "
        "Graphics: Motion graphics for all statistics. Lower-thirds for key facts. "
        "Audio: Subtle underscore throughout. Swell at emotional peak. "
        "Colour: Warm tones for human stories. Cool blue for data sections."
    ),
    "platform_adaptations": {
        "youtube": {"hook": "Most surprising fact in first 3 seconds", "format": "Full 8-9 min with chapters", "cta": "Subscribe", "notes": "Optimize thumbnail"},
        "instagram": {"hook": "Bold text overlay on frame 1", "format": "60-sec Reel", "cta": "Save this post", "notes": "Vertical + captions"},
        "linkedin": {"hook": "Professional insight opener", "format": "3-5 min clip", "cta": "Share with network", "notes": "Professional B-roll"},
    },
    "production_timeline": [
        {"phase": "Pre-Production", "days": 3, "tasks": ["Finalise script", "Scout locations", "Book talent"]},
        {"phase": "Production", "days": 2, "tasks": ["Principal photography", "B-roll capture"]},
        {"phase": "Post-Production", "days": 5, "tasks": ["Edit assembly", "Motion graphics", "Colour grade", "Sound mix"]},
        {"phase": "Review & Approval", "days": 2, "tasks": ["Internal review", "Client feedback", "Final revisions"]},
        {"phase": "Distribution", "days": 1, "tasks": ["Upload", "Schedule", "Cross-platform publish"]},
    ],
}


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.post(
    "/projects/{project_id}/blueprint/generate",
    response_model=ApiResponse[BlueprintResponse],
    summary="Generate creative blueprint",
    description=(
        "Use IBM Granite to generate a full Creative Blueprint: narrative, script, "
        "scenes, B-roll, editing notes, platform adaptations, and production timeline."
    ),
)
async def generate_blueprint(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BlueprintResponse]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    session_record = await repo.get_latest_session(db, pid)
    research_pack = await repo.get_research_pack(db, pid)

    prompt = _BLUEPRINT_PROMPT_TEMPLATE.format(
        title=project.title,
        raw_idea=project.raw_idea,
        strategy_summary=_get_strategy_summary(session_record.result if session_record else None),
        research_context=_get_research_context(research_pack),
    )

    try:
        granite_resp = await generate(prompt=prompt, system=_BLUEPRINT_SYSTEM)
        parsed = _parse_blueprint_response(granite_resp.content)
    except Exception as exc:
        logger.warning("Blueprint generation used fallback for project %s: %s", project_id, exc)
        parsed = _FALLBACK_BLUEPRINT

    bp = await repo.save_blueprint(
        db,
        project_id=pid,
        narrative=parsed["narrative"],
        script=parsed["script"],
        scenes=parsed["scenes"],
        broll=parsed["broll"],
        editing_notes=parsed["editing_notes"],
        platform_adaptations=parsed["platform_adaptations"],
        production_timeline=parsed["production_timeline"],
    )

    await repo.update_project_stage(db, pid, "Blueprint")

    return ApiResponse(
        data=BlueprintResponse(
            id=str(bp.id),
            project_id=str(bp.project_id),
            narrative=bp.narrative or "",
            script=bp.script or "",
            scenes=[SceneItem(**s) for s in (bp.scenes or [])],
            broll=bp.broll or [],
            editing_notes=bp.editing_notes or "",
            platform_adaptations=bp.platform_adaptations or {},
            production_timeline=[TimelinePhase(**t) for t in (bp.production_timeline or [])],
            created_at=bp.created_at,
        )
    )


@router.get(
    "/projects/{project_id}/blueprint",
    response_model=ApiResponse[BlueprintResponse],
    summary="Get creative blueprint",
    description="Retrieve the most recent saved creative blueprint.",
)
async def get_blueprint_endpoint(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BlueprintResponse]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    bp = await repo.get_blueprint(db, pid)
    if not bp:
        raise HTTPException(status_code=404, detail="No blueprint found. Run /generate first.")

    return ApiResponse(
        data=BlueprintResponse(
            id=str(bp.id),
            project_id=str(bp.project_id),
            narrative=bp.narrative or "",
            script=bp.script or "",
            scenes=[SceneItem(**s) for s in (bp.scenes or [])],
            broll=bp.broll or [],
            editing_notes=bp.editing_notes or "",
            platform_adaptations=bp.platform_adaptations or {},
            production_timeline=[TimelinePhase(**t) for t in (bp.production_timeline or [])],
            created_at=bp.created_at,
        )
    )
