import React from "react";
import { BrainCircuit } from "lucide-react";

const Github: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Twitter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Linkedin: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-navy-950/90 py-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Logo Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-display font-bold text-lg tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md">
                <BrainCircuit className="h-4 w-4 text-white" />
              </div>
              <span>
                CreativeMind<span className="text-violet-400 font-light">Studio</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              AI-powered Creative Strategy Room. Stress-test raw business, marketing, and narrative concepts with custom simulated focus groups prior to launch.
            </p>
            <div className="flex gap-4 items-center pt-2">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-violet-300 transition-colors">Strategy Room</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Audience Synth</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Creative Scorecard</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Pricing Matrix</a></li>
            </ul>
          </div>

          {/* Technology links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Technology</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-violet-300 transition-colors">React 19 Engine</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Gemini 3.5 Core</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Tailwind Styles</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">API Integrations</a></li>
            </ul>
          </div>

          {/* Documentation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Documentation</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-violet-300 transition-colors">Platform API</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Agent Frameworks</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Scorecard Weighting</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Compliance Rules</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-violet-300 transition-colors">Investor Room</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Startup Packages</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Advisory Matrix</a></li>
              <li><a href="#" className="hover:text-violet-300 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-white/5 my-12" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-[11px] text-gray-500 font-mono">
            &copy; 2026 CREATIVEMIND STUDIO. POWERED BY SERVER-SIDE GEMINI API. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-[11px] text-gray-500 font-mono">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Advisory</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
