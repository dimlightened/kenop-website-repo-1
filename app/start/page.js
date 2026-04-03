'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const C = {
  bg:'#F8F5EF', bgCard:'#FFFFFF', bgAlt:'#F0EDE5',
  text:'#1C1611', textMid:'#6B6056', textLight:'#A09285',
  green:'#1D9E75', greenLight:'#EAF6F1', greenBorder:'rgba(29,158,117,0.2)',
  amber:'#B45309', border:'rgba(28,22,17,0.09)', borderMid:'rgba(28,22,17,0.14)',
}
const S = (x={}) => ({ fontFamily:"'Fraunces',Georgia,serif", ...x })
const M = (x={}) => ({ fontFamily:"'JetBrains Mono',monospace", ...x })
const D = (x={}) => ({ fontFamily:"'DM Sans',sans-serif", ...x })

function StartForm() {
  const router = useRouter()
  const params = useSearchParams()
  const vertical = params.get('v') || 'eo'
  const [form, setForm] = useState({ name:'', email:'', phone:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const label = vertical === 'eo' ? 'Edible oil refinery' : 'Biodiesel plant'
  const dest  = vertical === 'eo' ? '/onboard/edible-oil' : '/onboard/biodiesel'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) { setError('Please fill all fields'); return }
    setLoading(true)
    try {
      await fetch('/api/leads', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, vertical, source:'onboard_cta' })
      })
    } catch(err) {}
    router.push(dest)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#F8F5EF; color:#1C1611; font-family:'DM Sans',sans-serif; -webkit-font-smoothing:antialiased; }
        input:focus { outline:none; border-color:#1D9E75 !important; }
      `}</style>

      <nav style={{ padding:'0 32px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`0.5px solid ${C.border}`, background:C.bgCard }}>
        <div onClick={() => router.push('/')} style={{ cursor:'pointer', ...S({ fontSize:17, fontWeight:700, color:C.text }) }}>
          Ken<span style={{ color:C.green }}>op</span>
          <span style={{ ...M({ fontSize:9, color:C.textLight, marginLeft:10, letterSpacing:'0.1em' }) }}>INTELLIGENCE</span>
        </div>
        <a href="/" style={{ ...D({ fontSize:13, color:C.textMid }) }}>\u2190 Back to home</a>
      </nav>

      <div style={{ minHeight:'calc(100vh - 52px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ width:'100%', maxWidth:440 }}>
          <div style={{ background:C.greenLight, border:`0.5px solid ${C.greenBorder}`, borderRadius:10, padding:'10px 16px', marginBottom:28, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:C.green, flexShrink:0 }} />
            <span style={{ ...M({ fontSize:10, color:C.green, letterSpacing:'0.1em' }) }}>{label.toUpperCase()}</span>
          </div>

          <h1 style={{ ...S({ fontSize:32, fontWeight:700, lineHeight:1.1, letterSpacing:'-0.5px', marginBottom:10, color:C.text }) }}>
            Before we begin
          </h1>
          <p style={{ ...D({ fontSize:14, color:C.textMid, lineHeight:1.7, marginBottom:28, fontWeight:300 }) }}>
            Tell us who you are. Onboarding takes 20 minutes. We will send your first intelligence report to your WhatsApp before tomorrow morning.
          </p>

          <form onSubmit={handleSubmit}>
            {[
              { label:'Your name', key:'name', type:'text', placeholder:'Nachiket Muley' },
              { label:'Email address', key:'email', type:'email', placeholder:'you@yourplant.com' },
              { label:'WhatsApp number', key:'phone', type:'tel', placeholder:'9876543210' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom:16 }}>
                <label style={{ ...D({ fontSize:12, color:C.textMid, display:'block', marginBottom:5 }) }}>{label} *</label>
                <input
                  type={type} value={form[key]} onChange={set(key)}
                  placeholder={placeholder} required
                  style={{ width:'100%', padding:'11px 14px', border:`0.5px solid ${C.borderMid}`, borderRadius:8, fontSize:14, ...D(), background:C.bgCard, color:C.text, transition:'border-color 0.15s' }}
                />
              </div>
            ))}

            {error && <p style={{ ...D({ fontSize:12, color:'#E24B4A', marginBottom:12 }) }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', background: loading ? '#A09285' : C.green, border:'none', borderRadius:8, fontSize:14, fontWeight:500, color:'#fff', cursor: loading ? 'not-allowed' : 'pointer', ...D(), marginTop:4 }}>
              {loading ? 'One moment...' : `Start ${label} onboarding \u2192`}
            </button>

            <p style={{ ...D({ fontSize:11, color:C.textLight, textAlign:'center', marginTop:12, lineHeight:1.6 }) }}>
              Your details are used only to personalise your Kenop intelligence. We do not share them.
            </p>
          </form>

          <div style={{ marginTop:28, paddingTop:20, borderTop:`0.5px solid ${C.border}` }}>
            <p style={{ ...M({ fontSize:9, color:C.textLight, letterSpacing:'0.12em', marginBottom:10 }) }}>WHAT HAPPENS NEXT</p>
            {[
              ['20 min', 'Onboarding — your process, feedstocks, last 10 batches'],
              ['Tonight', 'Kenop processes your plant data'],
              ['6am', 'First morning intelligence report on WhatsApp'],
            ].map(([t,d]) => (
              <div key={t} style={{ display:'flex', gap:14, marginBottom:10 }}>
                <span style={{ ...M({ fontSize:10, color:C.green, minWidth:48, paddingTop:1 }) }}>{t}</span>
                <span style={{ ...D({ fontSize:12, color:C.textMid, lineHeight:1.5 }) }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function StartPage() {
  return (
    <Suspense>
      <StartForm />
    </Suspense>
  )
}
