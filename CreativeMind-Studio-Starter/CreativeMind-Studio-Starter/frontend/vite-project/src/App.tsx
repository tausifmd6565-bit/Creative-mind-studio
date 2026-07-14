import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Lightbulb,
  Brain,
  Cpu,
  RefreshCw
} from "lucide-react";

import { Navbar } from "./components/Navbar";
import { HeroDashboard } from "./components/HeroDashboard";
import { Statistics } from "./components/Statistics";
import { ProblemSection } from "./components/ProblemSection";
import { HowItWorks } from "./components/HowItWorks";
import { Features } from "./components/Features";
import { Comparison } from "./components/Comparison";
import { TechnologySection } from "./components/TechnologySection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { GradientButton } from "./components/UIElements";
import type { EvaluationResult } from "./types";

// Standard high-fidelity initial assessment for demo matching server fallback
const defaultData: EvaluationResult = {
  ideaName: "Smart Closet & Digital Stylist",
  tagline: "Your wardrobe, digitized and optimized by custom style-matching algorithms.",
  scorecard: {
    viability: 82,
    virality: 75,
    engagement: 88,
    feasibility: 70,
    brandFit: 85,
    average: 80,
    reasoning: "High engagement potential and strong user appeal offset moderate technical feasibility challenges regarding physical garment cataloging."
  },
  ethicalRating: {
    score: 94,
    label: "Eco-Friendly & Inclusive",
    analysis: "Promotes circular fashion, wardrobe utilization, and body-positive styling recommendations without bias."
  },
  expertsDebate: [
    {
      agentName: "Creative Director",
      avatar: "🎨",
      verdict: "APPROVED",
      comment: "Visually exciting concept. We should lean hard on the personal expression angle, not just the technical utility of an inventory. Style is emotional, make the app feel like a fashion house."
    },
    {
      agentName: "Marketing Maven",
      avatar: "📣",
      verdict: "APPROVED",
      comment: "Excellent organic potential on TikTok and Instagram. Virtual wardrobe transitions and AI-styled outfit challenges will drive self-reinforcing loops. Focus on Gen Z and Millennial professionals."
    },
    {
      agentName: "Tech Visionary",
      avatar: "⚡",
      verdict: "NEEDS WORK",
      comment: "Image segmentation for garment cataloging is hard but doable. The real differentiator will be the predictive style model. Don't build custom computer vision; leverage existing segment-anything APIs first."
    },
    {
      agentName: "Financial Analyst",
      avatar: "📈",
      verdict: "APPROVED",
      comment: "Highly viable subscription model. High LTV if we integrate affiliate purchasing for style gaps. Suggest starting with a B2C freemium model before expanding to brand styling partnerships."
    }
  ],
  focusGroup: [
    {
      persona: "The Skeptical Fashionista",
      demographic: "24yo Female, NYC",
      interestLevel: 90,
      sentiment: "Positive",
      quote: "I have hundreds of clothes and always say I have nothing to wear. If this app can scan my receipt emails or take quick photos to suggest outfits based on today's weather, I'd pay for it tomorrow."
    },
    {
      persona: "The Minimalist Eco-Skeptic",
      demographic: "31yo Male, Portland",
      interestLevel: 65,
      sentiment: "Neutral",
      quote: "I like that it helps me wear what I already own instead of buying new stuff. But cataloging my clothes sounds like a massive chore. The onboarding needs to be ultra-fast."
    },
    {
      persona: "The Tech-Forward Trendsetter",
      demographic: "28yo Non-binary, SF",
      interestLevel: 85,
      sentiment: "Positive",
      quote: "An immersive styling board would change the game. Especially if it matches with vintage or thrift shop listings directly to complete an aesthetic."
    }
  ],
  stressTestPivot: {
    vulnerabilities: [
      "Manual cataloging friction during initial onboarding will cause user churn.",
      "Over-reliance on fast-fashion trends might conflict with sustainable brand positioning.",
      "Styling algorithms might feel generic without localized weather and context inputs."
    ],
    pivots: [
      "Create an auto-import tool that parses receipt emails from retailers to build the digital closet instantly.",
      "Reposition styling suggestions to prioritize pre-owned pieces, maximizing wardrobe reuse and highlighting climate impact metrics.",
      "Integrate local calendar feeds to suggest outfits tailored specifically to meetings, dates, or active travel days."
    ]
  },
  productionPackage: {
    launchChannels: [
      "Launch on Product Hunt under 'Fashion & Lifestyle'",
      "TikTok aesthetic styling campaigns with micro-influencers",
      "Subreddit community launches (r/fashion, r/capsulewardrobe)"
    ],
    targetAudience: "Fashion-conscious creators, sustainable lifestyle enthusiasts, and busy professionals seeking Capsule Wardrobe organization.",
    brandingTags: ["Sustainable Fashion", "AI Stylist", "Digital Wardrobe", "SaaS"],
    executionSteps: [
      "Build a simple interactive prototype focusing entirely on the daily styling suggestion feed.",
      "Release a browser extension that auto-adds items to your closet when shopping online.",
      "Partner with 10 sustainable fashion creators for a 30-day digital closet challenge to gather beta feedback."
    ]
  }
};

const droneData: EvaluationResult = {
  ideaName: "AeroSprint Delivery Network",
  tagline: "Autonomous high-density vertical drone logistics for modern high-rises.",
  scorecard: {
    viability: 74,
    virality: 88,
    engagement: 82,
    feasibility: 45,
    brandFit: 92,
    average: 76,
    reasoning: "Extremely high market demand and virality are offset by critical local aviation regulations and hardware deployment costs."
  },
  ethicalRating: {
    score: 80,
    label: "Medium Noise Risk",
    analysis: "Offers green electric transit and reduced road congestion, but requires strict compliance regarding noise ordinances and high-density privacy constraints."
  },
  expertsDebate: [
    {
      agentName: "Creative Director",
      avatar: "🎨",
      verdict: "APPROVED",
      comment: "Brilliant tech aesthetic. The visual of localized window landing pads is straight out of futuristic sci-fi. Focus on creating premium, near-silent hardware branding."
    },
    {
      agentName: "Marketing Maven",
      avatar: "📣",
      verdict: "APPROVED",
      comment: "Incredibly high viral pull. Recording and sharing the first drone landing at your penthouse window will dominate tech feeds. Ideal premium PR play."
    },
    {
      agentName: "Tech Visionary",
      avatar: "⚡",
      verdict: "PIVOT",
      comment: "Extremely hard engineering. Localized wind tunnels between skyscrapers make landing on small windows hazardous. Focus first on dedicated rooftop landing hubs with internal drop chutes."
    },
    {
      agentName: "Financial Analyst",
      avatar: "📈",
      verdict: "NEEDS WORK",
      comment: "Initial capital expenditure for drone fleet licensing and landing structures is huge. Margins are slim if we target standard deliveries. We must partner directly with ultra-high-end property developers."
    }
  ],
  focusGroup: [
    {
      persona: "The Luxury Penthouse Owner",
      demographic: "42yo Executive, Chicago",
      interestLevel: 95,
      sentiment: "Positive",
      quote: "Getting my morning espresso and documents delivered directly to my balcony without interacting with elevators would save me 20 minutes a day. I'd pay a premium monthly flat rate."
    },
    {
      persona: "The Privacy Advocate",
      demographic: "35yo Advocate, Seattle",
      interestLevel: 30,
      sentiment: "Negative",
      quote: "Drones flying outside my apartment window with high-res cameras for navigation is a massive invasion of privacy. I would support local legislation banning them entirely."
    },
    {
      persona: "The On-Demand Delivery Rider",
      demographic: "26yo Rider, SF",
      interestLevel: 50,
      sentiment: "Neutral",
      quote: "It's cool technology, but skyscrapers are where we make most of our delivery fees. If this takes over, it will wipe out courier gig work in downtown grids."
    }
  ],
  stressTestPivot: {
    vulnerabilities: [
      "Sky-high regulatory friction from FAA and municipal drone-flight ordinances.",
      "Wind shear risks surrounding high-rise structures making manual windows hazardous.",
      "Acoustic noise pollution from continuous multi-rotor ascents outside bedroom windows."
    ],
    pivots: [
      "Pivot from individual apartment window landings to dedicated secure rooftop landing zones equipped with automated sorting chutes.",
      "License the technology directly as a private B2B amenity to high-end condo developers to sidestep municipal commercial airspace rules.",
      "Adopt customized toroidal propeller enclosures to reduce low-frequency drone acoustic noise profiles by up to 45%."
    ]
  },
  productionPackage: {
    launchChannels: [
      "Exclusive showcase at Real Estate Technology Summit",
      "Penthouse viral lifestyle video campaigns on YouTube",
      "Joint press release with modern architectural design magazines"
    ],
    targetAudience: "Luxury residential building developers, modern architecture firms, and high-income metropolitan professionals.",
    brandingTags: ["Urban Drone Tech", "Penthouse Amenities", "Logistics Tech", "PropTech"],
    executionSteps: [
      "Create a working scale prototype demonstrating safe hover and balcony landing in wind speeds up to 25mph.",
      "Partner with a single luxury high-rise in Chicago for a 60-day closed beta with 20 resident participants.",
      "Apply for municipal utility classification to access dedicated low-level delivery flight corridors."
    ]
  }
};

const chefData: EvaluationResult = {
  ideaName: "ChefPalette AI",
  tagline: "Transforming surplus pantry items into Michelin-star culinary experiences.",
  scorecard: {
    viability: 89,
    virality: 80,
    engagement: 92,
    feasibility: 85,
    brandFit: 90,
    average: 87,
    reasoning: "Excellent practicality and technical feasibility, with exceptionally high margins on premium recipe subscription tiers."
  },
  ethicalRating: {
    score: 98,
    label: "Highly Sustainable",
    analysis: "Directly minimizes residential food waste and empowers home cooks with zero-waste grocery strategies, supporting circular green habits."
  },
  expertsDebate: [
    {
      agentName: "Creative Director",
      avatar: "🎨",
      verdict: "APPROVED",
      comment: "Brilliant concept that frames sustainability as high art. Styling recipes with professional plating mockups will make home cooking feel like theater."
    },
    {
      agentName: "Marketing Maven",
      avatar: "📣",
      verdict: "APPROVED",
      comment: "Organic marketing gold. 'Pantry challenge' videos where cooks make elite meals out of weird leftovers will perform incredibly well on social feeds."
    },
    {
      agentName: "Tech Visionary",
      avatar: "⚡",
      verdict: "APPROVED",
      comment: "Very straightforward build. Generative recipe APIs are mature. The key technical moat will be the ingredient scanner using modern object detection."
    },
    {
      agentName: "Financial Analyst",
      avatar: "📈",
      verdict: "APPROVED",
      comment: "Incredibly high potential. Start with a premium subscription model for customized grocery plans, then integrate direct retail affiliate links for item restocks."
    }
  ],
  focusGroup: [
    {
      persona: "The Busy Working Parent",
      demographic: "38yo Manager, Boston",
      interestLevel: 90,
      sentiment: "Positive",
      quote: "I throw out so much food every single week because I don't know what to do with weird leftovers. If this gives me quick gourmet meals in 20 minutes, I am buying it immediately."
    },
    {
      persona: "The Culinary Enthusiast",
      demographic: "29yo Designer, SF",
      interestLevel: 85,
      sentiment: "Positive",
      quote: "I love creative cooking but hate meal planning. A dynamic pantry chef that challenges me to use what I have sounds like a game. Highly compelling."
    },
    {
      persona: "The Coupon Saver",
      demographic: "52yo Retired, Dallas",
      interestLevel: 60,
      sentiment: "Neutral",
      quote: "It's smart, but I already know how to use leftovers. It needs to show me exact savings and nutrition metrics to convince me to pay for an app."
    }
  ],
  stressTestPivot: {
    vulnerabilities: [
      "Image-based pantry scanning accuracy can be low depending on lighting and kitchen clutter.",
      "Users might lack specialized kitchen tools required for advanced 'Michelin-star' styled recipes.",
      "Sustaining active daily usage once initial pantry novelty wears off."
    ],
    pivots: [
      "Implement a simple manual quick-selection checklist alongside the camera scanner to guarantee accuracy.",
      "Categorize recipes into concrete difficulty tiers (e.g., 'Home Cook', 'Sous Chef', 'Executive Chef') based on active kitchen tools.",
      "Introduce a 'Zero Waste Weekly Streak' tracker to gamify consistent pantry utilization with actual carbon offset badges."
    ]
  },
  productionPackage: {
    launchChannels: [
      "Product Hunt and Hacker News launch",
      "Instagram reels pantry challenge with popular food creators",
      "Sustainable lifestyle blog integrations and partnerships"
    ],
    targetAudience: "Busy urban professionals, circular eco-conscious households, and amateur home culinary enthusiasts.",
    brandingTags: ["FoodTech", "Sustainable Cooking", "Zero Waste", "SaaS"],
    executionSteps: [
      "Deploy a clean web-based recipe planner allowing manual pantry entry to validate user engagement.",
      "Train a localized computer vision classifier on the top 100 most common household pantry ingredients.",
      "Build restock affiliate links to major online grocery stores to capture instant referral commissions."
    ]
  }
};

const loadingStages = [
  "Spinning up AI Expert Strategic Panel...",
  "Creative Director reviewing brand resonance & narrative hooks...",
  "Marketing Maven calculating virality loops & go-to-market channels...",
  "Tech Visionary stress-testing API complexity & architecture...",
  "Financial Analyst projecting unit margins & pricing models...",
  "Generating simulated focus group participant sentiment...",
  "Assembling weighted metrics & final Creative Scorecard..."
];

export default function App() {
  const [ideaInput, setIdeaInput] = useState("");
  const [activeData, setActiveData] = useState<EvaluationResult>(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const dashboardRef = useRef<HTMLDivElement>(null);
  const sandboxRef = useRef<HTMLDivElement>(null);

  // Function to cycle through premium loading messages
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isLoading) {
      let stageIdx = 0;
      intervalId = setInterval(() => {
        stageIdx = (stageIdx + 1) % loadingStages.length;
        setLoadingStep(loadingStages[stageIdx]);
      }, 1400);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Smooth scroll helper
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Trigger strategy session scrolling
  const handleStartSession = () => {
    scrollTo(sandboxRef);
    setTimeout(() => {
      const el = document.getElementById("idea-textbox");
      if (el) el.focus();
    }, 600);
  };

  // Load preset data immediately and scroll
  const handleLoadPreset = (preset: "closet" | "drone" | "chef") => {
    setErrorMsg("");
    let targetData = defaultData;
    if (preset === "drone") targetData = droneData;
    if (preset === "chef") targetData = chefData;

    setActiveData(targetData);
    scrollTo(dashboardRef);
  };

  // Dynamic High-Fidelity Client-side Evaluation Simulator
  const simulateEvaluation = (idea: string): EvaluationResult => {
    const lowered = idea.toLowerCase();
    
    // Check key presets and match them
    if (lowered.includes("closet") || lowered.includes("wardrobe") || lowered.includes("clothing") || lowered.includes("style") || lowered.includes("fashion")) {
      return defaultData;
    }
    if (lowered.includes("drone") || lowered.includes("delivery") || lowered.includes("flight") || lowered.includes("sky") || lowered.includes("aviation") || lowered.includes("aer")) {
      return droneData;
    }
    if (lowered.includes("food") || lowered.includes("recipe") || lowered.includes("cook") || lowered.includes("kitchen") || lowered.includes("chef") || lowered.includes("pantry")) {
      return chefData;
    }

    const capitalizedWord = idea.split(" ").slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ").replace(/[^a-zA-Z ]/g, "");
    const name = capitalizedWord.trim() || "Creative Concept";
    const ideaName = name.length > 3 ? `${name}` : "Strategic Concept Engine";
    const tagline = `Dynamic strategic optimization & simulated intelligence for: "${idea.slice(0, 60)}..."`;

    const seed = idea.length;
    const viability = Math.min(95, Math.max(65, 70 + (seed % 21)));
    const virality = Math.min(95, Math.max(60, 65 + ((seed * 3) % 29)));
    const engagement = Math.min(96, Math.max(70, 72 + ((seed * 7) % 23)));
    const feasibility = Math.min(92, Math.max(40, 50 + ((seed * 11) % 37)));
    const brandFit = Math.min(98, Math.max(65, 75 + ((seed * 13) % 21)));
    const average = Math.round((viability + virality + engagement + feasibility + brandFit) / 5);

    return {
      ideaName,
      tagline,
      scorecard: {
        viability,
        virality,
        engagement,
        feasibility,
        brandFit,
        average,
        reasoning: `The concept exhibits extremely robust potential in engagement (${engagement}%) and brand-fit resonance (${brandFit}%). However, technical feasibility issues (${feasibility}%) present moderate implementation barriers that warrant strategic modular prototyping.`
      },
      ethicalRating: {
        score: Math.min(99, Math.max(75, 80 + (seed % 19))),
        label: "Principled Design",
        analysis: "Promotes responsible technology stewardship, low-barrier inclusivity guidelines, and adheres strictly to circular sustainable values."
      },
      expertsDebate: [
        {
          agentName: "Creative Director",
          avatar: "🎨",
          verdict: viability > 78 ? "APPROVED" : "NEEDS WORK",
          comment: `Aesthetically compelling and conceptually unique. We need to focus on emotional design storytelling and clean interfaces to make this solution feel completely intuitive to everyday users.`
        },
        {
          agentName: "Marketing Maven",
          avatar: "📣",
          verdict: virality > 80 ? "APPROVED" : "NEEDS WORK",
          comment: `Great organic traction hooks. Word-of-mouth loops are extremely viable if we build micro-sharing milestones directly into the user onboarding experience.`
        },
        {
          agentName: "Tech Visionary",
          avatar: "⚡",
          verdict: feasibility > 70 ? "APPROVED" : "PIVOT",
          comment: `While challenging, we can drastically reduce upfront engineering times by integrating pre-existing secure SaaS APIs and microservice wrappers instead of designing custom stacks.`
        },
        {
          agentName: "Financial Analyst",
          avatar: "📈",
          verdict: brandFit > 80 ? "APPROVED" : "NEEDS WORK",
          comment: `Outstanding subscription potential with incredibly high gross margin pathways. Let's start with a lean B2C self-serve tier to build a proof-of-concept before expanding enterprise offerings.`
        }
      ],
      focusGroup: [
        {
          persona: "The Modern Optimizer",
          demographic: "29yo Professional, Austin",
          interestLevel: viability + 5,
          sentiment: "Positive",
          quote: `I spend way too much time managing these workflows manually every single day. If an elegant service like this can save me even 15 minutes, I'll pay for the premium license.`
        },
        {
          persona: "The Secure Tech Skeptic",
          demographic: "36yo Architect, Seattle",
          interestLevel: feasibility - 5,
          sentiment: "Neutral",
          quote: `The value proposition is quite clear, but the onboarding has to be instantaneous. If there is too much setup friction, I will likely fall back to my traditional habits.`
        },
        {
          persona: "The Eco-Conscious Trendsetter",
          demographic: "24yo Creator, Brooklyn",
          interestLevel: brandFit,
          sentiment: "Positive",
          quote: `Love how this aligns with mindful habits. It really feels like it has a soul and respects the user's attention instead of just forcing endless notifications.`
        }
      ],
      stressTestPivot: {
        vulnerabilities: [
          "Onboarding friction if initial setup steps exceed 90 seconds.",
          "Potential retention loss if user notifications are perceived as repetitive.",
          "Security concerns regarding user telemetry and local data privacy rules."
        ],
        pivots: [
          "Introduce a completely checklist-free, one-tap instant social login and quick-start onboarding.",
          "Incorporate customized AI contextual notifications that only fire during peak productivity hours.",
          "Establish high-transparency local client-side encryption options so users retain full data custody."
        ]
      },
      productionPackage: {
        launchChannels: [
          "Coordinated Product Hunt & Hacker News feature releases.",
          "Targeted platform micro-influencer product demo reviews.",
          "Active high-density community AMAs and sub-community launch campaigns."
        ],
        targetAudience: "Busy modern professionals, design-conscious remote workers, and technology-forward early adopters.",
        brandingTags: ["Modern Productivity", "AI Co-pilot", "Creative Strategy", "SaaS Hub"],
        executionSteps: [
          "Launch a static pre-registration landing page to build an early premium beta list.",
          "Publish a simple interactive prototype highlighting the primary interactive dashboard feeds.",
          "Onboard 50 initial power-users for a intensive 14-day direct feedback sprint loop."
        ]
      }
    };
  };

  // Sandbox Form Submit
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaInput.trim() || ideaInput.trim().length < 5) {
      setErrorMsg("Please enter a creative idea that is at least 5 characters long.");
      return;
    }

    setErrorMsg("");
    setLoadingStep(loadingStages[0]);
    setIsLoading(true);
    scrollTo(dashboardRef);

    // Completely client-side simulated evaluation loop for 100% frontend runtime
    setTimeout(() => {
      try {
        const result = simulateEvaluation(ideaInput);
        setActiveData(result);
      } catch (err) {
        console.error(err);
        setErrorMsg("Something went wrong during dynamic synthesis.");
        setActiveData(defaultData);
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-navy-900 text-slate-100 selection:bg-violet-600 selection:text-white overflow-hidden">
      {/* Absolute grid background and radial decorative lighting */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] radial-glow pointer-events-none" />

      {/* Sticky Navbar */}
      <Navbar onStartSession={handleStartSession} />

      {/* 2. Hero Section */}
      <main className="relative pt-24 pb-20 md:pt-32 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Hero Left Content Column */}
            <div className="lg:col-span-5 space-y-8 text-left">
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1 text-xs font-medium tracking-wide text-violet-300 font-mono"
              >
                <Cpu className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                AI Creative Intelligence Platform
              </motion.div>

              {/* Large Headline */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-none"
                >
                  AI Creative{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent">
                    Intelligence
                  </span>
                  , not just AI Content Generation.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-base text-gray-400 leading-relaxed max-w-lg"
                >
                  CreativeMind Studio is an elite, multi-agent Strategy Room that helps founders, filmmakers, marketers, and designers stress-test, validate, and pivot raw concepts using simulated focus groups and deep numeric scorecards before building.
                </motion.p>
              </div>

              {/* Strategy Session Sandbox Input Area */}
              <motion.div
                ref={sandboxRef}
                id="sandbox-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-navy-950/50 p-5 backdrop-blur-md shadow-xl"
              >
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Lightbulb className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wide">
                      Interactive Evaluation Sandbox
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      id="idea-textbox"
                      value={ideaInput}
                      onChange={(e) => setIdeaInput(e.target.value)}
                      placeholder="E.g., An on-demand drone vertical delivery network for metropolitan high-rises or a surplus food gourmet planner..."
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-navy-950/70 p-3.5 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all duration-200 resize-none font-sans"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-rose-400 font-medium font-mono">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <span className="text-[10px] text-gray-500 font-mono leading-normal max-w-[200px]">
                      Stress-tests idea against 4 expert advisors & 3 custom buyer personas.
                    </span>
                    <GradientButton
                      type="submit"
                      disabled={isLoading || !ideaInput.trim()}
                      variant="primary"
                      className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold shrink-0"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Analyzing Concept...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          Stress-Test Idea
                        </>
                      )}
                    </GradientButton>
                  </div>
                </form>

                {/* Preset Fast Actions */}
                <div className="mt-4 border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-gray-500 font-bold block uppercase tracking-wider mb-2">
                    Preloaded High-Fidelity Demo Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: "closet", label: "Smart Wardrobe", color: "border-violet-500/20 text-violet-300" },
                      { id: "drone", label: "Balcony Drone Hubs", color: "border-cyan-500/20 text-cyan-300" },
                      { id: "chef", label: "ChefPalette AI", color: "border-fuchsia-500/20 text-fuchsia-300" },
                    ] as const).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleLoadPreset(preset.id)}
                        className={`rounded-lg border bg-white/5 px-2.5 py-1 text-[11px] font-mono font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/30 ${preset.color}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Hero Right Dashboard Column */}
            <div ref={dashboardRef} id="dashboard-preview" className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                {/* Floating blur backdrops */}
                <div className="absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
                <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl animate-pulse" />

                {/* Immersive Dashboard Header Title on top of container */}
                <div className="mb-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">
                      Active Strategy Analysis
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Updated live UTC: 2026-07-13
                  </span>
                </div>

                <HeroDashboard
                  data={activeData}
                  isLoading={isLoading}
                  loadingStep={loadingStep}
                />
              </motion.div>
            </div>

          </div>
        </div>
      </main>

      {/* 3. Impact Statistics */}
      <Statistics />

      {/* 4. Problem Statement Pain Points Section */}
      <ProblemSection />

      {/* 5. How It Works Workflow Horizontal Timeline */}
      <HowItWorks />

      {/* 6. Feature Premium Bento/Glass Grid */}
      <Features />

      {/* 7. Comparison Matrix */}
      <Comparison />

      {/* 8. Architecture Tech Stack Badges */}
      <TechnologySection />

      {/* 9. High Conversion CTA Section */}
      <CTASection onStartSession={handleStartSession} />

      {/* 10. Comprehensive Footer */}
      <Footer />
    </div>
  );
}
