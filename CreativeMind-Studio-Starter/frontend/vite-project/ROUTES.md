# Routes & Navigation Reference

CreativeMind Studio does not use a URL router. Navigation is controlled by a view state machine in [`src/App.tsx`](src/App.tsx) — a `useState<AppView>` value that determines which workspace renders. This document maps every view key to its page component, code-split chunk, navigation path, and props.

---

## Table of Contents

1. [View state machine](#1-view-state-machine)
2. [View map](#2-view-map)
3. [Auth flow routing](#3-auth-flow-routing)
4. [Onboarding flow routing](#4-onboarding-flow-routing)
5. [Project creation wizard routing](#5-project-creation-wizard-routing)
6. [Workspace pipeline routing](#6-workspace-pipeline-routing)
7. [Layout wrapping rules](#7-layout-wrapping-rules)
8. [Switching views from components](#8-switching-views-from-components)
9. [Migrating to a URL router](#9-migrating-to-a-url-router)

---

## 1. View state machine

```ts
// src/App.tsx
const [view, setView] = useState<AppView>(DEFAULT_VIEW);
```

`DEFAULT_VIEW` is a compile-time constant. Change it to start on a different screen during development:

```ts
const DEFAULT_VIEW: AppView = 'strategy'; // ← development shortcut
```

Every view renders inside a `<Suspense>` boundary. The fallback is `<WorkspaceLoader />` (or a panel-less variant for full-screen views).

---

## 2. View map

| `AppView` key | Component | File | Chunk |
|---------------|-----------|------|-------|
| `marketing` | `MarketingPage` | `app/marketing/page.tsx` | `workspace-auth` |
| `auth` | `AuthRouter` | `app/auth/AuthRouter.tsx` | `workspace-auth` |
| `app` | `DashboardPage` | `app/dashboard/page.tsx` | (main chunk) |
| `create-project` | `ProjectCreationWizard` | `app/create-project/ProjectCreationWizard.tsx` | `workspace-auth` |
| `project-overview` | `ProjectOverviewPage` | `app/dashboard/projects/projectId/overview/ProjectOverviewPage.tsx` | `workspace-project` |
| `strategy` | `StrategyWarRoomPage` | `app/dashboard/projects/projectId/strategy/StrategyWarRoomPage.tsx` | `workspace-project` |
| `virality-twin` | `ViralityTwinPage` | `app/dashboard/projects/projectId/virality-twin/ViralityTwinPage.tsx` | `workspace-analytics` |
| `research-lab` | `ResearchLabPage` | `app/dashboard/projects/projectId/research/ResearchLabPage.tsx` | `workspace-project` |
| `script-room` | `ScriptRoomPage` | `app/dashboard/projects/projectId/script/ScriptRoomPage.tsx` | `workspace-project` |
| `asset-room` | `AssetRoomPage` | `app/dashboard/projects/projectId/assets/AssetRoomPage.tsx` | `workspace-editor` |
| `editor` | `VideoEditorWorkspace` | `app/dashboard/projects/projectId/editor/VideoEditorWorkspace.tsx` | `workspace-editor` |
| `review` | `ReviewApprovalRoom` | `app/dashboard/projects/projectId/review/ReviewApprovalRoom.tsx` | `workspace-project` |
| `distribution` | `DistributionRoom` | `app/dashboard/projects/projectId/distribution/DistributionRoom.tsx` | `workspace-project` |
| `performance` | `PerformanceWorkspace` | `app/dashboard/projects/projectId/analytics/PerformanceWorkspace.tsx` | `workspace-analytics` |
| `notifications` | `NotificationsWorkspace` | `app/dashboard/notifications/NotificationsWorkspace.tsx` | (main chunk) |

---

## 3. Auth flow routing

The `auth` view renders `AuthRouter`, which owns an internal page state for the entire auth flow.

```
view = 'auth'
  └─► AuthRouter (initialPage="login")
        ├─ "login"        → LoginPage
        ├─ "register"     → RegisterPage
        ├─ "forgot"       → ForgotPasswordPage
        ├─ "verify"       → EmailVerificationPage
        └─ "invitation"   → TeamInvitationPage
```

`AuthRouter` accepts:

| Prop | Type | Description |
|------|------|-------------|
| `initialPage` | `'login' \| 'register' \| 'forgot' \| 'verify' \| 'invitation'` | Which auth page to show first |
| `onAuthenticated` | `() => void` | Called when login / register succeeds — triggers `setView('app')` |

The auth pages share [`app/auth/components/AuthLayout.tsx`](src/app/auth/components/AuthLayout.tsx) as their wrapper (centred card, brand logo).

---

## 4. Onboarding flow routing

After first registration `AuthRouter` navigates internally to the onboarding wizard:

```
RegisterPage (success)
  └─► OnboardingWizard
        ├─ Step 1 — RoleSelection     (creator / team / agency)
        ├─ Step 2 — ContentTypes      (video / podcast / article / …)
        ├─ Step 3 — Workspace setup   (workspace name, logo)
        ├─ Step 4 — InviteTeam        (optional — invite colleagues)
        └─ Step 5 — FirstProject      (name + type — skips project wizard)
              └─► onAuthenticated() → setView('app') or setView('project-overview')
```

The wizard lives in [`app/auth/onboarding/`](src/app/auth/onboarding/). State is managed by `OnboardingWizard.tsx` using a local step index.

---

## 5. Project creation wizard routing

```
view = 'create-project'
  └─► ProjectCreationWizard
        ├─ Step 1 — BasicInfo        (title, type, primary platform)
        ├─ Step 2 — CreativeIdea     (concept, target audience)
        ├─ Step 3 — TeamResources    (assign team members)
        └─ Step 4 — StartOptions     (blank / template / AI-guided)
              ├─ onClose()           → setView('app')
              └─ onProjectCreated()  → setView('project-overview')
```

The wizard lives in [`app/create-project/`](src/app/create-project/). State and step logic are in `useProjectWizard.ts`.

---

## 6. Workspace pipeline routing

Each project workspace passes `onBack` and optionally `onContinue` to navigate between steps in the production pipeline.

```
app (Dashboard)
  │
  ├─► create-project ──────────────────────────────────────────►  project-overview
  │
  └─► project-overview
        ├─► strategy            onBack → project-overview
        │         onContinueToResearch → virality-twin
        │
        ├─► virality-twin       onBack → strategy
        │         onContinue   → research-lab
        │
        ├─► research-lab        onBack → virality-twin
        │         onContinue   → script-room
        │
        ├─► script-room         onBack → research-lab
        │         onContinue   → asset-room
        │
        ├─► asset-room          onBack → script-room
        │         onContinue   → editor
        │
        ├─► editor              onBack → asset-room
        │   (no onContinue — exports trigger manual navigation)
        │
        ├─► review              onBack → editor
        │
        ├─► distribution        onBack → review
        │
        └─► performance         onBack → distribution
```

### Workspace prop signatures

| Workspace | `onBack` target | `onContinue` target |
|-----------|-----------------|---------------------|
| `ProjectOverviewPage` | `app` | — |
| `StrategyWarRoomPage` | `project-overview` | `virality-twin` |
| `ViralityTwinPage` | `strategy` | `research-lab` |
| `ResearchLabPage` | `virality-twin` | `script-room` |
| `ScriptRoomPage` | `research-lab` | `asset-room` |
| `AssetRoomPage` | `script-room` | `editor` |
| `VideoEditorWorkspace` | `asset-room` | — |
| `ReviewApprovalRoom` | `editor` | — |
| `DistributionRoom` | `review` | — |
| `PerformanceWorkspace` | `distribution` | — |

---

## 7. Layout wrapping rules

| View | `LayoutProvider` | `MainLayout` | Notes |
|------|-----------------|--------------|-------|
| `marketing` | No | No | Full-screen marketing page |
| `auth` | No | No | Full-screen auth card |
| `app` | Yes | Yes | `showLeft=false, showRight=false` loader |
| `create-project` | Yes | Yes | `showLeft=false, showRight=false` loader |
| `notifications` | Yes | Yes | `showLeft=false, showRight=false` loader |
| All project workspaces | Yes | Yes | Full 3-column `<WorkspaceLoader />` |

---

## 8. Switching views from components

Components do not have direct access to `setView`. The pattern is to pass callbacks as props:

```tsx
// In App.tsx:
<StrategyWarRoomPage
  onBack={() => setView('project-overview')}
  onContinueToResearch={() => setView('virality-twin')}
/>

// In StrategyWarRoomPage:
interface StrategyWarRoomPageProps {
  onBack: () => void;
  onContinueToResearch: () => void;
}
```

For navigation triggered by user interactions deep inside a workspace (e.g. clicking a phase badge in the `PhaseNavigator` component), pass the callback down via props or a context:

```tsx
// Use LayoutContext for cross-cutting layout actions:
import { useLayout } from '../../lib/useLayout';
const { navigateTo } = useLayout(); // if extended to support navigation
```

Alternatively, lift the navigation callback into a context provider scoped to the workspace.

---

## 9. Migrating to a URL router

If you need URL-based routing (browser history, deep links, shareable URLs), the architecture is designed to be migrated with minimal changes:

1. **Replace `useState<AppView>`** in `App.tsx` with your router's route definitions (e.g. React Router `<Routes>`).

2. **Replace `setView(...)` callbacks** with `navigate(...)` calls from `useNavigate()`.

3. **Update `DEFAULT_VIEW`** — remove it and use the router's initial URL instead.

4. **Lazy imports stay unchanged** — `React.lazy()` + `Suspense` is router-agnostic.

5. **Update the Vite preview / Nginx config** to serve `index.html` for all paths (SPA fallback).

Suggested URL structure:

```
/                              → marketing
/login                         → auth (login)
/register                      → auth (register)
/dashboard                     → app
/dashboard/projects/new        → create-project
/projects/:id                  → project-overview
/projects/:id/strategy         → strategy
/projects/:id/virality         → virality-twin
/projects/:id/research         → research-lab
/projects/:id/script           → script-room
/projects/:id/assets           → asset-room
/projects/:id/editor           → editor
/projects/:id/review           → review
/projects/:id/distribution     → distribution
/projects/:id/analytics        → performance
/notifications                 → notifications
```
