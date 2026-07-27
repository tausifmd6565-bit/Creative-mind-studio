/**
 * KeyboardShortcuts.tsx
 *
 * Keyboard shortcuts overlay — press "?" anywhere to show/hide.
 * Displays a grouped reference of all registered shortcuts.
 *
 * Respects prefers-reduced-motion.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

// ─── Shortcut data ────────────────────────────────────────────────────────────

interface ShortcutItem {
  keys: string[];
  label: string;
}

interface ShortcutGroup {
  category: string;
  items: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'General',
    items: [
      { keys: ['⌘', 'K'],    label: 'Open Command Palette' },
      { keys: ['?'],          label: 'Show keyboard shortcuts' },
      { keys: ['Esc'],        label: 'Close panel / dismiss' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['⌘', '1'],   label: 'Go to Dashboard' },
      { keys: ['⌘', '2'],   label: 'Open Projects' },
      { keys: ['⌘', '3'],   label: 'Strategy Room' },
      { keys: ['⌘', '4'],   label: 'Research Lab' },
      { keys: ['⌘', '5'],   label: 'Script Room' },
    ],
  },
  {
    category: 'Editor',
    items: [
      { keys: ['⌘', 'S'],   label: 'Save / autosave trigger' },
      { keys: ['⌘', 'Z'],   label: 'Undo' },
      { keys: ['⌘', '⇧', 'Z'], label: 'Redo' },
      { keys: ['⌘', 'D'],   label: 'Duplicate scene' },
      { keys: ['⌫'],         label: 'Delete selected' },
    ],
  },
  {
    category: 'Panels',
    items: [
      { keys: ['⌘', '\\'],  label: 'Toggle right inspector' },
      { keys: ['⌘', '['],   label: 'Collapse sidebar' },
      { keys: ['⌘', ']'],   label: 'Expand sidebar' },
    ],
  },
  {
    category: 'AI Agents',
    items: [
      { keys: ['⌘', 'Enter'], label: 'Start / resume debate' },
      { keys: ['⌘', '.'],     label: 'Pause agent activity' },
      { keys: ['⌘', 'R'],     label: 'Regenerate last output' },
    ],
  },
];

// ─── Kbd chip ─────────────────────────────────────────────────────────────────

const KbdChip: React.FC<{ k: string }> = ({ k }) => (
  <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5
    rounded-[5px] border border-white/[0.12] bg-white/[0.06]
    text-[10px] font-mono text-slate-400 leading-none">
    {k}
  </kbd>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const KeyboardShortcutsOverlay: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  // "?" key to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === '?') toggle();
      if (e.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, close, open]);

  return (
    <>
      {/* Trigger button (bottom-right floating) */}
      <motion.button
        type="button"
        onClick={toggle}
        aria-label="Show keyboard shortcuts"
        aria-keyshortcuts="?"
        whileHover={reduced ? {} : { scale: 1.08 }}
        whileTap={reduced ? {} : { scale: 0.94 }}
        className="fixed bottom-5 left-5 z-[140] w-8 h-8 rounded-full
          flex items-center justify-center
          bg-white/[0.06] border border-white/[0.10]
          text-slate-500 hover:text-slate-200 hover:bg-white/[0.10]
          transition-colors duration-150 shadow-lg"
      >
        <Keyboard className="w-3.5 h-3.5" />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[210] flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={close}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: reduced ? 1 : 0.95, y: reduced ? 0 : 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : 8 }}
              transition={{ duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-2xl bg-[#0F0F1A] border border-white/[0.10]
                rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.7)] overflow-hidden"
            >
              {/* Top accent */}
              <div className="h-[2px] bg-gradient-to-r from-[#7C3AED] via-[#9D6CFF] to-[#4F46E5]" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <Keyboard className="w-4 h-4 text-[#9D6CFF]" />
                  <span className="text-[14px] font-display font-semibold text-slate-100">
                    Keyboard Shortcuts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center
                    text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcut grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 px-6 py-5 max-h-[60vh] overflow-y-auto">
                {SHORTCUT_GROUPS.map((group) => (
                  <div key={group.category} className="mb-5">
                    <p className="text-[10px] font-mono font-semibold tracking-widest uppercase
                      text-slate-600 mb-2">
                      {group.category}
                    </p>
                    <div className="space-y-1.5">
                      {group.items.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-[12px] text-slate-400">{item.label}</span>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {item.keys.map((k, ki) => (
                              <React.Fragment key={ki}>
                                <KbdChip k={k} />
                                {ki < item.keys.length - 1 && (
                                  <span className="text-[9px] text-slate-700 mx-0.5">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.06] px-6 py-3">
                <p className="text-[11px] text-slate-600 font-mono">
                  Press <KbdChip k="?" /> to toggle · <KbdChip k="Esc" /> to close
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
