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

  const C = {
    bg: '#F8F5EF', bgCard: '#FFFFFF', bgAlt: '#F0EDE5', bgDeep: '#E8E3D8',
    text: '#1C1611', textMid: '#6B6056', textLight: '#A09285',
    green: '#1D9E75', greenLight: '#EAF6F1', greenBorder: 'rgba(29,158,117,0.2)',
    amber: '#B45309', amberLight: '#FEF8EE',
    border: 'rgba(28,22,17,0.09)', borderMid: 'rgba(28,22,17,0.14)',
  }

  const cases = [
    {
      tag: 'Edible oil · Soybean refinery · 50 TPD',
      title: 'Fixed acid dose. Three years of lost FFA yield.',
      finding: 'The sulphuric acid dosage for soapstock splitting had not been recalculated since commissioning. Feed FFA had shifted 0.8% on average. On low-FFA days the plant was over-acidulating. On high-FFA days the endpoint pH drifted and fatty matter stayed trapped in the aqueous layer. The contractor buying the acid oil had been averaging the losses into his pricing for three years.',
      intervention: 'Mapped soapstock composition against 30 batches of feed FFA data. Built a dosage table tied to the morning feed AV result — no instrumentation, no new equipment. The operator checks the feed AV and sets the dose from a table. One page, six rows.',
      result: '3 to 3.5% more FFA recovered in acid oil from the first month. The contractor rate was renegotiated. The improvement went directly to EBITDA.',
      numbers: [['3–3.5%','Additional FFA recovered'],['₹0','Capital invested'],['Month 1','Results visible']],
    },
    {
      tag: 'Edible oil · Soybean refinery · 80 TPD',
      title: 'Deodoriser was 8°C too hot. Tocopherols being destroyed every batch.',
      finding: 'Deodoriser temperature had been set for a flavour specification the plant no longer supplied. The customer changed two years earlier but deodorisation conditions were never revised. At the higher temperature, tocopherols were degrading before reaching the distillate. The plant was selling DOD at 7% tocopherol when 8%+ was achievable with the same feedstock.',
      intervention: 'Analysed 45 batches against deodoriser temperature, vacuum, and stripping steam. Brought temperature down 8°C and reduced residence time. Refined oil FFA specification maintained throughout. No process risk during adjustment.',
      result: 'DOD tocopherol went from 7% to 8.2–8.4%. The buyer repriced the distillate. Same equipment, same feedstock, higher-value product. Three days to implement, zero capital.',
      numbers: [['7% → 8.4%','Tocopherol in DOD'],['₹0','Equipment added'],['3 days','To implement']],
    },
    {
      tag: 'Biodiesel · Tallow feedstock · 20 TPD',
      title: 'Tallow FFA brought from 2–3% to 0.5% before the reactor. Using what was already in the plant.',
      finding: 'The plant was processing tallow with 2 to 3% FFA. This acidity going into transesterification caused soap formation, reduced catalyst efficiency, and pulled FAME yield down. Up to 7% of potential biodiesel yield was being lost as FFA-associated losses in the glycerol layer. A pre-esterification stage had been recommended — which required capital the plant did not have.',
      intervention: 'The crude glycerol from the splitting stage — already running in the plant — contained residual soap and spent catalyst, making it a viable saponification medium. We developed a tallow washing step: raw tallow contacted with crude glycerol before the reactor. Residual soap and catalyst saponify the FFA in the tallow, pulling them into the glycerol phase. Tallow entering the reactor came out at 0.5–0.6% FFA. The saponified fatty acids were recovered during acid splitting as crude fatty acids — a saleable stream. Spent catalyst was tested and found viable for a second cycle.',
      result: 'Tallow FFA reduced from 2–3% to 0.5–0.6% before the reactor. FAME yield improved significantly. Up to 7% FFA previously lost in glycerol now recovered as crude fatty acid byproduct. Catalyst consumption halved. Zero additional capital. The improvement funded itself from the first batch.',
      numbers: [['2–3% → 0.5%','Tallow FFA before reactor'],['7%','FFA recovered from glycerol'],['50%','Catalyst cost reduced']],
    },
    {
      tag: 'Biodiesel · Acid oil feedstock · 30 TPD',
      title: 'Two failed OMC type certifications. The problem was process discipline, not equipment.',
      finding: 'The plant had failed IS 15607:2022 type certification twice on CFPP. Feedstock was acid oil from mixed refinery sources with seasonal saturate variation. The assumption was that feedstock was uncontrollable. A new centrifuge was being quoted.',
      intervention: 'Tracked batch-wise CFPP against feedstock sourcing, reactor temperature, and glycerol settling time across 60 batches. Winter-sourced acid oil with higher saturate content needed a specific reactor temperature band and extended settling before phase separation. Protocol documented for each season and feedstock source.',
      result: 'Cleared IS 15607:2022 type certification on the next attempt. No new equipment. Seasonal protocol in place. Plant is now on the BPCL empanelment list.',
      numbers: [['Cleared','IS 15607 type cert'],['₹0','Equipment added'],['BPCL','Empanelment achieved']],
    },
  ]

  const S = (x={}) => ({ fontFamily:"'Fraunces',Georgia,serif", ...x })
  const M = (x={}) => ({ fontFamily:"'JetBrains Mono',monospace", ...x })
  const D = (x={}) => ({ fontFamily:"'DM Sans',sans-serif", ...x })
  const Pill = ({ children, live }) => (
    <span style={{ fontSize:11, padding:'3px 10px', borderRadius:999, border:`0.5px solid ${live ? C.greenBorder : C.border}`, color: live ? C.green : C.textLight, ...M() }}>{children}</span>
  )
  const PPill = ({ children }) => (
    <span style={{ fontSize:11, padding:'4px 11px', borderRadius:999, background:C.bgAlt, border:`0.5px solid ${C.border}`, color:C.textMid, ...D() }}>{children}</span>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400;1,9..144,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #F8F5EF; color: #1C1611; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(29,158,117,0.15); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(28,22,17,0.15); }
        a { text-decoration: none; color: inherit; }
        @keyframes up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .up { animation: up 0.5s ease forwards; }
        .d1{animation-delay:.06s;opacity:0} .d2{animation-delay:.16s;opacity:0} .d3{animation-delay:.26s;opacity:0} .d4{animation-delay:.36s;opacity:0}
        @media(max-width:768px){
          .hero-h{font-size:36px!important;letter-spacing:-0.5px!important}
          .two{grid-template-columns:1fr!important}
          .three{grid-template-columns:1fr!important}
          .four{grid-template-columns:1fr 1fr!important}
          .nav-links{display:none!important}
          .tabs{overflow-x:auto;white-space:nowrap}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 32px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', background: scrolled ? 'rgba(248,245,239,0.97)' : 'transparent', borderBottom: scrolled ? `0.5px solid ${C.border}` : 'none', backdropFilter: scrolled ? 'blur(16px)' : 'none', transition:'all 0.2s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ ...S(), fontSize:19, fontWeight:700, letterSpacing:'-0.5px', color:C.text }}>Ken<span style={{ color:C.green }}>op</span></span>
          <span style={{ ...M(), fontSize:9, color:C.textLight, borderLeft:`0.5px solid ${C.border}`, paddingLeft:10, letterSpacing:'0.12em' }}>INTELLIGENCE</span>
        </div>
        <div className="nav-links" style={{ display:'flex', alignItems:'center', gap:28 }}>
          {[['Edible oil','#edible-oil'],['Biodiesel','#biodiesel'],['Case studies','#cases'],['Why Kenop','#moat'],['What we do','#scope']].map(([l,h]) => (
            <a key={l} href={h} style={{ ...D(), fontSize:13, color:C.textMid, transition:'color 0.15s' }} onMouseEnter={e=>e.target.style.color=C.text} onMouseLeave={e=>e.target.style.color=C.textMid}>{l}</a>
          ))}
          <button onClick={() => router.push('/login')} style={{ ...D(), fontSize:12, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'6px 16px', borderRadius:6, cursor:'pointer' }}>Sign in</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'120px 32px 80px' }}>
        <div style={{ maxWidth:1060, margin:'0 auto', width:'100%' }}>
          <div className="up d1" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:36 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:C.green }} />
            <span style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.18em' }}>EDIBLE OIL · BIODIESEL · OLEOCHEMICALS</span>
          </div>
          <h1 className="hero-h up d2" style={{ ...S(), fontSize:62, fontWeight:700, lineHeight:1.06, letterSpacing:'-2px', marginBottom:28, color:C.text, maxWidth:840 }}>
            We work with oil and fat<br />plant owners to find the<br />
            <em style={{ color:C.green, fontStyle:'italic' }}>value their process is losing.</em>
          </h1>
          <p className="up d3" style={{ ...D(), fontSize:17, color:C.textMid, lineHeight:1.75, maxWidth:520, marginBottom:16, fontWeight:300 }}>
            In every plant we have looked at — edible oil refinery or biodiesel — there is recoverable value that the owner is not seeing. Not in new machinery. In decisions.
          </p>
          <p className="up d3" style={{ ...D(), fontSize:14, color:C.textLight, lineHeight:1.7, maxWidth:500, marginBottom:44, fontWeight:300 }}>
            Kenop monitors your process continuously, plans your capex with precision, and connects you to the right suppliers and vendors — all through AI trained on oleochemical knowledge from ground-level operators, not the internet.
          </p>
          <div className="up d4" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={() => router.push('/onboard')} style={{ ...D(), fontSize:13, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'11px 24px', borderRadius:7, cursor:'pointer' }}>Onboard your plant →</button>
            <a href="#cases" style={{ ...D(), fontSize:13, color:C.textMid, border:`0.5px solid ${C.borderMid}`, padding:'11px 24px', borderRadius:7, display:'inline-flex', alignItems:'center', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.green}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.borderMid;e.currentTarget.style.color=C.textMid}}>Read case studies</a>
          </div>
          <div style={{ display:'flex', gap:48, marginTop:72, paddingTop:36, borderTop:`0.5px solid ${C.border}`, flexWrap:'wrap', rowGap:24 }}>
            {[['3–3.5%','FFA recovered in soapstock splitting'],['7%','FAME yield recovered in tallow-fed plant'],['₹0','Capital added in any case study below']].map(([n,l]) => (
              <div key={n}>
                <div style={{ ...S(), fontSize:32, fontWeight:700, color:C.green, lineHeight:1 }}>{n}</div>
                <div style={{ ...M(), fontSize:10, color:C.textLight, marginTop:5, letterSpacing:'0.04em', maxWidth:180 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE GAP ── */}
      <section style={{ padding:'80px 32px', background:C.bgAlt, borderTop:`0.5px solid ${C.border}`, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:48 }}>WHAT WE FIND IN MOST PLANTS</p>
          <div className="three" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24 }}>
            {[
              { n:'3–3.5%', unit:'FFA', label:'left in soapstock every batch', detail:'The acid dose for splitting was set at commissioning. Feed composition has changed. Nobody updated the calculation.' },
              { n:'7%', unit:'FAME yield', label:'lost as FFA in the glycerol layer', detail:'In tallow-fed plants with 2–3% FFA feedstock, soap formation pulls yield down before the reaction completes.' },
              { n:'8°C', unit:'too hot', label:'deodoriser temperature in one plant', detail:'The spec changed, the temperature never came down. Tocopherols were burning every batch. The DOD buyer had already priced it in.' },
            ].map((g,i) => (
              <div key={i} style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'32px 28px' }}>
                <div style={{ ...S(), fontSize:60, fontWeight:700, lineHeight:1, color:C.text, letterSpacing:'-2px', marginBottom:2 }}>{g.n}</div>
                <div style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.14em', marginBottom:14 }}>{g.unit}</div>
                <div style={{ ...D(), fontSize:13, color:C.textMid, lineHeight:1.5, marginBottom:10, fontWeight:500 }}>{g.label}</div>
                <div style={{ ...D(), fontSize:12, color:C.textLight, lineHeight:1.65, fontWeight:300 }}>{g.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDIBLE OIL ── */}
      <section id="edible-oil" style={{ padding:'80px 32px', borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <p style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.18em', marginBottom:20 }}>EDIBLE OIL REFINERY</p>
              <h2 style={{ ...S(), fontSize:34, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:24, color:C.text }}>The refinery process has more financial leverage than most owners have been told</h2>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:16, fontWeight:300 }}>Refining loss tracked as a percentage tells you almost nothing. Converted to rupees per month — against what the number should be for your feedstock and process route — it becomes something worth acting on.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:16, fontWeight:300 }}>Soapstock goes out at a flat rate in most plants. That rate was negotiated on a composition the contractor assumed. Your soapstock has almost certainly changed, and the contractor has priced it in.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:32, fontWeight:300 }}>Kenop tracks refining loss, soapstock fatty matter, DOD composition, separator efficiency, and acid dosage — batch by batch, against benchmarks built from your specific feedstock and conditions.</p>
              <button onClick={() => router.push('/onboard/edible-oil')} style={{ ...D(), fontSize:13, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'10px 22px', borderRadius:7, cursor:'pointer', marginBottom:24 }}>Onboard your refinery →</button>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                {['Degumming','Dewaxing','Neutralisation','Soapstock splitting','Bleaching','Deodorisation','Separator efficiency','PLF / Filter press','DOD tocopherol','Acid oil processing'].map(p => <PPill key={p}>{p}</PPill>)}
              </div>
            </div>
            <div>
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'28px', boxShadow:'0 1px 4px rgba(28,22,17,0.06)' }}>
                <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.14em', marginBottom:20 }}>WHAT AN EDIBLE OIL OWNER SEES ON KENOP</p>
                {[
                  { label:'Refining loss this month', val:'0.43%', sub:'Expected for your feed FFA: 0.31%', warn:true },
                  { label:'Monthly cost of the gap', val:'₹1.56L', sub:'At current refined oil price', warn:true },
                  { label:'Soapstock fatty matter average', val:'62.4%', sub:'Your contractor rate assumes 58%', warn:true },
                  { label:'Acid dose vs feed FFA correlation', val:'R² = 0.31', sub:'Low — dose not tracking feedstock variation', warn:true },
                  { label:'DOD tocopherol — last 10 batches', val:'7.1%', sub:'Market premium starts at 8%', warn:true },
                  { label:'Separator efficiency', val:'97.8%', sub:'Within expected range', warn:false },
                ].map((row,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'11px 0', borderBottom: i<5 ? `0.5px solid ${C.border}` : 'none', gap:16 }}>
                    <div>
                      <div style={{ ...D(), fontSize:12, color:C.textMid, marginBottom:3 }}>{row.label}</div>
                      <div style={{ ...M(), fontSize:10, color: row.warn ? C.amber : C.green }}>{row.sub}</div>
                    </div>
                    <div style={{ ...M(), fontSize:16, color: row.warn ? C.amber : C.green, flexShrink:0 }}>{row.val}</div>
                  </div>
                ))}
              </div>
              <p style={{ ...D(), fontSize:11, color:C.textLight, lineHeight:1.6, marginTop:12, fontWeight:300, fontStyle:'italic', padding:'0 4px' }}>Every figure calculated from your own batch records. The benchmark is built from your feedstock and process route — not an industry average.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIODIESEL ── */}
      <section id="biodiesel" style={{ padding:'80px 32px', background:C.bgAlt, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <p style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.18em', marginBottom:20 }}>BIODIESEL PLANT</p>
              <h2 style={{ ...S(), fontSize:34, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:24, color:C.text }}>Your plant is your biggest asset. Most are running at 70% of what they can.</h2>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:16, fontWeight:300 }}>The struggle in most biodiesel plants is not equipment — it is process discipline and domain knowledge that was never systematically built. Glycerol streams carrying value nobody measures. Catalyst discarded after one use when two are viable. Methanol doses set at commissioning and never revisited.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:16, fontWeight:300 }}>IS 15607 compliance is not an equipment problem. We have helped plants clear OMC type certification without a rupee of capital, by understanding which parameters were failing and adjusting the process.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:28, fontWeight:300 }}>Your crude glycerol, spent catalyst, soapstock — these streams have financial value most plant owners have never been shown.</p>
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.greenBorder}`, borderRadius:10, padding:'18px 20px', marginBottom:24 }}>
                <p style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.12em', marginBottom:8 }}>OMC TENDER READINESS — NO CAPEX</p>
                <p style={{ ...D(), fontSize:13, color:C.textMid, lineHeight:1.7, fontWeight:300 }}>We train plants to meet IS 15607:2022 through process discipline. Every parameter tracked against the tender specification before the tanker arrives. Lab testing protocols, batch documentation, equipment qualification included.</p>
              </div>
              <button onClick={() => router.push('/onboard/biodiesel')} style={{ ...D(), fontSize:13, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'10px 22px', borderRadius:7, cursor:'pointer', marginBottom:20 }}>Onboard your plant →</button>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                {['Feedstock pretreatment','Acid conditioning','Bleaching','Acid esterification','Enzymatic esterification','Glycerolysis','Transesterification','Glycerol splitting','Methanol recovery','FAME distillation','Wet washing','Dry washing','Separation','Filtration','IS 15607:2022'].map(p => <PPill key={p}>{p}</PPill>)}
              </div>
            </div>
            <div>
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'28px', boxShadow:'0 1px 4px rgba(28,22,17,0.06)' }}>
                <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.14em', marginBottom:20 }}>WHAT A BIODIESEL OWNER SEES ON KENOP</p>
                {[
                  { label:'FAME yield this month', val:'91.2%', sub:'Theoretical max for your feedstock AV: 94.1%' },
                  { label:'Yield gap — monthly value', val:'₹1.82L', sub:'At current FAME sale price' },
                  { label:'Methanol dose vs optimal', val:'294 kg/MT', sub:'Optimal for your feed AV: 271 kg/MT' },
                  { label:'Methanol overconsumption', val:'₹38K/mo', sub:'23 kg excess × 520 MT × ₹28/kg' },
                  { label:'Spent catalyst residual activity', val:'Not tested', sub:'Second cycle viability unknown' },
                  { label:'IS 15607 parameter status', val:'8/12 pass', sub:'CFPP, flash point, linolenic flagged' },
                ].map((row,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'11px 0', borderBottom: i<5 ? `0.5px solid ${C.border}` : 'none', gap:16 }}>
                    <div>
                      <div style={{ ...D(), fontSize:12, color:C.textMid, marginBottom:3 }}>{row.label}</div>
                      <div style={{ ...M(), fontSize:10, color:C.amber }}>{row.sub}</div>
                    </div>
                    <div style={{ ...M(), fontSize:16, color:C.amber, flexShrink:0 }}>{row.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ── */}
      <section id="cases" style={{ padding:'80px 32px', borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:16 }}>
            <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em' }}>CASE STUDIES</p>
            <p style={{ ...D(), fontSize:13, color:C.textLight, fontWeight:300, fontStyle:'italic' }}>Four plants. Four problems. Zero capital added in any of them.</p>
          </div>
          <div className="tabs" style={{ display:'flex', gap:2 }}>
            {['Edible oil · Acid dosage','Edible oil · Tocopherol','Biodiesel · Tallow FFA','Biodiesel · OMC tender'].map((l,i) => (
              <button key={i} onClick={() => setActiveCase(i)} style={{ ...D(), padding:'9px 16px', background: activeCase===i ? C.bgCard : 'transparent', border:`0.5px solid ${activeCase===i ? C.border : 'transparent'}`, borderBottom: activeCase===i ? `0.5px solid ${C.bgCard}` : `0.5px solid ${C.border}`, borderRadius:'8px 8px 0 0', fontSize:11, color: activeCase===i ? C.text : C.textLight, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', marginBottom:'-0.5px' }}>{l}</button>
            ))}
          </div>
          <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:'0 8px 8px 8px', padding:'36px', boxShadow:'0 1px 4px rgba(28,22,17,0.06)' }}>
            <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
              <div>
                <p style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.12em', marginBottom:14 }}>{cases[activeCase].tag}</p>
                <h3 style={{ ...S(), fontSize:23, fontWeight:600, lineHeight:1.25, letterSpacing:'-0.3px', marginBottom:24, color:C.text }}>{cases[activeCase].title}</h3>
                {[['WHAT WAS HAPPENING', cases[activeCase].finding, C.textMid, 300],['WHAT WE DID', cases[activeCase].intervention, C.textMid, 300],['RESULT', cases[activeCase].result, C.text, 400]].map(([label,text,color,weight],i) => (
                  <div key={i} style={{ marginBottom:20 }}>
                    <p style={{ ...M(), fontSize:9, color:C.textLight, letterSpacing:'0.16em', marginBottom:7 }}>{label}</p>
                    <p style={{ ...D(), fontSize:13, color, lineHeight:1.75, fontWeight:weight }}>{text}</p>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {cases[activeCase].numbers.map(([n,l],i) => (
                    <div key={i} style={{ padding:'22px 24px', background:C.greenLight, border:`0.5px solid ${C.greenBorder}`, borderRadius:10 }}>
                      <div style={{ ...S(), fontSize:40, fontWeight:700, color:C.green, lineHeight:1, marginBottom:8, letterSpacing:'-1px' }}>{n}</div>
                      <div style={{ ...D(), fontSize:13, color:C.textMid, fontWeight:300 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <p style={{ ...D(), fontSize:11, color:C.textLight, lineHeight:1.6, marginTop:14, fontWeight:300, fontStyle:'italic' }}>Results specific to the plant described. Outcomes depend on feedstock, baseline conditions, and equipment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI MOAT ── */}
      <section id="moat" style={{ padding:'80px 32px', background:C.bgAlt, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:20 }}>WHY KENOP IS NOT CHATGPT FOR OIL PLANTS</p>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <h2 style={{ ...S(), fontSize:32, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:20, color:C.text }}>
                Global oleochemical intelligence. Applied to your plant's own data.
              </h2>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                ChatGPT and Gemini are trained on general internet data. They know what glycerolysis is. They do not know that crude glycerol from a tallow-based process has different soap content than one from acid oil, or that the 27:3 methanol molar ratio needs adjustment in the third stage when ambient temperature drops below 22°C.
              </p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:16, fontWeight:300 }}>
                Kenop's AI is trained on process knowledge accumulated from working directly with edible oil refineries and biodiesel plants — operator observations, troubleshooting logs, batch records, legacy process data. Knowledge that does not exist in any textbook or on any website.
              </p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, fontWeight:300 }}>
                That global oleochemical intelligence is then applied to your plant's specific data. The result is an answer that knows both the industry pattern and your plant's individual deviation from it.
              </p>
            </div>
            <div>
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:12, overflow:'hidden', boxShadow:'0 1px 4px rgba(28,22,17,0.06)' }}>
                <div style={{ padding:'14px 20px', borderBottom:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(248,81,73,0.35)' }} />
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(230,168,23,0.35)' }} />
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(29,158,117,0.35)' }} />
                  <span style={{ ...M(), fontSize:10, color:C.textLight, marginLeft:8, letterSpacing:'0.1em' }}>SAME QUESTION. DIFFERENT ANSWERS.</span>
                </div>
                <div style={{ padding:'20px' }}>
                  <div style={{ background:C.bgAlt, borderRadius:8, padding:'12px 14px', marginBottom:20 }}>
                    <p style={{ ...M(), fontSize:9, color:C.textLight, marginBottom:5, letterSpacing:'0.08em' }}>QUESTION ASKED</p>
                    <p style={{ ...D(), fontSize:13, color:C.textMid, lineHeight:1.5 }}>My FAME flash point is 138°C today. What should I check?</p>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ ...M(), fontSize:10, padding:'2px 10px', borderRadius:999, background:'#FEF2F2', border:'0.5px solid rgba(248,81,73,0.2)', color:'#B91C1C', display:'inline-block', marginBottom:10 }}>ChatGPT / Gemini</div>
                    <div style={{ background:'#FEF2F2', border:'0.5px solid rgba(248,81,73,0.15)', borderRadius:8, padding:'14px 16px' }}>
                      <p style={{ ...D(), fontSize:12, color:'#9B1C1C', lineHeight:1.7, fontWeight:300, fontStyle:'italic' }}>
                        "A low flash point in biodiesel typically indicates incomplete methanol removal. Check your vacuum dryer, ensure methanol stripping is complete, verify flash point testing equipment is calibrated, and confirm IS 15607:2022 compliance which requires a minimum flash point of 120°C..."
                      </p>
                    </div>
                    <p style={{ ...D(), fontSize:11, color:'#B91C1C', marginTop:6, fontStyle:'italic' }}>Correct in general. Useless for your plant today.</p>
                  </div>
                  <div>
                    <div style={{ ...M(), fontSize:10, padding:'2px 10px', borderRadius:999, background:C.greenLight, border:`0.5px solid ${C.greenBorder}`, color:C.green, display:'inline-block', marginBottom:10 }}>Kenop Intelligence</div>
                    <div style={{ background:C.greenLight, border:`0.5px solid ${C.greenBorder}`, borderRadius:8, padding:'14px 16px' }}>
                      <p style={{ ...D(), fontSize:12, color:'#14532D', lineHeight:1.75, fontWeight:300 }}>
                        "Your flash point has declined — 158°C Monday, 149°C Wednesday, 138°C today. Your methanol dose on batch #47 Tuesday was <span style={{ color:C.amber, fontWeight:500 }}>294 kg/MT vs your usual 271</span> — high feed AV logged that shift. Vacuum dryer ran at <span style={{ color:C.amber, fontWeight:500 }}>92 mbar against setpoint 65</span>. Globally, this pattern in tallow-fed plants is almost always the ejector steam trap — yours failed in February with the same symptom. Check the trap before next batch."
                      </p>
                    </div>
                    <p style={{ ...D(), fontSize:11, color:C.green, marginTop:6, fontStyle:'italic' }}>Your plant's data + global oleochemical pattern recognition. Both working together.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL SCOPE ── */}
      <section id="scope" style={{ padding:'80px 32px', borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:20 }}>WHAT KENOP ACTUALLY DOES</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:0, marginBottom:48 }}>
            <h2 style={{ ...S(), fontSize:36, fontWeight:700, lineHeight:1.1, letterSpacing:'-0.5px', color:C.text, maxWidth:720 }}>
              Not just a money-saving tool.<br />A business intelligence layer for your plant.
            </h2>
          </div>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {[
              {
                n:'01',
                title:'Find value leakage — and close it',
                desc:'We identify where your process is losing money today. Soapstock composition, refining loss deviation, DOD value, yield gaps, catalyst efficiency. Every leakage quantified in rupees per month. Interventions designed to require zero or minimal capital.',
              },
              {
                n:'02',
                title:'Plan your capex with precision',
                desc:'When your plant does need new equipment or a process addition, Kenop uses your own leakage patterns to build the ROI case. Which unit operation is the bottleneck. What the financial gap is. What the investment threshold should be. Capex decisions backed by your plant\'s actual data, not a vendor\'s proposal.',
              },
              {
                n:'03',
                title:'Scan suppliers using your process intelligence',
                desc:'Your process data reveals what you are actually consuming — methanol dose, bleaching earth per MT, acid consumption per batch. Kenop generates procurement reports that show your actual consumption pattern against market pricing. We identify where you are being over-billed and what a better supplier contract should look like.',
              },
              {
                n:'04',
                title:'Develop vendors specific to your plant needs',
                desc:'Most chemical suppliers sell catalogue products. Your plant has specific process conditions — feedstock variability, equipment constraints, temperature profiles. Kenop uses your process intelligence to define what the right product specification is for your plant, then helps you brief suppliers or identify vendors who can meet it.',
              },
              {
                n:'05',
                title:'Data delivered. No effort on the operator.',
                desc:'We handle all data collection from your plant in the background. Your team does nothing differently. Readings flow in from your existing systems and reach your dashboard as runtime updates. The intelligence is always current.',
              },
              {
                n:'06',
                title:'Morning intelligence before the first shift meeting',
                desc:'Every morning, a process summary arrives before the shift begins. Parameter deviations. Financial impact of yesterday\'s performance. What to watch today. Delivered on WhatsApp — no login, no dashboard needed for the owner who wants the number, not the chart.',
              },
            ].map((item,i) => (
              <div key={i} style={{ background:i%2===0 ? C.bgCard : C.bgAlt, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'28px 28px', boxShadow: i%2===0 ? '0 1px 3px rgba(28,22,17,0.05)' : 'none' }}>
                <div style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.12em', marginBottom:14 }}>{item.n}</div>
                <h3 style={{ ...S(), fontSize:18, fontWeight:600, lineHeight:1.25, letterSpacing:'-0.2px', marginBottom:12, color:C.text }}>{item.title}</h3>
                <p style={{ ...D(), fontSize:13, color:C.textMid, lineHeight:1.75, fontWeight:300 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OLEOCHEMICALS ── */}
      <section style={{ padding:'56px 32px', background:C.bgAlt, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:40, flexWrap:'wrap' }}>
          <div>
            <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:10 }}>OLEOCHEMICALS AND BEYOND</p>
            <h3 style={{ ...S(), fontSize:24, fontWeight:600, color:C.text, letterSpacing:'-0.3px', maxWidth:420, lineHeight:1.3 }}>A horizontal platform — expanding across the oleochemical chain</h3>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {[['Fatty acid splitting','live'],['Glycerine refining','live'],['Methyl ester','live'],['Fatty acid plants','soon'],['Dimer acid plants','soon'],['Amines & amides','soon']].map(([l,s]) => (
              <Pill key={l} live={s==='live'}>{l}</Pill>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'100px 32px' }}>
        <div style={{ maxWidth:580, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ ...S(), fontSize:40, fontWeight:700, lineHeight:1.1, letterSpacing:'-1px', marginBottom:20, color:C.text }}>
            What is your plant<br />actually losing per month?
          </h2>
          <p style={{ ...D(), fontSize:16, color:C.textMid, lineHeight:1.7, marginBottom:48, fontWeight:300 }}>
            Tell us about your plant. We will show you where the gaps are — using your own numbers, against what your process should be achieving. Onboarding takes 20 minutes.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/onboard/edible-oil')} style={{ ...D(), fontSize:14, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'12px 28px', borderRadius:8, cursor:'pointer' }}>Edible oil refinery →</button>
            <button onClick={() => router.push('/onboard/biodiesel')} style={{ ...D(), fontSize:14, color:C.textMid, background:'transparent', border:`0.5px solid ${C.borderMid}`, padding:'12px 28px', borderRadius:8, cursor:'pointer', transition:'all 0.15s' }} onMouseEnter={e=>{e.target.style.color=C.green;e.target.style.borderColor=C.green}} onMouseLeave={e=>{e.target.style.color=C.textMid;e.target.style.borderColor=C.borderMid}}>Biodiesel plant →</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:'40px 32px 28px', borderTop:`0.5px solid ${C.border}`, background:C.bgAlt }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:48, marginBottom:36 }}>
            <div>
              <div style={{ ...S(), fontSize:18, fontWeight:700, letterSpacing:'-0.3px', marginBottom:10, color:C.text }}>Ken<span style={{ color:C.green }}>op</span></div>
              <p style={{ ...D(), fontSize:13, color:C.textLight, lineHeight:1.7, maxWidth:360, fontWeight:300 }}>Process intelligence for edible oil refineries, biodiesel plants, and the oleochemical industry. Chikalthana MIDC, Aurangabad, Maharashtra.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div>
                <p style={{ ...M(), fontSize:9, color:C.textLight, letterSpacing:'0.14em', marginBottom:10 }}>PLATFORM</p>
                {['Dashboard','AI process chat','Lab data','Reports','Capex planning'].map(l => <p key={l} style={{ ...D(), fontSize:12, color:C.textLight, marginBottom:7 }}>{l}</p>)}
              </div>
              <div>
                <p style={{ ...M(), fontSize:9, color:C.textLight, letterSpacing:'0.14em', marginBottom:10 }}>INDUSTRIES</p>
                {['Edible oil','Biodiesel','Oleochemicals','Fatty acids','Dimer acids'].map(l => <p key={l} style={{ ...D(), fontSize:12, color:C.textLight, marginBottom:7 }}>{l}</p>)}
              </div>
            </div>
          </div>
          <div style={{ borderTop:`0.5px solid ${C.border}`, paddingTop:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
            <p style={{ ...D(), fontSize:11, color:C.textLight }}>© 2025 E-Shakti Binary Currents Private Limited. All rights reserved.</p>
            <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.1em' }}>kenop.in</p>
          </div>
        </div>
      </footer>
    </>
  )
}