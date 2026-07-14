import React from "react";
import { motion } from "motion/react";
import { AlertCircle, EyeOff, HelpCircle, ShieldAlert, TrendingDown } from "lucide-react";
import { SectionTitle } from "./UIElements";

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: <EyeOff className="h-5 w-5 text-rose-400" />,
      title: "Confirmational Creative Bias",
      description: "Creators fall in love with their initial ideas too quickly, ignoring subtle flaws and audience mismatches until after significant capital is deployed.",
    },
    {
      icon: <HelpCircle className="h-5 w-5 text-rose-400" />,
      title: "Audience Sentiment Blindspots",
      description: "Launching without validating how diverse consumer segments, skeptics, and key demographics will react, leading to silent product rejections.",
    },
    {
      icon: <ShieldAlert className="h-5 w-5 text-rose-400" />,
      title: "Unmitigated Execution Risks",
      description: "Failing to evaluate resource limitations, technical complexities, or regulatory blockages early on, resulting in mid-build abandonments.",
    },
    {
      icon: <TrendingDown className="h-5 w-5 text-rose-400" />,
      title: "Monetization Mismatch",
      description: "Integrating business models that mismatch the core value proposition or overestimating price tolerance in highly competitive, saturated markets.",
    },
  ];

  return (
    <section id="problem" className="relative py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-72 w-72 rounded-full bg-rose-950/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="The Ideation Crisis"
          title="Why 90% of brilliant creative concepts fail before launch"
          description="Most failures aren't due to poor execution, but from starting with unvalidated, un-stress-tested premises. Traditional AI generates cheap copy; it doesn't challenge your strategy."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {problems.map((problem, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-rose-500/10 bg-gradient-to-b from-rose-950/10 to-navy-950/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-rose-500/20 hover:shadow-lg hover:shadow-rose-950/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 mb-4">
                {problem.icon}
              </div>
              <h4 className="font-display text-base font-semibold text-white">
                {problem.title}
              </h4>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Supporting stat card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 rounded-2xl border border-white/5 bg-navy-950/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex gap-4 items-start max-w-xl">
            <AlertCircle className="h-6 w-6 text-violet-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-display text-base font-semibold text-white">
                "The blind spot is always in what you take for granted."
              </h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Traditional generative tools create drafts but don't challenge assumptions. CreativeMind Studio acts as an adversarial advisor, pointing out vulnerabilities while offering structured pivots.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-center md:text-right">
            <span className="font-mono text-xs text-violet-400 font-bold block">INDUSTRY AVERAGE</span>
            <span className="font-display text-3xl font-extrabold text-white">$45K+</span>
            <span className="text-[10px] text-gray-500 block font-mono">LOST PER UNVALIDATED PRODUCT ATTEMPT</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
