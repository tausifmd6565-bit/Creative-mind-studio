/**
 * AgentAvatarPulse.tsx
 *
 * Premium agent avatar with animated pulse ring when the agent is "working".
 * Also exports AgentConnectionLines — an SVG overlay that draws animated
 * bezier curves between agent card positions to visualise data flow.
 *
 * Respects prefers-reduced-motion via Framer Motion's useReducedMotion.
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'done' | 'error' | 'waiting';

export interface AgentAvatarPulseProps {
  /** Brand/accent colour for the agent */
  color: string;
  /** Current working status */
  status: AgentStatus;
  /** Size of the avatar square in px (default 44) */
  size?: number;
  /** Display initials fallback */
  initials?: string;
  className?: string;
}

// ─── Ring sizes relative to avatar size ──────────────────────────────────────

const RING_SCALE_1 = 1.5;
const RING_SCALE_2 = 2.1;

// ─── Pulse rings ─────────────────────────────────────────────────────────────

const PulseRing: React.FC<{
  color: string;
  scale: number;
  delay: number;
  avatarSize: number;
  reduced: boolean;
}> = ({ color, scale, delay, avatarSize, reduced }) => {
  if (reduced) return null;
  return (
    <motion.span
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{ borderRadius: Math.round(avatarSize * 0.27) }}
      initial={{ opacity: 0.35, scale: 1 }}
      animate={{
        opacity: [0.35, 0, 0],
        scale: [1, scale, scale],
      }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
        repeatDelay: 0.2,
      }}
    >
      <span
        className="absolute inset-0 rounded-[inherit] border-2"
        style={{ borderColor: color }}
      />
    </motion.span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const AgentAvatarPulse: React.FC<AgentAvatarPulseProps> = ({
  color,
  status,
  size = 44,
  initials,
  className = '',
}) => {
  const reduced = useReducedMotion() ?? false;
  const isLive = status === 'thinking' || status === 'working';
  const isDone = status === 'done';
  const isError = status === 'error';

  const borderStyle = isLive ? 'dashed' : 'solid';
  const borderOpacity = isLive ? '55' : isError ? '60' : isDone ? '50' : '35';
  const bgAlpha = isLive ? '30' : '18';

  const Icon = status === 'thinking' ? Cpu : status === 'working' ? Zap : Bot;
  const iconSize = Math.round(size * 0.4);

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Pulse rings — only when live */}
      <AnimatePresence>
        {isLive && (
          <>
            <PulseRing
              key="ring1"
              color={color}
              scale={RING_SCALE_1}
              delay={0}
              avatarSize={size}
              reduced={reduced}
            />
            <PulseRing
              key="ring2"
              color={color}
              scale={RING_SCALE_2}
              delay={0.55}
              avatarSize={size}
              reduced={reduced}
            />
          </>
        )}
      </AnimatePresence>

      {/* Avatar body */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center border"
        style={{
          borderRadius: Math.round(size * 0.27),
          background: `linear-gradient(135deg, ${color}${bgAlpha}, ${color}10)`,
          borderColor: `${color}${borderOpacity}`,
          borderStyle,
          color,
        }}
        animate={
          isLive && !reduced
            ? {
                boxShadow: [
                  `0 0 0px ${color}00`,
                  `0 0 ${size * 0.45}px ${color}35`,
                  `0 0 0px ${color}00`,
                ],
              }
            : {}
        }
        transition={isLive ? { duration: 2, repeat: Infinity } : {}}
      >
        {isLive ? (
          <motion.span
            animate={reduced ? {} : { rotate: [0, 15, -15, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'flex' }}
          >
            <Icon size={iconSize} />
          </motion.span>
        ) : (
          <span
            className="font-bold font-mono"
            style={{ fontSize: Math.round(size * 0.27), color }}
          >
            {initials ?? <Bot size={iconSize} />}
          </span>
        )}
      </motion.div>

      {/* Status dot */}
      <StatusDot status={status} color={color} size={size} reduced={reduced} />
    </div>
  );
};

// ─── Status dot ───────────────────────────────────────────────────────────────

const DOT_COLORS: Record<AgentStatus, string> = {
  thinking: '#7C3AED',
  working:  '#10B981',
  waiting:  '#F59E0B',
  done:     '#10B981',
  error:    '#EF4444',
  idle:     '#475569',
};

const StatusDot: React.FC<{
  status: AgentStatus;
  color: string;
  size: number;
  reduced: boolean;
}> = ({ status, size, reduced }) => {
  const dotSize = Math.max(8, Math.round(size * 0.22));
  const dotColor = DOT_COLORS[status];
  const isPulsing = status === 'thinking' || status === 'working';

  return (
    <motion.span
      key={status}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute rounded-full border-2 border-[#0B0B12]"
      style={{
        width: dotSize,
        height: dotSize,
        bottom: -Math.round(dotSize * 0.2),
        right:  -Math.round(dotSize * 0.2),
        backgroundColor: dotColor,
      }}
    >
      {isPulsing && !reduced && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
    </motion.span>
  );
};

// ─── Agent Connection Lines ───────────────────────────────────────────────────

export interface AgentNode {
  id: string;
  color: string;
  x: number; // px, centre of card
  y: number;
}

interface ConnectionLine {
  from: AgentNode;
  to: AgentNode;
  active?: boolean;
}

interface AgentConnectionLinesProps {
  nodes: AgentNode[];
  connections: ConnectionLine[];
  containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * Renders an SVG overlay of animated bezier curves between agent cards.
 * Position the parent container as `position: relative` — the SVG fills it.
 */
export const AgentConnectionLines: React.FC<AgentConnectionLinesProps> = ({
  nodes: _nodes,
  connections,
  containerRef,
}) => {
  const reduced = useReducedMotion() ?? false;
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  if (!dims.w || !dims.h) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={dims.w}
      height={dims.h}
      aria-hidden="true"
    >
      <defs>
        {connections.map((c, i) => (
          <linearGradient
            key={`grad-${i}`}
            id={`conn-grad-${i}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%"   stopColor={c.from.color} stopOpacity={c.active ? 0.7 : 0.25} />
            <stop offset="100%" stopColor={c.to.color}   stopOpacity={c.active ? 0.7 : 0.25} />
          </linearGradient>
        ))}
      </defs>

      {connections.map((c, i) => {
        const mx = (c.from.x + c.to.x) / 2;
        const cpOffset = Math.abs(c.to.y - c.from.y) * 0.4 + 40;
        const d = `M ${c.from.x} ${c.from.y} C ${mx - cpOffset} ${c.from.y}, ${mx + cpOffset} ${c.to.y}, ${c.to.x} ${c.to.y}`;

        return (
          <g key={i}>
            {/* Base path */}
            <path
              d={d}
              fill="none"
              stroke={`url(#conn-grad-${i})`}
              strokeWidth={c.active ? 1.5 : 0.8}
              strokeDasharray={c.active ? undefined : '4 5'}
              opacity={c.active ? 0.6 : 0.2}
            />

            {/* Animated travelling dot */}
            {c.active && !reduced && (
              <motion.circle
                r={3}
                fill={c.from.color}
                filter="blur(1px)"
                initial={{ offsetDistance: '0%' }}
                animate={{ offsetDistance: '100%' }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                style={{
                  offsetPath: `path("${d}")`,
                  opacity: 0.9,
                } as React.CSSProperties}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
