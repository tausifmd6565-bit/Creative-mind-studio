import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Leaf,
  Sparkles,
  TrendingUp,
  Activity,
  Zap,
  Globe
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { EvaluationResult, ExpertOpinion, FocusGroupPersona } from "../types";

interface HeroDashboardProps {
  data: EvaluationResult;
  isLoading?: boolean;
  loadingStep?: string;
}

export const HeroDashboard: React.FC<HeroDashboardProps> = ({
  data,
  isLoading = false,
  loadingStep = "",
}) => {
  const [activeTab, setActiveTab] = useState<"scorecard" | "debate" | "focus" | "pivot" | "package">("scorecard");

  // Recharts Data Prep
  const radarData = [
    { subject: "Viability", A: data.scorecard.viability, fullMark: 100 },
    { subject: "Virality", A: data.scorecard.virality, fullMark: 100 },
    { subject: "Engagement", A: data.scorecard.engagement, fullMark: 100 },
    { subject: "Feasibility", A: data.scorecard.feasibility, fullMark: 100 },
    { subject: "Brand Fit", A: data.scorecard.brandFit, fullMark: 100 },
  ];

  // const barData = [
  //   { name: "Viability", value: data.scorecard.viability },
  //   { name: "Virality", value: data.scorecard.virality },
  //   { name: "Engagement", value: data.scorecard.engagement },
  //   { name: "Feasibility", value: data.scorecard.feasibility },
  //   { name: "Brand Fit", value: data.scorecard.brandFit },
  // ];

  const getVerdictStyle = (verdict: string) => {
    switch (verdict.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
      case "NEEDS WORK":
        return "bg-amber-500/15 border-amber-500/30 text-amber-400";
      case "PIVOT":
        return "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400";
      default:
        return "bg-violet-500/15 border-violet-500/30 text-violet-400";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict.toUpperCase()) {
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "NEEDS WORK":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "neutral":
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      case "negative":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-950/80 p-1 backdrop-blur-xl shadow-2xl shadow-violet-900/10">
      {/* Top Console Bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-navy-950/60 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/60" />
            <span className="h-3 w-3 rounded-full bg-amber-500/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="ml-3 font-mono text-xs text-gray-500 uppercase tracking-wider">
            Creative Strategy War Room v2.5
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-medium font-mono text-violet-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
            </span>
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="min-h-[500px] lg:min-h-[550px] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy-950/90 p-8 text-center backdrop-blur-md"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-md animate-pulse" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-t-violet-500 border-r-transparent border-b-indigo-500 border-l-transparent"
                >
                  <Brain className="h-7 w-7 text-violet-400 animate-pulse" />
                </motion.div>
              </div>

              <motion.h4
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="font-display text-lg font-medium text-white"
              >
                Stress-Testing Idea...
              </motion.h4>
              <p className="mt-2 max-w-sm text-sm text-gray-400 font-mono">
                {loadingStep || "Initializing expert agent nodes..."}
              </p>

              {/* Console log simulation */}
              <div className="mt-6 w-full max-w-md rounded-lg border border-white/5 bg-navy-950/80 p-4 text-left font-mono text-[11px] text-violet-300/70 shadow-inner">
                <div className="flex gap-2">
                  <span className="text-gray-600">[info]</span>
                  <span>Dialing multi-agent debate grid...</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-gray-600">[info]</span>
                  <span>Ingesting Creative Scorecard templates...</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-emerald-500">[success]</span>
                  <span>Focus Group personas configured.</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-violet-400">[active]</span>
                  <span>Generating strategic pivot pathways...</span>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:divide-x lg:divide-white/5">
          {/* Dashboard Left Sidebar Tabs */}
          <div className="p-4 lg:p-6 space-y-1 lg:col-span-1">
            <div className="mb-4">
              <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-wider block">Target Concept</span>
              <h3 className="text-base font-display font-semibold text-white mt-1 line-clamp-1">
                {data.ideaName}
              </h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {data.tagline}
              </p>
            </div>

            <div className="h-px bg-white/5 my-4" />

            <div className="space-y-1">
              {([
                { id: "scorecard", label: "Creative Scorecard", icon: TrendingUp },
                { id: "debate", label: "Agent War Room", icon: Brain },
                { id: "focus", label: "Simulated Focus Group", icon: Users },
                { id: "pivot", label: "Stress-Test Pivot", icon: AlertTriangle },
                { id: "package", label: "Production Package", icon: Sparkles },
              ] as const).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-violet-600/15 text-violet-300 border border-violet-500/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : "text-gray-500"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Ethics Widget at bottom of left menu */}
            <div className="mt-8 rounded-xl border border-white/5 bg-navy-950/40 p-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Ethical Score</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-lg font-bold text-white">
                  {data.ethicalRating.score}/100
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {data.ethicalRating.label}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                {data.ethicalRating.analysis}
              </p>
            </div>
          </div>

          {/* Tab Viewer Area */}
          <div className="p-4 sm:p-6 lg:col-span-3 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === "scorecard" && (
                <motion.div
                  key="scorecard"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display text-lg font-semibold text-white">Creative Scorecard</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Quantitative analysis from multiple virtual strategy models.
                      </p>
                    </div>
                    <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-center">
                      <span className="block text-[10px] font-mono text-violet-400 uppercase">Average Score</span>
                      <span className="font-display text-xl font-bold text-white">
                        {data.scorecard.average}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Recharts Chart */}
                    <div className="h-[240px] w-full flex items-center justify-center bg-navy-950/20 rounded-xl border border-white/5 p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.06)" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "rgba(156, 163, 175, 0.9)", fontSize: 10, fontFamily: "Space Grotesk" }}
                          />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "rgba(156, 163, 175, 0.5)", fontSize: 8 }} />
                          <Radar
                            name="Idea Assessment"
                            dataKey="A"
                            stroke="#8b5cf6"
                            fill="#7c3aed"
                            fillOpacity={0.25}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Progress Bars Breakdown */}
                    <div className="space-y-4">
                      {[
                        { label: "Market Viability", val: data.scorecard.viability, color: "bg-violet-500" },
                        { label: "Organic Virality", val: data.scorecard.virality, color: "bg-indigo-500" },
                        { label: "User Engagement", val: data.scorecard.engagement, color: "bg-fuchsia-500" },
                        { label: "Technical Feasibility", val: data.scorecard.feasibility, color: "bg-cyan-500" },
                        { label: "Brand Premium Fit", val: data.scorecard.brandFit, color: "bg-purple-500" },
                      ].map((bar, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-300">{bar.label}</span>
                            <span className="font-mono font-semibold text-white">{bar.val}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${bar.val}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className={`h-full ${bar.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <h5 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      Strategic Rationale
                    </h5>
                    <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                      {data.scorecard.reasoning}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Agent War Room Debate */}
              {activeTab === "debate" && (
                <motion.div
                  key="debate"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h4 className="font-display text-lg font-semibold text-white">AI Expert Strategy Board</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Our specialized AI agents debate, challenge, and shape your creative concept.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.expertsDebate.map((expert: ExpertOpinion, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-xl border border-white/5 bg-navy-950/40 p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-white/5 h-10 w-10 flex items-center justify-center rounded-lg border border-white/10 shadow">
                              {expert.avatar}
                            </span>
                            <div>
                              <h5 className="text-sm font-display font-semibold text-white">
                                {expert.agentName}
                              </h5>
                              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wide">
                                STRATEGIC ADVISOR
                              </span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold font-mono ${getVerdictStyle(expert.verdict)}`}>
                            {getVerdictIcon(expert.verdict)}
                            {expert.verdict}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                          "{expert.comment}"
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Focus Group Simulation */}
              {activeTab === "focus" && (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h4 className="font-display text-lg font-semibold text-white">Simulated Focus Group</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Candid feedback simulated from high-fidelity target consumer personas.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {data.focusGroup.map((focus: FocusGroupPersona, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-xl border border-white/5 bg-navy-950/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 max-w-xl">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/20 font-display font-bold text-sm">
                            P{i + 1}
                          </span>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider">{focus.persona}</h5>
                              <span className="text-[10px] text-gray-400 font-mono">({focus.demographic})</span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">
                              "{focus.quote}"
                            </p>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center justify-between md:items-end gap-2 border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold font-mono ${getSentimentStyle(focus.sentiment)}`}>
                            {focus.sentiment} Sentiment
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400 font-mono">Interest:</span>
                            <span className="text-xs font-mono font-bold text-white">{focus.interestLevel}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stress-Test Pivot */}
              {activeTab === "pivot" && (
                <motion.div
                  key="pivot"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h4 className="font-display text-lg font-semibold text-white">Stress-Test & Strategic Pivot</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Identifying vulnerabilities and generating strategic course corrections before launch.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vulnerabilities */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-red-500/10 pb-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        <h5 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">Critical Flaws & Risks</h5>
                      </div>
                      <div className="space-y-2">
                        {data.stressTestPivot.vulnerabilities.map((vuln: string, i: number) => (
                          <div key={i} className="flex gap-2.5 rounded-lg border border-red-500/10 bg-red-500/5 p-3">
                            <span className="font-mono text-xs text-rose-400 font-bold shrink-0">0{i+1}.</span>
                            <p className="text-xs text-red-200/90 leading-relaxed">{vuln}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pivots */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-violet-500/10 pb-2">
                        <Zap className="h-4 w-4 text-violet-400" />
                        <h5 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">Pivot Suggestions</h5>
                      </div>
                      <div className="space-y-2">
                        {data.stressTestPivot.pivots.map((pivot: string, i: number) => (
                          <div key={i} className="flex gap-2.5 rounded-lg border border-violet-500/10 bg-violet-500/5 p-3">
                            <span className="font-mono text-xs text-violet-400 font-bold shrink-0">0{i+1}.</span>
                            <p className="text-xs text-violet-200/90 leading-relaxed">{pivot}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Production Package */}
              {activeTab === "package" && (
                <motion.div
                  key="package"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-lg font-semibold text-white">Production Launch Package</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Go-to-market plan, immediate execution steps, and positioning tags.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Audience & Tags */}
                    <div className="rounded-xl border border-white/5 bg-navy-950/40 p-4 space-y-4 md:col-span-1">
                      <div>
                        <span className="text-[10px] font-mono text-violet-400 font-bold uppercase block tracking-wider">Target Audience</span>
                        <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                          {data.productionPackage.targetAudience}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-violet-400 font-bold uppercase block tracking-wider mb-2">Creative Tags</span>
                        <div className="flex flex-wrap gap-1.5">
                          {data.productionPackage.brandingTags.map((tag: string, i: number) => (
                            <span key={i} className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] text-gray-300 font-mono">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Launch Channels */}
                    <div className="rounded-xl border border-white/5 bg-navy-950/40 p-4 space-y-3 md:col-span-1">
                      <span className="text-[10px] font-mono text-violet-400 font-bold uppercase block tracking-wider">GTM Launch Channels</span>
                      <div className="space-y-2 mt-2">
                        {data.productionPackage.launchChannels.map((channel: string, i: number) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                            <Globe className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                            <span>{channel}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Execution Steps */}
                    <div className="rounded-xl border border-white/5 bg-navy-950/40 p-4 space-y-3 md:col-span-1">
                      <span className="text-[10px] font-mono text-violet-400 font-bold uppercase block tracking-wider">Immediate Next Steps</span>
                      <div className="space-y-3 mt-2">
                        {data.productionPackage.executionSteps.map((step: string, i: number) => (
                          <div key={i} className="flex gap-2.5 text-xs">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-mono font-bold">
                              {i + 1}
                            </span>
                            <span className="text-gray-300 leading-normal">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
