/**
 * AnalyticsWorkspace.tsx — Cross-Project Analytics Workspace
 *
 * Aggregates performance data across all projects in the workspace.
 *
 * Desktop layout:
 *   TOP:    KPI summary row (total views, avg CTR, avg retention, total revenue)
 *   CENTER: 2/3 charts + 1/3 right panel (project breakdown)
 *   BOTTOM: platform performance + top content table
 *
 * Mobile: tabs — Overview | Projects | Platforms
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Minus,
  Eye, Share2, Clock, Target, ChevronDown,
  Activity, Globe, BarChart2, List,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { useLayout } from '../../../lib/useLayout';

// ─── Mock data ────────────────────────────────────────────────────────────────

const SUMMARY_KPIS = [
  { id: 'views',     label: 'Total Views',    value: '8.7M',  rawValue: 8_720_000, change: +28.4, unit: 'views',        color: '#8B5CF6' },
  { id: 'ctr',       label: 'Avg CTR',        value: '11.3%', rawValue: 11.3,      change: +1.8,  unit: '%',            color: '#10B981' },
  { id: 'retention', label: 'Avg Retention',  value: '54.2%', rawValue: 54.2,      change: -2.1,  unit: '%',            color: '#F59E0B' },
  { id: 'shares',    label: 'Total Shares',   value: '124K',  rawValue: 124_000,   change: +41.2, unit: 'shares',       color: '#06B6D4' },
  { id: 'watch',     label: 'Watch Hours',    value: '312K',  rawValue: 312_000,   change: +19.7, unit: 'hours',        color: '#EC4899' },
  { id: 'projects',  label: 'Live Projects',  value: '7',     rawValue: 7,         change: +2,    unit: 'projects',     color: '#F97316' },
];

const VIEWS_OVER_TIME = [
  { month: 'Jan', 'Brand Refresh': 320, 'Product Launch': 180, 'Viral Shorts': 420, 'Documentary': 95 },
  { month: 'Feb', 'Brand Refresh': 410, 'Product Launch': 230, 'Viral Shorts': 680, 'Documentary': 120 },
  { month: 'Mar', 'Brand Refresh': 380, 'Product Launch': 310, 'Viral Shorts': 920, 'Documentary': 180 },
  { month: 'Apr', 'Brand Refresh': 540, 'Product Launch': 490, 'Viral Shorts': 1100,'Documentary': 240 },
  { month: 'May', 'Brand Refresh': 620, 'Product Launch': 580, 'Viral Shorts': 1380,'Documentary': 290 },
  { month: 'Jun', 'Brand Refresh': 710, 'Product Launch': 640, 'Viral Shorts': 1520,'Documentary': 340 },
];

const PLATFORM_DATA = [
  { name: 'YouTube',   views: 3800, ctr: 13.1, retention: 62, color: '#EF4444' },
  { name: 'TikTok',    views: 2900, ctr: 9.8,  retention: 48, color: '#EC4899' },
  { name: 'Instagram', views: 1400, ctr: 11.2, retention: 44, color: '#F97316' },
  { name: 'LinkedIn',  views: 380,  ctr: 7.4,  retention: 71, color: '#3B82F6' },
  { name: 'Twitter',   views: 220,  ctr: 5.9,  retention: 38, color: '#06B6D4' },
];

const PIE_COLORS = ['#EF4444', '#EC4899', '#F97316', '#3B82F6', '#06B6D4'];

const TOP_CONTENT = [
  { rank: 1, title: 'Viral Shorts — Ep 12: 60s Hook Formula',  project: 'Viral Shorts Series',     views: '1.4M', ctr: '18.2%', retention: '71%', platform: 'TikTok',    status: 'published', color: '#F59E0B' },
  { rank: 2, title: 'Brand Refresh — Product Reveal',          project: 'Brand Refresh Campaign',  views: '920K', ctr: '14.8%', retention: '64%', platform: 'YouTube',   status: 'published', color: '#8B5CF6' },
  { rank: 3, title: 'Product Launch — Feature Demo',           project: 'Product Launch Video',    views: '640K', ctr: '12.1%', retention: '58%', platform: 'YouTube',   status: 'published', color: '#EC4899' },
  { rank: 4, title: 'Documentary — Episode 4 Teaser',          project: 'Documentary Series',      views: '340K', ctr: '10.4%', retention: '67%', platform: 'YouTube',   status: 'published', color: '#10B981' },
  { rank: 5, title: 'Social Campaign — Behind the Scenes',     project: 'Social Campaign Sprint',  views: '290K', ctr: '9.7%',  retention: '51%', platform: 'Instagram', status: 'review',    color: '#06B6D4' },
  { rank: 6, title: 'Influencer Series — Ep 2',                project: 'Influencer Series',       views: '180K', ctr: '8.3%',  retention: '44%', platform: 'TikTok',    status: 'in-progress', color: '#F97316' },
];

const PROJECT_BREAKDOWN = [
  { name: 'Viral Shorts',    views: '3.2M', ctr: '14.8%', health: 91, status: 'in-progress', color: '#F59E0B' },
  { name: 'Brand Refresh',   views: '2.1M', ctr: '12.4%', health: 84, status: 'in-progress', color: '#8B5CF6' },
  { name: 'Product Launch',  views: '1.4M', ctr: '11.2%', health: 78, status: 'review',      color: '#EC4899' },
  { name: 'Documentary',     views: '890K', ctr: '9.8%',  health: 72, status: 'published',   color: '#10B981' },
  { name: 'Social Campaign', views: '620K', ctr: '8.4%',  health: 65, status: 'draft',       color: '#06B6D4' },
  { name: 'Influencer',      views: '310K', ctr: '7.1%',  health: 58, status: 'in-progress', color: '#F97316' },
  { name: 'Year-End Recap',  views: '—',    ctr: '—',     health: 0,  status: 'draft',       color: '#84CC16' },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  published:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'in-progress':'text-blue-400   bg-blue-400/10   border-blue-400/20',
  review:      'text-amber-400  bg-amber-400/10  border-amber-400/20',
  draft:       'text-slate-400  bg-slate-500/10  border-slate-500/20',
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const CustomTooltip: React.FC<{ active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#151521] border border-white/[0.08] rounded-lg px-3 py-2.5 shadow-xl">
      <p className="text-[11px] text-slate-500 mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-[11px] text-slate-300">{p.name}:</span>
          <span className="text-[11px] font-semibold text-white">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiSummaryCard: React.FC<{
  label: string; value: string; change: number; color: string; index: number;
}> = ({ label, value, change, color, index }) => {
  const isUp   = change > 0;
  const isDown = change < 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 bg-[#10101A] border border-white/[0.06] rounded-xl px-4 py-3 min-w-[140px]"
    >
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[22px] font-display font-bold text-white leading-none mb-1.5" style={{ color }}>{value}</p>
      <div className={`inline-flex items-center gap-1 text-[11px] font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-500'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        {isUp ? '+' : ''}{change}%
        <span className="text-slate-600 font-normal">vs last month</span>
      </div>
    </motion.div>
  );
};

// ─── Charts ───────────────────────────────────────────────────────────────────

const CHART_COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

const ViewsOverTimeChart: React.FC = () => (
  <div className="bg-[#10101A] border border-white/[0.06] rounded-xl p-4 h-64">
    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3">Views by Project (000s)</p>
    <ResponsiveContainer width="100%" height="85%">
      <AreaChart data={VIEWS_OVER_TIME} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          {['Brand Refresh', 'Product Launch', 'Viral Shorts', 'Documentary'].map((key, i) => (
            <linearGradient key={key} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={CHART_COLORS[i]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={CHART_COLORS[i]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
        <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {['Brand Refresh', 'Product Launch', 'Viral Shorts', 'Documentary'].map((key, i) => (
          <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i]} strokeWidth={1.5} fill={`url(#grad-${i})`} dot={false} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const PlatformBreakdownChart: React.FC = () => (
  <div className="bg-[#10101A] border border-white/[0.06] rounded-xl p-4 h-64">
    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3">Views by Platform (K)</p>
    <ResponsiveContainer width="100%" height="85%">
      <BarChart data={PLATFORM_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
        <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="views" radius={[4, 4, 0, 0]}>
          {PLATFORM_DATA.map((entry, i) => (
            <Cell key={i} fill={PIE_COLORS[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// ─── Project breakdown panel ───────────────────────────────────────────────────

const ProjectBreakdownPanel: React.FC = () => (
  <div className="h-full overflow-y-auto px-4 py-4 space-y-3">
    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-1">Project Breakdown</p>
    {PROJECT_BREAKDOWN.map((proj, i) => (
      <motion.div
        key={proj.name}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.04, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#10101A] border border-white/[0.05] rounded-lg p-3 space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: proj.color }} />
            <span className="text-[12px] font-medium text-slate-200 truncate">{proj.name}</span>
          </div>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_BADGE[proj.status]}`}>
            {proj.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-600">Health</span>
              <span className="text-[10px] font-semibold" style={{ color: proj.health > 70 ? '#10B981' : proj.health > 50 ? '#F59E0B' : '#EF4444' }}>
                {proj.health > 0 ? `${proj.health}/100` : '—'}
              </span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${proj.health}%`, background: proj.color }}
              />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] font-semibold text-slate-200">{proj.views}</p>
            <p className="text-[10px] text-slate-600">views</p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// ─── Top content table ────────────────────────────────────────────────────────

const TopContentTable: React.FC = () => (
  <div className="bg-[#10101A] border border-white/[0.06] rounded-xl overflow-hidden">
    <div className="px-4 py-3 border-b border-white/[0.05]">
      <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Top Performing Content</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-white/[0.04]">
            {['#', 'Title', 'Project', 'Platform', 'Views', 'CTR', 'Retention', 'Status'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 uppercase tracking-widest whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TOP_CONTENT.map((item, i) => (
            <motion.tr
              key={item.rank}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-3 py-2.5 text-slate-600 font-mono">{item.rank}</td>
              <td className="px-3 py-2.5 text-slate-200 max-w-[220px]">
                <p className="truncate">{item.title}</p>
              </td>
              <td className="px-3 py-2.5">
                <span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${item.color}15`, color: item.color }}>
                  {item.project.replace(' Campaign', '').replace(' Series', '').replace(' Video', '')}
                </span>
              </td>
              <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{item.platform}</td>
              <td className="px-3 py-2.5 text-slate-200 font-semibold whitespace-nowrap">{item.views}</td>
              <td className="px-3 py-2.5 text-emerald-400 whitespace-nowrap">{item.ctr}</td>
              <td className="px-3 py-2.5 text-blue-400 whitespace-nowrap">{item.retention}</td>
              <td className="px-3 py-2.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_BADGE[item.status]}`}>
                  {item.status}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Mobile tab ───────────────────────────────────────────────────────────────

type MobileTab = 'overview' | 'projects' | 'platforms';

const MOBILE_TABS: Array<{ id: MobileTab; label: string; Icon: React.ElementType }> = [
  { id: 'overview',  label: 'Overview',  Icon: BarChart3  },
  { id: 'projects',  label: 'Projects',  Icon: Activity   },
  { id: 'platforms', label: 'Platforms', Icon: Globe      },
];

// ─── Workspace ────────────────────────────────────────────────────────────────

export const AnalyticsWorkspace: React.FC = () => {
  const { setBreadcrumbs, setPrimaryAction } = useLayout();
  const [mobileTab, setMobileTab] = useState<MobileTab>('overview');

  useEffect(() => {
    setBreadcrumbs([{ label: 'Analytics' }]);
    setPrimaryAction({
      label: 'Export Report',
      icon:  <BarChart2 className="w-4 h-4" />,
      onClick: () => undefined,
    });
    return () => setPrimaryAction(null);
  }, [setBreadcrumbs, setPrimaryAction]);

  return (
    <div className="flex flex-col h-full bg-[#09090F] overflow-hidden">

      {/* KPI summary row */}
      <div className="flex-shrink-0 overflow-x-auto border-b border-white/[0.05] px-4 py-3">
        <div className="flex items-center gap-3 min-w-max">
          {SUMMARY_KPIS.map((kpi, i) => (
            <KpiSummaryCard key={kpi.id} label={kpi.label} value={kpi.value} change={kpi.change} color={kpi.color} index={i} />
          ))}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-white/[0.05] flex-shrink-0">
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

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Center area */}
        <div
          className={`flex-1 overflow-y-auto ${
            mobileTab === 'projects' ? 'hidden md:block' : mobileTab === 'platforms' ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="px-4 py-4 space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <ViewsOverTimeChart />
              <PlatformBreakdownChart />
            </div>
            <TopContentTable />
          </div>
        </div>

        {/* Right panel */}
        <div
          className={`${
            mobileTab === 'projects' ? 'flex w-full' : mobileTab === 'platforms' ? 'hidden' : 'hidden lg:flex'
          } lg:w-[280px] lg:flex-shrink-0 flex-col border-l border-white/[0.05]`}
        >
          <ProjectBreakdownPanel />
        </div>

      </div>
    </div>
  );
};

export default AnalyticsWorkspace;
