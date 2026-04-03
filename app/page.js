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
    return () => () => window.removeEventListener('scroll', fn)
  }, [])

  const cases = [
    {
      tag: 'Edible oil · Soybean refinery · 50 TPD',
      title: 'Fixed acid dose. Three years of lost yield.',
      finding: 'The acid dosage for soapstock splitting had not been recalculated since commissioning. Feed FFA had shifted by 0.8% on average. The endpoint pH was drifting on every third batch without anyone knowing.',
      intervention: 'We mapped soapstock composition against 30 batches of feed FFA data. Built a dosage table tied to the morning feed test result. No instrumentation. No new equipment.',
      result: '3 to 3.5% more FFA recovered in acid oil. Direct EBITDA addition from the first month.',
      numbers: [['3.5%', 'Additional FFA recovered'], ['₹0', 'Capital invested'], ['Month 1', 'Results visible']],
    },
    {
      tag: 'Edible oil · Soybean refinery · 80 TPD',
      title: 'The deodoriser was 8°C too hot. The tocopherols were burning.',
      finding: 'Deodoriser operating temperature had been set for a refined oil flavour specification no longer sold. The plant had changed customers two years earlier but nobody adjusted the deodorisation conditions.',
      intervention: 'Analysed 45 batches against deodoriser temperature, vacuum, and stripping steam rate. Brought temperature down by 8°C and tightened residence time. FFA specification was maintained throughout.',
      result: 'Tocopherol content in DOD went from 7% to 8.2–8.4%. The buyer repriced the distillate upward. Same equipment, same feedstock, significantly higher value product.',
      numbers: [['7% → 8.4%', 'Tocopherol in DOD'], ['₹0', 'Equipment added'], ['Significant', 'EBITDA uplift']],
    },
    {
      tag: 'Biodiesel · Tallow feedstock · 20 TPD',
      title: 'FAME FFA at 2–3%. OMC rejection looming. No capex budget.',
      finding: 'Post-transesterification FAME was consistently 2 to 3% FFA — outside IS 15607 limits. The plant had been advised to add a second esterification stage. Budget was not available.',
      intervention: 'Examined the glycerol stream from splitting. Residual soap and spent catalyst in crude glycerol could perform mild saponification. Passed high-FFA FAME through the crude glycerol layer before water washing. Simultaneously tested spent catalyst residual activity — found viable for a second cycle.',
      result: 'FAME FFA dropped below 0.5%. IS 15607 compliant. Catalyst consumption cut by 50%. Glycerol soapstock valorised as a crude fatty acid feedstock.',
      numbers: [['<0.5%', 'FAME FFA achieved'], ['50%', 'Catalyst cost reduction'], ['₹0', 'Capex added']],
    },
    {
      tag: 'Biodiesel · Acid oil feedstock · 30 TPD',
      title: 'OMC tender kept failing on CFPP. The problem was process, not equipment.',
      finding: 'The plant had failed two OMC tender type certification tests on CFPP. The assumption was that the feedstock — acid oil from mixed refineries — was the problem. A new centrifuge was being quoted.',
      intervention: 'Tracked batch-wise CFPP against feedstock sourcing, transesterification temperature, and glycerol settling time. Found that winter-sourced acid oil with higher saturate content needed a specific reactor temperature band and extended settling before phase separation.',
      result: 'Cleared IS 15607 type certification on the next attempt. No new equipment purchased. Process protocol now documented for each season and feedstock source.',
      numbers: [['Cleared', 'IS 15607 type cert'], ['₹0', 'New equipment'], ['Protocol', 'Now documented']],
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
        @keyframes in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .in { animation: in 0.5s ease forwards; }
        .d1{animation-delay:.08s;opacity:0} .d2{animation-delay:.18s;opacity:0} .d3{animation-delay:.28s;opacity:0} .d4{animation-delay:.38s;opacity:0} .d5{animation-delay:.48s;opacity:0}
        @media(max-width:768px){
          .hero-h{font-size:36px!important;letter-spacing:-1px!important}
          .hero-sub{font-size:15px!important}
          .gap-num{font-size:56px!important}
          .two{grid-template-columns:1fr!important}
          .three{grid-template-columns:1fr!important}
          .hide-mob{display:none!important}
          .nav-links{display:none!important}
          .case-tabs{overflow-x:auto}
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 32px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', background: scrolled ? 'rgba(8,11,16,0.97)' : 'transparent', borderBottom: scrolled ? '0.5px solid rgba(255,255,255,0.05)' : 'none', backdropFilter: scrolled ? 'blur(20px)' : 'none', transition:'all 0.2s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span className="serif" style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.5px', color:'#E8ECF0' }}>Ken<span style={{ color:'#1D9E75' }}>op</span></span>
          <span className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.2)', borderLeft:'0.5px solid rgba(255,255,255,0.08)', paddingLeft:10, letterSpacing:'0.12em' }}>INTELLIGENCE</span>
        </div>
        <div className="nav-links" style={{ display:'flex', alignItems:'center', gap:28 }}>
          {[['Edible oil','#edible-oil'],['Biodiesel','#biodiesel'],['Case studies','#cases']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize:13, color:'rgba(255,255,255,0.35)', transition:'color 0.15s' }} onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.35)'}>{l}</a>
          ))}
          <button onClick={() => router.push('/login')} style={{ fontSize:12, fontWeight:500, background:'#1D9E75', border:'none', color:'#fff', padding:'6px 16px', borderRadius:6, cursor:'pointer' }}>Sign in</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'120px 32px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundImage:'radial-gradient(ellipse 60% 50% at 15% 50%, rgba(29,158,117,0.05) 0%, transparent 100%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1060, margin:'0 auto', width:'100%', position:'relative' }}>

          <div className="in d1" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:36 }}>
            <div style={{ width:4, height:4, borderRadius:'50%', background:'#1D9E75' }} />
            <span className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.7)', letterSpacing:'0.18em' }}>EDIBLE OIL · BIODIESEL · OLEOCHEMICALS</span>
          </div>

          <h1 className="hero-h serif in d2" style={{ fontSize:64, fontWeight:700, lineHeight:1.05, letterSpacing:'-2px', marginBottom:28, color:'#E8ECF0', maxWidth:860 }}>
            We work with oil and fat<br />
            plant owners to find the<br />
            <em style={{ color:'#1D9E75', fontStyle:'italic' }}>value their process is losing.</em>
          </h1>

          <p className="hero-sub in d3" style={{ fontSize:18, color:'rgba(255,255,255,0.38)', lineHeight:1.7, maxWidth:560, marginBottom:20, fontWeight:300 }}>
            In every plant we have looked at — edible oil refinery or biodiesel — there is recoverable value in the process that the owner is not seeing. Not in new machinery. In decisions.
          </p>

          <p className="in d3" style={{ fontSize:15, color:'rgba(255,255,255,0.28)', lineHeight:1.7, maxWidth:520, marginBottom:44, fontWeight:300 }}>
            Kenop is a process intelligence platform that identifies these gaps and monitors them continuously. The case studies below are from plants we have worked with. The numbers are real.
          </p>

          <div className="in d4" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={() => router.push('/onboard')} style={{ fontSize:13, fontWeight:500, background:'#1D9E75', border:'none', color:'#fff', padding:'11px 24px', borderRadius:7, cursor:'pointer', letterSpacing:'0.01em' }}>
              Onboard your plant →
            </button>
            <a href="#cases" style={{ fontSize:13, color:'rgba(255,255,255,0.4)', border:'0.5px solid rgba(255,255,255,0.1)', padding:'11px 24px', borderRadius:7, display:'inline-flex', alignItems:'center', transition:'all 0.15s', letterSpacing:'0.01em' }} onMouseEnter={e=>{e.currentTarget.style.color='rgba(255,255,255,0.7)';e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}} onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.4)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>
              Read case studies
            </a>
          </div>
        </div>
      </section>

      {/* ── THE GAP ─────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.18em', marginBottom:48 }}>WHAT WE FIND IN MOST PLANTS</p>
          <div className="three" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:'rgba(255,255,255,0.04)', borderRadius:12, overflow:'hidden' }}>
            {[
              { n:'3–3.5%', unit:'FFA', label:'left behind in soapstock splitting', detail:'Because the acid dose was calculated at commissioning and feed composition has since changed. Nobody updated the table.' },
              { n:'₹6–11L', unit:'/month', label:'in recoverable value at a 50 TPD refinery', detail:'Across refining loss, soapstock composition, DOD tocopherols, and separator efficiency. Most of it costs nothing to recover.' },
              { n:'7 to 8.4%', unit:'tocopherol', label:'improvement achievable in DOD without new equipment', detail:'Deodoriser temperature and residence time are the levers. The right settings depend on your feedstock and your spec — not the manual.' },
            ].map((g,i) => (
              <div key={i} style={{ background:'#080B10', padding:'36px 32px' }}>
                <div className="gap-num serif" style={{ fontSize:68, fontWeight:700, lineHeight:1, color:'#E8ECF0', letterSpacing:'-2px', marginBottom:4 }}>{g.n}</div>
                <div className="mono" style={{ fontSize:10, color:'#1D9E75', letterSpacing:'0.14em', marginBottom:12 }}>{g.unit}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.5, marginBottom:14, fontWeight:500 }}>{g.label}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.22)', lineHeight:1.65, fontWeight:300 }}>{g.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDIBLE OIL ──────────────────────────────────────────────────── */}
      <section id="edible-oil" style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <p className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.6)', letterSpacing:'0.18em', marginBottom:20 }}>EDIBLE OIL REFINERY</p>
              <h2 className="serif" style={{ fontSize:36, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:24, color:'#E8ECF0' }}>
                The refinery process<br />
                has more financial<br />
                leverage than most<br />
                owners have been told
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                Refining loss tracked as a percentage tells you almost nothing. Converted to rupees per month — against what the number should be for your feedstock FFA and your refinery route — it becomes a number worth acting on.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                Soapstock goes out at a flat contractor rate in most plants. That rate was negotiated years ago. Your soapstock composition has almost certainly changed since then, and the contractor knows it.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.8, marginBottom:36, fontWeight:300 }}>
                Kenop tracks your refining loss, soapstock fatty matter, DOD composition, separator efficiency, and acid dosage — batch by batch, against what each number should be for your specific conditions.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {['Degumming','Dewaxing','Neutralisation','Soapstock splitting','Bleaching','Deodorisation','Separator efficiency','PLF / Filter press','DOD tocopherol tracking','Acid oil processing'].map(p => (
                  <span key={p} className="mono" style={{ fontSize:10, padding:'4px 10px', borderRadius:999, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.3)', letterSpacing:'0.04em' }}>{p}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'28px' }}>
                <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.14em', marginBottom:20 }}>WHAT KENOP SHOWS AN EDIBLE OIL REFINERY OWNER</p>
                {[
                  { label:'Refining loss this month', val:'0.43%', sub:'Benchmark for your FFA: 0.31%', warn:true },
                  { label:'Equivalent monthly loss vs benchmark', val:'₹1.56L', sub:'At current edible oil price', warn:true },
                  { label:'Soapstock fatty matter (avg this month)', val:'62.4%', sub:'Your contractor rate assumes 58%', warn:true },
                  { label:'Acid dose vs feed FFA correlation', val:'R² = 0.31', sub:'Low. Dose is not tracking feedstock variation', warn:true },
                  { label:'DOD tocopherol content (last 10 batches)', val:'7.1%', sub:'Market premium starts at 8%', warn:true },
                  { label:'Separator efficiency', val:'97.8%', sub:'Within normal range', warn:false },
                ].map((row,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'12px 0', borderBottom: i<5 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', gap:16 }}>
                    <div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:3 }}>{row.label}</div>
                      <div style={{ fontSize:10, color: row.warn ? 'rgba(230,168,23,0.6)' : 'rgba(29,158,117,0.6)', fontFamily:"'JetBrains Mono',monospace" }}>{row.sub}</div>
                    </div>
                    <div className="mono" style={{ fontSize:16, fontWeight:400, color: row.warn ? '#E6A817' : '#1D9E75', flexShrink:0 }}>{row.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16, padding:'16px 20px', background:'rgba(29,158,117,0.05)', border:'0.5px solid rgba(29,158,117,0.1)', borderRadius:10 }}>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.65, fontWeight:300 }}>Every row above is calculated from your own lab readings and batch records. The benchmark is built from your feedstock FFA and refinery route — not an industry average.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIODIESEL ───────────────────────────────────────────────────── */}
      <section id="biodiesel" style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <p className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.6)', letterSpacing:'0.18em', marginBottom:20 }}>BIODIESEL PLANT</p>
              <h2 className="serif" style={{ fontSize:36, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:24, color:'#E8ECF0' }}>
                Your plant is your<br />
                biggest asset.<br />
                Most plants run<br />
                at 70% of what they can.
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                In working with biodiesel plants across different feedstocks and scales, the pattern is consistent. The struggle is not equipment — it is process discipline and process knowledge that was never systematically built.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                IS 15607 compliance is not an equipment problem. We have helped plants clear OMC type certification without a single rupee of capital investment — by understanding which parameters were failing, why they were failing, and what to change in the process to fix them.
              </p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.8, marginBottom:24, fontWeight:300 }}>
                Your own glycerol, your own spent catalyst, your own soapstock — these streams have value that most biodiesel plant owners are unaware of. Finding that value is where we start.
              </p>
              <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'20px 22px', marginBottom:24 }}>
                <p className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.5)', letterSpacing:'0.12em', marginBottom:12 }}>OMC TENDER READINESS</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.7, fontWeight:300 }}>We train plants to meet IS 15607:2022 specifications through process discipline — not capital expenditure. CFPP, flash point, ester content, water, glycerol, linolenic acid content — every parameter tracked against the tender specification before the TT arrives. Lab testing protocols, equipment qualification, batch documentation — all covered.</p>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {['Feedstock pretreatment','Acid conditioning','Bleaching','Acid esterification','Enzymatic esterification','Glycerolysis','Transesterification','Glycerol splitting','Methanol recovery','FAME distillation','Wet washing','Dry washing','Separation','Filtration','IS 15607:2022'].map(p => (
                  <span key={p} className="mono" style={{ fontSize:10, padding:'4px 10px', borderRadius:999, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.3)', letterSpacing:'0.04em' }}>{p}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'28px' }}>
                <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.14em', marginBottom:20 }}>WHAT KENOP TRACKS FOR A BIODIESEL OWNER</p>
                {[
                  { label:'FAME yield this month', val:'91.2%', sub:'Theoretical max for your feedstock AV: 94.1%', warn:true },
                  { label:'Gap vs theoretical — monthly value', val:'₹1.82L', sub:'At current FAME sale price', warn:true },
                  { label:'Methanol dose vs molar ratio', val:'294 kg/MT', sub:'Optimal for your feed: 271 kg/MT', warn:true },
                  { label:'Methanol overconsumption cost', val:'₹38K/month', sub:'23 kg excess × 520 MT × ₹28/kg', warn:true },
                  { label:'Spent catalyst residual activity', val:'Not tested', sub:'One additional cycle potentially viable', warn:true },
                  { label:'IS 15607 parameter status', val:'8/12 pass', sub:'CFPP, flash point, linolenic flagged', warn:true },
                ].map((row,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'12px 0', borderBottom: i<5 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', gap:16 }}>
                    <div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:3 }}>{row.label}</div>
                      <div style={{ fontSize:10, color:'rgba(230,168,23,0.6)', fontFamily:"'JetBrains Mono',monospace" }}>{row.sub}</div>
                    </div>
                    <div className="mono" style={{ fontSize:16, fontWeight:400, color:'#E6A817', flexShrink:0 }}>{row.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ────────────────────────────────────────────────── */}
      <section id="cases" style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
            <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.18em' }}>CASE STUDIES</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.25)', fontWeight:300, fontStyle:'italic' }}>Four plants. Four different problems. Zero capital added in any of them.</p>
          </div>

          {/* Tab bar */}
          <div className="case-tabs" style={{ display:'flex', gap:2, marginBottom:1, overflowX:'auto' }}>
            {cases.map((c,i) => (
              <button key={i} onClick={() => setActiveCase(i)} style={{ padding:'10px 16px', background: activeCase===i ? '#0D1218' : 'transparent', border:'0.5px solid', borderBottom: activeCase===i ? '0.5px solid #0D1218' : '0.5px solid rgba(255,255,255,0.06)', borderColor: activeCase===i ? 'rgba(255,255,255,0.08)' : 'transparent', borderRadius:'8px 8px 0 0', fontSize:11, color: activeCase===i ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'DM Sans',sans-serif", transition:'all 0.15s' }}>
                {['Edible oil · Acid dosage','Edible oil · Tocopherol','Biodiesel · Tallow','Biodiesel · OMC tender'][i]}
              </button>
            ))}
          </div>

          {/* Active case */}
          <div style={{ background:'#0D1218', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:'0 8px 8px 8px', padding:'36px' }}>
            <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
              <div>
                <p className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.5)', letterSpacing:'0.12em', marginBottom:16 }}>{cases[activeCase].tag}</p>
                <h3 className="serif" style={{ fontSize:26, fontWeight:600, lineHeight:1.25, letterSpacing:'-0.3px', marginBottom:24, color:'#E8ECF0' }}>
                  {cases[activeCase].title}
                </h3>

                <div style={{ marginBottom:20 }}>
                  <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.16em', marginBottom:8 }}>WHAT WAS HAPPENING</p>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.75, fontWeight:300 }}>{cases[activeCase].finding}</p>
                </div>
                <div style={{ marginBottom:20 }}>
                  <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.16em', marginBottom:8 }}>WHAT WE DID</p>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.75, fontWeight:300 }}>{cases[activeCase].intervention}</p>
                </div>
                <div>
                  <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.16em', marginBottom:8 }}>RESULT</p>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.75, fontWeight:400 }}>{cases[activeCase].result}</p>
                </div>
              </div>

              <div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
                  {cases[activeCase].numbers.map(([n,l],i) => (
                    <div key={i} style={{ padding:'24px 28px', background:'rgba(29,158,117,0.04)', border:'0.5px solid rgba(29,158,117,0.1)', borderRadius:10 }}>
                      <div className="serif" style={{ fontSize:44, fontWeight:700, color:'#1D9E75', lineHeight:1, marginBottom:8, letterSpacing:'-1px' }}>{n}</div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:300 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, padding:'14px 16px', background:'rgba(255,255,255,0.02)', borderRadius:8 }}>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', lineHeight:1.6, fontWeight:300, fontStyle:'italic' }}>
                    These results are specific to the plant described. Results in other plants will vary based on feedstock, equipment, and baseline operating conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW ─────────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.18em', marginBottom:20 }}>HOW IT WORKS</p>
              <h2 className="serif" style={{ fontSize:34, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:20, color:'#E8ECF0' }}>
                From onboarding to<br />plant-specific intelligence<br />in 72 hours
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.8, fontWeight:300 }}>
                Onboarding takes 20 minutes. We capture your process route, feedstocks, equipment, and your last 10 batches. Your operator sends readings via Excel macro or WhatsApp — nothing changes in how they work. The intelligence runs continuously in the background.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {[
                { n:'01', t:'Process mapping', d:'Your exact process route, unit operations, feedstocks, and equipment — captured during onboarding. The AI learns how your plant actually runs, not how a textbook says it should.' },
                { n:'02', t:'Historical baseline', d:'Last 10 batch records loaded. Feed testing, in-process parameters, finished product results. This is how the system knows what your plant\'s normal looks like and what it should look like.' },
                { n:'03', t:'Live data connection', d:'Excel macro on your lab file — silent on every Ctrl+S save. Or WhatsApp from the shift operator. Data flows without changing how anyone works.' },
                { n:'04', t:'Intelligence daily', d:'Morning summary before the shift meeting. Parameter drift alerts on WhatsApp. Every AI response references your plant\'s actual numbers — not general guidance.' },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', gap:20, padding:'20px 0', borderBottom: i<3 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div className="mono" style={{ fontSize:10, color:'rgba(29,158,117,0.35)', letterSpacing:'0.1em', paddingTop:2, flexShrink:0, width:24 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.65)', marginBottom:6 }}>{s.t}</div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.28)', lineHeight:1.7, fontWeight:300 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OLEOCHEMICALS ────────────────────────────────────────────────── */}
      <section style={{ padding:'60px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)', background:'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:40, flexWrap:'wrap' }}>
          <div>
            <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.18em', marginBottom:10 }}>OLEOCHEMICALS AND BEYOND</p>
            <h3 className="serif" style={{ fontSize:24, fontWeight:600, color:'#E8ECF0', letterSpacing:'-0.3px', maxWidth:460, lineHeight:1.3 }}>A horizontal platform — edible oil and biodiesel first, expanding across the oleochemical chain</h3>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, maxWidth:400 }}>
            {[['Fatty acid splitting','live'],['Glycerine refining','live'],['Methyl ester production','live'],['Fatty acid plants','soon'],['Dimer acid plants','soon'],['Amines & amides','soon']].map(([l,s]) => (
              <span key={l} className="mono" style={{ fontSize:10, padding:'4px 12px', borderRadius:999, border:`0.5px solid ${s==='live' ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.06)'}`, color: s==='live' ? 'rgba(29,158,117,0.6)' : 'rgba(255,255,255,0.2)', letterSpacing:'0.06em' }}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ padding:'100px 32px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:640, margin:'0 auto', textAlign:'center' }}>
          <h2 className="serif" style={{ fontSize:42, fontWeight:700, lineHeight:1.1, letterSpacing:'-1px', marginBottom:20, color:'#E8ECF0' }}>
            What is your refinery<br />actually losing per month?
          </h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.32)', lineHeight:1.7, marginBottom:48, fontWeight:300 }}>
            Tell us about your plant. We will show you where the gaps are — using your own numbers, against what your process should be achieving. It starts with onboarding. It takes 20 minutes.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/onboard/edible-oil')} style={{ fontSize:14, fontWeight:500, background:'#1D9E75', border:'none', color:'#fff', padding:'12px 28px', borderRadius:8, cursor:'pointer', letterSpacing:'0.01em' }}>
              Edible oil refinery →
            </button>
            <button onClick={() => router.push('/onboard/biodiesel')} style={{ fontSize:14, color:'rgba(255,255,255,0.4)', background:'transparent', border:'0.5px solid rgba(255,255,255,0.1)', padding:'12px 28px', borderRadius:8, cursor:'pointer', letterSpacing:'0.01em', transition:'all 0.15s' }} onMouseEnter={e=>{e.target.style.color='rgba(255,255,255,0.7)';e.target.style.borderColor='rgba(255,255,255,0.2)'}} onMouseLeave={e=>{e.target.style.color='rgba(255,255,255,0.4)';e.target.style.borderColor='rgba(255,255,255,0.1)'}}>
              Biodiesel plant →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ padding:'40px 32px 28px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:48, marginBottom:40 }}>
            <div>
              <div className="serif" style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.3px', marginBottom:12, color:'#E8ECF0' }}>Ken<span style={{ color:'#1D9E75' }}>op</span></div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.2)', lineHeight:1.7, maxWidth:360, fontWeight:300 }}>
                Process intelligence platform for edible oil refineries, biodiesel plants, and the oleochemical industry. Chikalthana MIDC, Aurangabad, Maharashtra.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>
              <div>
                <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.15)', letterSpacing:'0.14em', marginBottom:12, textTransform:'uppercase' }}>Platform</p>
                {['Dashboard','AI process chat','Lab data','Morning reports'].map(l => <p key={l} style={{ fontSize:12, color:'rgba(255,255,255,0.18)', marginBottom:8 }}>{l}</p>)}
              </div>
              <div>
                <p className="mono" style={{ fontSize:9, color:'rgba(255,255,255,0.15)', letterSpacing:'0.14em', marginBottom:12, textTransform:'uppercase' }}>Industries</p>
                {['Edible oil refinery','Biodiesel plants','Oleochemicals','Fatty acids'].map(l => <p key={l} style={{ fontSize:12, color:'rgba(255,255,255,0.18)', marginBottom:8 }}>{l}</p>)}
              </div>
            </div>
          </div>
          <div style={{ borderTop:'0.5px solid rgba(255,255,255,0.04)', paddingTop:18, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.12)' }}>© 2025 E-Shakti Binary Currents Private Limited. All rights reserved.</p>
            <p className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.1)', letterSpacing:'0.1em' }}>kenop.in</p>
          </div>
        </div>
      </footer>
    </>
  )
}