/**
 * AppErrorBoundary.tsx — top-level React error boundary.
 *
 * Catches unhandled render/lifecycle exceptions anywhere in the tree and shows
 * a minimal recovery UI instead of a blank screen.
 *
 * Usage (wrap once at the app root):
 *   <AppErrorBoundary>
 *     <App />
 *   </AppErrorBoundary>
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message:  string;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    // In production, forward to your error tracking service here (e.g. Sentry).
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="flex flex-col items-center justify-center h-screen bg-[#07070A] px-6 text-center"
        role="alert"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20
          flex items-center justify-center mb-5">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>

        <h1 className="font-display font-bold text-[18px] text-white mb-2">
          Something went wrong
        </h1>

        <p className="text-[13px] font-mono text-slate-500 max-w-sm mb-1 leading-relaxed">
          {this.state.message}
        </p>
        <p className="text-[11px] font-mono text-slate-600 max-w-sm mb-6">
          If this keeps happening, try refreshing the page.
        </p>

        <button
          type="button"
          onClick={this.handleReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold
            text-white bg-rose-600/80 hover:bg-rose-600 border border-rose-500/30
            transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      </div>
    );
  }
}
