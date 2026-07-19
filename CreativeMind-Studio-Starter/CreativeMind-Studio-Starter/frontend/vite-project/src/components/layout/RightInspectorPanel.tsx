/**
 * RightInspectorPanel — collapsible & resizable contextual panel.
 *
 * Enhancements:
 *  - Drag handle on the left edge to resize width (200–520px)
 *  - Double-click handle to reset to default width
 *  - Expandable via Framer Motion spring
 *  - Respects prefers-reduced-motion
 *
 * Usage: feature pages set `rightPanelOpen` and render content via the `children` slot.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useLayout } from '../../lib/useLayout';

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const DEFAULT_WIDTH = 320;

interface RightInspectorPanelProps {
  children?: React.ReactNode;
  title?: string;
  width?: number;
}

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  children,
  title = 'Inspector',
  width: _initialWidth = DEFAULT_WIDTH,
}) => {
  const { rightPanelOpen, setRightPanelOpen } = useLayout();
  const reduced = useReducedMotion() ?? false;

  // Resizable state
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startW = useRef(DEFAULT_WIDTH);

  const onHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startX.current = e.clientX;
    startW.current = panelWidth;

    const onMove = (me: MouseEvent) => {
      const delta = startX.current - me.clientX; // moving left = expanding
      const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startW.current + delta));
      setPanelWidth(next);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [panelWidth]);

  const onHandleDoubleClick = useCallback(() => {
    setPanelWidth(DEFAULT_WIDTH);
  }, []);

  // Update body cursor while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isDragging]);

  return (
    <AnimatePresence initial={false}>
      {rightPanelOpen && (
        <motion.aside
          key="inspector"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: panelWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : isDragging
                ? { type: 'tween', duration: 0 } // instant while dragging
                : { type: 'spring', stiffness: 300, damping: 30 }
          }
          className="relative flex-shrink-0 h-full border-l border-white/[0.06] bg-[#0B0B12]
            overflow-hidden flex flex-col"
          aria-label="Inspector panel"
          role="complementary"
          style={{ minWidth: MIN_WIDTH }}
        >
          {/* ── Drag handle (left edge) ── */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[5px] cursor-col-resize z-10 group"
            onMouseDown={onHandleMouseDown}
            onDoubleClick={onHandleDoubleClick}
            title="Drag to resize · Double-click to reset"
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px
              bg-white/[0.05] group-hover:bg-[#8B5CF6]/40 transition-colors duration-150" />
            <motion.div
              animate={{
                scaleY: isDragging ? 1 : 0.5,
                backgroundColor: isDragging ? '#8B5CF6' : 'rgba(255,255,255,0.12)',
              }}
              className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
                w-1 h-12 rounded-full group-hover:bg-[#8B5CF6]/70"
            />
          </div>

          {/* Header */}
          <div className="h-14 flex items-center justify-between px-4 pl-5
            border-b border-white/[0.06] flex-shrink-0">
            <span className="text-[13px] font-semibold text-slate-200 truncate">{title}</span>
            <div className="flex items-center gap-1">
              {/* Expand/collapse toggle */}
              <button
                type="button"
                onClick={() => setPanelWidth(panelWidth === MAX_WIDTH ? DEFAULT_WIDTH : MAX_WIDTH)}
                aria-label={panelWidth === MAX_WIDTH ? 'Collapse panel' : 'Expand panel'}
                className="w-7 h-7 flex items-center justify-center rounded-[8px]
                  text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]
                  transition-colors duration-150"
              >
                {panelWidth >= MAX_WIDTH - 20
                  ? <PanelRightClose className="w-3.5 h-3.5" />
                  : <PanelRightOpen className="w-3.5 h-3.5" />
                }
              </button>
              <button
                type="button"
                onClick={() => setRightPanelOpen(false)}
                aria-label="Close inspector panel"
                className="w-7 h-7 flex items-center justify-center rounded-[8px]
                  text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]
                  transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4" style={{ width: panelWidth }}>
            {children ?? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-10 h-10 rounded-[12px] bg-white/[0.04] border border-white/[0.07]
                  flex items-center justify-center mb-3">
                  <X className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-[13px] text-slate-600">Nothing to inspect</p>
                <p className="text-[11px] text-slate-700 mt-1">
                  Select an element to inspect its properties.
                </p>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
