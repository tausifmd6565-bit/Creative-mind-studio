/**
 * micro/index.ts — barrel export for all micro-interaction components.
 */

export { AgentAvatarPulse } from './AgentAvatarPulse';
export type { AgentAvatarPulseProps, AgentStatus as AvatarAgentStatus } from './AgentAvatarPulse';
export { AgentConnectionLines } from './AgentAvatarPulse';
export type { AgentNode } from './AgentAvatarPulse';

export { ProgressRing, LabeledProgressRing } from './ProgressRing';
export type { ProgressRingProps, LabeledProgressRingProps } from './ProgressRing';

export {
  HoverPreviewTrigger,
  SourcePreviewCard,
  AssetPreviewCard,
} from './HoverPreview';
export type { SourcePreviewData, AssetPreviewData } from './HoverPreview';

export { SceneStatusBadge, SceneStatusTransition } from './SceneStatusBadge';
export type { SceneEditingStatus } from './SceneStatusBadge';

export { DragDropOverlay } from './DragDropOverlay';

export { AutosaveIndicator } from './AutosaveIndicator';

export { CollaboratorCursors } from './CollaboratorCursors';
export type { CollaboratorCursorData } from './CollaboratorCursors';

export { ContextMenu } from './ContextMenu';
export type { ContextMenuEntry, ContextMenuItem, ContextMenuSeparator } from './ContextMenu';

export { KeyboardShortcutsOverlay } from './KeyboardShortcuts';

export { CopyButton, CopyButtonWithLabel } from './CopyButton';

export { ResizableSplitPanel } from './ResizableSplitPanel';
