from __future__ import annotations

"""
pipeline.py — Pydantic schemas for the full 9-stage orchestrated pipeline.

Stage order:
  1. strategy_debate    (boardroom multi-agent debate)
  2. trend_radar        (market trend signals)
  3. virality_twin      (viral benchmark match)
  4. research_pack      (claims + sources + confidence)
  5. story_generator    (narrative structure)
  6. editor_blueprint   (time-coded production table)
  7. distribution       (platform-specific plan)
  8. final_report       (assembled summary)
"""

from typing import Any
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Trend Radar
# ---------------------------------------------------------------------------
class TrendSignal(BaseModel):
    signal: str
    volume: str          # low | medium | high
    growth_rate: str     # e.g. "+45%"
    relevance_score: int = Field(ge=0, le=100)
    reason: str


class TrendRadarOutput(BaseModel):
    signals: list[TrendSignal]
    top_opportunity: str
    timing_recommendation: str
    ai_engine: str = "IBM Granite"


# ---------------------------------------------------------------------------
# Virality Twin
# ---------------------------------------------------------------------------
class ViralityTwinOutput(BaseModel):
    matched_campaign: str
    description: str
    viral_mechanics: list[str]
    similarity_score: int = Field(ge=0, le=100)
    viral_score: int = Field(ge=0, le=100)
    predicted_reach: str
    key_differentiators: list[str]
    recommendation: str
    ai_engine: str = "IBM Granite"


# ---------------------------------------------------------------------------
# Research Pack
# ---------------------------------------------------------------------------
class ResearchClaim(BaseModel):
    claim: str
    evidence: str
    confidence: float = Field(ge=0.0, le=1.0)
    source: str
    source_type: str    # academic | news | industry | primary | government
    citation: str
    verified: bool = False


class ResearchPackOutput(BaseModel):
    claims: list[ResearchClaim]
    key_statistics: list[str]
    knowledge_gaps: list[str]
    overall_confidence: float = Field(ge=0.0, le=1.0)
    source_diversity_score: int = Field(ge=0, le=100)
    research_summary: str
    ai_engine: str = "IBM Granite"


# ---------------------------------------------------------------------------
# Story Generator
# ---------------------------------------------------------------------------
class StoryBeat(BaseModel):
    beat_number: int
    title: str
    description: str
    emotional_note: str
    duration_seconds: int


class StoryGeneratorOutput(BaseModel):
    narrative_arc: str      # hero_journey | three_act | in_medias_res | documentary
    hook: str
    story_beats: list[StoryBeat]
    emotional_curve: list[dict]   # [{timestamp_pct: int, intensity: int, label: str}]
    call_to_action: str
    estimated_duration_seconds: int
    ai_engine: str = "IBM Granite"


# ---------------------------------------------------------------------------
# Editor Blueprint  (Phase 4 — the big differentiator)
# ---------------------------------------------------------------------------
class TimelineRow(BaseModel):
    timecode: str           # e.g. "00:00 – 00:08"
    narration: str
    visual: str             # camera direction / b-roll description
    audio: str              # music cue / SFX / ambient
    motion_graphics: str    # on-screen text / animated element
    notes: str = ""


class EditorBlueprintOutput(BaseModel):
    timeline: list[TimelineRow]
    broll_list: list[str]
    music_brief: str
    color_grade_direction: str
    total_scenes: int
    estimated_runtime_seconds: int
    export_formats: list[str]
    ai_engine: str = "IBM Granite"


# ---------------------------------------------------------------------------
# Distribution Planner
# ---------------------------------------------------------------------------
class PlatformVariant(BaseModel):
    platform: str           # youtube | linkedin | tiktok | instagram | twitter
    format: str             # long | short | reel | clip
    duration_seconds: int
    title_variation: str
    hook_variation: str
    caption: str
    hashtags: list[str]
    best_posting_time: str
    predicted_reach: str


class DistributionOutput(BaseModel):
    platform_variants: list[PlatformVariant]
    primary_platform: str
    launch_strategy: str
    seeding_targets: list[str]
    paid_amplification_budget: str
    ai_engine: str = "IBM Granite"


# ---------------------------------------------------------------------------
# Final Report
# ---------------------------------------------------------------------------
class FinalReportOutput(BaseModel):
    executive_summary: str
    creative_score: int = Field(ge=0, le=100)
    originality_score: int = Field(ge=0, le=100)
    feasibility_score: int = Field(ge=0, le=100)
    virality_score: int = Field(ge=0, le=100)
    risk_level: str             # Low | Medium | High | Critical
    go_no_go: str               # GO | NO-GO | CONDITIONAL
    top_risks: list[str]
    top_opportunities: list[str]
    recommended_next_steps: list[str]
    ai_engine: str = "IBM Granite"


# ---------------------------------------------------------------------------
# Full Pipeline Result (aggregates all stages)
# ---------------------------------------------------------------------------
class PipelineRunRequest(BaseModel):
    raw_idea: str = Field(description="The creative idea to process through the full pipeline")
    demo_preset: str | None = Field(
        default=None,
        description="Optional demo preset: 'ai_jobs' | 'ocean_pollution' | 'electric_vehicles'"
    )


class PipelineResult(BaseModel):
    project_id: str
    pipeline_id: str
    status: str             # running | completed | failed
    ai_engine: str = "IBM Granite"
    stages_completed: list[str] = Field(default_factory=list)

    # Stage outputs (populated as pipeline progresses)
    strategy: dict[str, Any] | None = None
    trend_radar: TrendRadarOutput | None = None
    virality_twin: ViralityTwinOutput | None = None
    research_pack: ResearchPackOutput | None = None
    story_generator: StoryGeneratorOutput | None = None
    editor_blueprint: EditorBlueprintOutput | None = None
    distribution: DistributionOutput | None = None
    final_report: FinalReportOutput | None = None

    error: str | None = None
