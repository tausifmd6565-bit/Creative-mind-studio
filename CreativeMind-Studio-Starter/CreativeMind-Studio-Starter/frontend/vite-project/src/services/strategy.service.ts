/**
 * services/strategy.service.ts
 *
 * Strategy War Room — debate sessions, scorecards, ledger, and brief export.
 */

import { apiClient } from '../lib/api/client';
import { STRATEGY } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  DebateSession,
  Scorecard,
  LedgerEntry,
  ConceptBrief,
  StrategyDecision,
  StartDebatePayload,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockStrategy = {
  async startDebate(_p: StartDebatePayload): Promise<DebateSession> { return {} as DebateSession; },
  async getDebate(_projectId: string): Promise<DebateSession | null> { return null; },
  async pivot(_projectId: string, _suggestion: string): Promise<void> {},
  async getScorecard(_projectId: string): Promise<Scorecard[]> { return []; },
  async getLedger(_projectId: string): Promise<LedgerEntry[]> { return []; },
  async getBrief(_projectId: string): Promise<ConceptBrief | null> { return null; },
  async getDecision(_projectId: string): Promise<StrategyDecision | null> { return null; },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realStrategy = {
  async startDebate(payload: StartDebatePayload): Promise<DebateSession> {
    return (await apiClient.post<DebateSession>(STRATEGY.startDebate(payload.projectId), payload)).data;
  },
  async getDebate(projectId: string): Promise<DebateSession | null> {
    return (await apiClient.get<DebateSession | null>(STRATEGY.getDebate(projectId))).data;
  },
  async pivot(projectId: string, suggestion: string): Promise<void> {
    await apiClient.post(STRATEGY.pivot(projectId), { suggestion });
  },
  async getScorecard(projectId: string): Promise<Scorecard[]> {
    return (await apiClient.get<Scorecard[]>(STRATEGY.scorecard(projectId))).data;
  },
  async getLedger(projectId: string): Promise<LedgerEntry[]> {
    return (await apiClient.get<LedgerEntry[]>(STRATEGY.ledger(projectId))).data;
  },
  async getBrief(projectId: string): Promise<ConceptBrief | null> {
    return (await apiClient.get<ConceptBrief | null>(STRATEGY.brief(projectId))).data;
  },
  async getDecision(projectId: string): Promise<StrategyDecision | null> {
    return (await apiClient.get<StrategyDecision | null>(STRATEGY.brief(projectId))).data as unknown as StrategyDecision | null;
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockStrategy : realStrategy;

export const strategyService = {
  startDebate: (p: StartDebatePayload) => adapter.startDebate(p),
  getDebate:   (projectId: string)     => adapter.getDebate(projectId),
  pivot:       (projectId: string, suggestion: string) => adapter.pivot(projectId, suggestion),
  getScorecard:(projectId: string)     => adapter.getScorecard(projectId),
  getLedger:   (projectId: string)     => adapter.getLedger(projectId),
  getBrief:    (projectId: string)     => adapter.getBrief(projectId),
  getDecision: (projectId: string)     => adapter.getDecision(projectId),
};
