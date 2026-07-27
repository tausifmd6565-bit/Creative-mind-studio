/**
 * CollaboratorCursors.tsx
 *
 * Mock live collaborator cursor overlay.  Each cursor is a small coloured
 * arrow with the collaborator's name label that moves across the screen.
 * In production this would be driven by WebSocket presence data.
 *
 * Respects prefers-reduced-motion (cursors are hidden when reduced).
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollaboratorCursorData {
  id: string;
  name: string;
  color: string;
  x: number; // 0-100 (percent of viewport width)
  y: number; // 0-100 (percent of viewport height)
  activeSection?: string;
}

// ─── SVG cursor arrow ─────────────────────────────────────────────────────────

const CursorArrow: React.FC<{ color: string; size?: number }> = ({ color, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M2 2L9 16L11 10L16 9L2 2Z"
      fill={color}
      stroke="rgba(0,0,0,0.35)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Single cursor ────────────────────────────────────────────────────────────

const CollaboratorCursor: React.FC<{ cursor: CollaboratorCursorData; reduced: boolean }> = ({
  cursor,
  reduced,
}) => (
  <motion.div
    key={cursor.id}
    className="fixed pointer-events-none z-[180]"
    style={{
      left: `${cursor.x}vw`,
      top: `${cursor.y}vh`,
    }}
    animate={
      reduced
        ? {}
        : {
            left: `${cursor.x}vw`,
            top: `${cursor.y}vh`,
          }
    }
    transition={{
      type: 'spring',
      stiffness: 180,
      damping: 22,
      mass: 0.4,
    }}
  >
    <CursorArrow color={cursor.color} />
    {/* Name label */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      className="mt-0.5 ml-3 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-semibold
        text-white whitespace-nowrap select-none"
      style={{ backgroundColor: cursor.color }}
    >
      {cursor.name}
    </motion.div>
  </motion.div>
);

// ─── Mock data generator ──────────────────────────────────────────────────────

const MOCK_USERS: Array<Omit<CollaboratorCursorData, 'x' | 'y'>> = [
  { id: 'u1', name: 'Alex R.',  color: '#7C3AED', activeSection: 'editor' },
  { id: 'u2', name: 'Jordan K.', color: '#10B981', activeSection: 'research' },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function randomTarget(min: number, max: number) {
  return min + Math.random() * (max - min);
}

interface CursorState extends CollaboratorCursorData {
  targetX: number;
  targetY: number;
}

function buildInitial(): CursorState[] {
  return MOCK_USERS.map((u) => ({
    ...u,
    x: randomTarget(10, 80),
    y: randomTarget(15, 75),
    targetX: randomTarget(10, 80),
    targetY: randomTarget(15, 75),
  }));
}

// ─── Main component ───────────────────────────────────────────────────────────

export const CollaboratorCursors: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  // Don't render anything if reduced motion is on
  if (reduced) return null;

  return <CursorCanvas />;
};

const CursorCanvas: React.FC = () => {
  const reduced = false; // already gated above
  const [cursors, setCursors] = useState<CursorState[]>(buildInitial);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Smoothly wander cursors around
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCursors((prev) =>
        prev.map((c) => {
          const arrivedX = Math.abs(c.x - c.targetX) < 1.5;
          const arrivedY = Math.abs(c.y - c.targetY) < 1.5;
          const newTarget = arrivedX && arrivedY;

          return {
            ...c,
            x: parseFloat(lerp(c.x, c.targetX, 0.06).toFixed(2)),
            y: parseFloat(lerp(c.y, c.targetY, 0.06).toFixed(2)),
            targetX: newTarget ? randomTarget(15, 75) : c.targetX,
            targetY: newTarget ? randomTarget(15, 70) : c.targetY,
          };
        })
      );
    }, 80);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <AnimatePresence>
      {cursors.map((c) => (
        <CollaboratorCursor key={c.id} cursor={c} reduced={reduced} />
      ))}
    </AnimatePresence>
  );
};
