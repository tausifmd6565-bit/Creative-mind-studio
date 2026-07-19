/**
 * config/api.config.ts
 *
 * Centralised API runtime configuration.
 *
 * All values are read once at module load from import.meta.env so every
 * service and the client use a single consistent source of truth.
 *
 * IMPORTANT: Never reference import.meta.env directly outside this file.
 */

function requireEnv(key: string, fallback?: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`[api.config] Required environment variable "${key}" is not set.`);
}

// ─── Resolved config object ───────────────────────────────────────────────────

export const API_CONFIG = {
  /** Base URL, e.g. http://localhost:8000/api/v1 */
  baseUrl: requireEnv('VITE_API_BASE_URL', 'http://localhost:8000/api/v1'),

  /** When true, all services swap to their in-memory mock adapters */
  useMock: requireEnv('VITE_USE_MOCK_API', 'false') === 'true',

  /** Request timeout in milliseconds */
  timeoutMs: Number(requireEnv('VITE_API_TIMEOUT_MS', '15000')),

  /** Maximum GET retry attempts (on 5xx or network error) */
  maxRetries: Number(requireEnv('VITE_API_MAX_RETRIES', '3')),

  /** Default headers sent with every request */
  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  } as Record<string, string>,
} as const;

export type ApiConfig = typeof API_CONFIG;
