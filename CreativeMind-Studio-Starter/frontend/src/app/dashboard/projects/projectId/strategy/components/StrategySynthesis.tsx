import React from 'react';
import type { FinalStrategy } from '../types';
import { Loader2, ArrowRight, FileCheck, Target, Sparkles, ShieldAlert, BarChart3, Rocket } from 'lucide-react';

interface StrategySynthesisProps {
  strategy: FinalStrategy | null;
  isGenerating: boolean;
  onApprove: () => void;
  isApproving: boolean;
}

export const StrategySynthesis: React.FC<StrategySynthesisProps> = ({
  strategy,
  isGenerating,
  onApprove,
  isApproving,
}) => {
  if (isGenerating || !strategy) {
    return (
      <div className="bg-[#1A1D24] border border-white/[0.08] rounded-2xl p-10 flex flex-col items-center justify-center min-h-[420px] text-center shadow-lg">
        <Loader2 className="w-10 h-10 text-[#0F62FE] animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-100">Synthesizing Creative Strategy Document...</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
          Consolidating recommendations from all 5 advisory board experts into an executive production plan.
        </p>
      </div>
    );
  }

  const Section = ({ icon: Icon, title, content }: { icon: any; title: string; content?: string }) => {
    if (!content) return null;
    return (
      <div className="p-4 rounded-xl bg-[#0F1115] border border-white/[0.06] space-y-1.5">
        <div className="flex items-center gap-2 text-[#4589FF]">
          <Icon size={15} />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pl-5">{content}</p>
      </div>
    );
  };

  return (
    <div className="bg-[#1A1D24] border border-white/[0.08] rounded-2xl flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F62FE]/15 border border-[#0F62FE]/30 flex items-center justify-center text-[#4589FF]">
            <FileCheck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Executive Strategy Report
            </h3>
            <p className="text-[11px] text-slate-400">Consolidated Advisory Board Plan</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20">
          READY FOR APPROVAL
        </span>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto flex-1 space-y-3.5 pr-2">
        <Section
          icon={Sparkles}
          title="Executive Summary"
          content={strategy.executiveSummary}
        />
        <Section
          icon={Target}
          title="Core Creative Vision & Story Angle"
          content={strategy.coreVision || strategy.storyAngle}
        />
        <Section
          icon={Target}
          title="Target Audience & Emotional Arc"
          content={strategy.targetAudience}
        />
        <Section
          icon={Sparkles}
          title="Creative Hook & Opening Scene"
          content={strategy.creativeHook}
        />
        <Section
          icon={BarChart3}
          title="Marketing & Platform Strategy"
          content={strategy.marketingStrategy}
        />
        <Section
          icon={Sparkles}
          title="Originality & Format Innovation"
          content={strategy.originalityAssessment}
        />
        <Section
          icon={ShieldAlert}
          title="Risks & Mitigation Plan"
          content={strategy.risksAndMitigations}
        />
        <Section
          icon={BarChart3}
          title="Key Success Metrics"
          content={strategy.keySuccessMetrics}
        />
        <Section
          icon={Rocket}
          title="Action Plan"
          content={strategy.actionPlan}
        />
      </div>

      {/* Footer Approve CTA */}
      <div className="p-5 border-t border-white/[0.06] bg-[#0F1115]/50 rounded-b-2xl">
        <button
          onClick={onApprove}
          disabled={isApproving}
          className="w-full bg-[#0F62FE] hover:bg-[#0043CE] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 text-sm"
        >
          {isApproving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Approving Strategy & Unlocking Research...
            </>
          ) : (
            <>
              Approve Strategy & Unlock Research
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
