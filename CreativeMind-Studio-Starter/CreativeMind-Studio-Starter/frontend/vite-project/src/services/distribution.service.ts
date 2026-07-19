/**
 * services/distribution.service.ts
 *
 * Distribution Room — master content, platform variants, scheduling, publication.
 */

import { apiClient } from '../lib/api/client';
import { DISTRIBUTION } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  MasterContent,
  PlatformVariant,
  CreatePlatformVariantPayload,
  UpdatePlatformVariantPayload,
  SchedulePublicationPayload,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockDistribution = {
  async getMasterContent(_p: string): Promise<MasterContent | null> { return null; },
  async getVariants(_p: string): Promise<PlatformVariant[]> { return []; },
  async generateVariants(_p: string): Promise<PlatformVariant[]> { return []; },
  async getVariant(_p: string, _vid: string): Promise<PlatformVariant | null> { return null; },
  async create(_p: CreatePlatformVariantPayload): Promise<PlatformVariant> { return {} as PlatformVariant; },
  async update(_p: string, _vid: string, _d: UpdatePlatformVariantPayload): Promise<PlatformVariant> { return {} as PlatformVariant; },
  async schedule(_p: SchedulePublicationPayload): Promise<PlatformVariant> { return {} as PlatformVariant; },
  async publish(_p: string, _vid: string): Promise<PlatformVariant> { return {} as PlatformVariant; },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realDistribution = {
  async getMasterContent(projectId: string): Promise<MasterContent | null> {
    return (await apiClient.get<MasterContent | null>(DISTRIBUTION.masterContent(projectId))).data;
  },
  async getVariants(projectId: string): Promise<PlatformVariant[]> {
    return (await apiClient.get<PlatformVariant[]>(DISTRIBUTION.variants(projectId))).data;
  },
  async generateVariants(projectId: string): Promise<PlatformVariant[]> {
    return (await apiClient.post<PlatformVariant[]>(DISTRIBUTION.generate(projectId))).data;
  },
  async getVariant(projectId: string, variantId: string): Promise<PlatformVariant | null> {
    return (await apiClient.get<PlatformVariant | null>(DISTRIBUTION.variant(projectId, variantId))).data;
  },
  async create(payload: CreatePlatformVariantPayload): Promise<PlatformVariant> {
    return (await apiClient.post<PlatformVariant>(DISTRIBUTION.variants(payload.projectId), payload)).data;
  },
  async update(projectId: string, variantId: string, delta: UpdatePlatformVariantPayload): Promise<PlatformVariant> {
    return (await apiClient.patch<PlatformVariant>(DISTRIBUTION.updateVariant(projectId, variantId), delta)).data;
  },
  async schedule(payload: SchedulePublicationPayload): Promise<PlatformVariant> {
    // variantId must be extracted from within the payload; we also need projectId from context
    // The caller must provide a projectId separately - adapt signature at call site
    return (await apiClient.post<PlatformVariant>(`/projects/:projectId/platform-variants/${payload.variantId}/schedule`, payload)).data;
  },
  async publish(projectId: string, variantId: string): Promise<PlatformVariant> {
    return (await apiClient.post<PlatformVariant>(DISTRIBUTION.variant(projectId, variantId) + '/publish')).data;
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockDistribution : realDistribution;

export const distributionService = {
  getMasterContent: (projectId: string) => adapter.getMasterContent(projectId),
  getVariants:      (projectId: string) => adapter.getVariants(projectId),
  generateVariants: (projectId: string) => adapter.generateVariants(projectId),
  getVariant:       (projectId: string, variantId: string) => adapter.getVariant(projectId, variantId),
  create:           (p: CreatePlatformVariantPayload) => adapter.create(p),
  update:           (projectId: string, variantId: string, d: UpdatePlatformVariantPayload) => adapter.update(projectId, variantId, d),
  schedule:         (p: SchedulePublicationPayload) => adapter.schedule(p),
  publish:          (projectId: string, variantId: string) => adapter.publish(projectId, variantId),
};
