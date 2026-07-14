import React from "react";
import { motion } from "motion/react";
import { Award, ShieldAlert, Sparkles, Zap } from "lucide-react";

interface StatItemProps {
  value: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, sublabel, icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative flex flex-col justify-between rounded-2xl border border-white/5 bg-navy-950/40 p-6 backdrop-blur-md"
    >
      <div className="absolute top-4 right-4 text-violet-500/40">
        {icon}
      </div>
      <div>
        <span className="font-mono text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
          {value}
        </span>
        <h4 className="mt-2 font-display text-base font-semibold text-white">
          {label}
        </h4>
        <p className="mt-1 text-xs text-gray-400 font-mono">
          {sublabel}
        </p>
      </div>
    </motion.div>
  );
};

export const Statistics: React.FC = () => {
  const stats = [
    {
      value: "10K+",
      label: "Ideas Evaluated",
      sublabel: "STRESS-TESTED WORLDWIDE",
      icon: <Award className="h-5 w-5" />,
    },
    {
      value: "94%",
      label: "Strategy Confidence",
      sublabel: "PREDICTIVE ACCURACY RATIO",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      value: "7",
      label: "AI Expert Agents",
      sublabel: "DIVERGENT DEBATING MODELS",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      value: "3 Min",
      label: "Average Analysis",
      sublabel: "REALTIME WAR ROOM DURATION",
      icon: <Zap className="h-5 w-5" />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-y border-white/5 bg-navy-950/20 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <StatItem
          key={idx}
          value={stat.value}
          label={stat.label}
          sublabel={stat.sublabel}
          icon={stat.icon}
          delay={idx * 0.1}
        />
      ))}
    </div>
  );
};
