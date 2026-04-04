'use client'
import { useState, Suspense, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const G = '#1D9E75'

function StartForm() {
  const params = useSearchParams()
  const router = useRouter()
  const vertical = params.get('v') === 'bd' ? 'biodiesel' : 'edible_oil'
  const vLabel = vertical === 'biodiesel' ? 'Biodiesel' : 'Edible Oil'
  const [stage, setStage] = useState('form')
  const [form, setForm] = useState({ email:'', mobile:'', gstin:'' })
  const [co, setCo] = useState(null)
  const [gErr, setGErr] = useState('')
  const [gLoading, setGLoading] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    const g = form.gstin.toUpperCase().trim()
    clearTimeout(timer.current)
    setCo(null); setGErr('')
    if (g.length !== 15 || !GSTIN_RE.test(g)) return
    setGLoading(true)
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/gstin?gstin=' + g)
        const d = await r.json()
        if (!d.valid) { setGErr(d.error || 'Invalid GSTIN'); setCo(null) }
        else { setCo(d); setGErr('') }
      } catch { setGErr('Lookup failed') }
      finally { setGLoading(false) }
    }, 700)
  }, [form.gstin])

  const sendOTP = async (e) => {
    e.preventDefault()
    const g = form.gstin.toUpperCase()
    if (!form.email || !GSTIN_RE.test(g)) return
    setLoading(true); setError('')
    try {
      const { error } = await sb.auth.signInWithOtp({
        email: form.email.trim(),
        options: { shouldCreateUser: true, data: { mobile: form.mobile, gstin: g, company: co?.tradeName || co?.legalName || '' } }
      })
      if (error) throw error
      setStage('otp')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const verifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data, error } = await sb.auth.verifyOtp({ email: form.email.trim(), token: code, type: 'email' })
      if (error) throw error
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), mobile: form.mobile, gstin: form.gstin.toUpperCase(), name: co?.tradeName || co?.legalName || form.email, companyName: co?.legalName || '', pincode: co?.pincode || '', state: co?.state || '', vertical, authUserId: data.user?.id })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Setup failed')
      router.push('/onboard/' + (vertical === 'biodiesel' ? 'biodiesel' : 'edible-oil'))
    } catch (err) { setError(err.message); setCode('') }
    finally { setLoading(false) }
  }

  const inp = { width:'100%', padding:'11px 14px', fontFamily:'inherit', fontSize:14, border:'0.5px solid rgba(28,22,17,0.12)', borderRadius:8, background:'#F8F5EF', color:'#1C1611', boxSizing:'border-box', outline:'none', display:'block' }
  const btn = (off) => ({ width:'100%', padding:'12px', background:off?'#A8D5C4':G, color:'#fff', border:'none', borderRadius:8, fontFamily:'inherit', fontSize:14, fontWeight:500, cursor:off?'not-allowed':'pointer' })

  return (
    <div style={{minHeight:'100vh',background:'#F8F5EF',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:26,fontWeight:700,color:'#1C1611'}}>Ken<span style={{color:G}}>op</span></span>
          <span style={{marginLeft:10,padding:'2px 10px',background:'rgba(29,158,117,0.1)',borderRadius:20,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:G,letterSpacing:'0.12em'}}>{vLabel.toUpperCase()}</span>
        </div>
        <div style={{background:'#FFFFFF',border:'0.5px solid rgba(28,22,17,0.09)',borderRadius:14,padding:'32px 28px'}}>
          {stage === 'form' ? (
            <>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',marginBottom:6,letterSpacing:'-0.3px'}}>Get started</h2>
              <p style={{fontSize:13,color:'#A09285',marginBottom:24,fontWeight:300,lineHeight:1.6}}>Enter your GSTIN — company details fetched automatically.</p>
              <form onSubmit={sendOTP}>
                <div style={{marginBottom:14}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#A09285',letterSpacing:'0.12em',display:'block',marginBottom:5}}>GSTIN *</label>
                  <input type="text" maxLength={15} placeholder="27AAPFU0939F1ZV" required
                    value={form.gstin} onChange={e=>setForm(p=>({...p,gstin:e.target.value.toUpperCase()}))}
                    style={{...inp,fontFamily:"'JetBrains Mono',monospace",letterSpacing:2,fontSize:13,borderColor:form.gstin.length===15?(GSTIN_RE.test(form.gstin)?'rgba(29,158,117,0.5)':'rgba(220,38,38,0.5)'):'rgba(28,22,17,0.12)'}} />
                  {gLoading && <div style={{fontSize:12,color:'#A09285',marginTop:5}}>Fetching company details...</div>}
                  {gErr && <div style={{fontSize:12,color:'#DC2626',marginTop:5}}>{gErr}</div>}
                  {!gLoading && !gErr && form.gstin.length===15 && GSTIN_RE.test(form.gstin) && co && !co.legalName && <div style={{fontSize:12,color:'#1D9E75',marginTop:5}}>Valid — {co.state}</div>}
                </div>

                {co && co.legalName && (
                  <div style={{background:'rgba(29,158,117,0.06)',border:'0.5px solid rgba(29,158,117,0.2)',borderRadius:8,padding:'12px 14px',marginBottom:14}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:G,letterSpacing:'0.1em',marginBottom:6}}>COMPANY FOUND</div>
                    <div style={{fontSize:14,fontWeight:500,color:'#1C1611',marginBottom:2}}>{co.tradeName || co.legalName}</div>
                    {co.legalName !== co.tradeName && <div style={{fontSize:11,color:'#A09285',marginBottom:4}}>{co.legalName}</div>}
                    <div style={{fontSize:12,color:'#A09285'}}>{co.pincode && co.pincode + ' · '}{co.state}</div>
                    <div style={{fontSize:11,marginTop:4,color:co.status==='Active'?G:'#DC2626'}}>GST {co.status}</div>
                  </div>
                )}

                <div style={{marginBottom:14}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#A09285',letterSpacing:'0.12em',display:'block',marginBottom:5}}>WORK EMAIL *</label>
                  <input type="email" required placeholder="you@yourplant.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inp} />
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#A09285',letterSpacing:'0.12em',display:'block',marginBottom:5}}>MOBILE / WHATSAPP</label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))} style={inp} />
                </div>

                {error && <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.15)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#DC2626'}}>{error}</div>}
                <button type="submit" disabled={loading||!GSTIN_RE.test(form.gstin.toUpperCase())||!form.email} style={btn(loading||!GSTIN_RE.test(form.gstin.toUpperCase())||!form.email)}>
                  {loading ? 'Sending code...' : 'Send verification code'}
                </button>
                <p style={{fontSize:11,color:'#A09285',textAlign:'center',marginTop:12,fontWeight:300}}>Verification code sent to your email</p>
              </form>
            </>
          ) : (
            <>
              <button onClick={()=>{setStage('form');setError('');setCode('')}} style={{background:'none',border:'none',color:'#A09285',cursor:'pointer',fontSize:13,padding:0,marginBottom:20,fontFamily:'inherit'}}>Back</button>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',marginBottom:6,letterSpacing:'-0.3px'}}>Verify your email</h2>
              <p style={{fontSize:13,color:'#A09285',marginBottom:8,fontWeight:300,lineHeight:1.6}}>Verification code sent to<br/><strong style={{color:'#1C1611'}}>{form.email}</strong></p>
              {co?.legalName && <div style={{fontSize:12,color:'#A09285',marginBottom:20,padding:'8px 12px',background:'rgba(29,158,117,0.06)',borderRadius:6,fontFamily:"'JetBrains Mono',monospace"}}>{co.tradeName||co.legalName} · {co.state}</div>}
              <form onSubmit={verifyOTP}>
                <input type="text" autoFocus inputMode="numeric" placeholder="- - - - - - - -" value={code}
                  onChange={e=>setCode(e.target.value.replace(/[^0-9]/g,'').slice(0,8))}
                  style={{...inp,fontFamily:"'JetBrains Mono',monospace",fontSize:30,letterSpacing:14,textAlign:'center',marginBottom:16}} />
                {error && <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.15)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#DC2626'}}>{error}</div>}
                <button type="submit" disabled={loading||code.length<6} style={btn(loading||code.length<6)}>
                  {loading ? 'Verifying...' : 'Verify and continue'}
                </button>
                <button type="button" onClick={()=>{setStage('form');setCode('');setError('')}}
                  style={{width:'100%',padding:'10px',background:'none',border:'none',fontSize:13,color:'#A09285',cursor:'pointer',marginTop:8,fontFamily:'inherit'}}>
                  Did not receive it? Try again
                </button>
              </form>
            </>
          )}
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )
}

export default function Start() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#F8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:700,color:'#1C1611',fontFamily:'serif'}}>Ken<span style={{color:'#1D9E75'}}>op</span></div>}><StartForm /></Suspense>
}
