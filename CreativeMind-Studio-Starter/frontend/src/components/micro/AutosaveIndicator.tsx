/**
 * AutosaveIndicator.tsx
 *
 * Subtle top-right indicator that cycles through:
 *   saving  → "Saving…" with a rotating circle
 *   saved   → "Saved" with a check, fades out after 2.5s
 *   error   → "Save failed" in red
 *   idle    → invisible
 *
 * Respects prefers-reduced-motion.
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { SaveState } from '../../hooks/useMicroInteractions';

// ─── Config per state ─────────────────────────────────────────────────────────

interface StateMeta {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  border: string;
}

function getMeta(state: SaveState, reduced: boolean): StateMeta {
  switch (state) {
    case 'saving':
      return {
        icon: (
          <motion.span
            animate={reduced ? {} : { rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex' }}
          >
            <Loader2 className="w-3 h-3" />
          </motion.span>
        ),
        label: 'Saving…',
        color: '#8B5CF6',
        bg: 'rgba(139,92,246,0.10)',
        border: 'rgba(139,92,246,0.25)',
      };
    case 'saved':
      return {
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: 'Saved',
        color: '#10B981',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.20)',
      };
    case 'error':
      return {
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Save failed',
        color: '#EF4444',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.20)',
      };
    case 'idle':
    default:
      return {
        icon: null,
        label: '',
        color: '',
        bg: '',
        border: '',
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AutosaveIndicatorProps {
  state: SaveState;
  /** If true, renders inline (e.g. inside a toolbar). Default is fixed top-right. */
  inline?: boolean;
  className?: string;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  state,
  inline = false,
  className = '',
}) => {
  const reduced = useReducedMotion() ?? false;
  const meta = getMeta(state, reduced);
  const visible = state !== 'idle';

  const chip = (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={state}
          initial={{ opacity: 0, x: reduced ? 0 : 8, scale: reduced ? 1 : 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: reduced ? 0 : 8, scale: reduced ? 1 : 0.95 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${className}`}
          style={{
            color: meta.color,
            backgroundColor: meta.bg,
            borderColor: meta.border,
          }}
          role="status"
          aria-live="polite"
          aria-label={`Autosave: ${meta.label}`}
        >
          {meta.icon}
          <span>{meta.label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (inline) return chip;

  return (
    <div className="fixed bottom-5 right-5 z-[150] pointer-events-none" aria-live="polite">
      {chip}
    </div>
  );
};
