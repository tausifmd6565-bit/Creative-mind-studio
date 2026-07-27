/**
 * lib/api/errors.ts
 *
 * Typed error hierarchy for the API layer.
 *
 * Every error thrown by the client is an instance of one of these classes
 * so that service callers and React Query error handlers can discriminate
 * cleanly using `instanceof` or the `isXxxError()` guards.
 *
 *   ApiError          — base; wraps every non-2xx response
 *   NetworkError      — fetch threw (offline, DNS, CORS, timeout)
 *   AuthError         — 401 Unauthorized
 *   ForbiddenError    — 403 Forbidden
 *   NotFoundError     — 404 Not Found
 *   ValidationError   — 422 Unprocessable Entity (field-level details)
 *   RateLimitError    — 429 Too Many Requests
 *   ServerError       — 5xx
 *   AbortError        — request was cancelled via AbortController
 */

import type { ApiError as ApiErrorDetail } from '../../types';

// ─── Serialisable payload from the backend ────────────────────────────────────

export interface ApiErrorBody {
  /** Top-level human-readable message */
  message:  string;
  /** Machine-readable error code (e.g. "RESOURCE_NOT_FOUND") */
  code?:    string;
  /** Structured field errors from validation */
  errors?:  ApiErrorDetail[];
}

// ─── Base class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  /** HTTP status code */
  readonly status:    number;
  /** Machine-readable code from the response body */
  readonly code:      string | undefined;
  /** Structured error detail list from the server */
  readonly details:   ApiErrorDetail[];
  /** Raw response body */
  readonly body:      ApiErrorBody | null;

  constructor(
    message:  string,
    status:   number,
    body:     ApiErrorBody | null = null,
  ) {
    super(message);
    this.name    = 'ApiError';
    this.status  = status;
    this.code    = body?.code;
    this.details = body?.errors ?? [];
    this.body    = body;
  }
}

// ─── Derived error types ──────────────────────────────────────────────────────

export class NetworkError extends Error {
  constructor(cause?: Error) {
    super(cause?.message ?? 'Network request failed');
    this.name  = 'NetworkError';
    this.cause = cause;
  }
}

export class AuthError extends ApiError {
  constructor(body?: ApiErrorBody) {
    super(body?.message ?? 'Unauthorized', 401, body ?? null);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(body?: ApiErrorBody) {
    super(body?.message ?? 'Forbidden', 403, body ?? null);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(body?: ApiErrorBody) {
    super(body?.message ?? 'Resource not found', 404, body ?? null);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(body?: ApiErrorBody) {
    super(body?.message ?? 'Validation failed', 422, body ?? null);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ApiError {
  /** When the client may retry (from Retry-After header) */
  readonly retryAfter: number | null;

  constructor(retryAfter: number | null = null, body?: ApiErrorBody) {
    super(body?.message ?? 'Rate limit exceeded', 429, body ?? null);
    this.name       = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends ApiError {
  constructor(status: number, body?: ApiErrorBody) {
    super(body?.message ?? `Server error (${status})`, status, body ?? null);
    this.name = 'ServerError';
  }
}

export class AbortError extends Error {
  constructor() {
    super('Request was cancelled');
    this.name = 'AbortError';
  }
}

// ─── Type guards ──────────────────────────────────────────────────────────────

export const isApiError       = (e: unknown): e is ApiError       => e instanceof ApiError;
export const isNetworkError   = (e: unknown): e is NetworkError   => e instanceof NetworkError;
export const isAuthError      = (e: unknown): e is AuthError      => e instanceof AuthError;
export const isForbiddenError = (e: unknown): e is ForbiddenError => e instanceof ForbiddenError;
export const isNotFoundError  = (e: unknown): e is NotFoundError  => e instanceof NotFoundError;
export const isValidationError= (e: unknown): e is ValidationError=> e instanceof ValidationError;
export const isRateLimitError = (e: unknown): e is RateLimitError => e instanceof RateLimitError;
export const isServerError    = (e: unknown): e is ServerError    => e instanceof ServerError;
export const isAbortError     = (e: unknown): e is AbortError     => e instanceof AbortError;

// ─── Response-to-error factory ────────────────────────────────────────────────

/**
 * Parses a non-2xx Response into the appropriate typed error class.
 * Attempts to JSON-decode the body; falls back to text.
 */
export async function responseToError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    try {
      const text    = await response.text();
      body          = { message: text || response.statusText };
    } catch {
      body = { message: response.statusText };
    }
  }

  const retryAfter = response.headers.get('Retry-After');

  switch (response.status) {
    case 401: return new AuthError(body ?? undefined);
    case 403: return new ForbiddenError(body ?? undefined);
    case 404: return new NotFoundError(body ?? undefined);
    case 422: return new ValidationError(body ?? undefined);
    case 429: return new RateLimitError(retryAfter ? Number(retryAfter) : null, body ?? undefined);
    default:
      if (response.status >= 500) return new ServerError(response.status, body ?? undefined);
      return new ApiError(body?.message ?? response.statusText, response.status, body);
  }
}
