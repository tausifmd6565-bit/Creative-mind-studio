/**
 * mocks/distribution.mock.ts
 *
 * Distribution Room data for "The Last Human Translator".
 *
 * Master content, platform variants, recommendations, diff fields,
 * export options, and publication snapshots.
 */

import type {
  MasterContent,
  PlatformVariant,
  DistributionRecommendation,
  ComparisonField,
  ExportOption,
  PublicationSnapshot,
} from '../types';
import { PROJECT_ID, ACTOR } from './project.mock';

// ─── Master content ───────────────────────────────────────────────────────────

export const MOCK_MASTER_CONTENT: MasterContent = {
  id:                 'mc-tlht-001',
  projectId:          PROJECT_ID,
  projectTitle:       'The Last Human Translator',
  summary:            'A 18-minute documentary following Layla Hassan, an Arabic–English translator with 22 years of experience, as she reckons with LLM-based translation tools that can now replicate her output in seconds. The film explores what she does that machines cannot — cultural intuition, emotional subtext, diplomatic precision.',
  primaryHook:        'In the time it takes Layla to read this sentence, an AI has translated 10,000 words. But can it feel what they mean?',
  mainScript:         'Full 3,420-word documentary script — approved v2.0',
  targetAudience:     'Educated professionals aged 28–45 in tech, academia, media, and linguistics. Strong secondary audience in the Arabic-speaking world and diaspora communities.',
  primaryPlatform:    'youtube',
  estimatedDuration:  '18:30',
  cta:                'Follow CreativeMind Studio for more documentaries on AI and human creativity. Share this film if it made you think.',
  approvalStatus:     'approved',
  approvedBy:         ACTOR.ayeshaRahman,
  approvedAt:         '2024-06-10T17:00:00Z',
  version:            'v2.0',
  wordCount:          3_420,
  characterCount:     18_540,
  createdAt:          '2024-06-10T17:00:00Z',
  updatedAt:          '2024-06-12T09:00:00Z',
};

// ─── Platform variants ────────────────────────────────────────────────────────

export const MOCK_PLATFORM_VARIANTS: PlatformVariant[] = [
  {
    id: 'pv-001',
    projectId: PROJECT_ID,
    masterContentId: 'mc-tlht-001',
    platformId: 'youtube',
    platformName: 'YouTube — Main',
    status: 'ready-to-publish',
    assignedTo: ACTOR.nourSaleh,
    generatedTitle: 'The Last Human Translator | AI vs. 22 Years of Cultural Intuition',
    hook: 'In the time it takes Layla to read this sentence, an AI has translated 10,000 words. But can it feel what they mean?',
    description: 'Layla Hassan has translated diplomatic cables, love letters, and UN proceedings for 22 years. Then came the machines.\n\nThis documentary follows Layla as she faces an AI that can replicate her output in seconds — and asks the question the industry hasn\'t answered: what does a machine miss?\n\n00:00 Introduction\n01:30 Layla\'s world\n04:00 The machines arrive\n07:00 What AI cannot do\n12:00 The reckoning\n15:30 What remains\n\n#AI #Translation #Documentary #FutureOfWork',
    cta: 'Subscribe for more documentaries on AI and human creativity. Comment your thoughts below.',
    estimatedDuration: '18:30',
    aspectRatio: '16:9',
    characterLimit: 5_000,
    currentCharacterCount: 720,
    thumbnailStatus: 'approved',
    readinessScore: 94,
    isLocked: false,
    scheduledAt: '2024-06-28T09:00:00Z',
    createdAt: '2024-06-12T09:00:00Z',
    updatedAt: '2024-06-13T14:00:00Z',
  },
  {
    id: 'pv-002',
    projectId: PROJECT_ID,
    masterContentId: 'mc-tlht-001',
    platformId: 'youtube-shorts',
    platformName: 'YouTube Shorts',
    status: 'approved',
    assignedTo: ACTOR.ramiAlFarsi,
    generatedTitle: 'AI Translated This — But Could It Feel It?',
    hook: 'Watch Layla do what no AI can — translate the emotion behind the words.',
    description: 'An Arabic translator with 22 years of experience vs a machine that takes 0.3 seconds. The result will surprise you. #AIvsHuman #Translation #Shorts',
    cta: 'Watch the full documentary on our channel.',
    estimatedDuration: '0:58',
    aspectRatio: '9:16',
    characterLimit: 500,
    currentCharacterCount: 187,
    thumbnailStatus: 'ready',
    readinessScore: 88,
    isLocked: false,
    scheduledAt: '2024-06-28T12:00:00Z',
    createdAt: '2024-06-12T10:00:00Z',
    updatedAt: '2024-06-13T15:00:00Z',
  },
  {
    id: 'pv-003',
    projectId: PROJECT_ID,
    masterContentId: 'mc-tlht-001',
    platformId: 'linkedin',
    platformName: 'LinkedIn',
    status: 'ready-for-review',
    assignedTo: ACTOR.ayeshaRahman,
    generatedTitle: 'What 22 Years of Human Translation Taught Me About What AI Still Can\'t Do',
    hook: 'We gave an AI the same diplomatic cable that Layla has translated hundreds of times. The outputs were not the same.',
    description: 'The creative team at CreativeMind Studio spent 8 weeks documenting Layla Hassan, a professional Arabic–English translator facing a career-defining moment: AI can now do in seconds what takes her hours.\n\nBut in our filming, we discovered something the benchmarks don\'t capture: the 34% that gets lost.\n\nWatch "The Last Human Translator" — a documentary about cultural intuition, professional identity, and the parts of language that machines haven\'t learned yet.\n\nFull documentary: [YouTube link]\n\n#AI #FutureOfWork #Translation #Documentary #Linguistics',
    cta: 'Share this with someone who works in language, AI, or creative fields.',
    estimatedDuration: '3:00',
    aspectRatio: '1:1',
    characterLimit: 3_000,
    currentCharacterCount: 842,
    thumbnailStatus: 'generating',
    readinessScore: 71,
    isLocked: false,
    createdAt: '2024-06-12T11:00:00Z',
    updatedAt: '2024-06-14T09:00:00Z',
  },
];

// ─── Recommendations ──────────────────────────────────────────────────────────

export const MOCK_DISTRIBUTION_RECOMMENDATIONS: DistributionRecommendation[] = [
  {
    id: 'dr-001',
    variantId: 'pv-001',
    type: 'seo',
    priority: 'high',
    title: 'Add "Documentary 2024" to YouTube title',
    description: 'Year-tagged documentary titles show 23% higher search impression rates. "The Last Human Translator | Documentary 2024" outperforms the current title in keyword modelling.',
    applied: false,
  },
  {
    id: 'dr-002',
    variantId: 'pv-001',
    type: 'engagement',
    priority: 'high',
    title: 'Pin a comment with a timestamp chapter guide',
    description: 'Videos with pinned timestamp comments see 31% higher average watch time. Publish a pinned creator comment with chapter links on day 1.',
    applied: false,
  },
  {
    id: 'dr-003',
    variantId: 'pv-003',
    type: 'format',
    priority: 'medium',
    title: 'Add Arabic subtitles to LinkedIn variant',
    description: 'LinkedIn Arabic-language posts receive 4× more engagement from Gulf and MENA professional accounts. Adding Arabic subtitles could double the reach in that segment.',
    applied: false,
  },
  {
    id: 'dr-004',
    variantId: 'pv-002',
    type: 'structure',
    priority: 'medium',
    title: 'Move the translation demo to the first 8 seconds of the Short',
    description: 'YouTube Shorts with a visible action in the first 8 seconds have 40% higher swipe-through rate. Currently the hook is narration-first.',
    applied: true,
  },
];

// ─── Comparison fields (master vs. YouTube variant diff) ─────────────────────

export const MOCK_COMPARISON_FIELDS: ComparisonField[] = [
  {
    label: 'Title',
    masterValue: 'The Last Human Translator',
    variantValue: 'The Last Human Translator | AI vs. 22 Years of Cultural Intuition',
    diffType: 'ai-optimized',
  },
  {
    label: 'Hook',
    masterValue: 'In the time it takes Layla to read this sentence, an AI has translated 10,000 words.',
    variantValue: 'In the time it takes Layla to read this sentence, an AI has translated 10,000 words. But can it feel what they mean?',
    diffType: 'ai-optimized',
  },
  {
    label: 'Target Audience',
    masterValue: 'Educated professionals aged 28–45 in tech, academia, media, and linguistics.',
    variantValue: 'Educated professionals aged 28–45 in tech, academia, media, and linguistics.',
    diffType: 'unchanged',
  },
  {
    label: 'Duration',
    masterValue: '18:30',
    variantValue: '18:30',
    diffType: 'unchanged',
  },
  {
    label: 'CTA',
    masterValue: 'Follow CreativeMind Studio for more documentaries on AI and human creativity.',
    variantValue: 'Subscribe for more documentaries on AI and human creativity. Comment your thoughts below.',
    diffType: 'platform-specific',
  },
];

// ─── Export options ───────────────────────────────────────────────────────────

export const MOCK_EXPORT_OPTIONS: ExportOption[] = [
  { id: 'copy',     label: 'Copy to clipboard', description: 'Copy the adapted script as plain text', available: true },
  { id: 'markdown', label: 'Export Markdown',   description: 'Formatted .md file with section headers', available: true },
  { id: 'pdf',      label: 'Export PDF',         description: 'Print-ready PDF with branding', available: true },
  { id: 'json',     label: 'Export JSON',         description: 'Machine-readable variant data', available: true },
  { id: 'assets',   label: 'Export Asset Pack',  description: 'Zip of approved assets for this platform', available: false, comingSoon: true },
  { id: 'xml',      label: 'Export XML (MRSS)',   description: 'Media RSS feed for podcast / syndication', available: false, comingSoon: true },
];

// ─── Publication snapshots (post-publish preview, empty until published) ──────

export const MOCK_PUBLICATION_SNAPSHOTS: PublicationSnapshot[] = [];
