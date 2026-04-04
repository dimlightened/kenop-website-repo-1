'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const C = { bg:'#F8F5EF', card:'#FFFFFF', border:'rgba(28,22,17,0.09)',
    text:'#1C1611', light:'#A09285', green:'#1D9E75' }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:36}}>
          <a href="/login" style={{textDecoration:'none'}}>
            <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:26,fontWeight:700,color:C.text}}>
              Ken<span style={{color:C.green}}>op</span>
            </span>
          </a>
        </div>

        <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:14,padding:'32px 28px'}}>
          {sent ? (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:16}}>📬</div>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:C.text,marginBottom:10}}>
                Check your email
              </h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.light,fontWeight:300,lineHeight:1.7,marginBottom:24}}>
                We sent a password reset link to <strong style={{color:C.text}}>{email}</strong>. Click the link in the email to set a new password.
              </p>
              <a href="/login" style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.green,textDecoration:'none'}}>
                ← Back to sign in
              </a>
            </div>
          ) : (
            <>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:C.text,marginBottom:6,letterSpacing:'-0.3px'}}>
                Reset password
              </h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.light,marginBottom:24,fontWeight:300}}>
                Enter your email and we'll send a reset link
              </p>
              <form onSubmit={submit}>
                <div style={{marginBottom:20}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:C.light,letterSpacing:'0.12em',display:'block',marginBottom:6}}>
                    EMAIL
                  </label>
                  <input
                    type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="you@plant.com" required
                    style={{width:'100%',padding:'10px 14px',fontFamily:"'DM Sans',sans-serif",fontSize:14,
                      border:`0.5px solid ${C.border}`,borderRadius:8,background:C.bg,color:C.text,
                      boxSizing:'border-box'}}
                  />
                </div>
                {error && (
                  <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.2)',borderRadius:8,
                    padding:'10px 14px',marginBottom:16,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#DC2626'}}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  style={{width:'100%',padding:'11px',background:C.green,color:'#fff',border:'none',
                    borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,
                    cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,marginBottom:16}}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
                <div style={{textAlign:'center'}}>
                  <a href="/login" style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.light,textDecoration:'none'}}>
                    ← Back to sign in
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
