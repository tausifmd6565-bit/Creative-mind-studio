# CreativeMind Studio — Frontend

A **React 19 + TypeScript + Vite 8** single-page application for AI-assisted content creation. The app guides creators through a structured production pipeline: strategy → virality analysis → research → scripting → asset management → editing → review → distribution → analytics.

---

## Table of Contents

1. [Project overview](#1-project-overview)
2. [Installation](#2-installation)
3. [Running locally](#3-running-locally)
4. [Environment variables](#4-environment-variables)
5. [Mock API mode](#5-mock-api-mode)
6. [Real API mode](#6-real-api-mode)
7. [Backend connection](#7-backend-connection)
8. [Authentication flow](#8-authentication-flow)
9. [Folder structure](#9-folder-structure)
10. [Project architecture](#10-project-architecture)
11. [How to replace mock data](#11-how-to-replace-mock-data)
12. [How to add a new workspace](#12-how-to-add-a-new-workspace)
13. [How to deploy](#13-how-to-deploy)

---

## 1. Project overview

CreativeMind Studio is a **frontend-only starter** that ships with a complete mock layer. Every workspace, data model, and service call works out of the box without a backend — flip a single environment variable to connect to a real API.

**Workspace pipeline (in order):**

| # | Workspace | View key |
|---|-----------|----------|
| 1 | Marketing landing page | `marketing` |
| 2 | Auth / Onboarding | `auth` |
| 3 | Dashboard | `app` |
| 4 | Project creation wizard | `create-project` |
| 5 | Project Overview | `project-overview` |
| 6 | Strategy War Room | `strategy` |
| 7 | Virality Twin | `virality-twin` |
| 8 | Research Lab | `research-lab` |
| 9 | Script & Story Room | `script-room` |
| 10 | Asset Room | `asset-room` |
| 11 | Video Editor | `editor` |
| 12 | Review & Approval Room | `review` |
| 13 | Distribution Room | `distribution` |
| 14 | Performance Workspace | `performance` |
| 15 | Notifications | `notifications` |

**Tech stack:**

| Concern | Library |
|---------|---------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 (Rolldown/OXC) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Charts | Recharts 3 |
| Forms | React Hook Form + Zod |

---

## 2. Installation

**Prerequisites:** Node.js ≥ 20, npm ≥ 10.

```bash
# Clone the repo
git clone <repository-url>
cd CreativeMind-Studio-Starter/CreativeMind-Studio-Starter/frontend/vite-project

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env.local
```

---

## 3. Running locally

```bash
# Development server with HMR (default: http://localhost:5173)
npm run dev

# Type-check + production build
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

The dev server starts with `VITE_USE_MOCK_API=true` by default (see `.env.example`), so no backend is required for local development.

To jump directly to a specific workspace during development, change the `DEFAULT_VIEW` constant at the top of [`src/App.tsx`](src/App.tsx):

```ts
const DEFAULT_VIEW: AppView = 'strategy'; // ← change this line
```

The default in the committed file is `'marketing'` (the public landing page). Common development shortcuts:

| Shortcut | Value |
|----------|-------|
| Skip to dashboard | `'app'` |
| Skip to a workspace | `'strategy'`, `'research-lab'`, `'script-room'`, … |
| Skip to notifications | `'notifications'` |

---

## 4. Environment variables

Copy `.env.example` to `.env.local` and fill in your values. **Never commit `.env.local`.**

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Full backend base URL including `/api/v1` prefix |
| `VITE_USE_MOCK_API` | `true` | Set to `false` to use the real backend |
| `VITE_API_TIMEOUT_MS` | `15000` | HTTP request timeout in milliseconds |
| `VITE_API_MAX_RETRIES` | `3` | Max GET retries on 5xx / network error |
| `VITE_FEATURE_ANALYTICS` | `true` | Enable analytics workspace |
| `VITE_FEATURE_VIRALITY` | `true` | Enable virality twin workspace |

**Security rule:** Only `VITE_*` variables are embedded in the browser bundle. Never put secrets (API keys, tokens, database URLs) as `VITE_*` variables — they are readable by anyone who inspects the JS bundle. All AI provider keys live on the backend server only. See [`src/config/env.ts`](src/config/env.ts) for the full validated configuration object.

---

## 5. Mock API mode

Set `VITE_USE_MOCK_API=true` (the default). Every service module (`src/services/`) automatically switches to its in-memory mock adapter. The UI behaves identically to production — no backend process is needed.

Mock data lives in `src/mocks/`:

```
src/mocks/
  project.mock.ts       ← projects, workspace, actors
  strategy.mock.ts      ← debate sessions, scorecards, ledger
  virality.mock.ts      ← virality snapshots, retention, radar
  research.mock.ts      ← questions, sources, claims, evidence map
  script.mock.ts        ← sections, blocks, emotional curve
  scenes.mock.ts        ← scene list, scene assets
  assets.mock.ts        ← asset library, alternatives, timeline
  review.mock.ts        ← review queue, annotations
  distribution.mock.ts  ← platform variants, export options
  analytics.mock.ts     ← KPI metrics, platform data, AI recommendations
  creator-dna.mock.ts   ← creator DNA profile
  notifications.mock.ts ← notification feed, preferences
  index.ts              ← barrel re-export
```

Barrel import:
```ts
import { MOCK_PROJECTS, MOCK_STRATEGY_AGENTS } from '../mocks';
```

---

## 6. Real API mode

Set `VITE_USE_MOCK_API=false` and point `VITE_API_BASE_URL` at your running backend:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.yourbackend.io/api/v1
```

All services automatically call the real HTTP endpoints. No code changes are required. See [BACKEND_EXPECTATIONS.md](BACKEND_EXPECTATIONS.md) for the full contract the backend must satisfy.

---

## 7. Backend connection

The HTTP client ([`src/lib/api/client.ts`](src/lib/api/client.ts)) is the single transport layer. Key behaviours:

- **Bearer token** — stored in memory only (never localStorage). Sent as `Authorization: Bearer <token>`.
- **Refresh token** — an HTTP-only, Secure, SameSite=Strict cookie issued by the backend. The frontend never reads it. The browser attaches it automatically on every `credentials: 'include'` request.
- **CSRF protection** — `X-CSRF-Token` header is injected automatically for `POST / PUT / PATCH / DELETE` requests by reading the `csrftoken` non-HttpOnly cookie set by the server.
- **Retry logic** — safe `GET` requests retry up to `VITE_API_MAX_RETRIES` times on 5xx or network errors, with 500 ms / 1000 ms back-off.
- **Typed errors** — every non-2xx response is converted to a typed error class (`AuthError`, `ValidationError`, `RateLimitError`, etc.). See [`src/lib/api/errors.ts`](src/lib/api/errors.ts).
- **All AI requests** must be routed through the backend. The client never calls AI provider APIs (OpenAI, Anthropic, etc.) directly.

All endpoint paths are defined in [`src/lib/api/endpoints.ts`](src/lib/api/endpoints.ts) — never write a URL string anywhere else.

---

## 8. Authentication flow

```
1. App start
      │
      └─► authService.bootstrap(on401)   registers global 401 handler
      └─► authService.rehydrate()        silent token refresh via /auth/refresh
                                          (browser sends HttpOnly cookie automatically)
          ├─ success → authGuard.setAuthenticated(accessToken, userId)
          └─ failure → authGuard.status = 'unauthenticated' → redirect to /login

2. Login / Register
      └─► authService.login({ email, password })
          └─► POST /auth/login (anonymous: true — no Bearer token sent)
              ├─ Server sets HttpOnly refresh-token cookie via Set-Cookie header
              └─ Response JSON contains { tokens.accessToken, userId }
                  └─► authGuard.setAuthenticated(accessToken, userId)

3. All subsequent requests
      └─► apiClient adds  Authorization: Bearer <in-memory accessToken>
                          X-CSRF-Token: <csrftoken cookie value>
          Any 401 → authGuard.clearAuth() → on401 callback → redirect to login

4. Page refresh
      └─► authService.rehydrate() repeats step 1
          (accessToken is gone from memory; HttpOnly cookie still valid)

5. Logout
      └─► authService.logout()
          └─► POST /auth/logout (server clears the HttpOnly cookie)
              └─► authGuard.clearAuth() (wipes in-memory token)
```

React components subscribe to auth state changes via the [`useAuthState`](src/hooks/useAuthState.ts) hook:

```ts
const { status, userId } = useAuthState();
if (status === 'unauthenticated') return <Navigate to="/login" />;
```

---

## 9. Folder structure

```
src/
├── App.tsx                    Root component — view state machine, lazy loading
├── main.tsx                   Entry point — bootstrap, React root mount
├── index.css                  Global Tailwind base styles
│
├── app/                       Feature pages (co-located with their components)
│   ├── auth/                  Login, Register, Forgot Password, Onboarding wizard
│   ├── create-project/        Project creation wizard (4-step)
│   ├── dashboard/             Dashboard home + sub-workspaces
│   │   ├── components/        KPI cards, activity feed, pipeline widgets
│   │   ├── hooks/             useDashboardData
│   │   ├── notifications/     Notifications workspace
│   │   ├── projects/          Project list page
│   │   │   └── projectId/     Per-project workspaces
│   │   │       ├── analytics/ Performance workspace (Recharts-heavy)
│   │   │       ├── assets/    Asset Room
│   │   │       ├── distribution/ Distribution Room
│   │   │       ├── editor/    Video Editor workspace
│   │   │       ├── overview/  Project overview
│   │   │       ├── research/  Research Lab
│   │   │       ├── review/    Review & Approval Room
│   │   │       ├── script/    Script & Story Room
│   │   │       ├── strategy/  Strategy War Room
│   │   │       ├── virality-twin/ Virality Twin workspace
│   │   │       └── WorkspacePanelHeader.tsx  ← shared panel header (all workspaces)
│   │   ├── settings/          User / workspace settings
│   │   └── team/              Team management
│   └── marketing/             Public marketing landing page
│
├── components/                Shared, reusable UI components
│   ├── charts/                Recharts wrappers
│   ├── feedback/              Toasts, skeletons, empty states, error states, forms
│   ├── layout/                MainLayout, Sidebar, TopHeader, RightInspectorPanel
│   ├── micro/                 Micro-interaction primitives (CopyButton, ProgressRing…)
│   ├── navigation/            Navigation helpers
│   ├── shared/                WorkspaceLoader, MotionPrimitives, LoadingSkeleton
│   └── ui/                    Design-system atoms (Buttons, Card, Inputs…)
│
├── config/
│   ├── api.config.ts          Runtime API config (reads env vars once at module load)
│   └── env.ts                 Typed + validated environment variable access
│
├── hooks/                     Cross-cutting React hooks
│   ├── useAuthState.ts        Subscribe to auth state changes
│   ├── useFormSecurity.ts     Secure form submission + input sanitization
│   ├── useMicroInteractions.ts Copy-to-clipboard, autosave, resize, shortcuts
│   └── useRealtimeProject.ts  Mock-driven realtime (WebSocket/SSE-ready)
│
├── lib/
│   ├── api/
│   │   ├── client.ts          HTTP client (fetch, retry, CSRF, auth)
│   │   ├── endpoints.ts       All API path constants (single source of truth)
│   │   ├── errors.ts          Typed error hierarchy
│   │   ├── query-keys.ts      TanStack Query key factories
│   │   └── index.ts           Barrel re-export
│   ├── auth/                  Auth utilities
│   ├── constants/             App-wide constants
│   ├── security/
│   │   ├── auth.ts            AuthGuard class, CSRF token reader
│   │   ├── errorSanitization.ts Strip stack traces from user-facing errors
│   │   ├── fileValidation.ts  MIME type + size checks for uploads
│   │   ├── inputValidation.ts URL, email, filename validators
│   │   └── sanitize.ts        Text sanitization (XSS prevention)
│   ├── utils/                 General helpers
│   ├── validators/            Zod schemas
│   ├── LayoutContext.tsx      Three-column layout context provider
│   ├── motion-constants.ts    Shared Framer Motion variants
│   └── performance.ts        Web Vitals / performance utilities
│
├── mocks/                     In-memory mock data (one file per domain)
│
├── services/                  Domain service layer (mock ↔ real switch)
│   ├── auth.service.ts
│   ├── project.service.ts
│   ├── strategy.service.ts
│   ├── virality.service.ts
│   ├── research.service.ts
│   ├── script.service.ts
│   ├── scene.service.ts
│   ├── asset.service.ts
│   ├── review.service.ts
│   ├── distribution.service.ts
│   ├── analytics.service.ts
│   └── index.ts               Barrel re-export
│
└── types/                     Global TypeScript type definitions
    ├── auth.types.ts
    ├── project.types.ts
    ├── analytics.types.ts
    ├── asset.types.ts
    ├── distribution.types.ts
    ├── notification.types.ts
    ├── research.types.ts
    ├── review.types.ts
    ├── script.types.ts
    ├── strategy.types.ts
    ├── user.types.ts
    ├── virality.types.ts
    ├── workspace.types.ts
    ├── common.types.ts
    ├── shell.ts
    └── index.ts
```

---

## 10. Project architecture

### View state machine

`App.tsx` is a simple view state machine — no router library. `useState<AppView>` controls which workspace renders. Each workspace is `React.lazy()`-loaded and code-split by Vite.

```
DEFAULT_VIEW → 'marketing'   (change for development shortcuts)
             ↓
      <LayoutProvider>
        <MainLayout>              3-column shell (sidebar / main / inspector)
          <Suspense fallback={<WorkspaceLoader />}>
            <WorkspacePage />     lazy-loaded chunk
          </Suspense>
        </MainLayout>
      </LayoutProvider>
```

The full view map and navigation flow between workspaces is documented in [ROUTES.md](ROUTES.md).

### Service layer pattern

Every domain has a service (`src/services/*.service.ts`) that exports a single object. Internally it selects between `mockAdapter` and `realAdapter` based on `API_CONFIG.useMock`:

```ts
const adapter = API_CONFIG.useMock ? mockXxx : realXxx;
export const xxxService = { ... adapter methods ... };
```

UI components import from services, never from mocks directly and never from `apiClient` directly.

### Code splitting

Vite's `manualChunks` in [`vite.config.ts`](vite.config.ts) groups output into predictable bundles:

| Chunk | Contents |
|-------|----------|
| `vendor-react` | react, react-dom, scheduler |
| `vendor-motion` | framer-motion, motion |
| `vendor-charts` | recharts, d3-* |
| `vendor-forms` | react-hook-form, @hookform, zod |
| `vendor-icons` | lucide-react |
| `workspace-analytics` | analytics, virality-twin workspaces |
| `workspace-editor` | editor, assets workspaces |
| `workspace-auth` | auth, create-project flows |
| `workspace-project` | strategy, research, script, review, distribution |
| `ui-micro` | micro-interaction components |

### Layout system

[`LayoutContext`](src/lib/LayoutContext.tsx) provides a three-column layout context (left panel, main, right inspector). Workspaces call `useLayout()` to expand/collapse panels without prop drilling.

---

## 11. How to replace mock data

Each service file in `src/services/` has a mock adapter at the top and a real adapter below. To replace the mock data for a domain:

1. **Change the mock constants** in `src/mocks/<domain>.mock.ts` to match your real data shapes.
2. **Or, connect the real backend** by setting `VITE_USE_MOCK_API=false` — the service automatically switches to `realAdapter`.

For gradual migration, you can switch individual services manually:

```ts
// src/services/project.service.ts
// Change this:
const adapter = API_CONFIG.useMock ? mockProjects : realProjects;
// To this (force real for this service only):
const adapter = realProjects;
```

Mock data files follow the type definitions in `src/types/` — ensure your real API responses match those shapes.

---

## 12. How to add a new workspace

1. **Create the page directory:**
   ```
   src/app/dashboard/projects/projectId/<workspace-name>/
     ├── <WorkspaceName>Page.tsx   ← main page component
     ├── components/               ← sub-components
     └── types.ts                  ← workspace-local types (optional)
   ```

2. **Add the view key to `AppView`** in [`src/App.tsx`](src/App.tsx):
   ```ts
   type AppView = ... | 'my-workspace';
   ```

3. **Add a lazy import and render branch** in `App.tsx`:
   ```ts
   const MyWorkspacePage = lazy(() =>
     import('./app/dashboard/projects/projectId/my-workspace/MyWorkspacePage')
       .then(m => ({ default: m.MyWorkspacePage }))
   );
   // ...
   if (view === 'my-workspace') {
     return (
       <LayoutProvider>
         <MainLayout>
           <Suspense fallback={<WorkspaceLoader />}>
             <MyWorkspacePage onBack={() => setView('project-overview')} />
           </Suspense>
         </MainLayout>
       </LayoutProvider>
     );
   }
   ```

4. **Add API endpoints** in [`src/lib/api/endpoints.ts`](src/lib/api/endpoints.ts):
   ```ts
   export const MY_WORKSPACE = {
     list:   (projectId: ID) => `/projects/${projectId}/my-workspace`,
     detail: (projectId: ID, id: ID) => `/projects/${projectId}/my-workspace/${id}`,
   } as const;
   ```

5. **Add a service** in `src/services/my-workspace.service.ts` with a mock adapter and a real adapter. Export it from `src/services/index.ts`.

6. **Add mock data** in `src/mocks/my-workspace.mock.ts` and re-export from `src/mocks/index.ts`.

7. **Add types** in `src/types/my-workspace.types.ts` and re-export from `src/types/index.ts`.

8. **Register query keys** in [`src/lib/api/query-keys.ts`](src/lib/api/query-keys.ts) and re-export from [`src/lib/api/index.ts`](src/lib/api/index.ts).

9. **(Optional) Use `WorkspacePanelHeader`** for any panel header inside the workspace:
   ```tsx
   import { WorkspacePanelHeader } from '../WorkspacePanelHeader';

   <WorkspacePanelHeader
     icon={<MyIcon size={14} />}
     title="My Panel"
     subtitle="Subtitle text"
     color="#A78BFA"
   />
   ```

---

## 13. How to deploy

### Build

```bash
npm run build
# Output: dist/
```

The build output is a static SPA — any static host works (Vercel, Netlify, S3 + CloudFront, Nginx, etc.).

### Nginx (example)

```nginx
server {
  listen 443 ssl;
  server_name app.creativemind.io;

  root /var/www/creativemind/dist;
  index index.html;

  # SPA fallback — all routes serve index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache hashed assets forever
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Security headers (supplement Vite's dev headers)
  add_header X-Frame-Options DENY;
  add_header X-Content-Type-Options nosniff;
  add_header Referrer-Policy strict-origin-when-cross-origin;
}
```

### Required environment for production

```env
VITE_API_BASE_URL=https://api.creativemind.io/api/v1
VITE_USE_MOCK_API=false
VITE_API_TIMEOUT_MS=15000
VITE_API_MAX_RETRIES=3
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_VIRALITY=true
```

> `VITE_API_BASE_URL` must start with `https://` in production — the app throws at startup if it does not (see [`src/config/env.ts`](src/config/env.ts)).

### CI/CD checklist

- [ ] Set all `VITE_*` environment variables in your CI secrets (not as a committed file)
- [ ] Run `npm ci` (not `npm install`) for reproducible installs
- [ ] Run `npm run build` — this runs `tsc -b` then Vite; both must pass
- [ ] Upload `dist/` to your hosting target
- [ ] Confirm the backend is reachable and CORS allows your frontend origin
- [ ] Verify the backend sets the `csrftoken` cookie (non-HttpOnly) and the HttpOnly refresh-token cookie on login
- [ ] Tighten the Content Security Policy in [`vite.config.ts`](vite.config.ts) — replace `unsafe-inline` with nonce-based CSP for production

---

## Security notes

- Access tokens are **memory-only** — page refresh triggers silent re-authentication via the HttpOnly refresh-token cookie.
- AI provider keys (`OPENAI_API_KEY`, etc.) must **never** appear in `.env.example` or any `VITE_*` variable.
- The Content Security Policy in [`vite.config.ts`](vite.config.ts) uses `unsafe-inline` for development convenience. Tighten it with nonces before deploying to production.
- All user-facing error messages are sanitized through [`src/lib/security/errorSanitization.ts`](src/lib/security/errorSanitization.ts) to prevent information leakage.
- File uploads are validated for MIME type and size in [`src/lib/security/fileValidation.ts`](src/lib/security/fileValidation.ts) before upload.
