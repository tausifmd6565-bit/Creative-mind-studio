/**
 * lib/security/index.ts — Security utilities barrel export
 *
 * Import any security primitive from a single path:
 *   import { sanitizeHtml, validateFile, toUserMessage } from '../lib/security';
 */

// HTML / text sanitization
export {
  sanitizeText,
  sanitizeHtml,
  sanitizeUrl,
  escapeHtml,
} from './sanitize';

// File validation
export {
  validateFile,
  validateFiles,
  sanitizeFileName,
  detectCategory,
  readFileMagicBytes,
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_CONCURRENT_UPLOADS,
  ALLOWED_MIME_TYPES,
} from './fileValidation';
export type {
  FileValidationResult,
  AllowedCategory,
} from './fileValidation';

// Input validation
export {
  compose,
  required,
  requiredSelect,
  minLength,
  maxLength,
  exactLength,
  pattern,
  noPattern,
  email,
  strongPassword,
  passwordMatch,
  slug,
  safeUrl,
  phone,
  safeName,
  projectName,
  description,
  inviteCode,
  minValue,
  maxValue,
  integer,
  validateForm,
} from './inputValidation';
export type { Validator } from './inputValidation';

// Error sanitization
export {
  toUserMessage,
  sanitizeApiErrorBody,
  safeLog,
} from './errorSanitization';

// Auth guard
export {
  authGuard,
  getCsrfToken,
  getCspNonce,
} from './auth';
export type { AuthState, AuthStatus } from './auth';
