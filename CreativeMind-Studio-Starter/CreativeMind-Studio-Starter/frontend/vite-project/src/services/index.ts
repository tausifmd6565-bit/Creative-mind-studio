/**
 * services/index.ts — Services barrel export
 *
 * Import any service from a single path:
 *   import { projectService, authService } from '../services';
 */

export { authService }          from './auth.service';
export { projectService }       from './project.service';
export { strategyService }      from './strategy.service';
export { viralityService }      from './virality.service';
export { researchService }      from './research.service';
export { scriptService }        from './script.service';
export { sceneService }         from './scene.service';
export { assetService }         from './asset.service';
export { reviewService }        from './review.service';
export { distributionService }  from './distribution.service';
export { analyticsService }     from './analytics.service';

// Re-export scene payload types (defined locally in scene.service)
export type {
  CreateScenePayload,
  UpdateScenePayload,
  LinkAssetPayload,
} from './scene.service';
