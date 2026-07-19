/**
 * SceneStatusBadge.tsx
 *
 * Animated status badge with entrance / exit transitions.
 * Used in the editor's scene list to show status changes fluidly.
 * A status change triggers a scale+fade pop animation.
 *
 * Respects prefers-reduced-motion.
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Lock,
  Circle,
} from 'lucide-react';

// ─── Status config ────────────────────────────────────────────────────────────

export type SceneEditingStatus =
  | 'approved'
  | 'in-progress'
  | 'review'
  | 'blocked'
  | 'not-started';

interface StatusMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}

const STATUS_META: Record<SceneEditingStatus, StatusMeta> = {
  'approved': {
    label: 'Approved',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  'in-progress': {
    label: 'In Progress',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.25)',
    icon: <Edit3 className="w-3 h-3" />,
  },
  'review': {
    label: 'Review',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
    icon: <Eye className="w-3 h-3" />,
  },
  'blocked': {
    label: 'Blocked',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.25)',
    icon: <Lock className="w-3 h-3" />,
  },
  'not-started': {
    label: 'Not Started',
    color: '#64748B',
    bg: 'rgba(100,116,139,0.08)',
    border: 'rgba(100,116,139,0.18)',
    icon: <Circle className="w-3 h-3" />,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface SceneStatusBadgeProps {
  status: SceneEditingStatus;
  compact?: boolean;
}

export const SceneStatusBadge: React.FC<SceneStatusBadgeProps> = ({
  status,
  compact = false,
}) => {
  const reduced = useReducedMotion() ?? false;
  const meta = STATUS_META[status];

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: reduced ? 1 : 0.75, y: reduced ? 0 : -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.85, y: reduced ? 0 : 4 }}
        transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`inline-flex items-center gap-1 rounded-full border font-mono font-semibold ${
          compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
        }`}
        style={{
          color: meta.color,
          backgroundColor: meta.bg,
          borderColor: meta.border,
        }}
      >
        {meta.icon}
        {!compact && meta.label}
      </motion.span>
    </AnimatePresence>
  );
};

// ─── Transition-aware wrapper ─────────────────────────────────────────────────

/**
 * SceneStatusTransition wraps a scene row/card and adds a brief highlight
 * flash when the status changes (emits a coloured glow for ~600ms).
 */

interface SceneStatusTransitionProps {
  status: SceneEditingStatus;
  children: React.ReactNode;
  className?: string;
}

export const SceneStatusTransition: React.FC<SceneStatusTransitionProps> = ({
  status,
  children,
  className = '',
}) => {
  const reduced = useReducedMotion() ?? false;
  const meta = STATUS_META[status];

  return (
    <motion.div
      key={status}
      className={`relative ${className}`}
      initial={reduced ? undefined : {
        boxShadow: `0 0 0 2px ${meta.color}70, 0 0 12px ${meta.color}30`,
      }}
      animate={reduced ? undefined : {
        boxShadow: [
          `0 0 0 2px ${meta.color}70, 0 0 12px ${meta.color}30`,
          `0 0 0 0px ${meta.color}00, 0 0 0px ${meta.color}00`,
        ],
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
