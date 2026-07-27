/**
 * lib/security/inputValidation.ts
 *
 * Reusable input validation rules for forms throughout the application.
 *
 * DESIGN:
 *  - Each validator is a pure function: (value) => string | null
 *  - null = valid; non-null = human-readable error message.
 *  - Validators compose via the `compose` helper.
 *  - No external dependencies.
 *
 * SECURITY RULES:
 *  - All user-supplied strings must pass through at minimum sanitizeText()
 *    from lib/security/sanitize.ts before being stored or displayed.
 *  - Length limits prevent DoS via oversized payloads.
 *  - Input validation on the frontend is a UX guard only. The backend
 *    MUST validate and sanitize all received data independently.
 */

export type Validator<T = string> = (value: T) => string | null;

// ─── Compose helpers ──────────────────────────────────────────────────────────

/**
 * Run validators in order, return the first error or null.
 */
export function compose<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T) => {
    for (const v of validators) {
      const err = v(value);
      if (err !== null) return err;
    }
    return null;
  };
}

// ─── Primitive validators ─────────────────────────────────────────────────────

export const required: Validator = (v) =>
  v.trim().length === 0 ? 'This field is required.' : null;

export const requiredSelect: Validator = (v) =>
  !v || v === '' ? 'Please select an option.' : null;

export function minLength(min: number): Validator {
  return (v) => v.length < min ? `Must be at least ${min} characters.` : null;
}

export function maxLength(max: number): Validator {
  return (v) => v.length > max ? `Must be at most ${max} characters.` : null;
}

export function exactLength(len: number): Validator {
  return (v) => v.length !== len ? `Must be exactly ${len} characters.` : null;
}

export function pattern(regex: RegExp, message: string): Validator {
  return (v) => regex.test(v) ? null : message;
}

export function noPattern(regex: RegExp, message: string): Validator {
  return (v) => regex.test(v) ? message : null;
}

// ─── Domain-specific validators ───────────────────────────────────────────────

/** RFC 5322 simplified email check */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const email: Validator = (v) =>
  EMAIL_REGEX.test(v.trim()) ? null : 'Enter a valid email address.';

/**
 * Password strength rules:
 *  - At least 8 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *  - At least one special character
 */
export const strongPassword: Validator = compose(
  minLength(8),
  pattern(/[A-Z]/,           'Must contain at least one uppercase letter.'),
  pattern(/[a-z]/,           'Must contain at least one lowercase letter.'),
  pattern(/\d/,              'Must contain at least one number.'),
  pattern(/[^A-Za-z0-9]/,   'Must contain at least one special character.'),
);

export function passwordMatch(other: string): Validator {
  return (v) => v !== other ? 'Passwords do not match.' : null;
}

/** Slug: lowercase letters, numbers, hyphens only */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slug: Validator = (v) =>
  SLUG_REGEX.test(v) ? null : 'Use only lowercase letters, numbers, and hyphens.';

/** URL: https or http only */
export const safeUrl: Validator = (v) => {
  if (!v) return null; // optional by default — combine with required() if needed
  try {
    const url = new URL(v);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? null
      : 'Only https:// or http:// URLs are allowed.';
  } catch {
    return 'Enter a valid URL (e.g. https://example.com).';
  }
};

/** Phone: digits, spaces, +, -, (, ) only */
const PHONE_REGEX = /^[+\d\s\-().]{7,20}$/;
export const phone: Validator = (v) =>
  v ? (PHONE_REGEX.test(v) ? null : 'Enter a valid phone number.') : null;

/** Name: no HTML or script-like content */
const UNSAFE_NAME_REGEX = /<|>|javascript:|data:/i;
export const safeName: Validator = (v) =>
  UNSAFE_NAME_REGEX.test(v) ? 'Name contains invalid characters.' : null;

/** Project / workspace name */
export const projectName: Validator = compose(
  required,
  minLength(2),
  maxLength(100),
  safeName,
);

/** Text area / description: max 2000 chars */
export const description: Validator = compose(
  maxLength(2000),
  noPattern(/<script/i, 'Script tags are not allowed.'),
);

/** Invite code / OTP: 6 alphanumeric chars */
export const inviteCode: Validator = compose(
  required,
  exactLength(6),
  pattern(/^[A-Z0-9]{6}$/i, 'Invalid code format. Example: AB12CD'),
);

// ─── Numeric validators ───────────────────────────────────────────────────────

export type NumericValidator = Validator<number>;

export function minValue(min: number): NumericValidator {
  return (v) => v < min ? `Must be at least ${min}.` : null;
}

export function maxValue(max: number): NumericValidator {
  return (v) => v > max ? `Must be at most ${max}.` : null;
}

export function integer(): NumericValidator {
  return (v) => Number.isInteger(v) ? null : 'Must be a whole number.';
}

// ─── Utility: validate a form object ─────────────────────────────────────────

export type FieldValidators<T extends Record<string, unknown>> = {
  [K in keyof T]?: Validator<T[K] extends string ? string : never>;
};

/**
 * Run all registered validators against form values.
 * Returns a partial record of field → error message.
 */
export function validateForm<T extends Record<string, string>>(
  values: T,
  validators: Partial<Record<keyof T, Validator>>,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key in validators) {
    const val = validators[key];
    if (!val) continue;
    const err = val(values[key] ?? '');
    if (err !== null) errors[key] = err;
  }
  return errors;
}
