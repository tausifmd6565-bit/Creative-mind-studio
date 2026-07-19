/**
 * lib/api/client.ts
 *
 * Centralised, transport-agnostic HTTP client for CreativeMind Studio.
 *
 * SECURITY FEATURES:
 *  - Bearer token is stored in memory only — never localStorage/sessionStorage.
 *  - HTTP-only cookie-ready: credentials:'include' is sent on every request so
 *    the browser automatically attaches the HttpOnly refresh-token cookie.
 *  - CSRF: X-CSRF-Token header is injected automatically for state-mutating
 *    methods (POST/PUT/PATCH/DELETE) from the non-HttpOnly csrftoken cookie.
 *  - Security headers: X-Requested-With, X-Content-Type-Options on every request.
 *  - AI requests must be made through backend service endpoints — never by
 *    calling AI provider APIs directly from this client (no provider keys here).
 *  - Typed GET / POST / PUT / PATCH / DELETE
 *  - JSON + FormData request bodies
 *  - AbortController / request cancellation
 *  - Automatic retry for safe GET requests (network errors + 5xx)
 *  - 401 auto-logout hook
 *  - Request timeout via AbortSignal.timeout()
 *  - Structured error classes (see errors.ts)
 *  - Zero external dependencies (native fetch only)
 */

import { API_CONFIG } from '../../config/api.config';
import {
  AbortError,
  NetworkError,
  responseToError,
} from './errors';
import { getCsrfToken } from '../security/auth';
import type { ApiResponse, PaginatedResponse } from '../../types';

// ─── Token store ──────────────────────────────────────────────────────────────
//
// The access token lives only in this module-scoped variable — it is never
// written to localStorage, sessionStorage, or any cookie from the frontend.
// Page-refresh rehydration is handled via the HTTP-only refresh-token cookie
// that the backend sets; the auth service calls /auth/refresh silently.

let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ─── 401 handler hook ─────────────────────────────────────────────────────────
//
// Register a callback that the auth service wires up after bootstrapping.
// Avoids any React dependency inside the client.

let _on401: (() => void) | null = null;

export function register401Handler(handler: () => void): void {
  _on401 = handler;
}

// ─── Internal types ───────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Methods that mutate server state and require CSRF protection */
const CSRF_METHODS = new Set<HttpMethod>(['POST', 'PUT', 'PATCH', 'DELETE']);

interface RequestOptions {
  /** Abort signal — pass AbortController.signal for cancellation */
  signal?:    AbortSignal;
  /** Additional headers merged with defaults */
  headers?:   Record<string, string>;
  /** Skip Bearer token (e.g. public endpoints) */
  anonymous?: boolean;
}

// ─── Retry helpers ────────────────────────────────────────────────────────────

function isRetryable(method: HttpMethod, status: number): boolean {
  return method === 'GET' && (status === 0 || status >= 500);
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  method:  HttpMethod,
  path:    string,
  body?:   unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { signal, headers: extraHeaders = {}, anonymous = false } = options;

  // Build headers
  const isFormData    = body instanceof FormData;
  const baseHeaders   = isFormData ? {} : { ...API_CONFIG.defaultHeaders };
  const authHeader    = !anonymous && _accessToken
    ? { Authorization: `Bearer ${_accessToken}` }
    : {};

  // Security headers — applied to every request
  const securityHeaders: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
  };

  // CSRF token for state-mutating requests
  if (CSRF_METHODS.has(method)) {
    const csrf = getCsrfToken();
    if (csrf) securityHeaders['X-CSRF-Token'] = csrf;
  }

  const headers: Record<string, string> = {
    ...baseHeaders,
    ...securityHeaders,
    ...authHeader,
    ...extraHeaders,
  };

  // Build init — credentials:'include' sends HttpOnly cookies automatically
  const init: RequestInit = {
    method,
    headers,
    credentials: 'include',
    body: isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  };

  // Merge caller signal with timeout signal
  const timeoutSignal = AbortSignal.timeout(API_CONFIG.timeoutMs);
  if (signal) {
    // Combine both signals — abort if either fires
    const combined = AbortSignal.any([signal, timeoutSignal]);
    init.signal = combined;
  } else {
    init.signal = timeoutSignal;
  }

  const url = `${API_CONFIG.baseUrl}${path}`;

  // Retry loop (only for safe GET requests)
  let lastError: unknown;
  const maxAttempts = method === 'GET' ? API_CONFIG.maxRetries : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, init);

      // Handle 401 globally
      if (response.status === 401) {
        _on401?.();
      }

      if (!response.ok) {
        const err = await responseToError(response);
        // Only retry on 5xx for GETs
        if (method === 'GET' && response.status >= 500 && attempt < maxAttempts) {
          lastError = err;
          await wait(attempt * 500);   // 500ms, 1000ms back-off
          continue;
        }
        throw err;
      }

      // 204 No Content
      if (response.status === 204) return undefined as T;

      return (await response.json()) as T;

    } catch (err) {
      if ((err as Error).name === 'AbortError' || (err as Error).name === 'TimeoutError') {
        throw new AbortError();
      }
      if (err instanceof TypeError) {
        lastError = new NetworkError(err);
        if (method === 'GET' && attempt < maxAttempts) {
          await wait(attempt * 500);
          continue;
        }
        throw lastError;
      }
      throw err;
    }
  }

  throw lastError ?? new NetworkError();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Typed API client — all services use this object exclusively.
 *
 * Responses are expected to be wrapped in ApiResponse<T> or PaginatedResponse<T>
 * by the backend. Services unwrap `.data` before returning to callers.
 */
export const apiClient = {
  /** GET /path → ApiResponse<T> */
  get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('GET', path, undefined, options);
  },

  /** GET /path → PaginatedResponse<T> */
  getPaginated<T>(path: string, options?: RequestOptions): Promise<PaginatedResponse<T>> {
    return request<PaginatedResponse<T>>('GET', path, undefined, options);
  },

  /** POST /path body → ApiResponse<T> */
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('POST', path, body, options);
  },

  /** PUT /path body → ApiResponse<T> */
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('PUT', path, body, options);
  },

  /** PATCH /path body → ApiResponse<T> */
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('PATCH', path, body, options);
  },

  /** DELETE /path → ApiResponse<void> */
  delete<T = void>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('DELETE', path, undefined, options);
  },

  /**
   * POST /path formData — for file uploads.
   * Sets no Content-Type header so the browser auto-sets multipart boundary.
   */
  upload<T>(path: string, formData: FormData, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('POST', path, formData, options);
  },
} as const;
