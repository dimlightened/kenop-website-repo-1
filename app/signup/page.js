'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const G = '#1D9E75'
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [vertical, setVertical] = useState('')
  const [form, setForm] = useState({gstin:'',name:'',email:'',password:'',mobile:''})
  const [co, setCo] = useState(null)
  const [gstinLoading, setGstinLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    const g = form.gstin.toUpperCase().trim()
    clearTimeout(timer.current)
    setCo(null)
    if (g.length !== 15 || !GSTIN_RE.test(g)) return
    setGstinLoading(true)
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/gstin?gstin=' + g)
        const d = await r.json()
        if (d.valid) setCo(d)
      } catch {} finally { setGstinLoading(false) }
    }, 700)
  }, [form.gstin])

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    try {
      const { data, error } = await sb.auth.signUp({
        email: form.email.trim(), password: form.password,
        options: { data: { name: form.name, mobile: form.mobile }, emailRedirectTo: window.location.origin + '/auth/callback' }
      })
      if (error) throw error
      if (data.user) {
        await fetch('/api/leads', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ email: form.email.trim(), mobile: form.mobile, gstin: form.gstin.toUpperCase(), name: form.name, companyName: co?.legalName||'', pincode: co?.pincode||'', state: co?.state||'', vertical, authUserId: data.user.id, status: 'trial', trial_days: 3 })
        })
      }
      setStep(3)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const inp = {width:'100%',padding:'12px 16px',fontSize:14,border:'0.5px solid rgba(28,22,17,0.12)',borderRadius:10,background:'#F8F5EF',color:'#1C1611',boxSizing:'border-box',outline:'none',fontFamily:'inherit',marginBottom:14,display:'block'}
  const btn = (off) => ({width:'100%',padding:'13px',background:off?'#A8D5C4':G,color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'inherit',cursor:off?'not-allowed':'pointer'})
  const lbl = {fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#A09285',letterSpacing:'0.12em',display:'block',marginBottom:5}
  const page = {minHeight:'100vh',background:'#F8F5EF',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'DM Sans',system-ui,sans-serif"}
  const card = {background:'#fff',border:'0.5px solid rgba(28,22,17,0.09)',borderRadius:16,padding:'36px 32px'}
  const Logo = () => <div style={{textAlign:'center',marginBottom:32}}><span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:26,fontWeight:700,color:'#1C1611'}}>Ken<span style={{color:G}}>op</span></span></div>

  if (step === 1) return (
    <div style={page}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" />
      <div style={{width:'100%',maxWidth:500}}>
        <Logo />
        <div style={card}>
          <div style={{background:'rgba(29,158,117,0.06)',border:'0.5px solid rgba(29,158,117,0.2)',borderRadius:10,padding:'12px 16px',marginBottom:24,fontSize:13,color:'#0F6E56',display:'flex',alignItems:'center',gap:10}}>
            <strong>3 days free</strong> — Full access. No credit card needed.
          </div>
          <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',marginBottom:6}}>What type of plant do you operate?</h2>
          <p style={{fontSize:14,color:'#A09285',marginBottom:24,fontWeight:300}}>We will tailor Kenop Intelligence to your process.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
            {[
              ['edible_oil','Edible Oil Refinery','Neutralisation, Bleaching, Deodourisation, Specialty fractions'],
              ['biodiesel','Biodiesel Plant','Transesterification, Glycerine recovery, Methanol recovery']
            ].map(([v,title,desc]) => (
              <button key={v} onClick={()=>{setVertical(v);setStep(2)}}
                style={{padding:'20px 16px',background:'#F8F5EF',border:'0.5px solid rgba(28,22,17,0.1)',borderRadius:12,cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
                <div style={{fontSize:15,fontWeight:500,color:'#1C1611',marginBottom:8}}>{title}</div>
                <div style={{fontSize:12,color:'#A09285',lineHeight:1.5}}>{desc}</div>
              </button>
            ))}
          </div>
          <p style={{textAlign:'center',fontSize:13,color:'#A09285',fontWeight:300}}>Already have an account? <Link href="/login" style={{color:G,textDecoration:'none',fontWeight:500}}>Sign in</Link></p>
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )

  if (step === 2) return (
    <div style={page}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" />
      <div style={{width:'100%',maxWidth:440}}>
        <Logo />
        <div style={card}>
          <button onClick={()=>setStep(1)} style={{background:'none',border:'none',color:'#A09285',cursor:'pointer',fontSize:13,padding:0,marginBottom:20,fontFamily:'inherit'}}>Back</button>
          <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',marginBottom:6}}>Create your account</h2>
          <p style={{fontSize:14,color:'#A09285',marginBottom:24,fontWeight:300}}>3-day free trial. No credit card. Cancel anytime.</p>
          <form onSubmit={submit}>
            <div style={{marginBottom:14}}>
              <label style={lbl}>GSTIN *</label>
              <input type="text" maxLength={15} placeholder="27AAPFU0939F1ZV" required
                value={form.gstin} onChange={e=>setForm(p=>({...p,gstin:e.target.value.toUpperCase()}))}
                style={{...inp,marginBottom:4,fontFamily:"'JetBrains Mono',monospace",letterSpacing:2,fontSize:13,borderColor:form.gstin.length===15?(GSTIN_RE.test(form.gstin)?'rgba(29,158,117,0.5)':'rgba(220,38,38,0.5)'):'rgba(28,22,17,0.12)'}} />
              {gstinLoading && <div style={{fontSize:12,color:'#A09285',marginBottom:10}}>Fetching company details...</div>}
              {co?.legalName && <div style={{background:'rgba(29,158,117,0.06)',border:'0.5px solid rgba(29,158,117,0.2)',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:G,letterSpacing:'0.1em',marginBottom:4}}>COMPANY FOUND</div>
                <div style={{fontSize:14,fontWeight:500,color:'#1C1611'}}>{co.tradeName||co.legalName}</div>
                <div style={{fontSize:12,color:'#A09285'}}>{co.pincode&&co.pincode+' · '}{co.state}</div>
              </div>}
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>YOUR NAME *</label><input type="text" required placeholder="Full name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp} /></div>
            <div style={{marginBottom:14}}><label style={lbl}>WORK EMAIL *</label><input type="email" required placeholder="you@yourplant.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inp} /></div>
            <div style={{marginBottom:14}}><label style={lbl}>PASSWORD *</label><input type="password" required placeholder="Min. 8 characters" minLength={8} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} style={inp} /></div>
            <div style={{marginBottom:20}}><label style={lbl}>MOBILE / WHATSAPP</label><input type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))} style={inp} /></div>
            {error && <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.15)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#DC2626'}}>{error}</div>}
            <button type="submit" disabled={loading||!form.name||!form.email||!form.password||!GSTIN_RE.test(form.gstin)} style={btn(loading||!form.name||!form.email||!form.password||!GSTIN_RE.test(form.gstin))}>
              {loading ? 'Creating account...' : 'Start free trial'}
            </button>
          </form>
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )

  return (
    <div style={page}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" />
      <div style={{width:'100%',maxWidth:420}}>
        <Logo />
        <div style={card}>
          <div style={{textAlign:'center'}}>
            <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',marginBottom:8}}>Check your email</h2>
            <p style={{fontSize:14,color:'#A09285',lineHeight:1.7,marginBottom:24,fontWeight:300}}>
              Verification link sent to<br/><strong style={{color:'#1C1611'}}>{form.email}</strong>
            </p>
            <div style={{background:'rgba(29,158,117,0.05)',border:'0.5px solid rgba(29,158,117,0.15)',borderRadius:10,padding:'16px 20px',fontSize:13,color:'#0F6E56',lineHeight:1.7,textAlign:'left',marginBottom:28}}>
              Click the link in the email to verify and start your 3-day free trial. You will land directly on the platform.
            </div>
            <Link href="/login" style={{display:'block',padding:'12px',background:G,color:'#fff',borderRadius:10,textDecoration:'none',fontSize:14,fontWeight:500}}>Go to login</Link>
          </div>
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )
}
