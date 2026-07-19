/**
 * services/virality.service.ts
 *
 * Virality Twin workspace — run analysis and retrieve Creator DNA.
 */

import { apiClient } from '../lib/api/client';
import { VIRALITY } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  ViralityTwinSnapshot,
  ViralityFilters,
  CreatorDNA,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockVirality = {
  async analyse(_projectId: string, _filters?: Partial<ViralityFilters>): Promise<ViralityTwinSnapshot> {
    return {} as ViralityTwinSnapshot;
  },
  async getSnapshot(_projectId: string): Promise<ViralityTwinSnapshot | null> { return null; },
  async getCreatorDna(): Promise<CreatorDNA | null> { return null; },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realVirality = {
  async analyse(projectId: string, filters?: Partial<ViralityFilters>): Promise<ViralityTwinSnapshot> {
    return (await apiClient.post<ViralityTwinSnapshot>(VIRALITY.analyse(projectId), filters ?? {})).data;
  },
  async getSnapshot(projectId: string): Promise<ViralityTwinSnapshot | null> {
    return (await apiClient.get<ViralityTwinSnapshot | null>(VIRALITY.get(projectId))).data;
  },
  async getCreatorDna(): Promise<CreatorDNA | null> {
    return (await apiClient.get<CreatorDNA | null>(VIRALITY.dna)).data;
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockVirality : realVirality;

export const viralityService = {
  analyse:      (projectId: string, filters?: Partial<ViralityFilters>) => adapter.analyse(projectId, filters),
  getSnapshot:  (projectId: string) => adapter.getSnapshot(projectId),
  getCreatorDna:()                  => adapter.getCreatorDna(),
};
