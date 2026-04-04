'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const C = {
  bg:'#F8F5EF', bgCard:'#FFFFFF', bgAlt:'#F0EDE5',
  text:'#1C1611', textMid:'#6B6056', textLight:'#A09285',
  green:'#1D9E75', greenLight:'#EAF6F1', greenBorder:'rgba(29,158,117,0.2)',
  amber:'#B45309', border:'rgba(28,22,17,0.09)', borderMid:'rgba(28,22,17,0.14)',
}
const S = (x={}) => ({ fontFamily:"'Fraunces',Georgia,serif", ...x })
const M = (x={}) => ({ fontFamily:"'JetBrains Mono',monospace", ...x })
const D = (x={}) => ({ fontFamily:"'DM Sans',sans-serif", ...x })

const Field = ({ label, id, type='text', value, onChange, placeholder, required }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ ...D({ fontSize:12, color:C.textMid, display:'block', marginBottom:5 }) }}>{label}{required && ' *'}</label>
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      style={{ width:'100%', padding:'10px 14px', border:`0.5px solid ${C.borderMid}`, borderRadius:8, fontSize:14, ...D(), background:C.bgCard, color:C.text, outline:'none' }}
      onFocus={e => e.target.style.borderColor = C.green}
      onBlur={e => e.target.style.borderColor = C.borderMid} />
  </div>
)

export default function TrialPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name:'', email:'', phone:'', company:'', vertical:'bd', capacity:25 })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const planPrice = form.vertical === 'eo' ? '52,000' : '22,000'
  const planLabel = form.vertical === 'eo' ? 'Edible oil Pro' : 'Biodiesel Pro'

  async function handleDetailsSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) { setError('Please fill all required fields'); return }
    setError(''); setStep(2)
  }

  async function handleRazorpay() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/trial/create-mandate', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)
      })
      const { orderId, key, customerId } = await res.json()
      const options = {
        key, order_id: orderId, customer_id: customerId,
        name:'Kenop Intelligence', description:'24-hour Pro trial — \u20b90 today',
        prefill:{ name:form.name, email:form.email, contact:form.phone },
        theme:{ color:'#1D9E75' }, recurring:1,
        handler: async (response) => {
          await fetch('/api/trial/activate', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ ...form, ...response, customerId })
          })
          setStep(3)
        }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch(err) { setError('Payment setup failed. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#F8F5EF; color:#1C1611; font-family:'DM Sans',sans-serif; -webkit-font-smoothing:antialiased; }
        input:focus { outline:none; }
      `}</style>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <nav style={{ padding:'0 32px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`0.5px solid ${C.border}`, background:C.bgCard }}>
        <div onClick={() => router.push('/')} style={{ cursor:'pointer', ...S({ fontSize:17, fontWeight:700, color:C.text }) }}>
          Ken<span style={{ color:C.green }}>op</span>
        </div>
        <span style={{ ...M({ fontSize:10, color:C.textLight }) }}>72-HOUR FREE TRIAL</span>
      </nav>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'48px 24px' }}>
        <div style={{ display:'flex', gap:8, marginBottom:36 }}>
          {['Your details','Billing','Access active'].map((s,i) => (
            <div key={i} style={{ flex:1, textAlign:'center' }}>
              <div style={{ height:3, borderRadius:2, background: step > i || step === i+1 ? C.green : C.bgAlt, marginBottom:6, opacity: step < i+1 ? 0.3 : 1 }} />
              <div style={{ ...M({ fontSize:9, color: step === i+1 ? C.green : C.textLight, letterSpacing:'0.08em' }) }}>{s.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleDetailsSubmit}>
            <h1 style={{ ...S({ fontSize:30, fontWeight:700, lineHeight:1.1, letterSpacing:'-0.5px', marginBottom:8, color:C.text }) }}>
              Try Kenop free<br />for 72 hours
            </h1>
            <p style={{ ...D({ fontSize:14, color:C.textMid, lineHeight:1.7, marginBottom:28, fontWeight:300 }) }}>
              Full Pro access. We capture billing details but charge nothing today. After 72 hours, continue or cancel — your call.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:0 }}>
              <Field label="Your name" id="name" value={form.name} onChange={set('name')} placeholder="Your name" required />
              <Field label="Company / plant name" id="company" value={form.company} onChange={set('company')} placeholder="Plant name" />
            </div>
            <Field label="Email" id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@yourplant.com" required />
            <Field label="WhatsApp number" id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" required />
            <div style={{ marginBottom:16 }}>
              <label style={{ ...D({ fontSize:12, color:C.textMid, display:'block', marginBottom:5 }) }}>Your plant *</label>
              <div style={{ display:'flex', gap:8 }}>
                {[['bd','Biodiesel plant'],['eo','Edible oil refinery']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => setForm(f=>({...f,vertical:v}))}
                    style={{ flex:1, padding:'10px', border:`0.5px solid ${form.vertical===v ? C.green : C.borderMid}`, borderRadius:8, background: form.vertical===v ? C.greenLight : C.bgCard, color: form.vertical===v ? '#085041' : C.textMid, fontSize:13, cursor:'pointer', ...D() }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ ...D({ fontSize:12, color:C.textMid, display:'block', marginBottom:5 }) }}>Plant capacity (TPD) *</label>
              <input type="number" min="5" max="500" value={form.capacity} onChange={set('capacity')}
                style={{ width:'100%', padding:'10px 14px', border:`0.5px solid ${C.borderMid}`, borderRadius:8, fontSize:14, ...D(), background:C.bgCard, color:C.text }} />
            </div>
            {error && <p style={{ ...D({ fontSize:12, color:'#E24B4A', marginBottom:12 }) }}>{error}</p>}
            <button type="submit" style={{ width:'100%', padding:'13px', background:C.green, border:'none', borderRadius:8, fontSize:14, fontWeight:500, color:'#fff', cursor:'pointer', ...D() }}>
              Continue to billing details \u2192
            </button>
            <p style={{ ...D({ fontSize:11, color:C.textLight, textAlign:'center', marginTop:10 }) }}>No charge today. Cancel anytime within 72 hours.</p>
          </form>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ ...S({ fontSize:28, fontWeight:700, lineHeight:1.1, letterSpacing:'-0.5px', marginBottom:8, color:C.text }) }}>Billing details</h1>
            <p style={{ ...D({ fontSize:14, color:C.textMid, lineHeight:1.7, marginBottom:24, fontWeight:300 }) }}>
              We hold your payment method on file. Nothing is charged today. After 72 hours, you choose to continue or cancel.
            </p>
            <div style={{ background:C.greenLight, border:`0.5px solid ${C.greenBorder}`, borderRadius:10, padding:'16px 18px', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ ...D({ fontSize:13, fontWeight:500, color:'#085041' }) }}>{planLabel} \u2014 24-hour trial</span>
                <span style={{ ...M({ fontSize:13, color:C.green }) }}>\u20b90 today</span>
              </div>
              <div style={{ ...D({ fontSize:11, color:'#085041', lineHeight:1.6 }) }}>
                After 72 hours: \u20b9{planPrice}/month if you continue. Cancel before then \u2014 zero charge.
              </div>
              <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:6 }}>
                {['1,500 AI queries/week','2 users','Priority intelligence','Daily morning report','WhatsApp alerts'].map(f => (
                  <span key={f} style={{ ...M({ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(29,158,117,0.12)', color:'#085041' }) }}>{f}</span>
                ))}
              </div>
            </div>
            <div style={{ background:'#FEF8EE', border:'0.5px solid rgba(180,83,9,0.2)', borderRadius:10, padding:'14px 16px', marginBottom:24 }}>
              <p style={{ ...D({ fontSize:12, color:C.amber, lineHeight:1.65 }) }}>
                Your card is authorised but <strong>not charged</strong> today. First charge of \u20b9{planPrice} only occurs if you confirm after 72 hours. Cancel by replying STOP to WhatsApp.
              </p>
            </div>
            {error && <p style={{ ...D({ fontSize:12, color:'#E24B4A', marginBottom:12 }) }}>{error}</p>}
            <button onClick={handleRazorpay} disabled={loading}
              style={{ width:'100%', padding:'13px', background:C.green, border:'none', borderRadius:8, fontSize:14, fontWeight:500, color:'#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, ...D() }}>
              {loading ? 'Setting up...' : 'Add billing details \u2014 \u20b90 charged today \u2192'}
            </button>
            <button onClick={() => setStep(1)} style={{ width:'100%', padding:'10px', background:'transparent', border:'none', fontSize:12, color:C.textLight, cursor:'pointer', marginTop:8, ...D() }}>
              \u2190 Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:C.greenLight, border:`2px solid ${C.green}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:28 }}>&#10003;</div>
            <h1 style={{ ...S({ fontSize:30, fontWeight:700, lineHeight:1.1, letterSpacing:'-0.5px', marginBottom:12, color:C.text }) }}>Your trial is live.</h1>
            <p style={{ ...D({ fontSize:15, color:C.textMid, lineHeight:1.7, marginBottom:8, fontWeight:300 }) }}>
              72 hours of full Pro access. Your first morning report arrives before 6am tomorrow on WhatsApp.
            </p>
            <p style={{ ...D({ fontSize:13, color:C.textLight, lineHeight:1.6, marginBottom:32, fontWeight:300 }) }}>
              Complete onboarding now \u2014 it takes 20 minutes and is how Kenop learns your plant.
            </p>
            <button onClick={() => router.push('/onboard')}
              style={{ width:'100%', padding:'13px', background:C.green, border:'none', borderRadius:8, fontSize:14, fontWeight:500, color:'#fff', cursor:'pointer', marginBottom:10, ...D() }}>
              Start onboarding your plant \u2192
            </button>
            <button onClick={() => router.push('/dashboard')}
              style={{ width:'100%', padding:'11px', background:'transparent', border:`0.5px solid ${C.borderMid}`, borderRadius:8, fontSize:13, color:C.textMid, cursor:'pointer', ...D() }}>
              Go to dashboard
            </button>
          </div>
        )}
      </div>
    </>
  )
}
