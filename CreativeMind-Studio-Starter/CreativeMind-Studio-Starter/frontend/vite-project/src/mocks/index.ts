/**
 * mocks/index.ts
 *
 * Barrel export for all mock data modules.
 *
 * Every mock module exports named constants only — no default exports.
 * Import from here or directly from the individual module for tree-shaking.
 */

// ─── Canonical IDs & actor refs ───────────────────────────────────────────────
export {
  PROJECT_ID,
  WORKSPACE_ID,
  ACTOR,
  PROJECT_PHASES,
  PROJECT_AGENTS,
  MOCK_PROJECT,
  MOCK_PROJECT_CARD,
} from './project.mock';

// ─── Strategy War Room ────────────────────────────────────────────────────────
export {
  SESSION_ID,
  MOCK_BRIEF,
  MOCK_STRATEGY_AGENTS,
  MOCK_DEBATE_MESSAGES,
  MOCK_DEBATE_SESSION,
  MOCK_SCORECARDS,
  MOCK_LEDGER,
  MOCK_RISKS,
  MOCK_OPPORTUNITIES,
  MOCK_STRATEGY_DECISION,
} from './strategy.mock';

// ─── Virality Twin ────────────────────────────────────────────────────────────
export {
  CONCEPT_CARD,
  SUCCESS_CARD,
  FAILURE_CARD,
  MOCK_COMPARISON_METRICS,
  MOCK_RETENTION_DATA,
  MOCK_RADAR_DATA,
  MOCK_VIRALITY_INSIGHTS,
  MOCK_VIRALITY_CONFIDENCE,
  MOCK_VIRALITY_RIGHT_PANEL,
  MOCK_VIRALITY_SNAPSHOT,
} from './virality.mock';

// ─── Research Lab ─────────────────────────────────────────────────────────────
export {
  MOCK_RESEARCH_QUESTIONS,
  MOCK_SOURCES,
  MOCK_CLAIMS,
  MOCK_EVIDENCE_MAP,
  MOCK_RESEARCH_DOCUMENTS,
  MOCK_RESEARCH_COVERAGE,
  MOCK_RESEARCH_FINDINGS,
} from './research.mock';

// ─── Script & Story Room ──────────────────────────────────────────────────────
export {
  MOCK_SCRIPT_SECTIONS,
  MOCK_SCRIPT_BLOCKS,
  MOCK_SCRIPT_VERSIONS,
  MOCK_EMOTIONAL_CURVE,
  MOCK_SCRIPT_META,
  MOCK_EDIT_NOTES,
} from './script.mock';

// ─── Scenes ───────────────────────────────────────────────────────────────────
export {
  MOCK_SCENES,
  MOCK_SCENE_ASSETS,
} from './scenes.mock';

// ─── Asset Room ───────────────────────────────────────────────────────────────
export {
  MOCK_ASSETS,
  MOCK_ALTERNATIVES,
  MOCK_ASSET_TIMELINE,
  MOCK_ACTIVE_UPLOADS,
} from './assets.mock';

// ─── Review & Approval Room ───────────────────────────────────────────────────
export {
  MOCK_REVIEWS,
} from './review.mock';

// ─── Distribution Room ────────────────────────────────────────────────────────
export {
  MOCK_MASTER_CONTENT,
  MOCK_PLATFORM_VARIANTS,
  MOCK_DISTRIBUTION_RECOMMENDATIONS,
  MOCK_COMPARISON_FIELDS,
  MOCK_EXPORT_OPTIONS,
  MOCK_PUBLICATION_SNAPSHOTS,
} from './distribution.mock';

// ─── Analytics / Performance ──────────────────────────────────────────────────
export {
  MOCK_KPI_METRICS,
  MOCK_ANALYTICS_RETENTION,
  MOCK_PLATFORM_DATA,
  MOCK_CATEGORY_DATA,
  MOCK_AUDIENCE_INSIGHTS,
  MOCK_ANALYTICS_SNAPSHOT,
  MOCK_VIRALITY_PREDICTION,
  MOCK_ANALYTICS_RECOMMENDATIONS,
  MOCK_LEARNING_ENTRIES,
} from './analytics.mock';

// ─── Creator DNA ──────────────────────────────────────────────────────────────
export {
  MOCK_DNA_INSIGHTS,
  MOCK_CREATOR_DNA,
} from './creator-dna.mock';

// ─── Notifications ────────────────────────────────────────────────────────────
export {
  MOCK_NOTIFICATIONS,
  MOCK_NOTIFICATION_PREFERENCES,
} from './notifications.mock';
