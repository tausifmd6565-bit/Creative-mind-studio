/**
 * ProgressRing.tsx
 *
 * Animated SVG radial progress ring with an optional animated counter inside.
 * Used in score cards, agent dashboards, and KPI widgets.
 *
 * Respects prefers-reduced-motion.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Animated count-up hook ───────────────────────────────────────────────────

function useCountUp(target: number, duration = 900, delay = 0, disabled = false) {
  const [val, setVal] = useState(disabled ? target : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) { setVal(target); return; }
    let started = false;
    const startAnimation = () => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const eased = 1 - Math.pow(1 - progress, 4);
        setVal(Math.round(eased * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const timer = setTimeout(startAnimation, delay);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay, disabled]);

  return val;
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────

export interface ProgressRingProps {
  /** Score 0-100 */
  value: number;
  /** Ring diameter in px */
  size?: number;
  /** Ring track stroke width in px */
  strokeWidth?: number;
  /** Ring fill colour */
  color?: string;
  /** Track colour */
  trackColor?: string;
  /** Stagger delay in ms */
  delay?: number;
  /** Content shown in the centre (defaults to numeric value) */
  centerContent?: React.ReactNode;
  /** Show animated number */
  showValue?: boolean;
  /** Value suffix (e.g. '%') */
  suffix?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 52,
  strokeWidth = 4,
  color = '#8B5CF6',
  trackColor = 'rgba(255,255,255,0.06)',
  delay = 0,
  centerContent,
  showValue = true,
  suffix = '',
  className = '',
}) => {
  const reduced = useReducedMotion() ?? false;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const displayVal = useCountUp(
    value,
    900,
    reduced ? 0 : delay,
    reduced
  );

  const dashOffset = reduced
    ? circumference - (value / 100) * circumference
    : undefined; // driven by motion.circle animate

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            reduced
              ? dashOffset
              : circumference
          }
          animate={{
            strokeDashoffset: circumference - (value / 100) * circumference,
          }}
          transition={{
            duration: reduced ? 0 : 0.9,
            delay: reduced ? 0 : delay / 1000,
            ease: EASE,
          }}
        />
      </svg>

      {/* Centre content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {centerContent ?? (
          showValue && (
            <span
              className="font-display font-bold tabular-nums leading-none"
              style={{
                fontSize: Math.round(size * 0.26),
                color,
              }}
            >
              {displayVal}{suffix}
            </span>
          )
        )}
      </div>
    </div>
  );
};

// ─── Convenience: progress ring with label below ──────────────────────────────

export interface LabeledProgressRingProps extends ProgressRingProps {
  label: string;
  sublabel?: string;
}

export const LabeledProgressRing: React.FC<LabeledProgressRingProps> = ({
  label,
  sublabel,
  ...ringProps
}) => (
  <div className="flex flex-col items-center gap-2">
    <ProgressRing {...ringProps} />
    <div className="text-center">
      <p className="text-[12px] font-semibold text-slate-200 leading-tight">{label}</p>
      {sublabel && (
        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{sublabel}</p>
      )}
    </div>
  </div>
);
