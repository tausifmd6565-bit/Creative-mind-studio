import React from "react";
import { motion } from "motion/react";
import { Lightbulb, ShieldAlert, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { SectionTitle } from "./UIElements";

interface TimelineStep {
  label: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export const HowItWorks: React.FC = () => {
  const steps: TimelineStep[] = [
    {
      label: "Raw Idea",
      title: "Input Context",
      desc: "Input your rough pitch, market hypothesis, script concept, or startup idea into the secure war room launcher.",
      icon: <Lightbulb className="h-5 w-5 text-violet-400" />,
    },
    {
      label: "Strategy War Room",
      title: "Agent Advisory",
      desc: "Four specialized expert AI agent nodes (Creative, Marketing, Tech, Finance) challenge, debate, and structure your concept.",
      icon: <Zap className="h-5 w-5 text-violet-400" />,
    },
    {
      label: "Focus Group",
      title: "Candid Feedback",
      desc: "We build 3 custom simulated personas matching your target demographic to stress-test purchase intent and emotional friction.",
      icon: <Users className="h-5 w-5 text-violet-400" />,
    },
    {
      label: "Creative Scorecard",
      title: "Quantitative Stats",
      desc: "Receive weighted numeric scores across commercial viability, engagement, and brand alignment metrics with rationales.",
      icon: <TrendingUp className="h-5 w-5 text-violet-400" />,
    },
    {
      label: "Stress-Test Pivot",
      title: "Vulnerability Mitigation",
      desc: "Our engine maps critical bottlenecks and outputs 3 highly actionable pivot scenarios to optimize strategy.",
      icon: <ShieldAlert className="h-5 w-5 text-violet-400" />,
    },
    {
      label: "Production Package",
      title: "Execution Ready",
      desc: "Receive customized high-impact GTM launch channels, positioning tags, and a step-by-step 30-day tactical schedule.",
      icon: <Sparkles className="h-5 w-5 text-violet-400" />,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 overflow-hidden">
      {/* Glow effects */}
      <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-950/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Advisory Workflow"
          title="From Raw Hypotheses to Stress-Tested Launches"
          description="How CreativeMind Studio evaluates, breaks down, and refines your business and narrative concepts in under three minutes."
        />

        {/* Timeline Layout */}
        <div className="relative mt-16">
          {/* Connector line for large screens */}
          <div className="absolute top-[30px] left-8 right-8 hidden xl:block h-[2px] bg-gradient-to-r from-violet-600/10 via-violet-600/40 to-indigo-600/10" />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center xl:items-start text-center xl:text-left"
              >
                {/* Step circle */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-navy-950/80 shadow-md shadow-violet-500/10 hover:border-violet-400/50 hover:bg-violet-950/20 transition-all duration-300">
                  {step.icon}
                  <span className="absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 font-mono text-[9px] font-bold text-white border border-navy-950">
                    0{idx + 1}
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-wider block">
                    {step.label}
                  </span>
                  <h4 className="font-display text-sm font-semibold text-white">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs xl:max-w-none">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
