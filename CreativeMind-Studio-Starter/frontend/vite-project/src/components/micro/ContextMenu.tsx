/**
 * ContextMenu.tsx
 *
 * Right-click context menu with Framer Motion entrance/exit.
 * Supports nested groups, icons, keyboard shortcuts, separators, and danger items.
 *
 * Usage:
 *   const { position, open, close } = useContextMenu();
 *   <div onContextMenu={open}>...</div>
 *   <ContextMenu position={position} onClose={close} items={MENU_ITEMS} />
 *
 * Respects prefers-reduced-motion.
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ContextMenuPosition } from '../../hooks/useMicroInteractions';

// ─── Item types ───────────────────────────────────────────────────────────────

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  danger?: boolean;
  disabled?: boolean;
  separator?: false;
}

export interface ContextMenuSeparator {
  separator: true;
  id: string;
}

export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  onClose: () => void;
  items: ContextMenuEntry[];
}

const MENU_WIDTH = 220;
const ITEM_HEIGHT = 34;

// ─── Component ────────────────────────────────────────────────────────────────

export const ContextMenu: React.FC<ContextMenuProps> = ({ position, onClose, items }) => {
  const reduced = useReducedMotion() ?? false;
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!position) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [position, onClose]);

  if (!position) return null;

  // Clamp position within viewport
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const estimatedHeight = items.length * ITEM_HEIGHT;
  const x = Math.min(position.x, vpW - MENU_WIDTH - 8);
  const y = Math.min(position.y, vpH - estimatedHeight - 8);

  return createPortal(
    <AnimatePresence>
      {position && (
        <>
          {/* Transparent backdrop to capture outside clicks */}
          <div className="fixed inset-0 z-[190]" onClick={onClose} />

          <motion.div
            ref={menuRef}
            role="menu"
            aria-label="Context menu"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.94, y: reduced ? 0 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : -4 }}
            transition={{ duration: reduced ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[191] min-w-[220px] rounded-[14px] border border-white/[0.10]
              bg-[#0F0F1A]/96 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)]
              overflow-hidden py-1.5"
            style={{ left: x, top: y, width: MENU_WIDTH }}
          >
            {items.map((item) => {
              if ('separator' in item && item.separator) {
                return (
                  <div
                    key={item.id}
                    className="my-1 mx-3 h-px bg-white/[0.06]"
                    role="separator"
                    aria-hidden="true"
                  />
                );
              }

              const entry = item as ContextMenuItem;

              return (
                <button
                  key={entry.id}
                  role="menuitem"
                  type="button"
                  disabled={entry.disabled}
                  onClick={() => {
                    if (!entry.disabled) {
                      entry.action?.();
                      onClose();
                    }
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] font-medium
                    transition-colors duration-100 group
                    ${entry.disabled
                      ? 'opacity-40 cursor-not-allowed text-slate-500'
                      : entry.danger
                        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-slate-100'
                    }
                  `}
                >
                  {/* Icon */}
                  {entry.icon && (
                    <span className={`flex-shrink-0 w-4 h-4 flex items-center justify-center
                      ${entry.danger ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {entry.icon}
                    </span>
                  )}

                  {/* Label */}
                  <span className="flex-1">{entry.label}</span>

                  {/* Shortcut */}
                  {entry.shortcut && (
                    <kbd className="ml-auto flex-shrink-0 text-[10px] font-mono text-slate-600
                      bg-white/[0.05] border border-white/[0.07] px-1.5 py-0.5 rounded-[4px]">
                      {entry.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
