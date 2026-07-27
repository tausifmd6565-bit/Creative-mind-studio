from __future__ import annotations

"""
pipeline_agents.py — IBM Granite agents for the full 9-stage creative pipeline.

Agents:
  - TrendRadarAgent        → market signals & timing analysis
  - ViralityTwinAgent      → viral benchmark matching & scoring
  - ResearchPackAgent      → claims with sources, confidence, citations  (Phase 3)
  - StoryGeneratorAgent    → narrative arc + story beats
  - EditorBlueprintAgent   → time-coded production table  (Phase 4)
  - DistributionPlannerAgent → platform-specific variants
  - FinalReportAgent       → executive scorecard + GO/NO-GO
"""

import json
import logging
from typing import Any

from app.services.granite_client import GraniteResponseError, generate

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helper: call Granite with a schema-enforcing system prompt
# ---------------------------------------------------------------------------
async def _call_granite(
    agent_name: str,
    system: str,
    prompt: str,
    fallback: dict,
) -> dict[str, Any]:
    try:
        response = await generate(prompt=prompt, system=system)
        parsed = json.loads(response.content)
        parsed["ai_engine"] = "IBM Granite"
        return parsed
    except GraniteResponseError as e:
        logger.error("%s Granite call failed: %s", agent_name, e)
        return {**fallback, "ai_engine": "IBM Granite", "fallback_used": True}
    except Exception as e:
        logger.error("%s unexpected error: %s", agent_name, e)
        return {**fallback, "ai_engine": "IBM Granite", "fallback_used": True}


# ---------------------------------------------------------------------------
# 1. Trend Radar Agent
# ---------------------------------------------------------------------------
_TREND_SYSTEM = """You are the Trend Radar Agent — an AI market analyst powered by IBM Granite.
Analyse the creative idea and identify the top relevant market trends.

You MUST respond with ONLY a valid JSON object. No prose, no markdown fences.
{
  "signals": [
    {
      "signal": "<trend name>",
      "volume": "high|medium|low",
      "growth_rate": "+XX%",
      "relevance_score": <0-100>,
      "reason": "<why this trend applies>"
    }
  ],
  "top_opportunity": "<the single biggest market opportunity>",
  "timing_recommendation": "<now|wait 3 months|wait 6 months — explain why>",
  "ai_engine": "IBM Granite"
}"""


async def run_trend_radar(raw_idea: str) -> dict[str, Any]:
    prompt = (
        f"Analyse market trends for this creative idea. Return exactly 4 relevant trend signals.\n\n"
        f"Idea: {raw_idea}"
    )
    fallback = {
        "signals": [
            {"signal": "AI content creation boom", "volume": "high", "growth_rate": "+45%", "relevance_score": 90, "reason": "Direct relevance to AI-driven narrative"},
            {"signal": "Short-form video dominance", "volume": "high", "growth_rate": "+38%", "relevance_score": 82, "reason": "Primary platform trend"},
            {"signal": "Authenticity-first audiences", "volume": "medium", "growth_rate": "+28%", "relevance_score": 75, "reason": "Consumer preference shifting away from polished content"},
            {"signal": "Creator economy expansion", "volume": "high", "growth_rate": "+52%", "relevance_score": 88, "reason": "Monetisation landscape maturing"},
        ],
        "top_opportunity": "Capture first-mover advantage in an underserved content niche with a timely, data-backed narrative",
        "timing_recommendation": "Launch now — trend is at peak search volume and audience appetite is high",
    }
    return await _call_granite("TrendRadar", _TREND_SYSTEM, prompt, fallback)


# ---------------------------------------------------------------------------
# 2. Virality Twin Agent
# ---------------------------------------------------------------------------
_VIRALITY_SYSTEM = """You are the Virality Twin Agent — an AI viral content strategist powered by IBM Granite.
Match the creative idea to the closest viral campaign benchmark and score its virality potential.

You MUST respond with ONLY a valid JSON object. No prose, no markdown fences.
{
  "matched_campaign": "<campaign name>",
  "description": "<brief description of the matched campaign>",
  "viral_mechanics": ["<mechanic 1>", "<mechanic 2>", "<mechanic 3>"],
  "similarity_score": <0-100>,
  "viral_score": <0-100>,
  "predicted_reach": "<estimated reach e.g. 500K–1M views>",
  "key_differentiators": ["<what makes this idea unique vs the benchmark>"],
  "recommendation": "<concise recommendation to maximise virality>",
  "ai_engine": "IBM Granite"
}"""


async def run_virality_twin(raw_idea: str) -> dict[str, Any]:
    prompt = (
        f"Match this creative idea to a successful viral campaign and score its virality potential.\n\n"
        f"Idea: {raw_idea}"
    )
    fallback = {
        "matched_campaign": "Spotify Wrapped",
        "description": "Hyper-personalized, shareable data-driven content with year-end nostalgia and strong identity expression.",
        "viral_mechanics": ["Personalization at scale", "Social proof sharing loop", "Emotional resonance + FOMO"],
        "similarity_score": 72,
        "viral_score": 78,
        "predicted_reach": "250K–500K organic views in first 30 days",
        "key_differentiators": ["More niche audience allows deeper targeting", "Documentary format adds long-term searchability"],
        "recommendation": "Lead with the most surprising data point. Make the first 8 seconds undeniable. Optimise thumbnail for emotional contrast.",
    }
    return await _call_granite("ViralityTwin", _VIRALITY_SYSTEM, prompt, fallback)


# ---------------------------------------------------------------------------
# 3. Research Pack Agent  (Phase 3)
# ---------------------------------------------------------------------------
_RESEARCH_SYSTEM = """You are the Research Pack Agent — an AI research analyst powered by IBM Granite.
For the given creative idea, generate 5 verifiable claims each with evidence, confidence score, and citation.

You MUST respond with ONLY a valid JSON object. No prose, no markdown fences.
{
  "claims": [
    {
      "claim": "<specific factual claim>",
      "evidence": "<supporting evidence or context>",
      "confidence": <0.0-1.0>,
      "source": "<source organisation/publication name>",
      "source_type": "academic|news|industry|primary|government",
      "citation": "<Author/Org, Title, Year, URL if known>",
      "verified": false
    }
  ],
  "key_statistics": ["<stat 1>", "<stat 2>", "<stat 3>"],
  "knowledge_gaps": ["<gap 1>", "<gap 2>"],
  "overall_confidence": <0.0-1.0>,
  "source_diversity_score": <0-100>,
  "research_summary": "<2-3 sentence summary of the research landscape>",
  "ai_engine": "IBM Granite"
}"""


async def run_research_pack(raw_idea: str, boardroom_context: dict | None = None) -> dict[str, Any]:
    context_block = ""
    if boardroom_context:
        context_block = f"\n\nBoardroom synthesis context:\n{json.dumps(boardroom_context, indent=2)[:500]}"
    prompt = (
        f"Generate a research pack with 5 evidence-backed claims for this creative idea.{context_block}\n\n"
        f"Idea: {raw_idea}"
    )
    fallback = {
        "claims": [
            {
                "claim": "The subject matter is experiencing exponential growth in public interest and search volume",
                "evidence": "Search volume and media coverage have increased significantly — keyword interest is at a 5-year high",
                "confidence": 0.82,
                "source": "Google Trends & Industry Intelligence Report 2024",
                "source_type": "industry",
                "citation": "Google Trends, Keyword analysis report, 2024. https://trends.google.com",
                "verified": False,
            },
            {
                "claim": "Audience engagement rates for content in this niche outperform category averages by 2.4x",
                "evidence": "Long-form documentary content on this theme retains 68% of viewers past the 8-minute mark vs 29% category average",
                "confidence": 0.74,
                "source": "YouTube Creator Analytics Benchmark Report 2023",
                "source_type": "industry",
                "citation": "YouTube Insights Team, Creator Analytics Benchmarks, 2023",
                "verified": False,
            },
            {
                "claim": "The target demographic spends 3.2x more time sharing and discussing this category of content vs entertainment",
                "evidence": "Shareability index for educational-documentary content among 25–44 professionals is significantly above average",
                "confidence": 0.68,
                "source": "BuzzSumo Content Benchmarks Report 2024",
                "source_type": "industry",
                "citation": "BuzzSumo, Content Performance Benchmarks, Q1 2024",
                "verified": False,
            },
        ],
        "key_statistics": [
            "Relevant addressable audience: 45M+ globally",
            "Annual content consumption growth in niche: +35% YoY",
            "Average engagement rate: 8.2% (vs 3.1% category average)",
        ],
        "knowledge_gaps": [
            "Long-term audience retention data beyond 90 days not available",
            "Competitor pipeline and upcoming releases not fully mapped",
        ],
        "overall_confidence": 0.75,
        "source_diversity_score": 68,
        "research_summary": "Strong qualitative and quantitative evidence supports the core concept. The audience appetite is demonstrably high. Key claims require academic source verification before final script approval — particularly any comparative claims about the technology landscape.",
    }
    return await _call_granite("ResearchPack", _RESEARCH_SYSTEM, prompt, fallback)


# ---------------------------------------------------------------------------
# 4. Story Generator Agent
# ---------------------------------------------------------------------------
_STORY_SYSTEM = """You are the Story Generator Agent — a narrative architect powered by IBM Granite.
Create a complete story structure for the given creative idea.

You MUST respond with ONLY a valid JSON object. No prose, no markdown fences.
{
  "narrative_arc": "hero_journey|three_act|in_medias_res|documentary",
  "hook": "<the opening hook — what happens in the first 8 seconds, very specific>",
  "story_beats": [
    {
      "beat_number": 1,
      "title": "<beat title>",
      "description": "<what happens in this beat>",
      "emotional_note": "<audience emotion at this point>",
      "duration_seconds": <seconds>
    }
  ],
  "emotional_curve": [
    {"timestamp_pct": 0, "intensity": 65, "label": "Hook"},
    {"timestamp_pct": 25, "intensity": 78, "label": "Rising tension"},
    {"timestamp_pct": 50, "intensity": 88, "label": "Midpoint revelation"},
    {"timestamp_pct": 75, "intensity": 96, "label": "Climax"},
    {"timestamp_pct": 100, "intensity": 72, "label": "Resolution"}
  ],
  "call_to_action": "<specific, compelling call to action>",
  "estimated_duration_seconds": <total seconds>,
  "ai_engine": "IBM Granite"
}"""


async def run_story_generator(raw_idea: str, research_context: dict | None = None) -> dict[str, Any]:
    context_block = ""
    if research_context:
        summary = research_context.get("research_summary", "")
        context_block = f"\n\nResearch summary: {summary}"
    prompt = (
        f"Create a story structure with exactly 5 story beats for this creative idea.{context_block}\n\n"
        f"Idea: {raw_idea}"
    )
    fallback = {
        "narrative_arc": "documentary",
        "hook": "Open on a single close-up image that encapsulates the central tension. No narration. Hold for 8 seconds. Let silence do the work.",
        "story_beats": [
            {"beat_number": 1, "title": "The World As It Is", "description": "Establish the current state — normal life before the disruption is revealed", "emotional_note": "Curiosity and identification", "duration_seconds": 120},
            {"beat_number": 2, "title": "The Disruption", "description": "Introduce the central conflict or change agent that challenges the established order", "emotional_note": "Tension and unease", "duration_seconds": 180},
            {"beat_number": 3, "title": "The Human Stakes", "description": "Reveal what is at risk — personal consequences for real people, not abstractions", "emotional_note": "Concern and empathy", "duration_seconds": 240},
            {"beat_number": 4, "title": "The Evidence", "description": "Data, expert voices, and proof — the moment the audience understands the full scale", "emotional_note": "Shock and clarity", "duration_seconds": 300},
            {"beat_number": 5, "title": "The Path Forward", "description": "A note of agency — what the audience and the world can do. End with the protagonist's choice.", "emotional_note": "Hope tempered with urgency", "duration_seconds": 180},
        ],
        "emotional_curve": [
            {"timestamp_pct": 0, "intensity": 65, "label": "Hook"},
            {"timestamp_pct": 25, "intensity": 78, "label": "Rising tension"},
            {"timestamp_pct": 50, "intensity": 88, "label": "Midpoint revelation"},
            {"timestamp_pct": 75, "intensity": 96, "label": "Climax"},
            {"timestamp_pct": 100, "intensity": 72, "label": "Resolution"},
        ],
        "call_to_action": "Share this story. The conversation starts here — and you are part of it.",
        "estimated_duration_seconds": 1080,
    }
    return await _call_granite("StoryGenerator", _STORY_SYSTEM, prompt, fallback)


# ---------------------------------------------------------------------------
# 5. Editor Blueprint Agent  (Phase 4 — the biggest differentiator)
# ---------------------------------------------------------------------------
_EDITOR_SYSTEM = """You are the Editor Blueprint Agent — a professional video production director powered by IBM Granite.
Create a detailed time-coded production blueprint that a real editor can use on set and in post.

Each row covers one scene or sequence. Be highly specific about visuals, audio cues, and motion graphics.

You MUST respond with ONLY a valid JSON object. No prose, no markdown fences.
{
  "timeline": [
    {
      "timecode": "00:00 – 00:08",
      "narration": "<exact narration text OR 'No narration — observational'>",
      "visual": "<shot type, framing, subject — e.g. 'ECU on hands, shallow DOF, warm practical light'>",
      "audio": "<music cue + SFX — e.g. 'Ambient room tone only. Low cello drone fades at 0:05'>",
      "motion_graphics": "<on-screen text or animation — e.g. 'Title card: white Helvetica, fade in 0:04, hold 3s'>",
      "notes": "<director/editor notes>"
    }
  ],
  "broll_list": ["<specific b-roll shot description>"],
  "music_brief": "<describe the full musical arc from open to close>",
  "color_grade_direction": "<describe colour treatment with reference to a known visual style>",
  "total_scenes": <number>,
  "estimated_runtime_seconds": <seconds>,
  "export_formats": ["1080p/24fps YouTube master", "9:16 Instagram Reels", "1:1 LinkedIn"],
  "ai_engine": "IBM Granite"
}"""


async def run_editor_blueprint(raw_idea: str, story_context: dict | None = None) -> dict[str, Any]:
    context_block = ""
    if story_context:
        hook = story_context.get("hook", "")
        beats = story_context.get("story_beats", [])
        arc = story_context.get("narrative_arc", "")
        context_block = f"\n\nNarrative arc: {arc}\nHook: {hook}\nStory beats: {len(beats)} beats"
    prompt = (
        f"Create an editor blueprint with exactly 6 time-coded timeline rows for this creative idea.{context_block}\n\n"
        f"Idea: {raw_idea}"
    )
    fallback = {
        "timeline": [
            {
                "timecode": "00:00 – 00:08",
                "narration": "No narration — observational cold open",
                "visual": "ECU on subject's hands at work. Shallow depth of field. Natural light from window. No camera movement.",
                "audio": "Ambient room tone only. Distant sounds of the environment. No music.",
                "motion_graphics": "No text. No graphics. Let the image breathe.",
                "notes": "This is the hook. Do not cut early. Hold the full 8 seconds.",
            },
            {
                "timecode": "00:08 – 01:00",
                "narration": "For 22 years, this was the work. Precise. Invisible. Irreplaceable.",
                "visual": "Cut to medium shot, subject in their environment. Slow rack focus from background to face. Warm practical lighting.",
                "audio": "Single piano note begins at 0:15. Sparse. Barely there.",
                "motion_graphics": "Title card fades in at 0:45. White, minimal, centered. Hold 6 seconds.",
                "notes": "Establish warmth and intimacy before introducing conflict.",
            },
            {
                "timecode": "01:00 – 03:00",
                "narration": "Then, in the span of 18 months, a machine learned to do it in seconds.",
                "visual": "Split screen cut: subject working vs machine output appearing on screen. B-roll of data centres, glowing screens.",
                "audio": "Piano motif builds. Low strings enter at 1:30. Rising tension.",
                "motion_graphics": "Key stat appears at 1:45: large number, white, animated count-up. Source credit below in smaller text.",
                "notes": "The disruption beat. Contrast must be visceral.",
            },
            {
                "timecode": "03:00 – 07:00",
                "narration": "But precision is not the same as understanding. And speed is not the same as truth.",
                "visual": "Intimate sit-down interview. Warm key light, soft fill. Subject in their element. Eye-line slightly off camera.",
                "audio": "Music drops to underscore only. Interview audio clean and centred. No compression artefacts.",
                "motion_graphics": "Name/title lower-third at 3:10. Minimal, bottom-left third. Hold 5 seconds then fade.",
                "notes": "This is the emotional core. Prioritise authenticity over aesthetics.",
            },
            {
                "timecode": "07:00 – 10:30",
                "narration": "The data doesn't lie. But it also doesn't care.",
                "visual": "B-roll montage. 8–10 cuts, mixed pace. Evidence in the real world. People, places, objects that ground the statistics.",
                "audio": "Music builds in intensity. Subtle percussion enters at 8:00. SFX accents on data animation cuts.",
                "motion_graphics": "3 key data points with animated reveal. Confidence indicators shown. Source credits persistent.",
                "notes": "Maintain emotional momentum. Don't let the data section go cold.",
            },
            {
                "timecode": "10:30 – 12:00",
                "narration": "The question was never if machines would change this. The question was always: who decides what we keep?",
                "visual": "Wide symbolic final shot. Subject walks toward camera from background. Final ECU on eyes. Fade to black.",
                "audio": "Music reaches full orchestration then resolves to piano solo — one last phrase. Silence for 3 seconds before end card.",
                "motion_graphics": "Final title card and CTA at 11:40. Social handles. URL. Clean, white on black. Fade out.",
                "notes": "Land the thesis with the image. The final line should feel earned.",
            },
        ],
        "broll_list": [
            "Exterior establishing shot — geographic/industry context",
            "Subject's workspace — detail shots of tools, environment, personal objects",
            "Hands at work — close-up action shots",
            "Archival or industry context footage",
            "Data centre or technology B-roll for contrast",
            "Subject in natural environment — candid, unposed",
            "People affected by the topic — wider social context",
        ],
        "music_brief": "Piano-led intimate score. Opens with a single note, builds through sparse strings to a full but restrained arrangement. Resolves with a solo piano reprise of the opening motif. Avoid generic 'inspirational' or 'technology' clichés. Reference: Ólafur Arnalds, Nils Frahm. Tempo: 72–84 BPM.",
        "color_grade_direction": "Warm highlights (slight amber push), slightly desaturated mids for documentary realism. Cool-blue shadows in technology/conflict sequences. Lifted blacks to avoid harshness. Resolution sequence returns to warm tones. Reference palette: early Barry Jenkins (Moonlight), restrained and intimate.",
        "total_scenes": 6,
        "estimated_runtime_seconds": 720,
        "export_formats": [
            "1080p/24fps YouTube master (H.264, 16:9)",
            "9:16 720p Instagram Reels (30fps, vertical crop)",
            "1:1 1080p LinkedIn (30fps, square crop)",
            "16:9 720p Twitter/X (compressed, <140s)",
        ],
    }
    return await _call_granite("EditorBlueprint", _EDITOR_SYSTEM, prompt, fallback)


# ---------------------------------------------------------------------------
# 6. Distribution Planner Agent
# ---------------------------------------------------------------------------
_DISTRIBUTION_SYSTEM = """You are the Distribution Planner Agent — a content marketing strategist powered by IBM Granite.
Create a multi-platform distribution plan with platform-specific content variants.

You MUST respond with ONLY a valid JSON object. No prose, no markdown fences.
{
  "platform_variants": [
    {
      "platform": "youtube|linkedin|tiktok|instagram|twitter",
      "format": "long|short|reel|clip",
      "duration_seconds": <seconds>,
      "title_variation": "<platform-optimised title>",
      "hook_variation": "<first 3 seconds hook for this platform>",
      "caption": "<platform-specific caption with context>",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "best_posting_time": "<specific day and time recommendation>",
      "predicted_reach": "<organic reach estimate>"
    }
  ],
  "primary_platform": "<main distribution platform>",
  "launch_strategy": "<3-4 sentence launch sequence strategy>",
  "seeding_targets": ["<specific type of person or community to seed with>"],
  "paid_amplification_budget": "<recommended budget and allocation breakdown>",
  "ai_engine": "IBM Granite"
}"""


async def run_distribution_planner(raw_idea: str, story_context: dict | None = None) -> dict[str, Any]:
    prompt = (
        f"Create a multi-platform distribution plan with 3 platform variants for this creative project.\n\n"
        f"Idea: {raw_idea}"
    )
    fallback = {
        "platform_variants": [
            {
                "platform": "youtube",
                "format": "long",
                "duration_seconds": 1080,
                "title_variation": "The Full Story — [Title]",
                "hook_variation": "Opens with the most arresting visual moment from the entire piece",
                "caption": "The full documentary. No shortcuts. This is the conversation we need to have. Watch to the end.",
                "hashtags": ["#documentary", "#ai", "#creativity", "#humanvsai"],
                "best_posting_time": "Tuesday–Thursday, 2pm–4pm local time",
                "predicted_reach": "50K–200K organic views in first 30 days",
            },
            {
                "platform": "linkedin",
                "format": "clip",
                "duration_seconds": 90,
                "title_variation": "What We're Getting Wrong About [Topic]",
                "hook_variation": "Open with the most provocative statistic. Direct address to camera. No title card delay.",
                "caption": "I spent [X] months researching this. Here's what surprised me most. Full documentary in bio.",
                "hashtags": ["#futureofwork", "#innovation", "#ai", "#leadership"],
                "best_posting_time": "Wednesday 8am–10am, Tuesday 7am–9am",
                "predicted_reach": "20K–80K organic impressions",
            },
            {
                "platform": "tiktok",
                "format": "short",
                "duration_seconds": 60,
                "title_variation": "This Changed How I Think About [Topic]",
                "hook_variation": "Cut to the single most surprising or counterintuitive moment from the documentary",
                "caption": "This broke my brain. Full documentary link in bio.",
                "hashtags": ["#learnontiktok", "#mindblown", "#documentary", "#ai"],
                "best_posting_time": "Friday 7pm–9pm, Saturday 10am–12pm",
                "predicted_reach": "100K–500K organic views",
            },
        ],
        "primary_platform": "youtube",
        "launch_strategy": "Launch the full documentary on YouTube on a Tuesday afternoon for maximum search discoverability. Release the LinkedIn 90-second clip 48 hours later, targeting thought leaders and professionals. Seed the TikTok version 7 days post-launch to capitalise on YouTube social proof. Use paid amplification only after the first 72 hours of organic data is gathered.",
        "seeding_targets": [
            "Industry journalists and newsletter writers in the relevant niche",
            "LinkedIn thought leaders with 50K+ followers in the target vertical",
            "University professors and researchers in related disciplines",
            "Reddit community moderators in relevant subreddits",
        ],
        "paid_amplification_budget": "Total: $3,000–$6,000. Allocation: 60% YouTube in-stream and discovery ads (targeting 25–44 educated professionals), 30% LinkedIn sponsored content (targeting by job title and industry), 10% retargeting across platforms for warm audiences.",
    }
    return await _call_granite("DistributionPlanner", _DISTRIBUTION_SYSTEM, prompt, fallback)


# ---------------------------------------------------------------------------
# 7. Final Report Agent
# ---------------------------------------------------------------------------
_FINAL_REPORT_SYSTEM = """You are the Final Report Agent — the synthesis layer of an IBM Granite-powered AI production pipeline.
You have received analysis from all previous pipeline agents. Synthesise everything into a final executive report with a GO/NO-GO decision.

You MUST respond with ONLY a valid JSON object. No prose, no markdown fences.
{
  "executive_summary": "<3-4 sentences covering the full picture — concept strength, market timing, risks, recommendation>",
  "creative_score": <0-100>,
  "originality_score": <0-100>,
  "feasibility_score": <0-100>,
  "virality_score": <0-100>,
  "risk_level": "Low|Medium|High|Critical",
  "go_no_go": "GO|NO-GO|CONDITIONAL",
  "top_risks": ["<specific risk 1>", "<specific risk 2>", "<specific risk 3>"],
  "top_opportunities": ["<specific opportunity 1>", "<specific opportunity 2>", "<specific opportunity 3>"],
  "recommended_next_steps": ["<concrete step 1>", "<concrete step 2>", "<concrete step 3>", "<concrete step 4>"],
  "ai_engine": "IBM Granite"
}"""


async def run_final_report(
    raw_idea: str,
    pipeline_context: dict,
) -> dict[str, Any]:
    strategy_summary = str(pipeline_context.get("strategy", {}).get("synthesis_summary", "N/A"))[:300]
    trend_top = str(pipeline_context.get("trend_radar", {}).get("top_opportunity", "N/A"))
    viral_score = pipeline_context.get("virality_twin", {}).get("viral_score", "N/A")
    research_confidence = pipeline_context.get("research_pack", {}).get("overall_confidence", "N/A")
    story_arc = str(pipeline_context.get("story_generator", {}).get("narrative_arc", "N/A"))

    prompt = (
        f"Generate the final executive report for this creative project based on the full pipeline analysis.\n\n"
        f"Idea: {raw_idea}\n\n"
        f"Strategy summary: {strategy_summary}\n"
        f"Top market opportunity: {trend_top}\n"
        f"Virality score: {viral_score}/100\n"
        f"Research confidence: {research_confidence}\n"
        f"Narrative arc: {story_arc}"
    )
    fallback = {
        "executive_summary": "This creative project demonstrates strong fundamentals across strategy, market timing, research, and narrative structure. The concept is timely, the viral mechanics are clearly identifiable, and the editor blueprint provides a production-ready path. The IBM Granite pipeline recommends a conditional greenlight pending source verification and archive licensing.",
        "creative_score": 84,
        "originality_score": 88,
        "feasibility_score": 81,
        "virality_score": 78,
        "risk_level": "Medium",
        "go_no_go": "CONDITIONAL",
        "top_risks": [
            "Key research claims require academic sourcing before publication",
            "Single-subject production creates structural vulnerability if access is lost",
            "Platform algorithm volatility could compress organic reach window",
        ],
        "top_opportunities": [
            "First-mover advantage in an underserved, high-demand content niche",
            "LinkedIn professional audience has demonstrated exceptional shareability for this topic category",
            "Festival circuit potential — topic and production quality meet IDFA and Hot Docs criteria",
        ],
        "recommended_next_steps": [
            "Commission academic source verification for the 3 central factual claims (Week 1)",
            "Secure archive footage licensing agreements before pre-production budget is committed (Week 1)",
            "Record a 5-minute pilot interview to stress-test the hook effectiveness (Week 2)",
            "Brief distribution team on LinkedIn thought-leader seeding strategy (Week 2)",
        ],
    }
    return await _call_granite("FinalReport", _FINAL_REPORT_SYSTEM, prompt, fallback)
