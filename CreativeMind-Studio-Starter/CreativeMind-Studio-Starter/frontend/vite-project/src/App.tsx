/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * App.tsx — root component.
 *
 * All heavy workspace pages are lazy-loaded via React.lazy() + Suspense.
 * Each workspace gets its own dynamic import so Vite can code-split it.
 * The WorkspaceLoader skeleton is shown while the chunk downloads.
 *
 * Switches between fourteen top-level experiences:
 *   1. Marketing landing page      (view = 'marketing')
 *   2. Auth / Onboarding flow      (view = 'auth')
 *   3. Application shell           (view = 'app')
 *   4. Project creation wizard     (view = 'create-project')
 *   5. Project Overview            (view = 'project-overview')
 *   6. Strategy War Room           (view = 'strategy')
 *   7. Virality Twin Workspace     (view = 'virality-twin')
 *   8. Research Lab                (view = 'research-lab')
 *   9. Script & Story Room         (view = 'script-room')
 *  10. Asset Room                  (view = 'asset-room')
 *  11. Video Editor Workspace      (view = 'editor')
 *  12. Review & Approval Room      (view = 'review')
 *  13. Distribution Room           (view = 'distribution')
 *  14. Performance Workspace       (view = 'performance')
 *  15. Notifications               (view = 'notifications')
 *
 * Change DEFAULT_VIEW to start on a different screen during development.
 */

import React, { lazy, Suspense, useCallback, useState } from 'react';

// ── Always-loaded shell ──────────────────────────────────────────────────────
// These are part of the main chunk because they are needed on the very first
// paint (shell chrome, layout provider, auth router).
import { LayoutProvider } from './lib/LayoutContext';
import { MainLayout } from './components/layout/MainLayout';
import { WorkspaceLoader } from './components/shared/WorkspaceLoader';

// ── Lazy workspace pages ─────────────────────────────────────────────────────
// Each dynamic import() creates a separate code-split chunk.
// Vite groups related chunks via the manualChunks strategy in vite.config.ts.

const MarketingPage        = lazy(() => import('./app/marketing/page').then(m => ({ default: m.MarketingPage })));
const AuthRouter           = lazy(() => import('./app/auth/AuthRouter').then(m => ({ default: m.AuthRouter })));
const DashboardPage        = lazy(() => import('./app/dashboard/page').then(m => ({ default: m.DashboardPage })));

const ProjectCreationWizard = lazy(() =>
  import('./app/create-project/ProjectCreationWizard').then(m => ({ default: m.ProjectCreationWizard }))
);
const ProjectOverviewPage  = lazy(() =>
  import('./app/dashboard/projects/projectId/overview/ProjectOverviewPage').then(m => ({ default: m.ProjectOverviewPage }))
);
const StrategyWarRoomPage  = lazy(() =>
  import('./app/dashboard/projects/projectId/strategy/StrategyWarRoomPage').then(m => ({ default: m.StrategyWarRoomPage }))
);
const ViralityTwinPage     = lazy(() =>
  import('./app/dashboard/projects/projectId/virality-twin/ViralityTwinPage').then(m => ({ default: m.ViralityTwinPage }))
);
const ResearchLabPage      = lazy(() =>
  import('./app/dashboard/projects/projectId/research/ResearchLabPage').then(m => ({ default: m.ResearchLabPage }))
);
const ScriptRoomPage       = lazy(() =>
  import('./app/dashboard/projects/projectId/script/ScriptRoomPage').then(m => ({ default: m.ScriptRoomPage }))
);
const AssetRoomPage        = lazy(() =>
  import('./app/dashboard/projects/projectId/assets/AssetRoomPage').then(m => ({ default: m.AssetRoomPage }))
);
const VideoEditorWorkspace = lazy(() =>
  import('./app/dashboard/projects/projectId/editor/VideoEditorWorkspace').then(m => ({ default: m.VideoEditorWorkspace }))
);
const ReviewApprovalRoom   = lazy(() =>
  import('./app/dashboard/projects/projectId/review/ReviewApprovalRoom').then(m => ({ default: m.ReviewApprovalRoom }))
);
const DistributionRoom     = lazy(() =>
  import('./app/dashboard/projects/projectId/distribution/DistributionRoom').then(m => ({ default: m.DistributionRoom }))
);
const PerformanceWorkspace = lazy(() =>
  import('./app/dashboard/projects/projectId/analytics/PerformanceWorkspace').then(m => ({ default: m.PerformanceWorkspace }))
);
const NotificationsWorkspace = lazy(() =>
  import('./app/dashboard/notifications/NotificationsWorkspace').then(m => ({ default: m.NotificationsWorkspace }))
);

// ── App view type ─────────────────────────────────────────────────────────────

type AppView =
  | 'marketing'
  | 'auth'
  | 'app'
  | 'create-project'
  | 'project-overview'
  | 'strategy'
  | 'virality-twin'
  | 'research-lab'
  | 'script-room'
  | 'asset-room'
  | 'editor'
  | 'review'
  | 'distribution'
  | 'performance'
  | 'notifications';

// ← Change this to jump to a specific screen during development
const DEFAULT_VIEW: AppView = 'notifications';

// ── Per-view fallback config ──────────────────────────────────────────────────
// Marketing and auth pages are single-panel so skip the triple-column skeleton.

function getLoaderFallback(view: AppView) {
  if (view === 'marketing' || view === 'auth') {
    return <WorkspaceLoader showLeft={false} showRight={false} />;
  }
  if (view === 'app' || view === 'notifications') {
    return <WorkspaceLoader showLeft={false} showRight={false} />;
  }
  return <WorkspaceLoader />;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<AppView>(DEFAULT_VIEW);

  // Stable callbacks — identity never changes, so LayoutProvider/MainLayout
  // never unmounts between workspace navigations.
  const goApp             = useCallback(() => setView('app'),             []);
  const goProjectOverview = useCallback(() => setView('project-overview'),[]);
  const goStrategy        = useCallback(() => setView('strategy'),        []);
  const goViralityTwin    = useCallback(() => setView('virality-twin'),   []);
  const goResearchLab     = useCallback(() => setView('research-lab'),    []);
  const goScriptRoom      = useCallback(() => setView('script-room'),     []);
  const goAssetRoom       = useCallback(() => setView('asset-room'),      []);
  const goEditor          = useCallback(() => setView('editor'),          []);
  const goReview          = useCallback(() => setView('review'),          []);
  const goDistribution    = useCallback(() => setView('distribution'),    []);
  const goPerformance     = useCallback(() => setView('performance'),     []);

  if (view === 'marketing') {
    return (
      <Suspense fallback={getLoaderFallback('marketing')}>
        <MarketingPage />
      </Suspense>
    );
  }

  if (view === 'auth') {
    return (
      <Suspense fallback={getLoaderFallback('auth')}>
        <AuthRouter
          initialPage="login"
          onAuthenticated={goApp}
        />
      </Suspense>
    );
  }

  // All remaining views share a single LayoutProvider + MainLayout instance.
  // Keeping them in one tree prevents the provider from tearing down and
  // recreating its context value on every navigation.
  return (
    <LayoutProvider>
      <MainLayout>
        {view === 'create-project' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <ProjectCreationWizard
              onClose={goApp}
              onProjectCreated={goProjectOverview}
            />
          </Suspense>
        )}

        {view === 'project-overview' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} />}>
            <ProjectOverviewPage onBack={goApp} />
          </Suspense>
        )}

        {view === 'strategy' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <StrategyWarRoomPage
              onBack={goProjectOverview}
              onContinueToResearch={goViralityTwin}
            />
          </Suspense>
        )}

        {view === 'virality-twin' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <ViralityTwinPage
              onBack={goStrategy}
              onContinue={goResearchLab}
            />
          </Suspense>
        )}

        {view === 'research-lab' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <ResearchLabPage
              onBack={goViralityTwin}
              onContinue={goScriptRoom}
            />
          </Suspense>
        )}

        {view === 'script-room' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <ScriptRoomPage
              onBack={goResearchLab}
              onContinue={goAssetRoom}
            />
          </Suspense>
        )}

        {view === 'asset-room' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <AssetRoomPage
              onBack={goScriptRoom}
              onContinue={goEditor}
            />
          </Suspense>
        )}

        {view === 'editor' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <VideoEditorWorkspace
              onBack={goAssetRoom}
              onContinue={goReview}
            />
          </Suspense>
        )}

        {view === 'review' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <ReviewApprovalRoom
              onBack={goEditor}
              onContinue={goDistribution}
            />
          </Suspense>
        )}

        {view === 'distribution' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <DistributionRoom
              onBack={goReview}
              onContinue={goPerformance}
            />
          </Suspense>
        )}

        {view === 'performance' && (
          <Suspense fallback={<WorkspaceLoader />}>
            <PerformanceWorkspace onBack={goDistribution} />
          </Suspense>
        )}

        {view === 'notifications' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <NotificationsWorkspace />
          </Suspense>
        )}

        {/* Default: dashboard */}
        {(view === 'app' || (
          view !== 'create-project' &&
          view !== 'project-overview' &&
          view !== 'strategy' &&
          view !== 'virality-twin' &&
          view !== 'research-lab' &&
          view !== 'script-room' &&
          view !== 'asset-room' &&
          view !== 'editor' &&
          view !== 'review' &&
          view !== 'distribution' &&
          view !== 'performance' &&
          view !== 'notifications'
        )) && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <DashboardPage />
          </Suspense>
        )}
      </MainLayout>
    </LayoutProvider>
  );
}

