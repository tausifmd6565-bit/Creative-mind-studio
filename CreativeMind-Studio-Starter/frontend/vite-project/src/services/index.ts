/**
 * services/index.ts — Services barrel export
 *
 * Import any service from a single path:
 *   import { projectService, researchService } from '../services';
 */

export { authService }         from './auth.service';
export { projectService }      from './project.service';
export { strategyService }     from './strategy.service';
export { researchService }     from './research.service';
export { blueprintService }    from './blueprint.service';
export { viralityService }     from './virality.service';
export { scriptService }       from './script.service';
export { sceneService }        from './scene.service';
export { assetService }        from './asset.service';
export { reviewService }       from './review.service';
export { distributionService } from './distribution.service';
export { analyticsService }    from './analytics.service';
export { pipelineService, DEMO_PRESETS } from './pipeline.service';

// Re-export research types
export type { ResearchPack, ResearchSource } from './research.service';

// Re-export blueprint types
export type {
  CreativeBlueprint,
  BlueprintScene,
  BlueprintTimelinePhase,
  PlatformAdaptation,
} from './blueprint.service';

// Re-export scene payload types
export type {
  CreateScenePayload,
  UpdateScenePayload,
  LinkAssetPayload,
} from './scene.service';

// Re-export pipeline types
export type {
  PipelineResult,
  PipelineRunPayload,
  PipelineDemoPreset,
  FinalReportResult,
  TrendRadarResult,
  ViralityTwinResult,
  ResearchPackResult,
  EditorBlueprintResult,
  DistributionResult,
  StoryGeneratorResult,
  TimelineRowItem,
  ResearchClaimItem,
  PlatformVariantItem,
} from '../types/pipeline.types';
