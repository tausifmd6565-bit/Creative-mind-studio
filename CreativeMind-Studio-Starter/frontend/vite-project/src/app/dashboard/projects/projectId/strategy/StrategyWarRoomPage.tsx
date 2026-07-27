/**
 * StrategyWarRoomPage.tsx — Guided Creative Review Meeting with 5 Experts
 *
 * 5 Advisory Board Specialists:
 *   1. Creative Director 🎬
 *   2. Audience Strategist 👥
 *   3. Marketing & Platform 📊
 *   4. Risk & Ethics Critic ⚠️
 *   5. Innovation Mentor 💡
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle2, Unlock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { apiClient } from '../../../../../lib/api/client';
import { PROJECTS } from '../../../../../lib/api/endpoints';
import { strategyService } from '../../../../../services/strategy.service';

import type {
  StrategyPhase,
  ExpertRole,
  ExpertMessage,
  Recommendation,
  FinalStrategy,
  CreativeBrief,
  DiscussionResult,
} from './types';

import { StrategyProgressBar } from './components/StrategyProgressBar';
import { CreativeBriefPanel } from './components/CreativeBriefPanel';
import { AiStatusPanel } from './components/AiStatusPanel';
import { LiveDiscussion } from './components/LiveDiscussion';
import { ExpertReviewWorkspace } from './components/ExpertReviewWorkspace';
import { StrategySynthesis } from './components/StrategySynthesis';

interface StrategyWarRoomPageProps {
  projectId: string;
  onBack: () => void;
  onContinueToResearch: () => void;
}

const EMPTY_BRIEF: CreativeBrief = {
  title: '',
  description: '',
  targetAudience: '',
  platform: '',
  goal: '',
  genre: '',
  tone: '',
  duration: '',
};

export const StrategyWarRoomPage: React.FC<StrategyWarRoomPageProps> = ({
  projectId,
  onBack,
  onContinueToResearch,
}) => {
  const [phase, setPhase] = useState<StrategyPhase>('brief');

  const [brief, setBrief] = useState<CreativeBrief>(EMPTY_BRIEF);
  const [discussion, setDiscussion] = useState<ExpertMessage[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [synthesis, setSynthesis] = useState<FinalStrategy | null>(null);

  const [activeExpertIndex, setActiveExpertIndex] = useState<number>(0);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDiscussionComplete, setIsDiscussionComplete] = useState(false);
  const [rerunningExpert, setRerunningExpert] = useState<ExpertRole | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      setLoadingProject(true);
      try {
        const resp = await apiClient.get<{
          id: string;
          title: string;
          raw_idea: string;
          niche?: string;
          format?: string;
          project_metadata?: Record<string, string>;
        }>(PROJECTS.detail(projectId));

        if (cancelled) return;

        const proj = resp.data;
        const meta = proj.project_metadata || {};

        setBrief({
          title: proj.title || '',
          description: proj.raw_idea || '',
          targetAudience: meta.targetAudience || '',
          platform: meta.platform || proj.format || '',
          goal: meta.primaryGoal || '',
          genre: proj.niche || '',
          tone: meta.tone || '',
          duration: meta.estimatedDuration || '',
        });
      } catch {
        // start with empty brief
      } finally {
        if (!cancelled) setLoadingProject(false);
      }
    }

    loadProject();
    return () => { cancelled = true; };
  }, [projectId]);

  const handleUpdateBrief = useCallback((updates: Partial<CreativeBrief>) => {
    setBrief((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleStartSession = useCallback(async () => {
    setError(null);
    setIsProcessing(true);
    setPhase('discussion');

    try {
      const rawRes = await strategyService.startDiscussion(projectId, brief);
      const result: DiscussionResult = (rawRes as any).data || rawRes;

      setDiscussion(result.discussion || []);
      const recs: Recommendation[] = (result.recommendations || []).map((r) => ({
        ...r,
        status: 'pending' as const,
      }));
      setRecommendations(recs);
      setActiveExpertIndex(0);
    } catch {
      setError('Failed to start AI strategy session. Please try again.');
      setPhase('brief');
    } finally {
      setIsProcessing(false);
    }
  }, [projectId, brief]);

  const handleDiscussionComplete = useCallback(() => {
    setIsDiscussionComplete(true);
    setPhase('recommendations');
    setIsTranscriptExpanded(false);
  }, []);

  const handleAccept = useCallback((role: ExpertRole) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.role === role ? { ...r, status: 'accepted' as const } : r))
    );
  }, []);

  const handleEdit = useCallback((role: ExpertRole, newText: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.role === role
          ? { ...r, text: newText, editedText: newText, status: 'accepted' as const }
          : r
      )
    );
  }, []);

  // Live Re-run with 1.5s buffering state for visual feedback
  const handleRerun = useCallback(
    async (role: ExpertRole) => {
      setRerunningExpert(role);
      setError(null);

      const startTime = Date.now();
      try {
        const accepted: Record<string, string> = {};
        recommendations.forEach((r) => {
          if (r.status === 'accepted') {
            accepted[r.role] = r.editedText || r.text;
          }
        });

        const rawResult = await strategyService.rerunExpert(projectId, role, brief, accepted);
        const parsedData = (rawResult as any).data || rawResult;

        const elapsed = Date.now() - startTime;
        if (elapsed < 1500) {
          await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
        }

        setRecommendations((prev) =>
          prev.map((r) => (r.role === role ? { ...r, ...parsedData, status: 'pending' as const } : r))
        );
      } catch {
        setError(`Failed to re-run ${role} evaluation. Please try again.`);
      } finally {
        setRerunningExpert(null);
      }
    },
    [projectId, brief, recommendations]
  );

  const allAccepted = useMemo(
    () => recommendations.length > 0 && recommendations.every((r) => r.status === 'accepted'),
    [recommendations]
  );

  const handleSynthesize = useCallback(async () => {
    setIsSynthesizing(true);
    setPhase('synthesis');

    try {
      const recsMap: Record<string, string> = {};
      recommendations.forEach((r) => {
        const optionNote = r.selectedOption ? ` (Selected Direction: ${r.selectedOption})` : '';
        const userNote = r.userAnswer ? ` (User Input: ${r.userAnswer})` : '';
        recsMap[r.role] = (r.editedText || r.text) + optionNote + userNote;
      });

      const rawResult = await strategyService.synthesize(projectId, brief, recsMap);
      const result = (rawResult as any).data || rawResult;
      setSynthesis(result);
    } catch {
      setError('Failed to synthesize strategy. Please try again.');
    } finally {
      setIsSynthesizing(false);
    }
  }, [projectId, brief, recommendations]);

  // Auto-trigger synthesis when all 5 experts are approved
  const handleAllAccepted = useCallback(() => {
    handleSynthesize();
  }, [handleSynthesize]);

  const handleApprove = useCallback(async () => {
    if (!synthesis) return;
    setIsApproving(true);

    try {
      await strategyService.approveStrategy(projectId, synthesis);
      setPhase('approved');
    } catch {
      setError('Failed to approve strategy. Please try again.');
    } finally {
      setIsApproving(false);
    }
  }, [projectId, synthesis]);

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F62FE]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-[#F1F5F9]">
      <StrategyProgressBar phase={phase} />

      {error && (
        <div className="px-6 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {phase === 'brief' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-2">
              <CreativeBriefPanel
                brief={brief}
                onUpdateBrief={handleUpdateBrief}
                frozen={false}
                onStartSession={handleStartSession}
                isLoading={isProcessing}
              />
            </div>
            <div>
              <AiStatusPanel phase={phase} isProcessing={isProcessing} />
            </div>
          </div>
        )}

        {(phase === 'discussion' || phase === 'recommendations') && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Brief Accordion Summary */}
            <div className="bg-[#1A1D24] border border-[#22262E] rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-base">{brief.title || 'Untitled Project'}</h3>
                <p className="text-xs text-[#94A3B8] line-clamp-1">{brief.description}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                {brief.platform && <span className="px-2 py-1 bg-[#22262E] rounded">{brief.platform}</span>}
                {brief.duration && <span className="px-2 py-1 bg-[#22262E] rounded">{brief.duration}</span>}
              </div>
            </div>

            {/* Collapsible Live AI Discussion Transcript */}
            <div className="bg-[#1A1D24] border border-[#22262E] rounded-xl overflow-hidden">
              <button
                onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                className="w-full px-4 py-3 bg-[#141820] hover:bg-[#1A1D24] flex items-center justify-between text-xs font-semibold text-[#94A3B8] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#0F62FE]" />
                  <span>5-EXPERT AI STRATEGY DEBATE STREAM ({discussion.length} MESSAGES)</span>
                </div>
                {isTranscriptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {(phase === 'discussion' || isTranscriptExpanded) && (
                <div className="p-4 border-t border-[#22262E]">
                  <LiveDiscussion
                    messages={discussion}
                    isComplete={isDiscussionComplete}
                    onComplete={handleDiscussionComplete}
                  />
                </div>
              )}
            </div>

            {/* Expert Review Workspace */}
            {phase === 'recommendations' && (
              <ExpertReviewWorkspace
                recommendations={recommendations}
                activeExpertIndex={activeExpertIndex}
                onSelectExpert={setActiveExpertIndex}
                onAccept={handleAccept}
                onRerun={handleRerun}
                onEdit={handleEdit}
                isRerunning={rerunningExpert !== null}
                onAllAccepted={handleAllAccepted}
              />
            )}
          </div>
        )}

        {(phase === 'synthesis' || phase === 'approved') && (
          <div className="max-w-4xl mx-auto">
            <StrategySynthesis
              strategy={synthesis}
              isGenerating={isSynthesizing}
              onApprove={handleApprove}
              isApproving={isApproving}
            />

            {phase === 'approved' && (
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Strategy Approved & Locked!</h3>
                <p className="text-sm text-[#94A3B8] max-w-md mx-auto mb-6">
                  Your strategy brief and 5-expert consensus report have been saved. The Research Desk is now unlocked!
                </p>
                <button
                  onClick={onContinueToResearch}
                  className="px-8 py-3 bg-[#0F62FE] hover:bg-[#0043CE] text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-[#0F62FE]/20"
                >
                  <span>Continue to Research Desk</span>
                  <Unlock className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
