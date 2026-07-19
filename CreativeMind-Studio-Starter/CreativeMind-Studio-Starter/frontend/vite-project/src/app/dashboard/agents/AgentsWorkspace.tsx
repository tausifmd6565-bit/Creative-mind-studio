/**
 * AgentsWorkspace.tsx — AI Agents Management Workspace
 *
 * Desktop layout: LEFT (agent roster + filter) | CENTER (agent detail / task log)
 * Mobile: tabs — Agents | Tasks | Stats
 *
 * Displays all running AI agents across projects, their current tasks,
 * performance stats, and allows the user to pause/resume agents.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Zap, CheckCircle2, AlertCircle, Clock, Pause, Play,
  BarChart3, Activity, ChevronRight, Search, List,
  BrainCircuit, Sparkles, Target, FileText, Lightbulb, TrendingUp,
} from 'lucide-react';
import { useLayout } from '../../../lib/useLayout';
import { useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = 'running' | 'idle' | 'paused' | 'error';
type AgentRole =
  | 'strategist'
  | 'researcher'
  | 'scriptwriter'
  | 'virality-analyst'
  | 'ethics-auditor';

interface AgentTask {
  id: string;
  description: string;
  project: string;
  startedAt: string;
  duration: string;
  output?: string;
  status: 'completed' | 'running' | 'queued';
}

interface AIAgent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  currentTask: string;
  project: string;
  projectColor: string;
  tasksDone: number;
  tasksToday: number;
  accuracy: number;
  uptime: string;
  recentTasks: AgentTask[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const AGENTS: AIAgent[] = [
  {
    id: 'ag-1', name: 'StrategyMind', role: 'strategist', status: 'running',
    currentTask: 'Running multi-agent debate on hook strategy',
    project: 'Brand Refresh Campaign', projectColor: '#8B5CF6',
    tasksDone: 148, tasksToday: 12, accuracy: 94.2, uptime: '99.1%',
    recentTasks: [
      { id: 't1', description: 'Generated 5 hook variations for 30s reel', project: 'Brand Refresh Campaign', startedAt: '2 min ago', duration: '42s', status: 'running', output: undefined },
      { id: 't2', description: 'Scored concept viability at 87/100', project: 'Brand Refresh Campaign', startedAt: '18 min ago', duration: '1m 12s', status: 'completed', output: 'Score: 87 — Strong concept with clear audience alignment' },
      { id: 't3', description: 'Debated platform fit with EthicsAudit', project: 'Viral Shorts Series', startedAt: '1 hr ago', duration: '3m 05s', status: 'completed', output: 'Consensus: YouTube + TikTok primary, Instagram secondary' },
      { id: 't4', description: 'Analysed competitor content gap', project: 'Social Campaign Sprint', startedAt: '3 hrs ago', duration: '2m 48s', status: 'completed', output: '14 untapped topic clusters identified' },
    ],
  },
  {
    id: 'ag-2', name: 'ResearchOwl', role: 'researcher', status: 'running',
    currentTask: 'Cross-referencing 12 source documents for claim verification',
    project: 'Documentary Series', projectColor: '#10B981',
    tasksDone: 312, tasksToday: 21, accuracy: 97.8, uptime: '98.4%',
    recentTasks: [
      { id: 't5', description: 'Verified 8/12 claims in Episode 4 script', project: 'Documentary Series', startedAt: '4 min ago', duration: '2m 10s', status: 'running' },
      { id: 't6', description: 'Sourced 6 peer-reviewed papers on consumer trends', project: 'Brand Refresh Campaign', startedAt: '35 min ago', duration: '4m 22s', status: 'completed', output: 'Sources added to Research Lab — avg credibility 91%' },
      { id: 't7', description: 'Generated evidence map for Q3 brief', project: 'Documentary Series', startedAt: '2 hrs ago', duration: '6m 14s', status: 'completed', output: '34 evidence nodes mapped across 4 themes' },
    ],
  },
  {
    id: 'ag-3', name: 'ScriptCraft', role: 'scriptwriter', status: 'idle',
    currentTask: 'Waiting for research approval',
    project: 'Product Launch Video', projectColor: '#EC4899',
    tasksDone: 89, tasksToday: 5, accuracy: 91.0, uptime: '97.7%',
    recentTasks: [
      { id: 't8', description: 'Wrote 3 hook variations for 60s ad', project: 'Product Launch Video', startedAt: '1 hr ago', duration: '1m 58s', status: 'completed', output: 'Hooks saved to Script Room — top score 89' },
      { id: 't9', description: 'Refined emotional arc for Act 2', project: 'Viral Shorts Series', startedAt: '4 hrs ago', duration: '2m 35s', status: 'completed', output: 'Tension peak moved to 0:38 — predicted 12% retention increase' },
    ],
  },
  {
    id: 'ag-4', name: 'ViralityTwin', role: 'virality-analyst', status: 'running',
    currentTask: 'Simulating virality score for 3 thumbnail variants',
    project: 'Viral Shorts Series', projectColor: '#F59E0B',
    tasksDone: 204, tasksToday: 18, accuracy: 89.5, uptime: '99.6%',
    recentTasks: [
      { id: 't10', description: 'Predicted CTR at 14.2% for Thumbnail B', project: 'Viral Shorts Series', startedAt: '1 min ago', duration: '55s', status: 'running' },
      { id: 't11', description: 'Benchmarked against 500 similar viral videos', project: 'Brand Refresh Campaign', startedAt: '22 min ago', duration: '3m 40s', status: 'completed', output: 'Top-10 percentile structure: 8s hook, 3-act breakdown' },
      { id: 't12', description: 'Virality score improved +11% after hook edit', project: 'Viral Shorts Series', startedAt: '2 hrs ago', duration: '1m 20s', status: 'completed', output: 'New score: 81/100' },
    ],
  },
  {
    id: 'ag-5', name: 'EthicsAudit', role: 'ethics-auditor', status: 'paused',
    currentTask: 'Paused — awaiting script v3 upload',
    project: 'Documentary Series', projectColor: '#10B981',
    tasksDone: 67, tasksToday: 2, accuracy: 99.1, uptime: '95.2%',
    recentTasks: [
      { id: 't13', description: 'Flagged 2 unverified claims in Episode 3', project: 'Documentary Series', startedAt: '3 hrs ago', duration: '1m 48s', status: 'completed', output: 'Claims flagged: statistics on page 4 & 7 — citations required' },
      { id: 't14', description: 'Cleared ethics review for Brand Refresh v2', project: 'Brand Refresh Campaign', startedAt: '1 day ago', duration: '2m 02s', status: 'completed', output: 'No violations found — 100% compliant' },
    ],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<AgentRole, { label: string; color: string; Icon: React.ElementType }> = {
  strategist:       { label: 'Creative Strategist', color: '#8B5CF6', Icon: BrainCircuit },
  researcher:       { label: 'Research Analyst',    color: '#06B6D4', Icon: Search },
  scriptwriter:     { label: 'Script Writer',        color: '#10B981', Icon: FileText },
  'virality-analyst': { label: 'Virality Analyst',  color: '#F59E0B', Icon: TrendingUp },
  'ethics-auditor': { label: 'Ethics Auditor',      color: '#84CC16', Icon: Lightbulb },
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; dot: string; badge: string }> = {
  running: { label: 'Running',  dot: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  idle:    { label: 'Idle',     dot: 'bg-slate-500',   badge: 'text-slate-400  bg-slate-500/10  border-slate-500/20' },
  paused:  { label: 'Paused',   dot: 'bg-amber-400',   badge: 'text-amber-400  bg-amber-400/10  border-amber-400/20' },
  error:   { label: 'Error',    dot: 'bg-red-400',     badge: 'text-red-400    bg-red-400/10    border-red-400/20' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot: React.FC<{ status: AgentStatus }> = ({ status }) => {
  const { dot } = STATUS_CONFIG[status];
  return (
    <span className="relative flex h-2 w-2">
      {status === 'running' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dot} opacity-60`} />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${dot}`} />
    </span>
  );
};

const TaskStatusIcon: React.FC<{ status: AgentTask['status'] }> = ({ status }) => {
  if (status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
  if (status === 'running')   return <Activity className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 animate-pulse" />;
  return <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />;
};

// ─── Agent List Item ──────────────────────────────────────────────────────────

const AgentListItem: React.FC<{
  agent: AIAgent;
  selected: boolean;
  onSelect: () => void;
}> = ({ agent, selected, onSelect }) => {
  const { label, Icon } = ROLE_CONFIG[agent.role];
  const { label: statusLabel, dot, badge } = STATUS_CONFIG[agent.status];

  return (
    <motion.button
      layout
      onClick={onSelect}
      className={`w-full text-left px-3 py-3 rounded-lg border transition-colors ${
        selected
          ? 'bg-[#1B1B2A] border-[#8B5CF6]/40'
          : 'border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${ROLE_CONFIG[agent.role].color}18`, border: `1px solid ${ROLE_CONFIG[agent.role].color}30` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: ROLE_CONFIG[agent.role].color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-medium text-slate-100 truncate">{agent.name}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${badge}`}>
              <StatusDot status={agent.status} />
              {statusLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">{label}</p>
          <p className="text-[11px] text-slate-400 truncate mt-1 leading-snug">{agent.currentTask}</p>
        </div>
      </div>
    </motion.button>
  );
};

// ─── Agent Detail Panel ───────────────────────────────────────────────────────

const AgentDetailPanel: React.FC<{ agent: AIAgent }> = ({ agent }) => {
  const { label, Icon, color } = ROLE_CONFIG[agent.role];
  const [paused, setPaused] = useState(agent.status === 'paused');

  return (
    <div className="h-full overflow-y-auto px-5 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-[17px] font-semibold text-slate-100">{agent.name}</h2>
          <p className="text-[12px] text-slate-400">{label}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border ${STATUS_CONFIG[agent.status].badge}`}
            >
              <StatusDot status={agent.status} />
              {STATUS_CONFIG[agent.status].label}
            </span>
            <span className="text-[11px] text-slate-500">on</span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{ background: `${agent.projectColor}15`, color: agent.projectColor }}
            >
              {agent.project}
            </span>
          </div>
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
            paused
              ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25 hover:bg-emerald-400/20'
              : 'text-slate-300 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]'
          }`}
        >
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tasks Done',   value: agent.tasksDone.toString() },
          { label: 'Today',        value: agent.tasksToday.toString() },
          { label: 'Accuracy',     value: `${agent.accuracy}%` },
          { label: 'Uptime',       value: agent.uptime },
        ].map(s => (
          <div key={s.label} className="bg-[#10101A] border border-white/[0.06] rounded-lg px-3 py-3 text-center">
            <p className="text-[18px] font-display font-semibold text-slate-100">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Current task */}
      <div className="bg-[#10101A] border border-white/[0.06] rounded-lg p-4">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Current Task</p>
        <div className="flex items-start gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" />
          <p className="text-[13px] text-slate-200 leading-relaxed">{agent.currentTask}</p>
        </div>
      </div>

      {/* Task log */}
      <div>
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">Recent Tasks</p>
        <div className="space-y-2">
          {agent.recentTasks.map(task => (
            <div key={task.id} className="bg-[#10101A] border border-white/[0.05] rounded-lg p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <TaskStatusIcon status={task.status} />
                <p className="text-[12px] text-slate-200 leading-snug flex-1">{task.description}</p>
              </div>
              {task.output && (
                <p className="text-[11px] text-slate-400 pl-5 leading-snug">{task.output}</p>
              )}
              <div className="flex items-center gap-3 pl-5">
                <span className="text-[10px] text-slate-600">{task.startedAt}</span>
                <span className="text-[10px] text-slate-700">·</span>
                <span className="text-[10px] text-slate-600">{task.duration}</span>
                <span className="text-[10px] text-slate-700">·</span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: `${agent.projectColor}15`, color: agent.projectColor }}
                >
                  {task.project}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const AgentStatsBar: React.FC = () => {
  const running = AGENTS.filter(a => a.status === 'running').length;
  const idle    = AGENTS.filter(a => a.status === 'idle').length;
  const paused  = AGENTS.filter(a => a.status === 'paused').length;
  const totalTasks = AGENTS.reduce((sum, a) => sum + a.tasksDone, 0);

  return (
    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.05] bg-[#09090F]/60">
      {[
        { label: 'Running', value: running, color: 'text-emerald-400' },
        { label: 'Idle',    value: idle,    color: 'text-slate-400' },
        { label: 'Paused',  value: paused,  color: 'text-amber-400' },
      ].map(s => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className={`text-[13px] font-semibold ${s.color}`}>{s.value}</span>
          <span className="text-[11px] text-slate-600">{s.label}</span>
        </div>
      ))}
      <div className="w-px h-3 bg-white/[0.08] mx-1" />
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] text-slate-500">{totalTasks.toLocaleString()} tasks completed</span>
      </div>
    </div>
  );
};

// ─── Mobile tab type ──────────────────────────────────────────────────────────

type MobileTab = 'agents' | 'tasks' | 'stats';

const MOBILE_TABS: Array<{ id: MobileTab; label: string; Icon: React.ElementType }> = [
  { id: 'agents', label: 'Agents', Icon: Bot },
  { id: 'tasks',  label: 'Tasks',  Icon: List },
  { id: 'stats',  label: 'Stats',  Icon: BarChart3 },
];

// ─── Workspace ────────────────────────────────────────────────────────────────

export const AgentsWorkspace: React.FC = () => {
  const { setBreadcrumbs, setPrimaryAction } = useLayout();
  const [selected, setSelected] = useState<AIAgent>(AGENTS[0]);
  const [search, setSearch]     = useState('');
  const [mobileTab, setMobileTab] = useState<MobileTab>('agents');

  useEffect(() => {
    setBreadcrumbs([{ label: 'AI Agents' }]);
    setPrimaryAction({
      label: 'Add Agent',
      icon:  <Sparkles className="w-4 h-4" />,
      onClick: () => undefined,
    });
    return () => setPrimaryAction(null);
  }, [setBreadcrumbs, setPrimaryAction]);

  const filtered = search.trim()
    ? AGENTS.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        ROLE_CONFIG[a.role].label.toLowerCase().includes(search.toLowerCase())
      )
    : AGENTS;

  const handleSelect = useCallback((agent: AIAgent) => {
    setSelected(agent);
    if (window.innerWidth < 768) setMobileTab('tasks');
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#09090F]">
      <AgentStatsBar />

      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-white/[0.05]">
        {MOBILE_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setMobileTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium transition-colors border-b-2 ${
              mobileTab === id
                ? 'text-[#8B5CF6] border-[#8B5CF6]'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Desktop layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left panel — agent list */}
        <div
          className={`${
            mobileTab !== 'agents' ? 'hidden md:flex' : 'flex'
          } flex-col w-full md:w-[300px] md:flex-shrink-0 border-r border-white/[0.05] bg-[#09090F]`}
        >
          {/* Search */}
          <div className="px-3 py-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2 bg-[#10101A] border border-white/[0.06] rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search agents…"
                className="flex-1 bg-transparent text-[12px] text-slate-300 placeholder-slate-600 outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
            {filtered.map(agent => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                selected={selected.id === agent.id}
                onSelect={() => handleSelect(agent)}
              />
            ))}
          </div>
        </div>

        {/* Right panel — agent detail */}
        <div
          className={`${
            mobileTab === 'agents' ? 'hidden md:flex' : 'flex'
          } flex-1 flex-col overflow-hidden bg-[#09090F]`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <AgentDetailPanel agent={selected} />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AgentsWorkspace;
