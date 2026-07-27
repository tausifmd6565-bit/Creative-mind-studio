from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


# ---------------------------------------------------------------------------
# Generic API envelope  (matches frontend ApiResponse<T>)
# ---------------------------------------------------------------------------
class ApiResponse(BaseModel, Generic[T]):
    data: T
    success: bool = True
    message: str | None = None
    errors: object | None = None


# ---------------------------------------------------------------------------
# Project schemas
# ---------------------------------------------------------------------------
class CreateProjectRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255, description="Project title")
    raw_idea: str = Field(min_length=10, description="The raw creative idea to analyse")
    niche: str | None = None
    format: str | None = None
    team_mode: str = "solo"
    workflow_profile: str = "Standard Production"
    project_metadata: dict[str, Any] | None = None


class ProjectResponse(BaseModel):
    id: str
    title: str
    raw_idea: str
    status: str
    current_stage: str = "Strategy"
    niche: str | None = None
    format: str | None = None
    team_mode: str = "solo"
    workflow_profile: str = "Standard Production"
    project_metadata: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Boardroom schemas
# ---------------------------------------------------------------------------
class RunBoardroomRequest(BaseModel):
    """Optional overrides for a boardroom run (all have defaults)."""

    pass  # Reserved for future per-run options


class SessionStatusResponse(BaseModel):
    session_id: str
    project_id: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Research schemas
# ---------------------------------------------------------------------------
class SourceItem(BaseModel):
    title: str
    url: str = ""
    type: str = "article"  # article | study | report | book


class ResearchPackResponse(BaseModel):
    id: str
    project_id: str
    questions: list[str]
    facts: list[str]
    sources: list[SourceItem]
    confidence_score: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Blueprint schemas
# ---------------------------------------------------------------------------
class SceneItem(BaseModel):
    scene_number: int
    title: str
    duration: str
    description: str
    broll: list[str] = []
    notes: str = ""


class TimelinePhase(BaseModel):
    phase: str
    days: int
    tasks: list[str] = []


class PlatformAdaptation(BaseModel):
    hook: str = ""
    format: str = ""
    cta: str = ""
    notes: str = ""


class BlueprintResponse(BaseModel):
    id: str
    project_id: str
    narrative: str
    script: str
    scenes: list[SceneItem]
    broll: list[str]
    editing_notes: str
    platform_adaptations: dict[str, Any]
    production_timeline: list[TimelinePhase]
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Export schemas
# ---------------------------------------------------------------------------
class ExportSummaryResponse(BaseModel):
    project_id: str
    project_title: str
    strategy_approved: bool
    research_ready: bool
    blueprint_ready: bool
    stages_completed: list[str]
    export_ready: bool


# ---------------------------------------------------------------------------
# Health schema
# ---------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str
    db: str
    granite: str
    version: str
    ai_engine: str = "IBM Granite"
