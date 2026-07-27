/**
 * lib/api/query-keys.ts
 *
 * Centralised TanStack Query key factory for CreativeMind Studio.
 *
 * Key design principles:
 *  - All keys are readonly tuples (TypeScript will catch stale keys).
 *  - Hierarchical — broad invalidation is trivial: invalidate projects.all
 *    to bust every project-scoped query.
 *  - Co-located with the domain service, not inside React components.
 *
 * Usage (with @tanstack/react-query):
 *   const { data } = useQuery({
 *     queryKey: queryKeys.projects.detail(projectId),
 *     queryFn:  () => projectService.getById(projectId),
 *   });
 *
 *   // Invalidate everything for a project:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
 */

import type { ID, TimeRange } from '../../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authKeys = {
  all:     ['auth']             as const,
  me:      ['auth', 'me']       as const,
  session: ['auth', 'session']  as const,
} as const;

// ─── Workspace ────────────────────────────────────────────────────────────────

export const workspaceKeys = {
  all:      ['workspaces']                     as const,
  detail:   (id: ID) => ['workspaces', id]     as const,
  members:  (id: ID) => ['workspaces', id, 'members']    as const,
  roles:    (id: ID) => ['workspaces', id, 'roles']      as const,
  invites:  (id: ID) => ['workspaces', id, 'invitations']as const,
  activity: (id: ID) => ['workspaces', id, 'activity']   as const,
  usage:    (id: ID) => ['workspaces', id, 'usage']      as const,
} as const;

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectKeys = {
  all:      ['projects']                        as const,
  lists:    ['projects', 'list']                as const,
  detail:   (id: ID) => ['projects', id]        as const,
  phases:   (id: ID) => ['projects', id, 'phases']    as const,
  health:   (id: ID) => ['projects', id, 'health']    as const,
  overview: (id: ID) => ['projects', id, 'overview']  as const,
  tasks:    (id: ID) => ['projects', id, 'tasks']     as const,
} as const;

// ─── Strategy ─────────────────────────────────────────────────────────────────

export const strategyKeys = {
  all:       (projectId: ID) => ['projects', projectId, 'strategy']                  as const,
  debate:    (projectId: ID) => ['projects', projectId, 'strategy', 'debate']        as const,
  scorecard: (projectId: ID) => ['projects', projectId, 'strategy', 'scorecard']     as const,
  ledger:    (projectId: ID) => ['projects', projectId, 'strategy', 'ledger']        as const,
  brief:     (projectId: ID) => ['projects', projectId, 'strategy', 'brief']         as const,
} as const;

// ─── Virality Twin ────────────────────────────────────────────────────────────

export const viralityKeys = {
  all:      (projectId: ID) => ['projects', projectId, 'virality']          as const,
  snapshot: (projectId: ID) => ['projects', projectId, 'virality', 'snapshot'] as const,
  dna:      ['creator-dna']                                                  as const,
} as const;

// ─── Research ─────────────────────────────────────────────────────────────────

export const researchKeys = {
  all:         (projectId: ID) => ['projects', projectId, 'research']                as const,
  questions:   (projectId: ID) => ['projects', projectId, 'research', 'questions']   as const,
  question:    (projectId: ID, questionId: ID) => ['projects', projectId, 'research', 'questions', questionId] as const,
  sources:     (projectId: ID) => ['projects', projectId, 'research', 'sources']     as const,
  source:      (projectId: ID, sourceId: ID)   => ['projects', projectId, 'research', 'sources', sourceId]    as const,
  claims:      (projectId: ID) => ['projects', projectId, 'research', 'claims']      as const,
  claim:       (projectId: ID, claimId: ID)    => ['projects', projectId, 'research', 'claims', claimId]      as const,
  evidenceMap: (projectId: ID) => ['projects', projectId, 'research', 'evidence-map'] as const,
  coverage:    (projectId: ID) => ['projects', projectId, 'research', 'coverage']    as const,
  findings:    (projectId: ID) => ['projects', projectId, 'research', 'findings']    as const,
} as const;

// ─── Scripts ──────────────────────────────────────────────────────────────────

export const scriptKeys = {
  all:            (projectId: ID) => ['projects', projectId, 'scripts']                    as const,
  current:        (projectId: ID) => ['projects', projectId, 'scripts', 'current']         as const,
  detail:         (projectId: ID, scriptId: ID) => ['projects', projectId, 'scripts', scriptId] as const,
  versions:       (projectId: ID, scriptId: ID) => ['projects', projectId, 'scripts', scriptId, 'versions'] as const,
  sections:       (projectId: ID) => ['projects', projectId, 'scripts', 'sections']        as const,
  blocks:         (projectId: ID) => ['projects', projectId, 'scripts', 'blocks']          as const,
  block:          (projectId: ID, blockId: ID)  => ['projects', projectId, 'scripts', 'blocks', blockId] as const,
  emotionalCurve: (projectId: ID) => ['projects', projectId, 'scripts', 'emotional-curve'] as const,
} as const;

// ─── Scenes ───────────────────────────────────────────────────────────────────

export const sceneKeys = {
  all:    (projectId: ID)              => ['projects', projectId, 'scenes']              as const,
  detail: (projectId: ID, sceneId: ID) => ['projects', projectId, 'scenes', sceneId]    as const,
  assets: (projectId: ID, sceneId: ID) => ['projects', projectId, 'scenes', sceneId, 'assets'] as const,
} as const;

// ─── Assets ───────────────────────────────────────────────────────────────────

export const assetKeys = {
  all:          (projectId: ID)              => ['projects', projectId, 'assets']                   as const,
  detail:       (projectId: ID, assetId: ID) => ['projects', projectId, 'assets', assetId]          as const,
  alternatives: (projectId: ID, assetId: ID) => ['projects', projectId, 'assets', assetId, 'alternatives'] as const,
  timeline:     (projectId: ID, assetId: ID) => ['projects', projectId, 'assets', assetId, 'timeline']     as const,
} as const;

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviewKeys = {
  all:         (projectId: ID)               => ['projects', projectId, 'reviews']                   as const,
  detail:      (projectId: ID, reviewId: ID) => ['projects', projectId, 'reviews', reviewId]          as const,
  annotations: (projectId: ID, reviewId: ID) => ['projects', projectId, 'reviews', reviewId, 'annotations'] as const,
} as const;

// ─── Distribution ─────────────────────────────────────────────────────────────

export const distributionKeys = {
  all:          (projectId: ID)               => ['projects', projectId, 'distribution']              as const,
  variants:     (projectId: ID)               => ['projects', projectId, 'distribution', 'variants']  as const,
  variant:      (projectId: ID, variantId: ID)=> ['projects', projectId, 'distribution', 'variants', variantId] as const,
  masterContent:(projectId: ID)               => ['projects', projectId, 'distribution', 'master']    as const,
} as const;

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsKeys = {
  all:            (projectId: ID)                     => ['projects', projectId, 'analytics']                       as const,
  summary:        (projectId: ID, range: TimeRange)   => ['projects', projectId, 'analytics', 'summary', range]     as const,
  retention:      (projectId: ID)                     => ['projects', projectId, 'analytics', 'retention']          as const,
  audience:       (projectId: ID)                     => ['projects', projectId, 'analytics', 'audience']           as const,
  platforms:      (projectId: ID)                     => ['projects', projectId, 'analytics', 'platforms']          as const,
  recommendations:(projectId: ID)                     => ['projects', projectId, 'analytics', 'recommendations']    as const,
  viralityComp:   (projectId: ID)                     => ['projects', projectId, 'analytics', 'virality-comparison']as const,
  learningLog:    (projectId: ID)                     => ['projects', projectId, 'analytics', 'learning-log']       as const,
  creatorDna:     ['creator-dna']                                                                                    as const,
} as const;

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationKeys = {
  all:         ['notifications']                      as const,
  list:        ['notifications', 'list']              as const,
  preferences: ['notifications', 'preferences']       as const,
} as const;

// ─── Aggregated export ────────────────────────────────────────────────────────

/** Convenience namespace — import `queryKeys` and access all key factories. */
export const queryKeys = {
  auth:          authKeys,
  workspaces:    workspaceKeys,
  projects:      projectKeys,
  strategy:      strategyKeys,
  virality:      viralityKeys,
  research:      researchKeys,
  scripts:       scriptKeys,
  scenes:        sceneKeys,
  assets:        assetKeys,
  reviews:       reviewKeys,
  distribution:  distributionKeys,
  analytics:     analyticsKeys,
  notifications: notificationKeys,
} as const;

export type QueryKeys = typeof queryKeys;
