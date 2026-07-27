from __future__ import annotations

"""
pipeline.py — API endpoints for the full 9-stage AI-powered creative pipeline.

POST /api/projects/{id}/pipeline/run        — Start a new pipeline run
GET  /api/projects/{id}/pipeline/result     — Get the latest pipeline result
"""

import json
import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.pipeline_agents import (
    run_distribution_planner,
    run_editor_blueprint,
    run_final_report,
    run_research_pack,
    run_story_generator,
    run_trend_radar,
    run_virality_twin,
)
from app.db import repository as repo
from app.db.client import get_db
from app.graph.graph import build_boardroom_result, debate_graph
from app.graph.state import DebateState
from app.schemas.boardroom import BoardroomResult
from app.schemas.pipeline import PipelineResult, PipelineRunRequest
from app.schemas.requests import ApiResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Pipeline"])

_AGENT_SEQUENCE = [
    "creative_director",
    "risk_critic",
    "technical_market",
    "audience_analyst",
    "marketing_strategist",
    "ethical_auditor",
    "execution_planner",
    "synthesis",
]


# ---------------------------------------------------------------------------
# Helper: demo presets
# ---------------------------------------------------------------------------
_DEMO_PRESETS: dict[str, dict] = {
    "ai_jobs": {
        "raw_idea": (
            "A 15-minute documentary exploring the human cost of AI automation. "
            "We follow three professionals in different industries whose jobs are being "
            "replaced by AI systems. We ask: What are we optimizing for? And what do we lose "
            "when efficiency becomes the only goal?"
        ),
        "title": "The Invisible Cost of Optimization",
    },
    "ocean_pollution": {
        "raw_idea": (
            "An 18-minute investigative documentary revealing that 80% of ocean plastic waste "
            "comes from just 10 rivers — all in Asia and Africa. We travel to three of these "
            "rivers to understand the systemic infrastructure failures driving the crisis. "
            "The solution isn't individual action — it's industrial policy."
        ),
        "title": "Ten Rivers",
    },
    "electric_vehicles": {
        "raw_idea": (
            "A 20-minute documentary examining the lithium mining boom in South America. "
            "Electric vehicles are the future — but the environmental cost of battery production "
            "is rarely discussed. We visit Chilean salt flats to document the water crisis "
            "caused by lithium extraction. Is this a clean energy transition, or just a new extractive industry?"
        ),
        "title": "The Battery Cost",
    },
}


# ---------------------------------------------------------------------------
# POST /api/projects/{project_id}/pipeline/run — Execute the full 9-stage pipeline
# ---------------------------------------------------------------------------
@router.post(
    "/projects/{project_id}/pipeline/run",
    response_model=ApiResponse[PipelineResult],
    summary="Run the full 9-stage AI pipeline",
    description=(
        "Executes the complete creative pipeline powered by IBM Granite: \n"
        "1. Strategy Debate (boardroom) \n"
        "2. Trend Radar \n"
        "3. Virality Twin \n"
        "4. Research Pack (claims + sources + confidence) \n"
        "5. Story Generator \n"
        "6. Editor Blueprint (time-coded production table) \n"
        "7. Distribution Planner \n"
        "8. Final Report (GO/NO-GO decision)\n\n"
        "All stages are orchestrated sequentially with outputs flowing forward."
    ),
)
async def run_pipeline(
    project_id: str,
    body: PipelineRunRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PipelineResult]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    # Handle demo preset override
    raw_idea = body.raw_idea
    if body.demo_preset and body.demo_preset in _DEMO_PRESETS:
        preset = _DEMO_PRESETS[body.demo_preset]
        raw_idea = preset["raw_idea"]
        project.title = preset["title"]
        project.raw_idea = raw_idea
        await db.flush()

    pipeline_id = str(uuid.uuid4())
    stages_completed: list[str] = []
    result_dict: dict[str, Any] = {
        "project_id": str(pid),
        "pipeline_id": pipeline_id,
        "status": "running",
        "ai_engine": "IBM Granite",
        "stages_completed": stages_completed,
    }

    try:
        # ── Stage 1: Strategy Debate (Boardroom) ───────────────────────────────
        logger.info("Pipeline %s — Stage 1: Strategy Debate", pipeline_id)
        session_record = await repo.create_session(db, project_id=pid, agent_sequence=_AGENT_SEQUENCE)
        await repo.update_session_status(db, session_record.id, status="running")

        seed: DebateState = {
            "project_id": str(pid),
            "session_id": str(session_record.id),
            "raw_idea": raw_idea,
            "messages": [],
            "current_agent": "",
            "creative_director_output": None,
            "risk_critic_output": None,
            "technical_market_output": None,
            "audience_analyst_output": None,
            "marketing_strategist_output": None,
            "ethical_auditor_output": None,
            "execution_planner_output": None,
            "synthesis_output": None,
            "error": None,
            "fallback_used": False,
            "ai_engine": "IBM Granite",
            "pivot_agents": None,
        }
        graph_config = {"configurable": {"thread_id": str(session_record.id)}}

        final_state = await debate_graph.ainvoke(seed, config=graph_config)

        for msg in final_state.get("messages", []):
            await repo.save_message(
                db,
                session_id=session_record.id,
                agent_name=msg["agent_name"],
                role=msg["role"],
                content=msg["content"],
                sequence_order=msg["sequence_order"],
            )

        boardroom_result = build_boardroom_result(final_state)
        boardroom_dict = json.loads(boardroom_result.model_dump_json())
        await repo.update_session_status(
            db,
            session_record.id,
            status="completed",
            result=boardroom_dict,
            fallback_used=final_state.get("fallback_used", False),
        )

        result_dict["strategy"] = boardroom_dict
        stages_completed.append("strategy_debate")

        # ── Stage 2: Trend Radar ───────────────────────────────────────────────
        logger.info("Pipeline %s — Stage 2: Trend Radar", pipeline_id)
        trend_output = await run_trend_radar(raw_idea)
        result_dict["trend_radar"] = trend_output
        stages_completed.append("trend_radar")

        # ── Stage 3: Virality Twin ─────────────────────────────────────────────
        logger.info("Pipeline %s — Stage 3: Virality Twin", pipeline_id)
        virality_output = await run_virality_twin(raw_idea)
        result_dict["virality_twin"] = virality_output
        stages_completed.append("virality_twin")

        # ── Stage 4: Research Pack ─────────────────────────────────────────────
        logger.info("Pipeline %s — Stage 4: Research Pack", pipeline_id)
        research_output = await run_research_pack(raw_idea, boardroom_context=boardroom_dict)
        result_dict["research_pack"] = research_output
        stages_completed.append("research_pack")

        # ── Stage 5: Story Generator ───────────────────────────────────────────
        logger.info("Pipeline %s — Stage 5: Story Generator", pipeline_id)
        story_output = await run_story_generator(raw_idea, research_context=research_output)
        result_dict["story_generator"] = story_output
        stages_completed.append("story_generator")

        # ── Stage 6: Editor Blueprint ──────────────────────────────────────────
        logger.info("Pipeline %s — Stage 6: Editor Blueprint", pipeline_id)
        editor_output = await run_editor_blueprint(raw_idea, story_context=story_output)
        result_dict["editor_blueprint"] = editor_output
        stages_completed.append("editor_blueprint")

        # ── Stage 7: Distribution Planner ──────────────────────────────────────
        logger.info("Pipeline %s — Stage 7: Distribution Planner", pipeline_id)
        distribution_output = await run_distribution_planner(raw_idea, story_context=story_output)
        result_dict["distribution"] = distribution_output
        stages_completed.append("distribution")

        # ── Stage 8: Final Report ──────────────────────────────────────────────
        logger.info("Pipeline %s — Stage 8: Final Report", pipeline_id)
        pipeline_context = {
            "strategy": boardroom_dict,
            "trend_radar": trend_output,
            "virality_twin": virality_output,
            "research_pack": research_output,
            "story_generator": story_output,
        }
        final_report_output = await run_final_report(raw_idea, pipeline_context)
        result_dict["final_report"] = final_report_output
        stages_completed.append("final_report")

        # ── Mark pipeline complete ─────────────────────────────────────────────
        result_dict["status"] = "completed"
        result_dict["stages_completed"] = stages_completed

        logger.info("Pipeline %s completed successfully. %d stages.", pipeline_id, len(stages_completed))

        # Store the full pipeline result in the project metadata
        project.project_metadata = project.project_metadata or {}
        project.project_metadata["last_pipeline_result"] = result_dict
        await db.flush()

        return ApiResponse(data=PipelineResult.model_validate(result_dict))

    except Exception as e:
        logger.error("Pipeline %s failed at stage %s: %s", pipeline_id, len(stages_completed), e)
        result_dict["status"] = "failed"
        result_dict["error"] = str(e)
        result_dict["stages_completed"] = stages_completed
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")


# ---------------------------------------------------------------------------
# GET /api/projects/{project_id}/pipeline/result — Retrieve latest result
# ---------------------------------------------------------------------------
@router.get(
    "/projects/{project_id}/pipeline/result",
    response_model=ApiResponse[PipelineResult],
    summary="Get the latest pipeline result",
    description="Retrieve the most recent full pipeline execution result for this project.",
)
async def get_pipeline_result(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PipelineResult]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    if not project.project_metadata or "last_pipeline_result" not in project.project_metadata:
        raise HTTPException(
            status_code=404,
            detail="No pipeline result found for this project. Run the pipeline first.",
        )

    result_data = project.project_metadata["last_pipeline_result"]
    return ApiResponse(data=PipelineResult.model_validate(result_data))
