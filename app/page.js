'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [activeCase, setActiveCase] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const cases = [
    {
      tag: 'Edible oil · Soybean refinery · 50 TPD',
      title: 'Fixed acid dose. Three years of lost FFA yield.',
      finding: 'The sulphuric acid dosage for soapstock splitting had not been recalculated since commissioning. Feed FFA had shifted by 0.8% on average over two years. On low-FFA days, the plant was over-acidulating. On high-FFA days, the endpoint pH drifted and fatty matter stayed trapped in the aqueous layer. The contractor buying the acid oil had been averaging the losses into his pricing for three years.',
      intervention: 'Mapped soapstock composition against 30 batches of feed FFA data. Built a dosage table tied to the morning feed AV result — no instrumentation, no new equipment, no automation. The operator checks the feed AV and sets the dose from the table. One column, six rows.',
      result: '3 to 3.5% more FFA recovered in acid oil from the first month. The contractor was renegotiated. The improvement went directly to EBITDA.',
      numbers: [['3–3.5%', 'Additional FFA recovered'], ['₹0', 'Capital invested'], ['Month 1', 'Results visible']],
    },
    {
      tag: 'Edible oil · Soybean refinery · 80 TPD',
      title: 'The deodoriser was 8°C too hot. Tocopherols were being destroyed.',
      finding: 'Deodoriser temperature had been set for a refined oil flavour specification the plant no longer supplied. The customer had changed two years earlier but the deodorisation conditions were never revised. At the higher temperature, tocopherols — the compounds that determine DOD value — were degrading before they reached the distillate. The plant was selling DOD at 7% tocopherol when 8%+ was achievable with the same feedstock.',
      intervention: 'Analysed 45 batches against deodoriser temperature, vacuum level, and stripping steam rate. Brought temperature down by 8 degrees Celsius and reduced residence time. The refined oil FFA specification was maintained throughout. No process risk during the adjustment period.',
      result: 'DOD tocopherol content went from 7% to 8.2–8.4%. The buyer repriced the distillate. Same equipment, same feedstock, higher-value product. The change took three days to implement and zero capital.',
      numbers: [['7% → 8.4%', 'Tocopherol in DOD'], ['₹0', 'Equipment added'], ['3 days', 'To implement']],
    },
    {
      tag: 'Biodiesel · Tallow feedstock · 20 TPD',
      title: 'Tallow at 2–3% FFA brought to 0.5% before the reactor — using crude glycerol already in the plant.',
      finding: 'The plant was processing tallow with 2 to 3% FFA. This level of free acidity going into transesterification was causing soap formation, reducing catalyst efficiency, and pulling down FAME yield. Up to 7% of the potential biodiesel yield was being lost as FFA-associated losses in the glycerol layer. The standard advice was to add a pre-esterification stage.',
      intervention: 'We identified that the crude glycerol from the splitting stage — already in the plant — contained residual soap and spent catalyst. This made it a viable saponification medium. We developed a tallow washing step: raw tallow is contacted with the crude glycerol before entering the reactor. The residual soap and catalyst in the glycerol saponify the FFA in the tallow, pulling them into the glycerol phase. Tallow entering the reactor came out at 0.5 to 0.6% FFA. The saponified fatty acids in the crude glycerol are then recovered during acid splitting as crude fatty acids — a saleable byproduct. Spent catalyst was tested for residual activity and found viable for a second cycle, cutting catalyst consumption in half.',
      result: 'Tallow FFA reduced from 2–3% to 0.5–0.6% before transesterification. FAME yield improved significantly. Up to 7% FFA previously lost in the glycerol layer now recovered as crude fatty acid byproduct. Catalyst consumption halved. Zero additional capital. The improvement funded itself from the first batch.',
      numbers: [['2–3% → 0.5%', 'Tallow FFA before reactor'], ['7%', 'FFA recovered from glycerol'], ['50%', 'Catalyst cost reduced']],
    },
    {
      tag: 'Biodiesel · Acid oil feedstock · 30 TPD',
      title: 'Two failed OMC type certifications. The problem was process, not equipment.',
      finding: 'The plant had failed IS 15607:2022 type certification twice on CFPP. The feedstock was acid oil from mixed refinery sources — with seasonal variation in saturate content. The assumption was that the feedstock was uncontrollable. A new centrifuge was being quoted. Budget was tight.',
      intervention: 'Tracked batch-wise CFPP against feedstock sourcing, transesterification temperature, and glycerol settling time across 60 batches. Found that winter-sourced acid oil with higher saturate content required a specific reactor temperature band and extended glycerol settling before phase separation. Documented the protocol for each season and feedstock source combination.',
      result: 'Cleared IS 15607:2022 type certification on the next attempt. No new equipment purchased. Protocol now in place for seasonal feedstock variation. The plant is now on the BPCL empanelment list.',
      numbers: [['Cleared', 'IS 15607 type cert'], ['₹0', 'Equipment added'], ['BPCL list', 'Empanelment achieved']],
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400;1,9..144,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080B10; color: #D4D8DF; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(29,158,117,0.25); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1D3A2E; }
        a { text-decoration: none; color: inherit; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .serif { font-family: 'Fraunces', Georgia, serif; }
        @keyframes in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .in { animation: in 0.5s ease forwards; }
        .d1{animation-delay:.08s;opacity:0} .d2{animation-delay:.18s;opacity:0} .d3{animation-delay:.28s;opacity:0} .d4{animation-delay:.38s;opacity:0}
        .hov-link:hover { color: rgba(255,255,255,0.7) !important; }
        .hov-ghost:hover { color: rgba(255,255,255,0.7) !important; border-color: rgba(255,255,255,0.2) !important; }
        .pill { font-size:10px; padding:4px 10px; border-radius:999px; background:rgba(255,255,255,0.03); border:0.5px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.28); font-family:'JetBrains Mono',monospace; letter-spacing:0.04em; }
        @media(max-width:768px){
          .hero-h{font-size:36px!important;letter-spacing:-1px!important}
          .gap-num{font-size:52px!important}
          .two{grid-template-columns:1fr!important}
          .three{grid-template-columns:1fr!important}
          .four{grid-template-columns:1fr 1fr!important}
          .nav-links{display:none!important}
          .case-tabs{overflow-x:auto;white-space:nowrap}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 32px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', background: scrolled ? 'rgba(8,11,16,0.97)' : 'transparent', borderBottom: scrolled ? '0.5px solid rgba(255,255,255,0.05)' : 'none', backdropFilter: scrolled ? 'blur(20px)' : 'none', transition:'all 0.2s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span className="serif" style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.5px', color:'#E8ECF0' }}>Ken<span style={{ color:'#1D9E75' }}>op</span></span>
          <span className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.2)', borderLeft:'0.5px solid rgba(255,255,255,0.08)', paddingLeft:10, letterSpacing:'0.12em' }}>INTELLIGENCE</span>
        </div>
        <div className="nav-links" style={{ display:'flex', alignItems:'center', gap:28 }}>
          {[['Edible oil','#edible-oil'],['Biodiesel','#biodiesel'],['Case studies','#cases'],['Why Kenop','#moat']].map(([l,h]) => (
            <a key={l} href={h} className="hov-link" style={{ fontSize:13, color:'rgba(255,255,255,0.3)', transition:'color 0.15s' }}>{l}</a>
          ))}
          <button onClick={() => router.push('/login')} style={{ fontSize:12, fontWeight:500, background:'#1D9E75', border:'none', color:'#fff', padding:'6px 16px', borderRadius:6, cursor:'pointer' }}>Sign in</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'120px 32px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundImage:'radial-gradient(ellipse 60% 50% at 15% 50%, rgba(29,158,117,0.05) 0%, transparent 100%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1060, margin:'0 auto', width:'100%', position:'relative' }}>
          <div className="in d1" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:36 }}>
            <div style={{ width:4, height:4, borderRadius:'50%', background:'#1D9E75' }} />
            <span className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.7)', letterSpacing:'0.18em' }}>EDIBLE OIL · BIODIESEL · OLEOCHEMICALS</span>
          </div>
          <h1 className="hero-h serif in d2" style={{ fontSize:64, fontWeight:700, lineHeight:1.05, letterSpacing:'-2px', marginBottom:28, color:'#E8ECF0', maxWidth:860 }}>
            We work with oil and fat<br />plant owners to find the<br />
            <em style={{ color:'#1D9E75', fontStyle:'italic' }}>value their process is losing.</em>
          </h1>
          <p className="in d3" style={{ fontSize:17, color:'rgba(255,255,255,0.35)', lineHeight:1.75, maxWidth:540, marginBottom:16, fontWeight:300 }}>
            In every plant we have looked at — edible oil refinery or biodiesel — there is recoverable value in the process that the owner is not seeing. Not in new machinery. In decisions.
          </p>
          <p className="in d3" style={{ fontSize:14, color:'rgba(255,255,255,0.22)', lineHeight:1.7, maxWidth:500, marginBottom:44, fontWeight:300 }}>
            Kenop monitors your process continuously using AI trained on oleochemical industry knowledge — not general internet data. The case studies below are from plants we have worked with. The numbers are real.
          </p>
          <div className="in d4" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={() => router.push('/onboard')} style={{ fontSize:13, fontWeight:500, background:'#1D9E75', border:'none', color:'#fff', padding:'11px 24px', borderRadius:7, cursor:'pointer' }}>
              Onboard your plant →
            </button>
            <a href="#cases" className="hov-ghost" style={{ fontSize:13, color:'rgba(255,255,255,0.35)', border:'0.5px solid rgba(255,255,255,0.1)', padding:'11px 24px', borderRadius:7, display:'inline-flex', alignItems:'center', transition:'all 0.15s' }}>
              Read case studies
            </a>
          </div>
        </div>
      </section>

      {/* ── THE GAP NUMBERS ── */}
      <section style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.18em', marginBottom:48 }}>WHAT WE FIND IN MOST PLANTS</p>
          <div className="three" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:'rgba(255,255,255,0.04)', borderRadius:12, overflow:'hidden' }}>
            {[
              { n:'3–3.5%', unit:'FFA', label:'left in soapstock every batch', detail:'The acid dose for splitting was set at commissioning. Feed composition has changed since then. Nobody updated the calculation.' },
              { n:'7%', unit:'FAME yield', label:'lost as FFA in glycerol layer', detail:'In tallow-fed plants with 2–3% FFA feedstock, soap formation and catalyst losses pull yield down before the reaction is complete.' },
              { n:'8°C', unit:'too hot', label:'deodoriser temperature in one plant', detail:'The spec changed two years ago. The temperature never came down. Tocopherols were burning at every batch. The DOD buyer had already priced it in.' },
            ].map((g,i) => (
              <div key={i} style={{ background:'#080B10', padding:'36px 32px' }}>
                <div className="gap-num serif" style={{ fontSize:68, fontWeight:700, lineHeight:1, color:'#E8ECF0', letterSpacing:'-2px', marginBottom:4 }}>{g.n}</div>
                <div className="mono" style={{ fontSize:10, color:'#1D9E75', letterSpacing:'0.14em', marginBottom:12 }}>{g.unit}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.5, marginBottom:12, fontWeight:500 }}>{g.label}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', lineHeight:1.65, fontWeight:300 }}>{g.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDIBLE OIL ── */}
      <section id="edible-oil" style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <p className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.6)', letterSpacing:'0.18em', marginBottom:20 }}>EDIBLE OIL REFINERY</p>
              <h2 className="serif" style={{ fontSize:36, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:24, color:'#E8ECF0' }}>
                The refinery process has more financial leverage than most owners have been told
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                Refining loss tracked as a percentage tells you almost nothing. Converted to rupees per month — against what the number should be for your feedstock FFA and your refinery route — it becomes something worth acting on.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                Soapstock goes out at a flat rate in most plants. That rate was negotiated years ago based on a composition the contractor assumed. Your soapstock composition has almost certainly shifted, and the contractor has priced it in on his end.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:32, fontWeight:300 }}>
                Kenop tracks refining loss, soapstock fatty matter, DOD composition, separator efficiency, and acid dosage — batch by batch, against what each number should be for your specific feedstock and conditions.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {['Degumming','Dewaxing','Neutralisation','Soapstock splitting','Bleaching','Deodorisation','Separator efficiency','PLF / Filter press','DOD tocopherol','Acid oil processing'].map(p => (
                  <span key={p} className="pill">{p}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'28px' }}>
                <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.14em', marginBottom:20 }}>WHAT AN EDIBLE OIL OWNER SEES ON KENOP</p>
                {[
                  { label:'Refining loss this month', val:'0.43%', sub:'Expected for your feed FFA: 0.31%', warn:true },
                  { label:'Monthly cost of the gap', val:'₹1.56L', sub:'At current refined oil price', warn:true },
                  { label:'Soapstock fatty matter average', val:'62.4%', sub:'Your contractor rate assumes 58%', warn:true },
                  { label:'Acid dose vs feed FFA correlation', val:'R² = 0.31', sub:'Low — dose is not tracking feedstock variation', warn:true },
                  { label:'DOD tocopherol — last 10 batches', val:'7.1%', sub:'Market premium starts at 8%', warn:true },
                  { label:'Separator efficiency', val:'97.8%', sub:'Within expected range', warn:false },
                ].map((row,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'11px 0', borderBottom: i<5 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', gap:16 }}>
                    <div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:3 }}>{row.label}</div>
                      <div className="mono" style={{ fontSize:10, color: row.warn ? 'rgba(230,168,23,0.55)' : 'rgba(29,158,117,0.55)' }}>{row.sub}</div>
                    </div>
                    <div className="mono" style={{ fontSize:16, color: row.warn ? '#E6A817' : '#1D9E75', flexShrink:0 }}>{row.val}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.18)', lineHeight:1.6, marginTop:12, fontWeight:300, fontStyle:'italic', padding:'0 4px' }}>
                Every figure above is calculated from your own lab readings and batch records. The benchmark is built from your feedstock composition and refinery route — not an industry average.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIODIESEL ── */}
      <section id="biodiesel" style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <p className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.6)', letterSpacing:'0.18em', marginBottom:20 }}>BIODIESEL PLANT</p>
              <h2 className="serif" style={{ fontSize:36, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:24, color:'#E8ECF0' }}>
                Your plant is your biggest asset. Most are running at 70% of what they can.
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                The struggle in most biodiesel plants is not equipment — it is process discipline and domain knowledge that was never systematically built. Glycerol streams that carry value nobody is measuring. Catalyst being discarded after one use when two are viable. Methanol doses set at commissioning and never optimised.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                IS 15607 compliance is not an equipment problem. We have helped plants clear OMC type certification — CFPP, flash point, ester content, glycerol, linolenic acid — without a single rupee of capital, by identifying which parameters were failing and why.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:32, fontWeight:300 }}>
                Your crude glycerol, your spent catalyst, your soapstock — these streams have financial value most biodiesel plant owners have not been shown.
              </p>
              <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'20px 22px', marginBottom:24 }}>
                <p className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.5)', letterSpacing:'0.12em', marginBottom:10 }}>OMC TENDER READINESS — NO CAPEX</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.7, fontWeight:300 }}>We train plants to meet IS 15607:2022 specifications through process discipline. Every parameter — CFPP, flash point, ester content, water, bound glycerol, linolenic content — tracked against the tender specification before the tanker arrives. Lab testing protocols, batch documentation, equipment qualification included.</p>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {['Feedstock pretreatment','Acid conditioning','Bleaching','Acid esterification','Enzymatic esterification','Glycerolysis','Transesterification','Glycerol splitting','Methanol recovery','FAME distillation','Wet washing','Dry washing','Separation','Filtration','IS 15607:2022'].map(p => (
                  <span key={p} className="pill">{p}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'28px' }}>
                <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.14em', marginBottom:20 }}>WHAT A BIODIESEL OWNER SEES ON KENOP</p>
                {[
                  { label:'FAME yield this month', val:'91.2%', sub:'Theoretical max for your feedstock AV: 94.1%', warn:true },
                  { label:'Yield gap — monthly value', val:'₹1.82L', sub:'At current FAME sale price', warn:true },
                  { label:'Methanol dose vs optimal molar ratio', val:'294 kg/MT', sub:'Optimal for your feed AV: 271 kg/MT', warn:true },
                  { label:'Methanol overconsumption', val:'₹38K/mo', sub:'23 kg excess × 520 MT × ₹28/kg', warn:true },
                  { label:'Spent catalyst residual activity', val:'Not tested', sub:'Second cycle viability unknown', warn:true },
                  { label:'IS 15607 parameter compliance', val:'8/12 pass', sub:'CFPP, flash point, linolenic flagged', warn:true },
                ].map((row,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'11px 0', borderBottom: i<5 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', gap:16 }}>
                    <div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:3 }}>{row.label}</div>
                      <div className="mono" style={{ fontSize:10, color:'rgba(230,168,23,0.55)' }}>{row.sub}</div>
                    </div>
                    <div className="mono" style={{ fontSize:16, color:'#E6A817', flexShrink:0 }}>{row.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ── */}
      <section id="cases" style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
            <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.18em' }}>CASE STUDIES</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.22)', fontWeight:300, fontStyle:'italic' }}>Four plants. Four problems. Zero capital added in any of them.</p>
          </div>
          <div className="case-tabs" style={{ display:'flex', gap:2, marginBottom:1 }}>
            {['Edible oil · Acid dosage','Edible oil · Tocopherol','Biodiesel · Tallow FFA','Biodiesel · OMC tender'].map((l,i) => (
              <button key={i} onClick={() => setActiveCase(i)} style={{ padding:'10px 16px', background: activeCase===i ? '#0D1218' : 'transparent', border:'0.5px solid', borderBottom: activeCase===i ? '0.5px solid #0D1218' : '0.5px solid rgba(255,255,255,0.05)', borderColor: activeCase===i ? 'rgba(255,255,255,0.08)' : 'transparent', borderRadius:'8px 8px 0 0', fontSize:11, color: activeCase===i ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)', cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'DM Sans',sans-serif", transition:'all 0.15s' }}>{l}</button>
            ))}
          </div>
          <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:'0 8px 8px 8px', padding:'36px' }}>
            <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
              <div>
                <p className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.5)', letterSpacing:'0.12em', marginBottom:16 }}>{cases[activeCase].tag}</p>
                <h3 className="serif" style={{ fontSize:24, fontWeight:600, lineHeight:1.25, letterSpacing:'-0.3px', marginBottom:24, color:'#E8ECF0' }}>{cases[activeCase].title}</h3>
                <div style={{ marginBottom:20 }}>
                  <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.18)', letterSpacing:'0.16em', marginBottom:8 }}>WHAT WAS HAPPENING</p>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.38)', lineHeight:1.75, fontWeight:300 }}>{cases[activeCase].finding}</p>
                </div>
                <div style={{ marginBottom:20 }}>
                  <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.18)', letterSpacing:'0.16em', marginBottom:8 }}>WHAT WE DID</p>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.38)', lineHeight:1.75, fontWeight:300 }}>{cases[activeCase].intervention}</p>
                </div>
                <div>
                  <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.18)', letterSpacing:'0.16em', marginBottom:8 }}>RESULT</p>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.75, fontWeight:400 }}>{cases[activeCase].result}</p>
                </div>
              </div>
              <div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {cases[activeCase].numbers.map(([n,l],i) => (
                    <div key={i} style={{ padding:'22px 26px', background:'rgba(29,158,117,0.04)', border:'0.5px solid rgba(29,158,117,0.1)', borderRadius:10 }}>
                      <div className="serif" style={{ fontSize:42, fontWeight:700, color:'#1D9E75', lineHeight:1, marginBottom:8, letterSpacing:'-1px' }}>{n}</div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', fontWeight:300 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.15)', lineHeight:1.6, marginTop:14, fontWeight:300, fontStyle:'italic' }}>Results specific to the plant described. Outcomes in other plants depend on feedstock, baseline conditions, and equipment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI MOAT ── */}
      <section id="moat" style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.18em', marginBottom:20 }}>WHY KENOP IS NOT CHATGPT FOR OIL PLANTS</p>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start', marginBottom:40 }}>
            <div>
              <h2 className="serif" style={{ fontSize:34, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:20, color:'#E8ECF0' }}>
                Trained on oleochemical knowledge from plant operators and legacy process data
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                ChatGPT and Gemini are trained on the internet. They know what glycerolysis is. They do not know that your crude glycerol from a tallow-based process has a different soap content than one from acid oil, or that the 27:3 methanol molar ratio needs adjustment in the third reaction stage when ambient temperature drops below 22°C.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                Kenop's AI is trained on process knowledge accumulated from working directly with edible oil refineries and biodiesel plants — operator observations, batch records, troubleshooting logs, and domain expertise from the ground level. Knowledge that does not exist in any textbook or website.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, fontWeight:300 }}>
                And when you ask a question, Kenop answers using your plant's actual data — your last 30 batches, your separator temperature curve, your feed FFA trend — not a generic response based on what biodiesel plants do in general.
              </p>
            </div>
            <div>
              <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(248,81,73,0.5)' }} />
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(230,168,23,0.5)' }} />
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(29,158,117,0.5)' }} />
                  <span className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginLeft:8, letterSpacing:'0.1em' }}>SAME QUESTION. DIFFERENT ANSWERS.</span>
                </div>

                <div style={{ padding:'20px', borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
                    <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:6, letterSpacing:'0.08em' }}>QUESTION ASKED</p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>My FAME flash point is 138°C today. What should I check?</p>
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <div style={{ fontSize:11, padding:'2px 10px', borderRadius:999, background:'rgba(248,81,73,0.08)', border:'0.5px solid rgba(248,81,73,0.15)', color:'rgba(248,81,73,0.6)' }} className="mono">ChatGPT / Gemini</div>
                    </div>
                    <div style={{ background:'rgba(248,81,73,0.04)', border:'0.5px solid rgba(248,81,73,0.1)', borderRadius:8, padding:'14px 16px' }}>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.7, fontWeight:300, fontStyle:'italic' }}>
                        "A low flash point in biodiesel typically indicates incomplete methanol removal. Check your vacuum dryer, ensure methanol stripping is complete, verify that your flash point testing apparatus is calibrated, and confirm your process is following IS 15607:2022 requirements which specify a minimum flash point of 120°C..."
                      </p>
                    </div>
                    <p style={{ fontSize:11, color:'rgba(248,81,73,0.4)', marginTop:8, fontStyle:'italic' }}>Correct in general. Useless for your plant today.</p>
                  </div>

                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <div style={{ fontSize:11, padding:'2px 10px', borderRadius:999, background:'rgba(29,158,117,0.1)', border:'0.5px solid rgba(29,158,117,0.2)', color:'rgba(29,158,117,0.7)' }} className="mono">Kenop Intelligence</div>
                    </div>
                    <div style={{ background:'rgba(29,158,117,0.04)', border:'0.5px solid rgba(29,158,117,0.12)', borderRadius:8, padding:'14px 16px' }}>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.75, fontWeight:300 }}>
                        "Your flash point has been declining — 158°C on Monday, 149°C Wednesday, 138°C today. Your methanol dose on batch #47 (Tuesday night) was <span style={{ color:'#E6A817', fontWeight:400 }}>294 kg/MT vs your usual 271</span> — the shift supervisor noted high feed AV. Your vacuum dryer was running at <span style={{ color:'#E6A817', fontWeight:400 }}>92 mbar when the setpoint is 65</span>. The ejector steam trap showed the same pattern in February before it was replaced. Check the trap before the next batch."
                      </p>
                    </div>
                    <p style={{ fontSize:11, color:'rgba(29,158,117,0.5)', marginTop:8, fontStyle:'italic' }}>Specific to your plant. References your last 3 batches. Points to the cause, not the symptom.</p>
                  </div>
                </div>

                <div style={{ padding:'14px 20px' }}>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.18)', lineHeight:1.6, fontWeight:300 }}>The difference is not the AI model. It is the domain knowledge it was trained on, and the plant data it has access to when it answers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DATA ACQUISITION ── */}
      <section style={{ padding:'60px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)', background:'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
            <div>
              <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.18em', marginBottom:16 }}>DATA ACQUISITION</p>
              <h3 className="serif" style={{ fontSize:28, fontWeight:600, lineHeight:1.2, letterSpacing:'-0.3px', marginBottom:16, color:'#E8ECF0' }}>
                Zero effort on the operator. We fetch the data.
              </h3>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.33)', lineHeight:1.8, fontWeight:300 }}>
                Your lab technician saves the shift Excel file with Ctrl+S. A one-time macro installation sends the readings silently to Kenop in the background. The operator does nothing differently. Where Excel is not used, your shift operator sends a WhatsApp message — "AV 1.2 FFA 0.6 Temp 245" — and the data is parsed and saved automatically.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }} className="two">
              {[
                { icon:'📊', title:'Excel macro', desc:'One-time setup on your existing Excel file. Every Ctrl+S sends data silently. No new software. No training.' },
                { icon:'💬', title:'WhatsApp API', desc:'Operator sends readings as a message. Bot parses parameters automatically. Works on any phone.' },
                { icon:'🔄', title:'Both tracks', desc:'Excel for lab readings. WhatsApp for shift parameters. Both write to the same database.' },
                { icon:'🖥️', title:'Platform entry', desc:'For plants that prefer it — direct entry on kenop.in/lab. Works as a PWA on Android from a QR code at the panel.' },
              ].map((t,i) => (
                <div key={i} style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'18px' }}>
                  <div style={{ fontSize:18, marginBottom:10 }}>{t.icon}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.6)', marginBottom:6 }}>{t.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.25)', lineHeight:1.6, fontWeight:300 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.18em', marginBottom:20 }}>HOW IT WORKS</p>
              <h2 className="serif" style={{ fontSize:34, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:20, color:'#E8ECF0' }}>
                From onboarding to plant-specific intelligence in 72 hours
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.33)', lineHeight:1.8, fontWeight:300 }}>
                Onboarding takes 20 minutes. We capture your process route, feedstocks, equipment, and your last 10 batches. Data collection starts immediately through your existing Excel workflow or WhatsApp. The AI begins answering plant-specific questions from day one.
              </p>
            </div>
            <div>
              {[
                { n:'01', t:'Process mapping', d:'Your exact process route, feedstocks, unit operations, and equipment — captured during onboarding. The AI learns how your plant actually runs, not how a textbook says it should.' },
                { n:'02', t:'Historical baseline', d:'Last 10 batch records loaded. Feed testing, in-process readings, finished product results. This establishes what your plant\'s normal performance looks like and what it should look like.' },
                { n:'03', t:'Data starts flowing', d:'Excel macro installed on your lab file — silent on every save. Or WhatsApp from the shift. No new behaviour required from your team.' },
                { n:'04', t:'Intelligence daily', d:'Morning summary before the shift meeting. Drift alerts on WhatsApp. Every AI response references your actual batch data, not general guidance.' },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', gap:20, padding:'18px 0', borderBottom: i<3 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.3)', letterSpacing:'0.1em', paddingTop:2, flexShrink:0, width:24 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.6)', marginBottom:5 }}>{s.t}</div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)', lineHeight:1.7, fontWeight:300 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OLEOCHEMICALS ── */}
      <section style={{ padding:'60px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)', background:'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:40, flexWrap:'wrap' }}>
          <div>
            <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.18em', marginBottom:10 }}>OLEOCHEMICALS AND BEYOND</p>
            <h3 className="serif" style={{ fontSize:26, fontWeight:600, color:'#E8ECF0', letterSpacing:'-0.3px', maxWidth:460, lineHeight:1.3 }}>A horizontal platform — expanding across the oleochemical value chain</h3>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, maxWidth:380 }}>
            {[['Fatty acid splitting','live'],['Glycerine refining','live'],['Methyl ester','live'],['Fatty acid plants','soon'],['Dimer acid plants','soon'],['Amines & amides','soon']].map(([l,s]) => (
              <span key={l} className="mono" style={{ fontSize:10, padding:'4px 12px', borderRadius:999, border:`0.5px solid ${s==='live' ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.06)'}`, color: s==='live' ? 'rgba(29,158,117,0.55)' : 'rgba(255,255,255,0.18)', letterSpacing:'0.06em' }}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'100px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center' }}>
          <h2 className="serif" style={{ fontSize:40, fontWeight:700, lineHeight:1.1, letterSpacing:'-1px', marginBottom:20, color:'#E8ECF0' }}>
            What is your plant<br />actually losing per month?
          </h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.3)', lineHeight:1.7, marginBottom:48, fontWeight:300 }}>
            Tell us about your plant. We will show you where the gaps are — using your own numbers, against what your process should be achieving. Onboarding takes 20 minutes.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/onboard/edible-oil')} style={{ fontSize:14, fontWeight:500, background:'#1D9E75', border:'none', color:'#fff', padding:'12px 28px', borderRadius:8, cursor:'pointer' }}>
              Edible oil refinery →
            </button>
            <button onClick={() => router.push('/onboard/biodiesel')} className="hov-ghost" style={{ fontSize:14, color:'rgba(255,255,255,0.35)', background:'transparent', border:'0.5px solid rgba(255,255,255,0.1)', padding:'12px 28px', borderRadius:8, cursor:'pointer', transition:'all 0.15s' }}>
              Biodiesel plant →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:'40px 32px 28px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:48, marginBottom:36 }}>
            <div>
              <div className="serif" style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.3px', marginBottom:10, color:'#E8ECF0' }}>Ken<span style={{ color:'#1D9E75' }}>op</span></div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.18)', lineHeight:1.7, maxWidth:360, fontWeight:300 }}>
                Process intelligence for edible oil refineries, biodiesel plants, and the oleochemical industry. Chikalthana MIDC, Aurangabad, Maharashtra.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div>
                <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.14)', letterSpacing:'0.14em', marginBottom:10, textTransform:'uppercase' }}>Platform</p>
                {['Dashboard','AI chat','Lab data','Reports'].map(l => <p key={l} style={{ fontSize:12, color:'rgba(255,255,255,0.16)', marginBottom:7 }}>{l}</p>)}
              </div>
              <div>
                <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.14)', letterSpacing:'0.14em', marginBottom:10, textTransform:'uppercase' }}>Industries</p>
                {['Edible oil','Biodiesel','Oleochemicals','Fatty acids'].map(l => <p key={l} style={{ fontSize:12, color:'rgba(255,255,255,0.16)', marginBottom:7 }}>{l}</p>)}
              </div>
            </div>
          </div>
          <div style={{ borderTop:'0.5px solid rgba(255,255,255,0.04)', paddingTop:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.1)' }}>© 2025 E-Shakti Binary Currents Private Limited. All rights reserved.</p>
            <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.08)', letterSpacing:'0.1em' }}>kenop.in</p>
          </div>
        </div>
      </footer>
    </>
  )
}