'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function StartForm() {
  const params = useSearchParams()
  const vertical = params.get('v') === 'bd' ? 'biodiesel' : 'edible_oil'
  const verticalLabel = vertical === 'biodiesel' ? 'Biodiesel' : 'Edible Oil'
  const [form, setForm] = useState({ name:'', email:'', whatsapp:'', company:'' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const C = { bg:'#F8F5EF', card:'#FFFFFF', border:'rgba(28,22,17,0.09)', text:'#1C1611', light:'#A09285', green:'#1D9E75' }

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/leads', { method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({...form, vertical}) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setDone(true)
    } catch(err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (done) return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:420,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:20}}>📬</div>
        <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:26,fontWeight:700,color:C.text,marginBottom:12}}>Check your email</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,color:C.light,fontWeight:300,lineHeight:1.7,marginBottom:8}}>We sent a login link to</p>
        <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:C.text,marginBottom:20}}>{form.email}</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.light,fontWeight:300,lineHeight:1.7}}>Click the link to access your dashboard and complete plant setup. No password needed.</p>
      </div>
    </div>
  )

  const fields = [
    { key:'company', label:'COMPANY NAME', placeholder:'Budge Budge Refineries Ltd', required:true },
    { key:'name', label:'YOUR NAME', placeholder:'Your full name', required:true },
    { key:'email', label:'WORK EMAIL', placeholder:'you@yourplant.com', required:true, type:'email' },
    { key:'whatsapp', label:'WHATSAPP', placeholder:'+91 98765 43210', required:false },
  ]

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:24,fontWeight:700,color:C.text}}>Ken<span style={{color:C.green}}>op</span></span>
          <span style={{marginLeft:10,padding:'2px 10px',background:'rgba(29,158,117,0.1)',borderRadius:20,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:C.green,letterSpacing:'0.12em'}}>{verticalLabel.toUpperCase()}</span>
        </div>
        <div style={{background:C.card,border:'0.5px solid rgba(28,22,17,0.09)',borderRadius:14,padding:'32px 28px'}}>
          <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:C.text,marginBottom:6,letterSpacing:'-0.3px'}}>Get started</h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.light,marginBottom:24,fontWeight:300}}>Set up your plant intelligence in 5 minutes</p>
          <form onSubmit={submit}>
            {fields.map(f => (
              <div key={f.key} style={{marginBottom:16}}>
                <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:C.light,letterSpacing:'0.12em',display:'block',marginBottom:6}}>{f.label}{f.required?' *':''}</label>
                <input type={f.type||'text'} placeholder={f.placeholder} required={f.required}
                  value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  style={{width:'100%',padding:'10px 14px',fontFamily:"'DM Sans',sans-serif",fontSize:14,border:'0.5px solid rgba(28,22,17,0.09)',borderRadius:8,background:C.bg,color:C.text,boxSizing:'border-box'}}/>
              </div>
            ))}
            {error && <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.2)',borderRadius:8,padding:'10px 14px',marginBottom:16,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#DC2626'}}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'12px',background:C.green,color:'#fff',border:'none',borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,marginTop:4}}>
              {loading ? 'Setting up your account...' : 'Get started'}
            </button>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.light,textAlign:'center',marginTop:14,fontWeight:300}}>We will send a login link to your email. No password needed.</p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Start() { return <Suspense><StartForm /></Suspense> }
