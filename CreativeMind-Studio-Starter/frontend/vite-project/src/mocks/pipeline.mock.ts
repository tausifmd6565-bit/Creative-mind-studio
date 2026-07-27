/**
 * mocks/pipeline.mock.ts
 *
 * Polished demo data for 3 canonical pipeline examples.
 * All powered by IBM Granite (ai_engine field set on every object).
 *
 * Demo 1: "The Invisible Cost of Optimization" — AI replacing jobs
 * Demo 2: "Ten Rivers" — Ocean pollution documentary
 * Demo 3: "The Battery Cost" — Future of electric vehicles
 */

import type { PipelineResult } from '../types/pipeline.types';

// ─── DEMO 1: AI Jobs ──────────────────────────────────────────────────────────

export const DEMO_AI_JOBS: PipelineResult = {
  project_id: 'demo-ai-jobs',
  pipeline_id: 'demo-pipeline-001',
  status: 'completed',
  ai_engine: 'IBM Granite',
  stages_completed: [
    'strategy_debate','trend_radar','virality_twin',
    'research_pack','story_generator','editor_blueprint',
    'distribution','final_report',
  ],
  trend_radar: {
    signals: [
      { signal: 'AI job displacement discourse', volume: 'high', growth_rate: '+78%', relevance_score: 97, reason: 'Peak public anxiety around AI replacing white-collar jobs' },
      { signal: 'Documentary as explainer format', volume: 'high', growth_rate: '+42%', relevance_score: 88, reason: 'Long-form documentary sees resurgence for complex social topics' },
      { signal: 'LinkedIn thought leadership content', volume: 'high', growth_rate: '+55%', relevance_score: 91, reason: 'Professional audiences sharing career-disruption stories at record rates' },
      { signal: 'Human skills renaissance movement', volume: 'medium', growth_rate: '+31%', relevance_score: 82, reason: 'Counter-movement emphasising irreplaceable human attributes' },
    ],
    top_opportunity: 'Capture peak demand with a humanised, evidence-backed documentary on AI and human work',
    timing_recommendation: 'Launch now — AI job displacement is at peak news cycle. Window closes in 6–9 months.',
    ai_engine: 'IBM Granite',
  },
  virality_twin: {
    matched_campaign: 'The Social Dilemma',
    description: 'Combines the personal narrative of real affected workers with the systemic analysis that made The Social Dilemma so shareable among educated professionals.',
    viral_mechanics: ['First-person professional identity resonance', 'Shareable "which jobs are safe?" hook', 'Credentialed expert voices'],
    similarity_score: 79, viral_score: 86,
    predicted_reach: '400K–900K organic views in first 30 days',
    key_differentiators: ['Three-subject narrative creates wider identification', 'Industry cross-section avoids single-sector echo chamber'],
    recommendation: 'Lead with the most surprising data point. Open on the most sympathetic subject. Let the audience self-identify before the systemic analysis.',
    ai_engine: 'IBM Granite',
  },
  research_pack: {
    claims: [
      { claim: '47% of current US jobs are at high risk of automation in the next two decades', evidence: 'Oxford University study analysed 702 occupations using machine learning', confidence: 0.89, source: 'Oxford University Future of Employment Study', source_type: 'academic', citation: 'Frey, C.B. & Osborne, M.A. (2013). The Future of Employment. University of Oxford.', verified: true },
      { claim: '80% of US workers could have at least 10% of their tasks affected by LLMs', evidence: 'GPT-4 technical capability report cross-referenced with O*NET task taxonomies', confidence: 0.85, source: 'OpenAI / Penn University LLM Exposure Study 2023', source_type: 'academic', citation: 'Eloundou, T. et al. (2023). GPTs are GPTs: An Early Look at the Labor Market Impact Potential. arXiv.', verified: true },
      { claim: 'AI-related job postings grew 75% in 2023 despite displacement concerns', evidence: 'LinkedIn economic graph data showing simultaneous displacement and creation', confidence: 0.78, source: 'LinkedIn Economic Graph Research 2024', source_type: 'industry', citation: 'LinkedIn, Jobs on the Rise 2024. https://economicgraph.linkedin.com', verified: false },
    ],
    key_statistics: ['47% of US jobs high-risk (Oxford)', '80% workers face 10%+ task disruption from LLMs (OpenAI/Penn)', 'AI job postings +75% in 2023 (LinkedIn)'],
    knowledge_gaps: ['Long-term wage data for displaced workers unavailable', 'Industry-specific re-training success rates not comprehensively studied'],
    overall_confidence: 0.84, source_diversity_score: 82,
    research_summary: 'Strong academic evidence. Oxford and OpenAI/Penn studies are peer-reviewed and widely cited. Net employment effect remains genuinely contested — documentary should reflect this complexity.',
    ai_engine: 'IBM Granite',
  },
  story_generator: {
    narrative_arc: 'three_act',
    hook: 'Open on three pairs of hands: keyboard, pen, stethoscope. A cursor blinks on each screen. Slowly, each screen fills with AI-generated output mirroring their work. 8 seconds. No narration.',
    story_beats: [
      { beat_number: 1, title: 'Three Lives, One Question', description: 'Introduce Sarah (accountant), Marcus (designer), Dr. Chen (radiologist). Each at work — confident, purposeful.', emotional_note: 'Identification and warmth', duration_seconds: 180 },
      { beat_number: 2, title: 'The Algorithm Arrives', description: 'The specific AI tool that encroaches on each domain. Speed and accuracy. The efficiency argument made unflinchingly.', emotional_note: 'Unease and curiosity', duration_seconds: 240 },
      { beat_number: 3, title: 'What the Numbers Say', description: 'Oxford study, wage projections, timeline. Subjects react in real time.', emotional_note: 'Intellectual tension', duration_seconds: 300 },
      { beat_number: 4, title: 'The Human Remainder', description: 'What each subject does that the AI cannot. Client relationship. Creative rooted in loss. Diagnosis with unexpected hope.', emotional_note: 'Emotional peak — human value reasserted', duration_seconds: 360 },
      { beat_number: 5, title: 'The Choice We Haven\'t Made Yet', description: 'Not will AI replace humans — but who decides how the transition happens, and who is left out.', emotional_note: 'Urgency and agency', duration_seconds: 180 },
    ],
    emotional_curve: [
      { timestamp_pct: 0, intensity: 68, label: 'Hook' },
      { timestamp_pct: 20, intensity: 72, label: 'Character establishment' },
      { timestamp_pct: 40, intensity: 82, label: 'Disruption revealed' },
      { timestamp_pct: 60, intensity: 91, label: 'Stakes clarified' },
      { timestamp_pct: 80, intensity: 97, label: 'Human dimension — peak' },
      { timestamp_pct: 100, intensity: 75, label: 'Resolution with urgency' },
    ],
    call_to_action: 'The transition is happening. Who designs it should be everyone\'s question.',
    estimated_duration_seconds: 1260, ai_engine: 'IBM Granite',
  },
  editor_blueprint: {
    timeline: [
      { timecode: '00:00 – 00:08', narration: 'No narration — observational cold open', visual: 'ECU split-screen: three pairs of hands. Each screen fills with AI output.', audio: 'Ambient keyboard sounds. Silence before the storm.', motion_graphics: 'No text. No title.', notes: 'Hold the full 8 seconds. This is the hook.' },
      { timecode: '00:08 – 02:00', narration: 'Meet Sarah. She has balanced this family\'s accounts for eleven years.', visual: 'Medium shot, subject in environment. Warm practical light.', audio: 'Piano motif begins. Single note.', motion_graphics: 'Name lower-third: "Sarah Kim, CPA — 15 years" at 0:45.', notes: '40 seconds per subject maximum.' },
      { timecode: '02:00 – 05:00', narration: 'Then a startup shipped an update.', visual: 'AI tool interface. Task completed in 3 seconds. Each subject watching their screen.', audio: 'Music tempo increases. Low digital SFX.', motion_graphics: '"Task completed: 2.8 seconds" — animated.', notes: 'Show AI capability directly. Let the speed speak.' },
      { timecode: '05:00 – 09:00', narration: 'The Oxford researchers called it the 47% problem.', visual: 'Interview cross-cuts. Data visualisation. Job categories filling with red.', audio: 'Music builds. Full arrangement enters.', motion_graphics: '47% counter. Job category chart. Source: Oxford University.', notes: 'Keep emotional cuts — prevent evidence section going cold.' },
      { timecode: '09:00 – 13:00', narration: 'But watch what happens when the algorithm meets the edge case.', visual: 'Sarah\'s client conversation. Marcus creating from grief. Dr. Chen\'s diagnosis.', audio: 'Music drops to underscore. Interview audio clean.', motion_graphics: 'Minimal. This section lives in the human moment.', notes: 'The emotional core. Why people will share.' },
      { timecode: '13:00 – 15:00', narration: 'The question was never whether the machine could do the task. It was always: who decides what we\'re optimizing for.', visual: 'Final wide shots. Slow push in on Sarah\'s face.', audio: 'Piano solo. Final note hangs.', motion_graphics: 'End title. CTA. IBM Granite badge.', notes: 'Land the reframe. End on agency.' },
    ],
    broll_list: ['Open-plan office — knowledge workers at screens', 'AI interface demonstrations', 'Oxford University exterior', 'Data centre B-roll', 'Subject workspace detail shots', 'Subject candid shots'],
    music_brief: 'Piano-led. Opens with single note, builds through sparse strings to full ensemble. Resolves to solo piano. Reference: Ólafur Arnalds. 68–76 BPM.',
    color_grade_direction: 'Warm humanised tones for character sequences. Cool-blue for AI/data. Return to warm for resolution. Reference: Kelly Reichardt visual style.',
    total_scenes: 6, estimated_runtime_seconds: 900,
    export_formats: ['1080p/24fps YouTube master', '9:16 Instagram Reels', '1:1 LinkedIn', '16:9 Twitter/X'],
    ai_engine: 'IBM Granite',
  },
  distribution: {
    platform_variants: [
      { platform: 'youtube', format: 'long', duration_seconds: 900, title_variation: 'The 47% Problem: Three People Facing AI Automation', hook_variation: 'Cold open split-screen hands — no title card for 45 seconds', caption: 'They did their jobs perfectly. Then the algorithm arrived.', hashtags: ['#AIjobs', '#automation', '#documentary', '#futureofwork'], best_posting_time: 'Tuesday 2pm EST', predicted_reach: '80K–300K organic views' },
      { platform: 'linkedin', format: 'clip', duration_seconds: 90, title_variation: 'What AI Can\'t Replicate (90-Second Excerpt)', hook_variation: 'Sarah\'s client conversation with AI version playing beside it.', caption: 'The most important 90 seconds. Full documentary in comments.', hashtags: ['#futureofwork', '#AIethics', '#leadership'], best_posting_time: 'Wednesday 8am EST', predicted_reach: '30K–120K organic impressions' },
      { platform: 'tiktok', format: 'short', duration_seconds: 58, title_variation: 'Is Your Job Safe From AI?', hook_variation: '"47% of jobs. High risk. Here are three of them."', caption: 'We followed them for 6 months. Full doc in bio.', hashtags: ['#AIjobs', '#documentary', '#learnontiktok'], best_posting_time: 'Friday 7pm EST', predicted_reach: '200K–800K organic views' },
    ],
    primary_platform: 'youtube',
    launch_strategy: 'Full documentary YouTube on Tuesday. LinkedIn 90s excerpt 48 hours later. TikTok 7 days after YouTube for social proof amplification.',
    seeding_targets: ['Future of Work journalists (Axios, WorkLife)', 'LinkedIn HR thought leaders', 'University career counsellors', 'Tech ethics researchers'],
    paid_amplification_budget: '$4,000–$8,000: 65% YouTube, 25% LinkedIn, 10% retargeting.',
    ai_engine: 'IBM Granite',
  },
  final_report: {
    executive_summary: 'Strong GO. AI jobs discourse is at peak interest. Three-subject structure is emotionally proven. Oxford/Penn research base is robust. Primary risk is timing — optimal window is the next 4–6 months.',
    creative_score: 88, originality_score: 82, feasibility_score: 85, virality_score: 86,
    risk_level: 'Low', go_no_go: 'GO',
    top_risks: ['Subject institutional access restriction (Dr. Chen)', 'Narrative may feel dated in 12+ months', 'LinkedIn algorithm deprioritising video'],
    top_opportunities: ['Oxford citation earns media coverage', 'LinkedIn audience self-identifies and shares', 'IDFA / Hot Docs festival criteria met'],
    recommended_next_steps: ['Confirm subject consent and institutional release (Week 1)', 'Secure Oxford researcher interview (Week 2)', 'Pre-negotiate LinkedIn distribution partnership (Week 2)', 'Begin filming with Dr. Chen first (most time-sensitive access)'],
    ai_engine: 'IBM Granite',
  },
};

// ─── DEMO 2: Ocean Pollution ──────────────────────────────────────────────────

export const DEMO_OCEAN: PipelineResult = {
  project_id: 'demo-ocean', pipeline_id: 'demo-pipeline-002',
  status: 'completed', ai_engine: 'IBM Granite',
  stages_completed: ['strategy_debate','trend_radar','virality_twin','research_pack','story_generator','editor_blueprint','distribution','final_report'],
  trend_radar: {
    signals: [
      { signal: 'Plastic pollution crisis awareness', volume: 'high', growth_rate: '+62%', relevance_score: 95, reason: 'Policy debates driving sustained media attention' },
      { signal: 'Systems-thinking environmental content', volume: 'medium', growth_rate: '+44%', relevance_score: 88, reason: 'Audience fatigue with individual-blame; demand for systemic analysis' },
      { signal: 'River-to-ocean research publications', volume: 'medium', growth_rate: '+38%', relevance_score: 91, reason: 'New Science journal findings creating news peg' },
      { signal: 'Documentary as climate communication', volume: 'high', growth_rate: '+51%', relevance_score: 86, reason: 'Proven format for sustained behaviour and policy change' },
    ],
    top_opportunity: 'Reframe plastic pollution from individual guilt to systemic infrastructure — a narrative the audience has not seen at this depth',
    timing_recommendation: 'Launch 6 weeks before the next UN plastic treaty negotiation for maximum policy impact.',
    ai_engine: 'IBM Granite',
  },
  virality_twin: {
    matched_campaign: 'An Inconvenient Truth × Seaspiracy',
    description: 'Data-rigour of An Inconvenient Truth with the confrontational field reporting of Seaspiracy — minus the methodological controversies.',
    viral_mechanics: ['Counterintuitive reveal: 10 rivers = 80%', 'Geographic specificity (named rivers, named countries)', 'Policy accountability angle'],
    similarity_score: 74, viral_score: 82,
    predicted_reach: '350K–750K organic views in first 30 days',
    key_differentiators: ['Geographic field reporting elevates credibility', 'Policy solution angle prevents despair trap'],
    recommendation: 'The 10-rivers statistic IS the hook. Open on it without context. Let the shock do the distribution work.',
    ai_engine: 'IBM Granite',
  },
  research_pack: {
    claims: [
      { claim: '80% of ocean plastic waste originates from just 10 rivers', evidence: 'Hydrological flow modelling of plastic debris from river sources to ocean entry points', confidence: 0.91, source: 'Science Journal — Schmidt et al. 2017', source_type: 'academic', citation: 'Schmidt, C. et al. (2017). Export of Plastic Debris by Rivers into the Sea. Environmental Science & Technology.', verified: true },
      { claim: 'All 10 high-contributing rivers are in Asia and Africa — linked to inadequate waste infrastructure', evidence: 'World Bank waste management infrastructure data correlation', confidence: 0.87, source: 'World Bank Solid Waste Management 2023', source_type: 'government', citation: 'World Bank. (2023). What a Waste 2.0: A Global Snapshot of Solid Waste Management.', verified: true },
      { claim: 'Corporate plastic production grew 9% in 2023 despite public pledges', evidence: 'OECD Global Plastics Outlook production vs. recycling ratios', confidence: 0.83, source: 'OECD Global Plastics Outlook 2024', source_type: 'government', citation: 'OECD. (2024). Global Plastics Outlook: Policy Scenarios to 2060.', verified: false },
    ],
    key_statistics: ['10 rivers = 80% of ocean plastic (Science, 2017)', 'Only 9% of plastic is recycled globally (OECD)', 'Asia-Pacific: 82% of land-based ocean plastic waste'],
    knowledge_gaps: ['Long-term river cleanup efficacy data limited (<5 years)', 'Corporate voluntary pledges largely unaudited'],
    overall_confidence: 0.88, source_diversity_score: 86,
    research_summary: 'Exceptional academic and government source base. Schmidt et al. is peer-reviewed and widely cited. The corporate production claim requires independent verification.',
    ai_engine: 'IBM Granite',
  },
  story_generator: {
    narrative_arc: 'in_medias_res',
    hook: 'Aerial drone descends over a river. Camera reveals: the water is plastic. Hold. Cut to: "80%".',
    story_beats: [
      { beat_number: 1, title: 'The Number', description: '80% from 10 rivers. Map. All in two continents. Audience expected global — it is concentrated.', emotional_note: 'Shock and counterintuition', duration_seconds: 120 },
      { beat_number: 2, title: 'River One: Citarum', description: 'Field reporting from West Java. Infrastructure failure. Volume vs. capacity.', emotional_note: 'Empathy replacing blame', duration_seconds: 300 },
      { beat_number: 3, title: 'Who Made This Plastic?', description: 'Same brands on the waste. Production data grew 9% despite pledges.', emotional_note: 'Controlled anger', duration_seconds: 240 },
      { beat_number: 4, title: 'The Infrastructure Fix', description: 'Investment in 10 river regions could reduce ocean plastic by 45%. Engineering problem with a budget number.', emotional_note: 'Agency and hope', duration_seconds: 240 },
      { beat_number: 5, title: 'The Treaty Room', description: 'UN plastic treaty negotiations. Gap between science and policy in real time.', emotional_note: 'Urgency', duration_seconds: 180 },
    ],
    emotional_curve: [
      { timestamp_pct: 0, intensity: 78, label: 'Shock hook' },
      { timestamp_pct: 25, intensity: 72, label: 'Empathy arc' },
      { timestamp_pct: 50, intensity: 88, label: 'Corporate anger' },
      { timestamp_pct: 75, intensity: 82, label: 'Solution hope' },
      { timestamp_pct: 100, intensity: 76, label: 'Policy urgency' },
    ],
    call_to_action: 'Demand your government commits to river infrastructure funding in the next UN plastic treaty.',
    estimated_duration_seconds: 1080, ai_engine: 'IBM Granite',
  },
  editor_blueprint: {
    timeline: [
      { timecode: '00:00 – 00:12', narration: 'No narration', visual: 'Aerial drone. Slow reveal: water is plastic. Hold 12 seconds.', audio: 'River sound. Silence.', motion_graphics: '"80%" — white, large. Nothing else.', notes: 'Do not rush this.' },
      { timecode: '00:12 – 01:30', narration: 'Eighty percent of ocean plastic comes from ten rivers. All in Asia and Africa.', visual: 'Animated world map. 10 rivers illuminate.', audio: 'Low drone music. Neutral, urgent.', motion_graphics: 'River names. Country names. "This is an infrastructure problem."', notes: 'Reframe must land in 90 seconds.' },
      { timecode: '01:30 – 06:00', narration: 'We spent three weeks at the Citarum River. The world\'s most polluted river.', visual: 'Ground-level field footage. Community members. Waste facility tour.', audio: 'Music minimal. Field audio. Community voices.', motion_graphics: 'Citarum statistics. Municipal capacity gap animated.', notes: 'Ground truth. Empathy section.' },
      { timecode: '06:00 – 10:00', narration: 'Last year, the companies whose packaging we found increased plastic production by 9%.', visual: 'Product identification on waste. Corporate HQ. Pledges vs. data.', audio: 'Music more percussive.', motion_graphics: 'Corporate pledge vs. production data split screen. OECD credit.', notes: 'Let the data speak.' },
      { timecode: '10:00 – 15:00', narration: 'The solution is known. The cost is calculated. The decision is political.', visual: 'Infrastructure case study. UN negotiation room.', audio: 'Music resolves toward hope.', motion_graphics: 'Cost of programme. Impact: -45% ocean plastic. Treaty timeline.', notes: 'End on agency.' },
      { timecode: '15:00 – 18:00', narration: 'The rivers know where the plastic comes from. So do we.', visual: 'Return to aerial drone. Now: cleanup crew visible.', audio: 'Music to silence. River sound.', motion_graphics: 'CTA. UN treaty URL. IBM Granite badge.', notes: 'Visual callback for closure.' },
    ],
    broll_list: ['Aerial: river plastic from above', 'Ground: Citarum, Ganges, Yangtze', 'Municipal waste facility', 'Community near river', 'Corporate product ID on waste', 'UN negotiation session'],
    music_brief: 'Minimal documentary score. Opens with river ambience. Low strings and sparse piano. Builds through corporate accountability. Resolves for solution. Reference: Jóhann Jóhannsson.',
    color_grade_direction: 'Natural, unmanipulated palette. No filters aestheticizing pollution. Cool-clinical for corporate. Warm for community/solution. Reference: Errol Morris style.',
    total_scenes: 6, estimated_runtime_seconds: 1080,
    export_formats: ['1080p/24fps YouTube master', '9:16 Instagram Reels', '1:1 LinkedIn', 'Festival DCP package'],
    ai_engine: 'IBM Granite',
  },
  distribution: {
    platform_variants: [
      { platform: 'youtube', format: 'long', duration_seconds: 1080, title_variation: 'Ten Rivers: How 80% of Ocean Plastic Is Created (And Who\'s Responsible)', hook_variation: 'Drone/plastic reveal. Thumbnail: aerial shot with "80%" overlaid.', caption: 'The statistic that changes the plastic pollution conversation. Field-reported. Independently verified.', hashtags: ['#oceanplastic', '#documentary', '#environment'], best_posting_time: 'Tuesday 2pm — 6 weeks before UN treaty', predicted_reach: '100K–400K organic views' },
      { platform: 'linkedin', format: 'clip', duration_seconds: 90, title_variation: 'The 10-River Statistic That Should Change Corporate Sustainability Strategy', hook_variation: 'Corporate pledge vs. production data split screen. Direct address.', caption: 'If you work in sustainability, CSR, or supply chain — 90 seconds that changes the conversation.', hashtags: ['#sustainability', '#ESG', '#corporateresponsibility'], best_posting_time: 'Wednesday 8am EST', predicted_reach: '40K–180K organic impressions' },
      { platform: 'tiktok', format: 'short', duration_seconds: 55, title_variation: '80% of ocean plastic. 10 rivers. This is why.', hook_variation: '"80%" full-screen, then drone footage.', caption: 'The statistic that changes everything. Full doc in bio.', hashtags: ['#oceanplastic', '#environment', '#learnontiktok'], best_posting_time: 'Saturday 10am EST', predicted_reach: '300K–1.2M organic views' },
    ],
    primary_platform: 'youtube',
    launch_strategy: '6 weeks before UN treaty session. LinkedIn corporate clip same week. Seed with environmental journalists pre-launch.',
    seeding_targets: ['Environmental journalists (Guardian, BBC, Al Jazeera)', 'UN Environment Programme', 'Corporate CSR directors', 'University environmental science depts'],
    paid_amplification_budget: '$5,000–$10,000: 50% YouTube, 30% LinkedIn CSR targeting, 20% environmental org partnerships.',
    ai_engine: 'IBM Granite',
  },
  final_report: {
    executive_summary: 'Ten Rivers is a strong GO. The 80%-from-10-rivers statistic is peer-reviewed, counterintuitive, and highly shareable. The infrastructure-not-individual-blame framing fills a clear gap. Earned media from environmental journalists is highly probable.',
    creative_score: 91, originality_score: 89, feasibility_score: 82, virality_score: 82,
    risk_level: 'Low', go_no_go: 'GO',
    top_risks: ['Industrial site access restrictions in some countries', 'Corporate legal response to brand ID in waste footage', 'UN treaty timing dependency'],
    top_opportunities: ['UN treaty cycle creates guaranteed earned media', 'Corporate accountability angle drives outrage-sharing', 'Academic source quality enables institution partnerships'],
    recommended_next_steps: ['Secure Schmidt et al. researcher interview', 'Legal review for corporate brand identification protocol', 'Begin permit acquisition for Indonesia and Bangladesh', 'Contact UN Environment Programme for treaty access'],
    ai_engine: 'IBM Granite',
  },
};

// ─── DEMO 3: Electric Vehicles ────────────────────────────────────────────────

export const DEMO_EV: PipelineResult = {
  project_id: 'demo-ev', pipeline_id: 'demo-pipeline-003',
  status: 'completed', ai_engine: 'IBM Granite',
  stages_completed: ['strategy_debate','trend_radar','virality_twin','research_pack','story_generator','editor_blueprint','distribution','final_report'],
  trend_radar: {
    signals: [
      { signal: 'EV adoption policy mandate wave', volume: 'high', growth_rate: '+88%', relevance_score: 94, reason: 'EU 2035 ban, US IRA incentives, China dominance creating major public discourse' },
      { signal: 'Battery supply chain ethics concern', volume: 'high', growth_rate: '+71%', relevance_score: 96, reason: 'Lithium and cobalt mining conditions becoming mainstream consumer concern' },
      { signal: 'Clean energy greenwashing backlash', volume: 'medium', growth_rate: '+58%', relevance_score: 89, reason: 'Audiences skeptical of "clean" claims without full lifecycle analysis' },
      { signal: 'Investigative documentary prestige', volume: 'high', growth_rate: '+46%', relevance_score: 82, reason: 'Investigative docs earning awards and prestige media placement' },
    ],
    top_opportunity: 'The battery cost paradox — EVs are the solution, but extraction is an environmental crisis. The most important unresolved contradiction in clean energy.',
    timing_recommendation: 'Launch now — lithium supply chain is in peak news cycle. IRA and EU mandates ensure 18+ months of sustained audience interest.',
    ai_engine: 'IBM Granite',
  },
  virality_twin: {
    matched_campaign: 'Seaspiracy × The True Cost',
    description: 'Seaspiracy\'s investigative field credibility with The True Cost\'s supply chain accountability framework — applied to clean energy.',
    viral_mechanics: ['Cognitive dissonance hook: "clean energy isn\'t clean"', 'Field reporting from sacrifice zones', 'Consumer implication — every EV has a supply chain'],
    similarity_score: 77, viral_score: 84,
    predicted_reach: '450K–1M organic views in first 30 days',
    key_differentiators: ['EV angle is more politically contested — broader audience', 'Solution path exists (recycled batteries, alternative chemistries)'],
    recommendation: 'Lead with the cognitive dissonance. EV charging → lithium mine. The contrast is the entire documentary\'s power.',
    ai_engine: 'IBM Granite',
  },
  research_pack: {
    claims: [
      { claim: 'One tonne of lithium carbonate requires ~2 million litres of water via brine evaporation', evidence: 'Hydrological studies of the Atacama Salt Flat, the world\'s largest lithium production zone', confidence: 0.88, source: 'Universidad Católica del Norte — Atacama Hydrogeology 2022', source_type: 'academic', citation: 'Marazuela, M.A. et al. (2022). Hydrogeology of the Atacama lithium brine system. Hydrogeology Journal.', verified: true },
      { claim: 'Lithium mining reduced water availability for indigenous Atacameño communities by ~65%', evidence: 'Community water access data correlated with extraction volumes over 20 years', confidence: 0.79, source: 'Chilean Human Rights Commission Environmental Report 2023', source_type: 'government', citation: 'INDH Chile. (2023). Informe Ambiental: Minería del Litio y Derechos Hídricos en Atacama.', verified: false },
      { claim: 'Solid-state battery technology could reduce lithium requirements by up to 70% per battery pack', evidence: 'Laboratory-scale performance data extrapolated to vehicle scale', confidence: 0.72, source: 'MIT Energy Initiative — Solid-State Battery Roadmap 2024', source_type: 'academic', citation: 'MIT Energy Initiative. (2024). Solid-State Batteries: A Technology Roadmap. MITEI Report.', verified: false },
    ],
    key_statistics: ['2M litres water per tonne of lithium (Atacama hydrogeology)', '65% estimated community water reduction in mining zones', 'Solid-state batteries could cut lithium demand 70% (MIT)'],
    knowledge_gaps: ['Long-term groundwater recovery rates post-mining not established', 'Full lifecycle carbon analysis varies significantly by electricity grid'],
    overall_confidence: 0.80, source_diversity_score: 79,
    research_summary: 'Atacama hydrogeology data is peer-reviewed and solid. Community impact claim requires additional independent verification. MIT solid-state data is preliminary — should be presented as projected.',
    ai_engine: 'IBM Granite',
  },
  story_generator: {
    narrative_arc: 'documentary',
    hook: 'Tesla charging at a Supercharger. Clean, quiet. Cut: Atacama satellite aerial — white salt, blue evaporation pools. Cut: man carrying water in a bucket. 10 seconds. No narration.',
    story_beats: [
      { beat_number: 1, title: 'The Clean Promise', description: 'EV moment — policy mandates, sales figures, cultural shift. The clean future is being sold everywhere.', emotional_note: 'Familiarity, then creeping unease', duration_seconds: 180 },
      { beat_number: 2, title: 'The Atacama Reality', description: 'Field reporting from Chile. Scale of extraction. Water economics. The community.', emotional_note: 'Cognitive dissonance lands', duration_seconds: 360 },
      { beat_number: 3, title: 'The Corporate Promise', description: 'Executive interviews. Then supplier audits. Gap between pledge and practice.', emotional_note: 'Informed anger', duration_seconds: 240 },
      { beat_number: 4, title: 'The Scientists Working on It', description: 'MIT solid-state battery lab. The technology. The timeline. The investment gap.', emotional_note: 'Qualified hope', duration_seconds: 240 },
      { beat_number: 5, title: 'The Choice We\'re Making Right Now', description: 'Return to Atacama. Return to charging station. What do we do with this?', emotional_note: 'Agency and responsibility', duration_seconds: 240 },
    ],
    emotional_curve: [
      { timestamp_pct: 0, intensity: 62, label: 'Familiar EV world' },
      { timestamp_pct: 20, intensity: 75, label: 'First dissonance' },
      { timestamp_pct: 40, intensity: 92, label: 'Atacama reality' },
      { timestamp_pct: 60, intensity: 88, label: 'Corporate accountability' },
      { timestamp_pct: 80, intensity: 78, label: 'Technology hope' },
      { timestamp_pct: 100, intensity: 74, label: 'Urgent choice' },
    ],
    call_to_action: 'Ask your manufacturer what their battery supply chain looks like. The clean energy transition needs to actually be clean.',
    estimated_duration_seconds: 1260, ai_engine: 'IBM Granite',
  },
  editor_blueprint: {
    timeline: [
      { timecode: '00:00 – 00:10', narration: 'No narration', visual: 'Tesla charger. Then Atacama aerial. Then man with water bucket. 3-cut sequence.', audio: 'EV hum. Wind. Footsteps.', motion_graphics: '"Where does your battery come from?"', notes: 'The entire documentary in 10 seconds.' },
      { timecode: '00:10 – 03:00', narration: 'In 2023, one in six cars sold globally was electric. By 2035, the EU will ban petrol vehicles.', visual: 'EV sales data animation. Policy announcements. Charging infrastructure.', audio: 'Light, forward-moving score.', motion_graphics: 'Sales data. EU ban timeline. Market share projection.', notes: 'Establish clean promise fully before dismantling it.' },
      { timecode: '03:00 – 10:00', narration: 'The Atacama contains the world\'s largest lithium reserves. And the water supply of 18,000 indigenous people.', visual: 'Ground-level field footage. Mining scale. Community water sources.', audio: 'Music sparse, concerned. Community voices. Wind.', motion_graphics: 'Water per tonne lithium. Community reduction %. Source credits.', notes: 'Field reporting is the heart. Take the time.' },
      { timecode: '10:00 – 13:00', narration: 'Every major automotive brand has a sustainability pledge. We asked each for their Atacama supplier audit.', visual: 'Corporate pledge montage. Silence after audit request. Limited data provided.', audio: 'Music more assertive.', motion_graphics: 'Pledge text. Audit response dates. Data gaps highlighted.', notes: 'Let the lack of response speak.' },
      { timecode: '13:00 – 17:00', narration: 'The battery technology that could change this is in a lab at MIT. It uses 70% less lithium. It needs investment.', visual: 'MIT lab. Solid-state cells. Researcher interview.', audio: 'Music turns hopeful — genuinely open.', motion_graphics: 'Lithium reduction: 70%. Timeline to commercial viability. Investment gap.', notes: 'Hope must feel earned. Clearly caveat: projected, not proven.' },
      { timecode: '17:00 – 20:00', narration: 'Whether the clean energy transition is actually clean depends on decisions being made right now.', visual: 'Return to Atacama. Return to charging station. Two worlds, one choice.', audio: 'Music resolves. Single piano note.', motion_graphics: 'CTA: "Ask your manufacturer. Ask your government." IBM Granite badge.', notes: 'End on specific demand, not vague hope.' },
    ],
    broll_list: ['Tesla Supercharger — consumer world', 'Atacama Salt Flat aerial', 'Lithium evaporation pools ground level', 'Indigenous community water access — daily life', 'Mining operation at scale', 'MIT solid-state battery lab', 'Corporate sustainability office'],
    music_brief: 'Opens in neutral optimism. Turns sparse/concerned for Atacama. Pointed for corporate accountability. Open/hopeful for technology. Quiet responsibility for finale. Reference: Thomas Newman "Road to Perdition" palette.',
    color_grade_direction: 'High-contrast vivid for consumer EV world (clean blues/whites). Bleached for Atacama — beauty and extraction. Cool-blue for corporate. Warm earth for community. Reference: Ansel Adams applied to film.',
    total_scenes: 6, estimated_runtime_seconds: 1200,
    export_formats: ['1080p/24fps YouTube master', '9:16 Instagram Reels', '1:1 LinkedIn', 'Festival DCP (2K scope)'],
    ai_engine: 'IBM Granite',
  },
  distribution: {
    platform_variants: [
      { platform: 'youtube', format: 'long', duration_seconds: 1200, title_variation: 'The Battery Cost: Is Your EV Actually Clean?', hook_variation: 'Tesla-to-Atacama 3-cut. Thumbnail: charging station vs mining site split.', caption: 'Every EV has a supply chain. Field-reported from Chile. Peer-reviewed sources linked.', hashtags: ['#EVbattery', '#sustainability', '#documentary', '#cleanenergy'], best_posting_time: 'Tuesday 3pm EST', predicted_reach: '120K–500K organic views' },
      { platform: 'linkedin', format: 'clip', duration_seconds: 90, title_variation: 'The Inconvenient Truth About EV Battery Supply Chains', hook_variation: '"We asked every major automotive brand for their Atacama supplier audit. Here\'s what we got."', caption: 'If you work in automotive, energy, or sustainability — 90 seconds that changes the conversation.', hashtags: ['#sustainability', '#EVindustry', '#supplychainethics'], best_posting_time: 'Wednesday 7am EST', predicted_reach: '50K–200K organic impressions' },
      { platform: 'tiktok', format: 'short', duration_seconds: 58, title_variation: 'Is your EV actually green?', hook_variation: 'Atacama satellite aerial: "This is where your EV battery comes from."', caption: 'The clean energy paradox nobody is talking about. Full doc in bio.', hashtags: ['#EVbattery', '#climatechange', '#learnontiktok'], best_posting_time: 'Friday 8pm EST', predicted_reach: '400K–1.5M organic views' },
    ],
    primary_platform: 'youtube',
    launch_strategy: 'Launch during major EV policy announcement. LinkedIn accountability clip within 24 hours. TikTok for maximum first-week reach — cognitive dissonance hook suits the format.',
    seeding_targets: ['Climate journalists', 'Automotive analysts and trade press', 'EV owner communities (r/electricvehicles)', 'University engineering and sustainability programmes'],
    paid_amplification_budget: '$6,000–$12,000: 55% YouTube, 30% LinkedIn automotive/ESG titles, 15% environmental org partnerships.',
    ai_engine: 'IBM Granite',
  },
  final_report: {
    executive_summary: 'The Battery Cost is a strong GO. The cognitive dissonance hook is among the most powerful in the genre. Atacama field reporting provides irreplaceable visceral proof. Academic partnerships are available.',
    creative_score: 90, originality_score: 87, feasibility_score: 80, virality_score: 84,
    risk_level: 'Medium', go_no_go: 'GO',
    top_risks: ['Chilean mining company may restrict filming access', 'Automotive corporate legal response to audit sequence', 'Must avoid being misread as anti-EV — framing must be precise'],
    top_opportunities: ['MIT partnership for academic credibility', 'EU policy cycle creates guaranteed earned media', 'First major doc on battery supply chain with peer-reviewed sourcing'],
    recommended_next_steps: ['Apply for Atacama filming permits (6-8 week process — start immediately)', 'Retain environmental legal counsel for corporate section', 'Contact MIT Energy Initiative for researcher interview', 'Develop "pro-transition, pro-accountability" framing guide'],
    ai_engine: 'IBM Granite',
  },
};
