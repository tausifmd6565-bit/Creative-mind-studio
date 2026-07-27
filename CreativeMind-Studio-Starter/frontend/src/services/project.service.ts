/**
 * services/project.service.ts
 *
 * Project CRUD, phase management, task management, and health metrics.
 */

import { apiClient } from '../lib/api/client';
import { PROJECTS, TASKS } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  Project,
  ProjectCard,
  ProjectPhase,
  HealthMetric,
  Task,
  ApprovalRequest,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  PaginatedResponse,
  PaginationParams,
} from '../types';
import type { ContentType, Platform } from '../types';

interface BackendProject {
  id: string;
  title: string;
  raw_idea: string;
  status: string;
  current_stage?: string;
  niche?: string | null;
  format?: string | null;
  project_metadata?: {
    description?: string;
    contentType?: ContentType;
    primaryPlatform?: Platform;
    targetPlatforms?: Platform[];
    targetAudience?: string;
    primaryGoal?: string;
    tone?: string;
    language?: string;
    estimatedDuration?: string;
    deadline?: string | null;
    tags?: string[];
    templateId?: string;
    templateTitle?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

const STAGE_TO_PHASE: Record<string, Project['activePhaseId']> = {
  strategy: 'strategy',
  research: 'research',
  blueprint: 'script',
  script: 'script',
  production: 'assets',
  edit: 'editing',
  review: 'review',
  publish: 'distribution',
  analytics: 'performance',
};

function initialsFromTitle(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'PR';
}

function mapStatus(status: string): Project['status'] {
  if (status === 'archived') return 'archived';
  if (status === 'draft') return 'draft';
  if (status === 'review') return 'review';
  if (status === 'published') return 'published';
  if (status === 'on-hold') return 'on-hold';
  return 'in-progress';
}

function mapPhase(stage?: string): Project['activePhaseId'] {
  return STAGE_TO_PHASE[(stage ?? 'strategy').toLowerCase()] ?? 'strategy';
}

function projectColor(id: string): string {
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];
  const code = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[code % colors.length];
}

function mapBackendProject(project: BackendProject): Project {
  const meta = project.project_metadata ?? {};
  const activePhaseId = mapPhase(project.current_stage);
  const color = projectColor(project.id);

  return {
    id: project.id,
    workspaceId: 'local-workspace',
    title: project.title,
    description: meta.description || project.raw_idea,
    thumbnailGradient: 'from-violet-600 to-cyan-700',
    status: mapStatus(project.status),
    contentType: meta.contentType ?? 'video',
    primaryPlatform: meta.primaryPlatform ?? 'youtube',
    targetPlatforms: meta.targetPlatforms ?? [meta.primaryPlatform ?? 'youtube'],
    targetAudience: meta.targetAudience ?? 'General audience',
    primaryGoal: meta.primaryGoal ?? 'education',
    tone: meta.tone ?? 'professional',
    language: meta.language ?? 'english',
    estimatedDuration: meta.estimatedDuration ?? '3-10min',
    aspectRatio: (meta.primaryPlatform === 'tiktok' || meta.primaryPlatform === 'instagram') ? '9:16' : '16:9',
    color,
    ownerId: 'local-user',
    teamMemberIds: [],
    deadline: meta.deadline ?? null,
    overallProgress: activePhaseId === 'strategy' ? 15 : activePhaseId === 'research' ? 35 : activePhaseId === 'script' ? 55 : 25,
    activePhaseId,
    phases: [],
    tags: meta.tags ?? ([project.niche, project.format, meta.templateTitle].filter(Boolean) as string[]),
    aiCreditsUsed: 0,
    taskSummary: { total: 0, done: 0, blocked: 0 },
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };
}

function mapBackendProjectCard(project: BackendProject): ProjectCard {
  const full = mapBackendProject(project);
  return {
    id: full.id,
    workspaceId: full.workspaceId,
    title: full.title,
    status: full.status,
    contentType: full.contentType,
    primaryPlatform: full.primaryPlatform,
    color: full.color,
    thumbnailGradient: full.thumbnailGradient,
    overallProgress: full.overallProgress,
    activePhaseId: full.activePhaseId,
    deadline: full.deadline,
    ownerRef: {
      id: 'local-user',
      name: 'You',
      initials: initialsFromTitle(project.title),
      color: full.color,
      isAi: false,
    },
    updatedAt: full.updatedAt,
  };
}

function toBackendCreatePayload(payload: CreateProjectPayload) {
  return {
    title: payload.title,
    raw_idea: payload.raw_idea || payload.description || payload.title,
    niche: payload.contentType,
    format: payload.primaryPlatform,
    project_metadata: {
      description: payload.description,
      contentType: payload.contentType,
      primaryPlatform: payload.primaryPlatform,
      targetPlatforms: payload.targetPlatforms,
      targetAudience: payload.targetAudience,
      primaryGoal: payload.primaryGoal,
      tone: payload.tone,
      language: payload.language,
      estimatedDuration: payload.estimatedDuration,
      deadline: payload.deadline,
      tags: payload.tags,
      templateId: payload.templateId,
      templateTitle: payload.templateTitle,
    },
  };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROJECT_CARD: ProjectCard = {
  id:                'p-mock-1',
  workspaceId:       'w-mock-1',
  title:             'Brand Refresh Campaign',
  status:            'in-progress',
  contentType:       'video',
  primaryPlatform:   'youtube',
  color:             '#8B5CF6',
  thumbnailGradient: 'from-violet-600 to-purple-900',
  overallProgress:   62,
  activePhaseId:     'research',
  deadline:          '2024-07-15T00:00:00Z',
  ownerRef:          { id: 'u-1', name: 'Nour Saleh', initials: 'NS', color: '#8B5CF6', isAi: false },
  updatedAt:         '2024-06-14T09:00:00Z',
};

const MOCK_PROJECTS: ProjectCard[] = [MOCK_PROJECT_CARD];

const mockProjects = {
  async list(_params?: PaginationParams): Promise<PaginatedResponse<ProjectCard>> {
    return { data: MOCK_PROJECTS, success: true, message: null, errors: null, pagination: { page: 1, pageSize: 20, totalPages: 1, totalItems: 1, hasNext: false, hasPrev: false } };
  },
  async getById(_id: string): Promise<Project> { return MOCK_PROJECT_CARD as unknown as Project; },
  async create(_p: CreateProjectPayload): Promise<Project> { return MOCK_PROJECT_CARD as unknown as Project; },
  async update(_id: string, _p: UpdateProjectPayload): Promise<Project> { return MOCK_PROJECT_CARD as unknown as Project; },
  async delete(_id: string): Promise<void> {},
  async getPhases(_id: string): Promise<ProjectPhase[]> { return []; },
  async getHealth(_id: string): Promise<HealthMetric[]> { return []; },
  async getTasks(_id: string): Promise<Task[]> { return []; },
  async createTask(_id: string, _p: CreateTaskPayload): Promise<Task> { return {} as Task; },
  async updateTask(_id: string, _tid: string, _p: UpdateTaskPayload): Promise<Task> { return {} as Task; },
  async deleteTask(_id: string, _tid: string): Promise<void> {},
  async getApprovals(_id: string): Promise<ApprovalRequest[]> { return []; },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realProjects = {
  async list(params?: PaginationParams): Promise<PaginatedResponse<ProjectCard>> {
    const qs = params ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}` : '';
    const response = await apiClient.getPaginated<BackendProject>(`${PROJECTS.list}${qs}`);
    return { ...response, data: response.data.map(mapBackendProjectCard) };
  },
  async getById(id: string): Promise<Project> {
    return mapBackendProject((await apiClient.get<BackendProject>(PROJECTS.detail(id))).data);
  },
  async create(payload: CreateProjectPayload): Promise<Project> {
    return mapBackendProject((await apiClient.post<BackendProject>(PROJECTS.create, toBackendCreatePayload(payload))).data);
  },
  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    return (await apiClient.patch<Project>(PROJECTS.update(id), payload)).data;
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(PROJECTS.delete(id));
  },
  async getPhases(id: string): Promise<ProjectPhase[]> {
    return (await apiClient.get<ProjectPhase[]>(PROJECTS.phases(id))).data;
  },
  async getHealth(id: string): Promise<HealthMetric[]> {
    return (await apiClient.get<HealthMetric[]>(PROJECTS.health(id))).data;
  },
  async getTasks(id: string): Promise<Task[]> {
    return (await apiClient.get<Task[]>(TASKS.list(id))).data;
  },
  async createTask(projectId: string, payload: CreateTaskPayload): Promise<Task> {
    return (await apiClient.post<Task>(TASKS.create(projectId), payload)).data;
  },
  async updateTask(projectId: string, taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    return (await apiClient.patch<Task>(TASKS.update(projectId, taskId), payload)).data;
  },
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await apiClient.delete(TASKS.delete(projectId, taskId));
  },
  async updateStage(id: string, stage: string): Promise<Project> {
    return mapBackendProject((await apiClient.post<BackendProject>(PROJECTS.stage(id), { current_stage: stage })).data);
  },
  async archive(id: string): Promise<Project> {
    return mapBackendProject((await apiClient.patch<BackendProject>(PROJECTS.update(id), { status: 'archived' })).data);
  },
  async getApprovals(projectId: string): Promise<ApprovalRequest[]> {
    return (await apiClient.get<ApprovalRequest[]>(PROJECTS.overview(projectId))).data as unknown as ApprovalRequest[];
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockProjects : realProjects;

export const projectService = {
  list:        (params?: PaginationParams) => adapter.list(params),
  getById:     (id: string)                => adapter.getById(id),
  create:      (p: CreateProjectPayload)   => adapter.create(p),
  update:      (id: string, p: UpdateProjectPayload) => adapter.update(id, p),
  delete:      (id: string)                => adapter.delete(id),
  updateStage: (id: string, stage: string) => realProjects.updateStage(id, stage),
  archive:     (id: string)                => realProjects.archive(id),
  getPhases:   (id: string)                => adapter.getPhases(id),
  getHealth:   (id: string)                => adapter.getHealth(id),
  getTasks:    (id: string)                => adapter.getTasks(id),
  createTask:  (id: string, p: CreateTaskPayload)  => adapter.createTask(id, p),
  updateTask:  (id: string, tid: string, p: UpdateTaskPayload) => adapter.updateTask(id, tid, p),
  deleteTask:  (id: string, tid: string)   => adapter.deleteTask(id, tid),
  getApprovals:(id: string)                => adapter.getApprovals(id),
};

