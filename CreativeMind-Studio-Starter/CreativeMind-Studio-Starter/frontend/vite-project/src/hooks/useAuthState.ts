/**
 * hooks/useAuthState.ts
 *
 * React hook that subscribes to authGuard state changes.
 *
 * USAGE:
 *   const { status, userId } = useAuthState();
 *   if (status === 'unauthenticated') return <Navigate to="/login" />;
 *
 * The hook re-renders the component whenever auth state changes —
 * e.g. after login, logout, or a 401 auto-logout triggered by the API client.
 */

import { useEffect, useState } from 'react';
import { authGuard } from '../lib/security/auth';
import type { AuthState } from '../lib/security/auth';

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>(authGuard.state);

  useEffect(() => {
    // Sync with the current state in case it changed before first render
    setState(authGuard.state);
    // Subscribe to future changes
    const unsubscribe = authGuard.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}
