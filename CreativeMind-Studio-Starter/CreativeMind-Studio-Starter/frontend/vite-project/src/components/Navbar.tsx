import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Sparkles, BrainCircuit } from "lucide-react";

interface NavbarProps {
  onStartSession?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartSession }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Traditional vs AI", href: "#comparison" },
    { name: "Technology", href: "#technology" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-navy-950/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-2 text-white font-display font-bold text-lg tracking-tight">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20">
                <BrainCircuit className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-lg bg-violet-400 opacity-20 blur-sm animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                CreativeMind<span className="text-violet-400 font-light">Studio</span>
              </span>
            </a>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartSession}
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-violet-600/20 border border-violet-500/40 px-4 py-2 text-sm font-medium text-violet-300 transition-all duration-300 hover:bg-violet-600/30 hover:border-violet-400 shadow-md shadow-violet-500/5"
            >
              <Sparkles className="h-4 w-4 text-violet-400" />
              Start Strategy Session
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-white/10 bg-navy-950/95 backdrop-blur-lg md:hidden"
          >
            <div className="space-y-1 px-4 pt-2 pb-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-white/5 mt-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onStartSession) onStartSession();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-center text-sm font-medium text-white shadow-lg shadow-violet-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Strategy Session
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
