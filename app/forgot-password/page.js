'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const G = '#1D9E75'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + '/reset-password' })
      if (error) throw error
      setSent(true)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',background:'#F8F5EF',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" />
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:28,fontWeight:700,color:'#1C1611'}}>Ken<span style={{color:G}}>op</span></span>
        </div>
        <div style={{background:'#fff',border:'0.5px solid rgba(28,22,17,0.09)',borderRadius:16,padding:'36px 32px'}}>
          {!sent ? (
            <>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',margin:'0 0 6px'}}>Reset password</h2>
              <p style={{fontSize:14,color:'#A09285',margin:'6px 0 24px',fontWeight:300}}>Enter your email and we will send a reset link.</p>
              <form onSubmit={submit}>
                <input type="email" required autoFocus placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}
                  style={{width:'100%',padding:'12px 16px',fontSize:15,border:'0.5px solid rgba(28,22,17,0.12)',borderRadius:10,background:'#F8F5EF',color:'#1C1611',boxSizing:'border-box',outline:'none',fontFamily:'inherit',marginBottom:16,display:'block'}} />
                {error && <div style={{background:'#FEF2F2',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#DC2626'}}>{error}</div>}
                <button type="submit" disabled={loading}
                  style={{width:'100%',padding:'13px',background:loading?'#A8D5C4':G,color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'inherit',cursor:loading?'not-allowed':'pointer'}}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
              <p style={{textAlign:'center',fontSize:13,color:'#A09285',marginTop:20}}><Link href="/login" style={{color:G,textDecoration:'none'}}>Back to login</Link></p>
            </>
          ) : (
            <div style={{textAlign:'center'}}>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',marginBottom:8}}>Link sent</h2>
              <p style={{fontSize:14,color:'#A09285',lineHeight:1.6,marginBottom:24,fontWeight:300}}>Check your email at <strong style={{color:'#1C1611'}}>{email}</strong></p>
              <Link href="/login" style={{display:'block',padding:'12px',background:G,color:'#fff',borderRadius:10,textDecoration:'none',fontSize:14,fontWeight:500}}>Back to login</Link>
            </div>
          )}
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )
}
