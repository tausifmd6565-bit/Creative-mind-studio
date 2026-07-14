import React from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  hoverGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  id,
  hoverGlow = true,
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={
        hoverGlow
          ? {
              y: -4,
              borderColor: "rgba(167, 139, 250, 0.3)",
              backgroundColor: "rgba(18, 26, 54, 0.6)",
              boxShadow: "0 10px 30px -10px rgba(124, 58, 237, 0.25)",
            }
          : undefined
      }
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
}) => {
  if (variant === "primary") {
    return (
      <motion.button
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-violet-900/30 transition-all duration-300 hover:shadow-violet-600/40 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-violet-600 transition-transform duration-500 hover:translate-x-0" />
      </motion.button>
    );
  }

  if (variant === "outline") {
    return (
      <motion.button
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileHover={{ scale: 1.02, borderColor: "rgba(167, 139, 250, 0.6)", backgroundColor: "rgba(124, 58, 237, 0.1)" }}
        whileTap={{ scale: 0.98 }}
        className={`rounded-xl border border-violet-500/30 bg-transparent px-6 py-3 font-medium text-violet-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </motion.button>
  );
};

interface SectionTitleProps {
  badge: string;
  title: string;
  description: string;
  align?: "center" | "left";
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  badge,
  title,
  description,
  align = "center",
}) => {
  return (
    <div className={`mb-12 max-w-3xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-950/40 px-3 py-1 text-xs font-medium tracking-wide text-violet-300 uppercase font-mono"
      >
        {badge}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-4 text-base text-gray-400 leading-relaxed"
      >
        {description}
      </motion.p>
    </div>
  );
};
