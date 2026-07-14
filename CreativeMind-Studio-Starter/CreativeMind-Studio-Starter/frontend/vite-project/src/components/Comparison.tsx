import React from "react";
import { motion } from "motion/react";
import { Check, X, BrainCircuit } from "lucide-react";
import { SectionTitle } from "./UIElements";

interface ComparisonRow {
  metric: string;
  traditional: string;
  creativeMind: string;
}

export const Comparison: React.FC = () => {
  const rows: ComparisonRow[] = [
    {
      metric: "Primary Objective",
      traditional: "Generates high volumes of draft text & copy",
      creativeMind: "Challenges concepts, verifies viability & stress-tests strategy",
    },
    {
      metric: "System Architecture",
      traditional: "Single-response standard prompt outputs",
      creativeMind: "Dynamic 4-expert agent panel debate & adversarial testing",
    },
    {
      metric: "Market Validation",
      traditional: "No target audience feedback loop",
      creativeMind: "Simulated Focus Groups matching targeted local buyer personas",
    },
    {
      metric: "Actionable Outputs",
      traditional: "Generic, non-contextual, template sentences",
      creativeMind: "Stress-tested tactical pivots, branding tags, and launch roadmaps",
    },
    {
      metric: "Output Density",
      traditional: "Slight structural bias, superficial descriptions",
      creativeMind: "Strict ethical alignment ratings, multi-faceted scorecard stats",
    },
  ];

  return (
    <section id="comparison" className="py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute right-10 bottom-0 h-80 w-80 rounded-full bg-violet-950/15 blur-3xl animate-pulse" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Market Differentiator"
          title="Creative Intelligence vs. Static Content Generation"
          description="Traditional AI makes it easy to generate noise. CreativeMind Studio makes it easy to find signal. Understand how we compare to conventional conversational models."
        />

        {/* Comparison Table */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-navy-950/40 backdrop-blur-md">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/10 bg-navy-950/80 px-6 py-4 font-display font-semibold text-sm text-white">
            <div className="text-gray-400">CORE ARCHITECTURE</div>
            <div className="mt-2 md:mt-0 flex items-center gap-2 text-rose-300 font-medium">
              <X className="h-4 w-4 text-rose-400" /> TRADITIONAL CHAT AI
            </div>
            <div className="mt-2 md:mt-0 flex items-center gap-2 text-violet-300 font-semibold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              <BrainCircuit className="h-4 w-4 text-violet-400" /> CREATIVEMIND STUDIO
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5 font-sans">
            {rows.map((row, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 px-6 py-5 gap-4 hover:bg-white/5 transition-colors duration-200"
              >
                {/* Metric Title */}
                <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  {row.metric}
                </div>

                {/* Traditional AI cell */}
                <div className="text-xs text-gray-400 flex items-start gap-2 leading-relaxed">
                  <X className="h-4 w-4 text-rose-500/50 shrink-0 mt-0.5" />
                  <span>{row.traditional}</span>
                </div>

                {/* CreativeMind Studio cell */}
                <div className="text-xs text-violet-200 flex items-start gap-2 font-medium leading-relaxed bg-violet-950/10 p-2 rounded-lg border border-violet-500/5">
                  <Check className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                  <span>{row.creativeMind}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
