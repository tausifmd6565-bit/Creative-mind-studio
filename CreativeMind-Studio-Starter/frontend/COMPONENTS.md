# Component Reference

This document catalogues every shared, reusable component in the `src/components/` directory and the project-scoped shared component in `src/app/`. Feature-specific components (co-located in `src/app/`) are not listed here — they are described in [ROUTES.md](ROUTES.md).

---

## Table of Contents

1. [Design system tokens](#1-design-system-tokens)
2. [UI atoms — `components/ui/`](#2-ui-atoms--componentsui)
3. [Feedback system — `components/feedback/`](#3-feedback-system--componentsfeedback)
4. [Layout shell — `components/layout/`](#4-layout-shell--componentslayout)
5. [Micro-interactions — `components/micro/`](#5-micro-interactions--componentsmicro)
6. [Shared primitives — `components/shared/`](#6-shared-primitives--componentsshared)
7. [Charts — `components/charts/`](#7-charts--componentscharts)
8. [Navigation helpers — `components/navigation/`](#8-navigation-helpers--componentsnavigation)
9. [Project-scoped shared component — `WorkspacePanelHeader`](#9-project-scoped-shared-component--workspacepanelheader)
10. [Global hooks — `src/hooks/`](#10-global-hooks--srchooks)

---

## 1. Design system tokens

Colors, typography, and spacing follow Tailwind CSS 4 utility classes. Custom token names used throughout the codebase:

| Token | Usage |
|-------|-------|
| `bg-[#07070A]` | Application root background |
| `bg-brand-card/30` | Glass card surface |
| `border-white/5` | Subtle card border |
| `text-brand-purple` | Accent purple |
| `shadow-glass` | Glassmorphism box shadow |
| `shadow-glow-purple` | Purple glow shadow |

Shared Framer Motion variants are exported from [`src/lib/motion-constants.ts`](src/lib/motion-constants.ts) for consistent entrance/exit animations.

---

## 2. UI atoms — `components/ui/`

### `Button` — `ui/Buttons.tsx`

General-purpose button with variants, sizes, and loading state.

```tsx
import { Button } from '../components/ui/Buttons';

<Button variant="primary" size="md" isLoading={false}>
  Save
</Button>
<Button variant="secondary" leftIcon={<Plus />}>
  Add item
</Button>
<Button variant="ghost" rightIcon={<ArrowRight />}>
  Continue
</Button>
<Button variant="danger">
  Delete
</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows spinner, disables interaction |
| `leftIcon` | `ReactNode` | — | Icon before label |
| `rightIcon` | `ReactNode` | — | Icon after label |

### `GlassCard` — `ui/Card.tsx`

Glassmorphism card surface. The base container for most workspace panels.

```tsx
import { GlassCard } from '../components/ui/Card';

<GlassCard glow={false} hoverGlow={true}>
  Panel content
</GlassCard>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glow` | `boolean` | `false` | Persistent purple glow border |
| `hoverGlow` | `boolean` | `true` | Lift + glow on hover |

Additional card variants exported from `ui/Card.tsx`:

| Component | Description |
|-----------|-------------|
| `MetricCard` | KPI stat card with trend indicator and delta percentage |
| `AgentCard` | AI agent status card with avatar and pulse animation |
| `AIInsightCard` | AI-generated insight with confidence score |
| `ProjectCard` | Project thumbnail card for the dashboard grid |

### `ui/Inputs.tsx`

Low-level input atoms. For form-integrated inputs with validation, prefer the form primitives in `components/feedback/`.

| Component | Description |
|-----------|-------------|
| `Input` | Styled `<input>` with label and error slot |
| `Textarea` | Styled `<textarea>` |
| `SearchInput` | Input with embedded search icon and clear button |
| `TagInput` | Chip-based multi-value text input |

### `ui/Status.tsx`

Status indicators and badges.

| Component | Description |
|-----------|-------------|
| `StatusBadge` | Coloured pill badge (success / warning / error / info / pending) |
| `ProgressBar` | Linear progress with optional label |
| `AgentStatusDot` | Animated dot: idle / running / complete / error |

### `ui/Navigation.tsx`

Navigation primitives used by the layout shell.

| Component | Description |
|-----------|-------------|
| `NavItem` | Sidebar navigation item with icon, label, and active state |
| `TabBar` | Horizontal tab strip |
| `BreadcrumbItem` | Single breadcrumb segment |

### `ui/Layouts.tsx`

Layout helper components for workspace panels.

| Component | Description |
|-----------|-------------|
| `PageHeader` | Page title + subtitle + action slot |
| `SectionHeader` | Section title + optional action |
| `TwoColumnGrid` | Responsive 2-column grid container |
| `ThreeColumnGrid` | Responsive 3-column grid container |
| `ScrollArea` | Overflow scroll container with styled scrollbar |

### `ui/Feedback.tsx`

Inline feedback states.

| Component | Description |
|-----------|-------------|
| `InlineLoader` | Small spinner for inline loading states |
| `InlineError` | Compact error message row |
| `InlineSuccess` | Compact success confirmation row |

---

## 3. Feedback system — `components/feedback/`

Import anything from the barrel:
```ts
import { useToast, CardSkeleton, EmptyProjects, FormField, useZodForm } from '../components/feedback';
```

### Toast system

| Export | Type | Description |
|--------|------|-------------|
| `ToastProvider` | Component | Context provider — wrap the app root |
| `ToastContainer` | Component | Renders the toast stack (place inside `ToastProvider`) |
| `useToast` | Hook | `{ toast }` — `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`, `toast.warning(msg)` |

Usage:
```tsx
// In root (main.tsx or App.tsx):
<ToastProvider>
  <App />
  <ToastContainer />
</ToastProvider>

// In any component:
const { toast } = useToast();
toast.success('Project saved');
toast.error('Upload failed');
```

### Skeleton loaders

| Component | Description |
|-----------|-------------|
| `Shimmer` | Base shimmer animation wrapper |
| `CardSkeleton` | Card-shaped loading placeholder |
| `TableSkeleton` | Multi-row table loading state |
| `ChartSkeleton` | Chart area loading placeholder |
| `TimelineSkeleton` | Timeline / activity feed loading state |
| `ListSkeleton` | Vertical list loading state |
| `FormSkeleton` | Form fields loading state |
| `KpiSkeleton` | KPI card row loading state |
| `PageSkeleton` | Full-page loading state |
| `Skeleton` | Primitive rectangle skeleton |
| `SkeletonText` | Text-line skeleton |

### Error states

| Component | Props | Description |
|-----------|-------|-------------|
| `ErrorState` | `type`, `title?`, `message?`, `onRetry?` | Generic configurable error |
| `NetworkError` | `onRetry?` | Offline / network failure |
| `ApiError` | `status`, `onRetry?` | HTTP error with status code |
| `UnauthorizedError` | `onLogin?` | 401 — prompts re-login |
| `NotFoundError` | — | 404 empty state |
| `ServerError` | `onRetry?` | 5xx error |
| `OfflineState` | — | No internet connection |
| `PartialDataState` | `message?` | Degraded / partial data warning |

### Empty states

| Component | Description |
|-----------|-------------|
| `EmptyState` | Generic configurable empty state with icon, title, body, and CTA |
| `EmptyProjects` | No projects yet |
| `EmptyAssets` | Empty asset library |
| `EmptyNotifications` | No notifications |
| `EmptyResearch` | No research sources added |
| `EmptyEvidence` | No evidence mapped |
| `EmptyTeam` | No team members |
| `EmptyScripts` | No script blocks |
| `EmptyAnalytics` | No analytics data yet |
| `EmptySearchResults` | Zero search results |

### Form primitives

React Hook Form-compatible controlled inputs with built-in error display:

| Component | Description |
|-----------|-------------|
| `FormRoot` | `<form>` wrapper with submit handler |
| `FormSection` | Labeled group of fields |
| `FormField` | Label + input + error message row |
| `FormError` | Stand-alone error message |
| `FormSuccess` | Stand-alone success message |
| `Input` | Controlled text input |
| `Textarea` | Controlled textarea |
| `SelectField` | Controlled `<select>` |
| `Checkbox` | Controlled checkbox with label |
| `RadioGroup` | Controlled radio button group |

### Advanced form inputs

| Component | Description |
|-----------|-------------|
| `MultiSelect` | Multi-value searchable select |
| `AsyncSelect` | Async-loading option select |
| `FileUpload` | Drag-and-drop + click-to-browse file input |
| `DatePicker` | Date selection input |
| `RichTextField` | Simple rich text editor |

### Form pickers

Domain-aware picker components for assigning users, sources, and assets:

| Component | Description |
|-----------|-------------|
| `UserPicker` | Search and select workspace members |
| `SourcePicker` | Search and select research sources |
| `AssetPicker` | Search and select project assets |

### Zod form schemas + `useZodForm`

Pre-built Zod schemas and the `useZodForm` convenience hook:

```ts
import { useZodForm, projectFormSchema } from '../components/feedback';

const form = useZodForm({ schema: projectFormSchema });
```

| Export | Schema validates |
|--------|-----------------|
| `projectFormSchema` | Project title, type, platform, deadline |
| `researchFormSchema` | Source URL, title, notes |
| `scriptFormSchema` | Script block content and type |
| `inviteMemberSchema` | Email, role |
| `assetUploadSchema` | File, metadata |
| `notificationPrefsSchema` | Notification preferences form |

---

## 4. Layout shell — `components/layout/`

### `MainLayout`

**File:** [`components/layout/MainLayout.tsx`](src/components/layout/MainLayout.tsx)

The outermost application shell. Renders the full 3-column layout:

```
┌──────────────────────────────────────────────────────┐
│  TopHeader (h-14, sticky)                            │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │  Main workspace         │ RightInspector  │
│ (w-16 or │  (flex-1, overflow-y)   │ (optional)      │
│  w-60)   │                         │                 │
└──────────┴─────────────────────────┴─────────────────┘
Mobile: BottomNav replaces Sidebar; Drawer overlay available
```

Also mounts global micro-interaction overlays: `DragDropOverlay`, `CollaboratorCursors`, `KeyboardShortcutsOverlay`.

```tsx
<LayoutProvider>
  <MainLayout inspectorContent={<MyInspector />} inspectorTitle="Details">
    <WorkspacePage />
  </MainLayout>
</LayoutProvider>
```

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Main workspace content |
| `inspectorContent` | `ReactNode` | Right panel content (optional) |
| `inspectorTitle` | `string` | Right panel heading (optional) |

### `TopHeader`

Sticky top bar containing logo, workspace switcher, breadcrumbs, collaborator avatars, command palette trigger, and user menu.

### `Sidebar`

Collapsible left navigation. Collapses to icon-only mode (w-16) or expands to label mode (w-60). Navigation items are defined in the sidebar configuration.

### `RightInspectorPanel`

Sliding right panel. Visible only when `inspectorContent` is provided. Controlled via `LayoutContext`.

### `BreadcrumbNav`

Displays the current location path. Workspace pages pass their breadcrumb chain through `useLayout()`.

### `CollaboratorAvatars`

Horizontal stack of collaborator avatar initials shown in the top header, driven by `useRealtimeProject`.

### `CommandPalette`

Keyboard-accessible command palette. Opened with `Cmd/Ctrl+K`. Command list is populated by the active workspace.

### `MobileDrawer` / `MobileBottomNav`

Mobile-only components. `MobileDrawer` is an overlay sidebar drawer. `MobileBottomNav` is a fixed bottom navigation bar.

### `WorkspaceSwitcher`

Dropdown for switching between workspaces (tenants). Displayed in the top header.

### `UsageMeter`

Compact usage quota indicator shown in the sidebar footer.

---

## 5. Micro-interactions — `components/micro/`

Import anything from the barrel:
```ts
import { CopyButton, ProgressRing, AutosaveIndicator } from '../components/micro';
```

All animations respect the user's `prefers-reduced-motion` preference.

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `AgentAvatarPulse` | Animated AI agent avatar with status ring | `agentId`, `status`, `size` |
| `AgentConnectionLines` | SVG lines connecting agent nodes | `nodes: AgentNode[]` |
| `ProgressRing` | SVG circular progress indicator | `progress`, `size`, `color` |
| `LabeledProgressRing` | `ProgressRing` with centred label | `progress`, `label` |
| `HoverPreviewTrigger` | Hover card trigger wrapper | `content: ReactNode` |
| `SourcePreviewCard` | Hover preview for research sources | `source: SourcePreviewData` |
| `AssetPreviewCard` | Hover preview for assets | `asset: AssetPreviewData` |
| `SceneStatusBadge` | Scene editing status badge | `status: SceneEditingStatus` |
| `SceneStatusTransition` | Animated status transition wrapper | `status` |
| `DragDropOverlay` | Full-screen drag-and-drop overlay | `onDrop` |
| `AutosaveIndicator` | "Saving… / Saved" autosave status | `state: 'idle' \| 'saving' \| 'saved' \| 'error'` |
| `CollaboratorCursors` | Live cursor positions overlay | `cursors: CollaboratorCursorData[]` |
| `ContextMenu` | Right-click context menu | `entries: ContextMenuEntry[]` |
| `KeyboardShortcutsOverlay` | Keyboard shortcut cheatsheet panel | — |
| `CopyButton` | Icon button that copies text to clipboard | `value: string` |
| `CopyButtonWithLabel` | `CopyButton` with visible label | `value`, `label` |
| `ResizableSplitPanel` | Drag-to-resize two-pane layout | `left`, `right`, `defaultSplit` |

### Agent status values (`AvatarAgentStatus`)

```ts
type AgentStatus = 'idle' | 'running' | 'complete' | 'error' | 'waiting';
```

### Scene editing status values

```ts
type SceneEditingStatus = 'draft' | 'in-review' | 'approved' | 'locked' | 'archived';
```

---

## 6. Shared primitives — `components/shared/`

### `WorkspaceLoader`

**File:** [`components/shared/WorkspaceLoader.tsx`](src/components/shared/WorkspaceLoader.tsx)

Three-column skeleton shown as the `Suspense` fallback while a lazy workspace chunk loads.

```tsx
<Suspense fallback={<WorkspaceLoader />}>
  <MyWorkspace />
</Suspense>

// Single-panel workspaces (auth, notifications):
<Suspense fallback={<WorkspaceLoader showLeft={false} showRight={false} />}>
  <AuthRouter />
</Suspense>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLeft` | `boolean` | `true` | Show left panel skeleton |
| `showRight` | `boolean` | `true` | Show right panel skeleton |

### `MotionPrimitives`

Reusable Framer Motion wrapper components:

| Component | Description |
|-----------|-------------|
| `FadeIn` | Opacity + translateY entrance |
| `SlideIn` | Directional slide entrance |
| `ScaleIn` | Scale from 0.95 entrance |
| `StaggerContainer` | Staggered children animations |
| `StaggerItem` | Child of `StaggerContainer` |

### `LoadingSkeleton`

```tsx
import { Skeleton, SkeletonText } from '../components/shared/LoadingSkeleton';

<Skeleton className="h-32 w-full rounded-xl" />
<SkeletonText lines={3} />
```

---

## 8. Navigation helpers — `components/navigation/`

The `src/components/navigation/` directory contains navigation utility components used by the layout shell and workspace pipelines.

These components are consumed internally by `MainLayout`, `TopHeader`, and `Sidebar` — you typically do not import them directly in workspace code. Refer to the individual files for the exported component names.

---

## 9. Project-scoped shared component — `WorkspacePanelHeader`

**File:** [`app/dashboard/projects/projectId/WorkspacePanelHeader.tsx`](src/app/dashboard/projects/projectId/WorkspacePanelHeader.tsx)

A slim panel header bar used across project workspaces. Renders a coloured icon chip, title, optional subtitle, and an optional right-aligned actions slot. Currently used by `ResearchLabPage` and `ScriptRoomPage`.

```tsx
import { WorkspacePanelHeader } from '../WorkspacePanelHeader';

<WorkspacePanelHeader
  icon={<FlaskConical size={14} />}
  title="Research Questions"
  subtitle="3 open · 2 answered"
  color="#A78BFA"
  actions={<button>+ Add</button>}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `ReactNode` | ✓ | Icon element rendered in the coloured chip |
| `title` | `string` | ✓ | Panel heading |
| `subtitle` | `string` | — | Secondary line below the title |
| `color` | `string` | ✓ | Accent hex colour for the icon chip background, border, and icon tint |
| `actions` | `ReactNode` | — | Content rendered at the right edge of the header |

The icon chip uses `${color}20` as background and `${color}30` as border — a 12.5 % / 18.75 % alpha of the accent colour — to keep it subtle against the dark panel surface.

---

## 7. Charts — `components/charts/`

Recharts wrappers with consistent dark-theme styling. Used by the Performance workspace and the Analytics panels.

Common chart components in this directory:

| Component | Chart type |
|-----------|-----------|
| `LineChart` | Time-series line chart |
| `BarChart` | Vertical bar chart |
| `AreaChart` | Filled area chart |
| `PieChart` | Donut / pie chart |
| `RadarChart` | Radar / spider chart |

All charts:
- Use the `vendor-charts` code-split chunk (see [`vite.config.ts`](vite.config.ts))
- Receive typed `data` arrays whose shapes are defined in `src/types/analytics.types.ts`
- Include responsive containers (`<ResponsiveContainer>`) so they fill their parent

---

## 10. Global hooks — `src/hooks/`

### `useAuthState` — [`hooks/useAuthState.ts`](src/hooks/useAuthState.ts)

Subscribe to auth state changes.

```ts
const { status, userId } = useAuthState();
// status: 'unknown' | 'authenticated' | 'unauthenticated'
```

Re-renders whenever auth state changes — after login, logout, or a 401 auto-logout.

### `useFormSecurity` — [`hooks/useFormSecurity.ts`](src/hooks/useFormSecurity.ts)

Wraps form submit handlers with input sanitization, rate-limiting (no double-submit), and structured error extraction.

```ts
import { useFormSecurity, sanitizeFormData } from '../hooks/useFormSecurity';

const { submit, isSubmitting, error, clearError } = useFormSecurity();

const handleSubmit = submit(async (formData) => {
  const safe = sanitizeFormData(formData);
  await authService.login(safe);
});
```

Also exports `sanitizeFormData<T>` — sanitizes all string values in a record using `sanitizeText()` from `lib/security/sanitize`.

### `useMicroInteractions` — [`hooks/useMicroInteractions.ts`](src/hooks/useMicroInteractions.ts)

Collection of micro-interaction hooks:

| Hook | Returns | Description |
|------|---------|-------------|
| `useCopyToClipboard(resetDelay?)` | `{ copy, state }` | Copy text; `state`: `'idle' \| 'copied' \| 'error'` |
| `useAutosave(fn, delay?)` | `{ status, trigger }` | Debounced autosave with status indicator |
| `useResizablePanel(defaultSplit?)` | `{ split, onDrag }` | Drag-to-resize split ratio |
| `useContextMenu()` | `{ position, open, close }` | Right-click position tracking |
| `useKeyboardShortcut(key, handler)` | `void` | Register a single-key global shortcut |

### `useRealtimeProject` — [`hooks/useRealtimeProject.ts`](src/hooks/useRealtimeProject.ts)

Transport-agnostic realtime hook. Currently backed by a mock emission loop. Replace the mock loop with WebSocket, SSE, or Socket.io — the public API stays identical.

```ts
const { state, subscribeToEvent, simulateEvent } = useRealtimeProject(projectId);

// state.connectionStatus: 'connecting' | 'connected' | 'disconnected'
// state.agents:           Record<string, AgentUpdatePayload>
// state.presence:         PresencePayload[]
// state.activity:         ActivityPayload[]

subscribeToEvent('agent:update', (payload) => { ... });
```

Realtime event types: `agent:update`, `presence:update`, `activity`, `comment:new`, `asset:processing`, `research:progress`.
