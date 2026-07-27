import React from 'react';
import type { StrategyPhase } from '../types';
import { Bot, Loader2, CheckCircle2 } from 'lucide-react';

interface AiStatusPanelProps {
  phase: StrategyPhase;
  isProcessing: boolean;
}

export const AiStatusPanel: React.FC<AiStatusPanelProps> = ({ phase, isProcessing }) => {
  
  const getStatusContent = () => {
    if (phase === 'brief') {
      return {
        icon: <Bot className="w-12 h-12 text-[var(--color-primary-500)] mb-4" />,
        title: 'Ready to analyse',
        description: 'Complete the creative brief to begin the AI strategy session.'
      };
    }
    if (isProcessing || phase === 'discussion') {
      return {
        icon: <Loader2 className="w-12 h-12 text-[var(--color-secondary)] mb-4 animate-spin" />,
        title: 'Processing...',
        description: 'AI experts are analysing the brief and formulating a strategy.'
      };
    }
    return {
      icon: <CheckCircle2 className="w-12 h-12 text-[var(--color-success)] mb-4" />,
      title: 'Complete',
      description: 'The strategy session has concluded successfully.'
    };
  };

  const content = getStatusContent();

  return (
    <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center h-full text-center">
      {content.icon}
      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{content.title}</h3>
      <p className="text-[var(--color-text-secondary)] text-sm max-w-xs">
        {content.description}
      </p>
      
      {/* Fake Granite Logo Badge */}
      <div className="mt-12 px-3 py-1 bg-[var(--color-bg-base)] border border-white/10 rounded-full flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] animate-pulse" />
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider">IBM GRANITE POWERED</span>
      </div>
    </div>
  );
};
