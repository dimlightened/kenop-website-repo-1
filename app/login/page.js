'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const G = '#1D9E75'

function LoginForm() {
  const params = useSearchParams()
  const router = useRouter()
  const next = params.get('next') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inp = {width:'100%',padding:'12px 16px',fontSize:15,border:'0.5px solid rgba(28,22,17,0.12)',borderRadius:10,background:'#F8F5EF',color:'#1C1611',boxSizing:'border-box',outline:'none',fontFamily:'inherit',marginBottom:14,display:'block'}

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
      const { data: client } = await sb.from('clients').select('status').eq('auth_user_id', data.user.id).single()
      if (client?.status === 'expired') { router.push('/trial-expired'); return }
      router.push(next)
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password.' : err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',background:'#F8F5EF',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" />
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:28,fontWeight:700,color:'#1C1611'}}>Ken<span style={{color:G}}>op</span></span>
          <div style={{fontSize:12,color:'#A09285',marginTop:6,fontWeight:300}}>Process Intelligence Platform</div>
        </div>
        <div style={{background:'#fff',border:'0.5px solid rgba(28,22,17,0.09)',borderRadius:16,padding:'36px 32px'}}>
          <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',margin:'0 0 6px'}}>Sign in</h2>
          <p style={{fontSize:14,color:'#A09285',margin:'6px 0 24px',fontWeight:300}}>Welcome back.</p>
          <form onSubmit={submit}>
            <input type="email" required autoFocus placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} />
            <input type="password" required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{...inp,marginBottom:8}} />
            <div style={{textAlign:'right',marginBottom:16}}>
              <Link href="/forgot-password" style={{fontSize:13,color:G,textDecoration:'none'}}>Forgot password?</Link>
            </div>
            {error && <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.15)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#DC2626'}}>{error}</div>}
            <button type="submit" disabled={loading} style={{width:'100%',padding:'13px',background:loading?'#A8D5C4':G,color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'inherit',cursor:loading?'not-allowed':'pointer'}}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p style={{textAlign:'center',fontSize:13,color:'#A09285',marginTop:20,fontWeight:300}}>
            No account? <Link href="/signup" style={{color:G,textDecoration:'none',fontWeight:500}}>Start free trial</Link>
          </p>
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )
}

export default function Login() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#F8F5EF'}}/>}><LoginForm /></Suspense>
}
