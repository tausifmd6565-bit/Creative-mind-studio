/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * App.tsx — root component.
 *
 * All heavy workspace pages are lazy-loaded via React.lazy() + Suspense.
 * The WorkspaceLoader skeleton is shown while the chunk downloads.
 *
 * Navigation is driven by a `view` state string.  The LayoutProvider receives
 * an `onNavigate` callback so sidebar / header clicks update `view` directly.
 *
 * Views:
 *   marketing        — Public landing page
 *   auth             — Login / onboarding
 *   app              — Dashboard home  (default)
 *   projects         — Projects list
 *   team             — Team management
 *   agents           — AI Agents
 *   analytics        — Cross-project analytics
 *   templates        — Templates library
 *   settings         — Workspace settings
 *   notifications    — Notifications center
 *   create-project   — New project wizard
 *   project-overview — Single project overview
 *   strategy         — Strategy War Room
 *   virality-twin    — Virality Twin
 *   research-lab     — Research Lab
 *   script-room      — Script & Story Room
 *   asset-room       — Asset Room
 *   editor           — Video Editor
 *   review           — Review & Approval
 *   distribution     — Distribution Room
 *   performance      — Performance Workspace
 */

import React, { lazy, Suspense, useCallback, useState } from 'react';

// ── Always-loaded shell ──────────────────────────────────────────────────────
import { LayoutProvider } from './lib/LayoutContext';
import { MainLayout } from './components/layout/MainLayout';
import { WorkspaceLoader } from './components/shared/WorkspaceLoader';
import type { ActiveNavId } from './types/shell';

// ── Lazy workspace pages ─────────────────────────────────────────────────────

const MarketingPage        = lazy(() => import('./app/marketing/page').then(m => ({ default: m.MarketingPage })));
const AuthRouter           = lazy(() => import('./app/auth/AuthRouter').then(m => ({ default: m.AuthRouter })));
const DashboardPage        = lazy(() => import('./app/dashboard/page').then(m => ({ default: m.DashboardPage })));

const ProjectsPage         = lazy(() => import('./app/dashboard/projects/page'));
const TeamPage             = lazy(() => import('./app/dashboard/team/page'));
const NotificationsPage    = lazy(() => import('./app/dashboard/notifications/page'));
const AgentsPage           = lazy(() => import('./app/dashboard/agents/page'));
const AnalyticsPage        = lazy(() => import('./app/dashboard/analytics/page'));
const TemplatesPage        = lazy(() => import('./app/dashboard/templates/page'));
const SettingsPage         = lazy(() => import('./app/dashboard/settings/page'));

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

// ── App view type ─────────────────────────────────────────────────────────────

type AppView =
  | 'marketing'
  | 'auth'
  | 'app'
  | 'projects'
  | 'team'
  | 'agents'
  | 'analytics'
  | 'templates'
  | 'settings'
  | 'notifications'
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
  | 'performance';

// Map sidebar nav-item ids → AppView
// Primary nav ids match directly; project nav ids need remapping.
const NAV_ID_TO_VIEW: Record<string, AppView> = {
  // Primary nav
  home:           'app',
  projects:       'projects',
  agents:         'agents',
  team:           'team',
  notifications:  'notifications',
  analytics:      'analytics',
  templates:      'templates',
  settings:       'settings',
  // Top-level shortcuts
  'create-project': 'create-project',
  // Project-level nav
  'project-overview': 'project-overview',
  'strategy-room':    'strategy',
  'virality-twin':    'virality-twin',
  'research-lab':     'research-lab',
  'story-script':     'script-room',
  'asset-room':       'asset-room',
  'editor-workspace': 'editor',
  'review-approval':  'review',
  distribution:       'distribution',
  performance:        'performance',
};

const DEFAULT_VIEW: AppView = 'app';

// ── Per-view fallback config ──────────────────────────────────────────────────

function getLoaderFallback(view: AppView) {
  if (view === 'marketing' || view === 'auth') {
    return <WorkspaceLoader showLeft={false} showRight={false} />;
  }
  if (
    view === 'app' || view === 'projects' || view === 'team' ||
    view === 'notifications' || view === 'agents' || view === 'analytics' ||
    view === 'templates' || view === 'settings'
  ) {
    return <WorkspaceLoader showLeft={false} showRight={false} />;
  }
  return <WorkspaceLoader />;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<AppView>(DEFAULT_VIEW);

  // Called by LayoutProvider whenever the user clicks a nav item.
  const handleNavigate = useCallback((id: ActiveNavId) => {
    const nextView = NAV_ID_TO_VIEW[id];
    if (nextView) setView(nextView);
  }, []);

  // Stable view-setter callbacks used by workspace pages (back / continue).
  const goApp             = useCallback(() => setView('app'),             []);
  const goProjects        = useCallback(() => setView('projects'),        []);
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
    <LayoutProvider onNavigate={handleNavigate}>
      <MainLayout>

        {/* ── Dashboard home ── */}
        {view === 'app' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <DashboardPage />
          </Suspense>
        )}

        {/* ── Primary nav pages ── */}
        {view === 'projects' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <ProjectsPage />
          </Suspense>
        )}

        {view === 'team' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <TeamPage />
          </Suspense>
        )}

        {view === 'notifications' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <NotificationsPage />
          </Suspense>
        )}

        {view === 'agents' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <AgentsPage />
          </Suspense>
        )}

        {view === 'analytics' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <AnalyticsPage />
          </Suspense>
        )}

        {view === 'templates' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <TemplatesPage />
          </Suspense>
        )}

        {view === 'settings' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <SettingsPage />
          </Suspense>
        )}

        {/* ── Project creation wizard ── */}
        {view === 'create-project' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <ProjectCreationWizard
              onClose={goApp}
              onProjectCreated={goProjectOverview}
            />
          </Suspense>
        )}

        {/* ── Project-level workspace pages ── */}
        {view === 'project-overview' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} />}>
            <ProjectOverviewPage onBack={goProjects} />
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

      </MainLayout>
    </LayoutProvider>
  );
}
