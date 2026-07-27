/**
 * SettingsWorkspace.tsx — Workspace Settings
 *
 * Desktop layout: LEFT (nav sections) | CENTER (section content)
 * Mobile: dropdown nav or tabs
 *
 * Sections:
 *   Profile, Workspace, Team, Billing, Integrations, Notifications, Security
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, Users, CreditCard, Plug, Bell, Shield,
  Check, ChevronRight, Camera, Edit3, Trash2, Plus, Eye, EyeOff,
  Globe, Lock, Key, LogOut, AlertTriangle, CheckCircle2,
  Zap,
} from 'lucide-react';
import { useLayout } from '../../../lib/useLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsSection =
  | 'profile'
  | 'workspace'
  | 'team'
  | 'billing'
  | 'integrations'
  | 'notifications'
  | 'security';

interface NavItem {
  id: SettingsSection;
  label: string;
  Icon: React.ElementType;
  description: string;
  badge?: string;
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: 'profile',       label: 'Profile',        Icon: User,       description: 'Name, avatar, timezone' },
  { id: 'workspace',     label: 'Workspace',      Icon: Building2,  description: 'Name, branding, defaults' },
  { id: 'team',          label: 'Team',           Icon: Users,      description: 'Members, roles, capacity' },
  { id: 'billing',       label: 'Billing',        Icon: CreditCard, description: 'Plan, usage, invoices', badge: 'Pro' },
  { id: 'integrations',  label: 'Integrations',   Icon: Plug,       description: 'Connected platforms & APIs' },
  { id: 'notifications', label: 'Notifications',  Icon: Bell,       description: 'Alerts and digest settings' },
  { id: 'security',      label: 'Security',       Icon: Shield,     description: '2FA, sessions, API keys' },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="font-display text-[16px] font-semibold text-slate-100">{title}</h2>
    <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>
  </div>
);

const SettingsCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[#10101A] border border-white/[0.06] rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const SettingsRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}> = ({ label, description, children, danger }) => (
  <div className={`flex items-center justify-between gap-4 px-4 py-3.5 border-b border-white/[0.04] last:border-0 ${danger ? 'hover:bg-red-500/5' : 'hover:bg-white/[0.015]'} transition-colors`}>
    <div className="min-w-0">
      <p className={`text-[13px] font-medium ${danger ? 'text-red-400' : 'text-slate-200'}`}>{label}</p>
      {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, color = '#8B5CF6' }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? '' : 'bg-white/10'}`}
    style={checked ? { background: color } : {}}
  >
    <motion.span
      animate={{ x: checked ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
    />
  </button>
);

const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="bg-[#151521] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-slate-200 placeholder-slate-600 outline-none focus:border-[#8B5CF6]/50 transition-colors w-52"
  />
);

// ─── Sections ─────────────────────────────────────────────────────────────────

const ProfileSection: React.FC = () => {
  const [name, setName]  = useState('Wissale belala');
  const [email, setEmail] = useState('belalawissale@creativemind.io');
  const [title, setTitle] = useState('Workspace Owner');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Profile" description="Your personal account information visible to team members." />

      {/* Avatar */}
      <SettingsCard>
        <div className="p-5 flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white font-display font-bold text-xl">
              NS
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#151521] border border-white/[0.12] flex items-center justify-center hover:bg-[#1B1B2A] transition-colors">
              <Camera className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-200">Profile photo</p>
            <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG or GIF · max 5MB</p>
            <div className="flex items-center gap-2 mt-2">
              <button className="text-[11px] text-[#9D6CFF] hover:underline">Upload new</button>
              <span className="text-slate-700">·</span>
              <button className="text-[11px] text-slate-500 hover:text-slate-300">Remove</button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Fields */}
      <SettingsCard>
        <SettingsRow label="Display name" description="Visible to all workspace members">
          <TextInput value={name} onChange={setName} placeholder="Full name" />
        </SettingsRow>
        <SettingsRow label="Email address" description="Used for login and notifications">
          <TextInput value={email} onChange={setEmail} type="email" />
        </SettingsRow>
        <SettingsRow label="Job title" description="Shown on your member card">
          <TextInput value={title} onChange={setTitle} placeholder="Your role" />
        </SettingsRow>
      </SettingsCard>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
            saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
          }`}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const WorkspaceSection: React.FC = () => {
  const [wsName, setWsName]           = useState('Creative Studio · Nour');
  const [defaultPlatform, setDefault] = useState('YouTube');
  const [autoSave, setAutoSave]       = useState(true);
  const [aiAssist, setAiAssist]       = useState(true);

  return (
    <div className="space-y-5">
      <SectionTitle title="Workspace" description="Settings that apply to your entire workspace." />

      <SettingsCard>
        <SettingsRow label="Workspace name" description="Shown in the header and shared links">
          <TextInput value={wsName} onChange={setWsName} />
        </SettingsRow>
        <SettingsRow label="Default platform" description="Pre-selected when creating new projects">
          <select
            value={defaultPlatform}
            onChange={e => setDefault(e.target.value)}
            className="bg-[#151521] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-slate-200 outline-none focus:border-[#8B5CF6]/50"
          >
            {['YouTube', 'TikTok', 'Instagram', 'LinkedIn', 'Podcast'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </SettingsRow>
        <SettingsRow label="Auto-save" description="Save changes automatically every 30 seconds">
          <ToggleSwitch checked={autoSave} onChange={setAutoSave} />
        </SettingsRow>
        <SettingsRow label="AI Assistance" description="Show AI suggestions inline while editing">
          <ToggleSwitch checked={aiAssist} onChange={setAiAssist} />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard>
        <SettingsRow label="Workspace timezone" description="Used for scheduling and deadlines">
          <select className="bg-[#151521] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-slate-200 outline-none">
            <option>UTC+3 — Riyadh</option>
            <option>UTC+0 — London</option>
            <option>UTC−5 — New York</option>
          </select>
        </SettingsRow>
        <SettingsRow label="Language" description="Interface language">
          <select className="bg-[#151521] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-slate-200 outline-none">
            <option>English</option>
            <option>العربية</option>
          </select>
        </SettingsRow>
      </SettingsCard>
    </div>
  );
};

const BillingSection: React.FC = () => (
  <div className="space-y-5">
    <SectionTitle title="Billing & Plan" description="Manage your subscription and usage." />

    {/* Current plan */}
    <SettingsCard>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-bold text-[18px] text-white">Pro</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 text-[#9D6CFF]">Current Plan</span>
            </div>
            <p className="text-[12px] text-slate-400">$49 / month · billed monthly · renews Jul 14, 2025</p>
          </div>
          <button className="text-[12px] font-medium text-[#9D6CFF] hover:underline">Upgrade</button>
        </div>

        {/* Usage */}
        <div className="space-y-3">
          {[
            { label: 'AI Tokens',   used: 68, total: 100, unit: 'K' },
            { label: 'Projects',    used: 7,  total: 20,  unit: '' },
            { label: 'Team Seats',  used: 10, total: 15,  unit: '' },
            { label: 'Asset Storage', used: 4.2, total: 10, unit: 'GB' },
          ].map(r => (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-slate-400">{r.label}</span>
                <span className="text-[11px] text-slate-500">{r.used}{r.unit} / {r.total}{r.unit}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.used / r.total) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background: (r.used / r.total) > 0.85 ? '#EF4444' : (r.used / r.total) > 0.65 ? '#F59E0B' : '#8B5CF6',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsCard>

    {/* Payment & invoices */}
    <SettingsCard>
      <SettingsRow label="Payment method" description="Visa ending 4242 · expires 09/26">
        <button className="text-[12px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
          <Edit3 className="w-3.5 h-3.5" /> Update
        </button>
      </SettingsRow>
      <SettingsRow label="Billing email" description="nour.saleh@creativemind.io">
        <button className="text-[12px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
          <Edit3 className="w-3.5 h-3.5" /> Change
        </button>
      </SettingsRow>
      <SettingsRow label="Invoices" description="Download past invoices">
        <button className="text-[12px] font-medium text-[#9D6CFF] hover:underline flex items-center gap-1">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </SettingsRow>
    </SettingsCard>
  </div>
);

const IntegrationsSection: React.FC = () => {
  const [connected, setConnected] = useState<Record<string, boolean>>({
    youtube: true, tiktok: true, instagram: false, linkedin: false,
    notion: true, slack: false, zapier: false,
  });

  const INTEGRATIONS = [
    { id: 'youtube',   label: 'YouTube',   description: 'Publish and track video performance', color: '#EF4444' },
    { id: 'tiktok',    label: 'TikTok',    description: 'Schedule and publish short-form video', color: '#EC4899' },
    { id: 'instagram', label: 'Instagram', description: 'Reels, Stories and feed posts', color: '#F97316' },
    { id: 'linkedin',  label: 'LinkedIn',  description: 'Thought leadership and B2B content', color: '#3B82F6' },
    { id: 'notion',    label: 'Notion',    description: 'Sync research notes and briefs', color: '#F8FAFC' },
    { id: 'slack',     label: 'Slack',     description: 'Notifications and team alerts', color: '#4A154B' },
    { id: 'zapier',    label: 'Zapier',    description: 'Automate workflows via 5,000+ apps', color: '#FF4A00' },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Integrations" description="Connect your platforms and tools to CreativeMind Studio." />
      <SettingsCard>
        {INTEGRATIONS.map(int => (
          <SettingsRow
            key={int.id}
            label={int.label}
            description={int.description}
          >
            <button
              onClick={() => setConnected(c => ({ ...c, [int.id]: !c[int.id] }))}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                connected[int.id]
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25 hover:bg-emerald-400/5'
                  : 'text-slate-400 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]'
              }`}
            >
              {connected[int.id] ? <><CheckCircle2 className="w-3.5 h-3.5" /> Connected</> : <><Plus className="w-3.5 h-3.5" /> Connect</>}
            </button>
          </SettingsRow>
        ))}
      </SettingsCard>
    </div>
  );
};

const NotificationsSection: React.FC = () => {
  const [prefs, setPrefs] = useState({
    emailDigest:    true,
    agentAlerts:    true,
    deadlineRemind: true,
    teamMentions:   true,
    approvalReq:    true,
    publishConfirm: false,
    weeklyReport:   true,
    productUpdates: false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const rows = [
    { key: 'emailDigest',    label: 'Email Digest',         description: 'Daily summary of workspace activity' },
    { key: 'agentAlerts',    label: 'AI Agent Alerts',      description: 'Notify when an agent completes a task or needs input' },
    { key: 'deadlineRemind', label: 'Deadline Reminders',   description: '24h and 1h reminders before project deadlines' },
    { key: 'teamMentions',   label: 'Team Mentions',        description: 'When a team member mentions you in a comment' },
    { key: 'approvalReq',    label: 'Approval Requests',    description: 'When a review or approval is assigned to you' },
    { key: 'publishConfirm', label: 'Publish Confirmations', description: 'When content goes live on a platform' },
    { key: 'weeklyReport',   label: 'Weekly Performance Report', description: 'Aggregated analytics summary every Monday' },
    { key: 'productUpdates', label: 'Product Updates',     description: 'New features and changelog announcements' },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Notifications" description="Control how and when CreativeMind Studio notifies you." />
      <SettingsCard>
        {rows.map(r => (
          <SettingsRow key={r.key} label={r.label} description={r.description}>
            <ToggleSwitch
              checked={prefs[r.key as keyof typeof prefs]}
              onChange={() => toggle(r.key as keyof typeof prefs)}
            />
          </SettingsRow>
        ))}
      </SettingsCard>
    </div>
  );
};

const SecuritySection: React.FC = () => {
  const [twoFa, setTwoFa]         = useState(false);
  const [showKey, setShowKey]     = useState(false);

  return (
    <div className="space-y-5">
      <SectionTitle title="Security" description="Manage authentication, sessions, and API keys." />

      <SettingsCard>
        <SettingsRow label="Two-factor authentication" description="Adds an extra layer of security at login">
          <ToggleSwitch checked={twoFa} onChange={setTwoFa} color="#10B981" />
        </SettingsRow>
        <SettingsRow label="Password" description="Last changed 3 months ago">
          <button className="text-[12px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            <Key className="w-3.5 h-3.5" /> Change
          </button>
        </SettingsRow>
        <SettingsRow label="Active sessions" description="2 active sessions (this device + 1 other)">
          <button className="text-[12px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            <Globe className="w-3.5 h-3.5" /> Manage
          </button>
        </SettingsRow>
      </SettingsCard>

      {/* API Key */}
      <SettingsCard>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-200">API Key</p>
              <p className="text-[11px] text-slate-500 mt-0.5">For backend integrations and automations</p>
            </div>
            <button
              onClick={() => setShowKey(s => !s)}
              className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-white transition-colors"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-[#0B0B12] border border-white/[0.06] rounded-lg px-3 py-2 font-mono text-[11px] text-slate-400">
            {showKey ? 'cms_sk_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890' : '•'.repeat(42)}
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[12px] font-medium text-[#9D6CFF] hover:underline">Copy key</button>
            <span className="text-slate-700">·</span>
            <button className="text-[12px] font-medium text-amber-400 hover:underline flex items-center gap-1">
              <Zap className="w-3 h-3" /> Regenerate
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* Danger zone */}
      <div>
        <p className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest mb-2">Danger Zone</p>
        <SettingsCard>
          <SettingsRow label="Sign out of all devices" description="Terminates all active sessions immediately" danger>
            <button className="flex items-center gap-1.5 text-[12px] font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg hover:bg-red-400/20 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out All
            </button>
          </SettingsRow>
          <SettingsRow label="Delete workspace" description="Permanently removes all data. This cannot be undone." danger>
            <button className="flex items-center gap-1.5 text-[12px] font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg hover:bg-red-400/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </SettingsRow>
        </SettingsCard>
      </div>
    </div>
  );
};

// ─── Section renderer ─────────────────────────────────────────────────────────

const SECTION_CONTENT: Record<SettingsSection, React.ReactNode> = {
  profile:       <ProfileSection />,
  workspace:     <WorkspaceSection />,
  team:          <div className="py-4 text-center text-slate-500 text-[13px]">Team settings are managed in the <span className="text-[#9D6CFF]">Team workspace</span>.</div>,
  billing:       <BillingSection />,
  integrations:  <IntegrationsSection />,
  notifications: <NotificationsSection />,
  security:      <SecuritySection />,
};

// ─── Workspace ────────────────────────────────────────────────────────────────

export const SettingsWorkspace: React.FC = () => {
  const { setBreadcrumbs, setPrimaryAction } = useLayout();
  const [active, setActive] = useState<SettingsSection>('profile');

  useEffect(() => {
    setBreadcrumbs([{ label: 'Settings' }]);
    setPrimaryAction(null);
    return () => setPrimaryAction(null);
  }, [setBreadcrumbs, setPrimaryAction]);

  const handleSelect = useCallback((id: SettingsSection) => setActive(id), []);

  return (
    <div className="flex h-full bg-[#09090F] overflow-hidden">

      {/* Left nav */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-white/[0.05] py-4">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-4 mb-2">Settings</p>
        {NAV_ITEMS.map(item => {
          const { Icon } = item;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 w-full text-left transition-colors ${
                isActive
                  ? 'bg-[#8B5CF6]/10 text-[#9D6CFF]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-[13px] font-medium flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#9D6CFF] border border-[#8B5CF6]/25">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile top nav */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-10 overflow-x-auto flex border-b border-white/[0.05] bg-[#09090F]">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleSelect(item.id)}
            className={`flex-shrink-0 px-3 py-2.5 text-[11px] font-medium border-b-2 transition-colors ${
              active === item.id
                ? 'text-[#9D6CFF] border-[#8B5CF6]'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 mt-10 md:mt-0">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {SECTION_CONTENT[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default SettingsWorkspace;
