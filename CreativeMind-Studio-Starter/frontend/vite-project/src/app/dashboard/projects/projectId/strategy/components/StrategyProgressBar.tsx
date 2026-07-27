import React from 'react';
import type { StrategyPhase } from '../types';
import { Check } from 'lucide-react';

interface StrategyProgressBarProps {
  phase: StrategyPhase;
}

const STEPS = [
  { id: 'brief', label: '1 Brief' },
  { id: 'discussion', label: '2 Debate' },
  { id: 'recommendations', label: '3 Expert Reviews' },
  { id: 'synthesis', label: '4 Final Strategy' },
];

export const StrategyProgressBar: React.FC<StrategyProgressBarProps> = ({ phase }) => {
  const getStepIndex = (p: StrategyPhase) => {
    if (p === 'brief') return 0;
    if (p === 'discussion') return 1;
    if (p === 'recommendations') return 2;
    if (p === 'synthesis' || p === 'approved') return 3;
    return 0;
  };

  const currentIndex = getStepIndex(phase);

  return (
    <div className="flex items-center justify-between w-full max-w-xl mx-auto h-8 px-2">
      {STEPS.map((s, index) => {
        const isCompleted = index < currentIndex || phase === 'approved';
        const isActive = index === currentIndex && phase !== 'approved';
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={s.id}>
            {/* Step Node */}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-black'
                    : isActive
                    ? 'bg-[#0F62FE] text-white ring-4 ring-[#0F62FE]/20'
                    : 'bg-white/[0.05] text-slate-500 border border-white/[0.1]'
                }`}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : (index + 1)}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#4589FF]'
                    : isCompleted
                    ? 'text-green-400'
                    : 'text-slate-500'
                }`}
              >
                {s.label}
              </span>
            </div>

            {/* Line divider */}
            {!isLast && (
              <div className="flex-1 mx-3 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
