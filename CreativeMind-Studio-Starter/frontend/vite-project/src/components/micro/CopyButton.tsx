/**
 * CopyButton.tsx
 *
 * A copy-to-clipboard button with animated feedback:
 *   idle    → copy icon
 *   copied  → ✓ check + "Copied!" label in green, scale pop
 *   error   → ✗ icon in red
 *
 * Respects prefers-reduced-motion.
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Copy, Check, X } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useMicroInteractions';

// ─── Icon states ──────────────────────────────────────────────────────────────

const STATE_ICONS = {
  idle:   { icon: Copy,  color: 'text-slate-500 hover:text-slate-200', bg: '' },
  copied: { icon: Check, color: 'text-emerald-400',                    bg: 'bg-emerald-500/10' },
  error:  { icon: X,     color: 'text-red-400',                        bg: 'bg-red-500/10' },
};

// ─── CopyButton (icon-only) ───────────────────────────────────────────────────

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Optional additional className */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  size = 'md',
  className = '',
  ariaLabel = 'Copy to clipboard',
}) => {
  const { copy, state } = useCopyToClipboard(2000);
  const reduced = useReducedMotion() ?? false;
  const cfg = STATE_ICONS[state];
  const Icon = cfg.icon;
  const iconSize = size === 'sm' ? 12 : 14;
  const btnSize = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';

  return (
    <motion.button
      type="button"
      onClick={() => copy(text)}
      aria-label={ariaLabel}
      whileTap={reduced ? {} : { scale: 0.88 }}
      className={`relative inline-flex items-center justify-center rounded-[7px]
        border border-transparent transition-colors duration-150
        ${btnSize} ${cfg.color} ${cfg.bg}
        hover:bg-white/[0.06] hover:border-white/[0.08]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]
        ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, scale: reduced ? 1 : 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.6 }}
          transition={{ duration: reduced ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex' }}
        >
          <Icon size={iconSize} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

// ─── CopyButtonWithLabel (icon + text) ───────────────────────────────────────

interface CopyButtonWithLabelProps extends CopyButtonProps {
  /** Label shown in idle state */
  label?: string;
  /** Variant styling */
  variant?: 'ghost' | 'outline';
}

export const CopyButtonWithLabel: React.FC<CopyButtonWithLabelProps> = ({
  text,
  label = 'Copy',
  variant = 'ghost',
  className = '',
  ariaLabel,
}) => {
  const { copy, state } = useCopyToClipboard(2000);
  const reduced = useReducedMotion() ?? false;

  const isCopied = state === 'copied';
  const isError  = state === 'error';

  const baseClass = variant === 'outline'
    ? 'border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08]'
    : 'hover:bg-white/[0.05]';

  return (
    <motion.button
      type="button"
      onClick={() => copy(text)}
      aria-label={ariaLabel ?? label}
      whileTap={reduced ? {} : { scale: 0.95 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[11px]
        font-mono transition-colors duration-150 ${baseClass}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]
        ${isError ? 'text-red-400' : isCopied ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-200'}
        ${className}`}
    >
      <AnimatePresence mode="wait">
        {isCopied ? (
          <motion.span
            key="check"
            initial={{ scale: reduced ? 1 : 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduced ? 1 : 0.5, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
            style={{ display: 'flex' }}
          >
            <Check className="w-3 h-3" />
          </motion.span>
        ) : isError ? (
          <motion.span key="x" style={{ display: 'flex' }}>
            <X className="w-3 h-3" />
          </motion.span>
        ) : (
          <motion.span key="copy" style={{ display: 'flex' }}>
            <Copy className="w-3 h-3" />
          </motion.span>
        )}
      </AnimatePresence>

      <span>{isCopied ? 'Copied!' : isError ? 'Failed' : label}</span>
    </motion.button>
  );
};
