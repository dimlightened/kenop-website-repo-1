'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [activeIndustry, setActiveIndustry] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const industries = [
    {
      label: 'Biodiesel',
      status: 'live',
      icon: '⚗️',
      desc: 'Transesterification, glycerolysis, acid esterification, FAME quality, IS 15607:2022 compliance, OMC tender intelligence.',
      metrics: ['IS 15607 compliance', 'OMC tender guidance', 'Glycerol yield tracking', 'Methanol optimisation'],
    },
    {
      label: 'Edible oil refinery',
      status: 'live',
      icon: '🫙',
      desc: 'Neutralisation, bleaching, deodorisation, dewaxing, acid oil processing, separator efficiency, refining loss reduction.',
      metrics: ['Refining loss tracking', 'Soapstock value recovery', 'Separator efficiency', 'Bleaching optimisation'],
    },
    {
      label: 'Oleochemicals',
      status: 'live',
      icon: '🧪',
      desc: 'Fatty acid fractionation, splitting, hydrogenation, methyl ester production, glycerine refining, distillation monitoring.',
      metrics: ['Fatty acid yield', 'Distillation efficiency', 'Quality tracking', 'Byproduct monetisation'],
    },
    {
      label: 'Fatty acid plants',
      status: 'soon',
      icon: '🔬',
      desc: 'Fatty acid fractionation, C8–C18 separation, hydrogenation, distillation — process intelligence coming soon.',
      metrics: [],
    },
    {
      label: 'Dimer acid plants',
      status: 'soon',
      icon: '⚡',
      desc: 'Dimerisation, polymerisation, dimer acid quality, colour tracking — intelligence layer in development.',
      metrics: [],
    },
    {
      label: 'Amines & amides',
      status: 'soon',
      icon: '🧬',
      desc: 'Amidation, amination, fatty nitrogen derivatives, quality parameters — coming to the platform.',
      metrics: [],
    },
  ]

  const caseStudySteps = [
    {
      n: '01',
      title: 'Process mapping',
      desc: 'We capture your exact process route — which unit operations you run, in what sequence, with what feedstocks. Glycerolysis → acid esterification → transesterification → water wash → FAME. Every plant is different. We learn yours.',
    },
    {
      n: '02',
      title: 'Historical baseline',
      desc: 'Last 10 batch records onboarded. Feed FFA, methanol dose, catalyst dose, glycerol recovered, FAME yield, flash point, CFPP, IS 15607 pass or fail. The AI now knows what your plant's normal looks like.',
    },
    {
      n: '03',
      title: 'Live data connection',
      desc: 'Your lab technician saves the shift Excel file. A macro sends the data silently to Kenop. Or your operator sends "AV 1.2 MeOH 280 Yield 91" on WhatsApp. Data flows in without changing how anyone works.',
    },
    {
      n: '04',
      title: 'Intelligence delivered',
      desc: 'Every morning at 6am, a process summary lands. Every query your team asks — about yields, costs, IS 15607 limits, methanol ratios — gets answered with reference to your plant\'s actual numbers, not a textbook.',
    },
  ]

  const savings = [
    { label: 'Glycerol dose optimisation', value: '₹1.2L', sub: 'saved per month at 20 TPD', color: '#1D9E75' },
    { label: 'Methanol efficiency gain', value: '₹85K', sub: 'per month from ratio control', color: '#1D9E75' },
    { label: 'Batch rejection reduction', value: '₹35K', sub: 'fewer rejected batches per month', color: '#1D9E75' },
    { label: 'OMC tender compliance', value: '100%', sub: 'IS 15607:2022 parameter guidance', color: '#1D9E75' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0D12; color: #E2E8F0; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .d1 { animation-delay: 0.1s; opacity: 0; }
        .d2 { animation-delay: 0.2s; opacity: 0; }
        .d3 { animation-delay: 0.3s; opacity: 0; }
        .d4 { animation-delay: 0.4s; opacity: 0; }
        .industry-card:hover { border-color: rgba(29,158,117,0.3) !important; background: rgba(29,158,117,0.05) !important; }
        .nav-link:hover { color: #E2E8F0 !important; }
        .cta-btn:hover { background: #17875f !important; }
        .sec-btn:hover { border-color: rgba(29,158,117,0.5) !important; color: #1D9E75 !important; }
        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .savings-grid { grid-template-columns: 1fr 1fr !important; }
          .industries-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,13,18,0.95)' : 'transparent',
        borderBottom: scrolled ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '0.08em' }}>
            KEN<span style={{ color: '#1D9E75' }}>OP</span>
          </span>
          <span style={{ fontSize: 10, color: '#7D8590', fontFamily: "'JetBrains Mono', monospace", borderLeft: '0.5px solid rgba(255,255,255,0.1)', paddingLeft: 8, marginLeft: 4 }}>
            Intelligence
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['Platform', 'Industries', 'Case study'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="nav-link"
              style={{ fontSize: 13, color: '#7D8590', transition: 'color 0.15s' }}>{l}</a>
          ))}
          <button onClick={() => router.push('/login')} className="cta-btn"
            style={{ fontSize: 13, fontWeight: 500, background: '#1D9E75', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}>
            Sign in
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 32px 60px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>

        {/* Background grid */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(29,158,117,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(29,158,117,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="fade-up d1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(29,158,117,0.1)', border: '0.5px solid rgba(29,158,117,0.25)', borderRadius: 999, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', animation: 'pulse 2s ease infinite' }} />
            <span style={{ fontSize: 11, color: '#1D9E75', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>LIVE · BIODIESEL · EDIBLE OIL · OLEOCHEMICALS</span>
          </div>

          <h1 className="hero-title fade-up d2" style={{ fontFamily: "'Syne', sans-serif", fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1px', marginBottom: 24, maxWidth: 800 }}>
            Process intelligence<br />
            <span style={{ color: '#1D9E75' }}>for Indian chemical</span><br />
            industry
          </h1>

          <p className="fade-up d3" style={{ fontSize: 18, color: '#7D8590', lineHeight: 1.7, maxWidth: 560, marginBottom: 40, fontWeight: 300 }}>
            Kenop is a horizontal AI platform that monitors, analyses, and guides process plants — starting with biodiesel and edible oil, expanding across oleochemicals, fatty acids, and specialty chemicals.
          </p>

          <div className="fade-up d4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/onboard')} className="cta-btn"
              style={{ fontSize: 14, fontWeight: 500, background: '#1D9E75', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 9, cursor: 'pointer', transition: 'background 0.15s' }}>
              Onboard your plant →
            </button>
            <a href="#case-study" className="sec-btn"
              style={{ fontSize: 14, color: '#7D8590', border: '0.5px solid rgba(255,255,255,0.12)', padding: '12px 28px', borderRadius: 9, transition: 'all 0.15s', display: 'inline-block' }}>
              See what you get
            </a>
          </div>

          {/* Hero stats */}
          <div className="hero-grid fade-up d4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 0, marginTop: 80, paddingTop: 40, borderTop: '0.5px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
            {[
              { n: '3', l: 'Industries live' },
              { n: '10+', l: 'Process areas monitored' },
              { n: '₹2L+', l: 'Monthly saving at 20 TPD' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: 48, marginRight: 48, borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 700, color: '#E2E8F0' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: '#7D8590', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM */}
      <section id="platform" style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: '#1D9E75', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>WHAT WE DO</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
            A horizontal intelligence platform
          </h2>
          <p style={{ fontSize: 16, color: '#7D8590', maxWidth: 600, lineHeight: 1.7, fontWeight: 300 }}>
            We are not a vertical SaaS. We build AI intelligence layers for process plants across the oleochemical value chain — one industry at a time, with the same depth every time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { icon: '📡', title: 'Real-time monitoring', desc: 'Lab readings from Excel macros or WhatsApp flow into your dashboard every shift. No manual entry on the platform. No disruption to existing workflow.' },
            { icon: '🤖', title: 'AI that knows your plant', desc: 'Not a generic chatbot. An AI trained on your process domain, loaded with your plant\'s historical data, answering questions specific to your batch, your feedstock, your equipment.' },
            { icon: '📊', title: 'Financial intelligence', desc: 'Every reading is converted to a financial figure. Refining loss as rupees. Glycerol yield as monthly income. Methanol waste as cost per MT. Decisions become obvious.' },
            { icon: '📋', title: 'Automated reporting', desc: 'Morning process summary delivered before your first shift meeting. Anomaly alerts on WhatsApp. OMC tender compliance status on demand. Reports that write themselves.' },
            { icon: '🔗', title: 'Zero behaviour change', desc: 'Your operator saves Excel with Ctrl+S. Your lab tech sends a WhatsApp. Your data is already in Kenop. Nobody learns a new system. Nobody resists adoption.' },
            { icon: '📈', title: 'Horizontal expansion', desc: 'One platform, many industries. When you add a new process line — fatty acids, glycerine distillation, dimer acids — Kenop expands with you. No new vendor. No new contract.' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#111520', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '24px' }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#7D8590', lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industries" style={{ padding: '80px 32px', background: 'rgba(255,255,255,0.01)', borderTop: '0.5px solid rgba(255,255,255,0.04)', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#1D9E75', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>INDUSTRIES</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Where we operate</h2>
            <p style={{ fontSize: 16, color: '#7D8590', maxWidth: 560, lineHeight: 1.7, fontWeight: 300 }}>
              Three industries live today. Six more in the pipeline. Every addition brings the same depth — not a generic template, but a purpose-built intelligence layer for that specific process chemistry.
            </p>
          </div>

          <div className="industries-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {industries.map((ind, i) => (
              <div key={i} className="industry-card"
                onClick={() => setActiveIndustry(i)}
                style={{ background: activeIndustry === i ? 'rgba(29,158,117,0.08)' : '#111520', border: `0.5px solid ${activeIndustry === i ? 'rgba(29,158,117,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{ind.icon}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600 }}>{ind.label}</span>
                  </div>
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', fontWeight: 500,
                    background: ind.status === 'live' ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.06)',
                    color: ind.status === 'live' ? '#1D9E75' : '#7D8590' }}>
                    {ind.status === 'live' ? 'LIVE' : 'COMING SOON'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#7D8590', lineHeight: 1.6 }}>{ind.desc}</p>
                {ind.metrics.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                    {ind.metrics.map(m => (
                      <span key={m} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: 'rgba(29,158,117,0.08)', color: '#1D9E75', border: '0.5px solid rgba(29,158,117,0.15)' }}>{m}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <section id="case-study" style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: '#1D9E75', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>CASE STUDY · BIODIESEL</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
            What a biodiesel plant gets<br />after onboarding Kenop
          </h2>
          <p style={{ fontSize: 16, color: '#7D8590', maxWidth: 600, lineHeight: 1.7, fontWeight: 300 }}>
            A 20 TPD acid oil biodiesel plant. Existing process: glycerolysis → acid esterification → transesterification → water wash → FAME. Here is exactly what changes.
          </p>
        </div>

        {/* How onboarding works */}
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'hidden', marginBottom: 40 }}>
          {caseStudySteps.map((s, i) => (
            <div key={i} style={{ background: '#0A0D12', padding: '28px 24px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#1D9E75', marginBottom: 14, letterSpacing: '0.1em' }}>{s.n}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#7D8590', lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div style={{ background: '#111520', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 40 }}>
          {/* Mockup header */}
          <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#F85149','#E6A817','#1D9E75'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ fontSize: 11, color: '#7D8590', fontFamily: "'JetBrains Mono', monospace" }}>kenop.in/dashboard · Biodiesel plant · Morning shift</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', animation: 'pulse 2s ease infinite' }} />
              <span style={{ fontSize: 10, color: '#1D9E75', fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { label: 'FAME yield', value: '91.4', unit: '%', status: 'good' },
              { label: 'AV post-wash', value: '0.48', unit: 'mg KOH/g', status: 'good' },
              { label: 'Flash point', value: '162', unit: '°C', status: 'good' },
              { label: 'Methanol dose', value: '287', unit: 'kg/MT', status: 'warn' },
            ].map((k, i) => (
              <div key={i} style={{ padding: '20px 24px', borderRight: i < 3 ? '0.5px solid rgba(255,255,255,0.06)' : 'none', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 10, color: '#7D8590', marginBottom: 8, letterSpacing: '0.05em' }}>{k.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", color: k.status === 'good' ? '#1D9E75' : '#E6A817' }}>{k.value}</span>
                  <span style={{ fontSize: 11, color: '#7D8590', fontFamily: "'JetBrains Mono', monospace" }}>{k.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI chat sample */}
          <div style={{ padding: '20px 24px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, color: '#7D8590', marginBottom: 14, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>AI CHAT · Ask anything about your process</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: 'rgba(29,158,117,0.15)', border: '0.5px solid rgba(29,158,117,0.2)', borderRadius: 10, padding: '10px 14px', maxWidth: '60%', fontSize: 13, color: '#E2E8F0' }}>
                  My methanol dose is high today. Why?
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', maxWidth: '75%', fontSize: 13, color: '#C9D1D9', lineHeight: 1.6 }}>
                  Your feed AV this morning is <span style={{ color: '#E6A817', fontWeight: 500 }}>68.2 mg KOH/g</span> — up from yesterday's 61.4. Higher FFA content requires proportionally more methanol to maintain the 27:3 molar ratio in transesterification. Check your acid oil supplier — this batch may be from a different refinery. Dose at <span style={{ color: '#1D9E75', fontWeight: 500 }}>292 kg/MT</span> until AV stabilises below 65.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="savings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {savings.map((s, i) => (
            <div key={i} style={{ background: '#111520', border: '0.5px solid rgba(29,158,117,0.15)', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#E2E8F0', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#7D8590' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(29,158,117,0.06)', border: '0.5px solid rgba(29,158,117,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', marginBottom: 4 }}>Total monthly saving at 20 TPD: <span style={{ color: '#1D9E75' }}>₹2.3L/month</span></div>
            <div style={{ fontSize: 12, color: '#7D8590' }}>Pro plan cost: ₹22,000/month · Payback: under 3 days</div>
          </div>
          <button onClick={() => router.push('/onboard/biodiesel')}
            style={{ fontSize: 13, fontWeight: 500, background: '#1D9E75', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 8, cursor: 'pointer' }}>
            Onboard your biodiesel plant →
          </button>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 32px', background: 'rgba(29,158,117,0.04)', borderTop: '0.5px solid rgba(29,158,117,0.1)', borderBottom: '0.5px solid rgba(29,158,117,0.1)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
            Your plant is ready.<br />Is your data?
          </h2>
          <p style={{ fontSize: 16, color: '#7D8590', lineHeight: 1.7, marginBottom: 40, fontWeight: 300 }}>
            Onboarding takes 20 minutes. No hardware. No integration project. No IT department. Just your process knowledge, your last 10 batches, and a WhatsApp number.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/onboard')}
              style={{ fontSize: 14, fontWeight: 500, background: '#1D9E75', border: 'none', color: '#fff', padding: '13px 32px', borderRadius: 9, cursor: 'pointer' }}>
              Start onboarding →
            </button>
            <button onClick={() => router.push('/login')}
              style={{ fontSize: 14, color: '#7D8590', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', padding: '13px 32px', borderRadius: 9, cursor: 'pointer' }}>
              Sign in to dashboard
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px 32px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>
                KEN<span style={{ color: '#1D9E75' }}>OP</span>
              </div>
              <div style={{ fontSize: 12, color: '#7D8590', lineHeight: 1.7, maxWidth: 280, marginBottom: 16 }}>
                AI-powered process intelligence for the Indian chemical industry. Biodiesel · Edible oil · Oleochemicals · and beyond.
              </div>
              <div style={{ fontSize: 11, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>Chikalthana MIDC, Aurangabad</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#7D8590', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Platform</div>
              {['Dashboard', 'AI chat', 'Lab data entry', 'Morning reports', 'Onboarding'].map(l => (
                <div key={l} style={{ fontSize: 13, color: '#4A5568', marginBottom: 10 }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#7D8590', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Industries</div>
              {['Biodiesel plants', 'Edible oil refineries', 'Oleochemicals', 'Fatty acid plants', 'Dimer acid plants'].map(l => (
                <div key={l} style={{ fontSize: 13, color: '#4A5568', marginBottom: 10 }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#7D8590', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Company</div>
              {['About us', 'Contact', 'Privacy policy', 'Terms of service'].map(l => (
                <div key={l} style={{ fontSize: 13, color: '#4A5568', marginBottom: 10 }}>{l}</div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#4A5568' }}>
              © 2025 <span style={{ color: '#7D8590' }}>E-Shakti Binary Currents Private Limited</span>. All rights reserved.
            </div>
            <div style={{ fontSize: 11, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>
              Kenop Intelligence · kenop.in
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}