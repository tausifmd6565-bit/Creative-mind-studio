/**
 * lib/api/client.ts
 *
 * Centralised, transport-agnostic HTTP client for CreativeMind Studio.
 *
 * SECURITY FEATURES:
 *  - Bearer token is stored in memory only.
 *  - Cross-domain ready: uses 'same-origin' credentials mode so browser CORS requests work seamlessly across Vercel & Render.
 *  - CSRF: X-CSRF-Token header is injected automatically for state-mutating methods.
 *  - Security headers: X-Requested-With on every request.
 *  - Typed GET / POST / PUT / PATCH / DELETE
 *  - JSON + FormData request bodies
 *  - AbortController / request cancellation
 *  - Automatic retry for safe GET requests (network errors + 5xx)
 *  - Structured error classes
 */

import { API_CONFIG } from '../../config/api.config';
import {
  AbortError,
  NetworkError,
  responseToError,
} from './errors';
import { getCsrfToken } from '../security/auth';
import type { ApiResponse, PaginatedResponse } from '../../types';

let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

let _on401: (() => void) | null = null;

export function register401Handler(handler: () => void): void {
  _on401 = handler;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const CSRF_METHODS = new Set<HttpMethod>(['POST', 'PUT', 'PATCH', 'DELETE']);

interface RequestOptions {
  signal?:    AbortSignal;
  headers?:   Record<string, string>;
  anonymous?: boolean;
}

function isRetryable(method: HttpMethod, status: number): boolean {
  return method === 'GET' && (status === 0 || status >= 500);
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request<T>(
  method:  HttpMethod,
  path:    string,
  body?:   unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { signal, headers: extraHeaders = {}, anonymous = false } = options;

  const isFormData    = body instanceof FormData;
  const baseHeaders   = isFormData ? {} : { ...API_CONFIG.defaultHeaders };
  const authHeader: Record<string, string> = !anonymous && _accessToken
    ? { Authorization: `Bearer ${_accessToken}` }
    : {};

  const securityHeaders: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
  };

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

  const init: RequestInit = {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  };

  const timeoutSignal = AbortSignal.timeout(API_CONFIG.timeoutMs);
  if (signal) {
    const combined = AbortSignal.any([signal, timeoutSignal]);
    init.signal = combined;
  } else {
    init.signal = timeoutSignal;
  }

  const url = `${API_CONFIG.baseUrl}${path}`;

  let lastError: unknown;
  const maxAttempts = method === 'GET' ? API_CONFIG.maxRetries : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, init);

      if (response.status === 401) {
        _on401?.();
      }

      if (!response.ok) {
        throw await responseToError(response);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const json = await response.json();
      return json as T;
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        throw new AbortError();
      }

      if (err instanceof TypeError && err.message.includes('fetch')) {
        lastError = new NetworkError(url);
      } else {
        lastError = err;
      }

      if (isRetryable(method, (err as { status?: number }).status ?? 0) && attempt < maxAttempts) {
        await wait(200 * Math.pow(2, attempt - 1));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('GET', path, undefined, options);
  },

  getPaginated<T>(path: string, options?: RequestOptions): Promise<PaginatedResponse<T>> {
    return request<PaginatedResponse<T>>('GET', path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('POST', path, body, options);
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('PUT', path, body, options);
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('PATCH', path, body, options);
  },

  delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>('DELETE', path, undefined, options);
  },
};
