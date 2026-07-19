/**
 * lib/api/index.ts — API layer barrel export
 *
 * Import any API primitive from a single path:
 *   import { apiClient, queryKeys, AUTH, isApiError } from '../lib/api';
 */

// Client
export {
  apiClient,
  setAccessToken,
  getAccessToken,
  register401Handler,
} from './client';

// ── Note on AI requests ───────────────────────────────────────────────────────
// All AI provider calls (OpenAI, Anthropic, etc.) must go through the backend.
// Use the SCRIPTS.aiRewrite, STRATEGY.startDebate, VIRALITY.analyse, or other
// domain endpoints — which proxy to the AI provider server-side.
// Never call https://api.openai.com/ or similar directly from this client.
// ─────────────────────────────────────────────────────────────────────────────

// Errors
export {
  ApiError,
  NetworkError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  AbortError,
  isApiError,
  isNetworkError,
  isAuthError,
  isForbiddenError,
  isNotFoundError,
  isValidationError,
  isRateLimitError,
  isServerError,
  isAbortError,
  responseToError,
} from './errors';
export type { ApiErrorBody } from './errors';

// Endpoints
export {
  AUTH,
  WORKSPACE,
  PROJECTS,
  TASKS,
  STRATEGY,
  VIRALITY,
  RESEARCH,
  SCRIPTS,
  SCENES,
  ASSETS,
  REVIEWS,
  DISTRIBUTION,
  ANALYTICS,
  NOTIFICATIONS,
  TEAM,
} from './endpoints';

// Query keys
export {
  queryKeys,
  authKeys,
  workspaceKeys,
  projectKeys,
  strategyKeys,
  viralityKeys,
  researchKeys,
  scriptKeys,
  sceneKeys,
  assetKeys,
  reviewKeys,
  distributionKeys,
  analyticsKeys,
  notificationKeys,
} from './query-keys';
export type { QueryKeys } from './query-keys';
