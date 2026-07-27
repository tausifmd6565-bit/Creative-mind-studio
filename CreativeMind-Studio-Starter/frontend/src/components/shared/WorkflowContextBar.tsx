/**
 * WorkflowContextBar — A slim, sticky sub-header strip used across every
 * project workspace page to surface the 9 workflow signals required for
 * a user to understand where they are in the pipeline at a glance.
 *
 * Signals shown (always):
 *   1. Current stage badge
 *   2. Responsible member avatar + name
 *   3. Completion % progress bar
 *   4. Blocked items count (red, only if > 0)
 *   5. AI activity pulse + agent name (only if active)
 *
 * Signals shown (when provided via optional props):
 *   6. Decision history count
 *   7. Source traceability (verified / total)
 *   8. Scene-to-asset mapping (mapped / total)
 *   9. Approval status (approved / total)
 *
 * Usage:
 *   <WorkflowContextBar
 *     stage="Research Lab"
 *     stageColor="#06B6D4"
 *     responsible={{ name: 'James Park', initials: 'JP', color: '#06B6D4' }}
 *     completion={68}
 *     blockedCount={4}
 *     aiActive
 *     aiAgentName="ResearchOwl"
 *     decisionsLogged={14}
 *     sourcesVerified={12}
 *     sourcesTotal={18}
 *   />
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Link2,
  Film,
  GitBranch,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Responsible {
  name: string;
  initials: string;
  color: string;
}

export interface WorkflowContextBarProps {
  /** Human-readable name of the current workflow stage */
  stage: string;
  /** Accent colour for the stage chip */
  stageColor: string;
  /** Team member responsible for this stage */
  responsible: Responsible;
  /** 0–100 completion percentage for this stage */
  completion: number;
  /** Number of blocked items preventing progression (omit or 0 to hide) */
  blockedCount?: number;
  /** Whether an AI agent is currently active */
  aiActive?: boolean;
  /** Display name of the active AI agent */
  aiAgentName?: string;
  /** Number of AI/human decisions logged for this project */
  decisionsLogged?: number;
  /** Number of sources verified (shows traceability pill) */
  sourcesVerified?: number;
  /** Total sources (required when sourcesVerified is set) */
  sourcesTotal?: number;
  /** Number of scenes that have at least one asset mapped */
  scenesMapped?: number;
  /** Total number of scenes (required when scenesMapped is set) */
  scenesTotal?: number;
  /** Number of approval items already approved */
  approvalsApproved?: number;
  /** Total approval items (required when approvalsApproved is set) */
  approvalsTotal?: number;
  className?: string;
}

// ─── Small pill ───────────────────────────────────────────────────────────────

const Pill: React.FC<{
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'warning' | 'success' | 'danger' | 'ai';
}> = ({ icon, label, variant = 'default' }) => {
  const styles: Record<string, string> = {
    default: 'text-slate-500 bg-white/[0.04] border-white/[0.07]',
    warning: 'text-amber-400 bg-amber-500/08 border-amber-500/20',
    success: 'text-emerald-400 bg-emerald-500/08 border-emerald-500/20',
    danger:  'text-red-400    bg-red-500/08    border-red-500/20',
    ai:      'text-[#9D6CFF] bg-[#7C3AED]/08  border-[#7C3AED]/20',
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono flex-shrink-0 ${styles[variant]}`}>
      <span className="flex-shrink-0">{icon}</span>
      {label}
    </div>
  );
};

// ─── Divider ─────────────────────────────────────────────────────────────────

const Sep: React.FC = () => (
  <div className="h-3 w-px bg-white/[0.07] flex-shrink-0" />
);

// ─── Component ────────────────────────────────────────────────────────────────

export const WorkflowContextBar: React.FC<WorkflowContextBarProps> = React.memo(({
  stage,
  stageColor,
  responsible,
  completion,
  blockedCount = 0,
  aiActive = false,
  aiAgentName,
  decisionsLogged,
  sourcesVerified,
  sourcesTotal,
  scenesMapped,
  scenesTotal,
  approvalsApproved,
  approvalsTotal,
  className = '',
}) => {
  const progressColor =
    completion >= 80 ? '#10B981'
    : completion >= 40 ? stageColor
    : '#EF4444';

  return (
    <div className={`flex items-center gap-3 px-4 sm:px-6 py-2
      border-b border-white/[0.06] bg-[#09090F]/80 backdrop-blur-sm
      overflow-x-auto scrollbar-hide flex-shrink-0 ${className}`}
      role="status"
      aria-label="Workflow context"
    >
      {/* ── 1. Stage chip ── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border flex-shrink-0"
        style={{
          color:            stageColor,
          background:       stageColor + '15',
          borderColor:      stageColor + '30',
        }}
      >
        <span className="text-[10px] font-mono font-semibold">{stage}</span>
      </div>

      <Sep />

      {/* ── 2. Responsible member ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{
            background: responsible.color + '28',
            color:      responsible.color,
          }}
        >
          {responsible.initials}
        </div>
        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
          {responsible.name}
        </span>
      </div>

      <Sep />

      {/* ── 3. Completion % ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-20 h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: progressColor }}
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="text-[10px] font-mono flex-shrink-0" style={{ color: progressColor }}>
          {completion}%
        </span>
      </div>

      {/* ── 4. Blocked count ── */}
      {blockedCount > 0 && (
        <>
          <Sep />
          <Pill
            icon={<AlertTriangle className="w-2.5 h-2.5" />}
            label={`${blockedCount} blocked`}
            variant="danger"
          />
        </>
      )}

      {/* ── 5. AI activity ── */}
      {aiActive && (
        <>
          <Sep />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#9D6CFF]"
            />
            <span className="text-[10px] font-mono text-[#9D6CFF] max-w-[100px] truncate">
              {aiAgentName ?? 'AI Active'}
            </span>
          </div>
        </>
      )}

      {/* ── 6. Decision history ── */}
      {decisionsLogged !== undefined && (
        <>
          <Sep />
          <Pill
            icon={<GitBranch className="w-2.5 h-2.5" />}
            label={`${decisionsLogged} decisions`}
            variant="default"
          />
        </>
      )}

      {/* ── 7. Source traceability ── */}
      {sourcesVerified !== undefined && sourcesTotal !== undefined && (
        <>
          <Sep />
          <Pill
            icon={<Link2 className="w-2.5 h-2.5" />}
            label={`${sourcesVerified}/${sourcesTotal} sources`}
            variant={sourcesVerified === sourcesTotal ? 'success' : sourcesVerified / sourcesTotal < 0.6 ? 'danger' : 'warning'}
          />
        </>
      )}

      {/* ── 8. Scene-to-asset mapping ── */}
      {scenesMapped !== undefined && scenesTotal !== undefined && (
        <>
          <Sep />
          <Pill
            icon={<Film className="w-2.5 h-2.5" />}
            label={`${scenesMapped}/${scenesTotal} scenes mapped`}
            variant={scenesMapped === scenesTotal ? 'success' : 'warning'}
          />
        </>
      )}

      {/* ── 9. Approval status ── */}
      {approvalsApproved !== undefined && approvalsTotal !== undefined && (
        <>
          <Sep />
          <Pill
            icon={<ShieldCheck className="w-2.5 h-2.5" />}
            label={`${approvalsApproved}/${approvalsTotal} approved`}
            variant={
              approvalsApproved === approvalsTotal ? 'success'
              : approvalsApproved === 0 ? 'danger'
              : 'warning'
            }
          />
        </>
      )}

      {/* Spacer so pills don't crowd the right edge on mobile */}
      <div className="flex-shrink-0 w-1" />
    </div>
  );
});
WorkflowContextBar.displayName = 'WorkflowContextBar';
