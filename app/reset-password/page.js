'use client'
import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const G = '#1D9E75'

function ResetForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const inp = {width:'100%',padding:'12px 16px',fontSize:15,border:'0.5px solid rgba(28,22,17,0.12)',borderRadius:10,background:'#F8F5EF',color:'#1C1611',boxSizing:'border-box',outline:'none',fontFamily:'inherit',marginBottom:14,display:'block'}

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Min. 8 characters.'); return }
    setLoading(true); setError('')
    try {
      const { error } = await sb.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
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
          {!done ? (
            <>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',margin:'0 0 6px'}}>New password</h2>
              <p style={{fontSize:14,color:'#A09285',margin:'6px 0 24px',fontWeight:300}}>Choose a new password for your account.</p>
              <form onSubmit={submit}>
                <input type="password" required autoFocus placeholder="New password (min. 8 chars)" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} style={inp} />
                <input type="password" required placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{...inp,marginBottom:16}} />
                {error && <div style={{background:'#FEF2F2',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#DC2626'}}>{error}</div>}
                <button type="submit" disabled={loading}
                  style={{width:'100%',padding:'13px',background:loading?'#A8D5C4':G,color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'inherit',cursor:loading?'not-allowed':'pointer'}}>
                  {loading ? 'Updating...' : 'Set new password'}
                </button>
              </form>
            </>
          ) : (
            <div style={{textAlign:'center'}}>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:20,fontWeight:600,color:G,marginBottom:8}}>Password updated</h2>
              <p style={{fontSize:14,color:'#A09285',fontWeight:300}}>Redirecting to login...</p>
            </div>
          )}
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#F8F5EF'}}/>}><ResetForm /></Suspense>
}
