/**
 * mocks/research.mock.ts
 *
 * Research Lab data for "The Last Human Translator".
 *
 * Research questions, sources, claims, evidence map, documents,
 * coverage stats, and AI-generated findings.
 */

import type {
  ResearchQuestion,
  Source,
  Claim,
  ClaimSource,
  EvidenceMap,
  ResearchDocument,
  ResearchCoverage,
  ResearchFinding,
} from '../types';
import { PROJECT_ID, ACTOR } from './project.mock';

// ─── Research questions ───────────────────────────────────────────────────────

export const MOCK_RESEARCH_QUESTIONS: ResearchQuestion[] = [
  {
    id: 'rq-001',
    projectId: PROJECT_ID,
    question: 'Can LLMs replicate cultural nuance in Arabic–English professional translation?',
    subQuestions: [
      'What specific cultural idioms consistently fail in GPT-4 and Claude?',
      'How do professional translators identify LLM output versus human output?',
      'What is the error rate of LLMs on UN-level diplomatic texts?',
    ],
    assignedResearcher: ACTOR.dinaKarimi,
    status: 'verified',
    priority: 'critical',
    sourceCount: 4,
    dueAt: '2024-05-21T00:00:00Z',
    tags: ['AI', 'NLP', 'cultural-nuance', 'Arabic'],
    createdAt: '2024-05-14T09:00:00Z',
    updatedAt: '2024-05-21T17:00:00Z',
  },
  {
    id: 'rq-002',
    projectId: PROJECT_ID,
    question: 'What is the current employment landscape for professional translators in 2023–2024?',
    subQuestions: [
      'How many professional translators are registered with AIIC globally?',
      'What percentage have reported loss of income due to AI tools?',
      'Which translation sub-fields are most affected?',
    ],
    assignedResearcher: ACTOR.dinaKarimi,
    status: 'verified',
    priority: 'high',
    sourceCount: 3,
    dueAt: '2024-05-18T00:00:00Z',
    tags: ['employment', 'AIIC', 'translation-industry'],
    createdAt: '2024-05-14T09:00:00Z',
    updatedAt: '2024-05-18T15:00:00Z',
  },
  {
    id: 'rq-003',
    projectId: PROJECT_ID,
    question: 'What qualities of human translation are most valued by institutional clients?',
    subQuestions: [
      'How do diplomatic institutions evaluate translation quality?',
      'What does "cultural competency" mean in a UN or EU translation context?',
    ],
    assignedResearcher: ACTOR.dinaKarimi,
    status: 'verified',
    priority: 'high',
    sourceCount: 2,
    dueAt: '2024-05-20T00:00:00Z',
    tags: ['institutional', 'diplomacy', 'quality'],
    createdAt: '2024-05-14T09:00:00Z',
    updatedAt: '2024-05-20T11:00:00Z',
  },
  {
    id: 'rq-004',
    projectId: PROJECT_ID,
    question: 'What are the ethical considerations when documenting a professional whose livelihood is threatened by AI?',
    subQuestions: [
      'How do we obtain informed consent that covers documentary distribution?',
      'What are the duties of disclosure to the subject regarding commercial benefit?',
    ],
    assignedResearcher: ACTOR.dinaKarimi,
    status: 'verified',
    priority: 'normal',
    sourceCount: 2,
    dueAt: '2024-05-16T00:00:00Z',
    tags: ['ethics', 'consent', 'documentary-journalism'],
    createdAt: '2024-05-14T09:00:00Z',
    updatedAt: '2024-05-16T16:00:00Z',
  },
  {
    id: 'rq-005',
    projectId: PROJECT_ID,
    question: 'What is the historical and linguistic significance of Arabic–English translation in geopolitics?',
    subQuestions: [
      'Key historical examples where translation errors had geopolitical consequences?',
      'What institutions have Arabic–English translation at their core?',
    ],
    assignedResearcher: ACTOR.dinaKarimi,
    status: 'verified',
    priority: 'normal',
    sourceCount: 1,
    dueAt: '2024-05-22T00:00:00Z',
    tags: ['history', 'geopolitics', 'Arabic'],
    createdAt: '2024-05-14T09:00:00Z',
    updatedAt: '2024-05-22T14:00:00Z',
  },
];

// ─── Sources ──────────────────────────────────────────────────────────────────

export const MOCK_SOURCES: Source[] = [
  {
    id: 'src-001',
    projectId: PROJECT_ID,
    title: 'GPT-4 Cultural Idiom Benchmark Study',
    publisher: 'MIT Media Lab',
    author: 'Dr. Elena Vasquez et al.',
    publicationDate: '2023-09-14',
    sourceType: 'academic',
    url: 'https://media.mit.edu/research/llm-cultural-nuance-2023',
    relevantQuotation: '"LLMs demonstrate a statistically significant failure rate of 34% on culturally embedded Arabic idioms that lack direct English equivalents, compared to a 3% failure rate among professional human translators."',
    reportPage: '14',
    tier: 'primary',
    confidenceScore: 96,
    freshnessScore: 92,
    assignedResearcher: ACTOR.dinaKarimi,
    verificationStatus: 'verified',
    linkedQuestionIds: ['rq-001'],
    documentType: 'pdf',
    thumbnailGradient: 'from-blue-700 to-indigo-900',
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-05-21T17:00:00Z',
  },
  {
    id: 'src-002',
    projectId: PROJECT_ID,
    title: 'AIIC Global Translators Census 2024',
    publisher: 'International Association of Conference Interpreters',
    author: 'AIIC Research Department',
    publicationDate: '2024-01-30',
    sourceType: 'institutional',
    url: 'https://www.aiic.net/census-2024',
    relevantQuotation: '"Of 6.2 million registered professional translators globally, 41% have reported a decline in contract volume directly attributable to AI translation tools since 2022."',
    reportPage: '7',
    tier: 'primary',
    confidenceScore: 98,
    freshnessScore: 99,
    assignedResearcher: ACTOR.dinaKarimi,
    verificationStatus: 'verified',
    linkedQuestionIds: ['rq-002'],
    documentType: 'report',
    thumbnailGradient: 'from-emerald-700 to-teal-900',
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-05-18T15:00:00Z',
  },
  {
    id: 'src-003',
    projectId: PROJECT_ID,
    title: 'UNESCO Endangered Languages Atlas — Digital Edition 2023',
    publisher: 'UNESCO',
    author: 'UNESCO Language Division',
    publicationDate: '2023-11-15',
    sourceType: 'government',
    url: 'https://en.unesco.org/languages-atlas/2023',
    relevantQuotation: '"Of the 6,000+ active languages tracked, Arabic dialects represent 420 distinct regional variants, each carrying unique cultural knowledge that standard NLP models do not represent."',
    reportPage: '22',
    tier: 'secondary',
    confidenceScore: 94,
    freshnessScore: 90,
    assignedResearcher: ACTOR.dinaKarimi,
    verificationStatus: 'verified',
    linkedQuestionIds: ['rq-001', 'rq-005'],
    documentType: 'report',
    thumbnailGradient: 'from-amber-700 to-orange-900',
    createdAt: '2024-05-16T09:00:00Z',
    updatedAt: '2024-05-22T14:00:00Z',
  },
  {
    id: 'src-004',
    projectId: PROJECT_ID,
    title: 'Documentary Ethics in the Age of AI — A Practitioner Guide',
    publisher: 'International Documentary Association',
    author: 'IDA Ethics Committee',
    publicationDate: '2024-02-10',
    sourceType: 'institutional',
    url: 'https://www.documentary.org/ethics-ai-2024',
    relevantQuotation: '"Filmmakers must obtain separate written consent for any commercial platform distribution, and must disclose all revenue-sharing arrangements to subjects prior to production completion."',
    reportPage: '31',
    tier: 'primary',
    confidenceScore: 91,
    freshnessScore: 97,
    assignedResearcher: ACTOR.dinaKarimi,
    verificationStatus: 'verified',
    linkedQuestionIds: ['rq-004'],
    documentType: 'pdf',
    thumbnailGradient: 'from-purple-700 to-violet-900',
    createdAt: '2024-05-15T11:00:00Z',
    updatedAt: '2024-05-16T16:00:00Z',
  },
];

// ─── Claims ───────────────────────────────────────────────────────────────────

export const MOCK_CLAIMS: Claim[] = [
  {
    id: 'claim-001',
    projectId: PROJECT_ID,
    scriptBlockId: 'sb-007',
    claimText: 'LLMs demonstrate a 34% failure rate on culturally embedded Arabic idioms, compared to 3% for professional human translators.',
    status: 'verified',
    verifiedBy: ACTOR.dinaKarimi,
    verifiedAt: '2024-05-21T17:30:00Z',
    sources: [
      {
        id: 'cs-001',
        claimId: 'claim-001',
        sourceId: 'src-001',
        sourceTitle: 'GPT-4 Cultural Idiom Benchmark Study',
        publisher: 'MIT Media Lab',
        page: '14',
        confidenceScore: 96,
        verificationStatus: 'verified',
        url: 'https://media.mit.edu/research/llm-cultural-nuance-2023',
      },
    ],
    createdAt: '2024-05-21T09:00:00Z',
    updatedAt: '2024-05-21T17:30:00Z',
  },
  {
    id: 'claim-002',
    projectId: PROJECT_ID,
    scriptBlockId: 'sb-012',
    claimText: '41% of professional translators have reported a decline in contract volume attributable to AI tools since 2022.',
    status: 'verified',
    verifiedBy: ACTOR.dinaKarimi,
    verifiedAt: '2024-05-18T16:00:00Z',
    sources: [
      {
        id: 'cs-002',
        claimId: 'claim-002',
        sourceId: 'src-002',
        sourceTitle: 'AIIC Global Translators Census 2024',
        publisher: 'AIIC',
        page: '7',
        confidenceScore: 98,
        verificationStatus: 'verified',
        url: 'https://www.aiic.net/census-2024',
      },
    ],
    createdAt: '2024-05-18T09:00:00Z',
    updatedAt: '2024-05-18T16:00:00Z',
  },
];

// ─── Evidence map ─────────────────────────────────────────────────────────────

export const MOCK_EVIDENCE_MAP: EvidenceMap = {
  projectId: PROJECT_ID,
  nodes: [
    { id: 'en-claim-001', type: 'claim',           label: 'LLM 34% failure rate on Arabic idioms', x: 400, y: 200 },
    { id: 'en-src-001',   type: 'primary-source',  label: 'MIT Media Lab — GPT-4 Benchmark', subtitle: 'Academic, 2023', x: 200, y: 100 },
    { id: 'en-src-003',   type: 'supporting-source',label: 'UNESCO Languages Atlas 2023', subtitle: 'Government, 2023', x: 600, y: 100 },
    { id: 'en-sb-007',    type: 'script-usage',    label: 'Script Block 7 — Narration', x: 400, y: 360 },
    { id: 'en-claim-002', type: 'claim',           label: '41% translator income decline', x: 800, y: 200 },
    { id: 'en-src-002',   type: 'primary-source',  label: 'AIIC Census 2024', subtitle: 'Institutional, 2024', x: 900, y: 100 },
    { id: 'en-sb-012',    type: 'script-usage',    label: 'Script Block 12 — Statistics', x: 800, y: 360 },
  ],
  edges: [
    { id: 'ee-001', source: 'en-src-001', target: 'en-claim-001', label: 'supports' },
    { id: 'ee-002', source: 'en-src-003', target: 'en-claim-001', label: 'supports' },
    { id: 'ee-003', source: 'en-claim-001', target: 'en-sb-007',  label: 'used in' },
    { id: 'ee-004', source: 'en-src-002', target: 'en-claim-002', label: 'supports' },
    { id: 'ee-005', source: 'en-claim-002', target: 'en-sb-012',  label: 'used in' },
  ],
};

// ─── Research documents ───────────────────────────────────────────────────────

export const MOCK_RESEARCH_DOCUMENTS: ResearchDocument[] = [
  {
    id: 'rdoc-001',
    projectId: PROJECT_ID,
    title: 'GPT-4 Cultural Idiom Benchmark Study',
    documentType: 'pdf',
    thumbnailGradient: 'from-blue-700 to-indigo-900',
    publisher: 'MIT Media Lab',
    pageCount: 42,
    fileSizeLabel: '2.4 MB',
    sourceId: 'src-001',
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-05-15T09:00:00Z',
  },
  {
    id: 'rdoc-002',
    projectId: PROJECT_ID,
    title: 'AIIC Global Translators Census 2024',
    documentType: 'report',
    thumbnailGradient: 'from-emerald-700 to-teal-900',
    publisher: 'AIIC',
    pageCount: 88,
    fileSizeLabel: '5.1 MB',
    sourceId: 'src-002',
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-05-15T10:00:00Z',
  },
];

// ─── Coverage stats ───────────────────────────────────────────────────────────

export const MOCK_RESEARCH_COVERAGE: ResearchCoverage = {
  coveragePercent:     100,
  verifiedSources:     4,
  pendingVerification: 0,
  evidenceQuality:     94,
  overallConfidence:   95,
  totalSources:        4,
};

// ─── Findings ─────────────────────────────────────────────────────────────────

export const MOCK_RESEARCH_FINDINGS: ResearchFinding[] = [
  {
    id: 'rf-001',
    projectId: PROJECT_ID,
    title: 'LLMs systematically fail on Arabic cultural idioms',
    summary: 'Peer-reviewed benchmarks confirm that large language models produce statistically significant errors (34%) when translating culturally embedded Arabic idioms that lack direct English equivalents — validating the documentary\'s central claim.',
    evidence: 'MIT Media Lab benchmark study (2023) tested GPT-4 on 1,200 Arabic idioms. Human translators achieved 97% accuracy; GPT-4 achieved 66%.',
    linkedSourceIds: ['src-001', 'src-003'],
    confidence: 96,
    priority: 'critical',
    agentId: 'ai-01',
    createdAt: '2024-05-22T09:00:00Z',
    updatedAt: '2024-05-22T09:00:00Z',
  },
  {
    id: 'rf-002',
    projectId: PROJECT_ID,
    title: 'Professional translation industry in measurable decline',
    summary: 'Census data from AIIC confirms quantifiable market disruption — 41% of translators report declining income, providing documentary credibility for Layla\'s personal narrative.',
    evidence: 'AIIC Census 2024 surveyed 22,000 registered translators. The data is the most authoritative current source on employment impact.',
    linkedSourceIds: ['src-002'],
    confidence: 98,
    priority: 'high',
    agentId: 'ai-01',
    createdAt: '2024-05-22T09:30:00Z',
    updatedAt: '2024-05-22T09:30:00Z',
  },
];
