/**
 * services/blueprint.service.ts
 *
 * Creative Blueprint — IBM Granite AI-generated production blueprints.
 */

import { apiClient } from '../lib/api/client';
import { BLUEPRINT } from '../lib/api/endpoints';

export interface BlueprintScene {
  scene_number: number;
  title: string;
  duration: string;
  description: string;
  broll: string[];
  notes: string;
}

export interface BlueprintTimelinePhase {
  phase: string;
  days: number;
  tasks: string[];
}

export interface PlatformAdaptation {
  hook: string;
  format: string;
  cta: string;
  notes: string;
}

export interface CreativeBlueprint {
  id: string;
  project_id: string;
  narrative: string;
  script: string;
  scenes: BlueprintScene[];
  broll: string[];
  editing_notes: string;
  platform_adaptations: Record<string, PlatformAdaptation>;
  production_timeline: BlueprintTimelinePhase[];
  created_at: string;
}

export const blueprintService = {
  async generate(projectId: string): Promise<CreativeBlueprint> {
    const resp = await apiClient.post<CreativeBlueprint>(BLUEPRINT.generate(projectId), {});
    return resp.data;
  },

  async get(projectId: string): Promise<CreativeBlueprint | null> {
    try {
      const resp = await apiClient.get<CreativeBlueprint>(BLUEPRINT.get(projectId));
      return resp.data;
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 404) return null;
      throw err;
    }
  },
};
