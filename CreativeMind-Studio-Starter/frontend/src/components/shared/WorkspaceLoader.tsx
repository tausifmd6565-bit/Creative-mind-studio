/**
 * WorkspaceLoader.tsx
 *
 * Route-level loading state shown via React.Suspense while a lazy workspace
 * chunk is being fetched.  Matches the dark shell background and mimics the
 * general three-column or two-column workspace layout with animated skeletons.
 *
 * Used as the fallback for every lazy() import in App.tsx.
 */

import React from 'react';
import { motion } from 'framer-motion';

// ─── Shimmer bar primitive ────────────────────────────────────────────────────

const Shimmer: React.FC<{
  w?: string;
  h?: string;
  className?: string;
}> = ({ w = 'w-full', h = 'h-3', className = '' }) => (
  <div
    className={`${w} ${h} rounded-lg bg-white/[0.05] overflow-hidden relative ${className}`}
    aria-hidden="true"
  >
    <motion.div
      className="absolute inset-0 -translate-x-full"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
      }}
      animate={{ x: ['−100%', '200%'] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div
    className="rounded-2xl border border-white/[0.06] bg-[#10101A]/80 p-4 space-y-3"
    aria-hidden="true"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer w="w-2/3" h="h-3" />
        <Shimmer w="w-1/3" h="h-2.5" />
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <Shimmer key={i} w="w-full" h="h-2.5" />
    ))}
  </div>
);

// ─── Left panel skeleton ──────────────────────────────────────────────────────

const LeftPanelSkeleton: React.FC = () => (
  <div className="w-64 flex-shrink-0 border-r border-white/[0.06] bg-[#0B0B12] p-4 space-y-4 h-full">
    <Shimmer w="w-3/4" h="h-4" />
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-4 h-4 rounded bg-white/[0.05]" />
          <Shimmer w="w-2/3" h="h-2.5" />
        </div>
      ))}
    </div>
    <div className="pt-4 space-y-2">
      {[1, 2, 3].map(i => <SkeletonCard key={i} rows={2} />)}
    </div>
  </div>
);

// ─── Center panel skeleton ────────────────────────────────────────────────────

const CenterPanelSkeleton: React.FC = () => (
  <div className="flex-1 p-6 space-y-4 min-w-0">
    {/* Header bar */}
    <div className="flex items-center justify-between">
      <Shimmer w="w-48" h="h-6" />
      <div className="flex gap-2">
        <Shimmer w="w-24" h="h-8" />
        <Shimmer w="w-24" h="h-8" />
      </div>
    </div>
    {/* KPI row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-[#10101A]/80 p-4 space-y-2">
          <Shimmer w="w-1/2" h="h-2.5" />
          <Shimmer w="w-3/4" h="h-6" />
          <Shimmer w="w-1/3" h="h-2.5" />
        </div>
      ))}
    </div>
    {/* Main cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} rows={4} />)}
    </div>
  </div>
);

// ─── Right panel skeleton ─────────────────────────────────────────────────────

const RightPanelSkeleton: React.FC = () => (
  <div className="w-72 flex-shrink-0 border-l border-white/[0.06] bg-[#0B0B12] p-4 space-y-4 h-full">
    <Shimmer w="w-1/2" h="h-4" />
    {[1, 2, 3].map(i => <SkeletonCard key={i} rows={3} />)}
  </div>
);

// ─── WorkspaceLoader ──────────────────────────────────────────────────────────

interface WorkspaceLoaderProps {
  /** Controls whether left sidebar skeleton is shown (default: true) */
  showLeft?: boolean;
  /** Controls whether right panel skeleton is shown (default: true) */
  showRight?: boolean;
}

export const WorkspaceLoader: React.FC<WorkspaceLoaderProps> = ({
  showLeft = true,
  showRight = true,
}) => (
  <div
    className="flex h-full w-full bg-[#07070A] overflow-hidden"
    role="status"
    aria-label="Loading workspace…"
    aria-busy="true"
  >
    {showLeft && <LeftPanelSkeleton />}
    <CenterPanelSkeleton />
    {showRight && <RightPanelSkeleton />}
  </div>
);

// ─── SimpleLoader — lightweight fallback for leaf-level suspense ──────────────

export const SimpleLoader: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div
    className="flex items-center justify-center w-full h-full min-h-[200px]"
    role="status"
    aria-label={label}
    aria-busy="true"
  >
    <div className="flex flex-col items-center gap-3">
      {/* Animated spinner ring */}
      <motion.div
        className="w-8 h-8 rounded-full border-2 border-white/[0.08] border-t-[#8B5CF6]"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
      <span className="text-[11px] font-mono text-slate-600">{label}</span>
    </div>
  </div>
);
