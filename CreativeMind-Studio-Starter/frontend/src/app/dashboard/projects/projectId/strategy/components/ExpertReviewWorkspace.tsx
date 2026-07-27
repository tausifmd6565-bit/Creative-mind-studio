import React, { useState } from 'react';
import type { Recommendation, ExpertRole } from '../types';
import { EXPERT_META } from '../types';
import {
  Check,
  RotateCw,
  Edit2,
  Lock,
  HelpCircle,
  Star,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ExpertReviewWorkspaceProps {
  recommendations: Recommendation[];
  activeExpertIndex: number;
  onSelectExpert: (index: number) => void;
  onAccept: (role: ExpertRole) => void;
  onRerun: (role: ExpertRole) => void;
  onEdit: (role: ExpertRole, newText: string) => void;
  isRerunning: boolean;
  onAllAccepted: () => void;
}

const EXPERT_ORDER: ExpertRole[] = ['creative', 'audience', 'marketing', 'risk', 'innovation'];

export const ExpertReviewWorkspace: React.FC<ExpertReviewWorkspaceProps> = ({
  recommendations,
  activeExpertIndex,
  onSelectExpert,
  onAccept,
  onRerun,
  onEdit,
  isRerunning,
  onAllAccepted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [transitioningRole, setTransitioningRole] = useState<string | null>(null);

  const currentRole = EXPERT_ORDER[activeExpertIndex] || 'creative';
  const currentRec = recommendations.find((r) => r.role === currentRole) || recommendations[0];

  const [editText, setEditText] = useState(currentRec?.editedText || currentRec?.text || '');
  const [userAnswer, setUserAnswer] = useState(currentRec?.userAnswer || '');
  const [selectedOption, setSelectedOption] = useState<string | undefined>(currentRec?.selectedOption);

  if (!currentRec) return null;

  const isAccepted = currentRec.status === 'accepted';
  const meta = EXPERT_META[currentRec.role] || { name: currentRec.name, icon: '🎬', title: 'Advisory Specialist' };

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    setUserAnswer(opt);
  };

  const handleSave = () => {
    onEdit(currentRec.role, editText);
    setIsEditing(false);
  };

  const handleAcceptCurrent = () => {
    onAccept(currentRec.role);
    setTransitioningRole(meta.name);

    setTimeout(() => {
      setTransitioningRole(null);
      if (activeExpertIndex < EXPERT_ORDER.length - 1) {
        onSelectExpert(activeExpertIndex + 1);
      } else {
        onAllAccepted();
      }
    }, 1200);
  };

  const renderStars = (rating: number = 4) => (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* ── Top Expert Step Bar ── */}
      <div className="bg-[#1A1D24] border border-white/[0.08] rounded-2xl p-3 shadow-md flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {EXPERT_ORDER.map((role, idx) => {
            const rec = recommendations.find((r) => r.role === role);
            const m = EXPERT_META[role];
            const isDone = rec?.status === 'accepted';
            const isCurrent = idx === activeExpertIndex;

            return (
              <button
                key={role}
                onClick={() => onSelectExpert(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#0F62FE] text-white border-[#4589FF] shadow-md shadow-blue-600/20'
                    : isDone
                    ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                    : 'bg-[#0F1115] text-slate-400 border-white/[0.08] hover:text-slate-200'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.name}</span>
                {isDone ? (
                  <Check size={13} className="text-green-400" strokeWidth={3} />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Step Navigation Arrows */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onSelectExpert(Math.max(0, activeExpertIndex - 1))}
            disabled={activeExpertIndex === 0}
            className="p-2 rounded-xl border border-white/[0.1] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous Expert"
          >
            <ArrowLeft size={14} />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-400 px-1">
            {activeExpertIndex + 1} / 5
          </span>
          <button
            onClick={() => onSelectExpert(Math.min(EXPERT_ORDER.length - 1, activeExpertIndex + 1))}
            disabled={activeExpertIndex === EXPERT_ORDER.length - 1}
            className="p-2 rounded-xl border border-white/[0.1] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next Expert"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Transition Flash Banner ── */}
      {transitioningRole && (
        <div className="p-3 bg-green-500/15 border border-green-500/30 rounded-xl text-center text-xs font-bold text-green-400 flex items-center justify-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          <span>{transitioningRole} Approved! Loading next specialist...</span>
        </div>
      )}

      {/* ── Main 2-Column Expert Review Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative">
        {/* Loading Overlay */}
        {isRerunning && (
          <div className="absolute inset-0 z-20 bg-[#0F1115]/85 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm">
            <RotateCw className="w-8 h-8 text-[#0F62FE] animate-spin mb-2" />
            <span className="text-xs font-bold text-slate-100">
              Granite AI is re-evaluating {meta.name}'s analysis...
            </span>
          </div>
        )}

        {/* ── LEFT COLUMN: AI Analysis ── */}
        <div className="bg-[#1A1D24] border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl shadow-inner">
                {meta.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-base">{meta.name}</h3>
                  {renderStars(currentRec.rating)}
                </div>
                <p className="text-xs text-[#4589FF] font-mono mt-0.5">{meta.title}</p>
              </div>
            </div>

            {currentRec.score && (
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#0F62FE]/15 text-[#4589FF] border border-[#0F62FE]/30">
                SCORE: {currentRec.score}
              </span>
            )}
          </div>

          {/* Verdict */}
          {currentRec.verdict && (
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-slate-200">
              <span className="text-[#0F62FE] font-bold mr-1">OVERALL VERDICT:</span>
              <span>{currentRec.verdict}</span>
            </div>
          )}

          {/* Strengths */}
          {currentRec.strengths && currentRec.strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-green-400 mb-1.5">
                <ThumbsUp size={13} />
                <span>Strengths</span>
              </div>
              <ul className="space-y-1 pl-1">
                {currentRec.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {currentRec.weaknesses && currentRec.weaknesses.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                <AlertTriangle size={13} />
                <span>Weaknesses & Risk Factors</span>
              </div>
              <ul className="space-y-1 pl-1">
                {currentRec.weaknesses.map((wkn, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{wkn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expert Recommendations */}
          {currentRec.suggestions && currentRec.suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#4589FF] mb-1.5">
                <Lightbulb size={13} />
                <span>Expert Recommendations</span>
              </div>
              <ul className="space-y-1 pl-1">
                {currentRec.suggestions.map((sug, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-[#4589FF] font-bold">→</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary Text */}
          <div className="pt-2 border-t border-white/[0.06]">
            <p className="text-xs text-slate-400 leading-relaxed bg-[#0F1115] p-3 rounded-xl border border-white/[0.05]">
              <span className="font-bold text-slate-200">Analysis Summary: </span>
              {currentRec.editedText || currentRec.text}
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: User Interaction & Actions ── */}
        <div className="bg-[#1A1D24] border border-white/[0.08] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Sparkles size={14} className="text-[#0F62FE]" />
                User Collaboration & Refinement
              </h4>
              {isAccepted && (
                <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                  <Lock size={12} />
                  Approved
                </span>
              )}
            </div>

            {/* Interactive Question */}
            {currentRec.question && (
              <div className="p-4 rounded-xl bg-[#0F62FE]/10 border border-[#0F62FE]/20 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4589FF]">
                  <HelpCircle size={15} />
                  <span>{meta.name}'s Question for You:</span>
                </div>
                <p className="text-xs text-slate-100 font-semibold">{currentRec.question}</p>

                {/* Multiple Choice Options */}
                {currentRec.options && currentRec.options.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {currentRec.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAccepted}
                          onClick={() => handleSelectOption(opt)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#0F62FE] border-[#4589FF] text-white shadow-md'
                              : isAccepted
                              ? 'bg-white/[0.02] border-white/[0.05] text-slate-400 cursor-not-allowed'
                              : 'bg-[#0F1115] border-white/[0.1] text-slate-300 hover:border-[#0F62FE]/50 hover:text-white'
                          }`}
                        >
                          <span className="flex-1">{opt}</span>
                          {isSelected && <CheckCircle2 size={15} className="text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Write-in Response Box */}
                {!isAccepted && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Or type custom instructions..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full bg-[#0F1115] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#0F62FE]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Editable Text Mode */}
            {isEditing && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Edit Expert Recommendation Summary</label>
                <textarea
                  className="w-full bg-[#0F1115] text-slate-100 p-3 rounded-xl border border-[#0F62FE] text-xs focus:outline-none min-h-[100px]"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-xs bg-[#0F62FE] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Edits
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          {!isAccepted && !isEditing && (
            <div className="space-y-2 pt-4 border-t border-white/[0.06]">
              <button
                onClick={handleAcceptCurrent}
                className="w-full py-3 px-4 bg-[#0F62FE] hover:bg-[#0043CE] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <Check size={16} />
                <span>Accept & Continue to Next Expert</span>
                <ArrowRight size={16} />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onRerun(currentRec.role)}
                  className="py-2.5 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCw size={13} />
                  <span>Re-run Analysis</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="py-2.5 px-3 border border-white/[0.1] text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit2 size={13} />
                  <span>Edit Summary</span>
                </button>
              </div>
            </div>
          )}

          {isAccepted && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center text-xs font-semibold text-green-400 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              <span>Recommendation Approved & Locked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
