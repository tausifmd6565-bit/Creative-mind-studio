/**
 * lib/api/endpoints.ts
 *
 * Single source of truth for every API endpoint path used in the frontend.
 *
 * RULES:
 *  - Never write a URL string outside this file.
 *  - Every path function accepts only the IDs it strictly needs.
 *  - Paths do NOT include the base URL — that lives in api.config.ts.
 *  - Group by feature domain, mirroring the backend router structure.
 */

import type { ID } from '../../types';

// ─── Authentication ───────────────────────────────────────────────────────────

export const AUTH = {
  login:        '/auth/login',
  register:     '/auth/register',
  refresh:      '/auth/refresh',
  logout:       '/auth/logout',
  me:           '/auth/me',
  forgotPassword: '/auth/forgot-password',
  resetPassword:  '/auth/reset-password',
} as const;

// ─── Workspace ────────────────────────────────────────────────────────────────

export const WORKSPACE = {
  list:          '/workspaces',
  create:        '/workspaces',
  detail: (id: ID)     => `/workspaces/${id}`,
  update: (id: ID)     => `/workspaces/${id}`,
  usage:  (id: ID)     => `/workspaces/${id}/usage`,
  members:(id: ID)     => `/workspaces/${id}/members`,
  invitations:(id: ID) => `/workspaces/${id}/invitations`,
  invite: (id: ID)     => `/workspaces/${id}/invite`,
  activity:(id: ID)    => `/workspaces/${id}/activity`,
} as const;

// ─── Projects ─────────────────────────────────────────────────────────────────

export const PROJECTS = {
  list:          '/projects',
  create:        '/projects',
  detail: (projectId: ID) => `/projects/${projectId}`,
  update: (projectId: ID) => `/projects/${projectId}`,
  delete: (projectId: ID) => `/projects/${projectId}`,
  phases: (projectId: ID) => `/projects/${projectId}/phases`,
  health: (projectId: ID) => `/projects/${projectId}/health`,
  overview:(projectId: ID)=> `/projects/${projectId}/overview`,
} as const;

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const TASKS = {
  list:   (projectId: ID)              => `/projects/${projectId}/tasks`,
  create: (projectId: ID)              => `/projects/${projectId}/tasks`,
  detail: (projectId: ID, taskId: ID)  => `/projects/${projectId}/tasks/${taskId}`,
  update: (projectId: ID, taskId: ID)  => `/projects/${projectId}/tasks/${taskId}`,
  delete: (projectId: ID, taskId: ID)  => `/projects/${projectId}/tasks/${taskId}`,
} as const;

// ─── Strategy War Room ────────────────────────────────────────────────────────

export const STRATEGY = {
  /** Start or continue a debate session */
  startDebate:  (projectId: ID) => `/projects/${projectId}/strategy/debate`,
  /** Get the current debate state */
  getDebate:    (projectId: ID) => `/projects/${projectId}/strategy/debate`,
  /** Submit a manual pivot */
  pivot:        (projectId: ID) => `/projects/${projectId}/strategy/pivot`,
  /** Get the live scorecard */
  scorecard:    (projectId: ID) => `/projects/${projectId}/strategy/scorecard`,
  /** Get the decision ledger */
  ledger:       (projectId: ID) => `/projects/${projectId}/strategy/ledger`,
  /** Finalise and export the strategy brief */
  brief:        (projectId: ID) => `/projects/${projectId}/strategy/brief`,
} as const;

// ─── Virality Twin ────────────────────────────────────────────────────────────

export const VIRALITY = {
  /** Run a new analysis */
  analyse: (projectId: ID) => `/projects/${projectId}/virality-twin/analyse`,
  /** Get the latest snapshot */
  get:     (projectId: ID) => `/projects/${projectId}/virality-twin`,
  /** Get Creator DNA for the workspace */
  dna:                        '/creator-dna',
} as const;

// ─── Research Lab ─────────────────────────────────────────────────────────────

export const RESEARCH = {
  questions:       (projectId: ID) => `/projects/${projectId}/research/questions`,
  createQuestion:  (projectId: ID) => `/projects/${projectId}/research/questions`,
  question:        (projectId: ID, questionId: ID) => `/projects/${projectId}/research/questions/${questionId}`,
  updateQuestion:  (projectId: ID, questionId: ID) => `/projects/${projectId}/research/questions/${questionId}`,

  sources:         (projectId: ID) => `/projects/${projectId}/sources`,
  createSource:    (projectId: ID) => `/projects/${projectId}/sources`,
  source:          (projectId: ID, sourceId: ID) => `/projects/${projectId}/sources/${sourceId}`,
  updateSource:    (projectId: ID, sourceId: ID) => `/projects/${projectId}/sources/${sourceId}`,
  deleteSource:    (projectId: ID, sourceId: ID) => `/projects/${projectId}/sources/${sourceId}`,

  claims:          (projectId: ID) => `/projects/${projectId}/claims`,
  claim:           (projectId: ID, claimId: ID)   => `/projects/${projectId}/claims/${claimId}`,
  linkClaimSource: (projectId: ID, claimId: ID)   => `/projects/${projectId}/claims/${claimId}/link-source`,

  evidenceMap:     (projectId: ID) => `/projects/${projectId}/research/evidence-map`,
  coverage:        (projectId: ID) => `/projects/${projectId}/research/coverage`,
  findings:        (projectId: ID) => `/projects/${projectId}/research/findings`,
} as const;

// ─── Script & Story Room ──────────────────────────────────────────────────────

export const SCRIPTS = {
  current:       (projectId: ID) => `/projects/${projectId}/scripts/current`,
  create:        (projectId: ID) => `/projects/${projectId}/scripts`,
  detail:        (projectId: ID, scriptId: ID) => `/projects/${projectId}/scripts/${scriptId}`,
  update:        (projectId: ID, scriptId: ID) => `/projects/${projectId}/scripts/${scriptId}`,
  versions:      (projectId: ID, scriptId: ID) => `/projects/${projectId}/scripts/${scriptId}/versions`,

  sections:      (projectId: ID) => `/projects/${projectId}/scripts/sections`,
  section:       (projectId: ID, sectionId: ID) => `/projects/${projectId}/scripts/sections/${sectionId}`,

  blocks:        (projectId: ID) => `/projects/${projectId}/scripts/blocks`,
  block:         (projectId: ID, blockId: ID)   => `/projects/${projectId}/scripts/blocks/${blockId}`,
  updateBlock:   (projectId: ID, blockId: ID)   => `/projects/${projectId}/scripts/blocks/${blockId}`,

  aiRewrite:     (projectId: ID, blockId: ID)   => `/projects/${projectId}/scripts/blocks/${blockId}/ai-rewrite`,
  emotionalCurve:(projectId: ID) => `/projects/${projectId}/scripts/emotional-curve`,
} as const;

// ─── Scenes ───────────────────────────────────────────────────────────────────

export const SCENES = {
  list:   (projectId: ID)              => `/projects/${projectId}/scenes`,
  create: (projectId: ID)              => `/projects/${projectId}/scenes`,
  detail: (projectId: ID, sceneId: ID) => `/projects/${projectId}/scenes/${sceneId}`,
  update: (projectId: ID, sceneId: ID) => `/projects/${projectId}/scenes/${sceneId}`,
  delete: (projectId: ID, sceneId: ID) => `/projects/${projectId}/scenes/${sceneId}`,
  assets: (projectId: ID, sceneId: ID) => `/projects/${projectId}/scenes/${sceneId}/assets`,
  linkAsset:  (projectId: ID, sceneId: ID) => `/projects/${projectId}/scenes/${sceneId}/assets`,
  unlinkAsset:(projectId: ID, sceneId: ID, assetId: ID) =>
    `/projects/${projectId}/scenes/${sceneId}/assets/${assetId}`,
} as const;

// ─── Asset Room ───────────────────────────────────────────────────────────────

export const ASSETS = {
  list:         (projectId: ID)              => `/projects/${projectId}/assets`,
  create:       (projectId: ID)              => `/projects/${projectId}/assets`,
  upload:       (projectId: ID)              => `/projects/${projectId}/assets/upload`,
  detail:       (projectId: ID, assetId: ID) => `/projects/${projectId}/assets/${assetId}`,
  update:       (projectId: ID, assetId: ID) => `/projects/${projectId}/assets/${assetId}`,
  delete:       (projectId: ID, assetId: ID) => `/projects/${projectId}/assets/${assetId}`,
  alternatives: (projectId: ID, assetId: ID) => `/projects/${projectId}/assets/${assetId}/alternatives`,
  timeline:     (projectId: ID, assetId: ID) => `/projects/${projectId}/assets/${assetId}/timeline`,
  rightsCheck:  (projectId: ID, assetId: ID) => `/projects/${projectId}/assets/${assetId}/rights-check`,
} as const;

// ─── Reviews & Approvals ──────────────────────────────────────────────────────

export const REVIEWS = {
  list:       (projectId: ID)               => `/projects/${projectId}/reviews`,
  create:     (projectId: ID)               => `/projects/${projectId}/reviews`,
  detail:     (projectId: ID, reviewId: ID) => `/projects/${projectId}/reviews/${reviewId}`,
  update:     (projectId: ID, reviewId: ID) => `/projects/${projectId}/reviews/${reviewId}`,
  approve:    (projectId: ID, reviewId: ID) => `/projects/${projectId}/reviews/${reviewId}/approve`,
  reject:     (projectId: ID, reviewId: ID) => `/projects/${projectId}/reviews/${reviewId}/reject`,
  annotations:(projectId: ID, reviewId: ID) => `/projects/${projectId}/reviews/${reviewId}/annotations`,
  annotation: (projectId: ID, reviewId: ID, annotationId: ID) =>
    `/projects/${projectId}/reviews/${reviewId}/annotations/${annotationId}`,
  resolveAnnotation: (projectId: ID, reviewId: ID, annotationId: ID) =>
    `/projects/${projectId}/reviews/${reviewId}/annotations/${annotationId}/resolve`,
} as const;

// ─── Distribution Room ────────────────────────────────────────────────────────

export const DISTRIBUTION = {
  variants:     (projectId: ID) => `/projects/${projectId}/platform-variants`,
  generate:     (projectId: ID) => `/projects/${projectId}/platform-variants/generate`,
  variant:      (projectId: ID, variantId: ID) => `/projects/${projectId}/platform-variants/${variantId}`,
  updateVariant:(projectId: ID, variantId: ID) => `/projects/${projectId}/platform-variants/${variantId}`,
  schedule:     (projectId: ID, variantId: ID) => `/projects/${projectId}/platform-variants/${variantId}/schedule`,
  publish:      (projectId: ID, variantId: ID) => `/projects/${projectId}/platform-variants/${variantId}/publish`,
  masterContent:(projectId: ID) => `/projects/${projectId}/master-content`,
} as const;

// ─── Analytics & Performance ──────────────────────────────────────────────────

export const ANALYTICS = {
  summary:        (projectId: ID) => `/projects/${projectId}/analytics`,
  importMetrics:  (projectId: ID) => `/projects/${projectId}/analytics/import`,
  retention:      (projectId: ID) => `/projects/${projectId}/analytics/retention`,
  audience:       (projectId: ID) => `/projects/${projectId}/analytics/audience`,
  platforms:      (projectId: ID) => `/projects/${projectId}/analytics/platforms`,
  recommendations:(projectId: ID) => `/projects/${projectId}/analytics/recommendations`,
  viralityComp:   (projectId: ID) => `/projects/${projectId}/analytics/virality-comparison`,
  learningLog:    (projectId: ID) => `/projects/${projectId}/analytics/learning-log`,
  creatorDna:                         '/creator-dna',
} as const;

// ─── Notifications ────────────────────────────────────────────────────────────

export const NOTIFICATIONS = {
  list:        '/notifications',
  markRead:    '/notifications/mark-read',
  markAllRead: '/notifications/mark-all-read',
  preferences: '/notifications/preferences',
  delete: (notificationId: ID) => `/notifications/${notificationId}`,
} as const;

// ─── Team / members ───────────────────────────────────────────────────────────

export const TEAM = {
  members:     (workspaceId: ID) => `/workspaces/${workspaceId}/members`,
  member:      (workspaceId: ID, memberId: ID) => `/workspaces/${workspaceId}/members/${memberId}`,
  updateRole:  (workspaceId: ID, memberId: ID) => `/workspaces/${workspaceId}/members/${memberId}/role`,
  remove:      (workspaceId: ID, memberId: ID) => `/workspaces/${workspaceId}/members/${memberId}`,
  invitations: (workspaceId: ID) => `/workspaces/${workspaceId}/invitations`,
  invite:      (workspaceId: ID) => `/workspaces/${workspaceId}/invite`,
  revokeInvite:(workspaceId: ID, inviteId: ID) => `/workspaces/${workspaceId}/invitations/${inviteId}`,
  roles:       (workspaceId: ID) => `/workspaces/${workspaceId}/roles`,
  activity:    (workspaceId: ID) => `/workspaces/${workspaceId}/activity`,
} as const;
