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
    return apiClient.getPaginated<ProjectCard>(`${PROJECTS.list}${qs}`);
  },
  async getById(id: string): Promise<Project> {
    return (await apiClient.get<Project>(PROJECTS.detail(id))).data;
  },
  async create(payload: CreateProjectPayload): Promise<Project> {
    return (await apiClient.post<Project>(PROJECTS.create, payload)).data;
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
  getPhases:   (id: string)                => adapter.getPhases(id),
  getHealth:   (id: string)                => adapter.getHealth(id),
  getTasks:    (id: string)                => adapter.getTasks(id),
  createTask:  (id: string, p: CreateTaskPayload)  => adapter.createTask(id, p),
  updateTask:  (id: string, tid: string, p: UpdateTaskPayload) => adapter.updateTask(id, tid, p),
  deleteTask:  (id: string, tid: string)   => adapter.deleteTask(id, tid),
  getApprovals:(id: string)                => adapter.getApprovals(id),
};
