/**
 * pipeline.types.ts — Full 9-stage IBM Granite pipeline types
 */

export interface TrendSignal {
  signal: string;
  volume: 'high' | 'medium' | 'low';
  growth_rate: string;
  relevance_score: number;
  reason: string;
}
export interface TrendRadarResult {
  signals: TrendSignal[];
  top_opportunity: string;
  timing_recommendation: string;
  ai_engine: string;
}
export interface ViralityTwinResult {
  matched_campaign: string;
  description: string;
  viral_mechanics: string[];
  similarity_score: number;
  viral_score: number;
  predicted_reach: string;
  key_differentiators: string[];
  recommendation: string;
  ai_engine: string;
}
export interface ResearchClaimItem {
  claim: string;
  evidence: string;
  confidence: number;
  source: string;
  source_type: 'academic' | 'news' | 'industry' | 'primary' | 'government';
  citation: string;
  verified: boolean;
}
export interface ResearchPackResult {
  claims: ResearchClaimItem[];
  key_statistics: string[];
  knowledge_gaps: string[];
  overall_confidence: number;
  source_diversity_score: number;
  research_summary: string;
  ai_engine: string;
}
export interface StoryBeatItem {
  beat_number: number;
  title: string;
  description: string;
  emotional_note: string;
  duration_seconds: number;
}
export interface EmotionalCurvePoint {
  timestamp_pct: number;
  intensity: number;
  label: string;
}
export interface StoryGeneratorResult {
  narrative_arc: string;
  hook: string;
  story_beats: StoryBeatItem[];
  emotional_curve: EmotionalCurvePoint[];
  call_to_action: string;
  estimated_duration_seconds: number;
  ai_engine: string;
}
export interface TimelineRowItem {
  timecode: string;
  narration: string;
  visual: string;
  audio: string;
  motion_graphics: string;
  notes: string;
}
export interface EditorBlueprintResult {
  timeline: TimelineRowItem[];
  broll_list: string[];
  music_brief: string;
  color_grade_direction: string;
  total_scenes: number;
  estimated_runtime_seconds: number;
  export_formats: string[];
  ai_engine: string;
}
export interface PlatformVariantItem {
  platform: 'youtube' | 'linkedin' | 'tiktok' | 'instagram' | 'twitter';
  format: 'long' | 'short' | 'reel' | 'clip';
  duration_seconds: number;
  title_variation: string;
  hook_variation: string;
  caption: string;
  hashtags: string[];
  best_posting_time: string;
  predicted_reach: string;
}
export interface DistributionResult {
  platform_variants: PlatformVariantItem[];
  primary_platform: string;
  launch_strategy: string;
  seeding_targets: string[];
  paid_amplification_budget: string;
  ai_engine: string;
}
export interface FinalReportResult {
  executive_summary: string;
  creative_score: number;
  originality_score: number;
  feasibility_score: number;
  virality_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  go_no_go: 'GO' | 'NO-GO' | 'CONDITIONAL';
  top_risks: string[];
  top_opportunities: string[];
  recommended_next_steps: string[];
  ai_engine: string;
}
export interface PipelineResult {
  project_id: string;
  pipeline_id: string;
  status: 'running' | 'completed' | 'failed';
  ai_engine: string;
  stages_completed: string[];
  strategy?: Record<string, unknown> | null;
  trend_radar?: TrendRadarResult | null;
  virality_twin?: ViralityTwinResult | null;
  research_pack?: ResearchPackResult | null;
  story_generator?: StoryGeneratorResult | null;
  editor_blueprint?: EditorBlueprintResult | null;
  distribution?: DistributionResult | null;
  final_report?: FinalReportResult | null;
  error?: string | null;
}
export type PipelineDemoPreset = 'ai_jobs' | 'ocean_pollution' | 'electric_vehicles';
export interface PipelineRunPayload {
  raw_idea: string;
  demo_preset?: PipelineDemoPreset | null;
}
