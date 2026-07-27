from __future__ import annotations

import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import repository as repo
from app.db.client import get_db
from app.schemas.requests import ApiResponse, CreateProjectRequest, ProjectResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Projects"])


def _project_to_response(project) -> ProjectResponse:
    return ProjectResponse(
        id=str(project.id),
        title=project.title,
        raw_idea=project.raw_idea,
        status=project.status,
        current_stage=getattr(project, "current_stage", "Strategy"),
        niche=getattr(project, "niche", None),
        format=getattr(project, "format", None),
        team_mode=getattr(project, "team_mode", "solo"),
        workflow_profile=getattr(project, "workflow_profile", "Standard Production"),
        project_metadata=getattr(project, "project_metadata", None) or {},
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.get(
    "/projects",
    summary="List projects",
    description="List all projects ordered by creation date.",
)
async def list_projects(
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    projects = await repo.list_projects(db)
    items = [_project_to_response(p).model_dump() for p in projects]
    return {
        "data": items,
        "success": True,
        "message": None,
        "errors": None,
        "pagination": {
            "page": 1,
            "pageSize": len(items),
            "totalPages": 1,
            "totalItems": len(items),
            "hasNext": False,
            "hasPrev": False,
        },
    }


@router.post(
    "/projects",
    response_model=ApiResponse[ProjectResponse],
    status_code=201,
    summary="Create project",
    description="Create a new project with a raw creative idea. Returns the stored project.",
)
async def create_project(
    body: CreateProjectRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ProjectResponse]:
    project = await repo.create_project(
        db,
        title=body.title,
        raw_idea=body.raw_idea,
        niche=body.niche,
        format=body.format,
        team_mode=body.team_mode,
        workflow_profile=body.workflow_profile,
        project_metadata=body.project_metadata,
    )
    return ApiResponse(data=_project_to_response(project))


@router.get(
    "/projects/{project_id}",
    response_model=ApiResponse[ProjectResponse],
    summary="Get project",
    description="Retrieve a project by ID.",
)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ProjectResponse]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    return ApiResponse(data=_project_to_response(project))


from pydantic import BaseModel

class UpdateProjectStatusRequest(BaseModel):
    status: str | None = None
    current_stage: str | None = None


@router.delete(
    "/projects/{project_id}",
    summary="Delete project",
    description="Delete a project by ID.",
)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    deleted = await repo.delete_project(db, pid)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    return {"success": True, "message": f"Project {project_id} deleted"}


@router.patch(
    "/projects/{project_id}",
    response_model=ApiResponse[ProjectResponse],
    summary="Update project",
    description="Update project status or stage.",
)
async def update_project(
    project_id: str,
    body: UpdateProjectStatusRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ProjectResponse]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    if body.status:
        project.status = body.status
    if body.current_stage:
        project.current_stage = body.current_stage
    await db.flush()

    return ApiResponse(data=_project_to_response(project))


@router.post(
    "/projects/{project_id}/stage",
    response_model=ApiResponse[ProjectResponse],
    summary="Update project stage",
)
async def update_stage(
    project_id: str,
    body: UpdateProjectStatusRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ProjectResponse]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid project_id format")

    stage = body.current_stage or "Research"
    await repo.update_project_stage(db, pid, stage)
    project = await repo.get_project(db, pid)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    return ApiResponse(data=_project_to_response(project))

