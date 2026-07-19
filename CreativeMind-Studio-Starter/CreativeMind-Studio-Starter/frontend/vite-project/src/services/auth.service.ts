/**
 * services/auth.service.ts
 *
 * Authentication service — login, register, token refresh, and current user.
 *
 * SECURITY DESIGN:
 *  - Access tokens are stored in memory only (via authGuard.setAuthenticated).
 *    They are NEVER written to localStorage, sessionStorage, or cookies.
 *  - The refresh token is an HTTP-only, Secure, SameSite=Strict cookie issued
 *    by the backend. The frontend never reads or writes it.
 *  - On login/register, the backend response contains the access token in the
 *    JSON body; the refresh token is set via Set-Cookie header by the server.
 *  - On page refresh, authService.rehydrate() calls /auth/refresh — the browser
 *    automatically sends the HttpOnly refresh-token cookie; no JS involvement.
 *  - All 401 responses trigger authGuard.clearAuth() via the registered handler.
 *
 * When VITE_USE_MOCK_API=true the mock adapter returns realistic data so the
 * UI behaves identically without a running backend.
 */

import { apiClient } from '../lib/api/client';
import { AUTH } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import { authGuard } from '../lib/security/auth';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TokenPair,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  id:               'u-mock-1',
  name:             'Nour Saleh',
  email:            'nour.saleh@creativemind.io',
  avatarInitials:   'NS',
  avatarColor:      '#8B5CF6',
  timezone:         'Asia/Riyadh',
  locale:           'en',
  isVerified:       true,
  isActive:         true,
  createdAt:        '2024-01-12T09:00:00Z',
  updatedAt:        '2024-06-14T09:00:00Z',
};

const MOCK_TOKENS: TokenPair = {
  accessToken:  'mock.access.token',
  refreshToken: 'mock.refresh.token',
  expiresAt:    new Date(Date.now() + 3600 * 1000).toISOString(),
  tokenType:    'Bearer',
};

const mockAuth = {
  async login(_payload: LoginRequest): Promise<LoginResponse> {
    authGuard.setAuthenticated(MOCK_TOKENS.accessToken, MOCK_USER.id);
    return { tokens: MOCK_TOKENS, userId: MOCK_USER.id };
  },
  async register(_payload: RegisterRequest): Promise<LoginResponse> {
    authGuard.setAuthenticated(MOCK_TOKENS.accessToken, MOCK_USER.id);
    return { tokens: MOCK_TOKENS, userId: MOCK_USER.id };
  },
  async refresh(): Promise<TokenPair> {
    authGuard.setAuthenticated(MOCK_TOKENS.accessToken, MOCK_USER.id);
    return MOCK_TOKENS;
  },
  async me(): Promise<User> {
    return MOCK_USER;
  },
  async logout(): Promise<void> {
    authGuard.clearAuth();
  },
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realAuth = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    // anonymous:true — no Bearer token on login (user is not yet authenticated)
    const res = await apiClient.post<LoginResponse>(AUTH.login, payload, { anonymous: true });
    // Access token stored in memory only; refresh token is an HttpOnly cookie
    // set by the backend via Set-Cookie — the frontend never touches it.
    authGuard.setAuthenticated(res.data.tokens.accessToken, res.data.userId);
    return res.data;
  },
  async register(payload: RegisterRequest): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>(AUTH.register, payload, { anonymous: true });
    authGuard.setAuthenticated(res.data.tokens.accessToken, res.data.userId);
    return res.data;
  },
  async refresh(): Promise<TokenPair> {
    // credentials:'include' (set in apiClient) automatically sends the
    // HttpOnly refresh-token cookie — no token in the request body.
    const res = await apiClient.post<TokenPair>(AUTH.refresh, undefined, { anonymous: true });
    authGuard.setAuthenticated(res.data.accessToken, authGuard.state.userId ?? '');
    return res.data;
  },
  async me(): Promise<User> {
    const res = await apiClient.get<User>(AUTH.me);
    return res.data;
  },
  async logout(): Promise<void> {
    try {
      // Server clears the HttpOnly refresh-token cookie
      await apiClient.post(AUTH.logout);
    } finally {
      authGuard.clearAuth();
    }
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockAuth : realAuth;

export const authService = {
  login:    (p: LoginRequest)    => adapter.login(p),
  register: (p: RegisterRequest) => adapter.register(p),
  /** Silent token refresh — relies on HttpOnly cookie, no payload needed */
  refresh:  ()                   => adapter.refresh(),
  me:       ()                   => adapter.me(),
  logout:   ()                   => adapter.logout(),

  /**
   * Wire the global 401 handler and set up silent rehydration.
   * Call once at app bootstrap (e.g. in main.tsx or a root effect).
   *
   * @param on401 — callback to redirect the user to the login page
   */
  bootstrap(on401: () => void): void {
    authGuard.bootstrap(on401);
  },

  /**
   * Re-authenticate on page load using the HTTP-only refresh token cookie.
   * Call this once on app startup before rendering protected routes.
   */
  rehydrate(): Promise<void> {
    return authGuard.rehydrate({
      fetchMe:  () => adapter.me(),
      getToken: async () => {
        const tokens = await adapter.refresh();
        return tokens.accessToken;
      },
    });
  },
};
