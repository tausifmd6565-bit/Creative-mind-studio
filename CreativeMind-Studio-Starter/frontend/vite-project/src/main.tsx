import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/feedback/toast'
import { ToastContainer } from './components/feedback/ToastContainer'
import { AppErrorBoundary } from './components/feedback/AppErrorBoundary'
import { authGuard } from './lib/security/auth'

// Wire global 401 → clear auth state.
// In a real app, replace the callback with navigation to the login page.
authGuard.bootstrap(() => {
  // Placeholder: in production this would call setView('auth') or a router redirect.
  console.warn('[auth] 401 received — session expired');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <ToastProvider>
        <App />
        <ToastContainer />
      </ToastProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
