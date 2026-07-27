/**
 * lib/security/auth.ts
 *
 * Secure authentication abstraction.
 *
 * SECURITY DESIGN:
 *  - Access tokens are stored only in JavaScript memory (module-scoped variable).
 *    They NEVER touch localStorage, sessionStorage, or cookies from the frontend.
 *  - The backend issues the refresh token as an HTTP-only, Secure, SameSite=Strict
 *    cookie. The frontend never reads or writes this cookie.
 *  - The memory token survives only for the tab's lifetime — a page refresh
 *    triggers a silent re-hydration via /auth/me (which relies on the HTTP-only
 *    cookie the browser automatically sends).
 *  - setAccessToken() and getAccessToken() are intentionally NOT exported from
 *    this module to prevent accidental direct manipulation from components.
 *    All auth mutations go through the authState machine below.
 *
 * HOW TO USE:
 *  - Call authGuard.bootstrap() once at app startup (main.tsx or a root effect).
 *  - Components read auth state from the authGuard.state getter (or via hook).
 *  - All 401 handling is centralised through register401Handler() in the API client.
 *
 * CSRF PROTECTION:
 *  - For state-mutating requests (POST/PUT/PATCH/DELETE), the backend must
 *    implement CSRF token validation (double-submit cookie or synchronizer token).
 *  - The client reads the CSRF token from a non-HttpOnly cookie or a meta tag
 *    (set by the server during HTML delivery) and sends it as X-CSRF-Token.
 *  - getCsrfToken() reads the token from the designated cookie name.
 */

import { setAccessToken, register401Handler } from '../api/client';

// ─── Auth state ───────────────────────────────────────────────────────────────

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status:  AuthStatus;
  userId:  string | null;
}

// ─── CSRF token ───────────────────────────────────────────────────────────────

const CSRF_COOKIE_NAME = 'csrftoken';

/**
 * Read the CSRF token from a non-HttpOnly cookie.
 * Returns null if not present — the backend must issue it.
 */
export function getCsrfToken(): string | null {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${CSRF_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

type On401Callback = () => void;
type StateChangeCallback = (state: AuthState) => void;

class AuthGuard {
  private _state: AuthState = { status: 'unknown', userId: null };
  private _listeners: StateChangeCallback[] = [];

  get state(): AuthState {
    return { ...this._state };
  }

  private setState(next: AuthState): void {
    this._state = next;
    this._listeners.forEach(fn => fn(this.state));
  }

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  subscribe(callback: StateChangeCallback): () => void {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(fn => fn !== callback);
    };
  }

  /**
   * Called after a successful login. Stores the access token in memory only.
   * The refresh token must be in an HTTP-only cookie handled by the backend.
   */
  setAuthenticated(accessToken: string, userId: string): void {
    setAccessToken(accessToken);
    this.setState({ status: 'authenticated', userId });
  }

  /**
   * Clear all auth state. Does NOT clear the HTTP-only cookie —
   * that requires a server-side /auth/logout call which the backend
   * clears the cookie on its own.
   */
  clearAuth(): void {
    setAccessToken(null);
    this.setState({ status: 'unauthenticated', userId: null });
  }

  /**
   * Wire global 401 handling. Call once at app bootstrap.
   * @param on401 — callback to navigate to the login page
   */
  bootstrap(on401: On401Callback): void {
    register401Handler(() => {
      this.clearAuth();
      on401();
    });
  }

  /**
   * Rehydrate auth from the server using the HTTP-only refresh cookie.
   * The /auth/me endpoint will return 401 if the session is invalid.
   *
   * @param fetchMe — async function that calls the /auth/me API endpoint
   * @param getToken — async function that returns a fresh access token via silent refresh
   */
  async rehydrate(options: {
    fetchMe:  () => Promise<{ id: string }>;
    getToken: () => Promise<string>;
  }): Promise<void> {
    try {
      const token = await options.getToken();
      const me    = await options.fetchMe();
      this.setAuthenticated(token, me.id);
    } catch {
      // 401 or network error — user is not authenticated
      this.clearAuth();
    }
  }
}

/** Singleton auth guard — import this in services and hooks */
export const authGuard = new AuthGuard();

// ─── CSP nonce helper ─────────────────────────────────────────────────────────

/**
 * Read the CSP nonce injected by the server into the HTML document.
 * Use for any dynamically created <script> or <style> elements.
 */
export function getCspNonce(): string | null {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csp-nonce"]');
  return meta?.content ?? null;
}
