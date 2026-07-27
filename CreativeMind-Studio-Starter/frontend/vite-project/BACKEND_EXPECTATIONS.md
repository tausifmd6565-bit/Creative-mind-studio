# Backend Expectations

This document is the **complete contract** the backend must satisfy for the CreativeMind Studio frontend to work correctly. It covers authentication, response shapes, CORS, cookies, CSRF, error formats, realtime, and every domain endpoint.

Read this alongside [API_INTEGRATION.md](API_INTEGRATION.md) (which documents the frontend side of the same contract).

---

## Quick-start checklist

The minimum set of things a backend must get right for the frontend to connect successfully. Check each item before testing end-to-end.

**Transport & CORS**
- [ ] All routes are under `/api/v1` — this prefix must be included in `VITE_API_BASE_URL`
- [ ] CORS allows the frontend origin exactly (not `*`) with `Access-Control-Allow-Credentials: true`
- [ ] `OPTIONS` preflight requests return `200` with the required CORS headers
- [ ] `Access-Control-Expose-Headers` includes `Retry-After`

**Cookies & tokens**
- [ ] `POST /auth/login` returns `tokens.accessToken` in the JSON body **and** sets an HTTP-only `refresh_token` cookie (`SameSite=Strict; Secure; Path=/auth/refresh`)
- [ ] `POST /auth/refresh` rotates the refresh token (new cookie) and returns the new `accessToken` in the JSON body
- [ ] A non-HttpOnly `csrftoken` cookie is set on the first request so the client can read it for `X-CSRF-Token` injection
- [ ] `POST /auth/logout` clears the HTTP-only cookie and returns `204`

**Response shape**
- [ ] Every non-`204` success response is wrapped in `{ data, success, message, errors }` (see [§5](#5-response-envelope))
- [ ] Every error response includes `{ message, code, errors[] }` (see [§6](#6-error-response-format))
- [ ] `DELETE` and action endpoints with no body return `204 No Content`
- [ ] All IDs are strings (UUID recommended)
- [ ] All timestamps are ISO 8601 strings

**Security**
- [ ] `X-CSRF-Token` header is validated on `POST`, `PUT`, `PATCH`, `DELETE` requests
- [ ] Security headers listed in [§25](#25-security-headers) are set on every response

---

## Table of Contents

1. [General conventions](#1-general-conventions)
2. [CORS](#2-cors)
3. [Authentication & session management](#3-authentication--session-management)
4. [CSRF protection](#4-csrf-protection)
5. [Response envelope](#5-response-envelope)
6. [Error response format](#6-error-response-format)
7. [Pagination](#7-pagination)
8. [Authentication endpoints](#8-authentication-endpoints)
9. [Workspace endpoints](#9-workspace-endpoints)
10. [Project endpoints](#10-project-endpoints)
11. [Strategy War Room endpoints](#11-strategy-war-room-endpoints)
12. [Virality Twin endpoints](#12-virality-twin-endpoints)
13. [Research Lab endpoints](#13-research-lab-endpoints)
14. [Script & Story Room endpoints](#14-script--story-room-endpoints)
15. [Scene endpoints](#15-scene-endpoints)
16. [Asset Room endpoints](#16-asset-room-endpoints)
17. [Review & Approval endpoints](#17-review--approval-endpoints)
18. [Distribution Room endpoints](#18-distribution-room-endpoints)
19. [Analytics & Performance endpoints](#19-analytics--performance-endpoints)
20. [Notification endpoints](#20-notification-endpoints)
21. [Team & member endpoints](#21-team--member-endpoints)
22. [File uploads](#22-file-uploads)
23. [Realtime / WebSocket (optional)](#23-realtime--websocket-optional)
24. [AI proxy requirements](#24-ai-proxy-requirements)
25. [Security headers](#25-security-headers)
26. [Rate limiting](#26-rate-limiting)

---

## 1. General conventions

- **Base path:** all routes are prefixed with `/api/v1`. The frontend `VITE_API_BASE_URL` already includes this prefix — do not add it again in response `Location` headers.
- **Content type:** all request and response bodies are `application/json` unless otherwise noted (file uploads use `multipart/form-data`).
- **IDs:** all entity IDs are strings (UUID v4 recommended). The frontend types define `ID = string`.
- **Timestamps:** ISO 8601 strings (`2024-06-14T09:00:00Z`). The frontend type alias is `Timestamp = string`.
- **Nullable fields:** use `null` rather than omitting fields — the frontend TypeScript types use `T | null` and expect the key to be present.
- **HTTP methods:** use the semantically correct method. `PATCH` for partial updates; `PUT` for full replacement.
- **204 No Content:** return `204` for successful `DELETE` and any action that produces no body. The client handles this correctly and returns `undefined`.

---

## 2. CORS

The backend must allow the frontend origin with credentials:

```
Access-Control-Allow-Origin: https://app.creativemind.io   (exact origin — not *)
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-Requested-With
Access-Control-Expose-Headers: Retry-After
```

- **`Access-Control-Allow-Origin` must be an exact origin**, not a wildcard, because the client sends `credentials: 'include'`.
- Include a `Retry-After` header on `429` responses and expose it so the client can read it.
- Respond to `OPTIONS` preflight requests with `200` and the CORS headers above.

---

## 3. Authentication & session management

The frontend uses a **dual-token pattern**:

### Access token

- Issued as a JSON body field (`tokens.accessToken`) on login and refresh.
- Short-lived (recommended: 15 minutes).
- The frontend stores it **in memory only** — never in `localStorage` or cookies.
- Every authenticated request includes `Authorization: Bearer <accessToken>`.

### Refresh token

- Issued as an **HTTP-only, Secure, SameSite=Strict cookie** via `Set-Cookie` response header.
- Long-lived (recommended: 30 days).
- The frontend **never reads this cookie** — the browser attaches it automatically on refresh requests.
- Must be invalidated on logout and on refresh rotation.

### Token lifecycle

```
POST /auth/login
  ← 200 { data: { tokens: { accessToken, refreshToken, expiresAt, tokenType }, userId } }
  ← Set-Cookie: refresh_token=<value>; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=2592000

POST /auth/refresh   (browser sends the HttpOnly cookie automatically)
  ← 200 { data: { accessToken, refreshToken, expiresAt, tokenType } }
  ← Set-Cookie: refresh_token=<new-value>; ...  (rotation)

POST /auth/logout
  ← 204
  ← Set-Cookie: refresh_token=; Max-Age=0  (clear the cookie)
```

### On 401

Whenever the backend returns `401`, the frontend:
1. Clears the in-memory access token.
2. Calls the registered `on401` handler → redirects the user to login.

Do not return `401` for expired access tokens without first allowing the client to attempt a silent refresh (the client does not automatically retry on 401 — the app simply redirects to login).

---

## 4. CSRF protection

For all state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`), the frontend sends:
```
X-CSRF-Token: <value>
```

The value is read from a **non-HttpOnly** cookie named `csrftoken`. The backend must:

1. Set the `csrftoken` cookie on the login response (or on the first HTML request if server-rendered):
   ```
   Set-Cookie: csrftoken=<random-token>; Secure; SameSite=Strict; Path=/
   # NOT HttpOnly — the frontend JavaScript reads this cookie
   ```
2. Validate the `X-CSRF-Token` header value against the `csrftoken` cookie on every mutating request.
3. Return `403` if the tokens do not match.

---

## 5. Response envelope

**Every** successful response body must be wrapped in this envelope:

```ts
// Single resource
{
  "data":    <T>,
  "success": true,
  "message": null,       // or a human-readable string
  "errors":  null
}

// No-content actions: return HTTP 204 with no body.
```

The frontend service layer does `.data` to unwrap the payload before returning it to components.

---

## 6. Error response format

All error responses must use this JSON body:

```json
{
  "message": "Human-readable error description",
  "code":    "MACHINE_READABLE_CODE",
  "errors": [
    { "field": "email",    "message": "Invalid email format" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}
```

- `message` — required. Used as the user-facing error text.
- `code` — optional. Machine-readable enum (e.g. `VALIDATION_ERROR`, `RESOURCE_NOT_FOUND`).
- `errors` — optional array of field-level errors. Only present on `422`.

### HTTP status → error class mapping (frontend)

| HTTP status | Frontend error class | Meaning |
|-------------|----------------------|---------|
| `400` | `ApiError` | Bad request |
| `401` | `AuthError` | Unauthenticated |
| `403` | `ForbiddenError` | Insufficient permissions |
| `404` | `NotFoundError` | Resource not found |
| `422` | `ValidationError` | Validation failed (include `errors` array) |
| `429` | `RateLimitError` | Rate limited (include `Retry-After` header) |
| `5xx` | `ServerError` | Backend error |

---

## 7. Pagination

Paginated list endpoints must use this response envelope:

```ts
{
  "data": [...],
  "success": true,
  "message": null,
  "errors":  null,
  "pagination": {
    "page":       1,       // current page (1-based)
    "pageSize":   20,      // items per page
    "totalPages": 4,
    "totalItems": 72,
    "hasNext":    true,
    "hasPrev":    false
  }
}
```

Pagination query parameters sent by the frontend:
- `page` — 1-based page number (default: 1)
- `pageSize` — items per page (default: 20)

---

## 8. Authentication endpoints

### `POST /auth/login`

**Request:**
```json
{ "email": "nour@example.com", "password": "hunter2", "remember": true }
```

**Response 200:**
```json
{
  "data": {
    "tokens": {
      "accessToken":  "<JWT>",
      "refreshToken": "<opaque>",
      "expiresAt":    "2024-06-14T10:00:00Z",
      "tokenType":    "Bearer"
    },
    "userId": "u-123"
  },
  "success": true,
  "message": null,
  "errors":  null
}
```

Set-Cookie: `refresh_token` (HttpOnly), `csrftoken` (non-HttpOnly).

---

### `POST /auth/register`

**Request:**
```json
{
  "name":          "Nour Saleh",
  "email":         "nour@example.com",
  "password":      "S3cur3Pa$$",
  "workspaceName": "Nour's Studio",
  "inviteCode":    "INV-ABC"  // optional
}
```

**Response 200:** Same shape as `/auth/login`.

---

### `POST /auth/refresh`

No request body. The browser sends the HttpOnly refresh-token cookie automatically.

**Response 200:**
```json
{
  "data": {
    "accessToken":  "<new-JWT>",
    "refreshToken": "<rotated>",
    "expiresAt":    "2024-06-14T10:15:00Z",
    "tokenType":    "Bearer"
  },
  "success": true,
  "message": null,
  "errors":  null
}
```

**Response 401:** Refresh token invalid / expired → clear the HttpOnly cookie.

---

### `POST /auth/logout`

No request body. Clears the HttpOnly cookie.
**Response 204.**

---

### `GET /auth/me`

Requires `Authorization: Bearer <token>`.

**Response 200:**
```json
{
  "data": {
    "id":             "u-123",
    "name":           "Nour Saleh",
    "email":          "nour@example.com",
    "avatarInitials": "NS",
    "avatarColor":    "#8B5CF6",
    "timezone":       "Asia/Riyadh",
    "locale":         "en",
    "isVerified":     true,
    "isActive":       true,
    "createdAt":      "2024-01-12T09:00:00Z",
    "updatedAt":      "2024-06-14T09:00:00Z"
  },
  "success": true,
  "message": null,
  "errors":  null
}
```

---

### `POST /auth/forgot-password`

**Request:** `{ "email": "nour@example.com" }`
**Response 200:** `{ "data": null, "success": true, "message": "Reset email sent", "errors": null }`

---

### `POST /auth/reset-password`

**Request:** `{ "token": "<reset-token>", "password": "NewP4$$word" }`
**Response 200:** `{ "data": null, "success": true, "message": null, "errors": null }`

---

## 9. Workspace endpoints

### `GET /workspaces` → `PaginatedResponse<WorkspaceSummary>`
### `POST /workspaces` → `ApiResponse<Workspace>`
### `GET /workspaces/:id` → `ApiResponse<Workspace>`
### `PATCH /workspaces/:id` → `ApiResponse<Workspace>`
### `GET /workspaces/:id/usage` → `ApiResponse<WorkspaceUsage>`
### `GET /workspaces/:id/members` → `PaginatedResponse<WorkspaceMember>`
### `GET /workspaces/:id/invitations` → `PaginatedResponse<WorkspaceInvitation>`
### `POST /workspaces/:id/invite` → `ApiResponse<WorkspaceInvitation>`
### `GET /workspaces/:id/activity` → `PaginatedResponse<ActivityEntry>`

---

## 10. Project endpoints

### `GET /projects` → `PaginatedResponse<ProjectCard>`

`ProjectCard` shape (summary for dashboard grid):
```json
{
  "id":                "p-123",
  "workspaceId":       "w-abc",
  "title":             "Brand Refresh Campaign",
  "status":            "in-progress",
  "contentType":       "video",
  "primaryPlatform":   "youtube",
  "color":             "#8B5CF6",
  "thumbnailGradient": "from-violet-600 to-purple-900",
  "overallProgress":   62,
  "activePhaseId":     "research",
  "deadline":          "2024-07-15T00:00:00Z",
  "ownerRef":          { "id": "u-1", "name": "Nour Saleh", "initials": "NS", "color": "#8B5CF6", "isAi": false },
  "updatedAt":         "2024-06-14T09:00:00Z"
}
```

### `POST /projects` → `ApiResponse<Project>`
### `GET /projects/:id` → `ApiResponse<Project>`
### `PATCH /projects/:id` → `ApiResponse<Project>`
### `DELETE /projects/:id` → `204`
### `GET /projects/:id/phases` → `ApiResponse<ProjectPhase[]>`
### `GET /projects/:id/health` → `ApiResponse<HealthMetric[]>`
### `GET /projects/:id/overview` → `ApiResponse<ProjectOverview>`
### `GET /projects/:id/tasks` → `ApiResponse<Task[]>`
### `POST /projects/:id/tasks` → `ApiResponse<Task>`
### `GET /projects/:id/tasks/:taskId` → `ApiResponse<Task>`
### `PATCH /projects/:id/tasks/:taskId` → `ApiResponse<Task>`
### `DELETE /projects/:id/tasks/:taskId` → `204`

---

## 11. Strategy War Room endpoints

### `POST /projects/:id/strategy/debate`

Starts or continues a multi-agent debate session. The backend orchestrates AI agents.

**Request:** `{ "brief": "Content strategy brief text" }`
**Response 200:** `ApiResponse<DebateSession>`

`DebateSession` includes: `sessionId`, `status`, `agents[]`, `messages[]`, `consensusLevel`.

### `GET /projects/:id/strategy/debate` → `ApiResponse<DebateSession>`
### `POST /projects/:id/strategy/pivot` → `ApiResponse<DebateSession>`

**Request:** `{ "direction": "pivot rationale text" }`

### `GET /projects/:id/strategy/scorecard` → `ApiResponse<Scorecard[]>`
### `GET /projects/:id/strategy/ledger` → `ApiResponse<DecisionLedger>`
### `POST /projects/:id/strategy/brief` → `ApiResponse<StrategyBrief>`

---

## 12. Virality Twin endpoints

### `POST /projects/:id/virality-twin/analyse`

Triggers AI-driven virality analysis against historical successful content.

**Request:** `{ "conceptDescription": "...", "targetPlatforms": ["youtube", "tiktok"] }`
**Response 200:** `ApiResponse<ViralitySnapshot>`

`ViralitySnapshot` includes: `overallScore`, `confidenceLevel`, `comparisonMetrics`, `retentionCurve`, `radarData`, `insights[]`.

### `GET /projects/:id/virality-twin` → `ApiResponse<ViralitySnapshot>`
### `GET /creator-dna` → `ApiResponse<CreatorDna>`

`CreatorDna` includes the workspace's historical performance fingerprint.

---

## 13. Research Lab endpoints

### `GET /projects/:id/research/questions` → `ApiResponse<ResearchQuestion[]>`
### `POST /projects/:id/research/questions` → `ApiResponse<ResearchQuestion>`
### `GET /projects/:id/research/questions/:qId` → `ApiResponse<ResearchQuestion>`
### `PATCH /projects/:id/research/questions/:qId` → `ApiResponse<ResearchQuestion>`

### `GET /projects/:id/sources` → `PaginatedResponse<Source>`
### `POST /projects/:id/sources` → `ApiResponse<Source>`
### `GET /projects/:id/sources/:sourceId` → `ApiResponse<Source>`
### `PATCH /projects/:id/sources/:sourceId` → `ApiResponse<Source>`
### `DELETE /projects/:id/sources/:sourceId` → `204`

### `GET /projects/:id/claims` → `ApiResponse<Claim[]>`
### `GET /projects/:id/claims/:claimId` → `ApiResponse<Claim>`
### `POST /projects/:id/claims/:claimId/link-source` → `ApiResponse<Claim>`

**Request:** `{ "sourceId": "src-456", "evidence": "Relevant quote" }`

### `GET /projects/:id/research/evidence-map` → `ApiResponse<EvidenceMap>`
### `GET /projects/:id/research/coverage` → `ApiResponse<ResearchCoverage>`
### `GET /projects/:id/research/findings` → `ApiResponse<ResearchFindings>`

---

## 14. Script & Story Room endpoints

### `GET /projects/:id/scripts/current` → `ApiResponse<Script>`
### `POST /projects/:id/scripts` → `ApiResponse<Script>`
### `GET /projects/:id/scripts/:scriptId` → `ApiResponse<Script>`
### `PATCH /projects/:id/scripts/:scriptId` → `ApiResponse<Script>`
### `GET /projects/:id/scripts/:scriptId/versions` → `ApiResponse<ScriptVersion[]>`

### `GET /projects/:id/scripts/sections` → `ApiResponse<ScriptSection[]>`
### `PATCH /projects/:id/scripts/sections/:sectionId` → `ApiResponse<ScriptSection>`

### `GET /projects/:id/scripts/blocks` → `ApiResponse<ScriptBlock[]>`
### `PATCH /projects/:id/scripts/blocks/:blockId` → `ApiResponse<ScriptBlock>`

### `POST /projects/:id/scripts/blocks/:blockId/ai-rewrite`

AI-assisted block rewrite. The backend proxies the request to the AI provider.

**Request:** `{ "instruction": "Make it more punchy", "tone": "energetic" }`
**Response 200:** `ApiResponse<{ rewrittenText: string, alternatives: string[] }>`

### `GET /projects/:id/scripts/emotional-curve` → `ApiResponse<EmotionalCurvePoint[]>`

Returns the emotional intensity curve across the script's segments.

---

## 15. Scene endpoints

### `GET /projects/:id/scenes` → `ApiResponse<Scene[]>`
### `POST /projects/:id/scenes` → `ApiResponse<Scene>`
### `GET /projects/:id/scenes/:sceneId` → `ApiResponse<Scene>`
### `PATCH /projects/:id/scenes/:sceneId` → `ApiResponse<Scene>`
### `DELETE /projects/:id/scenes/:sceneId` → `204`
### `GET /projects/:id/scenes/:sceneId/assets` → `ApiResponse<Asset[]>`
### `POST /projects/:id/scenes/:sceneId/assets` → `ApiResponse<Asset>` (link asset)

**Request:** `{ "assetId": "ast-789", "order": 2 }`

### `DELETE /projects/:id/scenes/:sceneId/assets/:assetId` → `204`

---

## 16. Asset Room endpoints

### `GET /projects/:id/assets` → `PaginatedResponse<Asset>`

Query parameters: `type`, `status`, `search`, `page`, `pageSize`.

### `POST /projects/:id/assets` → `ApiResponse<Asset>` (create metadata record)
### `POST /projects/:id/assets/upload` → `ApiResponse<Asset>` (multipart upload — see §22)
### `GET /projects/:id/assets/:assetId` → `ApiResponse<Asset>`
### `PATCH /projects/:id/assets/:assetId` → `ApiResponse<Asset>`
### `DELETE /projects/:id/assets/:assetId` → `204`
### `GET /projects/:id/assets/:assetId/alternatives` → `ApiResponse<Asset[]>`
### `GET /projects/:id/assets/:assetId/timeline` → `ApiResponse<AssetTimelineEntry[]>`
### `POST /projects/:id/assets/:assetId/rights-check` → `ApiResponse<RightsCheckResult>`

---

## 17. Review & Approval endpoints

### `GET /projects/:id/reviews` → `PaginatedResponse<ReviewItem>`
### `POST /projects/:id/reviews` → `ApiResponse<ReviewItem>`
### `GET /projects/:id/reviews/:reviewId` → `ApiResponse<ReviewItem>`
### `PATCH /projects/:id/reviews/:reviewId` → `ApiResponse<ReviewItem>`
### `POST /projects/:id/reviews/:reviewId/approve` → `ApiResponse<ReviewItem>`

**Request:** `{ "comment": "Looks great!" }` (optional)

### `POST /projects/:id/reviews/:reviewId/reject` → `ApiResponse<ReviewItem>`

**Request:** `{ "reason": "Needs colour correction" }`

### `GET /projects/:id/reviews/:reviewId/annotations` → `ApiResponse<ReviewAnnotation[]>`
### `POST /projects/:id/reviews/:reviewId/annotations` → `ApiResponse<ReviewAnnotation>`
### `PATCH /projects/:id/reviews/:reviewId/annotations/:annotationId` → `ApiResponse<ReviewAnnotation>`
### `POST /projects/:id/reviews/:reviewId/annotations/:annotationId/resolve` → `ApiResponse<ReviewAnnotation>`

---

## 18. Distribution Room endpoints

### `GET /projects/:id/platform-variants` → `ApiResponse<PlatformVariant[]>`
### `POST /projects/:id/platform-variants/generate`

Triggers AI-assisted platform adaptation generation.

**Request:** `{ "platforms": ["youtube", "tiktok", "instagram"], "masterContentId": "mc-1" }`
**Response 200:** `ApiResponse<PlatformVariant[]>`

### `GET /projects/:id/platform-variants/:variantId` → `ApiResponse<PlatformVariant>`
### `PATCH /projects/:id/platform-variants/:variantId` → `ApiResponse<PlatformVariant>`
### `POST /projects/:id/platform-variants/:variantId/schedule`

**Request:** `{ "scheduledAt": "2024-07-01T14:00:00Z" }`
**Response 200:** `ApiResponse<PlatformVariant>`

### `POST /projects/:id/platform-variants/:variantId/publish` → `ApiResponse<PlatformVariant>`
### `GET /projects/:id/master-content` → `ApiResponse<MasterContent>`

---

## 19. Analytics & Performance endpoints

### `GET /projects/:id/analytics` → `ApiResponse<AnalyticsSummary>`

Summary object includes: `kpiMetrics[]`, `snapshotDate`, `platforms[]`.

### `POST /projects/:id/analytics/import`

Import metrics from connected platforms.

**Request:** `{ "platform": "youtube", "dateRange": { "from": "2024-01-01", "to": "2024-06-30" } }`
**Response 200:** `ApiResponse<AnalyticsSummary>`

### `GET /projects/:id/analytics/retention` → `ApiResponse<RetentionDataPoint[]>`
### `GET /projects/:id/analytics/audience` → `ApiResponse<AudienceInsights>`
### `GET /projects/:id/analytics/platforms` → `ApiResponse<PlatformAnalytics[]>`
### `GET /projects/:id/analytics/recommendations` → `ApiResponse<AIRecommendation[]>`
### `GET /projects/:id/analytics/virality-comparison` → `ApiResponse<ViralityComparison>`
### `GET /projects/:id/analytics/learning-log` → `ApiResponse<AILearningEntry[]>`
### `GET /creator-dna` → `ApiResponse<CreatorDna>`

---

## 20. Notification endpoints

### `GET /notifications` → `PaginatedResponse<Notification>`

Query parameters: `type`, `unreadOnly`, `page`, `pageSize`.

**Notification shape:**
```json
{
  "id":          "notif-1",
  "type":        "agent_update",
  "title":       "Strategy Agent completed",
  "body":        "Your strategy brief is ready to review.",
  "isRead":      false,
  "createdAt":   "2024-06-14T09:00:00Z",
  "projectId":   "p-123",
  "projectName": "Brand Refresh Campaign",
  "actionUrl":   "/projects/p-123/strategy"
}
```

### `POST /notifications/mark-read`

**Request:** `{ "ids": ["notif-1", "notif-2"] }`
**Response 200:** `ApiResponse<null>`

### `POST /notifications/mark-all-read` → `ApiResponse<null>`
### `GET /notifications/preferences` → `ApiResponse<NotificationPreferences>`
### `PATCH /notifications/preferences` → `ApiResponse<NotificationPreferences>`
### `DELETE /notifications/:id` → `204`

---

## 21. Team & member endpoints

### `GET /workspaces/:id/members` → `PaginatedResponse<WorkspaceMember>`
### `GET /workspaces/:id/members/:memberId` → `ApiResponse<WorkspaceMember>`
### `PATCH /workspaces/:id/members/:memberId` → `ApiResponse<WorkspaceMember>`
### `PATCH /workspaces/:id/members/:memberId/role`

**Request:** `{ "role": "editor" }`
**Response 200:** `ApiResponse<WorkspaceMember>`

### `DELETE /workspaces/:id/members/:memberId` → `204`
### `GET /workspaces/:id/invitations` → `PaginatedResponse<WorkspaceInvitation>`
### `POST /workspaces/:id/invite`

**Request:** `{ "email": "colleague@example.com", "role": "reviewer" }`
**Response 200:** `ApiResponse<WorkspaceInvitation>`

### `DELETE /workspaces/:id/invitations/:inviteId` → `204`
### `GET /workspaces/:id/roles` → `ApiResponse<WorkspaceRole[]>`
### `GET /workspaces/:id/activity` → `PaginatedResponse<ActivityEntry>`

---

## 22. File uploads

Endpoint: `POST /projects/:id/assets/upload`

Content type: `multipart/form-data`

Expected form fields:

| Field | Type | Description |
|-------|------|-------------|
| `file` | `File` | The binary file |
| `projectId` | `string` | Target project (also in path) |
| `type` | `string` | `video \| image \| audio \| document \| other` |
| `name` | `string` | Display name (optional — defaults to filename) |

Response: `ApiResponse<Asset>` with the created asset record including a `url` field pointing to the uploaded file.

The frontend validates MIME type and file size **before** upload using `src/lib/security/fileValidation.ts`. The backend should also validate on receipt.

**Recommended limits** (align with `fileValidation.ts` defaults):
- Max file size: 500 MB
- Allowed MIME types: `video/*`, `image/*`, `audio/*`, `application/pdf`, `text/*`

---

## 23. Realtime / WebSocket (optional)

The frontend's [`useRealtimeProject`](src/hooks/useRealtimeProject.ts) hook is transport-agnostic. It currently uses a mock emission loop. To connect it to a real backend, replace the mock loop with a WebSocket, SSE, or Socket.io connection.

### Recommended WebSocket URL

```
wss://api.creativemind.io/api/v1/ws/projects/:projectId
```

### Event types the frontend subscribes to

| Event | Payload shape |
|-------|--------------|
| `agent:update` | `{ agentId, agentName, status, progress, message? }` |
| `presence:update` | `{ userId, userName, activeSection }` |
| `activity` | `{ actorName, action, target, timestamp }` |
| `comment:new` | `{ commentId, authorName, body, targetId }` |
| `asset:processing` | `{ assetId, stage, progress, status }` |
| `research:progress` | `{ questionId, sourcesFound, claimsExtracted, progress }` |

---

## 24. AI proxy requirements

The frontend **never calls AI providers (OpenAI, Anthropic, etc.) directly**. All AI features are implemented as backend endpoints that proxy the AI call server-side.

AI-powered endpoints in this contract:

| Endpoint | AI feature |
|----------|-----------|
| `POST /projects/:id/strategy/debate` | Multi-agent strategy debate |
| `POST /projects/:id/virality-twin/analyse` | Virality prediction |
| `POST /projects/:id/scripts/blocks/:id/ai-rewrite` | Script block rewrite |
| `POST /projects/:id/platform-variants/generate` | Platform adaptation |
| `GET /projects/:id/analytics/recommendations` | AI recommendations |
| `GET /projects/:id/research/findings` | Research synthesis |

**Requirements:**

- AI provider keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.) must be stored as server-side environment variables only — never in the browser bundle.
- The backend must implement rate limiting and abuse prevention for AI endpoints.
- AI responses must be validated and sanitized before returning to the frontend.
- Long-running AI operations should return a job ID immediately and push updates via WebSocket.

---

## 25. Security headers

The backend should set these headers on all responses (the frontend Vite dev server already sets equivalents for development):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

For production, implement a nonce-based Content Security Policy (CSP) to replace the `unsafe-inline` used in development.

---

## 26. Rate limiting

- Apply rate limiting to all endpoints, especially auth and AI endpoints.
- Return `429 Too Many Requests` when the limit is exceeded.
- Include the `Retry-After` header (seconds) on `429` responses — the frontend's `RateLimitError` reads this field.
- Expose `Retry-After` via `Access-Control-Expose-Headers` so the browser allows the frontend to read it.

Recommended limits:
- Auth endpoints (`/auth/login`, `/auth/register`): 10 requests per minute per IP
- AI endpoints: 20 requests per minute per user
- General API: 300 requests per minute per user
