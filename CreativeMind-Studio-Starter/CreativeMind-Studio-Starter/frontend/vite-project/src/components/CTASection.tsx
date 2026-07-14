import React from "react";
import { motion } from "motion/react";
import { Sparkles, Play } from "lucide-react";
import { GradientButton } from "./UIElements";

interface CTASectionProps {
  onStartSession?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onStartSession }) => {
  return (
    <section className="py-24 relative overflow-hidden bg-navy-900">
      {/* Background radial overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-950/40 px-3 py-1 text-xs font-medium tracking-wide text-violet-300 uppercase font-mono"
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          EXECUTION PREPARED
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl"
        >
          Ready to stress-test your next big creative idea?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base text-gray-400 leading-relaxed"
        >
          Stop building in silent isolation. Put your hypotheses through the simulated focus group and expert agent debate board today before deploying capital.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <GradientButton onClick={onStartSession} variant="primary" className="flex items-center gap-2 px-8 py-4 text-sm font-semibold">
            <Sparkles className="h-4.5 w-4.5" />
            Start Strategy Session
          </GradientButton>

          <GradientButton onClick={onStartSession} variant="outline" className="flex items-center gap-2 px-8 py-4 text-sm font-semibold">
            <Play className="h-4 w-4" />
            Try Preloaded Demo
          </GradientButton>
        </motion.div>

        {/* Footer Guarantee Subtext */}
        <p className="mt-6 text-xs text-gray-500 font-mono">
          NO CREDIT CARD REQUIRED • SECURE ADVISORY CLOUD • FULLY COMPLIANT SANDBOX
        </p>
      </div>
    </section>
  );
};
