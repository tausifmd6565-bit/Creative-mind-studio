/**
 * WorkspacePanelHeader — shared panel header used across project workspaces.
 *
 * Renders a slim header bar with a coloured icon, title, optional subtitle,
 * and an optional right-aligned actions slot.
 *
 * Used by: ResearchLabPage, ScriptRoomPage (and any future workspaces).
 */

import React from 'react';

export interface WorkspacePanelHeaderProps {
  /** Icon element to display in the coloured chip */
  icon: React.ReactNode;
  /** Panel title */
  title: string;
  /** Optional secondary line below the title */
  subtitle?: string;
  /** Accent colour — used for the icon chip background/border/text */
  color: string;
  /** Optional content rendered at the right edge */
  actions?: React.ReactNode;
}

export const WorkspacePanelHeader: React.FC<WorkspacePanelHeaderProps> = ({
  icon,
  title,
  subtitle,
  color,
  actions,
}) => (
  <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5
    border-b border-white/[0.06] bg-[#0B0B12]/60 backdrop-blur-sm">
    <div
      className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}20`, border: `1px solid ${color}30`, color }}
      aria-hidden="true"
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h2 className="font-display font-semibold text-[13px] text-white leading-tight">{title}</h2>
      {subtitle && (
        <p className="text-[10px] font-mono text-slate-600 truncate">{subtitle}</p>
      )}
    </div>
    {actions}
  </div>
);
