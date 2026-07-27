/**
 * services/pipeline.service.ts
 *
 * Full 9-stage IBM Granite AI pipeline service.
 * Includes 3 demo presets for reliable demo showcasing (Phases 6 & 7).
 */

import { API_CONFIG } from '../config/api.config';
import { apiClient } from '../lib/api/client';
import { PIPELINE } from '../lib/api/endpoints';
import type {
  PipelineResult,
  PipelineRunPayload,
  PipelineDemoPreset,
} from '../types/pipeline.types';

// ─── Demo Preset Imports ──────────────────────────────────────────────────────
// Full polished demo data for 3 canonical examples:
//   'ai_jobs'           The Invisible Cost of Optimization
//   'ocean_pollution'   Ten Rivers
//   'electric_vehicles' The Battery Cost
import { DEMO_AI_JOBS, DEMO_OCEAN, DEMO_EV } from '../mocks/pipeline.mock';

export { DEMO_AI_JOBS, DEMO_OCEAN, DEMO_EV };

export const DEMO_PRESETS: Record<string, PipelineResult> = {
  ai_jobs: DEMO_AI_JOBS,
  ocean_pollution: DEMO_OCEAN,
  electric_vehicles: DEMO_EV,
};

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockPipeline = {
  async run(projectId: string, payload: PipelineRunPayload): Promise<PipelineResult> {
    const preset = payload.demo_preset ? DEMO_PRESETS[payload.demo_preset] : null;
    if (preset) return { ...preset, project_id: projectId };
    return { ...DEMO_AI_JOBS, project_id: projectId };
  },
  async getResult(projectId: string): Promise<PipelineResult> {
    return { ...DEMO_AI_JOBS, project_id: projectId };
  },
};

// ─── Real adapter ───────────────────────────────────────────────────────

const realPipeline = {
  async run(projectId: string, payload: PipelineRunPayload): Promise<PipelineResult> {
    const response = await apiClient.post<PipelineResult>(PIPELINE.run(projectId), payload);
    return response.data;
  },
  async getResult(projectId: string): Promise<PipelineResult> {
    const response = await apiClient.get<PipelineResult>(PIPELINE.result(projectId));
    return response.data;
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockPipeline : realPipeline;

export const pipelineService = {
  /** Run the full 9-stage IBM Granite pipeline */
  run: (projectId: string, payload: PipelineRunPayload) => adapter.run(projectId, payload),
  /** Get the latest pipeline result for a project */
  getResult: (projectId: string) => adapter.getResult(projectId),
  /** Get a specific demo preset result without an API call */
  getDemoPreset: (preset: PipelineDemoPreset): PipelineResult => DEMO_PRESETS[preset],
};
