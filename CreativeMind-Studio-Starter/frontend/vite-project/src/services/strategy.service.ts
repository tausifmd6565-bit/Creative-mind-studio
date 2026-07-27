/**
 * services/strategy.service.ts
 *
 * Strategy Room — unified AI endpoint integration.
 * All strategy AI calls go through POST /api/ai/generate.
 */

import { apiClient } from '../lib/api/client';
import { PROJECTS } from '../lib/api/endpoints';
import type {
  CreativeBrief,
  DiscussionResult,
  ExpertRole,
  FinalStrategy,
} from '../app/dashboard/projects/projectId/strategy/types';

const AI_ENDPOINT = '/ai/generate';

export const strategyService = {
  /** Run 4-expert discussion + generate initial recommendations */
  async startDiscussion(projectId: string, brief: CreativeBrief): Promise<DiscussionResult> {
    const resp = await apiClient.post<DiscussionResult>(AI_ENDPOINT, {
      project_id: projectId,
      stage: 'strategy',
      action: 'discussion',
      brief,
    });
    return resp.data || (resp as any);
  },

  /** Re-run a single expert's recommendation */
  async rerunExpert(
    projectId: string,
    expert: ExpertRole,
    brief: CreativeBrief,
    acceptedRecommendations: Record<string, string>,
    feedback?: string,
  ): Promise<{ text: string }> {
    const resp = await apiClient.post<{ text: string }>(AI_ENDPOINT, {
      project_id: projectId,
      stage: 'strategy',
      action: 'rerun',
      expert,
      brief,
      accepted_recommendations: acceptedRecommendations,
      feedback: feedback || '',
    });
    return resp.data || (resp as any);
  },

  /** Synthesize accepted recommendations into final strategy */
  async synthesize(
    projectId: string,
    brief: CreativeBrief,
    recommendations: Record<string, string>,
  ): Promise<FinalStrategy> {
    const resp = await apiClient.post<FinalStrategy>(AI_ENDPOINT, {
      project_id: projectId,
      stage: 'strategy',
      action: 'synthesize',
      brief,
      recommendations,
    });
    return resp.data || (resp as any);
  },

  /** Approve final strategy — saves to DB and unlocks Research */
  async approveStrategy(projectId: string, strategy: FinalStrategy): Promise<void> {
    await apiClient.post(AI_ENDPOINT, {
      project_id: projectId,
      stage: 'strategy',
      action: 'approve',
      strategy,
    });
    // Also update project stage
    await apiClient.post(PROJECTS.stage(projectId), { stage: 'Research' });
  },
};
