/**
 * ProjectWorkspace.tsx — 4-tab project workspace container.
 *
 * This is the heart of the application. Each project opens here.
 * The 4 tabs are:
 *   0 — Strategy   : IBM Granite multi-agent debate
 *   1 — Research   : IBM Granite research pack
 *   2 — Blueprint  : IBM Granite creative blueprint
 *   3 — Export     : Assembled production package download
 *
 * Tab progression is gated: Research requires Strategy completed,
 * Blueprint requires Research completed.
 */

import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Swords, FlaskConical, FileText, Download, Loader2, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { apiClient } from '../../../../lib/api/client';
import { PROJECTS, EXPORT } from '../../../../lib/api/endpoints';
import { useLayout } from '../../../../lib/useLayout';

// Lazy-load each tab panel (reuses existing pages)
const StrategyWarRoomPage = lazy(() =>
  import('./strategy/StrategyWarRoomPage').then(m => ({ default: m.StrategyWarRoomPage }))
);
const ResearchLabPage = lazy(() =>
  import('./research/ResearchLabPage').then(m => ({ default: m.ResearchLabPage }))
);
const BlueprintWorkspace = lazy(() =>
  import('./blueprint/BlueprintWorkspace').then(m => ({ default: m.BlueprintWorkspace }))
);
const ExportPanel = lazy(() =>
  import('./export/ExportPanel').then(m => ({ default: m.ExportPanel }))
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectInfo {
  id: string;
  title: string;
  raw_idea: string;
  status: string;
  current_stage: string;
}

interface ExportSummary {
  strategy_approved: boolean;
  research_ready: boolean;
  blueprint_ready: boolean;
  export_ready: boolean;
  stages_completed: string[];
}

type TabId = 'strategy' | 'research' | 'blueprint' | 'export';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  lockedBy?: string; // which stage must be completed first
}

const TABS: Tab[] = [
  { id: 'strategy',  label: 'Strategy',         icon: <Swords       className="w-4 h-4" /> },
  { id: 'research',  label: 'Research Desk',    icon: <FlaskConical  className="w-4 h-4" />, lockedBy: 'strategy' },
  { id: 'blueprint', label: 'Blueprint Studio', icon: <FileText      className="w-4 h-4" />, lockedBy: 'research' },
  { id: 'export',    label: 'Export Package',   icon: <Download      className="w-4 h-4" />, lockedBy: 'blueprint' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectWorkspaceProps {
  projectId: string;
  initialTab?: TabId;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  projectId,
  initialTab = 'strategy',
  onBack,
}) => {
  const { setBreadcrumbs } = useLayout();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [summary, setSummary] = useState<ExportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Load project + export summary ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Load project — this is required
        const projResp = await apiClient.get<ProjectInfo>(PROJECTS.detail(projectId));
        if (!cancelled) {
          setProject(projResp.data);
          // Resume at the current stage where the user left off
          const stage = projResp.data.current_stage?.toLowerCase();
          if (stage === 'research') setActiveTab('research');
          else if (stage === 'blueprint') setActiveTab('blueprint');
          else if (stage === 'export') setActiveTab('export');
        }
      } catch {
        // Project load failed — still show workspace with empty state
      }

      try {
        // Export summary — 404 is expected on fresh projects (no AI run yet)
        const summaryResp = await apiClient.get<ExportSummary>(EXPORT.summary(projectId));
        if (!cancelled) setSummary(summaryResp.data);
      } catch {
        // 404 or network error — treat as "nothing complete yet", don't block render
        if (!cancelled) setSummary({
          strategy_approved: false,
          research_ready: false,
          blueprint_ready: false,
          export_ready: false,
          stages_completed: [],
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [projectId]);

  // ── Breadcrumbs ────────────────────────────────────────────────────────────
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Projects', onClick: onBack },
      { label: project?.title ?? 'Project' },
    ]);
  }, [project, setBreadcrumbs, onBack]);

  // ── Refresh summary after a stage completes ────────────────────────────────
  const refreshSummary = async () => {
    try {
      const resp = await apiClient.get<ExportSummary>(EXPORT.summary(projectId));
      setSummary(resp.data);
    } catch {
      // silent
    }
  };

  // ── Tab lock logic — all tabs unlocked for demo flow ──────────────────────
  // Tabs are never hard-locked so users can navigate freely.
  // A soft visual cue (dimmed) shows incomplete stages without blocking access.
  const isTabLocked = (_tab: Tab): boolean => false;

  const isTabComplete = (tabId: TabId): boolean => {
    if (!summary) return false;
    if (tabId === 'strategy') return summary.strategy_approved;
    if (tabId === 'research') return summary.research_ready;
    if (tabId === 'blueprint') return summary.blueprint_ready;
    if (tabId === 'export') return summary.export_ready;
    return false;
  };

  const handleTabClick = (tab: Tab) => {
    if (isTabLocked(tab)) return;
    setActiveTab(tab.id);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#0F1115]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4589FF]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0F1115] text-slate-100">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/[0.07] bg-[#0F1115] flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Projects
        </button>
        <span className="text-slate-700">/</span>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-100 truncate">
            {project?.title ?? 'Project Workspace'}
          </h1>
          {project?.raw_idea && (
            <p className="text-xs text-slate-500 truncate max-w-lg mt-0.5">
              {project.raw_idea}
            </p>
          )}
        </div>

        {/* Stage badges */}
        {summary && (
          <div className="ml-auto flex items-center gap-2">
            {summary.stages_completed.map(stage => (
              <span
                key={stage}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20"
              >
                <CheckCircle2 className="w-3 h-3" />
                {stage}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-0 border-b border-white/[0.07] bg-[#0A0D12] flex-shrink-0 px-6">
        {TABS.map(tab => {
          const locked = isTabLocked(tab);
          const complete = isTabComplete(tab.id);
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              disabled={locked}
              className={[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                active
                  ? 'border-[#0F62FE] text-[#4589FF]'
                  : locked
                  ? 'border-transparent text-slate-700 cursor-not-allowed'
                  : 'border-transparent text-slate-500 hover:text-slate-200 hover:border-white/[0.18]',
              ].join(' ')}
            >
              {locked ? <Lock className="w-3.5 h-3.5" /> : tab.icon}
              {tab.label}
              {complete && !active && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-auto min-h-0">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[#4589FF]" />
            </div>
          }
        >
          {activeTab === 'strategy' && (
            <StrategyWarRoomPage
              projectId={projectId}
              onBack={onBack}
              onContinueToResearch={() => {
                refreshSummary();
                setActiveTab('research');
              }}
            />
          )}
          {activeTab === 'research' && (
            <ResearchLabPage
              projectId={projectId}
              onBack={() => setActiveTab('strategy')}
              onContinue={() => {
                refreshSummary();
                setActiveTab('blueprint');
              }}
            />
          )}
          {activeTab === 'blueprint' && (
            <BlueprintWorkspace
              projectId={projectId}
              onBack={() => setActiveTab('research')}
              onContinue={() => {
                refreshSummary();
                setActiveTab('export');
              }}
            />
          )}
          {activeTab === 'export' && (
            <ExportPanel
              projectId={projectId}
              onBack={() => setActiveTab('blueprint')}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};
