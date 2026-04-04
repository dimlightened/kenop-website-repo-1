'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const C = { bg:'#F8F5EF', card:'#FFFFFF', border:'rgba(28,22,17,0.09)',
    text:'#1C1611', light:'#A09285', green:'#1D9E75', amber:'#B45309' }

  const login = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:36}}>
          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:26,fontWeight:700,color:C.text}}>
            Ken<span style={{color:C.green}}>op</span>
          </span>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.light,marginTop:6,fontWeight:300}}>
            Plant Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:14,padding:'32px 28px'}}>
          <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:C.text,marginBottom:6,letterSpacing:'-0.3px'}}>
            Sign in
          </h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.light,marginBottom:24,fontWeight:300}}>
            Access your plant dashboard
          </p>

          <form onSubmit={login}>
            <div style={{marginBottom:16}}>
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
            <div style={{marginBottom:8}}>
              <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:C.light,letterSpacing:'0.12em',display:'block',marginBottom:6}}>
                PASSWORD
              </label>
              <input
                type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{width:'100%',padding:'10px 14px',fontFamily:"'DM Sans',sans-serif",fontSize:14,
                  border:`0.5px solid ${C.border}`,borderRadius:8,background:C.bg,color:C.text,
                  boxSizing:'border-box'}}
              />
            </div>

            {/* Forgot password link */}
            <div style={{textAlign:'right',marginBottom:20}}>
              <a href="/forgot-password" style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.green,textDecoration:'none'}}>
                Forgot password?
              </a>
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{textAlign:'center',fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.light,marginTop:20,fontWeight:300}}>
          E-Shakti Binary Currents Pvt. Ltd.
        </p>
      </div>
    </div>
  )
}
