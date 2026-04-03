'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const C = {
  bg:'#F8F5EF', bgCard:'#FFFFFF', bgAlt:'#F0EDE5',
  text:'#1C1611', textMid:'#6B6056', textLight:'#A09285',
  green:'#1D9E75', greenLight:'#EAF6F1', greenBorder:'rgba(29,158,117,0.2)',
  amber:'#B45309', border:'rgba(28,22,17,0.09)', borderMid:'rgba(28,22,17,0.14)',
}
const S = x => ({ fontFamily:"'Fraunces',Georgia,serif", ...x })
const M = x => ({ fontFamily:"'JetBrains Mono',monospace", ...x })
const D = x => ({ fontFamily:"'DM Sans',sans-serif", ...x })

const BD_SCOPES = {
  trans:{ title:'Transesterification control', desc:'Methanol molar ratio, catalyst dose, soap formation, phase separation, glycerol settling — monitored against theoretical optimal.', find:'Methanol overconsumption and soap losses are the most common finding in every plant.' },
  glycerolysis:{ title:'Glycerolysis optimisation', desc:'Temperature, vacuum, residence time, glycerol dose relative to feed AV. Incorrect conditions result in incomplete FFA conversion and reduce FAME yield downstream.', find:'Plants with glycerolysis rarely have optimised conditions — set at commissioning and left.' },
  acid_est:{ title:'Acid esterification efficiency', desc:'H₂SO₄ dose, methanol ratio, target AV post-esterification. Over-acidulation wastes methanol. Under-acidulation carries FFA into the reactor.', find:'Acid dose is frequently over-specified. Both excess and deficit have measurable costs.' },
  enzyme:{ title:'Enzymatic conversion monitoring', desc:'Enzyme activity, substrate water content, conversion efficiency per batch. Enzyme cost is high — reuse decisions need data.', find:'Enzyme lifespan is rarely monitored. Activity drops are identified late.' },
  acid_wash:{ title:'Feedstock pretreatment quality', desc:'Acid oil washing endpoint, phospholipid content, moisture. Poor pretreatment increases soap and reduces catalyst efficiency downstream.', find:'Inconsistent pretreatment is a common source of unexplained yield variation.' },
  bleach_pre:{ title:'Bleaching earth dose & contact time', desc:'ABE dose per MT, temperature, contact time. Under-bleaching passes metals and colour bodies into the reactor.', find:'Dose is often fixed regardless of feedstock quality variation.' },
  plf:{ title:'Filter press / PLF performance', desc:'Filtration time, cake quality, oil retention in spent earth, pressure profile. Earth disposal carries trapped oil.', find:'Oil-in-cake loss is rarely measured. It is a direct yield loss.' },
  wet_wash:{ title:'Water wash efficiency', desc:'Wash water temperature, soft vs hard water, wash cycles, soap in wash water effluent.', find:'Hard wash water causes emulsions. Too few cycles leave residual soap.' },
  dry_wash:{ title:'Adsorbent / resin performance', desc:'Resin column saturation, lead-lag switchover timing, residual glycerol post-polishing.', find:'Resin is changed by time or volume — rarely by actual saturation.' },
  filter:{ title:'Filtration endpoint', desc:'Filter cake quality, FAME clarity. Premature changes waste media. Late changes cause flash point failures.', find:'Usually managed by visual inspection — inconsistent.' },
  meoh_rec:{ title:'Methanol recovery efficiency', desc:'Methanol purity after recovery, losses to glycerol phase, distillation column temperature profile.', find:'Impure recovered methanol causes variable reaction performance.' },
  gly_split:{ title:'Glycerol splitting yield', desc:'Acid dose for splitting, pH endpoint, FFA recovery in top phase, aqueous glycerol quality.', find:'Acid dose for splitting is frequently not optimised — same pattern as soapstock splitting.' },
  gly_purif:{ title:'Glycerol purification value', desc:'Glycerol purity, MONG content, moisture, colour — all determine sale price.', find:'Sale price is often accepted rather than negotiated based on actual composition.' },
  distill:{ title:'FAME distillation efficiency', desc:'Vacuum level, temperature profile, antioxidant dose, distillate yield vs bottoms.', find:'Distillate yield is rarely optimised. Incorrect vacuum leaves FAME in the bottoms.' },
  centrifuge:{ title:'Centrifuge / separator performance', desc:'Feed temperature, backpressure, throughput vs separation efficiency, phase carryover.', find:'Separator feed temperature is the most common single parameter that is off.' },
}

const EO_SCOPES = {
  neutral:{ title:'Neutralisation loss and caustic dose', desc:'Caustic dose relative to feed FFA, neutral oil FFA, soap in neutral oil, wash water conditions.', find:'Refining loss deviations are almost always traceable to caustic dose or separator feed temperature.' },
  sep:{ title:'Separator efficiency', desc:'Feed temperature, backpressure, soapstock fat content, neutral oil in soapstock.', find:'Separator temperature is the most commonly miscalibrated parameter. A 2°C deviation is measurable in refining loss.' },
  bleach:{ title:'Bleaching earth dose and conditions', desc:'ABE dose per MT, temperature, contact time, vacuum, colour and metals removal efficiency.', find:'Dose is set at commissioning and often not revisited when feedstock quality changes.' },
  plf_eo:{ title:'PLF / filter press oil retention', desc:'Oil in spent bleaching earth — a direct, often unmeasured refining loss component.', find:'Most plants do not measure oil-in-cake. It is a quiet, consistent loss every batch.' },
  deod:{ title:'Deodorisation conditions', desc:'Temperature, vacuum, stripping steam, residence time — all affect refined oil quality and DOD composition.', find:'Over-deodorisation destroys tocopherols. Under-deodorisation fails flavour spec.' },
  phys_ref:{ title:'Physical refining FFA stripping', desc:'Steam consumption, FFA distillate quality, temperature and vacuum profile.', find:'Steam consumption is rarely measured against yield. Over-stripping costs money without quality gain.' },
  degum:{ title:'Degumming efficiency', desc:'Phosphoric acid dose, gum removal, phospholipid content in degummed oil.', find:'Residual phospholipids carry into neutralisation — increasing caustic and earth consumption.' },
  dewax:{ title:'Dewaxing / winterisation', desc:'Crystallisation temperature, holding time, filtration — all affect yield and cloud point.', find:'Wax content varies seasonally. Fixed conditions lead to inconsistent results.' },
  soap_split:{ title:'Soapstock splitting acid dose', desc:'Sulphuric acid dose vs soapstock composition, pH endpoint, fatty acid recovery.', find:'Acid dose calculated at commissioning on average soapstock. When feed FFA varies, the split is incorrect.' },
  acid_oil:{ title:'Acid oil quality and value', desc:'FFA%, moisture, colour, unsaponifiables — all determine sale price and downstream value.', find:'Acid oil is sold at a flat rate in most plants. Composition determines actual value.' },
  fract:{ title:'Fractionation yield and quality', desc:'Olein/stearin yield, crystal size, filtration efficiency, olein cloud point.', find:'Olein yield is the primary financial variable — minor temperature deviations measurably shift the split.' },
  dod:{ title:'DOD tocopherol content and value', desc:'Tocopherol %, FFA in DOD, colour, moisture — all drive sale price.', find:'Deodoriser conditions directly affect tocopherol preservation. Most plants do not monitor DOD batch by batch.' },
}

function ProcessScope({ vertical }) {
  const scopes = vertical === 'bd' ? BD_SCOPES : EO_SCOPES
  const defaultSelected = vertical === 'bd' ? new Set(['trans']) : new Set(['neutral','bleach'])
  const [selected, setSelected] = useState(defaultSelected)

  const groups = vertical === 'bd' ? [
    { label:'Pretreatment', keys:['acid_wash','bleach_pre','plf'] },
    { label:'Esterification', keys:['glycerolysis','acid_est','enzyme'] },
    { label:'Transesterification & separation', keys:['trans','centrifuge','wet_wash','dry_wash','filter'] },
    { label:'Recovery & finishing', keys:['meoh_rec','gly_split','gly_purif','distill'] },
  ] : [
    { label:'Pretreatment', keys:['degum','dewax'] },
    { label:'Chemical refining', keys:['neutral','sep','bleach','plf_eo'] },
    { label:'Physical refining', keys:['deod','phys_ref'] },
    { label:'Byproduct & value recovery', keys:['soap_split','acid_oil','fract','dod'] },
  ]

  function toggle(key) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) { if (next.size > 1) next.delete(key) }
      else next.add(key)
      return next
    })
  }

  const items = Array.from(selected).map(k => scopes[k]).filter(Boolean)
  const total = Object.keys(scopes).length
  const pct = Math.round(items.length / total * 100)
  const tier = items.length <= 2 ? 'Basic' : items.length <= 5 ? 'Moderate' : items.length <= 9 ? 'Comprehensive' : 'Full spectrum'
  const tierColor = items.length <= 2 ? '#378ADD' : items.length <= 5 ? '#1D9E75' : items.length <= 9 ? '#B45309' : '#534AB7'

  return (
    <div>
      {/* Process unit selector */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
        {groups.map(g => (
          <div key={g.label} style={{ border:`0.5px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
            <div style={{ padding:'8px 14px', background:C.bgAlt, ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.1em' }) }}>{g.label.toUpperCase()}</div>
            <div style={{ padding:'10px 14px', display:'flex', flexWrap:'wrap', gap:7 }}>
              {g.keys.map(k => (
                <button key={k} onClick={() => toggle(k)} style={{ fontSize:12, padding:'5px 13px', borderRadius:999, border:`0.5px solid ${selected.has(k) ? C.greenBorder : C.border}`, background: selected.has(k) ? C.greenLight : C.bgCard, color: selected.has(k) ? '#085041' : C.textMid, cursor:'pointer', transition:'all 0.15s', ...D() }}>
                  {scopes[k]?.title.split(' ').slice(0,3).join(' ') || k}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
        {[[items.length,'Process areas monitored'],[tier,'Complexity level'],[pct+'%','Value surfaces covered']].map(([n,l]) => (
          <div key={l} style={{ background:C.bgAlt, borderRadius:8, padding:'12px 14px' }}>
            <div style={{ ...S({ fontSize:26, fontWeight:700, color:tierColor, lineHeight:1, letterSpacing:'-0.5px', marginBottom:4 }) }}>{n}</div>
            <div style={{ ...D({ fontSize:11, color:C.textMid }) }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:16 }}>
        <div style={{ ...M({ fontSize:9, color:C.textLight, letterSpacing:'0.12em', marginBottom:6 }) }}>SCOPE OF EXAMINATION AT YOUR PROCESS COMPLEXITY</div>
        <div style={{ height:5, borderRadius:3, background:C.bgAlt, overflow:'hidden', marginBottom:14 }}>
          <div style={{ height:'100%', width:`${pct}%`, background:tierColor, borderRadius:3, transition:'width 0.4s' }} />
        </div>
        <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
          {items.map((item,i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'12px 16px', borderBottom: i < items.length-1 ? `0.5px solid ${C.border}` : 'none' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, flexShrink:0, marginTop:6 }} />
              <div>
                <div style={{ ...D({ fontSize:13, fontWeight:500, color:C.text, marginBottom:3 }) }}>{item.title}</div>
                <div style={{ ...D({ fontSize:12, color:C.textMid, lineHeight:1.65, marginBottom:3, fontWeight:300 }) }}>{item.desc}</div>
                <div style={{ ...D({ fontSize:11, color:C.textLight, fontStyle:'italic', lineHeight:1.5 }) }}>What we typically find: {item.find}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Honest box */}
      <div style={{ background:C.greenLight, border:`0.5px solid ${C.greenBorder}`, borderRadius:10, padding:'16px 18px', marginBottom:12 }}>
        <p style={{ ...D({ fontSize:13, color:'#085041', lineHeight:1.75 }) }}>
          <strong>What this means for your plant:</strong>{' '}
          {items.length <= 2
            ? `Your process has ${items.length} monitored unit operation${items.length > 1 ? 's' : ''}. Even a simple plant has meaningful value in the areas shown — the question is whether these are currently being measured and optimised systematically, or managed by experience alone.`
            : items.length <= 6
            ? `With ${items.length} process areas selected, your plant has multiple surfaces where process discipline can recover value. Kenop examines all of them in parallel, every batch.`
            : `A ${tier.toLowerCase()} process of ${items.length} unit operations has correspondingly more surfaces where value can leak. Kenop monitors all of them. In our experience, plants at this complexity level typically have 3–5 areas where systematic monitoring changes the outcome.`}
        </p>
        <p style={{ ...D({ fontSize:13, color:'#085041', lineHeight:1.75, marginTop:10 }) }}>
          <strong>What Kenop does not do:</strong> We do not walk in with a savings guarantee. We walk in with a monitoring framework that tells you, from your own data, which of the areas above are performing below their potential and by how much. The numbers come from your plant — not from us.
        </p>
      </div>
      <p style={{ ...D({ fontSize:11, color:C.textLight, lineHeight:1.6, fontStyle:'italic' }) }}>
        Kenop does not guarantee specific savings figures. Process complexity determines the number of areas where value can be recovered — actual amounts depend on your current practice, feedstock variability, and baseline performance. We identify the gaps; the plant decides which to act on.
      </p>
    </div>
  )
}

export default function PricingPage() {
  const router = useRouter()
  const [vertical, setVertical] = useState('bd')
  const [extraUsers, setExtraUsers] = useState(0)
  const [tpd, setTpd] = useState(25)

  const plans = {
    bd: [
      { n:'Starter', tpd:'≤ 20 TPD', p:11000, c:'#378ADD', cb:'#E6F1FB', u:1, wk:750, mo:2500, boost:0, pop:false },
      { n:'Pro', tpd:'21–50 TPD', p:22000, c:'#1D9E75', cb:'#EAF6F1', u:2, wk:1500, mo:6000, boost:100, pop:true },
      { n:'Growth', tpd:'51–100 TPD', p:45000, c:'#B45309', cb:'#FEF8EE', u:5, wk:7500, mo:30000, boost:500, pop:false },
      { n:'Enterprise', tpd:'100+ TPD', p:100000, c:'#534AB7', cb:'#EEEDFE', u:10, wk:30000, mo:null, boost:null, pop:false },
    ],
    eo: [
      { n:'Starter', tpd:'≤ 30 TPD', p:31000, c:'#378ADD', cb:'#E6F1FB', u:1, wk:750, mo:2500, boost:0, pop:false },
      { n:'Pro', tpd:'31–80 TPD', p:52000, c:'#1D9E75', cb:'#EAF6F1', u:2, wk:1500, mo:6000, boost:100, pop:true },
      { n:'Growth', tpd:'81–200 TPD', p:90000, c:'#B45309', cb:'#FEF8EE', u:5, wk:7500, mo:30000, boost:500, pop:false },
      { n:'Enterprise', tpd:'200+ TPD', p:150000, c:'#534AB7', cb:'#EEEDFE', u:10, wk:30000, mo:null, boost:null, pop:false },
    ],
  }

  const currentPlans = plans[vertical]
  const userRate = vertical === 'eo' ? 3000 : 2000
  const tpdBands = vertical === 'eo' ? [30,80,200] : [20,50,100]
  const tierIdx = tpd <= tpdBands[0] ? 0 : tpd <= tpdBands[1] ? 1 : tpd <= tpdBands[2] ? 2 : 3
  const rec = currentPlans[tierIdx]
  const monthly = rec.p + extraUsers * userRate
  const annual = Math.round(monthly * 12 * 0.85)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:ital,wght@0,300;0,400;0,500&family=JetBrains+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F8F5EF; color: #1C1611; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: rgba(28,22,17,0.15); }
        @media(max-width:768px){ .two{grid-template-columns:1fr!important} .four{grid-template-columns:1fr 1fr!important} }
      `}</style>

      {/* Nav */}
      <nav style={{ padding:'0 32px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`0.5px solid ${C.border}`, background:C.bgCard }}>
        <div onClick={() => router.push('/')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <span style={{ ...S({ fontSize:17, fontWeight:700, letterSpacing:'-0.3px', color:C.text }) }}>Ken<span style={{ color:C.green }}>op</span></span>
          <span style={{ ...M({ fontSize:9, color:C.textLight, letterSpacing:'0.1em' }) }}>INTELLIGENCE</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          {[['Home','/'],['Case studies','/#cases'],['Why Kenop','/#moat'],['Trial','/trial']].map(([l,h]) => (
            <a key={l} href={h} style={{ ...D({ fontSize:13, color:C.textMid }) }} onMouseEnter={e=>e.target.style.color=C.text} onMouseLeave={e=>e.target.style.color=C.textMid}>{l}</a>
          ))}
          <button onClick={() => router.push('/start')} style={{ ...D({ fontSize:12, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'6px 16px', borderRadius:6, cursor:'pointer' }) }}>Onboard →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'64px 32px 48px', textAlign:'center', borderBottom:`0.5px solid ${C.border}` }}>
        <p style={{ ...M({ fontSize:10, color:C.green, letterSpacing:'0.18em', marginBottom:14 }) }}>PRICING</p>
        <h1 style={{ ...S({ fontSize:46, fontWeight:700, lineHeight:1.08, letterSpacing:'-1.5px', marginBottom:16, color:C.text }) }}>
          Priced on your plant capacity.<br />Justified by what we find.
        </h1>
        <p style={{ ...D({ fontSize:16, color:C.textMid, maxWidth:500, margin:'0 auto 28px', lineHeight:1.7, fontWeight:300 }) }}>
          Select your process units below to see the scope of what Kenop examines. Then choose the plan that fits your capacity.
        </p>
        {/* Vertical toggle */}
        <div style={{ display:'inline-flex', background:C.bgAlt, borderRadius:10, padding:3, gap:2 }}>
          {[['bd','Biodiesel plant'],['eo','Edible oil refinery']].map(([v,l]) => (
            <button key={v} onClick={() => setVertical(v)} style={{ ...D({ fontSize:13, fontWeight:500, padding:'8px 22px', borderRadius:8, border:`0.5px solid ${vertical===v ? C.border : 'transparent'}`, background: vertical===v ? C.bgCard : 'transparent', color: vertical===v ? C.text : C.textLight, cursor:'pointer', transition:'all 0.15s' }) }}>{l}</button>
          ))}
        </div>
      </section>

      {/* Process Complexity Tool */}
      <section style={{ padding:'56px 32px', borderBottom:`0.5px solid ${C.border}`, background:C.bgAlt }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:6 }) }}>STEP 1 — SELECT YOUR PROCESS</p>
          <h2 style={{ ...S({ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', marginBottom:24, color:C.text }) }}>
            Select your process units — we show the scope of what Kenop can examine
          </h2>
          <ProcessScope key={vertical} vertical={vertical} />
        </div>
      </section>

      {/* Pricing plans */}
      <section style={{ padding:'56px 32px', borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.18em', marginBottom:6 }) }}>STEP 2 — CHOOSE YOUR PLAN</p>
          <h2 style={{ ...S({ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', marginBottom:24, color:C.text }) }}>
            {vertical === 'eo' ? 'Edible oil refinery pricing' : 'Biodiesel plant pricing'}
          </h2>
          <div className="four" style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:12, marginBottom:28 }}>
            {currentPlans.map(plan => (
              <div key={plan.n} style={{ background:C.bgCard, border:`0.5px solid ${plan.pop ? C.green : C.border}`, borderWidth: plan.pop ? 2 : '0.5px', borderRadius:12, padding:18, position:'relative' }}>
                {plan.pop && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:C.green, color:'#fff', fontSize:9, padding:'2px 10px', borderRadius:999, whiteSpace:'nowrap', ...M() }}>Most plants</div>}
                <div style={{ ...D({ fontSize:13, fontWeight:500, color:C.text, marginBottom:2 }) }}>{plan.n}</div>
                <div style={{ ...M({ fontSize:10, color:C.textLight, marginBottom:12 }) }}>{plan.tpd}</div>
                <div style={{ ...S({ fontSize:20, fontWeight:700, color:plan.c, lineHeight:1, marginBottom:1 }) }}>
                  ₹{plan.p.toLocaleString('en-IN')}<span style={{ fontSize:12, fontWeight:400, ...D() }}>/mo</span>
                </div>
                <div style={{ ...D({ fontSize:10, color:C.textLight, marginBottom:12 }) }}>₹{(plan.p*12*0.85/100000).toFixed(1)}L/yr annual</div>
                {[
                  ['Users included', plan.u],
                  ['AI queries / week', plan.wk.toLocaleString()],
                  ['Monthly cap', plan.mo ? plan.mo.toLocaleString() : 'Unlimited'],
                  ['Priority queries / mo', plan.boost === null ? 'Unlimited' : plan.boost === 0 ? '—' : plan.boost],
                  ['Morning reports', 'Daily'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:11, padding:'4px 0', borderBottom:`0.5px solid ${C.border}` }}>
                    <span style={{ ...D({ color:C.textMid }) }}>{k}</span>
                    <span style={{ ...D({ fontWeight:500, color:C.text }) }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, ...D({ fontSize:10, color:C.textLight }) }}>+ ₹{userRate.toLocaleString()}/extra user/mo</div>
                <button onClick={() => router.push('/start')} style={{ width:'100%', marginTop:12, padding:'8px 0', background: plan.pop ? C.green : 'transparent', border:`0.5px solid ${plan.pop ? C.green : C.borderMid}`, borderRadius:7, fontSize:12, fontWeight:500, color: plan.pop ? '#fff' : C.textMid, cursor:'pointer', ...D() }}>
                  {plan.n === 'Enterprise' ? 'Talk to us' : 'Get started →'}
                </button>
              </div>
            ))}
          </div>

          {/* Plan builder */}
          <div style={{ background:C.bgAlt, borderRadius:12, padding:'20px 24px' }}>
            <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.12em', marginBottom:16 }) }}>PLAN BUILDER</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }} className="two">
              <div>
                {[
                  { label:`Capacity (TPD)`, id:'tpd', min:5, max: vertical==='eo' ? 300 : 200, val:tpd, set:setTpd, display:`${tpd} TPD` },
                  { label:'Additional users', id:'users', min:0, max:10, val:extraUsers, set:setExtraUsers, display:`${extraUsers} extra` },
                ].map(s => (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <label style={{ ...D({ fontSize:12, color:C.textMid, minWidth:160 }) }}>{s.label}</label>
                    <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(Number(e.target.value))} style={{ flex:1, accentColor:C.green }} />
                    <span style={{ ...D({ fontSize:13, fontWeight:500, minWidth:80, textAlign:'right', color:C.text }) }}>{s.display}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-start' }}>
                {[
                  ['Plan', rec.n, rec.c],
                  ['Monthly', `₹${monthly.toLocaleString('en-IN')}`, rec.c],
                  ['Annual (15% off)', `₹${annual.toLocaleString('en-IN')}`, C.green],
                  ['You save', `₹${(monthly*12-annual).toLocaleString('en-IN')}`, C.green],
                ].map(([l,v,col]) => (
                  <div key={l}>
                    <div style={{ ...D({ fontSize:10, color:C.textLight, marginBottom:3 }) }}>{l}</div>
                    <div style={{ ...S({ fontSize:20, fontWeight:700, color:col, lineHeight:1 }) }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honest note */}
      <section style={{ padding:'48px 32px', borderBottom:`0.5px solid ${C.border}`, background:C.bgAlt }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <h3 style={{ ...S({ fontSize:24, fontWeight:600, letterSpacing:'-0.3px', marginBottom:14, color:C.text }) }}>What we commit to. What we do not.</h3>
          <p style={{ ...D({ fontSize:14, color:C.textMid, lineHeight:1.8, marginBottom:14, fontWeight:300 }) }}>
            We commit to monitoring your process continuously, surfacing deviations against your own benchmarks, and delivering actionable intelligence before every shift. We do not commit to specific rupee savings — those come from your plant's data, not our estimates.
          </p>
          <p style={{ ...D({ fontSize:14, color:C.textMid, lineHeight:1.8, fontWeight:300 }) }}>
            Every plan includes a 30-day onboarding period where we capture your process, load your batch history, and configure your benchmarks. If after 30 days Kenop has not found a single area worth examining, you pay nothing for that month.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding:'28px 32px', borderTop:`0.5px solid ${C.border}` }}>
        <div style={{ maxWidth:1060, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <p style={{ ...D({ fontSize:11, color:C.textLight }) }}>© 2025 E-Shakti Binary Currents Private Limited</p>
          <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.1em' }) }}>kenop.in</p>
        </div>
      </footer>
    </>
  )
}