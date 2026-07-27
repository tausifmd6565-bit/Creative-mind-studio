import React, { useEffect, useState } from 'react';
import type { ExpertMessage } from '../types';
import { EXPERT_META } from '../types';
import { Check, MessageSquare } from 'lucide-react';

interface LiveDiscussionProps {
  messages: ExpertMessage[];
  isComplete: boolean;
  onComplete: () => void;
}

export const LiveDiscussion: React.FC<LiveDiscussionProps> = ({ messages, isComplete, onComplete }) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < messages.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 750);
      return () => clearTimeout(timer);
    } else if (messages.length > 0 && visibleCount === messages.length && !isComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, messages.length, isComplete, onComplete]);

  return (
    <div className="bg-[#1A1D24] border border-white/[0.08] rounded-2xl p-5 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0F62FE]" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Live Creative Advisory Review
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {visibleCount}/{messages.length} Experts Spoken
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.slice(0, visibleCount).map((msg, idx) => {
          const meta = EXPERT_META[msg.role] || { name: msg.name, icon: '💬' };
          const reactionMeta = msg.reactsToRole ? EXPERT_META[msg.reactsToRole] : null;

          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0F1115] border border-white/[0.06] animate-in slide-in-from-bottom-2 fade-in duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-base flex-shrink-0">
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-xs">{meta.name}</span>
                    {reactionMeta && (
                      <span className="text-[10px] text-slate-400 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
                        replying to {reactionMeta.name}
                      </span>
                    )}
                  </div>
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{msg.message}</p>
              </div>
            </div>
          );
        })}

        {visibleCount === messages.length && messages.length > 0 && (
          <div className="text-center py-4 text-slate-400 text-xs font-mono tracking-widest uppercase animate-in fade-in duration-500">
            ━━━ Creative Review Meeting Complete ━━━
          </div>
        )}
      </div>
    </div>
  );
};
