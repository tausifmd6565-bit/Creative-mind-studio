/**
 * AI Agents page — placeholder workspace.
 */
import React, { useEffect } from 'react';
import { BotMessageSquare } from 'lucide-react';
import { useLayout } from '../../../lib/useLayout';

const AgentsPage: React.FC = () => {
  const { setBreadcrumbs, setPrimaryAction } = useLayout();

  useEffect(() => {
    setBreadcrumbs([{ label: 'AI Agents' }]);
    setPrimaryAction(null);
    return () => setPrimaryAction(null);
  }, [setBreadcrumbs, setPrimaryAction]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full px-6 py-20 text-center gap-4">
      <BotMessageSquare className="w-12 h-12 text-[#8B5CF6] opacity-60" />
      <h1 className="text-xl font-semibold text-slate-200">AI Agents</h1>
      <p className="text-sm text-slate-500 max-w-sm">
        Manage and monitor your AI agents. This workspace is coming soon.
      </p>
    </div>
  );
};

export default AgentsPage;
