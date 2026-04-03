'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── ILLUSTRATION COMPONENTS ─────────────────────────────────────────────────

// Hero: refinery with value leaks shown
function RefineryIllustration() {
  return (
    <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', maxWidth:480 }}>
      {/* Crude feed pipe - left */}
      <line x1="20" y1="170" x2="80" y2="170" stroke="#1C1611" strokeWidth="1" strokeOpacity="0.3"/>
      <text x="8" y="162" fontSize="9" fill="#A09285" fontFamily="'JetBrains Mono',monospace" letterSpacing="1">CRUDE</text>
      <text x="8" y="174" fontSize="9" fill="#A09285" fontFamily="'JetBrains Mono',monospace" letterSpacing="1">IN</text>

      {/* Tank 1 - Neutraliser */}
      <rect x="80" y="130" width="60" height="80" rx="3" stroke="#1C1611" strokeWidth="1" strokeOpacity="0.25" fill="#F8F5EF"/>
      <text x="110" y="165" fontSize="9" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Neutral-</text>
      <text x="110" y="177" fontSize="9" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">iser</text>
      {/* Leak indicator 1 - soapstock */}
      <line x1="110" y1="210" x2="110" y2="250" stroke="#B45309" strokeWidth="1" strokeDasharray="2 2"/>
      <circle cx="110" cy="258" r="5" fill="#B45309" fillOpacity="0.15" stroke="#B45309" strokeWidth="0.8"/>
      <circle cx="110" cy="258" r="2" fill="#B45309"/>
      <text x="122" y="262" fontSize="8" fill="#B45309" fontFamily="'JetBrains Mono',monospace">SOAPSTOCK LOSS</text>

      {/* Pipe 1→2 */}
      <line x1="140" y1="170" x2="190" y2="170" stroke="#1C1611" strokeWidth="1" strokeOpacity="0.3"/>

      {/* Tank 2 - Bleacher */}
      <rect x="190" y="130" width="60" height="80" rx="3" stroke="#1C1611" strokeWidth="1" strokeOpacity="0.25" fill="#F8F5EF"/>
      <text x="220" y="172" fontSize="9" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Bleacher</text>

      {/* Pipe 2→3 */}
      <line x1="250" y1="170" x2="300" y2="170" stroke="#1C1611" strokeWidth="1" strokeOpacity="0.3"/>

      {/* Tank 3 - Deodoriser */}
      <rect x="300" y="110" width="60" height="120" rx="3" stroke="#1C1611" strokeWidth="1" strokeOpacity="0.25" fill="#F8F5EF"/>
      <text x="330" y="165" fontSize="9" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Deodori-</text>
      <text x="330" y="177" fontSize="9" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">ser</text>
      {/* Leak indicator 2 - DOD */}
      <line x1="330" y1="110" x2="330" y2="70" stroke="#B45309" strokeWidth="1" strokeDasharray="2 2"/>
      <circle cx="330" cy="62" r="5" fill="#B45309" fillOpacity="0.15" stroke="#B45309" strokeWidth="0.8"/>
      <circle cx="330" cy="62" r="2" fill="#B45309"/>
      <text x="342" y="66" fontSize="8" fill="#B45309" fontFamily="'JetBrains Mono',monospace">DOD VALUE LOST</text>

      {/* Output pipe */}
      <line x1="360" y1="170" x2="440" y2="170" stroke="#1D9E75" strokeWidth="1.5" strokeOpacity="0.6"/>
      <text x="395" y="162" fontSize="9" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">REFINED</text>
      <text x="395" y="174" fontSize="9" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">OIL OUT</text>
      <polygon points="440,166 450,170 440,174" fill="#1D9E75" fillOpacity="0.6"/>

      {/* Separator */}
      <ellipse cx="168" cy="200" rx="14" ry="14" stroke="#1C1611" strokeWidth="0.8" strokeOpacity="0.2" fill="none"/>
      <text x="168" y="204" fontSize="7" fill="#A09285" fontFamily="'DM Sans',sans-serif" textAnchor="middle">SEP</text>

      {/* Kenop monitoring line */}
      <line x1="80" y1="305" x2="400" y2="305" stroke="#1D9E75" strokeWidth="0.5" strokeDasharray="1 3"/>
      <text x="240" y="320" fontSize="8" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle" letterSpacing="1">KENOP MONITORING</text>
      {/* Vertical connectors to tanks */}
      <line x1="110" y1="305" x2="110" y2="283" stroke="#1D9E75" strokeWidth="0.5" strokeOpacity="0.4"/>
      <line x1="220" y1="305" x2="220" y2="283" stroke="#1D9E75" strokeWidth="0.5" strokeOpacity="0.4"/>
      <line x1="330" y1="305" x2="330" y2="283" stroke="#1D9E75" strokeWidth="0.5" strokeOpacity="0.4"/>
      <circle cx="110" cy="305" r="2.5" fill="#1D9E75" fillOpacity="0.5"/>
      <circle cx="220" cy="305" r="2.5" fill="#1D9E75" fillOpacity="0.5"/>
      <circle cx="330" cy="305" r="2.5" fill="#1D9E75" fillOpacity="0.5"/>

      {/* Acid dose annotation */}
      <line x1="100" y1="130" x2="80" y2="100" stroke="#B45309" strokeWidth="0.5" strokeOpacity="0.5"/>
      <text x="14" y="96" fontSize="8" fill="#B45309" fontFamily="'JetBrains Mono',monospace">ACID DOSE</text>
      <text x="14" y="108" fontSize="8" fill="#B45309" fontFamily="'JetBrains Mono',monospace">NOT UPDATED</text>
      <text x="14" y="120" fontSize="8" fill="#B45309" fontFamily="'JetBrains Mono',monospace">SINCE 2021</text>
    </svg>
  )
}

// Biodiesel process flow
function BiodieselFlow() {
  return (
    <svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', maxWidth:480 }}>
      {/* Feedstock */}
      <rect x="10" y="70" width="60" height="60" rx="3" stroke="#1C1611" strokeWidth="0.8" strokeOpacity="0.2" fill="#F8F5EF"/>
      <text x="40" y="97" fontSize="8" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Tallow</text>
      <text x="40" y="109" fontSize="8" fill="#B45309" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">2–3% FFA</text>
      <line x1="70" y1="100" x2="100" y2="100" stroke="#B45309" strokeWidth="1" strokeOpacity="0.5"/>

      {/* Glycerol wash box */}
      <rect x="100" y="55" width="70" height="90" rx="3" stroke="#1D9E75" strokeWidth="1" strokeOpacity="0.4" fill="#EAF6F1"/>
      <text x="135" y="89" fontSize="8" fill="#1D9E75" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Glycerol</text>
      <text x="135" y="101" fontSize="8" fill="#1D9E75" fontFamily="'DM Sans',sans-serif" textAnchor="middle">wash</text>
      <text x="135" y="117" fontSize="8" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">0.5% FFA</text>
      <text x="135" y="130" fontSize="7" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">↓ Kenop method</text>
      <line x1="170" y1="100" x2="200" y2="100" stroke="#1D9E75" strokeWidth="1" strokeOpacity="0.5"/>

      {/* Reactor */}
      <rect x="200" y="65" width="60" height="70" rx="3" stroke="#1C1611" strokeWidth="0.8" strokeOpacity="0.2" fill="#F8F5EF"/>
      <text x="230" y="99" fontSize="8" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Trans-</text>
      <text x="230" y="111" fontSize="8" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">esterify</text>
      <line x1="260" y1="100" x2="300" y2="100" stroke="#1D9E75" strokeWidth="1" strokeOpacity="0.5"/>

      {/* FAME output */}
      <rect x="300" y="70" width="60" height="60" rx="3" stroke="#1D9E75" strokeWidth="1" strokeOpacity="0.4" fill="#EAF6F1"/>
      <text x="330" y="97" fontSize="8" fill="#1D9E75" fontFamily="'DM Sans',sans-serif" textAnchor="middle">FAME</text>
      <text x="330" y="109" fontSize="8" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">&lt;0.5%</text>
      <line x1="360" y1="100" x2="400" y2="100" stroke="#1D9E75" strokeWidth="1.5" strokeOpacity="0.5"/>
      <polygon points="398,96 408,100 398,104" fill="#1D9E75" fillOpacity="0.5"/>
      <text x="420" y="104" fontSize="8" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace">OMC</text>

      {/* Glycerol recovery loop */}
      <path d="M 135 145 Q 135 165 230 165 Q 310 165 330 165 Q 380 165 380 135 Q 380 115 370 100" stroke="#1D9E75" strokeWidth="0.7" strokeDasharray="3 2" strokeOpacity="0.4" fill="none"/>
      <text x="240" y="178" fontSize="8" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">FFA recovered as crude fatty acids</text>

      {/* Spent catalyst loop */}
      <path d="M 135 55 Q 135 30 165 30 Q 215 30 230 30 Q 230 30 230 65" stroke="#1D9E75" strokeWidth="0.7" strokeDasharray="3 2" strokeOpacity="0.3" fill="none"/>
      <text x="183" y="24" fontSize="8" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">spent catalyst reused</text>
    </svg>
  )
}

// AI comparison visual
function AiCompareIllustration() {
  return (
    <svg viewBox="0 0 440 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%' }}>
      {/* Generic AI */}
      <rect x="10" y="10" width="190" height="180" rx="6" stroke="#E4D5C5" strokeWidth="1" fill="#FEF9F5"/>
      <text x="105" y="32" fontSize="10" fill="#A09285" fontFamily="'JetBrains Mono',monospace" textAnchor="middle" letterSpacing="1">ChatGPT / Gemini</text>
      <line x1="10" y1="40" x2="200" y2="40" stroke="#E4D5C5" strokeWidth="0.5"/>
      {/* Generic knowledge cloud */}
      <ellipse cx="105" cy="80" rx="60" ry="25" stroke="#E4D5C5" strokeWidth="0.8" fill="#F0EDE5"/>
      <text x="105" y="78" fontSize="8" fill="#C4B5A5" fontFamily="'DM Sans',sans-serif" textAnchor="middle">General internet</text>
      <text x="105" y="90" fontSize="8" fill="#C4B5A5" fontFamily="'DM Sans',sans-serif" textAnchor="middle">knowledge</text>
      {/* Generic answer indicator */}
      <text x="105" y="125" fontSize="8" fill="#C4B5A5" fontFamily="'DM Sans',sans-serif" textAnchor="middle">"Check your vacuum dryer.</text>
      <text x="105" y="138" fontSize="8" fill="#C4B5A5" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Methanol stripping may be</text>
      <text x="105" y="151" fontSize="8" fill="#C4B5A5" fontFamily="'DM Sans',sans-serif" textAnchor="middle">incomplete..."</text>
      <text x="105" y="175" fontSize="8" fill="#B45309" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">Textbook. Not actionable.</text>

      {/* Arrow */}
      <text x="220" y="105" fontSize="16" fill="#E4D5C5" textAnchor="middle">vs</text>

      {/* Kenop */}
      <rect x="240" y="10" width="190" height="180" rx="6" stroke="#1D9E75" strokeWidth="1" strokeOpacity="0.4" fill="#EAF6F1"/>
      <text x="335" y="32" fontSize="10" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle" letterSpacing="1">Kenop</text>
      <line x1="240" y1="40" x2="430" y2="40" stroke="#1D9E75" strokeWidth="0.5" strokeOpacity="0.3"/>
      {/* Two knowledge layers */}
      <ellipse cx="335" cy="70" rx="60" ry="18" stroke="#1D9E75" strokeWidth="0.7" strokeOpacity="0.4" fill="#D4EDE6"/>
      <text x="335" y="68" fontSize="7.5" fill="#1D9E75" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Oleochemical expertise</text>
      <text x="335" y="79" fontSize="7.5" fill="#1D9E75" fontFamily="'DM Sans',sans-serif" textAnchor="middle">from ground operators</text>
      <ellipse cx="335" cy="100" rx="55" ry="15" stroke="#1D9E75" strokeWidth="0.7" strokeOpacity="0.6" fill="#1D9E75" fillOpacity="0.12"/>
      <text x="335" y="97" fontSize="7.5" fill="#1D9E75" fontFamily="'DM Sans',sans-serif" textAnchor="middle" fontWeight="500">Your plant's actual batch</text>
      <text x="335" y="109" fontSize="7.5" fill="#1D9E75" fontFamily="'DM Sans',sans-serif" textAnchor="middle" fontWeight="500">data + readings</text>
      {/* Specific answer */}
      <text x="335" y="133" fontSize="7.5" fill="#14532D" fontFamily="'DM Sans',sans-serif" textAnchor="middle">"Batch #47 had 294 kg/MT</text>
      <text x="335" y="146" fontSize="7.5" fill="#14532D" fontFamily="'DM Sans',sans-serif" textAnchor="middle">methanol. Vacuum at 92 mbar.</text>
      <text x="335" y="159" fontSize="7.5" fill="#14532D" fontFamily="'DM Sans',sans-serif" textAnchor="middle">Check ejector steam trap."</text>
      <text x="335" y="178" fontSize="8" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">Specific. Actionable. Today.</text>
    </svg>
  )
}

// Scope hub illustration
function ScopeIllustration() {
  return (
    <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', maxWidth:300 }}>
      {/* Central hub */}
      <circle cx="150" cy="130" r="36" stroke="#1D9E75" strokeWidth="1" strokeOpacity="0.4" fill="#EAF6F1"/>
      <text x="150" y="126" fontSize="10" fill="#1D9E75" fontFamily="'DM Sans',sans-serif" textAnchor="middle" fontWeight="500">Kenop</text>
      <text x="150" y="139" fontSize="9" fill="#1D9E75" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">Intelligence</text>

      {/* Spokes and nodes */}
      {[
        { label:'Process\nmonitoring', x:150, y:20, cx:150, cy:56 },
        { label:'Capex\nplanning', x:268, y:80, cx:234, cy:100 },
        { label:'Supplier\nscanning', x:268, y:175, cx:234, cy:160 },
        { label:'Vendor\ndevelopment', x:150, y:235, cx:150, cy:204 },
        { label:'Waste\nvalorisation', x:32, y:175, cx:66, cy:160 },
        { label:'Morning\nintelligence', x:32, y:80, cx:66, cy:100 },
      ].map((n, i) => (
        <g key={i}>
          <line x1="150" y1="130" x2={n.cx} y2={n.cy} stroke="#1C1611" strokeWidth="0.5" strokeOpacity="0.12"/>
          <circle cx={n.cx} cy={n.cy} r="22" stroke="#1C1611" strokeWidth="0.5" strokeOpacity="0.15" fill="#F8F5EF"/>
          {n.label.split('\n').map((t, j) => (
            <text key={j} x={n.cx} y={n.cy - 4 + j*11} fontSize="7.5" fill="#6B6056" fontFamily="'DM Sans',sans-serif" textAnchor="middle">{t}</text>
          ))}
        </g>
      ))}
    </svg>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

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
    bg:'#F8F5EF', bgCard:'#FFFFFF', bgAlt:'#F0EDE5', text:'#1C1611',
    textMid:'#6B6056', textLight:'#A09285', green:'#1D9E75',
    greenLight:'#EAF6F1', greenBorder:'rgba(29,158,117,0.2)',
    amber:'#B45309', border:'rgba(28,22,17,0.09)', borderMid:'rgba(28,22,17,0.14)',
  }
  const S = (x={}) => ({ fontFamily:"'Fraunces',Georgia,serif", ...x })
  const M = (x={}) => ({ fontFamily:"'JetBrains Mono',monospace", ...x })
  const D = (x={}) => ({ fontFamily:"'DM Sans',sans-serif", ...x })
  const PPill = ({ c }) => (
    <span style={{ fontSize:11, padding:'4px 11px', borderRadius:999, background:C.bgAlt, border:`0.5px solid ${C.border}`, color:C.textMid, ...D() }}>{c}</span>
  )

  const cases = [
    {
      tag:'Edible oil · Soybean refinery · 50 TPD',
      title:'Fixed acid dose. Three years of lost FFA.',
      finding:'The sulphuric acid dosage for soapstock splitting had not been recalculated since commissioning. Feed FFA had shifted 0.8% on average. On low-FFA days the plant was over-acidulating; on high-FFA days fatty matter stayed trapped in the aqueous layer. The acid oil contractor had been averaging the losses into his pricing for three years.',
      intervention:'Mapped soapstock composition against 30 batches of feed FFA data. Built a dosage table tied to the morning feed AV result — no instrumentation, no new equipment. One page, six rows.',
      result:'3 to 3.5% more FFA recovered from the first month. Contractor rate renegotiated. Straight to EBITDA.',
      numbers:[['3–3.5%','Additional FFA recovered'],['₹0','Capital invested'],['Month 1','Results visible']],
    },
    {
      tag:'Edible oil · Soybean refinery · 80 TPD',
      title:'Deodoriser 8°C too hot. Tocopherols destroyed every batch.',
      finding:'Temperature had been set for a flavour spec the plant no longer supplied. The customer changed two years earlier but deodorisation conditions were never revised. Tocopherols were degrading before reaching the distillate. The plant was selling DOD at 7% tocopherol when 8%+ was achievable.',
      intervention:'Analysed 45 batches against temperature, vacuum, and stripping steam. Brought temperature down 8°C, tightened residence time. Refined oil FFA specification maintained throughout.',
      result:'DOD tocopherol from 7% to 8.2–8.4%. Buyer repriced upward. Same equipment, same feedstock, higher-value product. Three days to implement.',
      numbers:[['7% → 8.4%','Tocopherol in DOD'],['₹0','Equipment added'],['3 days','To implement']],
    },
    {
      tag:'Biodiesel · Tallow feedstock · 20 TPD',
      title:'Tallow FFA from 2–3% to 0.5% before the reactor. Using what was already in the plant.',
      finding:'Tallow at 2–3% FFA was causing soap formation, reducing catalyst efficiency, and pulling FAME yield down. Up to 7% of potential yield was being lost as FFA-associated losses in the glycerol layer. A pre-esterification stage had been recommended — requiring capital the plant did not have.',
      intervention:'Crude glycerol from the splitting stage — already running — contained residual soap and spent catalyst, making it a saponification medium. Raw tallow was contacted with crude glycerol before the reactor. FFA in tallow pulled into glycerol phase. Recovered during acid splitting as crude fatty acids — a saleable stream. Spent catalyst tested and found viable for a second cycle.',
      result:'Tallow FFA: 2–3% down to 0.5–0.6% before the reactor. FAME yield improved. Up to 7% FFA previously lost now recovered as crude fatty acid byproduct. Catalyst consumption halved. Zero capital added.',
      numbers:[['2–3% → 0.5%','Tallow FFA before reactor'],['7%','FFA recovered from glycerol'],['50%','Catalyst cost reduced']],
    },
    {
      tag:'Biodiesel · Acid oil · 30 TPD',
      title:'Two failed OMC type certifications. Process, not equipment.',
      finding:'Failed IS 15607:2022 twice on CFPP. Acid oil from mixed refinery sources had seasonal saturate variation. The plant assumed feedstock was uncontrollable. A centrifuge was being quoted.',
      intervention:'Tracked CFPP against feedstock sourcing, reactor temperature, and glycerol settling time across 60 batches. Winter acid oil needed a specific reactor temperature band and extended settling. Protocol documented by season and feedstock source.',
      result:'Cleared IS 15607:2022 type certification on the next attempt. No new equipment. Plant now on BPCL empanelment list.',
      numbers:[['Cleared','IS 15607 type cert'],['₹0','Equipment added'],['BPCL','Empanelment achieved']],
    },
  ]

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
          .hero-h{font-size:34px!important;letter-spacing:-0.5px!important}
          .two{grid-template-columns:1fr!important}
          .three{grid-template-columns:1fr!important}
          .nav-links{display:none!important}
          .tabs{overflow-x:auto;white-space:nowrap}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 32px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', background: scrolled ? 'rgba(248,245,239,0.97)' : 'transparent', borderBottom: scrolled ? `0.5px solid ${C.border}` : 'none', backdropFilter: scrolled ? 'blur(16px)' : 'none', transition:'all 0.2s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {/* E-Shakti dove logo */}
          <img src="/logo-eshakti.jpg" alt="E-Shakti" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', opacity:0.9 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            <span style={{ ...S(), fontSize:17, fontWeight:700, letterSpacing:'-0.3px', color:C.text, lineHeight:1 }}>Ken<span style={{ color:C.green }}>op</span></span>
            <span style={{ ...M(), fontSize:8, color:C.textLight, letterSpacing:'0.1em', lineHeight:1 }}>INTELLIGENCE</span>
          </div>
        </div>
        <div className="nav-links" style={{ display:'flex', alignItems:'center', gap:28 }}>
          {[['Edible oil','#edible-oil'],['Biodiesel','#biodiesel'],['Case studies','#cases'],['Why Kenop','#moat'],['Pricing','/pricing']].map(([l,h]) => (
            <a key={l} href={h} style={{ ...D(), fontSize:13, color:C.textMid, transition:'color 0.15s' }} onMouseEnter={e=>e.target.style.color=C.text} onMouseLeave={e=>e.target.style.color=C.textMid}>{l}</a>
          ))}
          <button onClick={() => router.push('/login')} style={{ ...D(), fontSize:12, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'7px 18px', borderRadius:6, cursor:'pointer' }}>Sign in</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'110px 32px 80px' }}>
        <div style={{ maxWidth:1060, margin:'0 auto', width:'100%' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
            <div>
              <div className="up d1" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:32 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:C.green }} />
                <span style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.18em' }}>EDIBLE OIL · BIODIESEL · OLEOCHEMICALS</span>
              </div>
              <h1 className="hero-h up d2" style={{ ...S(), fontSize:56, fontWeight:700, lineHeight:1.06, letterSpacing:'-1.5px', marginBottom:24, color:C.text }}>
                Your plant is losing value<br />every batch.<br />
                <em style={{ color:C.green, fontStyle:'italic' }}>We find it.</em>
              </h1>
              <p className="up d3" style={{ ...D(), fontSize:16, color:C.textMid, lineHeight:1.8, maxWidth:440, marginBottom:36, fontWeight:300 }}>
                In every edible oil refinery and biodiesel plant we have worked with, there is recoverable value the owner is not seeing. Not in new equipment. In the process itself.
              </p>
              <div className="up d4" style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:48 }}>
                <button onClick={() => router.push('/onboard')} style={{ ...D(), fontSize:13, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'11px 24px', borderRadius:7, cursor:'pointer' }}>Onboard your plant →</button>
                <a href="#cases" style={{ ...D(), fontSize:13, color:C.textMid, border:`0.5px solid ${C.borderMid}`, padding:'11px 24px', borderRadius:7, display:'inline-flex', alignItems:'center', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.green}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.borderMid;e.currentTarget.style.color=C.textMid}}>Read case studies</a>
              </div>
              <div style={{ display:'flex', gap:40, paddingTop:32, borderTop:`0.5px solid ${C.border}`, flexWrap:'wrap', rowGap:20 }}>
                {[['3–3.5%','FFA recovered in soapstock'],['7%','FAME yield recovered from glycerol'],['₹0','Capital added in any case study']].map(([n,l]) => (
                  <div key={n}>
                    <div style={{ ...S(), fontSize:28, fontWeight:700, color:C.green, lineHeight:1 }}>{n}</div>
                    <div style={{ ...M(), fontSize:9, color:C.textLight, marginTop:4, letterSpacing:'0.04em', maxWidth:160, lineHeight:1.4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Hero illustration */}
            <div className="up d3" style={{ opacity:0 }}>
              <RefineryIllustration />
              <p style={{ ...M(), fontSize:9, color:C.textLight, textAlign:'center', marginTop:12, letterSpacing:'0.06em' }}>
                Edible oil refinery — amber shows where value is currently escaping
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GAP SECTION ── */}
      <section style={{ padding:'80px 32px', background:C.bgAlt, borderTop:`0.5px solid ${C.border}`, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:48 }}>WHAT WE FIND IN MOST PLANTS</p>
          <div className="three" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24 }}>
            {[
              { n:'3–3.5%', unit:'FFA', label:'leaving in soapstock every batch', detail:'Acid dose set at commissioning. Feed composition has since changed. Nobody updated the table.', icon:(
                <svg viewBox="0 0 60 50" style={{ width:60, height:50 }}>
                  <path d="M 30 5 L 30 35" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M 30 35 Q 30 48 22 48 Q 14 48 14 40 Q 14 30 22 35 Q 26 37 30 35" fill="#B45309" fillOpacity="0.12" stroke="#B45309" strokeWidth="0.8"/>
                  <circle cx="30" cy="42" r="5" fill="#B45309" fillOpacity="0.15" stroke="#B45309" strokeWidth="0.8"/>
                </svg>
              )},
              { n:'7%', unit:'FAME yield', label:'lost as FFA in the glycerol layer', detail:'In tallow-fed plants, FFA going into the reactor pulls yield down before the reaction completes.', icon:(
                <svg viewBox="0 0 60 50" style={{ width:60, height:50 }}>
                  <rect x="10" y="15" width="40" height="25" rx="2" stroke="#1C1611" strokeWidth="0.8" strokeOpacity="0.25" fill="#F8F5EF"/>
                  <rect x="10" y="33" width="40" height="7" rx="1" fill="#B45309" fillOpacity="0.15"/>
                  <text x="30" y="44" fontSize="7" fill="#B45309" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">7% lost</text>
                  <path d="M 10 33 L 50 33" stroke="#B45309" strokeWidth="0.8" strokeDasharray="2 1"/>
                </svg>
              )},
              { n:'8°C', unit:'too hot', label:'deodoriser — DOD value burning away', detail:'Specification changed, temperature never came down. Tocopherols degrading at every batch.', icon:(
                <svg viewBox="0 0 60 50" style={{ width:60, height:50 }}>
                  <path d="M 30 8 Q 30 8 30 30 Q 30 42 22 44 Q 14 46 14 38 Q 14 28 22 32 Q 26 34 30 30 Q 30 8 30 8" fill="#B45309" fillOpacity="0.1" stroke="#B45309" strokeWidth="0.8"/>
                  <text x="38" y="16" fontSize="9" fill="#B45309" fontFamily="'JetBrains Mono',monospace">8°C</text>
                  <path d="M 34 12 L 38 10" stroke="#B45309" strokeWidth="0.7"/>
                </svg>
              )},
            ].map((g,i) => (
              <div key={i} style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'28px 24px' }}>
                <div style={{ marginBottom:16 }}>{g.icon}</div>
                <div style={{ ...S(), fontSize:52, fontWeight:700, lineHeight:1, color:C.text, letterSpacing:'-2px', marginBottom:2 }}>{g.n}</div>
                <div style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.12em', marginBottom:12 }}>{g.unit}</div>
                <div style={{ ...D(), fontSize:13, color:C.textMid, lineHeight:1.5, marginBottom:8, fontWeight:500 }}>{g.label}</div>
                <div style={{ ...D(), fontSize:12, color:C.textLight, lineHeight:1.65, fontWeight:300 }}>{g.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDIBLE OIL ── */}
      <section id="edible-oil" style={{ padding:'80px 32px', borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.18em', marginBottom:40 }}>EDIBLE OIL REFINERY</p>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <h2 style={{ ...S(), fontSize:34, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:20, color:C.text }}>The refinery process has more financial leverage than most owners have been told</h2>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:14, fontWeight:300 }}>Refining loss in percentage tells you almost nothing. In rupees per month — against what it should be for your feedstock — it becomes something worth acting on.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:14, fontWeight:300 }}>Your soapstock contractor's rate was negotiated on a composition he assumed. Your soapstock has changed. He has priced it in.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:28, fontWeight:300 }}>Kenop tracks refining loss, soapstock fatty matter, DOD composition, separator efficiency, and acid dosage — every batch, against benchmarks from your specific conditions.</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:28 }}>
                {['Degumming','Dewaxing','Neutralisation','Soapstock splitting','Bleaching','Deodorisation','Separator efficiency','DOD tocopherol tracking'].map(p => <PPill key={p} c={p}/>)}
              </div>
              <button onClick={() => router.push('/onboard/edible-oil')} style={{ ...D(), fontSize:13, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'10px 22px', borderRadius:7, cursor:'pointer' }}>Onboard your refinery →</button>
            </div>
            <div>
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'24px', boxShadow:'0 1px 4px rgba(28,22,17,0.06)', marginBottom:16 }}>
                <p style={{ ...M(), fontSize:9, color:C.textLight, letterSpacing:'0.14em', marginBottom:16 }}>LIVE DASHBOARD SNAPSHOT</p>
                {[
                  { label:'Refining loss this month', val:'0.43%', sub:'Expected for your feed FFA: 0.31%', warn:true },
                  { label:'Monthly cost of the gap', val:'₹1.56L', sub:'At current refined oil price', warn:true },
                  { label:'Soapstock fatty matter', val:'62.4%', sub:'Contractor rate assumes 58%', warn:true },
                  { label:'DOD tocopherol — 10 batches', val:'7.1%', sub:'Market premium starts at 8%', warn:true },
                  { label:'Separator efficiency', val:'97.8%', sub:'Within expected range', warn:false },
                ].map((row,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 0', borderBottom: i<4 ? `0.5px solid ${C.border}` : 'none', gap:16 }}>
                    <div>
                      <div style={{ ...D(), fontSize:12, color:C.textMid, marginBottom:2 }}>{row.label}</div>
                      <div style={{ ...M(), fontSize:9, color: row.warn ? C.amber : C.green }}>{row.sub}</div>
                    </div>
                    <div style={{ ...M(), fontSize:15, color: row.warn ? C.amber : C.green, flexShrink:0 }}>{row.val}</div>
                  </div>
                ))}
              </div>
              <p style={{ ...D(), fontSize:11, color:C.textLight, lineHeight:1.5, fontWeight:300, fontStyle:'italic' }}>Benchmarks built from your feedstock and process route — not an industry average.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIODIESEL ── */}
      <section id="biodiesel" style={{ padding:'80px 32px', background:C.bgAlt, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M(), fontSize:10, color:C.green, letterSpacing:'0.18em', marginBottom:40 }}>BIODIESEL PLANT</p>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <h2 style={{ ...S(), fontSize:34, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:20, color:C.text }}>Your plant is your biggest asset. Most are running at 70% of what they can.</h2>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:14, fontWeight:300 }}>The struggle is not equipment. It is process knowledge that was never built — glycerol streams carrying value nobody measures, catalyst discarded early, methanol doses set at commissioning and never revisited.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:14, fontWeight:300 }}>IS 15607 compliance is not an equipment problem. We have helped plants clear OMC type certification without a rupee of capital — by finding which parameters were failing and adjusting the process.</p>
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.greenBorder}`, borderRadius:10, padding:'16px 18px', marginBottom:24 }}>
                <p style={{ ...M(), fontSize:9, color:C.green, letterSpacing:'0.12em', marginBottom:7 }}>OMC TENDER READINESS — NO CAPEX</p>
                <p style={{ ...D(), fontSize:13, color:C.textMid, lineHeight:1.7, fontWeight:300 }}>Every IS 15607:2022 parameter tracked against the tender spec before the tanker arrives. Lab testing protocols, batch documentation, equipment qualification included.</p>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:24 }}>
                {['Glycerolysis','Transesterification','Glycerol splitting','Methanol recovery','FAME distillation','Wet/dry washing','IS 15607:2022'].map(p => <PPill key={p} c={p}/>)}
              </div>
              <button onClick={() => router.push('/onboard/biodiesel')} style={{ ...D(), fontSize:13, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'10px 22px', borderRadius:7, cursor:'pointer' }}>Onboard your plant →</button>
            </div>
            <div>
              {/* Biodiesel process illustration */}
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'24px', boxShadow:'0 1px 4px rgba(28,22,17,0.06)', marginBottom:12 }}>
                <p style={{ ...M(), fontSize:9, color:C.textLight, letterSpacing:'0.14em', marginBottom:16 }}>TALLOW CASE — PROCESS CHANGE SHOWN</p>
                <BiodieselFlow />
              </div>
              <p style={{ ...D(), fontSize:11, color:C.textLight, lineHeight:1.5, fontWeight:300, fontStyle:'italic' }}>Green = Kenop intervention. Crude glycerol and spent catalyst from the existing plant do the work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ── */}
      <section id="cases" style={{ padding:'80px 32px', borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:12 }}>
            <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em' }}>CASE STUDIES</p>
            <p style={{ ...D(), fontSize:13, color:C.textLight, fontWeight:300, fontStyle:'italic' }}>Four plants. Four problems. Zero capital in any of them.</p>
          </div>
          <div className="tabs" style={{ display:'flex', gap:2 }}>
            {['Edible oil · Acid dosage','Edible oil · Tocopherol','Biodiesel · Tallow FFA','Biodiesel · OMC'].map((l,i) => (
              <button key={i} onClick={() => setActiveCase(i)} style={{ ...D(), padding:'9px 16px', background: activeCase===i ? C.bgCard : 'transparent', border:`0.5px solid ${activeCase===i ? C.border : 'transparent'}`, borderBottom: activeCase===i ? `0.5px solid ${C.bgCard}` : `0.5px solid ${C.border}`, borderRadius:'8px 8px 0 0', fontSize:11, color: activeCase===i ? C.text : C.textLight, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', marginBottom:'-0.5px' }}>{l}</button>
            ))}
          </div>
          <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:'0 8px 8px 8px', padding:'36px', boxShadow:'0 1px 4px rgba(28,22,17,0.06)' }}>
            <div className="two" style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:48, alignItems:'start' }}>
              <div>
                <p style={{ ...M(), fontSize:9, color:C.green, letterSpacing:'0.12em', marginBottom:12 }}>{cases[activeCase].tag}</p>
                <h3 style={{ ...S(), fontSize:22, fontWeight:600, lineHeight:1.25, letterSpacing:'-0.3px', marginBottom:20, color:C.text }}>{cases[activeCase].title}</h3>
                {[['WHAT WAS HAPPENING',cases[activeCase].finding,C.textMid,300],['WHAT WE DID',cases[activeCase].intervention,C.textMid,300],['RESULT',cases[activeCase].result,C.text,400]].map(([label,text,color,w],i) => (
                  <div key={i} style={{ marginBottom:18 }}>
                    <p style={{ ...M(), fontSize:8, color:C.textLight, letterSpacing:'0.16em', marginBottom:6 }}>{label}</p>
                    <p style={{ ...D(), fontSize:13, color, lineHeight:1.75, fontWeight:w }}>{text}</p>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {cases[activeCase].numbers.map(([n,l],i) => (
                  <div key={i} style={{ padding:'20px 22px', background:C.greenLight, border:`0.5px solid ${C.greenBorder}`, borderRadius:10 }}>
                    <div style={{ ...S(), fontSize:38, fontWeight:700, color:C.green, lineHeight:1, marginBottom:6, letterSpacing:'-1px' }}>{n}</div>
                    <div style={{ ...D(), fontSize:12, color:C.textMid, fontWeight:300 }}>{l}</div>
                  </div>
                ))}
                <p style={{ ...D(), fontSize:10, color:C.textLight, lineHeight:1.5, fontWeight:300, fontStyle:'italic', paddingTop:4 }}>Results specific to the plant described.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI MOAT ── */}
      <section id="moat" style={{ padding:'80px 32px', background:C.bgAlt, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:16 }}>WHY KENOP IS NOT CHATGPT FOR OIL PLANTS</p>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <h2 style={{ ...S(), fontSize:32, fontWeight:700, lineHeight:1.12, letterSpacing:'-0.5px', marginBottom:20, color:C.text }}>Global oleochemical intelligence applied to your plant's own data</h2>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:14, fontWeight:300 }}>ChatGPT and Gemini are trained on general internet knowledge. They know what glycerolysis is. They do not know that crude glycerol from a tallow-based process has different soap content than one from acid oil.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:14, fontWeight:300 }}>Kenop's AI is trained on oleochemical knowledge from ground-level plant operators and legacy process data — knowledge that exists nowhere online.</p>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, fontWeight:300 }}>That global oleochemical intelligence is then applied to your plant's specific readings, batch records, and equipment history. The answer knows both the industry pattern and your plant's individual deviation from it.</p>
            </div>
            <div>
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'20px', boxShadow:'0 1px 4px rgba(28,22,17,0.06)', marginBottom:12 }}>
                <AiCompareIllustration />
              </div>
              <p style={{ ...D(), fontSize:11, color:C.textLight, lineHeight:1.5, fontWeight:300, fontStyle:'italic' }}>Same question. The difference is not the AI model — it is the training data and the plant-specific context it has access to.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL SCOPE ── */}
      <section id="scope" style={{ padding:'80px 32px', borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:16 }}>WHAT KENOP ACTUALLY DOES</p>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
            <div>
              <h2 style={{ ...S(), fontSize:34, fontWeight:700, lineHeight:1.1, letterSpacing:'-0.5px', marginBottom:20, color:C.text }}>Not just process monitoring. A complete business intelligence layer.</h2>
              <p style={{ ...D(), fontSize:15, color:C.textMid, lineHeight:1.8, marginBottom:28, fontWeight:300 }}>Kenop identifies value leakage, plans your capex with your own data as justification, scans your suppliers against actual consumption, and helps develop vendors specific to your process conditions. When new equipment or a process addition is genuinely needed, Kenop builds the ROI case using your plant's own leakage patterns — not a vendor's proposal.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {[
                  { n:'01', t:'Find and close value leakage', d:'Every loss quantified in rupees. Interventions designed to need zero or minimal capital.' },
                  { n:'02', t:'Plan capex with precision', d:'ROI case built from your plant\'s actual data. Investment threshold justified by your own leakage numbers.' },
                  { n:'03', t:'Scan suppliers using your process data', d:'Consumption reports showing actual usage vs market pricing. Where you are over-billed.' },
                  { n:'04', t:'Develop vendors for your conditions', d:'Your feedstock variability and equipment constraints define the spec. Not the catalogue.' },
                  { n:'05', t:'Data delivered — zero operator effort', d:'We handle all data collection from your plant in the background. Runtime updates always current.' },
                  { n:'06', t:'Morning intelligence before the shift', d:'Delivered on WhatsApp. Parameter deviations, financial impact, what to watch today.' },
                ].map((item,i) => (
                  <div key={i} style={{ display:'flex', gap:16, padding:'14px 0', borderBottom: i<5 ? `0.5px solid ${C.border}` : 'none' }}>
                    <div style={{ ...M(), fontSize:9, color:C.green, letterSpacing:'0.1em', paddingTop:2, flexShrink:0, width:20 }}>{item.n}</div>
                    <div>
                      <div style={{ ...D(), fontSize:13, fontWeight:500, color:C.text, marginBottom:3 }}>{item.t}</div>
                      <div style={{ ...D(), fontSize:12, color:C.textMid, lineHeight:1.6, fontWeight:300 }}>{item.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:40 }}>
              <ScopeIllustration />
              <p style={{ ...D(), fontSize:11, color:C.textLight, lineHeight:1.5, fontWeight:300, fontStyle:'italic', textAlign:'center', marginTop:16, maxWidth:260 }}>All capabilities connected through a single intelligence layer — one platform, one data source, your plant.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OLEOCHEMICALS ── */}
      <section style={{ padding:'52px 32px', background:C.bgAlt, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap' }}>
          <div>
            <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:8 }}>EXPANDING</p>
            <h3 style={{ ...S(), fontSize:22, fontWeight:600, color:C.text, letterSpacing:'-0.3px', maxWidth:400, lineHeight:1.3 }}>Horizontal across the oleochemical value chain</h3>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {[['Fatty acid splitting','live'],['Glycerine refining','live'],['Methyl ester','live'],['Fatty acid plants','soon'],['Dimer acid plants','soon'],['Amines & amides','soon']].map(([l,s]) => (
              <span key={l} style={{ fontSize:11, padding:'4px 12px', borderRadius:999, border:`0.5px solid ${s==='live' ? C.greenBorder : C.border}`, color: s==='live' ? C.green : C.textLight, ...M() }}>{l}</span>
            ))}
          </div>
        </div>
      </section>


      {/* ── PRICING PREVIEW ── */}
      <section style={{ padding:'80px 32px', background:C.bgAlt, borderTop:`0.5px solid ${C.border}`, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:8 }) }}>PRICING</p>
              <h2 style={{ ...S({ fontSize:32, fontWeight:700, letterSpacing:'-0.5px', color:C.text }) }}>Priced on your plant capacity</h2>
            </div>
            <a href="/pricing" style={{ ...D({ fontSize:13, color:C.green }) }}>See full pricing & process scope tool →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:12, marginBottom:20 }}>
            {[
              { n:'Starter', bd:'≤ 20 TPD', eo:'≤ 30 TPD', bdp:'₹11,000', eop:'₹31,000', c:'#378ADD', cb:'#E6F1FB' },
              { n:'Pro', bd:'21–50 TPD', eo:'31–80 TPD', bdp:'₹22,000', eop:'₹52,000', c:C.green, cb:C.greenLight, pop:true },
              { n:'Growth', bd:'51–100 TPD', eo:'81–200 TPD', bdp:'₹45,000', eop:'₹90,000', c:'#B45309', cb:'#FEF8EE' },
              { n:'Enterprise', bd:'100+ TPD', eo:'200+ TPD', bdp:'₹1L+', eop:'₹1.5L+', c:'#534AB7', cb:'#EEEDFE' },
            ].map(p => (
              <div key={p.n} style={{ background:C.bgCard, border:`0.5px solid ${p.pop ? C.green : C.border}`, borderWidth: p.pop ? 2 : '0.5px', borderRadius:12, padding:16, position:'relative' }}>
                {p.pop && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:C.green, color:'#fff', ...M({ fontSize:9, padding:'2px 10px', borderRadius:999, whiteSpace:'nowrap' }) }}>Most plants</div>}
                <div style={{ ...D({ fontSize:13, fontWeight:500, color:C.text, marginBottom:10 }) }}>{p.n}</div>
                <div style={{ ...M({ fontSize:9, color:C.textLight, marginBottom:6 }) }}>BIODIESEL · {p.bd}</div>
                <div style={{ ...S({ fontSize:18, fontWeight:700, color:p.c, lineHeight:1, marginBottom:8 }) }}>{p.bdp}<span style={{ fontSize:11, ...D({ fontWeight:400 }) }}>/mo</span></div>
                <div style={{ height:'0.5px', background:C.border, marginBottom:8 }} />
                <div style={{ ...M({ fontSize:9, color:C.textLight, marginBottom:6 }) }}>EDIBLE OIL · {p.eo}</div>
                <div style={{ ...S({ fontSize:18, fontWeight:700, color:p.c, lineHeight:1 }) }}>{p.eop}<span style={{ fontSize:11, ...D({ fontWeight:400 }) }}>/mo</span></div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/trial" style={{ ...D({ fontSize:13, fontWeight:500, background:C.green, color:'#fff', padding:'10px 24px', borderRadius:7, display:'inline-block' }) }}>Try free for 24 hours →</a>
            <a href="/pricing" style={{ ...D({ fontSize:13, color:C.textMid, border:`0.5px solid ${C.borderMid}`, padding:'10px 24px', borderRadius:7, display:'inline-block' }) }}>Full pricing details</a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'100px 32px' }}>
        <div style={{ maxWidth:560, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ ...S(), fontSize:38, fontWeight:700, lineHeight:1.1, letterSpacing:'-1px', marginBottom:16, color:C.text }}>
            What is your plant<br />actually losing per month?
          </h2>
          <p style={{ ...D(), fontSize:16, color:C.textMid, lineHeight:1.7, marginBottom:44, fontWeight:300 }}>
            Tell us about your plant. We will show you where the gaps are — using your own numbers, against what your process should achieve. Onboarding takes 20 minutes.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/onboard/edible-oil')} style={{ ...D(), fontSize:14, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'12px 28px', borderRadius:8, cursor:'pointer' }}>Edible oil refinery →</button>
            <button onClick={() => router.push('/onboard/biodiesel')} style={{ ...D(), fontSize:14, color:C.textMid, background:'transparent', border:`0.5px solid ${C.borderMid}`, padding:'12px 28px', borderRadius:8, cursor:'pointer', transition:'all 0.15s' }} onMouseEnter={e=>{e.target.style.color=C.green;e.target.style.borderColor=C.green}} onMouseLeave={e=>{e.target.style.color=C.textMid;e.target.style.borderColor=C.borderMid}}>Biodiesel plant →</button>
            <a href='/pricing' style={{fontSize:13,color:'#A09285',marginTop:12,display:'block',textAlign:'center'}}>View full pricing →</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:'40px 32px 28px', borderTop:`0.5px solid ${C.border}`, background:C.bgAlt }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div className="two" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:48, marginBottom:32 }}>
            <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
              {/* E-Shakti logo - footer */}
              <img src="/logo-eshakti.jpg" alt="E-Shakti Binary Currents" style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', opacity:0.85, flexShrink:0, marginTop:4 }} />
              <div>
                <div style={{ ...S(), fontSize:17, fontWeight:700, letterSpacing:'-0.3px', marginBottom:4, color:C.text }}>Ken<span style={{ color:C.green }}>op</span> <span style={{ fontWeight:300, fontSize:14 }}>Intelligence</span></div>
                <p style={{ ...D(), fontSize:13, color:C.textLight, lineHeight:1.7, maxWidth:320, fontWeight:300, marginBottom:8 }}>Process intelligence for edible oil refineries, biodiesel plants, and the oleochemical industry.</p>
                <p style={{ ...M(), fontSize:10, color:C.textLight, letterSpacing:'0.06em' }}>Chikalthana MIDC, Aurangabad, Maharashtra</p>
              </div>
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