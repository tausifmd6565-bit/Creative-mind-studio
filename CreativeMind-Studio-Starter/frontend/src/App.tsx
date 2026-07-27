/**
 * App.tsx — Root component.
 *
 * Simplified from 20 views to 8 views after MVP refactor.
 *
 * Views:
 *   marketing          — Public landing page
 *   auth               — Login / onboarding
 *   app                — Dashboard home
 *   projects           — Projects list
 *   team               — Team management
 *   templates          — Templates library
 *   settings           — Workspace settings
 *   create-project     — New project wizard
 *   project-workspace  — Single project 4-tab workspace
 */

import React, { lazy, Suspense, useCallback, useState } from 'react';

import { LayoutProvider } from './lib/LayoutContext';
import { MainLayout } from './components/layout/MainLayout';
import { WorkspaceLoader } from './components/shared/WorkspaceLoader';
import type { ActiveNavId } from './types/shell';

// ── Lazy workspace pages ─────────────────────────────────────────────────────

const MarketingPage       = lazy(() => import('./app/marketing/page').then(m => ({ default: m.MarketingPage })));
const AuthRouter          = lazy(() => import('./app/auth/AuthRouter').then(m => ({ default: m.AuthRouter })));
const DashboardPage       = lazy(() => import('./app/dashboard/page').then(m => ({ default: m.DashboardPage })));
const ProjectsPage        = lazy(() => import('./app/dashboard/projects/page'));
const TeamPage            = lazy(() => import('./app/dashboard/team/page'));
const TemplatesPage       = lazy(() => import('./app/dashboard/templates/page'));
const SettingsPage        = lazy(() => import('./app/dashboard/settings/page'));

const ProjectCreationWizard = lazy(() =>
  import('./app/create-project/ProjectCreationWizard').then(m => ({ default: m.ProjectCreationWizard }))
);
const ProjectWorkspace = lazy(() =>
  import('./app/dashboard/projects/projectId/ProjectWorkspace').then(m => ({ default: m.ProjectWorkspace }))
);

// ── App view type ─────────────────────────────────────────────────────────────

type AppView =
  | 'marketing'
  | 'auth'
  | 'app'
  | 'projects'
  | 'team'
  | 'templates'
  | 'settings'
  | 'create-project'
  | 'project-workspace';

interface TemplatePreset {
  id: string;
  title: string;
  description: string;
  contentType: string;
  platforms: string[];
  duration: string;
  tone?: string;
  structure: string[];
  tags: string[];
}

const NAV_ID_TO_VIEW: Record<string, AppView> = {
  home:             'app',
  projects:         'projects',
  team:             'team',
  templates:        'templates',
  settings:         'settings',
  'create-project': 'create-project',
};

const DEFAULT_VIEW: AppView = 'app';

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]                   = useState<AppView>(DEFAULT_VIEW);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [templatePreset, setTemplatePreset] = useState<TemplatePreset | null>(null);

  const handleNavigate = useCallback((id: ActiveNavId) => {
    const nextView = NAV_ID_TO_VIEW[id];
    if (nextView) setView(nextView);
  }, []);

  const goApp      = useCallback(() => setView('app'),      []);
  const goProjects = useCallback(() => setView('projects'), []);

  const goProjectWorkspace = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
    setView('project-workspace');
  }, []);

  if (view === 'marketing') {
    return (
      <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
        <MarketingPage />
      </Suspense>
    );
  }

  if (view === 'auth') {
    return (
      <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
        <AuthRouter initialPage="login" onAuthenticated={goApp} />
      </Suspense>
    );
  }

  return (
    <LayoutProvider onNavigate={handleNavigate}>
      <MainLayout>

        {view === 'app' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <DashboardPage
              onCreateProject={() => setView('create-project')}
              onOpenProject={goProjectWorkspace}
            />
          </Suspense>
        )}

        {view === 'projects' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <ProjectsPage
              onCreateProject={() => setView('create-project')}
              onOpenProject={goProjectWorkspace}
            />
          </Suspense>
        )}

        {view === 'team' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <TeamPage />
          </Suspense>
        )}

        {view === 'templates' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <TemplatesPage
              onUseTemplate={(template: TemplatePreset) => {
                setTemplatePreset(template);
                setView('create-project');
              }}
            />
          </Suspense>
        )}

        {view === 'settings' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <SettingsPage />
          </Suspense>
        )}

        {view === 'create-project' && (
          <Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
            <ProjectCreationWizard
              onClose={goApp}
              initialTemplate={templatePreset}
              onProjectCreated={(projectId: string) => {
                setTemplatePreset(null);
                goProjectWorkspace(projectId);
              }}
            />
          </Suspense>
        )}

        {view === 'project-workspace' && currentProjectId && (
          <Suspense fallback={<WorkspaceLoader />}>
            <ProjectWorkspace
              projectId={currentProjectId}
              onBack={goProjects}
            />
          </Suspense>
        )}

      </MainLayout>
    </LayoutProvider>
  );
}
