/**
 * services/research.service.ts
 *
 * Research Lab — questions, sources, claims, evidence maps, and findings.
 */

import { apiClient } from '../lib/api/client';
import { RESEARCH } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  ResearchQuestion,
  Source,
  Claim,
  EvidenceMap,
  ResearchCoverage,
  ResearchFinding,
  CreateResearchQuestionPayload,
  AddSourcePayload,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockResearch = {
  async getQuestions(_p: string): Promise<ResearchQuestion[]> { return []; },
  async createQuestion(_p: CreateResearchQuestionPayload): Promise<ResearchQuestion> { return {} as ResearchQuestion; },
  async updateQuestion(_p: string, _qid: string, _d: Partial<ResearchQuestion>): Promise<ResearchQuestion> { return {} as ResearchQuestion; },
  async getSources(_p: string): Promise<Source[]> { return []; },
  async createSource(_p: AddSourcePayload): Promise<Source> { return {} as Source; },
  async updateSource(_p: string, _sid: string, _d: Partial<Source>): Promise<Source> { return {} as Source; },
  async deleteSource(_p: string, _sid: string): Promise<void> {},
  async getClaims(_p: string): Promise<Claim[]> { return []; },
  async linkClaimSource(_p: string, _cid: string, _sid: string): Promise<Claim> { return {} as Claim; },
  async getEvidenceMap(_p: string): Promise<EvidenceMap> { return { projectId: _p, nodes: [], edges: [] }; },
  async getCoverage(_p: string): Promise<ResearchCoverage> { return {} as ResearchCoverage; },
  async getFindings(_p: string): Promise<ResearchFinding[]> { return []; },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realResearch = {
  async getQuestions(projectId: string): Promise<ResearchQuestion[]> {
    return (await apiClient.get<ResearchQuestion[]>(RESEARCH.questions(projectId))).data;
  },
  async createQuestion(payload: CreateResearchQuestionPayload): Promise<ResearchQuestion> {
    return (await apiClient.post<ResearchQuestion>(RESEARCH.createQuestion(payload.projectId), payload)).data;
  },
  async updateQuestion(projectId: string, questionId: string, delta: Partial<ResearchQuestion>): Promise<ResearchQuestion> {
    return (await apiClient.patch<ResearchQuestion>(RESEARCH.updateQuestion(projectId, questionId), delta)).data;
  },
  async getSources(projectId: string): Promise<Source[]> {
    return (await apiClient.get<Source[]>(RESEARCH.sources(projectId))).data;
  },
  async createSource(payload: AddSourcePayload): Promise<Source> {
    return (await apiClient.post<Source>(RESEARCH.createSource(payload.projectId), payload)).data;
  },
  async updateSource(projectId: string, sourceId: string, delta: Partial<Source>): Promise<Source> {
    return (await apiClient.patch<Source>(RESEARCH.updateSource(projectId, sourceId), delta)).data;
  },
  async deleteSource(projectId: string, sourceId: string): Promise<void> {
    await apiClient.delete(RESEARCH.deleteSource(projectId, sourceId));
  },
  async getClaims(projectId: string): Promise<Claim[]> {
    return (await apiClient.get<Claim[]>(RESEARCH.claims(projectId))).data;
  },
  async linkClaimSource(projectId: string, claimId: string, sourceId: string): Promise<Claim> {
    return (await apiClient.post<Claim>(RESEARCH.linkClaimSource(projectId, claimId), { sourceId })).data;
  },
  async getEvidenceMap(projectId: string): Promise<EvidenceMap> {
    return (await apiClient.get<EvidenceMap>(RESEARCH.evidenceMap(projectId))).data;
  },
  async getCoverage(projectId: string): Promise<ResearchCoverage> {
    return (await apiClient.get<ResearchCoverage>(RESEARCH.coverage(projectId))).data;
  },
  async getFindings(projectId: string): Promise<ResearchFinding[]> {
    return (await apiClient.get<ResearchFinding[]>(RESEARCH.findings(projectId))).data;
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockResearch : realResearch;

export const researchService = {
  getQuestions:   (projectId: string) => adapter.getQuestions(projectId),
  createQuestion: (p: CreateResearchQuestionPayload) => adapter.createQuestion(p),
  updateQuestion: (projectId: string, questionId: string, delta: Partial<ResearchQuestion>) => adapter.updateQuestion(projectId, questionId, delta),
  getSources:     (projectId: string) => adapter.getSources(projectId),
  createSource:   (p: AddSourcePayload) => adapter.createSource(p),
  updateSource:   (projectId: string, sourceId: string, delta: Partial<Source>) => adapter.updateSource(projectId, sourceId, delta),
  deleteSource:   (projectId: string, sourceId: string) => adapter.deleteSource(projectId, sourceId),
  getClaims:      (projectId: string) => adapter.getClaims(projectId),
  linkClaimSource:(projectId: string, claimId: string, sourceId: string) => adapter.linkClaimSource(projectId, claimId, sourceId),
  getEvidenceMap: (projectId: string) => adapter.getEvidenceMap(projectId),
  getCoverage:    (projectId: string) => adapter.getCoverage(projectId),
  getFindings:    (projectId: string) => adapter.getFindings(projectId),
};
