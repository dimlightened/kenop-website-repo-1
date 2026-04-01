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

  const login = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/lab')
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F4F6F8',fontFamily:'sans-serif'}}>
      <div style={{background:'white',padding:40,borderRadius:12,width:360,boxShadow:'0 2px 16px rgba(0,0,0,0.08)'}}>
        <h2 style={{marginBottom:8,color:'#1B2A4A'}}>Kenop Intelligence</h2>
        <p style={{marginBottom:28,color:'#888',fontSize:14}}>Sign in to your plant portal</p>

        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:13,color:'#555',marginBottom:6}}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{width:'100%',padding:'10px 12px',fontSize:15,border:'1px solid #ddd',borderRadius:6,boxSizing:'border-box'}}
            placeholder="operator@plant.com"
          />
        </div>

        <div style={{marginBottom:24}}>
          <label style={{display:'block',fontSize:13,color:'#555',marginBottom:6}}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&login()}
            style={{width:'100%',padding:'10px 12px',fontSize:15,border:'1px solid #ddd',borderRadius:6,boxSizing:'border-box'}}
            placeholder="••••••••"
          />
        </div>

        {error && <p style={{color:'#c0392b',fontSize:13,marginBottom:16}}>{error}</p>}

        <button
          onClick={login}
          disabled={loading}
          style={{width:'100%',padding:14,background:'#1D9E75',color:'white',border:'none',borderRadius:8,fontSize:16,cursor:'pointer',fontWeight:600}}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}
