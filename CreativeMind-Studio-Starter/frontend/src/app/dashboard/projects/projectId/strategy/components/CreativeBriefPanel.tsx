import React, { useState } from 'react';
import type { CreativeBrief } from '../types';
import { ArrowRight, Edit3, ChevronDown, ChevronUp, Sparkles, Check, Film } from 'lucide-react';

interface CreativeBriefPanelProps {
  brief: CreativeBrief;
  onUpdateBrief: (updates: Partial<CreativeBrief>) => void;
  frozen: boolean;
  onStartSession: () => void;
  isLoading: boolean;
}

export const CreativeBriefPanel: React.FC<CreativeBriefPanelProps> = ({
  brief,
  onUpdateBrief,
  frozen,
  onStartSession,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isStartDisabled = !brief.title.trim() || !brief.description.trim() || isLoading;

  const inputClass = `w-full bg-[#0F1115] border ${
    frozen ? 'border-transparent text-slate-400 opacity-70' : 'border-white/[0.1] text-slate-100'
  } rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0F62FE] transition-all`;

  const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdateBrief({ [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-[#1A1D24] border border-white/[0.08] rounded-xl px-4 py-2.5 shadow-md">
      {/* 1-Line Compact Header Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Project Info Pill */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-[#0F62FE]/15 border border-[#0F62FE]/30 flex items-center justify-center text-[#4589FF] flex-shrink-0">
            <Film size={14} />
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="text-xs font-bold text-slate-100 truncate">
              {brief.title || 'Untitled Idea'}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-400 truncate hidden md:inline">
              {brief.genre || 'Documentary'}
            </span>
            <span className="text-slate-600 hidden lg:inline">•</span>
            <span className="text-[11px] text-slate-400 truncate hidden lg:inline">
              {brief.platform || 'YouTube'}
            </span>
            {brief.duration && (
              <>
                <span className="text-slate-600 hidden xl:inline">•</span>
                <span className="text-[11px] font-mono text-[#4589FF] hidden xl:inline">
                  {brief.duration}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <Edit3 size={12} />
            <span className="hidden sm:inline">{isExpanded ? 'Close' : 'Edit Brief'}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {!frozen && (
            <button
              onClick={onStartSession}
              disabled={isStartDisabled}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0F62FE] hover:bg-[#0043CE] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-blue-600/20"
            >
              <Sparkles size={13} />
              <span>{isLoading ? 'Analyzing...' : 'Start AI Strategy Session'}</span>
              {!isLoading && <ArrowRight size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Brief Drawer */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Project Title</label>
              <input
                name="title"
                value={brief.title}
                onChange={handleChange}
                readOnly={frozen}
                placeholder="e.g. Iranian Revolution Documentary"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Target Audience</label>
              <input
                name="targetAudience"
                value={brief.targetAudience}
                onChange={handleChange}
                readOnly={frozen}
                placeholder="e.g. 18-35 documentary viewers"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>One-Line Idea & Concept</label>
            <textarea
              name="description"
              value={brief.description}
              onChange={handleChange}
              readOnly={frozen}
              rows={2}
              placeholder="Describe your creative concept..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <label className={labelClass}>Platform</label>
              <input
                name="platform"
                value={brief.platform}
                onChange={handleChange}
                readOnly={frozen}
                placeholder="e.g. YouTube"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Primary Goal</label>
              <input
                name="goal"
                value={brief.goal}
                onChange={handleChange}
                readOnly={frozen}
                placeholder="e.g. Awareness"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Genre</label>
              <input
                name="genre"
                value={brief.genre}
                onChange={handleChange}
                readOnly={frozen}
                placeholder="e.g. History"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Duration</label>
              <input
                name="duration"
                value={brief.duration}
                onChange={handleChange}
                readOnly={frozen}
                placeholder="e.g. 10-20 min"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 rounded-lg transition-all"
            >
              <Check size={12} />
              Save & Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
