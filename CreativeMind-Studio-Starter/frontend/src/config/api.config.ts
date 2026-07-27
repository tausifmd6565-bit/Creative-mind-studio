/**
 * config/api.config.ts
 *
 * Centralised API runtime configuration.
 * Automatically targets live Render backend in production if VITE_API_BASE_URL is not set.
 */

function getBaseUrl(): string {
  const envUrl = (import.meta.env as Record<string, string | undefined>)['VITE_API_BASE_URL'];
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  // If running in browser on Vercel / non-localhost domain, default directly to live Render backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://creative-mind-studio.onrender.com/api';
  }
  return 'http://localhost:8000/api';
}

export const API_CONFIG = {
  /** Base URL, e.g. https://creative-mind-studio.onrender.com/api */
  baseUrl: getBaseUrl(),

  /** When true, all services swap to their in-memory mock adapters */
  useMock: (import.meta.env as Record<string, string | undefined>)['VITE_USE_MOCK_API'] === 'true',

  /** Request timeout in milliseconds — 180s for multi-agent IBM Granite generation */
  timeoutMs: 180000,

  /** Maximum GET retry attempts */
  maxRetries: 3,

  /** Default headers sent with every request */
  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  } as Record<string, string>,
} as const;

export type ApiConfig = typeof API_CONFIG;
