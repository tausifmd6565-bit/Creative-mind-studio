/**
 * mocks/virality.mock.ts
 *
 * Virality Twin snapshot for "The Last Human Translator".
 *
 * Comparison cards, metrics, retention data, radar chart, insights,
 * confidence model, and right-panel opportunities / risks / quick wins.
 */

import type {
  ViralityTwinSnapshot,
  ViralityContentCard,
  ComparisonMetric,
  RetentionDataPoint,
  RadarDataPoint,
  ViralityInsight,
  ViralityConfidence,
  ViralityRightPanel,
} from '../types';
import { PROJECT_ID, ACTOR } from './project.mock';

// ─── Content cards ────────────────────────────────────────────────────────────

export const CONCEPT_CARD: ViralityContentCard = {
  id: 'vc-concept-001',
  type: 'concept',
  title: 'The Last Human Translator',
  thumbnailGradient: 'from-violet-800 via-indigo-900 to-slate-950',
  platform: 'youtube',
  contentType: 'documentary',
  duration: '18:30',
  publishedAt: '2024-06-28T09:00:00Z',
  audienceType: 'Educated professionals 28–45',
  successLevel: 'high',
  channel: 'CreativeMind Studio',
};

export const SUCCESS_CARD: ViralityContentCard = {
  id: 'vc-success-001',
  type: 'success',
  title: 'I Spent 30 Days Replacing My Job With AI',
  thumbnailGradient: 'from-blue-700 via-cyan-800 to-slate-900',
  platform: 'youtube',
  contentType: 'documentary',
  duration: '22:14',
  publishedAt: '2023-11-07T14:00:00Z',
  audienceType: 'Tech professionals & creatives',
  successLevel: 'viral',
  views: '4.2M',
  engagementRate: 8.7,
  channel: 'Thomas Frank Explains',
};

export const FAILURE_CARD: ViralityContentCard = {
  id: 'vc-failure-001',
  type: 'failure',
  title: 'Why Human Translators Still Matter in 2023',
  thumbnailGradient: 'from-gray-700 via-gray-800 to-gray-950',
  platform: 'youtube',
  contentType: 'documentary',
  duration: '14:08',
  publishedAt: '2023-08-22T10:00:00Z',
  audienceType: 'Linguistics enthusiasts',
  successLevel: 'underperformed',
  views: '43K',
  engagementRate: 2.1,
  channel: 'LinguaWorld',
};

// ─── Comparison metrics ───────────────────────────────────────────────────────

export const MOCK_COMPARISON_METRICS: ComparisonMetric[] = [
  {
    id: 'hook-strength',
    label: 'Hook Strength',
    category: 'hook',
    concept: 'Hands on keyboard / Cairo ambient — 8 sec visual hook',
    success: 'AI job-replacement personal challenge — immediate stakes',
    failure: 'Expert talking head — abstract thesis opening',
    conceptStatus: 'better',
    successStatus: 'better',
    failureStatus: 'needs-improvement',
  },
  {
    id: 'title-clarity',
    label: 'Title Clarity',
    category: 'hook',
    concept: 'Emotionally provocative, SEO-optimised',
    success: 'Clear first-person challenge frame',
    failure: 'Defensive framing, low emotional stakes',
    conceptStatus: 'better',
    successStatus: 'better',
    failureStatus: 'needs-improvement',
  },
  {
    id: 'narrative-arc',
    label: 'Narrative Arc',
    category: 'structure',
    concept: '3-act arc with human protagonist',
    success: 'Diary-style personal journey',
    failure: 'Explainer format — no narrative tension',
    conceptStatus: 'better',
    successStatus: 'better',
    failureStatus: 'needs-improvement',
  },
  {
    id: 'evidence-density',
    label: 'Evidence Density',
    category: 'structure',
    concept: '12 verified sources, mid-film placement',
    success: 'Personal experiment — subjective data only',
    failure: '6 sources, shown in first 3 minutes',
    conceptStatus: 'better',
    successStatus: 'similar',
    failureStatus: 'needs-improvement',
  },
  {
    id: 'retention-drop',
    label: 'Drop-off at 60%',
    category: 'performance',
    concept: 'Predicted 72% retention at 11:00 mark',
    success: '68% retention — personal stakes maintain watch',
    failure: '31% retention — topic fatigue sets in at 8:30',
    conceptStatus: 'better',
    successStatus: 'better',
    failureStatus: 'needs-improvement',
  },
  {
    id: 'share-rate',
    label: 'Share Rate',
    category: 'performance',
    concept: 'Predicted 4.8% based on emotional benchmarks',
    success: '8.7% — highest in AI-content category 2023',
    failure: '0.9% — failed to generate emotional response',
    conceptStatus: 'better',
    successStatus: 'better',
    failureStatus: 'needs-improvement',
  },
  {
    id: 'production-quality',
    label: 'Production Quality',
    category: 'production',
    concept: '$24K budget — professional grade',
    success: 'Solo production — authentic but lo-fi',
    failure: 'Mid-range studio — generic visual language',
    conceptStatus: 'better',
    successStatus: 'similar',
    failureStatus: 'similar',
  },
  {
    id: 'thumbnail-appeal',
    label: 'Thumbnail Appeal',
    category: 'production',
    concept: 'Face + emotion + AI icon — A/B tested',
    success: 'Bold text overlay + surprised face',
    failure: 'Clean minimal design — no emotional trigger',
    conceptStatus: 'better',
    successStatus: 'better',
    failureStatus: 'needs-improvement',
  },
];

// ─── Retention curve ──────────────────────────────────────────────────────────

export const MOCK_RETENTION_DATA: RetentionDataPoint[] = [
  { second: 0,    label: '0:00', concept: 100, success: 100, failure: 100 },
  { second: 30,   label: '0:30', concept: 94,  success: 90,  failure: 85  },
  { second: 60,   label: '1:00', concept: 88,  success: 85,  failure: 72  },
  { second: 120,  label: '2:00', concept: 84,  success: 80,  failure: 61  },
  { second: 300,  label: '5:00', concept: 79,  success: 75,  failure: 48  },
  { second: 420,  label: '7:00', concept: 76,  success: 72,  failure: 39  },
  { second: 540,  label: '9:00', concept: 72,  success: 68,  failure: 33  },
  { second: 660,  label: '11:00',concept: 69,  success: 65,  failure: 28  },
  { second: 780,  label: '13:00',concept: 65,  success: 61,  failure: 24  },
  { second: 900,  label: '15:00',concept: 61,  success: 57,  failure: 19  },
  { second: 1050, label: '17:30',concept: 58,  success: 54,  failure: 16  },
  { second: 1110, label: '18:30',concept: 56,  success: 51,  failure: 14  },
];

// ─── Radar data ───────────────────────────────────────────────────────────────

export const MOCK_RADAR_DATA: RadarDataPoint[] = [
  { metric: 'Hook',       concept: 87, success: 95, failure: 42, fullMark: 100 },
  { metric: 'Story Arc',  concept: 88, success: 82, failure: 35, fullMark: 100 },
  { metric: 'Evidence',   concept: 91, success: 60, failure: 58, fullMark: 100 },
  { metric: 'Emotion',    concept: 89, success: 93, failure: 38, fullMark: 100 },
  { metric: 'Production', concept: 85, success: 65, failure: 62, fullMark: 100 },
  { metric: 'SEO',        concept: 92, success: 88, failure: 44, fullMark: 100 },
];

// ─── Insights ─────────────────────────────────────────────────────────────────

export const MOCK_VIRALITY_INSIGHTS: ViralityInsight[] = [
  {
    id: 'vi-001',
    category: 'shared-strength',
    priority: 'high',
    title: 'Emotional protagonist placement within first 90 seconds',
    description: 'Both your concept and the viral benchmark establish a relatable human subject before the 90-second mark. This is the single highest-correlated factor in documentary retention.',
    expectedImpact: '+14% average watch time vs. concept-first openings',
    agent: ACTOR.insightEngine,
  },
  {
    id: 'vi-002',
    category: 'missing-element',
    priority: 'critical',
    title: 'No personal-stakes hook in first 15 seconds',
    description: 'The viral benchmark opens with a direct personal challenge ("I\'m replacing my job with AI today"). Your current concept opens observationally. Adding a direct stakes declaration lifts early retention significantly.',
    expectedImpact: '+22% retention at the 30-second mark',
    agent: ACTOR.insightEngine,
  },
  {
    id: 'vi-003',
    category: 'risk-pattern',
    priority: 'high',
    title: 'Topic fatigue at the 8-minute mark in underperforming comparables',
    description: 'The failure comparable lost 35% of its audience between minutes 7–9. Your current script places the "evidence section" at minutes 7–11. Consider breaking this section with a strong visual sequence or scene change.',
    expectedImpact: 'Reduces predicted drop-off from 24% to ~14% in that segment',
    agent: ACTOR.strategyAI,
  },
  {
    id: 'vi-004',
    category: 'adjustment',
    priority: 'normal',
    title: 'Thumbnail A/B test: Face emotion vs. title text overlay',
    description: 'Viral documentaries in this category show 40% higher CTR when the thumbnail features a clear emotional expression alongside a provocative text overlay. Your current thumbnail concept is too minimal.',
    expectedImpact: '+1.8–2.4% CTR improvement based on category benchmarks',
    agent: ACTOR.strategyAI,
  },
];

// ─── Confidence model ─────────────────────────────────────────────────────────

export const MOCK_VIRALITY_CONFIDENCE: ViralityConfidence = {
  similarityScore:      78,
  successConfidence:    84,
  predictionConfidence: 79,
  datasetSize:          2_340,
  analysisAt:           '2024-05-14T16:00:00Z',
  datasetSource:        'YouTube Studio API + CreativeMind curated archive (2021–2024)',
  dataBadge:            'curated',
  note:                 'Analysis based on 2,340 documentary-format videos in the 10–25 minute range published on YouTube between 2021 and 2024. Similarity scoring weighted by platform, content type, audience segment, and narrative structure.',
};

// ─── Right panel ─────────────────────────────────────────────────────────────

export const MOCK_VIRALITY_RIGHT_PANEL: ViralityRightPanel = {
  opportunities: [
    { id: 'opp-v-001', label: 'Arabic-diaspora LinkedIn reach', detail: 'An Arabic-subtitled 60-second cut-down could reach 2M+ underserved LinkedIn professionals in the Gulf and diaspora communities.', impact: 'High' },
    { id: 'opp-v-002', label: 'AI news-cycle timing window', detail: 'Publication timed to the next major LLM announcement could amplify organic search traffic by 3–5×.', impact: 'Very High' },
    { id: 'opp-v-003', label: 'Educational licensing revenue', detail: 'University linguistics departments are actively licensing documentary content on AI and language. Estimate: $4–8K ancillary revenue.', impact: 'Medium' },
  ],
  risks: [
    { id: 'risk-v-001', label: 'Topic fatigue window', detail: 'The AI-vs-human discourse has a 6–9 month peak window. Delays past July 2024 risk a 30% reduction in organic discovery.', severity: 'high' },
    { id: 'risk-v-002', label: 'Victim framing backfire', detail: '"Last" in the title could be read as dystopian — suppressing shares from tech-optimist audiences.', severity: 'normal' },
  ],
  quickWins: [
    { id: 'qw-v-001', action: 'Add a 15-second personal-stakes hook to the opening', effort: 'low', gain: 'Predicted +22% early retention' },
    { id: 'qw-v-002', action: 'Break the evidence section (7–11 min) with a B-roll scene cut', effort: 'low', gain: 'Reduces drop-off risk by ~10%' },
    { id: 'qw-v-003', action: 'A/B test two thumbnail variants before publish', effort: 'medium', gain: '+1.8–2.4% CTR improvement' },
  ],
  recommendedNextStep: 'Revise the opening 15 seconds to include a direct personal-stakes statement from Layla, then run a thumbnail A/B test with the design team before scheduling publication.',
};

// ─── Root snapshot ────────────────────────────────────────────────────────────

export const MOCK_VIRALITY_SNAPSHOT: ViralityTwinSnapshot = {
  id:            'vts-tlht-001',
  projectId:     PROJECT_ID,
  dataBadge:     'curated',
  datasetCount:  2_340,
  filters: {
    platform:   'youtube',
    category:   'documentary',
    region:     'global',
    timeRange:  '2021–2024',
  },
  conceptCard:    CONCEPT_CARD,
  successCard:    SUCCESS_CARD,
  failureCard:    FAILURE_CARD,
  metrics:        MOCK_COMPARISON_METRICS,
  retentionData:  MOCK_RETENTION_DATA,
  radarData:      MOCK_RADAR_DATA,
  insights:       MOCK_VIRALITY_INSIGHTS,
  confidence:     MOCK_VIRALITY_CONFIDENCE,
  rightPanel:     MOCK_VIRALITY_RIGHT_PANEL,
  createdAt:      '2024-05-14T09:00:00Z',
  updatedAt:      '2024-05-14T16:00:00Z',
};
