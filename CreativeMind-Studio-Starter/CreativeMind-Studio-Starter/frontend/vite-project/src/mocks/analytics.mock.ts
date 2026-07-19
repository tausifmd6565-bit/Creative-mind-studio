/**
 * mocks/analytics.mock.ts
 *
 * Performance workspace data for "The Last Human Translator".
 *
 * KPI metrics, retention curve, platform breakdown, audience insights,
 * virality prediction comparison, AI recommendations, and learning entries.
 *
 * NOTE: The documentary is pre-publish — analytics are projected / simulated.
 */

import type {
  AnalyticsSnapshot,
  KpiMetric,
  RetentionDataPoint,
  PlatformBreakdown,
  CategoryPerformance,
  AudienceInsights,
  ViralityPredictionComparison,
  AnalyticsRecommendation,
  LearningEntry,
} from '../types';
import { PROJECT_ID, WORKSPACE_ID } from './project.mock';

// ─── KPI metrics (projected) ──────────────────────────────────────────────────

export const MOCK_KPI_METRICS: KpiMetric[] = [
  {
    id: 'views',
    label: 'Total Views',
    value: '—',
    rawValue: 0,
    unit: 'views',
    change: 0,
    trend: 'flat',
    sparkline: [0, 0, 0, 0, 0, 0, 0],
    timeRange: '30d',
    description: 'Projected: 180K–500K in first 30 days based on virality model',
    platform: 'youtube',
  },
  {
    id: 'impressions',
    label: 'Impressions',
    value: '—',
    rawValue: 0,
    unit: 'impressions',
    change: 0,
    trend: 'flat',
    sparkline: [0, 0, 0, 0, 0, 0, 0],
    timeRange: '30d',
    description: 'Projected: 1.2M–3.8M based on channel size and SEO score',
    platform: 'youtube',
  },
  {
    id: 'ctr',
    label: 'Click-Through Rate',
    value: '—',
    rawValue: 0,
    unit: '%',
    change: 0,
    trend: 'flat',
    sparkline: [0, 0, 0, 0, 0, 0, 0],
    timeRange: '30d',
    description: 'Projected: 4.2–6.8% — above category average of 3.1%',
    platform: 'youtube',
  },
  {
    id: 'retention',
    label: 'Avg. Retention',
    value: '—',
    rawValue: 0,
    unit: '%',
    change: 0,
    trend: 'flat',
    sparkline: [0, 0, 0, 0, 0, 0, 0],
    timeRange: '30d',
    description: 'Predicted: 56% at 18:30 — top quartile for 15–20 min documentaries',
    platform: 'youtube',
  },
  {
    id: 'shares',
    label: 'Shares',
    value: '—',
    rawValue: 0,
    unit: 'shares',
    change: 0,
    trend: 'flat',
    sparkline: [0, 0, 0, 0, 0, 0, 0],
    timeRange: '30d',
    description: 'Predicted share rate: 4.8% — driven by professional audience segment',
  },
  {
    id: 'watch_time',
    label: 'Watch Time',
    value: '—',
    rawValue: 0,
    unit: 'hrs',
    change: 0,
    trend: 'flat',
    sparkline: [0, 0, 0, 0, 0, 0, 0],
    timeRange: '30d',
    description: 'Projected 30-day watch time: 27K–74K hours',
    platform: 'youtube',
  },
];

// ─── Retention curve (predicted only) ────────────────────────────────────────

export const MOCK_ANALYTICS_RETENTION: RetentionDataPoint[] = [
  { second: 0,    label: '0:00',  predicted: 100, actual: 0 },
  { second: 30,   label: '0:30',  predicted: 94,  actual: 0 },
  { second: 60,   label: '1:00',  predicted: 88,  actual: 0 },
  { second: 120,  label: '2:00',  predicted: 84,  actual: 0 },
  { second: 300,  label: '5:00',  predicted: 79,  actual: 0 },
  { second: 420,  label: '7:00',  predicted: 76,  actual: 0 },
  { second: 540,  label: '9:00',  predicted: 72,  actual: 0 },
  { second: 660,  label: '11:00', predicted: 69,  actual: 0 },
  { second: 780,  label: '13:00', predicted: 65,  actual: 0 },
  { second: 900,  label: '15:00', predicted: 61,  actual: 0 },
  { second: 1050, label: '17:30', predicted: 58,  actual: 0 },
  { second: 1110, label: '18:30', predicted: 56,  actual: 0 },
];

// ─── Platform breakdown (projected) ──────────────────────────────────────────

export const MOCK_PLATFORM_DATA: PlatformBreakdown[] = [
  { platform: 'youtube',        views: 320_000, engagement: 5.2, ctr: 5.4, shares: 8_400,  color: '#EF4444' },
  { platform: 'youtube-shorts', views:  80_000, engagement: 7.1, ctr: 0,   shares: 12_000, color: '#F97316' },
  { platform: 'linkedin',       views:  45_000, engagement: 6.8, ctr: 3.2, shares: 5_200,  color: '#3B82F6' },
];

// ─── Category performance (channel average comparisons) ──────────────────────

export const MOCK_CATEGORY_DATA: CategoryPerformance[] = [
  { category: 'Documentary',  avgViews: 180_000, avgRetention: 52, avgCtr: 4.8, count: 6,  color: '#8B5CF6' },
  { category: 'Short-form',   avgViews:  95_000, avgRetention: 68, avgCtr: 0,   count: 22, color: '#EC4899' },
  { category: 'AI & Tech',    avgViews: 240_000, avgRetention: 48, avgCtr: 5.1, count: 11, color: '#3B82F6' },
  { category: 'Human Stories',avgViews: 120_000, avgRetention: 61, avgCtr: 4.2, count: 4,  color: '#10B981' },
];

// ─── Audience insights (predicted) ───────────────────────────────────────────

export const MOCK_AUDIENCE_INSIGHTS: AudienceInsights = {
  totalUniqueViewers: 0,
  returningPct: 28,
  newPct: 72,
  ageDistribution: [
    { age: '18–24', pct: 12, color: '#8B5CF6' },
    { age: '25–34', pct: 34, color: '#6D28D9' },
    { age: '35–44', pct: 31, color: '#4C1D95' },
    { age: '45–54', pct: 16, color: '#3730A3' },
    { age: '55+',   pct: 7,  color: '#1E3A8A' },
  ],
  deviceBreakdown: [
    { device: 'Mobile',  pct: 58, color: '#F97316' },
    { device: 'Desktop', pct: 31, color: '#3B82F6' },
    { device: 'TV',      pct: 8,  color: '#10B981' },
    { device: 'Tablet',  pct: 3,  color: '#84CC16' },
  ],
  geographicTop5: [
    { country: 'United States', pct: 28, flag: '🇺🇸' },
    { country: 'United Kingdom',pct: 12, flag: '🇬🇧' },
    { country: 'Saudi Arabia',  pct: 10, flag: '🇸🇦' },
    { country: 'Egypt',         pct: 8,  flag: '🇪🇬' },
    { country: 'Germany',       pct: 6,  flag: '🇩🇪' },
  ],
  trafficSources: [
    { source: 'Search',        pct: 42, color: '#8B5CF6' },
    { source: 'Browse',        pct: 24, color: '#3B82F6' },
    { source: 'External',      pct: 18, color: '#F97316' },
    { source: 'Suggested',     pct: 11, color: '#10B981' },
    { source: 'Direct',        pct: 5,  color: '#EC4899' },
  ],
  platformEngagement: [
    { platform: 'youtube',  engagement: 5.2, color: '#EF4444' },
    { platform: 'linkedin', engagement: 6.8, color: '#3B82F6' },
  ],
};

// ─── Analytics snapshot ───────────────────────────────────────────────────────

export const MOCK_ANALYTICS_SNAPSHOT: AnalyticsSnapshot = {
  id:            'as-tlht-001',
  projectId:     PROJECT_ID,
  capturedAt:    '2024-06-14T10:00:00Z',
  timeRange:     '30d',
  kpis:          MOCK_KPI_METRICS,
  retention:     MOCK_ANALYTICS_RETENTION,
  platformData:  MOCK_PLATFORM_DATA,
  categoryData:  MOCK_CATEGORY_DATA,
  audienceInsights: MOCK_AUDIENCE_INSIGHTS,
  createdAt:     '2024-06-14T10:00:00Z',
  updatedAt:     '2024-06-14T10:00:00Z',
};

// ─── Virality prediction comparison (post-publish, placeholder) ───────────────

export const MOCK_VIRALITY_PREDICTION: ViralityPredictionComparison = {
  projectId:            PROJECT_ID,
  projectTitle:         'The Last Human Translator',
  predictedScore:       91,
  actualScore:          0,
  confidenceScore:      79,
  predictionError:      0,
  predictedDropOffSec:  660,
  actualDropOffSec:     0,
  aiExplanation:        'Virality model predicted a score of 91 with 79% confidence. Actual performance data will be available 7 days after publication.',
  learningCaptured:     'Not yet — awaiting publication',
  metrics: [
    { label: 'Views (30d)',   predicted: 350_000, actual: 0, unit: 'views', diff: 0 },
    { label: 'CTR',           predicted: 5.4,     actual: 0, unit: '%',     diff: 0 },
    { label: 'Avg Retention', predicted: 56,      actual: 0, unit: '%',     diff: 0 },
    { label: 'Share Rate',    predicted: 4.8,     actual: 0, unit: '%',     diff: 0 },
  ],
};

// ─── AI recommendations ───────────────────────────────────────────────────────

export const MOCK_ANALYTICS_RECOMMENDATIONS: AnalyticsRecommendation[] = [
  {
    id: 'ar-001',
    projectId: PROJECT_ID,
    title: 'Publish during AI news cycle peak window',
    description: 'Search volume for AI + work-disruption topics spikes 3–5× within 72 hours of major LLM announcements. Monitor OpenAI and Google release calendars for the optimal publish date.',
    relatedMetric: 'impressions',
    expectedImpact: '+40–60% first-week impressions vs. neutral timing',
    confidence: 82,
    priority: 'critical',
    category: 'Distribution Timing',
    applied: false,
  },
  {
    id: 'ar-002',
    projectId: PROJECT_ID,
    title: 'Thumbnail A/B test: emotional face vs. split-screen (human/AI)',
    description: 'The top-performing documentary thumbnails in the AI category use a split-screen format showing the human subject alongside a machine representation. Run two variants on publish day.',
    relatedMetric: 'ctr',
    expectedImpact: '+1.8–2.4% CTR vs. single-face thumbnail',
    confidence: 74,
    priority: 'high',
    category: 'Thumbnail Optimisation',
    applied: false,
  },
  {
    id: 'ar-003',
    projectId: PROJECT_ID,
    title: 'Pin a chapter comment on day 1',
    description: 'YouTube videos with a pinned timestamp comment show 31% higher average watch time, particularly in the 18–25 minute documentary range.',
    relatedMetric: 'watch_time',
    expectedImpact: '+31% average watch time',
    confidence: 88,
    priority: 'high',
    category: 'Engagement Optimisation',
    applied: false,
  },
];

// ─── Learning entries ─────────────────────────────────────────────────────────

export const MOCK_LEARNING_ENTRIES: LearningEntry[] = [
  {
    id: 'le-001',
    projectId: PROJECT_ID,
    category: 'Hook effectiveness',
    prediction: 'Documentary-style observational opens score 82–88 on early retention models',
    actual: 'Awaiting publish data',
    difference: 'TBD',
    learning: 'Will compare observational-open score against personal-stakes-open benchmark from comparable (Thomas Frank Explains)',
    nextImprovement: 'If actual early retention is <80%, future projects will lead with a direct stakes declaration in the first 10 seconds',
    applied: false,
    impact: 'high',
    createdAt: '2024-05-14T16:00:00Z',
    updatedAt: '2024-05-14T16:00:00Z',
  },
];
