import React from "react";
import { motion } from "motion/react";
import {
  Code2,
  Wind,
  Shuffle,
  BarChart3,
  Search,
  Cpu
} from "lucide-react";
import { SectionTitle } from "./UIElements";

interface TechItem {
  icon: React.ReactNode;
  name: string;
  version: string;
  desc: string;
  role: string;
}

export const TechnologySection: React.FC = () => {
  const stack: TechItem[] = [
    {
      icon: <Code2 className="h-5 w-5 text-cyan-400" />,
      name: "React Framework",
      version: "v19.0",
      desc: "Powers our component lifecycle, state orchestration, and modern server-client synchronization flows.",
      role: "REACTIVE CORE",
    },
    {
      icon: <Wind className="h-5 w-5 text-sky-400" />,
      name: "Tailwind CSS",
      version: "v4.0",
      desc: "Delivers fluid utility-first layout bindings, custom typography styling, and micro-interaction behaviors.",
      role: "STYLESHEET MATRIX",
    },
    {
      icon: <Shuffle className="h-5 w-5 text-violet-400" />,
      name: "Framer Motion",
      version: "v12.0",
      desc: "Drives hardware-accelerated orchestration, staggered list animations, and contextual state transitions.",
      role: "KINETIC ENGINE",
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-fuchsia-400" />,
      name: "Recharts",
      version: "v2.12",
      desc: "Generates canvas-rendered high-contrast radar, bar, and area strategy visualizations for immediate feedback.",
      role: "DIAGNOSTIC VISUALS",
    },
    {
      icon: <Search className="h-5 w-5 text-amber-400" />,
      name: "Lucide Vector Icons",
      version: "v0.450",
      desc: "Provides crisp, pixel-perfect layout symbols that reinforce premium administrative dashboard aesthetics.",
      role: "ICONOGRAPHY SYSTEM",
    },
    {
      icon: <Cpu className="h-5 w-5 text-emerald-400" />,
      name: "Multi-Agent AI",
      version: "Gemini 3.5 Flash",
      desc: "Leverages parallel system instructions, advanced JSON schema constraints, and reasoning pathways.",
      role: "INTELLIGENCE LAYER",
    },
  ];

  return (
    <section id="technology" className="py-20 relative overflow-hidden bg-navy-950/40 border-y border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-violet-950/10 blur-3xl" />
      <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-indigo-950/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Platform Architecture"
          title="Engineered for Premium Speed & Intellectual Rigor"
          description="Powered by a high-efficiency tech stack optimized to parse, model, and visualize deep business intelligence at sub-second speeds."
        />

        {/* Tech Stack Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {stack.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="rounded-xl border border-white/5 bg-navy-950/60 p-5 flex flex-col justify-between hover:border-violet-500/20 hover:bg-navy-950/80 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                    {item.icon}
                  </div>
                  <span className="font-mono text-[9px] text-gray-500 font-bold uppercase">
                    {item.role}
                  </span>
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-white flex items-center gap-1.5">
                    {item.name}
                    <span className="text-[10px] font-mono text-violet-400 bg-violet-950/40 px-1.5 py-0.5 rounded border border-violet-500/10">
                      {item.version}
                    </span>
                  </h4>
                  <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
