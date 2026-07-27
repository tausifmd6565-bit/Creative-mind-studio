/**
 * lib/security/errorSanitization.ts
 *
 * Error message sanitization — prevents leaking internal stack traces,
 * file paths, environment details, or raw server error payloads to users.
 *
 * SECURITY RULES:
 *  - Never show raw Error.message or server response bodies to users.
 *  - Never log tokens, credentials, or PII to the console in production.
 *  - Use toUserMessage() to convert any caught error to a safe display string.
 *  - Use safeLog() instead of console.error() in production code.
 */

import {
  isApiError,
  isNetworkError,
  isAuthError,
  isForbiddenError,
  isNotFoundError,
  isValidationError,
  isRateLimitError,
  isServerError,
  isAbortError,
  type ApiErrorBody,
} from '../api/errors';

// ─── Patterns that must never appear in user-facing error messages ────────────

const SENSITIVE_PATTERNS = [
  /at\s+\w+\s+\([^)]+\)/g,          // Stack frames: "at foo (file.js:1:2)"
  /\/(home|root|Users?|var|etc|opt|srv|tmp)\/[^\s]*/gi, // Unix file paths
  /[A-Z]:\\[^\s]*/g,                  // Windows file paths
  /\bpassword\b/gi,
  /\btoken\b/gi,
  /\bsecret\b/gi,
  /\bapi[_-]?key\b/gi,
  /\bauthorization\b/gi,
  /\bBearer\s+[\w.-]+/gi,             // Bearer tokens
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi, // Emails
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
  /mongodb(\+srv)?:\/\/[^\s]+/gi,     // Connection strings
  /postgres(ql)?:\/\/[^\s]+/gi,
  /mysql:\/\/[^\s]+/gi,
  /redis:\/\/[^\s]+/gi,
];

/**
 * Strip sensitive content from an error string.
 * Returns the sanitized string, or the placeholder if the input is empty.
 */
function stripSensitive(message: string, placeholder = '[redacted]'): string {
  let safe = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    safe = safe.replace(pattern, placeholder);
  }
  return safe;
}

// ─── User-facing message map ──────────────────────────────────────────────────

const USER_MESSAGES: Record<number, string> = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource could not be found.',
  409: 'A conflict occurred. This item may have already been modified.',
  413: 'The file you are uploading is too large.',
  422: 'Some fields contain invalid data. Please review and try again.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'A server error occurred. Our team has been notified.',
  502: 'Service temporarily unavailable. Please try again in a few moments.',
  503: 'Service temporarily unavailable. Please try again shortly.',
  504: 'The request timed out. Please check your connection and try again.',
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert any caught error to a safe, user-friendly string.
 * Never exposes stack traces, file paths, or credentials.
 */
export function toUserMessage(error: unknown): string {
  if (isAbortError(error)) {
    return 'The request was cancelled.';
  }

  if (isNetworkError(error)) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  if (isAuthError(error)) {
    return USER_MESSAGES[401]!;
  }

  if (isForbiddenError(error)) {
    return USER_MESSAGES[403]!;
  }

  if (isNotFoundError(error)) {
    return USER_MESSAGES[404]!;
  }

  if (isValidationError(error)) {
    // Surface field validation details if available — they are safe to show
    if (error.details.length > 0) {
      return error.details
        .map(d => stripSensitive(d.message))
        .join(' ')
        .trim() || USER_MESSAGES[422]!;
    }
    return USER_MESSAGES[422]!;
  }

  if (isRateLimitError(error)) {
    if (error.retryAfter) {
      return `Too many requests. Please wait ${error.retryAfter}s before trying again.`;
    }
    return USER_MESSAGES[429]!;
  }

  if (isServerError(error)) {
    return USER_MESSAGES[error.status] ?? USER_MESSAGES[500]!;
  }

  if (isApiError(error)) {
    const mapped = USER_MESSAGES[error.status];
    if (mapped) return mapped;
    // For unmapped 4xx, surface a sanitized version of the server message
    if (error.status >= 400 && error.status < 500 && error.message) {
      return stripSensitive(error.message);
    }
    return USER_MESSAGES[500]!;
  }

  if (error instanceof Error) {
    // Generic JS error — never show the raw message in production
    if (import.meta.env.DEV) {
      return stripSensitive(error.message) || 'An unexpected error occurred.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Safe console logger — suppresses all output in production,
 * and sanitizes messages in development.
 */
export const safeLog = {
  error(context: string, error: unknown): void {
    if (!import.meta.env.DEV) return;
    const message = error instanceof Error
      ? stripSensitive(error.message)
      : 'Unknown error';
    console.error(`[${context}]`, message);
  },

  warn(context: string, message: string): void {
    if (!import.meta.env.DEV) return;
    console.warn(`[${context}]`, stripSensitive(message));
  },

  info(context: string, message: string): void {
    if (!import.meta.env.DEV) return;
    console.info(`[${context}]`, message);
  },
};

/**
 * Sanitize a server-side ApiErrorBody before any part of it is displayed.
 * Returns a safe copy with sensitive fields stripped.
 */
export function sanitizeApiErrorBody(body: ApiErrorBody): ApiErrorBody {
  return {
    ...body,
    message: stripSensitive(body.message),
    errors: body.errors?.map(e => ({ ...e, message: stripSensitive(e.message) })),
  };
}
