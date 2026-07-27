/**
 * DashboardPage — the home workspace after login.
 *
 * Simplified MVP version: Header + KPI cards + Recent Projects (Continue Working)
 * + Activity Feed. Removed fake analytics, pipeline visualization, and AI agent
 * dashboards (they live inside the project workspace now).
 */
import React, { useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useLayout } from '../../lib/useLayout';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardHeader } from './components/DashboardHeader';
import { KpiCards } from './components/KPICards';
import { ContinueWorking } from './components/ContinueWorking';
import { ActivityFeed } from './components/ActivityFeed';

interface DashboardPageProps {
  onCreateProject?: () => void;
  onOpenProject?: (projectId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onCreateProject,
  onOpenProject,
}) => {
  const { setBreadcrumbs, setPrimaryAction } = useLayout();
  const { data, getAgentMessage: _getAgentMessage } = useDashboardData();

  const handleNewProject = useCallback(() => {
    onCreateProject?.();
  }, [onCreateProject]);

  // Set shell context
  useEffect(() => {
    setBreadcrumbs([{ label: 'Home' }]);
    setPrimaryAction({
      label: 'New Project',
      icon: <Plus className="w-3.5 h-3.5" />,
      onClick: handleNewProject,
    });
    return () => setPrimaryAction(null);
  }, [setBreadcrumbs, setPrimaryAction, handleNewProject]);

  return (
    <div className="w-full min-h-full px-6 md:px-8 py-8 pb-20 md:pb-10 space-y-8">
      {/* ── Greeting header ── */}
      <DashboardHeader
        userName={data.userName}
        workspaceName={data.workspaceName}
      />

      {/* ── KPI cards ── */}
      <KpiCards cards={data.kpis} />

      {/* ── Recent Projects (Continue Working) ── */}
      <ContinueWorking projects={data.recentProjects} onOpenProject={onOpenProject} />

      {/* ── Activity feed ── */}
      <ActivityFeed items={data.activity} />
    </div>
  );
};
