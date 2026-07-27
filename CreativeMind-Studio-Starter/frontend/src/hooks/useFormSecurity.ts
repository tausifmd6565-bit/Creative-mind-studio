/**
 * hooks/useFormSecurity.ts
 *
 * Secure form submission hook.
 *
 * Wraps form submit handlers with:
 *  - Input sanitization via sanitizeText()
 *  - User-facing error extraction via toUserMessage()
 *  - Loading and success state management
 *  - Rate-limiting guard (prevents double-submit)
 *
 * USAGE:
 *   const { submit, isSubmitting, error, clearError } = useFormSecurity();
 *
 *   const handleSubmit = submit(async (formData) => {
 *     const safe = sanitizeFormData(formData);
 *     await authService.login(safe);
 *   });
 */

import { useCallback, useRef, useState } from 'react';
import { toUserMessage } from '../lib/security/errorSanitization';
import { sanitizeText } from '../lib/security/sanitize';

// ─── sanitizeFormData ─────────────────────────────────────────────────────────

/**
 * Sanitize all string values in a plain object record.
 * Preserves non-string values unchanged.
 */
export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data };
  for (const key in result) {
    const val = result[key];
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeText(val);
    }
  }
  return result;
}

// ─── useFormSecurity ──────────────────────────────────────────────────────────

interface FormSecurityState {
  isSubmitting: boolean;
  error:        string | null;
  success:      boolean;
}

interface FormSecurityReturn extends FormSecurityState {
  /**
   * Wrap an async submit handler. Automatically:
   *  - Prevents double-submit while isSubmitting is true
   *  - Catches errors and converts them to user-safe messages
   *  - Tracks loading and success state
   */
  submit: <T>(
    handler: (e: React.FormEvent<T>) => Promise<void>
  ) => (e: React.FormEvent<T>) => void;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useFormSecurity(): FormSecurityReturn {
  const [state, setState] = useState<FormSecurityState>({
    isSubmitting: false,
    error:        null,
    success:      false,
  });
  const submittingRef = useRef(false);

  const submit = useCallback(<T>(
    handler: (e: React.FormEvent<T>) => Promise<void>
  ) => {
    return (e: React.FormEvent<T>) => {
      e.preventDefault();
      if (submittingRef.current) return; // prevent double-submit
      submittingRef.current = true;
      setState({ isSubmitting: true, error: null, success: false });

      handler(e)
        .then(() => {
          setState({ isSubmitting: false, error: null, success: true });
        })
        .catch((err: unknown) => {
          setState({
            isSubmitting: false,
            error: toUserMessage(err),
            success: false,
          });
        })
        .finally(() => {
          submittingRef.current = false;
        });
    };
  }, []);

  const clearError   = useCallback(() => setState(s => ({ ...s, error: null })),   []);
  const clearSuccess = useCallback(() => setState(s => ({ ...s, success: false })), []);

  return {
    ...state,
    submit,
    clearError,
    clearSuccess,
  };
}
