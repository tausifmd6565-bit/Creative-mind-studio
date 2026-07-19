# API Integration Guide

This document describes how the CreativeMind Studio frontend integrates with its backend API — covering the HTTP client, endpoint catalogue, service layer, error handling, authentication, and the mock / real adapter pattern.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Configuration](#2-configuration)
3. [HTTP client](#3-http-client)
4. [Service layer pattern](#4-service-layer-pattern)
5. [Endpoint catalogue](#5-endpoint-catalogue)
6. [Response envelope](#6-response-envelope)
7. [Error hierarchy](#7-error-hierarchy)
8. [Authentication integration](#8-authentication-integration)
9. [File uploads](#9-file-uploads)
10. [Query keys](#10-query-keys)
11. [Mock adapter protocol](#11-mock-adapter-protocol)
12. [Adding a new endpoint](#12-adding-a-new-endpoint)

---

## 1. Overview

```
Component
  └─► service (src/services/*.service.ts)
        ├─ VITE_USE_MOCK_API=true  → mockAdapter   (in-memory, no network)
        └─ VITE_USE_MOCK_API=false → realAdapter
              └─► apiClient (src/lib/api/client.ts)
                    └─► fetch() → backend REST API
```

**Rules:**
- Components must **never** import `apiClient` directly — always go through a service.
- Components must **never** import from `src/mocks/` directly.
- URL strings must **never** be written outside [`src/lib/api/endpoints.ts`](src/lib/api/endpoints.ts).
- AI provider APIs (OpenAI, Anthropic, etc.) must **never** be called from the frontend. All AI requests go through backend endpoints.

---

## 2. Configuration

All runtime configuration is read once at module load from [`src/config/api.config.ts`](src/config/api.config.ts):

```ts
import { API_CONFIG } from '../config/api.config';

API_CONFIG.baseUrl     // e.g. http://localhost:8000/api/v1
API_CONFIG.useMock     // boolean — from VITE_USE_MOCK_API
API_CONFIG.timeoutMs   // number  — from VITE_API_TIMEOUT_MS
API_CONFIG.maxRetries  // number  — from VITE_API_MAX_RETRIES
```

For validated, typed access to all env vars, use [`src/config/env.ts`](src/config/env.ts):

```ts
import { ENV } from '../config/env';

ENV.api.baseUrl        // required, must be https:// in production
ENV.api.useMock        // boolean
ENV.features.analyticsEnabled  // boolean
```

---

## 3. HTTP client

**File:** [`src/lib/api/client.ts`](src/lib/api/client.ts)

```ts
import { apiClient } from '../lib/api';

// Typed methods — all return the full ApiResponse<T> wrapper
apiClient.get<T>(path, options?)
apiClient.getPaginated<T>(path, options?)
apiClient.post<T>(path, body?, options?)
apiClient.put<T>(path, body?, options?)
apiClient.patch<T>(path, body?, options?)
apiClient.delete<T>(path, options?)
apiClient.upload<T>(path, formData, options?)  // multipart file upload
```

`options` shape:
```ts
{
  signal?:    AbortSignal;            // cancellation
  headers?:   Record<string, string>; // extra headers
  anonymous?: boolean;                // skip Bearer token (login, register)
}
```

### Security features

| Feature | Implementation |
|---------|----------------|
| Bearer token | Memory-only `_accessToken` variable; sent as `Authorization: Bearer …` |
| HTTP-only cookie | `credentials: 'include'` on every request — browser attaches the cookie automatically |
| CSRF | `X-CSRF-Token` injected for POST/PUT/PATCH/DELETE from `csrftoken` cookie |
| `X-Requested-With` | `XMLHttpRequest` — sent on every request |
| Timeout | `AbortSignal.timeout(timeoutMs)` — throws `AbortError` |
| Retry | GET-only, up to `maxRetries` attempts, 500 ms / 1000 ms back-off |
| 401 auto-logout | Calls the registered `on401` handler → `authGuard.clearAuth()` |

---

## 4. Service layer pattern

Each domain service (`src/services/<domain>.service.ts`) follows this pattern:

```ts
// 1. Mock adapter — returns static in-memory data
const mockXxx = {
  async list(): Promise<XxxItem[]> { return MOCK_XXX_ITEMS; },
  async getById(id: string): Promise<XxxItem> { ... },
};

// 2. Real adapter — calls apiClient
const realXxx = {
  async list(): Promise<XxxItem[]> {
    return (await apiClient.get<XxxItem[]>(XXX.list)).data;
  },
  async getById(id: string): Promise<XxxItem> {
    return (await apiClient.get<XxxItem>(XXX.detail(id))).data;
  },
};

// 3. Switch based on VITE_USE_MOCK_API
const adapter = API_CONFIG.useMock ? mockXxx : realXxx;

// 4. Export the service object
export const xxxService = {
  list:     () => adapter.list(),
  getById:  (id: string) => adapter.getById(id),
};
```

### Available services

| Service | File | Domain |
|---------|------|--------|
| `authService` | `auth.service.ts` | Login, register, token refresh, current user |
| `projectService` | `project.service.ts` | Projects, phases, tasks, health, approvals |
| `strategyService` | `strategy.service.ts` | Debate sessions, scorecard, ledger, brief |
| `viralityService` | `virality.service.ts` | Virality analysis, Creator DNA |
| `researchService` | `research.service.ts` | Questions, sources, claims, evidence map |
| `scriptService` | `script.service.ts` | Script blocks, sections, versions, AI rewrite |
| `sceneService` | `scene.service.ts` | Scenes, scene-asset links |
| `assetService` | `asset.service.ts` | Asset library, upload, alternatives, rights |
| `reviewService` | `review.service.ts` | Review queue, approve, reject, annotations |
| `distributionService` | `distribution.service.ts` | Platform variants, schedule, publish |
| `analyticsService` | `analytics.service.ts` | KPIs, retention, audience, recommendations |

> **Note:** Notification and team operations are handled by `analyticsService` / `projectService` depending on the domain. There is no separate `notificationsService` — notification mock data is read directly by `NotificationsWorkspace` via the mock layer. When connecting to a real backend, add a `notifications.service.ts` following the same dual-adapter pattern.

Import all from the barrel:
```ts
import { projectService, analyticsService } from '../services';
```

---

## 5. Endpoint catalogue

**File:** [`src/lib/api/endpoints.ts`](src/lib/api/endpoints.ts)

All paths are relative to `API_CONFIG.baseUrl` (which already includes `/api/v1`).

### Authentication — `AUTH`

| Constant | Path | Method |
|----------|------|--------|
| `AUTH.login` | `POST /auth/login` | Login |
| `AUTH.register` | `POST /auth/register` | Register |
| `AUTH.refresh` | `POST /auth/refresh` | Silent token refresh |
| `AUTH.logout` | `POST /auth/logout` | Logout |
| `AUTH.me` | `GET /auth/me` | Current user |
| `AUTH.forgotPassword` | `POST /auth/forgot-password` | Request password reset |
| `AUTH.resetPassword` | `POST /auth/reset-password` | Submit new password |

### Workspaces — `WORKSPACE`

| Method | Path |
|--------|------|
| `GET` | `/workspaces` |
| `POST` | `/workspaces` |
| `GET` | `/workspaces/:id` |
| `PATCH` | `/workspaces/:id` |
| `GET` | `/workspaces/:id/usage` |
| `GET` | `/workspaces/:id/members` |
| `GET` | `/workspaces/:id/invitations` |
| `POST` | `/workspaces/:id/invite` |
| `GET` | `/workspaces/:id/activity` |

### Projects — `PROJECTS`

| Method | Path |
|--------|------|
| `GET` | `/projects` |
| `POST` | `/projects` |
| `GET` | `/projects/:projectId` |
| `PATCH` | `/projects/:projectId` |
| `DELETE` | `/projects/:projectId` |
| `GET` | `/projects/:projectId/phases` |
| `GET` | `/projects/:projectId/health` |
| `GET` | `/projects/:projectId/overview` |

### Tasks — `TASKS`

| Method | Path |
|--------|------|
| `GET` | `/projects/:projectId/tasks` |
| `POST` | `/projects/:projectId/tasks` |
| `GET` | `/projects/:projectId/tasks/:taskId` |
| `PATCH` | `/projects/:projectId/tasks/:taskId` |
| `DELETE` | `/projects/:projectId/tasks/:taskId` |

### Strategy War Room — `STRATEGY`

| Method | Path |
|--------|------|
| `POST` | `/projects/:projectId/strategy/debate` |
| `GET` | `/projects/:projectId/strategy/debate` |
| `POST` | `/projects/:projectId/strategy/pivot` |
| `GET` | `/projects/:projectId/strategy/scorecard` |
| `GET` | `/projects/:projectId/strategy/ledger` |
| `POST` | `/projects/:projectId/strategy/brief` |

### Virality Twin — `VIRALITY`

| Method | Path |
|--------|------|
| `POST` | `/projects/:projectId/virality-twin/analyse` |
| `GET` | `/projects/:projectId/virality-twin` |
| `GET` | `/creator-dna` |

### Research Lab — `RESEARCH`

| Method | Path |
|--------|------|
| `GET/POST` | `/projects/:projectId/research/questions` |
| `GET/PATCH` | `/projects/:projectId/research/questions/:questionId` |
| `GET/POST` | `/projects/:projectId/sources` |
| `GET/PATCH/DELETE` | `/projects/:projectId/sources/:sourceId` |
| `GET` | `/projects/:projectId/claims` |
| `GET` | `/projects/:projectId/claims/:claimId` |
| `POST` | `/projects/:projectId/claims/:claimId/link-source` |
| `GET` | `/projects/:projectId/research/evidence-map` |
| `GET` | `/projects/:projectId/research/coverage` |
| `GET` | `/projects/:projectId/research/findings` |

### Script & Story Room — `SCRIPTS`

| Method | Path |
|--------|------|
| `GET` | `/projects/:projectId/scripts/current` |
| `POST` | `/projects/:projectId/scripts` |
| `GET/PATCH` | `/projects/:projectId/scripts/:scriptId` |
| `GET` | `/projects/:projectId/scripts/:scriptId/versions` |
| `GET` | `/projects/:projectId/scripts/sections` |
| `GET/PATCH` | `/projects/:projectId/scripts/sections/:sectionId` |
| `GET` | `/projects/:projectId/scripts/blocks` |
| `GET/PATCH` | `/projects/:projectId/scripts/blocks/:blockId` |
| `POST` | `/projects/:projectId/scripts/blocks/:blockId/ai-rewrite` |
| `GET` | `/projects/:projectId/scripts/emotional-curve` |

### Scenes — `SCENES`

| Method | Path |
|--------|------|
| `GET/POST` | `/projects/:projectId/scenes` |
| `GET/PATCH/DELETE` | `/projects/:projectId/scenes/:sceneId` |
| `GET/POST` | `/projects/:projectId/scenes/:sceneId/assets` |
| `DELETE` | `/projects/:projectId/scenes/:sceneId/assets/:assetId` |

### Asset Room — `ASSETS`

| Method | Path |
|--------|------|
| `GET/POST` | `/projects/:projectId/assets` |
| `POST` | `/projects/:projectId/assets/upload` |
| `GET/PATCH/DELETE` | `/projects/:projectId/assets/:assetId` |
| `GET` | `/projects/:projectId/assets/:assetId/alternatives` |
| `GET` | `/projects/:projectId/assets/:assetId/timeline` |
| `POST` | `/projects/:projectId/assets/:assetId/rights-check` |

### Review & Approval — `REVIEWS`

| Method | Path |
|--------|------|
| `GET/POST` | `/projects/:projectId/reviews` |
| `GET/PATCH` | `/projects/:projectId/reviews/:reviewId` |
| `POST` | `/projects/:projectId/reviews/:reviewId/approve` |
| `POST` | `/projects/:projectId/reviews/:reviewId/reject` |
| `GET/POST` | `/projects/:projectId/reviews/:reviewId/annotations` |
| `PATCH` | `/projects/:projectId/reviews/:reviewId/annotations/:annotationId` |
| `POST` | `/projects/:projectId/reviews/:reviewId/annotations/:annotationId/resolve` |

### Distribution Room — `DISTRIBUTION`

| Method | Path |
|--------|------|
| `GET` | `/projects/:projectId/platform-variants` |
| `POST` | `/projects/:projectId/platform-variants/generate` |
| `GET/PATCH` | `/projects/:projectId/platform-variants/:variantId` |
| `POST` | `/projects/:projectId/platform-variants/:variantId/schedule` |
| `POST` | `/projects/:projectId/platform-variants/:variantId/publish` |
| `GET` | `/projects/:projectId/master-content` |

### Analytics & Performance — `ANALYTICS`

| Method | Path |
|--------|------|
| `GET` | `/projects/:projectId/analytics` |
| `POST` | `/projects/:projectId/analytics/import` |
| `GET` | `/projects/:projectId/analytics/retention` |
| `GET` | `/projects/:projectId/analytics/audience` |
| `GET` | `/projects/:projectId/analytics/platforms` |
| `GET` | `/projects/:projectId/analytics/recommendations` |
| `GET` | `/projects/:projectId/analytics/virality-comparison` |
| `GET` | `/projects/:projectId/analytics/learning-log` |
| `GET` | `/creator-dna` |

### Notifications — `NOTIFICATIONS`

| Method | Path |
|--------|------|
| `GET` | `/notifications` |
| `POST` | `/notifications/mark-read` |
| `POST` | `/notifications/mark-all-read` |
| `GET/PATCH` | `/notifications/preferences` |
| `DELETE` | `/notifications/:notificationId` |

### Team — `TEAM`

| Method | Path |
|--------|------|
| `GET` | `/workspaces/:workspaceId/members` |
| `GET/PATCH` | `/workspaces/:workspaceId/members/:memberId` |
| `PATCH` | `/workspaces/:workspaceId/members/:memberId/role` |
| `DELETE` | `/workspaces/:workspaceId/members/:memberId` |
| `GET` | `/workspaces/:workspaceId/invitations` |
| `POST` | `/workspaces/:workspaceId/invite` |
| `DELETE` | `/workspaces/:workspaceId/invitations/:inviteId` |
| `GET` | `/workspaces/:workspaceId/roles` |
| `GET` | `/workspaces/:workspaceId/activity` |

---

## 6. Response envelope

All backend responses must be wrapped in one of these two envelopes.

### Single resource

```ts
interface ApiResponse<T> {
  data:    T;
  success: boolean;
  message: string | null;
  errors:  ApiError[] | null;
}
```

### Paginated list

```ts
interface PaginatedResponse<T> {
  data:       T[];
  success:    boolean;
  message:    string | null;
  errors:     ApiError[] | null;
  pagination: {
    page:       number;
    pageSize:   number;
    totalPages: number;
    totalItems: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}
```

Services unwrap `.data` before returning to callers:
```ts
async getById(id: string): Promise<Project> {
  return (await apiClient.get<Project>(PROJECTS.detail(id))).data;
}
```

---

## 7. Error hierarchy

**File:** [`src/lib/api/errors.ts`](src/lib/api/errors.ts)

```
Error
├── NetworkError           fetch threw (offline, DNS, CORS, timeout)
├── AbortError             request cancelled via AbortController
└── ApiError               base — any non-2xx HTTP response
    ├── AuthError          401 Unauthorized
    ├── ForbiddenError     403 Forbidden
    ├── NotFoundError      404 Not Found
    ├── ValidationError    422 Unprocessable Entity (includes field errors)
    ├── RateLimitError     429 Too Many Requests (includes retryAfter)
    └── ServerError        5xx
```

Use `instanceof` or the exported type guards in catch blocks:

```ts
import { isAuthError, isValidationError, isNetworkError } from '../lib/api';

try {
  await authService.login(payload);
} catch (err) {
  if (isValidationError(err)) {
    // err.details → ApiError[] with field-level messages
  } else if (isNetworkError(err)) {
    // offline or DNS failure
  } else if (isAuthError(err)) {
    // wrong credentials
  }
}
```

### Backend error body format

```json
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}
```

---

## 8. Authentication integration

See the full flow in [README.md § Authentication flow](README.md#8-authentication-flow).

**Access token lifecycle:**

```ts
import { setAccessToken, getAccessToken, register401Handler } from '../lib/api';

// Set on login / refresh:
setAccessToken(response.tokens.accessToken);

// The client reads it automatically on every request.
// Clear on logout:
setAccessToken(null);

// Register the global 401 handler (done by authService.bootstrap):
register401Handler(() => {
  setAccessToken(null);
  navigateToLogin();
});
```

**Headers added automatically by `apiClient`:**

```
Authorization: Bearer <accessToken>          (all authenticated requests)
X-CSRF-Token: <csrftoken cookie value>       (POST, PUT, PATCH, DELETE)
X-Requested-With: XMLHttpRequest             (all requests)
Content-Type: application/json               (JSON body requests)
Accept: application/json                     (all requests)
```

---

## 9. File uploads

Use `apiClient.upload()` — it sends `FormData` without a `Content-Type` header, letting the browser set the multipart boundary automatically:

```ts
const formData = new FormData();
formData.append('file', file);
formData.append('projectId', projectId);

const response = await apiClient.upload<Asset>(
  ASSETS.upload(projectId),
  formData,
);
const asset = response.data;
```

File validation (MIME type + size) is performed in [`src/lib/security/fileValidation.ts`](src/lib/security/fileValidation.ts) **before** upload.

---

## 10. Query keys

**File:** [`src/lib/api/query-keys.ts`](src/lib/api/query-keys.ts)

Pre-defined key factories for consistent TanStack Query cache invalidation. All factories are exported from [`src/lib/api/index.ts`](src/lib/api/index.ts) under the `queryKeys` namespace as well as individual named exports.

```ts
import { queryKeys, projectKeys, analyticsKeys, sceneKeys, notificationKeys } from '../lib/api';

// ['projects', 'list']
projectKeys.lists

// ['projects', 'detail', 'p-123']
projectKeys.detail('p-123')

// ['projects', 'p-123', 'analytics', 'summary', '7d']
analyticsKeys.summary('p-123', '7d')

// ['projects', 'p-123', 'scenes']
sceneKeys.all('p-123')

// ['projects', 'p-123', 'scenes', 's-456', 'assets']
sceneKeys.assets('p-123', 's-456')

// ['notifications', 'list']
notificationKeys.list
```

**All available key groups:**

| Export | Domain |
|--------|--------|
| `authKeys` | Auth session |
| `workspaceKeys` | Workspaces |
| `projectKeys` | Projects, phases, tasks, health |
| `strategyKeys` | Debate, scorecard, ledger, brief |
| `viralityKeys` | Virality snapshots, Creator DNA |
| `researchKeys` | Questions, sources, claims, evidence map |
| `scriptKeys` | Scripts, sections, blocks, emotional curve |
| `sceneKeys` | Scenes, scene assets |
| `assetKeys` | Assets, alternatives, timeline |
| `reviewKeys` | Reviews, annotations |
| `distributionKeys` | Platform variants, master content |
| `analyticsKeys` | KPIs, retention, audience, platforms, recommendations |
| `notificationKeys` | Notifications, preferences |

Access any factory through the convenience namespace:
```ts
queryKeys.projects.detail('p-123')
queryKeys.analytics.summary('p-123', '7d')
```

---

## 11. Mock adapter protocol

When `VITE_USE_MOCK_API=true`, every service returns data from its local mock adapter. The mock adapter must:

1. **Return the same types** as the real adapter — TypeScript enforces this because both share the same interface.
2. **Simulate async** — use `async/await` even for synchronous returns so component code behaves identically.
3. **Ignore payload parameters** (prefix with `_`) to suppress lint warnings.

```ts
const mockAnalytics = {
  async getSummary(_projectId: string): Promise<AnalyticsSummary> {
    return MOCK_ANALYTICS_SNAPSHOT;  // from src/mocks/analytics.mock.ts
  },
};
```

Mock data is defined in `src/mocks/<domain>.mock.ts` using the canonical types from `src/types/`.

---

## 12. Adding a new endpoint

1. **Add the path constant** to [`src/lib/api/endpoints.ts`](src/lib/api/endpoints.ts):
   ```ts
   export const MY_FEATURE = {
     list:   (projectId: ID) => `/projects/${projectId}/my-feature`,
     detail: (projectId: ID, id: ID) => `/projects/${projectId}/my-feature/${id}`,
     create: (projectId: ID) => `/projects/${projectId}/my-feature`,
   } as const;
   ```

2. **Add query keys** to `src/lib/api/query-keys.ts` and export from `src/lib/api/index.ts`.

3. **Add TypeScript types** to `src/types/my-feature.types.ts` and barrel-export from `src/types/index.ts`.

4. **Create the service** `src/services/my-feature.service.ts`:
   ```ts
   import { apiClient } from '../lib/api/client';
   import { MY_FEATURE } from '../lib/api/endpoints';
   import { API_CONFIG } from '../config/api.config';
   import { MOCK_MY_FEATURE_ITEMS } from '../mocks/my-feature.mock';
   import type { MyFeatureItem } from '../types';

   const mockMyFeature = {
     async list(_projectId: string): Promise<MyFeatureItem[]> {
       return MOCK_MY_FEATURE_ITEMS;
     },
   };

   const realMyFeature = {
     async list(projectId: string): Promise<MyFeatureItem[]> {
       return (await apiClient.get<MyFeatureItem[]>(MY_FEATURE.list(projectId))).data;
     },
   };

   const adapter = API_CONFIG.useMock ? mockMyFeature : realMyFeature;

   export const myFeatureService = {
     list: (projectId: string) => adapter.list(projectId),
   };
   ```

5. **Export from** `src/services/index.ts`:
   ```ts
   export { myFeatureService } from './my-feature.service';
   ```

6. **Add mock data** to `src/mocks/my-feature.mock.ts` and barrel-export from `src/mocks/index.ts`.
