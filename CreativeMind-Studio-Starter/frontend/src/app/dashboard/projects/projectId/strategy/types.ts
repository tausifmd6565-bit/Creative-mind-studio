/**
 * strategy/types.ts
 *
 * Types for the interactive Strategy Room workflow with 5 AI Specialist Advisory Board Members:
 * 1. Creative Director 🎬
 * 2. Audience Strategist 👥
 * 3. Marketing & Platform Strategist 📊
 * 4. Risk & Ethics Critic ⚠️
 * 5. Innovation Mentor 💡
 */

export type StrategyPhase = 'brief' | 'discussion' | 'recommendations' | 'synthesis' | 'approved';

export type ExpertRole = 'creative' | 'audience' | 'marketing' | 'risk' | 'innovation';

export const EXPERT_META: Record<ExpertRole, { name: string; icon: string; title: string }> = {
  creative:   { name: 'Creative Director',           icon: '🎬', title: 'Narrative & Emotional Vision' },
  audience:   { name: 'Audience Strategist',         icon: '👥', title: 'Viewer Retention & Resonance' },
  marketing:  { name: 'Marketing & Platform',        icon: '📊', title: 'Discoverability & Clicks' },
  risk:       { name: 'Risk & Ethics Critic',        icon: '⚠️', title: 'Credibility & Editorial Safety' },
  innovation: { name: 'Innovation Mentor',           icon: '💡', title: 'Differentiation & Originality' },
};

export interface ExpertMessage {
  role: ExpertRole;
  name: string;
  message: string;
  reactsToRole?: ExpertRole;
}

export interface RecommendationData {
  role: ExpertRole;
  name: string;
  verdict: string;
  rating: number; // 1-5 stars
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  question: string;
  options?: string[]; // Multiple-choice option choices for the user
  score: string; // e.g. "8.4 / 10"
  confidence: string; // e.g. "High", "Low Risk"
  text: string; // synthesized summary text
}

export interface Recommendation extends RecommendationData {
  status: 'pending' | 'accepted' | 'editing';
  editedText?: string;
  userAnswer?: string;
  selectedOption?: string; // Option selected by user
}

export interface FinalStrategy {
  executiveSummary: string;
  coreVision: string;
  storyAngle: string;
  targetAudience: string;
  creativeHook: string;
  marketingStrategy: string;
  originalityAssessment: string;
  productionFeasibility: string;
  risksAndMitigations: string;
  keySuccessMetrics: string;
  actionPlan: string;
}

export interface CreativeBrief {
  title: string;
  description: string;
  targetAudience: string;
  platform: string;
  goal: string;
  genre: string;
  tone: string;
  duration: string;
}

/** API response from POST /api/ai/generate with stage=strategy, action=discussion */
export interface DiscussionResult {
  discussion: ExpertMessage[];
  recommendations: RecommendationData[];
}
