/**
 * HoverPreview.tsx
 *
 * Floating preview card that appears above (or below) the trigger on hover.
 * Used for research source hover previews and asset hover previews.
 *
 * Sub-components:
 *   <SourceHoverPreview>  — shows publisher, quotation snippet, confidence
 *   <AssetHoverPreview>   — shows thumbnail gradient, type, title, rights risk
 *   <HoverPreviewPortal>  — generic wrapper using a floating strategy
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BarChart2, Calendar, ExternalLink, BookOpen, ShieldCheck, ShieldAlert, ShieldOff, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SourcePreviewData {
  title: string;
  publisher: string;
  date: string;
  type: string;
  typeColor: string;
  quotation: string;
  confidenceScore: number;
  freshnessScore: number;
  url?: string;
}

export interface AssetPreviewData {
  title: string;
  thumbnailGradient: string;
  thumbnailIcon?: string;
  type: string;
  source: string;
  rightsRisk: 'low' | 'medium' | 'high' | 'blocked';
  durationLabel?: string;
  resolution?: string;
}

// ─── Floating popup logic ─────────────────────────────────────────────────────

interface FloatingCardProps {
  children: React.ReactNode;
  anchorRect: DOMRect;
  reduced: boolean;
}

const PREVIEW_WIDTH = 280;
const PREVIEW_MARGIN = 8;

const FloatingCard: React.FC<FloatingCardProps> = ({ children, anchorRect, reduced }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, placement: 'top' as 'top' | 'bottom' });

  useEffect(() => {
    const vpH = window.innerHeight;
    const vpW = window.innerWidth;
    const spaceBelow = vpH - anchorRect.bottom;
    const placement = spaceBelow < 180 ? 'top' : 'bottom';
    const top = placement === 'bottom'
      ? anchorRect.bottom + PREVIEW_MARGIN + window.scrollY
      : anchorRect.top - PREVIEW_MARGIN + window.scrollY;
    const rawLeft = anchorRect.left + anchorRect.width / 2 - PREVIEW_WIDTH / 2;
    const left = Math.max(PREVIEW_MARGIN, Math.min(vpW - PREVIEW_WIDTH - PREVIEW_MARGIN, rawLeft));
    setPos({ top, left, placement });
  }, [anchorRect]);

  const yInitial = pos.placement === 'bottom' ? -6 : 6;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : yInitial, scale: reduced ? 1 : 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduced ? 0 : yInitial * 0.5, scale: reduced ? 1 : 0.98 }}
      transition={{ duration: reduced ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="fixed z-[200] pointer-events-none"
      style={{
        top: pos.placement === 'top' ? pos.top - 180 : pos.top,
        left: pos.left,
        width: PREVIEW_WIDTH,
      }}
      // allow scrolling inside without closing immediately
    >
      <div
        className="rounded-2xl border border-white/[0.10] bg-[#0F0F1A]/95 backdrop-blur-xl
          shadow-[0_16px_40px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        {children}
      </div>
    </motion.div>,
    document.body
  );
};

// ─── Generic HoverPreviewTrigger ─────────────────────────────────────────────

interface HoverPreviewTriggerProps {
  children: React.ReactNode;
  preview: React.ReactNode;
  /** Delay before showing (ms) */
  delay?: number;
  className?: string;
}

export const HoverPreviewTrigger: React.FC<HoverPreviewTriggerProps> = ({
  children,
  preview,
  delay = 350,
  className = '',
}) => {
  const reduced = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
      setVisible(true);
    }, delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 80);
  }, []);

  useEffect(() => () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && rect && (
          <FloatingCard anchorRect={rect} reduced={reduced}>
            {preview}
          </FloatingCard>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Score mini-bar ───────────────────────────────────────────────────────────

const MiniBar: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({
  label, value, color, icon,
}) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-1 text-[9px] font-mono text-slate-600">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <span className="text-[9px] font-mono font-semibold" style={{ color }}>{value}</span>
    </div>
    <div className="h-0.5 rounded-full bg-white/[0.05]">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

// ─── Source hover preview content ─────────────────────────────────────────────

export const SourcePreviewCard: React.FC<{ data: SourcePreviewData }> = ({ data }) => (
  <div className="p-3.5 space-y-3">
    {/* Header */}
    <div className="flex items-start gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: data.typeColor + '20', color: data.typeColor }}
      >
        <BookOpen className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-200 leading-tight line-clamp-2">
          {data.title}
        </p>
        <p className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">{data.publisher}</p>
      </div>
    </div>

    {/* Meta row */}
    <div className="flex items-center gap-3 text-[9px] font-mono text-slate-600">
      <span
        className="px-1.5 py-0.5 rounded-full border"
        style={{ color: data.typeColor, backgroundColor: data.typeColor + '15', borderColor: data.typeColor + '30' }}
      >
        {data.type}
      </span>
      <div className="flex items-center gap-1">
        <Calendar className="w-2.5 h-2.5" />
        {data.date}
      </div>
    </div>

    {/* Quotation snippet */}
    <p className="text-[10px] text-slate-400 leading-relaxed italic line-clamp-2 border-l-2 pl-2"
      style={{ borderColor: data.typeColor + '50' }}>
      "{data.quotation}"
    </p>

    {/* Scores */}
    <div className="space-y-1.5">
      <MiniBar label="Confidence" value={data.confidenceScore} color="#8B5CF6"
        icon={<BarChart2 className="w-2.5 h-2.5" />} />
      <MiniBar label="Freshness" value={data.freshnessScore} color="#06B6D4"
        icon={<Zap className="w-2.5 h-2.5" />} />
    </div>

    {/* Footer */}
    {data.url && (
      <div className="flex items-center gap-1 text-[9px] font-mono text-slate-600 pt-0.5 border-t border-white/[0.05]">
        <ExternalLink className="w-2.5 h-2.5" />
        <span className="truncate">{data.url.replace(/^https?:\/\//, '').substring(0, 36)}</span>
      </div>
    )}
  </div>
);

// ─── Asset hover preview content ──────────────────────────────────────────────

const RISK_ICONS = {
  low:     { icon: ShieldCheck,  color: '#10B981', label: 'Low Risk'   },
  medium:  { icon: ShieldAlert,  color: '#F59E0B', label: 'Med Risk'   },
  high:    { icon: ShieldAlert,  color: '#EF4444', label: 'High Risk'  },
  blocked: { icon: ShieldOff,    color: '#7C3AED', label: 'Blocked'    },
};

export const AssetPreviewCard: React.FC<{ data: AssetPreviewData }> = ({ data }) => {
  const risk = RISK_ICONS[data.rightsRisk];
  const RiskIcon = risk.icon;

  return (
    <div className="overflow-hidden">
      {/* Thumbnail */}
      <div className={`h-28 bg-gradient-to-br ${data.thumbnailGradient} flex items-center justify-center relative`}>
        {data.thumbnailIcon && (
          <span className="text-4xl opacity-50 select-none">{data.thumbnailIcon}</span>
        )}
        {data.durationLabel && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60
            backdrop-blur-sm text-[9px] font-mono text-white">
            {data.durationLabel}
          </div>
        )}
        {data.resolution && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50
            backdrop-blur-sm text-[9px] font-mono text-slate-300">
            {data.resolution}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <p className="text-[11px] font-semibold text-slate-200 line-clamp-2 leading-tight">
          {data.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-mono text-slate-500">{data.source}</span>
          <span className="text-[9px] font-mono text-slate-700">·</span>
          <span className="text-[9px] font-mono text-slate-500">{data.type}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono" style={{ color: risk.color }}>
          <RiskIcon className="w-3 h-3" />
          {risk.label}
        </div>
      </div>
    </div>
  );
};
