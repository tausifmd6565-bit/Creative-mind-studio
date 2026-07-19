/**
 * services/analytics.service.ts
 *
 * Performance workspace — KPI summaries, retention, audience, and Creator DNA.
 */

import { apiClient } from '../lib/api/client';
import { ANALYTICS } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  AnalyticsSnapshot,
  RetentionDataPoint,
  AudienceInsights,
  PlatformBreakdown,
  AnalyticsRecommendation,
  ViralityPredictionComparison,
  LearningEntry,
  CreatorDNA,
  TimeRange,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockAnalytics = {
  async getSummary(_p: string, _range?: TimeRange): Promise<AnalyticsSnapshot | null> { return null; },
  async importMetrics(_p: string, _data: Record<string, unknown>): Promise<void> {},
  async getRetention(_p: string): Promise<RetentionDataPoint[]> { return []; },
  async getAudience(_p: string): Promise<AudienceInsights | null> { return null; },
  async getPlatforms(_p: string): Promise<PlatformBreakdown[]> { return []; },
  async getRecommendations(_p: string): Promise<AnalyticsRecommendation[]> { return []; },
  async getViralityComparison(_p: string): Promise<ViralityPredictionComparison | null> { return null; },
  async getLearningLog(_p: string): Promise<LearningEntry[]> { return []; },
  async getCreatorDna(): Promise<CreatorDNA | null> { return null; },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realAnalytics = {
  async getSummary(projectId: string, range?: TimeRange): Promise<AnalyticsSnapshot | null> {
    const qs = range ? `?range=${range}` : '';
    return (await apiClient.get<AnalyticsSnapshot | null>(`${ANALYTICS.summary(projectId)}${qs}`)).data;
  },
  async importMetrics(projectId: string, data: Record<string, unknown>): Promise<void> {
    await apiClient.post(ANALYTICS.importMetrics(projectId), data);
  },
  async getRetention(projectId: string): Promise<RetentionDataPoint[]> {
    return (await apiClient.get<RetentionDataPoint[]>(ANALYTICS.retention(projectId))).data;
  },
  async getAudience(projectId: string): Promise<AudienceInsights | null> {
    return (await apiClient.get<AudienceInsights | null>(ANALYTICS.audience(projectId))).data;
  },
  async getPlatforms(projectId: string): Promise<PlatformBreakdown[]> {
    return (await apiClient.get<PlatformBreakdown[]>(ANALYTICS.platforms(projectId))).data;
  },
  async getRecommendations(projectId: string): Promise<AnalyticsRecommendation[]> {
    return (await apiClient.get<AnalyticsRecommendation[]>(ANALYTICS.recommendations(projectId))).data;
  },
  async getViralityComparison(projectId: string): Promise<ViralityPredictionComparison | null> {
    return (await apiClient.get<ViralityPredictionComparison | null>(ANALYTICS.viralityComp(projectId))).data;
  },
  async getLearningLog(projectId: string): Promise<LearningEntry[]> {
    return (await apiClient.get<LearningEntry[]>(ANALYTICS.learningLog(projectId))).data;
  },
  async getCreatorDna(): Promise<CreatorDNA | null> {
    return (await apiClient.get<CreatorDNA | null>(ANALYTICS.creatorDna)).data;
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockAnalytics : realAnalytics;

export const analyticsService = {
  getSummary:           (projectId: string, range?: TimeRange) => adapter.getSummary(projectId, range),
  importMetrics:        (projectId: string, data: unknown)     => adapter.importMetrics(projectId, data),
  getRetention:         (projectId: string) => adapter.getRetention(projectId),
  getAudience:          (projectId: string) => adapter.getAudience(projectId),
  getPlatforms:         (projectId: string) => adapter.getPlatforms(projectId),
  getRecommendations:   (projectId: string) => adapter.getRecommendations(projectId),
  getViralityComparison:(projectId: string) => adapter.getViralityComparison(projectId),
  getLearningLog:       (projectId: string) => adapter.getLearningLog(projectId),
  getCreatorDna:        ()                  => adapter.getCreatorDna(),
};
