export interface ScorecardMetrics {
  viability: number;
  virality: number;
  engagement: number;
  feasibility: number;
  brandFit: number;
  average: number;
  reasoning: string;
}

export interface EthicalRating {
  score: number;
  label: string;
  analysis: string;
}

export interface ExpertOpinion {
  agentName: string;
  avatar: string;
  verdict: "APPROVED" | "NEEDS WORK" | "PIVOT" | string;
  comment: string;
}

export interface FocusGroupPersona {
  persona: string;
  demographic: string;
  interestLevel: number;
  sentiment: "Positive" | "Neutral" | "Negative" | string;
  quote: string;
}

export interface StressTestPivot {
  vulnerabilities: string[];
  pivots: string[];
}

export interface ProductionPackage {
  launchChannels: string[];
  targetAudience: string;
  brandingTags: string[];
  executionSteps: string[];
}

export interface EvaluationResult {
  ideaName: string;
  tagline: string;
  scorecard: ScorecardMetrics;
  ethicalRating: EthicalRating;
  expertsDebate: ExpertOpinion[];
  focusGroup: FocusGroupPersona[];
  stressTestPivot: StressTestPivot;
  productionPackage: ProductionPackage;
}
