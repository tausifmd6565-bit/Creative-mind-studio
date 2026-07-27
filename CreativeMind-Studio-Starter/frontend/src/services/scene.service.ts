/**
 * services/scene.service.ts
 *
 * Scene management — list, create, update, delete, and asset linking.
 */

import { apiClient } from '../lib/api/client';
import { SCENES } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type { Scene, SceneAsset } from '../types';

// ─── Create / update payload types ───────────────────────────────────────────

export interface CreateScenePayload {
  projectId:           string;
  sectionId:           string;
  title:               string;
  description?:        string;
  estimatedDurationSec?:number;
}

export interface UpdateScenePayload {
  title?:               string;
  description?:         string;
  estimatedDurationSec?:number;
  approvalStatus?:      Scene['approvalStatus'];
}

export interface LinkAssetPayload {
  assetId:   string;
  order?:    number;
  inPoint?:  number;
  outPoint?: number;
  notes?:    string;
}

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockScenes = {
  async list(_p: string): Promise<Scene[]> { return []; },
  async getById(_p: string, _sid: string): Promise<Scene | null> { return null; },
  async create(_p: CreateScenePayload): Promise<Scene> { return {} as Scene; },
  async update(_p: string, _sid: string, _d: UpdateScenePayload): Promise<Scene> { return {} as Scene; },
  async delete(_p: string, _sid: string): Promise<void> {},
  async getAssets(_p: string, _sid: string): Promise<SceneAsset[]> { return []; },
  async linkAsset(_p: string, _sid: string, _payload: LinkAssetPayload): Promise<SceneAsset> { return {} as SceneAsset; },
  async unlinkAsset(_p: string, _sid: string, _aid: string): Promise<void> {},
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realScenes = {
  async list(projectId: string): Promise<Scene[]> {
    return (await apiClient.get<Scene[]>(SCENES.list(projectId))).data;
  },
  async getById(projectId: string, sceneId: string): Promise<Scene | null> {
    return (await apiClient.get<Scene | null>(SCENES.detail(projectId, sceneId))).data;
  },
  async create(payload: CreateScenePayload): Promise<Scene> {
    return (await apiClient.post<Scene>(SCENES.create(payload.projectId), payload)).data;
  },
  async update(projectId: string, sceneId: string, delta: UpdateScenePayload): Promise<Scene> {
    return (await apiClient.patch<Scene>(SCENES.update(projectId, sceneId), delta)).data;
  },
  async delete(projectId: string, sceneId: string): Promise<void> {
    await apiClient.delete(SCENES.delete(projectId, sceneId));
  },
  async getAssets(projectId: string, sceneId: string): Promise<SceneAsset[]> {
    return (await apiClient.get<SceneAsset[]>(SCENES.assets(projectId, sceneId))).data;
  },
  async linkAsset(projectId: string, sceneId: string, payload: LinkAssetPayload): Promise<SceneAsset> {
    return (await apiClient.post<SceneAsset>(SCENES.linkAsset(projectId, sceneId), payload)).data;
  },
  async unlinkAsset(projectId: string, sceneId: string, assetId: string): Promise<void> {
    await apiClient.delete(SCENES.unlinkAsset(projectId, sceneId, assetId));
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockScenes : realScenes;

export const sceneService = {
  list:       (projectId: string) => adapter.list(projectId),
  getById:    (projectId: string, sceneId: string) => adapter.getById(projectId, sceneId),
  create:     (p: CreateScenePayload) => adapter.create(p),
  update:     (projectId: string, sceneId: string, d: UpdateScenePayload) => adapter.update(projectId, sceneId, d),
  delete:     (projectId: string, sceneId: string) => adapter.delete(projectId, sceneId),
  getAssets:  (projectId: string, sceneId: string) => adapter.getAssets(projectId, sceneId),
  linkAsset:  (projectId: string, sceneId: string, p: LinkAssetPayload) => adapter.linkAsset(projectId, sceneId, p),
  unlinkAsset:(projectId: string, sceneId: string, assetId: string) => adapter.unlinkAsset(projectId, sceneId, assetId),
};
