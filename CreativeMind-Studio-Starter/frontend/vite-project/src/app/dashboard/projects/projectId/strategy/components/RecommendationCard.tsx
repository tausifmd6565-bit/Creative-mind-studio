import React, { useState } from 'react';
import type { Recommendation, ExpertRole } from '../types';
import { EXPERT_META } from '../types';
import { Check, RotateCw, Edit2, Lock, HelpCircle, Star, ThumbsUp, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: (role: ExpertRole) => void;
  onRerun: (role: ExpertRole) => void;
  onEdit: (role: ExpertRole, newText: string) => void;
  isRerunning: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onRerun,
  onEdit,
  isRerunning,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(recommendation.editedText || recommendation.text);
  const [userAnswer, setUserAnswer] = useState(recommendation.userAnswer || '');
  const [selectedOption, setSelectedOption] = useState<string | undefined>(recommendation.selectedOption);

  const isAccepted = recommendation.status === 'accepted';
  const meta = EXPERT_META[recommendation.role] || { name: recommendation.name, icon: '🎬', title: 'Advisory Specialist' };

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    setUserAnswer(opt);
  };

  const handleSave = () => {
    onEdit(recommendation.role, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(recommendation.editedText || recommendation.text);
    setIsEditing(false);
  };

  const renderStars = (rating: number = 4) => {
    return (
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
  };

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 ${
        isAccepted
          ? 'bg-[#0F1115] border-green-500/20 shadow-lg shadow-green-500/5'
          : 'bg-[#1A1D24] border-white/[0.08] hover:border-[#0F62FE]/30'
      }`}
    >
      {/* Loading Overlay when re-running */}
      {isRerunning && (
        <div className="absolute inset-0 z-20 bg-[#0F1115]/80 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm">
          <RotateCw className="w-8 h-8 text-[#0F62FE] animate-spin mb-2" />
          <span className="text-xs font-semibold text-slate-200">Re-evaluating creative brief...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl shadow-inner">
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-100 text-sm">{meta.name}</h4>
              {renderStars(recommendation.rating)}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{meta.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {recommendation.score && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#0F62FE]/15 text-[#4589FF] border border-[#0F62FE]/30">
              {recommendation.score}
            </span>
          )}
          {isAccepted && (
            <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
              <Check className="w-3 h-3" />
              ACCEPTED
            </span>
          )}
        </div>
      </div>

      {/* Verdict Statement */}
      {recommendation.verdict && (
        <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-slate-200 flex items-center gap-2">
          <span className="text-[#0F62FE] font-bold">VERDICT:</span>
          <span>{recommendation.verdict}</span>
        </div>
      )}

      {/* Strengths */}
      {recommendation.strengths && recommendation.strengths.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-green-400 mb-1.5">
            <ThumbsUp size={12} />
            <span>Strengths</span>
          </div>
          <ul className="space-y-1">
            {recommendation.strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 pl-1">
                <span className="text-green-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {recommendation.weaknesses && recommendation.weaknesses.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">
            <AlertTriangle size={12} />
            <span>Weaknesses / Risk Factors</span>
          </div>
          <ul className="space-y-1">
            {recommendation.weaknesses.map((wkn, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 pl-1">
                <span className="text-amber-400 font-bold">•</span>
                <span>{wkn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {recommendation.suggestions && recommendation.suggestions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#4589FF] mb-1.5">
            <Lightbulb size={12} />
            <span>Expert Recommendations</span>
          </div>
          <ul className="space-y-1">
            {recommendation.suggestions.map((sug, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 pl-1">
                <span className="text-[#4589FF] font-bold">→</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Question for the User with Multiple-Choice Options */}
      {recommendation.question && (
        <div className="mb-4 p-4 rounded-xl bg-[#0F62FE]/10 border border-[#0F62FE]/20 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4589FF]">
            <HelpCircle size={14} />
            <span>Interactive Question for You:</span>
          </div>
          <p className="text-xs text-slate-200 font-semibold">{recommendation.question}</p>

          {/* Multiple-choice option buttons */}
          {recommendation.options && recommendation.options.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {recommendation.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAccepted}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#0F62FE] border-[#4589FF] text-white shadow-md'
                        : isAccepted
                        ? 'bg-white/[0.02] border-white/[0.05] text-slate-400 cursor-not-allowed'
                        : 'bg-[#0F1115] border-white/[0.1] text-slate-300 hover:border-[#0F62FE]/50 hover:text-white'
                    }`}
                  >
                    <span className="flex-1">{opt}</span>
                    {isSelected && <CheckCircle2 size={14} className="text-white flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Optional write-in response input */}
          {!isAccepted && (
            <div className="pt-1">
              <input
                type="text"
                placeholder="Or type custom refinement instructions..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full bg-[#0F1115] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#0F62FE]"
              />
            </div>
          )}
        </div>
      )}

      {/* Editable summary text or view mode */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            className="w-full bg-[#0F1115] text-slate-100 p-3 rounded-xl border border-[#0F62FE] text-xs focus:outline-none min-h-[90px]"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={handleCancel}
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
      ) : (
        <div className="text-xs text-slate-400 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] mb-4 leading-relaxed">
          <span className="font-semibold text-slate-300">Summary: </span>
          {recommendation.editedText || recommendation.text}
        </div>
      )}

      {/* Action Buttons */}
      {!isAccepted && !isEditing && (
        <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => onAccept(recommendation.role)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Check className="w-4 h-4" />
            Accept Recommendation
          </button>
          <button
            onClick={() => onRerun(recommendation.role)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#0F62FE]/15 text-[#4589FF] hover:bg-[#0F62FE] hover:text-white border border-[#0F62FE]/30 rounded-xl text-xs font-semibold transition-all"
            title="Re-run AI evaluation for this expert"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Re-run
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl text-xs font-semibold transition-all"
            title="Edit summary manually"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      )}

      {isAccepted && (
        <div className="flex items-center justify-center gap-2 pt-2 text-slate-500 text-xs font-medium border-t border-white/[0.06]">
          <Lock className="w-3.5 h-3.5 text-green-400" />
          <span>Accepted & Locked for Strategy Synthesis</span>
        </div>
      )}
    </div>
  );
};
