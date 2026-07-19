/**
 * services/asset.service.ts
 *
 * Asset Room — list, upload, update, rights check, and alternatives.
 */

import { apiClient } from '../lib/api/client';
import { ASSETS } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  Asset,
  ActiveUpload,
  AlternativeOption,
  AssetTimelineEvent,
  UploadAssetPayload,
  UpdateAssetPayload,
  PaginatedResponse,
  PaginationParams,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockAssets = {
  async list(_p: string, _params?: PaginationParams): Promise<PaginatedResponse<Asset>> {
    return { data: [], success: true, message: null, errors: null, pagination: { page: 1, pageSize: 50, totalPages: 0, totalItems: 0, hasNext: false, hasPrev: false } };
  },
  async getById(_p: string, _aid: string): Promise<Asset | null> { return null; },
  async create(_p: string, _payload: UploadAssetPayload): Promise<Asset> { return {} as Asset; },
  async upload(_p: string, _formData: FormData, _onProgress?: (pct: number) => void): Promise<Asset> { return {} as Asset; },
  async update(_p: string, _aid: string, _d: UpdateAssetPayload): Promise<Asset> { return {} as Asset; },
  async delete(_p: string, _aid: string): Promise<void> {},
  async getAlternatives(_p: string, _aid: string): Promise<AlternativeOption[]> { return []; },
  async getTimeline(_p: string, _aid: string): Promise<AssetTimelineEvent[]> { return []; },
  async requestRightsCheck(_p: string, _aid: string): Promise<Asset> { return {} as Asset; },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realAssets = {
  async list(projectId: string, params?: PaginationParams): Promise<PaginatedResponse<Asset>> {
    const qs = params ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 50}` : '';
    return apiClient.getPaginated<Asset>(`${ASSETS.list(projectId)}${qs}`);
  },
  async getById(projectId: string, assetId: string): Promise<Asset | null> {
    return (await apiClient.get<Asset | null>(ASSETS.detail(projectId, assetId))).data;
  },
  async create(projectId: string, payload: UploadAssetPayload): Promise<Asset> {
    return (await apiClient.post<Asset>(ASSETS.create(projectId), payload)).data;
  },
  async upload(projectId: string, formData: FormData): Promise<Asset> {
    return (await apiClient.upload<Asset>(ASSETS.upload(projectId), formData)).data;
  },
  async update(projectId: string, assetId: string, delta: UpdateAssetPayload): Promise<Asset> {
    return (await apiClient.patch<Asset>(ASSETS.update(projectId, assetId), delta)).data;
  },
  async delete(projectId: string, assetId: string): Promise<void> {
    await apiClient.delete(ASSETS.delete(projectId, assetId));
  },
  async getAlternatives(projectId: string, assetId: string): Promise<AlternativeOption[]> {
    return (await apiClient.get<AlternativeOption[]>(ASSETS.alternatives(projectId, assetId))).data;
  },
  async getTimeline(projectId: string, assetId: string): Promise<AssetTimelineEvent[]> {
    return (await apiClient.get<AssetTimelineEvent[]>(ASSETS.timeline(projectId, assetId))).data;
  },
  async requestRightsCheck(projectId: string, assetId: string): Promise<Asset> {
    return (await apiClient.post<Asset>(ASSETS.rightsCheck(projectId, assetId))).data;
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockAssets : realAssets;

export const assetService = {
  list:              (projectId: string, params?: PaginationParams) => adapter.list(projectId, params),
  getById:           (projectId: string, assetId: string) => adapter.getById(projectId, assetId),
  create:            (projectId: string, payload: UploadAssetPayload) => adapter.create(projectId, payload),
  upload:            (projectId: string, formData: FormData) => adapter.upload(projectId, formData),
  update:            (projectId: string, assetId: string, delta: UpdateAssetPayload) => adapter.update(projectId, assetId, delta),
  delete:            (projectId: string, assetId: string) => adapter.delete(projectId, assetId),
  getAlternatives:   (projectId: string, assetId: string) => adapter.getAlternatives(projectId, assetId),
  getTimeline:       (projectId: string, assetId: string) => adapter.getTimeline(projectId, assetId),
  requestRightsCheck:(projectId: string, assetId: string) => adapter.requestRightsCheck(projectId, assetId),
};
