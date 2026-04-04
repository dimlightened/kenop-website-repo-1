'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const C = { bg:'#F8F5EF', card:'#FFFFFF', border:'rgba(28,22,17,0.09)',
    text:'#1C1611', light:'#A09285', green:'#1D9E75' }

  useEffect(() => {
    // Supabase sends tokens in the URL hash — this handles the session
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is authenticated via the reset link — ready to set new password
      }
    })
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:36}}>
          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:26,fontWeight:700,color:C.text}}>
            Ken<span style={{color:C.green}}>op</span>
          </span>
        </div>

        <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:14,padding:'32px 28px'}}>
          {done ? (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:16}}>✅</div>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:C.text,marginBottom:10}}>
                Password updated
              </h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.light,fontWeight:300,marginBottom:24}}>
                Your password has been changed successfully.
              </p>
              <button onClick={()=>router.push('/dashboard')}
                style={{padding:'10px 24px',background:C.green,color:'#fff',border:'none',
                  borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:'pointer'}}>
                Go to dashboard
              </button>
            </div>
          ) : (
            <>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:C.text,marginBottom:6,letterSpacing:'-0.3px'}}>
                Set new password
              </h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.light,marginBottom:24,fontWeight:300}}>
                Choose a strong password for your account
              </p>
              <form onSubmit={submit}>
                <div style={{marginBottom:16}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:C.light,letterSpacing:'0.12em',display:'block',marginBottom:6}}>
                    NEW PASSWORD
                  </label>
                  <input
                    type="password" value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Min. 8 characters" required
                    style={{width:'100%',padding:'10px 14px',fontFamily:"'DM Sans',sans-serif",fontSize:14,
                      border:`0.5px solid ${C.border}`,borderRadius:8,background:C.bg,color:C.text,
                      boxSizing:'border-box'}}
                  />
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:C.light,letterSpacing:'0.12em',display:'block',marginBottom:6}}>
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                    placeholder="Repeat password" required
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
                    cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}>
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
