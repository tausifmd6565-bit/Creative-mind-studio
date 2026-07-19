/**
 * ProjectsPage — workspace project list with full workflow context.
 *
 * Each project card shows:
 *  - Current stage (active phase in the workflow)
 *  - Responsible member for that stage
 *  - Overall completion %
 *  - Blocked items count
 *  - Live AI activity indicator
 *  - Approval status
 *  - Decision history count
 */

import React, { useMemo, useState } from 'react';
import { useDebounce } from '../../../lib/performance';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, AlertTriangle, CheckCircle2, Clock,
  Loader, Circle, Sparkles, ChevronRight, BarChart2,
  BookOpen, FileText, Package, Video, ShieldCheck, Radio, Dna,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type PhaseId =
  | 'strategy'
  | 'virality-twin'
  | 'research'
  | 'script'
  | 'assets'
  | 'editing'
  | 'review'
  | 'distribution'
  | 'analytics';

type PhaseStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';
type ProjectStatus = 'draft' | 'in-progress' | 'review' | 'on-hold' | 'published' | 'archived';

interface TeamMember { name: string; initials: string; color: string }

interface ProjectCard {
  id: string;
  title: string;
  description: string;
  platform: string;
  thumbnailGradient: string;
  status: ProjectStatus;
  overallProgress: number;
  activePhase: PhaseId;
  activePhaseLabel: string;
  activePhaseStatus: PhaseStatus;
  responsible: TeamMember;
  blockedCount: number;
  aiActive: boolean;
  aiAgentName: string;
  decisionsLogged: number;
  approvalsTotal: number;
  approvalsPending: number;
  lastUpdated: string;
  deadline: string;
  daysLeft: number;
}

// ─── Phase config ─────────────────────────────────────────────────────────────

const PHASE_ICONS: Record<PhaseId, React.ReactNode> = {
  strategy:       <Sparkles className="w-3.5 h-3.5" />,
  'virality-twin':<BarChart2 className="w-3.5 h-3.5" />,
  research:       <BookOpen className="w-3.5 h-3.5" />,
  script:         <FileText className="w-3.5 h-3.5" />,
  assets:         <Package className="w-3.5 h-3.5" />,
  editing:        <Video className="w-3.5 h-3.5" />,
  review:         <ShieldCheck className="w-3.5 h-3.5" />,
  distribution:   <Radio className="w-3.5 h-3.5" />,
  analytics:      <Dna className="w-3.5 h-3.5" />,
};

const PHASE_COLORS: Record<PhaseId, string> = {
  strategy:       '#8B5CF6',
  'virality-twin':'#10B981',
  research:       '#06B6D4',
  script:         '#8B5CF6',
  assets:         '#F59E0B',
  editing:        '#3B82F6',
  review:         '#EF4444',
  distribution:   '#10B981',
  analytics:      '#9D6CFF',
};

// ─── Status config ────────────────────────────────────────────────────────────

const PROJECT_STATUS: Record<ProjectStatus, { label: string; dot: string; badge: string }> = {
  draft:         { label: 'Draft',       dot: 'bg-slate-500',   badge: 'text-slate-400  bg-slate-500/10  border-slate-500/25'  },
  'in-progress': { label: 'In Progress', dot: 'bg-blue-500',    badge: 'text-blue-400   bg-blue-500/10   border-blue-500/25'   },
  review:        { label: 'In Review',   dot: 'bg-amber-500',   badge: 'text-amber-400  bg-amber-500/10  border-amber-500/25'  },
  'on-hold':     { label: 'On Hold',     dot: 'bg-orange-500',  badge: 'text-orange-400 bg-orange-500/10 border-orange-500/25' },
  published:     { label: 'Published',   dot: 'bg-emerald-500', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
  archived:      { label: 'Archived',    dot: 'bg-slate-600',   badge: 'text-slate-500  bg-slate-600/10  border-slate-600/25'  },
};

const PHASE_STATUS_ICON: Record<PhaseStatus, React.ReactNode> = {
  'not-started': <Circle    className="w-3 h-3 text-slate-600" />,
  'in-progress': <Loader    className="w-3 h-3 text-blue-400 animate-spin" />,
  completed:     <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
  blocked:       <AlertTriangle className="w-3 h-3 text-red-400" />,
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: ProjectCard[] = [
  {
    id: 'proj-001',
    title: 'The Rise of AI in Healthcare',
    description: 'Documentary-style YouTube series on AI diagnostics, drug discovery and patient care.',
    platform: 'YouTube',
    thumbnailGradient: 'from-[#7C3AED] via-[#4F46E5] to-[#06B6D4]',
    status: 'in-progress',
    overallProgress: 47,
    activePhase: 'research',
    activePhaseLabel: 'Research Lab',
    activePhaseStatus: 'in-progress',
    responsible: { name: 'James Park', initials: 'JP', color: '#06B6D4' },
    blockedCount: 4,
    aiActive: true,
    aiAgentName: 'ResearchOwl',
    decisionsLogged: 14,
    approvalsTotal: 3,
    approvalsPending: 2,
    lastUpdated: '1h ago',
    deadline: 'Feb 14',
    daysLeft: 22,
  },
  {
    id: 'proj-002',
    title: 'Hidden Psychology of Viral Content',
    description: 'Deep-dive breakdown of cognitive biases and emotional triggers that drive sharing.',
    platform: 'YouTube · LinkedIn',
    thumbnailGradient: 'from-[#0F172A] via-[#1E40AF] to-[#7C3AED]',
    status: 'review',
    overallProgress: 91,
    activePhase: 'review',
    activePhaseLabel: 'Review & Approval',
    activePhaseStatus: 'blocked',
    responsible: { name: 'Dr. Priya Mehta', initials: 'PM', color: '#EF4444' },
    blockedCount: 2,
    aiActive: false,
    aiAgentName: 'RightsAuditor',
    decisionsLogged: 31,
    approvalsTotal: 8,
    approvalsPending: 1,
    lastUpdated: '30m ago',
    deadline: 'Jan 28',
    daysLeft: 5,
  },
  {
    id: 'proj-003',
    title: 'Future of Remote Work — 2025',
    description: 'Data-driven explainer on distributed team culture and async workflow tooling.',
    platform: 'LinkedIn · Twitter/X',
    thumbnailGradient: 'from-[#064E3B] via-[#065F46] to-[#10B981]',
    status: 'in-progress',
    overallProgress: 22,
    activePhase: 'script',
    activePhaseLabel: 'Script Room',
    activePhaseStatus: 'in-progress',
    responsible: { name: 'Maria Reyes', initials: 'MR', color: '#10B981' },
    blockedCount: 0,
    aiActive: true,
    aiAgentName: 'ScriptGenius',
    decisionsLogged: 6,
    approvalsTotal: 2,
    approvalsPending: 1,
    lastUpdated: '3h ago',
    deadline: 'Mar 3',
    daysLeft: 39,
  },
  {
    id: 'proj-004',
    title: 'Climate Tech Investor Series',
    description: 'Short-form series profiling breakthrough climate technology companies for investor audiences.',
    platform: 'YouTube Shorts · Instagram',
    thumbnailGradient: 'from-[#431407] via-[#7C2D12] to-[#EA580C]',
    status: 'draft',
    overallProgress: 8,
    activePhase: 'strategy',
    activePhaseLabel: 'Strategy War Room',
    activePhaseStatus: 'in-progress',
    responsible: { name: 'Sara Khalid', initials: 'SK', color: '#8B5CF6' },
    blockedCount: 0,
    aiActive: true,
    aiAgentName: 'Nova (Creative Director)',
    decisionsLogged: 3,
    approvalsTotal: 1,
    approvalsPending: 1,
    lastUpdated: '5h ago',
    deadline: 'Apr 1',
    daysLeft: 66,
  },
  {
    id: 'proj-005',
    title: 'Longevity Science Explained',
    description: 'Breaking down the latest longevity research for a mainstream health-curious audience.',
    platform: 'YouTube · Podcast',
    thumbnailGradient: 'from-[#0C4A6E] via-[#0369A1] to-[#38BDF8]',
    status: 'published',
    overallProgress: 100,
    activePhase: 'analytics',
    activePhaseLabel: 'Creator DNA & Analytics',
    activePhaseStatus: 'in-progress',
    responsible: { name: 'Leon Wu', initials: 'LW', color: '#F59E0B' },
    blockedCount: 0,
    aiActive: true,
    aiAgentName: 'PerformanceAI',
    decisionsLogged: 44,
    approvalsTotal: 12,
    approvalsPending: 0,
    lastUpdated: '2d ago',
    deadline: 'Published',
    daysLeft: 0,
  },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar: React.FC<{ value: number; color: string }> = React.memo(({ value, color }) => (
  <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
    <motion.div
      className="h-full rounded-full"
      style={{ backgroundColor: color }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    />
  </div>
));
ProgressBar.displayName = 'ProgressBar';

// ─── Project card ─────────────────────────────────────────────────────────────

const ProjectCardItem: React.FC<{ project: ProjectCard; index: number }> = React.memo(({ project, index }) => {
  const statusCfg = PROJECT_STATUS[project.status];
  const phaseColor = PHASE_COLORS[project.activePhase];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="group rounded-2xl border border-white/[0.07] bg-[#10101A]/80
        hover:border-white/[0.13] hover:bg-[#10101A]
        transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Gradient top accent */}
      <div className={`h-1 bg-gradient-to-r ${project.thumbnailGradient}`} />

      <div className="p-5 space-y-4">

        {/* ── Row 1: title + status badge ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-[15px] text-slate-100 leading-tight
              group-hover:text-white transition-colors duration-150 truncate">
              {project.title}
            </h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5 line-clamp-1">
              {project.description}
            </p>
          </div>
          <div className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1
            rounded-full border text-[10px] font-semibold font-mono ${statusCfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </div>
        </div>

        {/* ── Row 2: Current stage strip ── */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl
          bg-white/[0.03] border border-white/[0.06]">
          {/* Phase icon chip */}
          <div
            className="w-6 h-6 rounded-[7px] flex items-center justify-center flex-shrink-0"
            style={{ background: phaseColor + '20', color: phaseColor }}
          >
            {PHASE_ICONS[project.activePhase]}
          </div>

          {/* Stage label + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-200">
                {project.activePhaseLabel}
              </span>
              <span className="flex-shrink-0">
                {PHASE_STATUS_ICON[project.activePhaseStatus]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Responsible member */}
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center
                  text-[8px] font-bold flex-shrink-0"
                style={{
                  background: project.responsible.color + '28',
                  color: project.responsible.color,
                }}
              >
                {project.responsible.initials}
              </div>
              <span className="text-[10px] text-slate-500 truncate">
                {project.responsible.name}
              </span>
            </div>
          </div>

          {/* Blocked indicator */}
          {project.blockedCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-red-500/10 border border-red-500/20 text-[10px] font-mono font-semibold
              text-red-400 flex-shrink-0">
              <AlertTriangle className="w-2.5 h-2.5" />
              {project.blockedCount} blocked
            </div>
          )}

          {/* AI activity pulse */}
          {project.aiActive && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#9D6CFF]"
              />
              <span className="text-[10px] font-mono text-[#9D6CFF] hidden sm:inline
                max-w-[80px] truncate">
                {project.aiAgentName}
              </span>
            </div>
          )}
        </div>

        {/* ── Row 3: Progress bar ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
              Overall progress
            </span>
            <span className="text-[11px] font-mono font-semibold" style={{ color: phaseColor }}>
              {project.overallProgress}%
            </span>
          </div>
          <ProgressBar value={project.overallProgress} color={phaseColor} />
        </div>

        {/* ── Row 4: Meta pills ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Platform */}
          <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
            {project.platform}
          </span>

          <div className="h-3 w-px bg-white/[0.08] flex-shrink-0" />

          {/* Decisions logged */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
            <CheckCircle2 className="w-3 h-3 text-slate-700" />
            <span>{project.decisionsLogged} decisions</span>
          </div>

          {/* Approvals */}
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <ShieldCheck className="w-3 h-3 text-slate-700" />
            <span className={project.approvalsPending > 0 ? 'text-amber-400' : 'text-slate-500'}>
              {project.approvalsTotal - project.approvalsPending}/{project.approvalsTotal} approved
            </span>
          </div>

          {/* Deadline */}
          <div className="ml-auto flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3 text-slate-700" />
            <span className={`text-[10px] font-mono ${
              project.daysLeft === 0
                ? 'text-emerald-400'
                : project.daysLeft <= 7
                ? 'text-red-400'
                : project.daysLeft <= 14
                ? 'text-amber-400'
                : 'text-slate-500'
            }`}>
              {project.daysLeft === 0 ? 'Published' : `${project.daysLeft}d left`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer: resume workflow CTA ── */}
      <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.015]
        flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono text-slate-600 truncate">
          Updated {project.lastUpdated}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-full
              border transition-colors duration-150 flex-shrink-0"
            style={{
              color: phaseColor,
              borderColor: phaseColor + '30',
              background: phaseColor + '10',
            }}
          >
            {PHASE_ICONS[project.activePhase]}
            <span className="ml-1">{project.activePhaseLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#9D6CFF]
            opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Resume
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.article>
  );
});
ProjectCardItem.displayName = 'ProjectCardItem';

// ─── Page ─────────────────────────────────────────────────────────────────────

export const ProjectsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  // Debounce search so the filter pipeline doesn't run on every keystroke
  const debouncedSearch = useDebounce(search, 250);

  // Memoized filter — only recomputes when debounced search or status changes
  const filtered = useMemo(() => MOCK_PROJECTS.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  }), [statusFilter, debouncedSearch]);

  const STATUS_TABS: Array<{ id: ProjectStatus | 'all'; label: string }> = [
    { id: 'all',        label: 'All' },
    { id: 'in-progress',label: 'In Progress' },
    { id: 'review',     label: 'In Review' },
    { id: 'draft',      label: 'Draft' },
    { id: 'published',  label: 'Published' },
    { id: 'on-hold',    label: 'On Hold' },
  ];

  // Summary stats — stable, computed once from the static mock data
  const stats = useMemo(() => ({
    total:   MOCK_PROJECTS.length,
    active:  MOCK_PROJECTS.filter(p => p.status === 'in-progress').length,
    blocked: MOCK_PROJECTS.reduce((sum, p) => sum + p.blockedCount, 0),
    aiLive:  MOCK_PROJECTS.filter(p => p.aiActive).length,
  }), []);

  return (
    <div className="w-full min-h-full px-4 sm:px-6 md:px-8 py-8 pb-20 md:pb-10 space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[24px] text-white tracking-tight">
            Projects
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5 font-sans">
            {stats.total} projects · {stats.active} active · {stats.aiLive} AI agents running
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px]
            bg-gradient-to-r from-[#7C3AED] to-[#9D6CFF] text-white text-[13px]
            font-semibold border border-[#8B5CF6]/30
            shadow-[0_4px_16px_rgba(124,58,237,0.30)]
            hover:shadow-[0_4px_22px_rgba(139,92,246,0.45)]
            transition-shadow duration-200 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Project
        </motion.button>
      </div>

      {/* ── Workflow summary banner ── */}
      {stats.blocked > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl
            bg-[#1A0800] border border-red-500/25"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-[12.5px] text-red-300 font-sans font-medium">
            {stats.blocked} blocked items across your active projects require attention before workflow can proceed.
          </p>
        </motion.div>
      )}

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full h-9 pl-9 pr-3 rounded-[10px] bg-[#0B0B12] border border-white/[0.09]
              text-[12px] text-slate-200 font-sans placeholder:text-slate-700
              focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6]/50
              transition-all duration-200"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]
          overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-[8px] text-[11px] font-mono
                transition-all duration-150
                ${statusFilter === tab.id
                  ? 'bg-[#7C3AED]/25 text-[#9D6CFF] border border-[#7C3AED]/35'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {tab.label}
              {tab.id !== 'all' && (
                <span className="ml-1 text-[9px] opacity-50">
                  {MOCK_PROJECTS.filter(p => p.status === tab.id).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Project grid ── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Filter className="w-10 h-10 text-slate-700 mb-4" />
            <p className="text-[14px] font-semibold text-slate-400 mb-1">No projects match your filters</p>
            <p className="text-[12px] text-slate-600 font-sans">
              Try adjusting your search or status filter.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filtered.map((project, i) => (
              <ProjectCardItem key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Workflow stage legend ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-white/[0.05]">
        <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest flex-shrink-0">
          Stages
        </span>
        {(Object.entries(PHASE_ICONS) as [PhaseId, React.ReactNode][]).map(([id, icon]) => (
          <div key={id} className="flex items-center gap-1 text-[10px] font-mono text-slate-600">
            <span style={{ color: PHASE_COLORS[id] }}>{icon}</span>
            <span className="capitalize">{id.replace('-', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
