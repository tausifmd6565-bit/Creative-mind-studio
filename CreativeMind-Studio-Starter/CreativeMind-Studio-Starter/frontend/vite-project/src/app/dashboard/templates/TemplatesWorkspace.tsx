/**
 * TemplatesWorkspace.tsx — Content Templates Library
 *
 * Desktop layout: LEFT (categories + filters) | CENTER (template grid)
 * Mobile: tabs — Browse | Saved
 *
 * Allows users to browse, preview, filter and use content templates.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Search, Star, StarOff, Zap, FileText, Video,
  Mic, Image, Globe, Layout, ChevronRight, Filter,
  Plus, BookOpen, Clock, CheckCircle2, Tag, Sparkles,
} from 'lucide-react';
import { useLayout } from '../../../lib/useLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentType = 'video' | 'short' | 'podcast' | 'article' | 'social' | 'series';
type Platform = 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'podcast' | 'blog';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  contentType: ContentType;
  platforms: Platform[];
  tags: string[];
  usageCount: number;
  rating: number;
  duration: string;
  structure: string[];
  aiGuided: boolean;
  saved: boolean;
  preview: string; // gradient CSS value
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  {
    id: 'tpl-1', title: 'Hook-Story-Offer', description: 'Proven 3-act structure for high-retention short-form content.',
    category: 'Short-Form', contentType: 'short', platforms: ['tiktok', 'instagram', 'youtube'],
    tags: ['hook', 'retention', 'conversion'], usageCount: 2840, rating: 4.9, duration: '15–60s',
    structure: ['8s Interrupt Hook', 'Story / Problem Agitation', 'Insight Reveal', 'CTA Payoff'],
    aiGuided: true, saved: true,
    preview: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  },
  {
    id: 'tpl-2', title: 'Viral Documentary Arc', description: 'Long-form documentary framework with 4-act emotional progression.',
    category: 'Long-Form', contentType: 'video', platforms: ['youtube'],
    tags: ['documentary', 'storytelling', 'emotional'], usageCount: 1120, rating: 4.8, duration: '10–30 min',
    structure: ['Hook & Stakes', 'Context & Characters', 'Conflict Escalation', 'Resolution & CTA'],
    aiGuided: true, saved: false,
    preview: 'linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)',
  },
  {
    id: 'tpl-3', title: 'Product Launch Reveal', description: 'Cinematic product reveal with tension build and feature showcase.',
    category: 'Brand', contentType: 'video', platforms: ['youtube', 'instagram'],
    tags: ['product', 'brand', 'launch'], usageCount: 890, rating: 4.7, duration: '2–5 min',
    structure: ['Teaser / Tension', 'Problem Statement', 'Product Reveal', 'Feature Deep-Dive', 'Social Proof', 'CTA'],
    aiGuided: true, saved: false,
    preview: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)',
  },
  {
    id: 'tpl-4', title: 'Thought Leadership Article', description: 'Data-driven thought leadership format for LinkedIn engagement.',
    category: 'Written', contentType: 'article', platforms: ['linkedin', 'blog'],
    tags: ['thought-leadership', 'b2b', 'expertise'], usageCount: 670, rating: 4.6, duration: '5–12 min read',
    structure: ['Bold Opening Claim', 'Data Point / Evidence', 'Counter-Argument', 'Framework / Model', 'Actionable Insight', 'Call-to-Discussion'],
    aiGuided: false, saved: false,
    preview: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  },
  {
    id: 'tpl-5', title: 'Podcast Interview Framework', description: 'Structured guest interview format with pre/mid/post hooks.',
    category: 'Audio', contentType: 'podcast', platforms: ['podcast'],
    tags: ['interview', 'guest', 'storytelling'], usageCount: 440, rating: 4.5, duration: '30–60 min',
    structure: ['Teaser Clip Hook', 'Guest Introduction', 'Origin Story', 'Core Expertise Deep-Dive', 'Controversial Take', 'Rapid Fire', 'CTA & Outro'],
    aiGuided: false, saved: true,
    preview: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  },
  {
    id: 'tpl-6', title: 'Educational Series Arc', description: 'Multi-episode educational series with consistent episode structure.',
    category: 'Series', contentType: 'series', platforms: ['youtube', 'tiktok'],
    tags: ['educational', 'series', 'tutorial'], usageCount: 1340, rating: 4.8, duration: '5–15 min / ep',
    structure: ['Episode Cold Open', 'Learning Objective', 'Core Lesson (3 parts)', 'Worked Example', 'Common Mistake', 'Episode Recap + Next Tease'],
    aiGuided: true, saved: false,
    preview: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  },
  {
    id: 'tpl-7', title: 'Social Media Story Pack', description: 'Instagram / TikTok Story arc for maximum swipe-up conversion.',
    category: 'Short-Form', contentType: 'social', platforms: ['instagram', 'tiktok'],
    tags: ['stories', 'conversion', 'social'], usageCount: 2100, rating: 4.7, duration: '15–45s / slide',
    structure: ['Slide 1: Scroll-Stopper', 'Slides 2–5: Story Build', 'Slide 6: Reveal', 'Slide 7: CTA + Link'],
    aiGuided: false, saved: false,
    preview: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
  },
  {
    id: 'tpl-8', title: 'Brand Manifesto Video', description: 'Brand purpose and values declaration for organic reach.',
    category: 'Brand', contentType: 'video', platforms: ['youtube', 'linkedin'],
    tags: ['brand', 'values', 'manifesto'], usageCount: 320, rating: 4.4, duration: '3–7 min',
    structure: ['Problem Statement (World)', 'Why We Exist', 'What We Believe', 'How We Work', 'Who We Serve', 'The Promise'],
    aiGuided: false, saved: false,
    preview: 'linear-gradient(135deg, #84CC16 0%, #3B82F6 100%)',
  },
];

const CATEGORIES = ['All', 'Short-Form', 'Long-Form', 'Brand', 'Written', 'Audio', 'Series'];

const CONTENT_TYPE_ICON: Record<ContentType, React.ElementType> = {
  video:   Video,
  short:   Zap,
  podcast: Mic,
  article: FileText,
  social:  Image,
  series:  BookOpen,
};

const CONTENT_TYPE_COLOR: Record<ContentType, string> = {
  video:   '#8B5CF6',
  short:   '#EC4899',
  podcast: '#10B981',
  article: '#3B82F6',
  social:  '#F97316',
  series:  '#F59E0B',
};

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube:   'YouTube',
  tiktok:    'TikTok',
  instagram: 'Instagram',
  linkedin:  'LinkedIn',
  podcast:   'Podcast',
  blog:      'Blog',
};

// ─── Template card ────────────────────────────────────────────────────────────

const TemplateCard: React.FC<{
  template: Template;
  selected: boolean;
  onSelect: () => void;
  index: number;
}> = ({ template, selected, onSelect, index }) => {
  const [saved, setSaved] = useState(template.saved);
  const Icon = CONTENT_TYPE_ICON[template.contentType];
  const color = CONTENT_TYPE_COLOR[template.contentType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border transition-all ${
        selected
          ? 'border-[#8B5CF6]/50 bg-[#1B1B2A]'
          : 'border-white/[0.06] bg-[#10101A] hover:border-white/[0.12] hover:bg-[#13131F]'
      }`}
    >
      {/* Thumbnail gradient strip */}
      <div className="h-24 rounded-t-xl relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: template.preview }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {template.aiGuided && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 border border-[#8B5CF6]/30 rounded-md px-1.5 py-0.5">
            <Sparkles className="w-3 h-3 text-[#9D6CFF]" />
            <span className="text-[10px] font-medium text-[#9D6CFF]">AI Guided</span>
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          {saved
            ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            : <StarOff className="w-3.5 h-3.5 text-slate-400" />
          }
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-white/60">{template.duration}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${color}18` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-100 leading-snug">{template.title}</p>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{template.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {template.platforms.map(p => (
            <span key={p} className="text-[10px] text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
              {PLATFORM_LABELS[p]}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[11px] text-slate-300">{template.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-slate-600" />
              <span className="text-[11px] text-slate-500">{template.usageCount.toLocaleString()}</span>
            </div>
          </div>
          <button className="flex items-center gap-1 text-[11px] text-[#9D6CFF] hover:text-white transition-colors font-medium">
            Use <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Template detail panel ────────────────────────────────────────────────────

const TemplateDetailPanel: React.FC<{ template: Template }> = ({ template }) => {
  const Icon = CONTENT_TYPE_ICON[template.contentType];
  const color = CONTENT_TYPE_COLOR[template.contentType];

  return (
    <div className="h-full overflow-y-auto px-5 py-5 space-y-5">
      {/* Header */}
      <div>
        <div className="h-32 rounded-xl mb-4 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: template.preview }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}30`, border: `1px solid ${color}50` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-[14px] leading-tight">{template.title}</h3>
              <p className="text-[11px] text-white/60">{template.category}</p>
            </div>
          </div>
        </div>
        <p className="text-[13px] text-slate-300 leading-relaxed">{template.description}</p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Rating',    value: `${template.rating}/5.0` },
          { label: 'Used',      value: template.usageCount.toLocaleString() },
          { label: 'Duration',  value: template.duration },
          { label: 'AI Guided', value: template.aiGuided ? 'Yes' : 'No' },
        ].map(m => (
          <div key={m.label} className="bg-[#10101A] border border-white/[0.05] rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{m.label}</p>
            <p className="text-[13px] font-semibold text-slate-100 mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Structure */}
      <div>
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">Structure</p>
        <div className="space-y-2">
          {template.structure.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold bg-[#151521] border border-white/[0.06] text-slate-500 flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-[12px] text-slate-300">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div>
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Platforms</p>
        <div className="flex flex-wrap gap-1.5">
          {template.platforms.map(p => (
            <span key={p} className="text-[11px] font-medium text-slate-300 bg-[#151521] border border-white/[0.08] px-2.5 py-1 rounded-lg">
              {PLATFORM_LABELS[p]}
            </span>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 text-[11px] text-[#9D6CFF] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
          bg-[#8B5CF6] hover:bg-[#7C3AED] border border-[#8B5CF6] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Use This Template
      </button>
    </div>
  );
};

// ─── Mobile tab ───────────────────────────────────────────────────────────────

type MobileTab = 'browse' | 'saved';

const MOBILE_TABS: Array<{ id: MobileTab; label: string; Icon: React.ElementType }> = [
  { id: 'browse', label: 'Browse', Icon: Layout },
  { id: 'saved',  label: 'Saved',  Icon: Star },
];

// ─── Workspace ────────────────────────────────────────────────────────────────

export const TemplatesWorkspace: React.FC = () => {
  const { setBreadcrumbs, setPrimaryAction } = useLayout();
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [selected, setSelected]     = useState<Template | null>(TEMPLATES[0]);
  const [mobileTab, setMobileTab]   = useState<MobileTab>('browse');
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Templates' }]);
    setPrimaryAction({
      label: 'Create Template',
      icon:  <Plus className="w-4 h-4" />,
      onClick: () => undefined,
    });
    return () => setPrimaryAction(null);
  }, [setBreadcrumbs, setPrimaryAction]);

  const filtered = TEMPLATES.filter(t => {
    const matchesSearch = !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = category === 'All' || t.category === category;
    const matchesMobile = mobileTab !== 'saved' || t.saved;
    return matchesSearch && matchesCat && matchesMobile;
  });

  const handleSelect = useCallback((t: Template) => {
    setSelected(t);
    setShowDetail(true);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#09090F] overflow-hidden">

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

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left: filter sidebar */}
        <div className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-white/[0.05]">
          <div className="px-3 py-3 border-b border-white/[0.05]">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Category</p>
            <div className="space-y-0.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                    category === cat
                      ? 'text-[#9D6CFF] bg-[#8B5CF6]/12'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="px-3 py-3">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Filters</p>
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input type="checkbox" className="accent-[#8B5CF6] w-3.5 h-3.5" />
              <span className="text-[12px] text-slate-400">AI Guided Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input type="checkbox" className="accent-[#8B5CF6] w-3.5 h-3.5" />
              <span className="text-[12px] text-slate-400">Saved Only</span>
            </label>
          </div>
        </div>

        {/* Center: template grid */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showDetail && selected ? 'hidden xl:flex' : 'flex'}`}>
          {/* Search */}
          <div className="px-4 py-3 border-b border-white/[0.05] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-[#10101A] border border-white/[0.06] rounded-lg px-3 py-2">
                <Search className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search templates, tags…"
                  className="flex-1 bg-transparent text-[12px] text-slate-300 placeholder-slate-600 outline-none"
                />
              </div>
              <div className="lg:hidden flex items-center gap-1.5 text-slate-500">
                <Filter className="w-4 h-4" />
                <span className="text-[12px]">{category}</span>
              </div>
            </div>
            {/* Mobile category row */}
            <div className="lg:hidden flex gap-2 mt-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 text-[11px] font-medium px-3 py-1 rounded-full border transition-colors ${
                    category === cat
                      ? 'text-[#9D6CFF] bg-[#8B5CF6]/15 border-[#8B5CF6]/30'
                      : 'text-slate-500 border-white/[0.08] hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-[11px] text-slate-600 mb-3">
              {filtered.length} template{filtered.length !== 1 ? 's' : ''}
              {category !== 'All' ? ` in ${category}` : ''}
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((tpl, i) => (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    selected={selected?.id === tpl.id}
                    onSelect={() => handleSelect(tpl)}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <Layers className="w-10 h-10 text-slate-700" />
                <p className="text-slate-400 text-[13px]">No templates match your search</p>
                <button onClick={() => { setSearch(''); setCategory('All'); }} className="text-[12px] text-[#9D6CFF] hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: template detail */}
        {selected && (
          <div className={`${showDetail ? 'flex w-full xl:w-[300px]' : 'hidden xl:flex xl:w-[300px]'} flex-col flex-shrink-0 border-l border-white/[0.05]`}>
            {/* Mobile back */}
            <div className="xl:hidden flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
              <button onClick={() => setShowDetail(false)} className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                Back
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 overflow-hidden"
              >
                <TemplateDetailPanel template={selected} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};

export default TemplatesWorkspace;
