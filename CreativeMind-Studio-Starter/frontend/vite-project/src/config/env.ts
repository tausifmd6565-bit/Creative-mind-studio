/**
 * config/env.ts
 *
 * Typed, validated access to all VITE_* environment variables.
 *
 * SECURITY RULES:
 *  - This is the ONLY file that reads import.meta.env directly.
 *  - All other modules must import from here — never from import.meta.env.
 *  - Only VITE_* variables are accessible in the browser bundle.
 *    Never put secret keys (API keys, private tokens) as VITE_* variables —
 *    they will be inlined in the JS bundle and visible to anyone.
 *  - AI provider keys, third-party service credentials, and backend secrets
 *    must live on the backend server only. The frontend routes all AI requests
 *    through its own backend (/api/...) — never calls AI providers directly.
 *  - VITE_* variables are safe only for: base URLs, feature flags, timeout
 *    values, and other non-secret runtime configuration.
 */

function requireEnv(key: string, fallback?: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  // In production builds, throw at module load time so the error is caught immediately
  throw new Error(`[env] Required environment variable "${key}" is not configured.`);
}

function optionalEnv(key: string, fallback: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return value !== undefined && value !== '' ? value : fallback;
}

function boolEnv(key: string, fallback: boolean): boolean {
  const value = optionalEnv(key, String(fallback));
  return value === 'true';
}

function numEnv(key: string, fallback: number): number {
  const value = optionalEnv(key, String(fallback));
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// ─── Typed environment configuration ─────────────────────────────────────────

export const ENV = {
  /** Is this a development build? */
  isDev:  import.meta.env.DEV  as boolean,
  /** Is this a production build? */
  isProd: import.meta.env.PROD as boolean,

  api: {
    /**
     * Backend base URL — safe to expose (it's a public endpoint).
     * Example: https://api.creativemind.io/api/v1
     *
     * ⚠️  AI requests must be proxied through this backend, not called directly.
     *     The backend holds all AI provider keys and enforces rate limiting,
     *     authentication, and content filtering.
     */
    baseUrl:    requireEnv('VITE_API_BASE_URL', 'http://localhost:8000/api/v1'),
    /** When true, all services use in-memory mock data */
    useMock:    boolEnv('VITE_USE_MOCK_API', false),
    /** Request timeout in milliseconds */
    timeoutMs:  numEnv('VITE_API_TIMEOUT_MS', 15000),
    /** Max GET retry attempts on 5xx / network error */
    maxRetries: numEnv('VITE_API_MAX_RETRIES', 3),
  },

  /**
   * Feature flags — safe non-secret toggles.
   * Use these for gradual rollouts and A/B testing.
   */
  features: {
    analyticsEnabled:  boolEnv('VITE_FEATURE_ANALYTICS', true),
    viralityEnabled:   boolEnv('VITE_FEATURE_VIRALITY', true),
  },

  /**
   * Content Security Policy nonce meta-tag name (server-rendered).
   * The nonce itself comes from the server — this is just the lookup key.
   */
  cspNonceMetaName: 'csp-nonce',
} as const;

export type Env = typeof ENV;

// ─── Runtime assertion (catches misconfiguration at startup) ──────────────────

if (ENV.isProd && !ENV.api.baseUrl.startsWith('https://')) {
  // In production the API must be served over HTTPS
  throw new Error('[env] VITE_API_BASE_URL must use https:// in production builds.');
}
