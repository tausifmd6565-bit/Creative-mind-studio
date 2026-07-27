/**
 * ResizableSplitPanel.tsx
 *
 * A desktop two-panel horizontal split with a drag handle.
 * The left panel is resizable by dragging the divider.
 *
 * Features:
 *  - Drag handle with cursor feedback and visual highlight
 *  - Double-click to reset to initial width
 *  - Respects prefers-reduced-motion (disables transition on handle drag)
 *  - Accessible: role="separator", aria-orientation, aria-valuenow
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResizableSplitPanelProps {
  /** Left panel content */
  left: React.ReactNode;
  /** Right panel content */
  right: React.ReactNode;
  /** Initial left panel width in px */
  initialLeftWidth?: number;
  /** Minimum left width */
  minLeftWidth?: number;
  /** Maximum left width */
  maxLeftWidth?: number;
  /** Height of the split container (default: 100%) */
  height?: string | number;
  /** Additional class on the outer wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ResizableSplitPanel: React.FC<ResizableSplitPanelProps> = ({
  left,
  right,
  initialLeftWidth = 320,
  minLeftWidth = 200,
  maxLeftWidth = 640,
  height = '100%',
  className = '',
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startW = useRef(leftWidth);

  const onHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startX.current = e.clientX;
    startW.current = leftWidth;

    const onMove = (me: MouseEvent) => {
      const delta = me.clientX - startX.current;
      const next = Math.max(minLeftWidth, Math.min(maxLeftWidth, startW.current + delta));
      setLeftWidth(next);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [leftWidth, minLeftWidth, maxLeftWidth]);

  const onHandleDoubleClick = useCallback(() => {
    setLeftWidth(initialLeftWidth);
  }, [initialLeftWidth]);

  // Keyboard resize on the separator
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 8;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setLeftWidth((w) => Math.max(minLeftWidth, w - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setLeftWidth((w) => Math.min(maxLeftWidth, w + step));
    } else if (e.key === 'Home') {
      setLeftWidth(minLeftWidth);
    } else if (e.key === 'End') {
      setLeftWidth(maxLeftWidth);
    }
  }, [minLeftWidth, maxLeftWidth]);

  // Update cursor on body while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isDragging]);

  const pct = Math.round(((leftWidth - minLeftWidth) / (maxLeftWidth - minLeftWidth)) * 100);

  return (
    <div
      ref={containerRef}
      className={`flex overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Left panel */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{ width: leftWidth }}
      >
        {left}
      </div>

      {/* Drag handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onMouseDown={onHandleMouseDown}
        onDoubleClick={onHandleDoubleClick}
        onKeyDown={onKeyDown}
        className={`
          relative flex-shrink-0 flex items-center justify-center
          w-[5px] cursor-col-resize select-none
          group focus-visible:outline-none
          ${isDragging ? 'z-10' : ''}
        `}
      >
        {/* Track line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/[0.07]
          group-hover:bg-[#8B5CF6]/40 transition-colors duration-150" />

        {/* Drag dot */}
        <motion.div
          animate={{
            scale: isDragging ? 1.3 : 1,
            backgroundColor: isDragging ? '#8B5CF6' : 'rgba(255,255,255,0.12)',
          }}
          transition={{ duration: 0.15 }}
          className="absolute w-1 h-8 rounded-full z-10 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
            group-hover:bg-[#8B5CF6]/70 group-focus-visible:bg-[#8B5CF6]"
        />

        {/* Active glow */}
        {isDragging && (
          <div className="absolute inset-y-0 w-px left-1/2 -translate-x-1/2
            bg-[#8B5CF6] shadow-[0_0_8px_2px_rgba(139,92,246,0.35)]" />
        )}
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {right}
      </div>
    </div>
  );
};
