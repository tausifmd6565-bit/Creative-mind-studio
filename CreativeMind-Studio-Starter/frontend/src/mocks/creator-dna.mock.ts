/**
 * mocks/creator-dna.mock.ts
 *
 * Creator DNA data for the CreativeMind Studio workspace.
 *
 * The evolving creative fingerprint derived from all projects in the workspace.
 * This is workspace-level (not project-level) data.
 */

import type { CreatorDNA, DnaInsight } from '../types';
import { WORKSPACE_ID } from './project.mock';

// ─── Individual DNA insights ──────────────────────────────────────────────────

export const MOCK_DNA_INSIGHTS: DnaInsight[] = [
  {
    id: 'hook_style',
    label: 'Hook Style',
    value: 'Observational + Personal Stakes',
    confidence: 87,
    evidence: 'Across 11 published videos, the top 4 by watch time all used either an observational opening (CU on subject with ambient audio) or a direct personal-stakes declaration. Abstract thesis openings scored in the bottom quartile.',
    recommendation: 'Open every video with either a visual observation of the subject in their natural environment, or a direct personal-stakes declaration within the first 10 seconds. Avoid abstract thesis statements in the opening.',
    trend: 'up',
    iconName: 'Zap',
  },
  {
    id: 'duration',
    label: 'Optimal Duration',
    value: '12–22 minutes (documentary), <60s (short-form)',
    confidence: 92,
    evidence: 'Channel analytics show the 18–22 minute range achieves the highest average percentage viewed (58–67%) for documentary content. Sub-60 second Shorts achieve the highest absolute completion rate.',
    recommendation: 'Documentaries: target 18–22 minutes. Short-form: stay under 60 seconds. Avoid the 3–10 minute mid-form range — it underperforms on all metrics for this audience.',
    trend: 'flat',
    iconName: 'Clock',
  },
  {
    id: 'platform',
    label: 'Primary Platform',
    value: 'YouTube (main) + LinkedIn (B2B amplification)',
    confidence: 94,
    evidence: 'YouTube drives 82% of total views. LinkedIn drives 64% of newsletter signups and B2B conversion. Instagram and TikTok have underperformed by 40% vs projected views on documentary content.',
    recommendation: 'Focus production effort on YouTube-first. Repurpose all documentary content for LinkedIn with a 2–3 minute cut. Deprioritise TikTok and Instagram for documentary format.',
    trend: 'up',
    iconName: 'Monitor',
  },
  {
    id: 'topic_category',
    label: 'Winning Topics',
    value: 'AI × Human Work × Cultural Identity',
    confidence: 89,
    evidence: 'The intersection of AI impact on creative or skilled professions consistently outperforms tech-only or human-interest-only content by 3–5× on shares. The Arabic-diaspora cultural lens is unique and underserved.',
    recommendation: 'Continue producing content at the intersection of AI disruption and human expertise. The cultural-identity dimension (Arabic, diaspora, non-Western perspectives on AI) is a unique competitive advantage.',
    trend: 'up',
    iconName: 'Target',
  },
  {
    id: 'audience',
    label: 'Core Audience Profile',
    value: 'Professionals 28–45, tech/academia/media',
    confidence: 91,
    evidence: 'Audience analytics consistently show 65–70% of viewers fall in the 25–44 age bracket across all high-performing videos. The professional-educated segment shares at 2× the rate of the general audience.',
    recommendation: 'Calibrate complexity and references to an educated professional audience. This segment demands citation quality and intellectual honesty — and rewards it with shares to their own networks.',
    trend: 'flat',
    iconName: 'Users',
  },
  {
    id: 'tone',
    label: 'Brand Tone',
    value: 'Contemplative + Evidence-Led',
    confidence: 88,
    evidence: 'The three best-performing pieces all held a "contemplative" narrative tone — asking questions before asserting answers. Pieces with a strong advocacy tone showed higher initial views but lower long-term retention.',
    recommendation: 'Lead with questions, evidence, and human stories. Reserve strong assertions for the final 20% of content, after the audience has been shown the evidence. Avoid opinion-led intros.',
    trend: 'flat',
    iconName: 'BookOpen',
  },
  {
    id: 'pacing',
    label: 'Pacing Pattern',
    value: 'Slow build → Evidence spike → Emotional close',
    confidence: 85,
    evidence: 'Retention curve analysis shows the audience accepts a 60–70% retention plateau during the evidence section (7–12 min) if the opening 5 minutes achieved high engagement. The close needs emotional elevation.',
    recommendation: 'Design a 3-phase pacing: slow observational build (0–5 min), dense evidence middle (5–13 min), emotional resolution close (13–end). Do not rush the opening.',
    trend: 'up',
    iconName: 'TrendingUp',
  },
  {
    id: 'thumbnail',
    label: 'Thumbnail Formula',
    value: 'Human face (emotion) + Contrasting element + Bold text',
    confidence: 83,
    evidence: 'CTR analysis on 22 thumbnails shows that the human face + contrasting object format (face + machine, face + text overlay, face + data visual) outperforms all other formats by 40–60% in this category.',
    recommendation: 'Always use a high-resolution emotional face shot as the primary thumbnail element. Pair with a visual contrast element — machine, icon, or data. Bold, 3–5 word text overlay.',
    trend: 'up',
    iconName: 'Image',
  },
  {
    id: 'editing',
    label: 'Editing Style',
    value: 'Cinematic cuts, minimal graphics, source callouts',
    confidence: 82,
    evidence: 'Viewer surveys and comment analysis show that the audience strongly prefers a cinematic, documentary-style edit with minimal lower-thirds and source callouts displayed as clean text on dark backgrounds.',
    recommendation: 'Maintain the cinematic editorial style. Use source callouts in the edit (not just description) — this builds credibility with the educated professional audience. Limit animated graphics.',
    trend: 'flat',
    iconName: 'Film',
  },
  {
    id: 'next_experiment',
    label: 'Next Experiment',
    value: 'Test Arabic-subtitled variant for MENA LinkedIn distribution',
    confidence: 72,
    evidence: 'There are currently zero high-quality Arabic-language documentary series targeting the AI + work-disruption topic on LinkedIn. The gap represents a first-mover opportunity in a segment with 8M+ target professionals.',
    recommendation: 'For the next project, produce an Arabic-subtitled LinkedIn variant and run a 4-week distribution experiment targeting Gulf and North Africa professional audiences.',
    trend: 'up',
    iconName: 'FlaskConical',
  },
];

// ─── Creator DNA ─────────────────────────────────────────────────────────────

export const MOCK_CREATOR_DNA: CreatorDNA = {
  workspaceId:   WORKSPACE_ID,
  version:       7,
  insights:      MOCK_DNA_INSIGHTS,
  lastUpdatedAt: '2024-06-14T10:00:00Z',
  dataPoints:    11,
  createdAt:     '2023-11-01T09:00:00Z',
  updatedAt:     '2024-06-14T10:00:00Z',
};
