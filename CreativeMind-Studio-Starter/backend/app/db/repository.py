from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    AgentMessage,
    BoardroomSession,
    CreativeBlueprint,
    IdeaVersion,
    Project,
    ResearchPack,
    Scorecard,
)


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------
async def create_project(
    db: AsyncSession,
    title: str,
    raw_idea: str,
    niche: str | None = None,
    format: str | None = None,
    team_mode: str = "solo",
    workflow_profile: str = "Standard Production",
    project_metadata: dict | None = None,
) -> Project:
    project = Project(
        id=uuid.uuid4(),
        title=title,
        raw_idea=raw_idea,
        status="active",
        niche=niche,
        format=format,
        team_mode=team_mode,
        workflow_profile=workflow_profile,
        project_metadata=project_metadata or {},
    )
    db.add(project)
    await db.flush()  # get the id without committing
    return project


async def get_project(db: AsyncSession, project_id: uuid.UUID) -> Project | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def list_projects(db: AsyncSession, limit: int = 50) -> list[Project]:
    result = await db.execute(select(Project).order_by(Project.created_at.desc()).limit(limit))
    return list(result.scalars().all())


async def delete_project(db: AsyncSession, project_id: uuid.UUID) -> bool:
    project = await get_project(db, project_id)
    if not project:
        return False
    await db.delete(project)
    await db.flush()
    return True


async def update_project_status(db: AsyncSession, project_id: uuid.UUID, status: str) -> Project | None:
    project = await get_project(db, project_id)
    if project:
        project.status = status
        await db.flush()
    return project



# ---------------------------------------------------------------------------
# BoardroomSession
# ---------------------------------------------------------------------------
async def create_session(
    db: AsyncSession,
    project_id: uuid.UUID,
    agent_sequence: list[str],
) -> BoardroomSession:
    session = BoardroomSession(
        id=uuid.uuid4(),
        project_id=project_id,
        status="pending",
        agent_sequence=agent_sequence,
    )
    db.add(session)
    await db.flush()
    return session


async def get_session(db: AsyncSession, session_id: uuid.UUID) -> BoardroomSession | None:
    result = await db.execute(select(BoardroomSession).where(BoardroomSession.id == session_id))
    return result.scalar_one_or_none()


async def get_latest_session(db: AsyncSession, project_id: uuid.UUID) -> BoardroomSession | None:
    result = await db.execute(
        select(BoardroomSession)
        .where(BoardroomSession.project_id == project_id)
        .order_by(BoardroomSession.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def update_session_status(
    db: AsyncSession,
    session_id: uuid.UUID,
    status: str,
    result: dict | None = None,
    error_message: str | None = None,
    fallback_used: bool = False,
) -> None:
    session = await get_session(db, session_id)
    if session:
        session.status = status
        if result is not None:
            session.result = result
        if error_message is not None:
            session.error_message = error_message
        session.fallback_used = fallback_used
        await db.flush()


# ---------------------------------------------------------------------------
# AgentMessage
# ---------------------------------------------------------------------------
async def save_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    agent_name: str,
    role: str,
    content: dict,
    sequence_order: int = 0,
) -> AgentMessage:
    message = AgentMessage(
        id=uuid.uuid4(),
        session_id=session_id,
        agent_name=agent_name,
        role=role,
        content=content,
        sequence_order=sequence_order,
    )
    db.add(message)
    await db.flush()
    return message


async def get_messages(db: AsyncSession, session_id: uuid.UUID) -> list[AgentMessage]:
    result = await db.execute(
        select(AgentMessage)
        .where(AgentMessage.session_id == session_id)
        .order_by(AgentMessage.sequence_order.asc())
    )
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Scorecard
# ---------------------------------------------------------------------------
async def save_scorecard(
    db: AsyncSession,
    project_id: uuid.UUID,
    session_id: uuid.UUID,
    scores: dict,
    overall_score: float | None = None,
) -> Scorecard:
    scorecard = Scorecard(
        id=uuid.uuid4(),
        project_id=project_id,
        session_id=session_id,
        scores=scores,
        overall_score=overall_score,
    )
    db.add(scorecard)
    await db.flush()
    return scorecard


# ---------------------------------------------------------------------------
# IdeaVersion
# ---------------------------------------------------------------------------
async def save_idea_version(
    db: AsyncSession,
    project_id: uuid.UUID,
    refined_idea: str,
    pivot_notes: str | None = None,
) -> IdeaVersion:
    # Determine next version number
    from sqlalchemy import func as sqlfunc

    result = await db.execute(
        select(sqlfunc.max(IdeaVersion.version_number)).where(IdeaVersion.project_id == project_id)
    )
    max_version = result.scalar_one_or_none() or 0

    version = IdeaVersion(
        id=uuid.uuid4(),
        project_id=project_id,
        version_number=max_version + 1,
        refined_idea=refined_idea,
        pivot_notes=pivot_notes,
    )
    db.add(version)
    await db.flush()
    return version


# ---------------------------------------------------------------------------
# ResearchPack
# ---------------------------------------------------------------------------
async def get_research_pack(db: AsyncSession, project_id: uuid.UUID) -> ResearchPack | None:
    result = await db.execute(
        select(ResearchPack)
        .where(ResearchPack.project_id == project_id)
        .order_by(ResearchPack.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def save_research_pack(
    db: AsyncSession,
    project_id: uuid.UUID,
    questions: list,
    facts: list,
    sources: list,
    confidence_score: float,
) -> ResearchPack:
    pack = ResearchPack(
        id=uuid.uuid4(),
        project_id=project_id,
        questions=questions,
        facts=facts,
        sources=sources,
        confidence_score=confidence_score,
    )
    db.add(pack)
    await db.flush()
    return pack


# ---------------------------------------------------------------------------
# CreativeBlueprint
# ---------------------------------------------------------------------------
async def get_blueprint(db: AsyncSession, project_id: uuid.UUID) -> CreativeBlueprint | None:
    result = await db.execute(
        select(CreativeBlueprint)
        .where(CreativeBlueprint.project_id == project_id)
        .order_by(CreativeBlueprint.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def save_blueprint(
    db: AsyncSession,
    project_id: uuid.UUID,
    narrative: str,
    script: str,
    scenes: list,
    broll: list,
    editing_notes: str,
    platform_adaptations: dict,
    production_timeline: list,
) -> CreativeBlueprint:
    bp = CreativeBlueprint(
        id=uuid.uuid4(),
        project_id=project_id,
        narrative=narrative,
        script=script,
        scenes=scenes,
        broll=broll,
        editing_notes=editing_notes,
        platform_adaptations=platform_adaptations,
        production_timeline=production_timeline,
    )
    db.add(bp)
    await db.flush()
    return bp


# ---------------------------------------------------------------------------
# Project stage helper
# ---------------------------------------------------------------------------
async def update_project_stage(db: AsyncSession, project_id: uuid.UUID, stage: str) -> None:
    project = await get_project(db, project_id)
    if project:
        project.current_stage = stage
        await db.flush()
