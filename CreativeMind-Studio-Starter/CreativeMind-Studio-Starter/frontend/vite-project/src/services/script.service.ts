/**
 * services/script.service.ts
 *
 * Script & Story Room — sections, blocks, versions, and emotional curve.
 */

import { apiClient } from '../lib/api/client';
import { SCRIPTS } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  ScriptBlock,
  ScriptSection,
  ScriptVersion,
  ScriptMeta,
  EmotionalDataPoint,
  CreateScriptBlockPayload,
  UpdateScriptBlockPayload,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockScript = {
  async getCurrentMeta(_p: string): Promise<ScriptMeta | null> { return null; },
  async getSections(_p: string): Promise<ScriptSection[]> { return []; },
  async getBlocks(_p: string): Promise<ScriptBlock[]> { return []; },
  async getBlock(_p: string, _bid: string): Promise<ScriptBlock | null> { return null; },
  async createBlock(_p: CreateScriptBlockPayload): Promise<ScriptBlock> { return {} as ScriptBlock; },
  async updateBlock(_p: string, _bid: string, _d: UpdateScriptBlockPayload): Promise<ScriptBlock> { return {} as ScriptBlock; },
  async aiRewrite(_p: string, _bid: string): Promise<ScriptBlock> { return {} as ScriptBlock; },
  async getVersions(_p: string, _sid: string): Promise<ScriptVersion[]> { return []; },
  async getEmotionalCurve(_p: string): Promise<EmotionalDataPoint[]> { return []; },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realScript = {
  async getCurrentMeta(projectId: string): Promise<ScriptMeta | null> {
    return (await apiClient.get<ScriptMeta | null>(SCRIPTS.current(projectId))).data;
  },
  async getSections(projectId: string): Promise<ScriptSection[]> {
    return (await apiClient.get<ScriptSection[]>(SCRIPTS.sections(projectId))).data;
  },
  async getBlocks(projectId: string): Promise<ScriptBlock[]> {
    return (await apiClient.get<ScriptBlock[]>(SCRIPTS.blocks(projectId))).data;
  },
  async getBlock(projectId: string, blockId: string): Promise<ScriptBlock | null> {
    return (await apiClient.get<ScriptBlock | null>(SCRIPTS.block(projectId, blockId))).data;
  },
  async createBlock(payload: CreateScriptBlockPayload): Promise<ScriptBlock> {
    return (await apiClient.post<ScriptBlock>(SCRIPTS.blocks(payload.projectId), payload)).data;
  },
  async updateBlock(projectId: string, blockId: string, delta: UpdateScriptBlockPayload): Promise<ScriptBlock> {
    return (await apiClient.patch<ScriptBlock>(SCRIPTS.updateBlock(projectId, blockId), delta)).data;
  },
  async aiRewrite(projectId: string, blockId: string): Promise<ScriptBlock> {
    return (await apiClient.post<ScriptBlock>(SCRIPTS.aiRewrite(projectId, blockId))).data;
  },
  async getVersions(projectId: string, scriptId: string): Promise<ScriptVersion[]> {
    return (await apiClient.get<ScriptVersion[]>(SCRIPTS.versions(projectId, scriptId))).data;
  },
  async getEmotionalCurve(projectId: string): Promise<EmotionalDataPoint[]> {
    return (await apiClient.get<EmotionalDataPoint[]>(SCRIPTS.emotionalCurve(projectId))).data;
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockScript : realScript;

export const scriptService = {
  getCurrentMeta:  (projectId: string) => adapter.getCurrentMeta(projectId),
  getSections:     (projectId: string) => adapter.getSections(projectId),
  getBlocks:       (projectId: string) => adapter.getBlocks(projectId),
  getBlock:        (projectId: string, blockId: string) => adapter.getBlock(projectId, blockId),
  createBlock:     (p: CreateScriptBlockPayload) => adapter.createBlock(p),
  updateBlock:     (projectId: string, blockId: string, d: UpdateScriptBlockPayload) => adapter.updateBlock(projectId, blockId, d),
  aiRewrite:       (projectId: string, blockId: string) => adapter.aiRewrite(projectId, blockId),
  getVersions:     (projectId: string, scriptId: string) => adapter.getVersions(projectId, scriptId),
  getEmotionalCurve:(projectId: string) => adapter.getEmotionalCurve(projectId),
};
