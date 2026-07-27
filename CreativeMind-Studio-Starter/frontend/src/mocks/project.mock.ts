/**
 * mocks/project.mock.ts
 *
 * Canonical project: "The Last Human Translator"
 *
 * This single project is the shared reference for every other mock module.
 * Every workspace, scene, asset, review, and notification references these IDs.
 */

import type { Project, ProjectCard, ProjectPhase, Task, ApprovalRequest, Agent } from '../types';

// ─── Canonical IDs (imported by every other mock module) ──────────────────────

export const PROJECT_ID     = 'proj-tlht-001';
export const WORKSPACE_ID   = 'ws-creativemind-01';

// ─── Team actor refs (used across all mocks) ──────────────────────────────────

export const ACTOR = {
  nourSaleh:    { id: 'u-01', name: 'Nour Saleh',       initials: 'NS', color: '#8B5CF6', isAi: false as const },
  ayeshaRahman: { id: 'u-02', name: 'Ayesha Rahman',    initials: 'AR', color: '#3B82F6', isAi: false as const },
  laylaHassan:  { id: 'u-03', name: 'Layla Hassan',     initials: 'LH', color: '#EC4899', isAi: false as const },
  ziadMansour:  { id: 'u-04', name: 'Ziad Mansour',     initials: 'ZM', color: '#10B981', isAi: false as const },
  ramiAlFarsi:  { id: 'u-05', name: 'Rami Al-Farsi',    initials: 'RF', color: '#F97316', isAi: false as const },
  dinaKarimi:   { id: 'u-06', name: 'Dina Karimi',      initials: 'DK', color: '#06B6D4', isAi: false as const },
  saraAlMutairi:{ id: 'u-07', name: 'Sara Al-Mutairi',  initials: 'SM', color: '#84CC16', isAi: false as const },
  insightEngine:{ id: 'ai-01', name: 'Insight Engine',  initials: 'IE', color: '#7C3AED', isAi: true  as const },
  scriptAgent:  { id: 'ai-02', name: 'Scriptwriter AI', initials: 'SA', color: '#8B5CF6', isAi: true  as const },
  strategyAI:   { id: 'ai-03', name: 'Strategy Director',initials: 'SD', color: '#EC4899', isAi: true as const },
} as const;

// ─── Project phases ───────────────────────────────────────────────────────────

export const PROJECT_PHASES: ProjectPhase[] = [
  {
    id: 'strategy',
    label: 'Strategy',
    status: 'completed',
    completion: 100,
    responsible: ACTOR.ayeshaRahman,
    startedAt: '2024-05-01T09:00:00Z',
    completedAt: '2024-05-10T18:00:00Z',
    lastUpdatedAt: '2024-05-10T18:00:00Z',
  },
  {
    id: 'virality-twin',
    label: 'Virality Twin',
    status: 'completed',
    completion: 100,
    responsible: ACTOR.strategyAI,
    startedAt: '2024-05-11T09:00:00Z',
    completedAt: '2024-05-14T16:00:00Z',
    lastUpdatedAt: '2024-05-14T16:00:00Z',
  },
  {
    id: 'research',
    label: 'Research',
    status: 'completed',
    completion: 100,
    responsible: ACTOR.dinaKarimi,
    startedAt: '2024-05-14T09:00:00Z',
    completedAt: '2024-05-28T17:00:00Z',
    lastUpdatedAt: '2024-05-28T17:00:00Z',
  },
  {
    id: 'script',
    label: 'Script',
    status: 'completed',
    completion: 100,
    responsible: ACTOR.ziadMansour,
    startedAt: '2024-05-29T09:00:00Z',
    completedAt: '2024-06-10T17:00:00Z',
    lastUpdatedAt: '2024-06-10T17:00:00Z',
  },
  {
    id: 'assets',
    label: 'Assets',
    status: 'completed',
    completion: 100,
    responsible: ACTOR.laylaHassan,
    startedAt: '2024-06-03T09:00:00Z',
    completedAt: '2024-06-11T16:00:00Z',
    lastUpdatedAt: '2024-06-11T16:00:00Z',
  },
  {
    id: 'editing',
    label: 'Editing',
    status: 'in-progress',
    completion: 74,
    responsible: ACTOR.ramiAlFarsi,
    startedAt: '2024-06-11T09:00:00Z',
    lastUpdatedAt: '2024-06-14T09:00:00Z',
  },
  {
    id: 'review',
    label: 'Review',
    status: 'in-progress',
    completion: 40,
    responsible: ACTOR.saraAlMutairi,
    startedAt: '2024-06-13T09:00:00Z',
    lastUpdatedAt: '2024-06-14T10:00:00Z',
  },
  {
    id: 'distribution',
    label: 'Distribution',
    status: 'not-started',
    completion: 0,
    responsible: ACTOR.nourSaleh,
    lastUpdatedAt: '2024-06-14T00:00:00Z',
  },
  {
    id: 'performance',
    label: 'Performance',
    status: 'not-started',
    completion: 0,
    responsible: ACTOR.insightEngine,
    lastUpdatedAt: '2024-06-14T00:00:00Z',
  },
];

// ─── Agents active on the project ─────────────────────────────────────────────

export const PROJECT_AGENTS: Agent[] = [
  {
    id: 'ai-01',
    name: 'Insight Engine',
    role: 'research-engine',
    model: 'claude-3-5-sonnet',
    color: '#7C3AED',
    initials: 'IE',
    status: 'completed',
    progress: 100,
    confidencePct: 92,
    currentTask: 'Research phase complete — 12 sources verified',
    isActive: true,
    lastRunAt: '2024-05-28T17:00:00Z',
  },
  {
    id: 'ai-02',
    name: 'Scriptwriter AI',
    role: 'script-writer',
    model: 'gpt-4o',
    color: '#8B5CF6',
    initials: 'SA',
    status: 'completed',
    progress: 100,
    confidencePct: 88,
    currentTask: 'Script finalised — 7 sections approved',
    isActive: true,
    lastRunAt: '2024-06-10T17:00:00Z',
  },
  {
    id: 'ai-03',
    name: 'Strategy Director',
    role: 'strategy-director',
    model: 'claude-3-opus',
    color: '#EC4899',
    initials: 'SD',
    status: 'completed',
    progress: 100,
    confidencePct: 94,
    currentTask: 'Strategy debate concluded — consensus 91%',
    isActive: false,
    lastRunAt: '2024-05-10T18:00:00Z',
  },
  {
    id: 'ai-04',
    name: 'Rights Sentinel',
    role: 'risk-critic',
    model: 'gpt-4o',
    color: '#EF4444',
    initials: 'RS',
    status: 'idle',
    progress: 0,
    confidencePct: 97,
    currentTask: 'Standby — awaiting distribution phase',
    isActive: true,
    lastRunAt: '2024-06-11T16:00:00Z',
  },
];

// ─── Full project ─────────────────────────────────────────────────────────────

export const MOCK_PROJECT: Project = {
  id:                 PROJECT_ID,
  workspaceId:        WORKSPACE_ID,
  title:              'The Last Human Translator',
  description:        'A documentary exploring how artificial intelligence is transforming professional translation through the story of one human translator — Layla — who has spent 22 years bridging cultures between Arabic and English.',
  thumbnailGradient:  'from-violet-800 via-indigo-900 to-slate-950',
  status:             'in-progress',
  contentType:        'documentary',
  primaryPlatform:    'youtube',
  targetPlatforms:    ['youtube', 'youtube-shorts', 'linkedin'],
  targetAudience:     'Educated professionals aged 28–45 interested in technology, linguistics, and the future of work',
  primaryGoal:        'education',
  tone:               'contemplative',
  language:           'english',
  estimatedDuration:  '18:30',
  aspectRatio:        '16:9',
  color:              '#8B5CF6',
  ownerId:            'u-01',
  teamMemberIds:      ['u-01','u-02','u-03','u-04','u-05','u-06','u-07'],
  deadline:           '2024-06-28T00:00:00Z',
  overallProgress:    72,
  activePhaseId:      'editing',
  phases:             PROJECT_PHASES,
  tags:               ['AI', 'linguistics', 'documentary', 'future-of-work', 'translation'],
  aiCreditsUsed:      1_840,
  taskSummary:        { total: 34, done: 26, blocked: 1 },
  createdAt:          '2024-04-28T09:00:00Z',
  updatedAt:          '2024-06-14T10:30:00Z',
};

// ─── ProjectCard variant (for list views) ────────────────────────────────────

export const MOCK_PROJECT_CARD: ProjectCard = {
  id:                PROJECT_ID,
  workspaceId:       WORKSPACE_ID,
  title:             'The Last Human Translator',
  status:            'in-progress',
  contentType:       'documentary',
  primaryPlatform:   'youtube',
  color:             '#8B5CF6',
  thumbnailGradient: 'from-violet-800 via-indigo-900 to-slate-950',
  overallProgress:   72,
  activePhaseId:     'editing',
  deadline:          '2024-06-28T00:00:00Z',
  ownerRef:          ACTOR.nourSaleh,
  updatedAt:         '2024-06-14T10:30:00Z',
};
