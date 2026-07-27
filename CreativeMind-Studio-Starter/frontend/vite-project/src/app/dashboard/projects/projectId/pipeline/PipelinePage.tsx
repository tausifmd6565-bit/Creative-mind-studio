/**
 * PipelinePage.tsx
 * Full 9-stage IBM Granite AI Pipeline view.
 * Phase 1,2,4,6,7 implementation.
 */

import React, { useState, useCallback } from 'react';
import { pipelineService, DEMO_PRESETS } from '../../../../../services/pipeline.service';
import type { PipelineResult, PipelineDemoPreset, TimelineRowItem, ResearchClaimItem } from '../../../../../types/pipeline.types';

const DEMO_OPTIONS = [
  { id: 'ai_jobs' as PipelineDemoPreset,           label: 'AI Replacing Jobs',    desc: 'The Invisible Cost of Optimization' },
  { id: 'ocean_pollution' as PipelineDemoPreset,   label: 'Ocean Pollution',       desc: 'Ten Rivers — 80% of plastic from 10 rivers' },
  { id: 'electric_vehicles' as PipelineDemoPreset, label: 'Electric Vehicles',     desc: 'The Battery Cost — EV supply chains' },
];

const STAGES = [
  { id: 'strategy_debate', label: '1. Strategy Debate' },
  { id: 'trend_radar', label: '2. Trend Radar' },
  { id: 'virality_twin', label: '3. Virality Twin' },
  { id: 'research_pack', label: '4. Research Pack' },
  { id: 'story_generator', label: '5. Story Generator' },
  { id: 'editor_blueprint', label: '6. Editor Blueprint' },
  { id: 'distribution', label: '7. Distribution Plan' },
  { id: 'final_report', label: '8. Final Report' },
];

const s = (color: string) => ({
  background: color + '22', border: `1px solid ${color}55`, borderRadius: 8, padding: '12px 16px',
});

const GraniteBadge = () => (
  <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:20,background:'#1e3a5f',border:'1px solid #3b82f6',fontSize:11,color:'#93c5fd',fontWeight:600 }}>
    ⬡ IBM Granite
  </span>
);

const GoNoGo = ({ v }: { v: string }) => {
  const c = v === 'GO' ? '#22c55e' : v === 'NO-GO' ? '#ef4444' : '#f59e0b';
  return <span style={{ padding:'6px 20px',borderRadius:6,background:c+'22',border:`2px solid ${c}`,fontSize:16,fontWeight:800,color:c,letterSpacing:2 }}>{v}</span>;
};

const Bar = ({ val, max = 1 }: { val: number; max?: number }) => {
  const pct = max === 1 ? Math.round(val * 100) : val;
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display:'flex',gap:8,alignItems:'center' }}>
      <div style={{ flex:1,height:5,background:'#1e293b',borderRadius:4,overflow:'hidden' }}>
        <div style={{ width:pct+'%',height:'100%',background:color,borderRadius:4 }} />
      </div>
      <span style={{ fontSize:11,color,minWidth:30 }}>{pct}%</span>
    </div>
  );
};

const ScoreBox = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{ textAlign:'center',padding:'12px 8px',background:'#1e293b',borderRadius:8,border:'1px solid #334155' }}>
    <div style={{ fontSize:26,fontWeight:800,color }}>{value}</div>
    <div style={{ fontSize:11,color:'#9ca3af',marginTop:2 }}>{label}</div>
  </div>
);

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background:'#0f172a',border:'1px solid #1e293b',borderRadius:12,padding:24,marginBottom:20 }}>
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
      <h3 style={{ margin:0,fontSize:15,color:'#f8fafc',fontWeight:700 }}>{title}</h3>
      <GraniteBadge />
    </div>
    {children}
  </div>
);

const EditorTable = ({ rows }: { rows: TimelineRowItem[] }) => (
  <div style={{ overflowX:'auto' }}>
    <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
      <thead>
        <tr style={{ background:'#1e293b' }}>
          {['Time','Narration','Visual','Audio','Motion Graphics','Notes'].map(h => (
            <th key={h} style={{ padding:'8px 10px',textAlign:'left',color:'#94a3b8',fontWeight:600,borderBottom:'1px solid #334155',whiteSpace:'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom:'1px solid #1e293b',background: i%2===0 ? 'transparent' : '#0f1929' }}>
            <td style={{ padding:'8px 10px',color:'#60a5fa',fontWeight:600,whiteSpace:'nowrap' }}>{row.timecode}</td>
            <td style={{ padding:'8px 10px',color:'#e2e8f0',maxWidth:180 }}>{row.narration}</td>
            <td style={{ padding:'8px 10px',color:'#cbd5e1',maxWidth:180 }}>{row.visual}</td>
            <td style={{ padding:'8px 10px',color:'#94a3b8',maxWidth:140 }}>{row.audio}</td>
            <td style={{ padding:'8px 10px',color:'#a78bfa',maxWidth:140 }}>{row.motion_graphics}</td>
            <td style={{ padding:'8px 10px',color:'#6b7280',maxWidth:120,fontStyle:'italic',fontSize:11 }}>{row.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ClaimsTable = ({ claims }: { claims: ResearchClaimItem[] }) => (
  <div>
    {claims.map((c, i) => (
      <div key={i} style={{ padding:'12px 0',borderBottom: i<claims.length-1 ? '1px solid #1e293b':'none' }}>
        <div style={{ fontSize:13,color:'#f8fafc',fontWeight:600,marginBottom:4 }}>{c.claim}</div>
        <div style={{ fontSize:12,color:'#94a3b8',marginBottom:8 }}>{c.evidence}</div>
        <div style={{ display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:4 }}>
          <div style={{ width:120 }}><Bar val={c.confidence} /></div>
          <span style={{ fontSize:11,padding:'2px 8px',borderRadius:4,background:'#1e293b',color:'#94a3b8' }}>{c.source_type}</span>
          {c.verified && <span style={{ color:'#22c55e',fontSize:11 }}>✓ Verified</span>}
        </div>
        <div style={{ fontSize:11,color:'#6b7280',fontStyle:'italic' }}>{c.citation}</div>
      </div>
    ))}
  </div>
);

export const PipelinePage: React.FC<{ projectId?: string }> = ({ projectId = 'demo-project' }) => {
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneStages, setDoneStages] = useState<string[]>([]);
  const [idea, setIdea] = useState('');
  const [preset, setPreset] = useState<PipelineDemoPreset | null>(null);
  const [tab, setTab] = useState('report');

  const run = useCallback(async () => {
    setLoading(true); setError(null); setResult(null); setDoneStages([]);
    if (preset) {
      const data = DEMO_PRESETS[preset];
      for (const stg of STAGES) {
        await new Promise(r => setTimeout(r, 350));
        setDoneStages(p => [...p, stg.id]);
      }
      setResult({ ...data, project_id: projectId });
      setLoading(false); return;
    }
    if (!idea.trim()) { setError('Enter an idea or select a demo preset.'); setLoading(false); return; }
    try {
      const r = await pipelineService.run(projectId, { raw_idea: idea });
      setDoneStages(r.stages_completed); setResult(r);
    } catch (e: unknown) { setError((e as Error).message ?? 'Pipeline failed'); }
    finally { setLoading(false); }
  }, [preset, idea, projectId]);

  const tb = (id: string) => ({
    padding:'8px 14px',borderRadius:6,cursor:'pointer',fontSize:13,border:'none',
    fontWeight: tab===id ? 700 : 500,
    background: tab===id ? '#1d4ed8' : 'transparent',
    color: tab===id ? '#fff' : '#94a3b8',
  } as React.CSSProperties);

  return (
    <div style={{ fontFamily:'-apple-system,"Segoe UI",system-ui,sans-serif',background:'#020817',minHeight:'100vh',color:'#f8fafc',padding:24 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0,fontSize:22,fontWeight:800 }}>AI Pipeline</h1>
          <p style={{ margin:'4px 0 0',color:'#64748b',fontSize:13 }}>9-stage creative workflow — all stages powered by IBM Granite</p>
        </div>
        <GraniteBadge />
      </div>

      <Card title="Configure Pipeline">
        <p style={{ color:'#94a3b8',fontSize:13,margin:'0 0 12px' }}>Choose a polished demo preset or enter your own idea</p>
        <div style={{ display:'flex',gap:10,flexWrap:'wrap',marginBottom:20 }}>
          {DEMO_OPTIONS.map(o => (
            <button key={o.id} onClick={() => { setPreset(o.id); setIdea(''); }} style={{
              padding:'10px 14px',borderRadius:8,cursor:'pointer',fontSize:12,
              border:`2px solid ${preset===o.id ? '#3b82f6' : '#334155'}`,
              background: preset===o.id ? '#1e3a5f' : '#0f172a',
              color: preset===o.id ? '#93c5fd' : '#94a3b8',
            }}>
              <div style={{ fontWeight:700 }}>{o.label}</div>
              <div style={{ fontSize:10,opacity:0.7,marginTop:2 }}>{o.desc}</div>
            </button>
          ))}
        </div>
        <textarea value={idea} onChange={e => { setIdea(e.target.value); setPreset(null); }} placeholder="Or describe your own creative idea..." rows={3}
          style={{ width:'100%',background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f8fafc',padding:'10px 14px',fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:16 }} />
        <button onClick={run} disabled={loading} style={{ padding:'10px 28px',borderRadius:8,border:'none',cursor:loading?'not-allowed':'pointer',background:loading?'#374151':'#1d4ed8',color:'#fff',fontSize:14,fontWeight:700,display:'inline-flex',alignItems:'center',gap:12 }}>
          {loading ? '⏳ Running Pipeline...' : '▶  Run Full Pipeline'}
          {!loading && <GraniteBadge />}
        </button>
        {error && <div style={{ marginTop:12,padding:'10px 14px',background:'#7f1d1d',borderRadius:8,color:'#fca5a5',fontSize:13 }}>{error}</div>}
      </Card>

      {(loading || doneStages.length > 0) && (
        <Card title="Pipeline Progress">
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 24px' }}>
            {STAGES.map(stg => (
              <div key={stg.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'5px 0',opacity: doneStages.includes(stg.id)||loading ? 1 : 0.35 }}>
                <div style={{ width:18,height:18,borderRadius:'50%',background: doneStages.includes(stg.id)?'#22c55e':'#374151',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#fff',flexShrink:0 }}>
                  {doneStages.includes(stg.id) ? '✓' : '○'}
                </div>
                <span style={{ fontSize:13,color: doneStages.includes(stg.id)?'#86efac':'#9ca3af' }}>{stg.label}</span>
                {doneStages.includes(stg.id) && <span style={{ marginLeft:'auto',fontSize:9,color:'#4b5563' }}>Granite</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {result && (
        <>
          <div style={{ display:'flex',gap:4,flexWrap:'wrap',background:'#0f172a',padding:6,borderRadius:10,border:'1px solid #1e293b',marginBottom:20 }}>
            {[['report','📊 Final Report'],['research','🔬 Research Pack'],['editor','🎬 Editor Blueprint'],['trends','📈 Trend Radar'],['virality','🚀 Virality Twin'],['story','📖 Story'],['dist','📡 Distribution']].map(([id,lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={tb(id)}>{lbl}</button>
            ))}
          </div>

          {tab === 'report' && result.final_report && (
            <Card title="Final Report — GO/NO-GO Decision">
              <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:20 }}>
                <GoNoGo v={result.final_report.go_no_go} />
                <span style={{ fontSize:12,padding:'4px 12px',borderRadius:20,background:'#1e293b',color:'#94a3b8' }}>Risk: {result.final_report.risk_level}</span>
              </div>
              <p style={{ color:'#cbd5e1',fontSize:14,lineHeight:1.7,marginBottom:20 }}>{result.final_report.executive_summary}</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
                <ScoreBox label="Creative" value={result.final_report.creative_score} color="#8b5cf6" />
                <ScoreBox label="Originality" value={result.final_report.originality_score} color="#3b82f6" />
                <ScoreBox label="Feasibility" value={result.final_report.feasibility_score} color="#22c55e" />
                <ScoreBox label="Virality" value={result.final_report.virality_score} color="#f59e0b" />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20 }}>
                <div>
                  <h4 style={{ color:'#ef4444',fontSize:13,marginBottom:8 }}>⚠ Risks</h4>
                  {result.final_report.top_risks.map((r,i) => <div key={i} style={{ fontSize:13,color:'#fca5a5',padding:'3px 0',borderBottom:'1px solid #1e293b' }}>• {r}</div>)}
                </div>
                <div>
                  <h4 style={{ color:'#22c55e',fontSize:13,marginBottom:8 }}>✓ Opportunities</h4>
                  {result.final_report.top_opportunities.map((o,i) => <div key={i} style={{ fontSize:13,color:'#86efac',padding:'3px 0',borderBottom:'1px solid #1e293b' }}>• {o}</div>)}
                </div>
              </div>
              <h4 style={{ color:'#93c5fd',fontSize:13,marginBottom:8 }}>→ Next Steps</h4>
              {result.final_report.recommended_next_steps.map((ns,i) => (
                <div key={i} style={{ fontSize:13,color:'#e2e8f0',padding:'5px 0',display:'flex',gap:10 }}>
                  <span style={{ color:'#3b82f6',fontWeight:700 }}>{i+1}.</span>{ns}
                </div>
              ))}
            </Card>
          )}

          {tab === 'research' && result.research_pack && (
            <Card title="Research Pack — Claims + Sources + Confidence">
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:20 }}>
                <div style={s('#3b82f6')}><div style={{ fontSize:11,color:'#6b7280',marginBottom:6 }}>OVERALL CONFIDENCE</div><Bar val={result.research_pack.overall_confidence} /></div>
                <div style={s('#f59e0b')}><div style={{ fontSize:11,color:'#6b7280' }}>SOURCE DIVERSITY</div><div style={{ fontSize:22,fontWeight:800,color:'#f59e0b' }}>{result.research_pack.source_diversity_score}</div></div>
                <div style={s('#22c55e')}><div style={{ fontSize:11,color:'#6b7280' }}>CLAIMS</div><div style={{ fontSize:22,fontWeight:800,color:'#22c55e' }}>{result.research_pack.claims.length}</div></div>
              </div>
              <p style={{ color:'#94a3b8',fontSize:13,marginBottom:16,lineHeight:1.6 }}>{result.research_pack.research_summary}</p>
              <h4 style={{ color:'#93c5fd',fontSize:13,marginBottom:8 }}>Key Statistics</h4>
              <div style={{ marginBottom:20 }}>{result.research_pack.key_statistics.map((st,i) => <div key={i} style={{ fontSize:13,color:'#e2e8f0',padding:'3px 0',borderBottom:'1px solid #1e293b' }}>• {st}</div>)}</div>
              <h4 style={{ color:'#f8fafc',fontSize:13,marginBottom:10 }}>Evidence-Backed Claims</h4>
              <ClaimsTable claims={result.research_pack.claims} />
            </Card>
          )}

          {tab === 'editor' && result.editor_blueprint && (
            <Card title="Editor Blueprint — Time-Coded Production Table">
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20 }}>
                <div style={s('#3b82f6')}><div style={{ fontSize:24,fontWeight:800,color:'#3b82f6' }}>{result.editor_blueprint.total_scenes}</div><div style={{ fontSize:11,color:'#6b7280' }}>Scenes</div></div>
                <div style={s('#8b5cf6')}><div style={{ fontSize:24,fontWeight:800,color:'#8b5cf6' }}>{Math.round(result.editor_blueprint.estimated_runtime_seconds/60)}m</div><div style={{ fontSize:11,color:'#6b7280' }}>Runtime</div></div>
                <div style={s('#22c55e')}><div style={{ fontSize:14,fontWeight:700,color:'#22c55e' }}>{result.editor_blueprint.export_formats.length} Formats</div><div style={{ fontSize:11,color:'#6b7280' }}>Export Ready</div></div>
              </div>
              <EditorTable rows={result.editor_blueprint.timeline} />
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:20 }}>
                <div style={{ background:'#1e293b',borderRadius:8,padding:14 }}>
                  <h4 style={{ color:'#f8fafc',fontSize:13,marginBottom:8 }}>🎵 Music Brief</h4>
                  <p style={{ color:'#94a3b8',fontSize:13,margin:0,lineHeight:1.6 }}>{result.editor_blueprint.music_brief}</p>
                </div>
                <div style={{ background:'#1e293b',borderRadius:8,padding:14 }}>
                  <h4 style={{ color:'#f8fafc',fontSize:13,marginBottom:8 }}>🎨 Colour Grade</h4>
                  <p style={{ color:'#94a3b8',fontSize:13,margin:0,lineHeight:1.6 }}>{result.editor_blueprint.color_grade_direction}</p>
                </div>
              </div>
            </Card>
          )}

          {tab === 'trends' && result.trend_radar && (
            <Card title="Trend Radar — Market Signals">
              <div style={{ padding:12,background:'#1e293b',borderRadius:8,marginBottom:16 }}>
                <span style={{ fontSize:13,color:'#22c55e',fontWeight:600 }}>🎯 {result.trend_radar.top_opportunity}</span>
              </div>
              <div style={{ padding:12,background:'#1e293b',borderRadius:8,marginBottom:20 }}>
                <span style={{ fontSize:12,color:'#f59e0b' }}>⏱ Timing: </span>
                <span style={{ fontSize:12,color:'#e2e8f0' }}>{result.trend_radar.timing_recommendation}</span>
              </div>
              {result.trend_radar.signals.map((sg,i) => (
                <div key={i} style={{ padding:'12px 0',borderBottom: i<result.trend_radar!.signals.length-1 ? '1px solid #1e293b':'none' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                    <span style={{ fontSize:14,fontWeight:600,color:'#f8fafc' }}>{sg.signal}</span>
                    <div style={{ display:'flex',gap:8 }}>
                      <span style={{ color:'#22c55e',fontWeight:700,fontSize:12 }}>{sg.growth_rate}</span>
                      <span style={{ fontSize:11,padding:'2px 8px',borderRadius:4,background: sg.volume==='high'?'#065f46':'#78350f',color: sg.volume==='high'?'#6ee7b7':'#fde68a' }}>{sg.volume}</span>
                    </div>
                  </div>
                  <Bar val={sg.relevance_score} max={100} />
                  <p style={{ color:'#94a3b8',fontSize:12,margin:'6px 0 0' }}>{sg.reason}</p>
                </div>
              ))}
            </Card>
          )}

          {tab === 'virality' && result.virality_twin && (
            <Card title="Virality Twin — Benchmark Analysis">
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20 }}>
                <ScoreBox label="Viral Score" value={result.virality_twin.viral_score} color="#f59e0b" />
                <ScoreBox label="Similarity" value={result.virality_twin.similarity_score} color="#8b5cf6" />
              </div>
              <div style={{ background:'#1e293b',borderRadius:8,padding:14,marginBottom:16 }}>
                <h4 style={{ color:'#f59e0b',fontSize:13,margin:'0 0 6px' }}>Matched: {result.virality_twin.matched_campaign}</h4>
                <p style={{ color:'#94a3b8',fontSize:13,margin:0 }}>{result.virality_twin.description}</p>
              </div>
              <div style={{ marginBottom:14 }}>{result.virality_twin.viral_mechanics.map((m,i) => <div key={i} style={{ fontSize:13,color:'#a78bfa',padding:'3px 0' }}>⚡ {m}</div>)}</div>
              <div style={{ background:'#1e293b',borderRadius:8,padding:12,marginBottom:12 }}>
                <span style={{ fontSize:11,color:'#6b7280' }}>PREDICTED REACH: </span>
                <span style={{ fontSize:16,fontWeight:800,color:'#22c55e' }}>{result.virality_twin.predicted_reach}</span>
              </div>
              <div style={{ background:'#1e293b',borderRadius:8,padding:14 }}>
                <div style={{ fontSize:11,color:'#6b7280',marginBottom:6 }}>RECOMMENDATION</div>
                <p style={{ color:'#e2e8f0',fontSize:14,margin:0,lineHeight:1.6 }}>{result.virality_twin.recommendation}</p>
              </div>
            </Card>
          )}

          {tab === 'story' && result.story_generator && (
            <Card title="Story Generator — Narrative Structure">
              <div style={{ marginBottom:16 }}>
                <span style={{ fontSize:12,padding:'4px 12px',borderRadius:20,background:'#1e3a5f',color:'#93c5fd',border:'1px solid #3b82f6',textTransform:'uppercase',letterSpacing:1 }}>
                  {result.story_generator.narrative_arc.replace(/_/g,' ')}
                </span>
              </div>
              <div style={{ background:'#1e293b',borderRadius:8,padding:14,marginBottom:20 }}>
                <div style={{ fontSize:11,color:'#6b7280',marginBottom:6 }}>HOOK</div>
                <p style={{ color:'#f8fafc',fontSize:14,lineHeight:1.7,margin:0,fontStyle:'italic' }}>"{result.story_generator.hook}"</p>
              </div>
              {result.story_generator.story_beats.map((beat,i) => (
                <div key={i} style={{ padding:'12px 0',borderBottom: i<result.story_generator!.story_beats.length-1 ? '1px solid #1e293b':'none',display:'grid',gridTemplateColumns:'28px 1fr',gap:12 }}>
                  <div style={{ width:24,height:24,borderRadius:'50%',background:'#1d4ed8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff' }}>{beat.beat_number}</div>
                  <div>
                    <div style={{ fontSize:14,color:'#f8fafc',fontWeight:700,marginBottom:4 }}>{beat.title}</div>
                    <p style={{ color:'#94a3b8',fontSize:13,margin:'0 0 5px',lineHeight:1.5 }}>{beat.description}</p>
                    <span style={{ fontSize:11,color:'#f59e0b',fontStyle:'italic' }}>♡ {beat.emotional_note}</span>
                    <span style={{ marginLeft:12,fontSize:11,color:'#6b7280' }}>~{Math.round(beat.duration_seconds/60)}min</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:16,padding:14,background:'#1e293b',borderRadius:8 }}>
                <div style={{ fontSize:11,color:'#6b7280',marginBottom:6 }}>CALL TO ACTION</div>
                <p style={{ color:'#22c55e',fontSize:14,fontWeight:600,margin:0 }}>{result.story_generator.call_to_action}</p>
              </div>
            </Card>
          )}

          {tab === 'dist' && result.distribution && (
            <Card title="Distribution Plan — Platform Variants">
              <div style={{ padding:14,background:'#1e293b',borderRadius:8,marginBottom:20 }}>
                <div style={{ fontSize:11,color:'#6b7280',marginBottom:6 }}>LAUNCH STRATEGY</div>
                <p style={{ color:'#e2e8f0',fontSize:13,lineHeight:1.6,margin:0 }}>{result.distribution.launch_strategy}</p>
              </div>
              {result.distribution.platform_variants.map((pv,i) => (
                <div key={i} style={{ padding:'14px 0',borderBottom: i<result.distribution!.platform_variants.length-1 ? '1px solid #1e293b':'none' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                    <span style={{ fontSize:13,fontWeight:700,textTransform:'uppercase',color:'#f8fafc' }}>{pv.platform}</span>
                    <span style={{ fontSize:11,padding:'2px 8px',borderRadius:4,background:'#1e293b',color:'#94a3b8',border:'1px solid #334155' }}>{pv.format}</span>
                    <span style={{ fontSize:11,color:'#6b7280' }}>{Math.round(pv.duration_seconds/60)}min</span>
                    <span style={{ marginLeft:'auto',fontSize:12,color:'#22c55e',fontWeight:600 }}>{pv.predicted_reach}</span>
                  </div>
                  <div style={{ fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:4 }}>{pv.title_variation}</div>
                  <p style={{ fontSize:13,color:'#94a3b8',margin:'0 0 8px',lineHeight:1.5 }}>{pv.caption}</p>
                  <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
                    {pv.hashtags.map((h,j) => <span key={j} style={{ fontSize:11,padding:'2px 8px',borderRadius:20,background:'#0f172a',color:'#60a5fa',border:'1px solid #1e3a5f' }}>{h}</span>)}
                  </div>
                  <div style={{ marginTop:6,fontSize:11,color:'#6b7280' }}>⏰ Best time: {pv.best_posting_time}</div>
                </div>
              ))}
              <div style={{ marginTop:16,padding:12,background:'#1e293b',borderRadius:8 }}>
                <div style={{ fontSize:11,color:'#6b7280',marginBottom:4 }}>PAID AMPLIFICATION</div>
                <p style={{ color:'#fbbf24',fontSize:13,margin:0 }}>{result.distribution.paid_amplification_budget}</p>
              </div>
            </Card>
          )}
        </>
      )}
      <div style={{ textAlign:'center',marginTop:40,paddingTop:16,borderTop:'1px solid #1e293b',color:'#374151',fontSize:12 }}>
        Made with IBM Bob
      </div>
    </div>
  );
};

export default PipelinePage;
