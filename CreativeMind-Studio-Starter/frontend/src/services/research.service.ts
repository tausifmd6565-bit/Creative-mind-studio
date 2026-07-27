/**
 * services/research.service.ts
 *
 * Research Lab — IBM Granite AI-generated research packs.
 *
 * generate(projectId) → POST /api/projects/:id/research/generate
 *   Calls IBM Granite, saves a ResearchPack, advances project stage.
 *
 * get(projectId) → GET /api/projects/:id/research
 *   Returns the latest saved ResearchPack (no new AI call).
 */

import { apiClient } from '../lib/api/client';
import { RESEARCH_AI } from '../lib/api/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResearchSource {
  title: string;
  url: string;
  type: 'article' | 'study' | 'report' | 'book';
}

export interface ResearchPack {
  id: string;
  project_id: string;
  questions: string[];
  facts: string[];
  sources: ResearchSource[];
  confidence_score: number;
  created_at: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const researchService = {
  /** Call IBM Granite to generate and save a new research pack. */
  async generate(projectId: string): Promise<ResearchPack> {
    const resp = await apiClient.post<ResearchPack>(RESEARCH_AI.generate(projectId), {});
    return resp.data;
  },

  /** Retrieve the most recently saved research pack for this project. */
  async get(projectId: string): Promise<ResearchPack | null> {
    try {
      const resp = await apiClient.get<ResearchPack>(RESEARCH_AI.get(projectId));
      return resp.data;
    } catch (err: unknown) {
      // 404 means no pack exists yet — return null so the UI shows empty state
      if ((err as { status?: number }).status === 404) return null;
      throw err;
    }
  },
};
