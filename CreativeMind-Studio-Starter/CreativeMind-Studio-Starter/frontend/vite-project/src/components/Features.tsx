import React from "react";
import {
  BrainCircuit,
  Users2,
  Trophy,
  Radar,
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { GlassCard, SectionTitle } from "./UIElements";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
}

export const Features: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <BrainCircuit className="h-6 w-6 text-violet-400" />,
      title: "AI Strategy War Room",
      desc: "Four custom AI expert nodes (Creative, Marketing, Finance, and Technical advisors) analyze, debate, and structure your concept in real time.",
      tag: "CORE MATRIX",
    },
    {
      icon: <Users2 className="h-6 w-6 text-violet-400" />,
      title: "Focus Group Simulation",
      desc: "Injects simulated consumer segments, skeptics, and key demographics to pressure-test consumer appeal, pricing, and initial onboarding hurdles.",
      tag: "AUDIENCE SYNTH",
    },
    {
      icon: <Trophy className="h-6 w-6 text-violet-400" />,
      title: "Creative Scorecard",
      desc: "Instant quantitative diagnostic reports across viability, engagement, brand fit, and virality, backed by deep strategic rationales.",
      tag: "METRIC SYSTEM",
    },
    {
      icon: <Radar className="h-6 w-6 text-violet-400" />,
      title: "Trend Radar & Alignment",
      desc: "Scans active cultural markers, social media virality vectors, and search trends to align your project concept with immediate market demand.",
      tag: "RADAR GROUNDING",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-violet-400" />,
      title: "Virality Twin",
      desc: "Simulates initial social sharing mechanics. Predicts meme-ability, community trigger points, and organic marketing loops for self-reinforcing traction.",
      tag: "VIRAL SIMULATION",
    },
    {
      icon: <Layers className="h-6 w-6 text-violet-400" />,
      title: "Production Package",
      desc: "Prepares ready-to-run execution sheets including targeted go-to-market channels, branding tags, and a localized 30-day tactical calendar.",
      tag: "DEPLOYMENT SHEETS",
    },
  ];

  return (
    <section id="features" className="relative py-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute left-1/3 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-950/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Platform Capabilities"
          title="Designed for high-integrity ideas, not just drafts"
          description="A complete advisory suite built to validate business strategies, script pitches, narrative frameworks, and brand pivots prior to building."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {features.map((feature, idx) => (
            <GlassCard key={idx} className="flex flex-col justify-between group min-h-[220px]">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20 group-hover:border-violet-400 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <span className="font-mono text-[9px] font-bold text-violet-400 bg-violet-950/50 border border-violet-500/20 px-2 py-0.5 rounded">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-white group-hover:text-violet-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
              
              <div className="mt-4 flex items-center gap-1 text-[11px] font-mono text-gray-500 group-hover:text-violet-400 transition-colors duration-300">
                <span>Deploy Node</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};
