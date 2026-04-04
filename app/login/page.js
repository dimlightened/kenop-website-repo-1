'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function LoginForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState('enter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'

  const sendCode = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false }
      })
      if (error) throw error
      setStage('verify')
    } catch (err) {
      setError(err.message === 'Signups not allowed for otp'
        ? 'No account found. Contact your Kenop administrator.'
        : err.message)
    } finally { setLoading(false) }
  }

  const verify = async (e) => {
    e.preventDefault()
    if (code.length<8) return
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(), token: code, type: 'email'
      })
      if (error) throw error
      router.push(next)
    } catch (err) {
      setError('Incorrect code. Try again.')
      setCode('')
    } finally { setLoading(false) }
  }

  const green = '#1D9E75'
  const s = {
    page: { minHeight:'100vh', background:'#F8F5EF', display:'flex',
      alignItems:'center', justifyContent:'center', padding:24,
      fontFamily:"'DM Sans', system-ui, sans-serif" },
    wrap: { width:'100%', maxWidth:400 },
    logo: { textAlign:'center', marginBottom:40,
      fontSize:28, fontWeight:700, color:'#1C1611', letterSpacing:'-0.5px' },
    card: { background:'#fff', border:'0.5px solid rgba(28,22,17,0.09)',
      borderRadius:16, padding:'36px 32px',
      boxShadow:'0 2px 24px rgba(28,22,17,0.06)' },
    h2: { fontSize:24, fontWeight:600, color:'#1C1611',
      marginBottom:6, letterSpacing:'-0.4px', margin:'0 0 6px' },
    sub: { fontSize:14, color:'#A09285', marginBottom:28,
      fontWeight:300, lineHeight:1.6, margin:'6px 0 28px' },
    inp: { width:'100%', padding:'12px 16px', fontSize:15,
      border:'0.5px solid rgba(28,22,17,0.12)', borderRadius:10,
      background:'#F8F5EF', color:'#1C1611', boxSizing:'border-box',
      outline:'none', fontFamily:'inherit', marginBottom:16, display:'block' },
    btn: (off) => ({ width:'100%', padding:'13px',
      background: off ? '#A8D5C4' : green, color:'#fff', border:'none',
      borderRadius:10, fontSize:15, fontWeight:500, fontFamily:'inherit',
      cursor: off ? 'not-allowed' : 'pointer' }),
    err: { background:'#FEF2F2', border:'0.5px solid rgba(220,38,38,0.15)',
      borderRadius:8, padding:'10px 14px', marginBottom:16,
      fontSize:13, color:'#DC2626' },
    back: { background:'none', border:'none', color:'#A09285', cursor:'pointer',
      fontSize:13, padding:0, marginBottom:20, fontFamily:'inherit' },
    ghost: { width:'100%', padding:'10px', background:'none', border:'none',
      fontSize:13, color:'#A09285', cursor:'pointer',
      marginTop:8, fontFamily:'inherit' },
    foot: { textAlign:'center', fontSize:11, color:'#A09285',
      marginTop:20, fontWeight:300 }
  }

  return (
    <div style={s.page}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" />
      <div style={s.wrap}>
        <div style={s.logo}>
          Ken<span style={{color:green}}>op</span>
        </div>
        <div style={s.card}>
          {stage === 'enter' ? (
            <>
              <h2 style={s.h2}>Sign in</h2>
              <p style={s.sub}>Enter your email. We will send a Verification code — no password needed.</p>
              <form onSubmit={sendCode}>
                <input type="email" value={email} autoFocus required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourplant.com" style={s.inp} />
                {error && <div style={s.err}>{error}</div>}
                <button type="submit" disabled={loading} style={s.btn(loading)}>
                  {loading ? 'Sending...' : 'Send code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => { setStage('enter'); setError(''); setCode('') }} style={s.back}>
                Back
              </button>
              <h2 style={s.h2}>Enter code</h2>
              <p style={s.sub}>Verification code sent to<br/><strong style={{color:'#1C1611'}}>{email}</strong></p>
              <form onSubmit={verify}>
                <input type="text" value={code} autoFocus inputMode="numeric"
                  onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0,8))}
                  placeholder="_ _ _ _ _ _ _ _"
                  style={{...s.inp, fontFamily:"'JetBrains Mono', monospace",
                    fontSize:32, letterSpacing:14, textAlign:'center'}} />
                {error && <div style={s.err}>{error}</div>}
                <button type="submit" disabled={loading || code.length<8}
                  style={s.btn(loading || code.length<8)}>
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button type="button"
                  onClick={() => { setStage('enter'); setCode(''); setError('') }}
                  style={s.ghost}>
                  Did not receive it? Try again
                </button>
              </form>
            </>
          )}
        </div>
        <p style={s.foot}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )
}

export default function Login() {
  return <Suspense fallback={
    <div style={{minHeight:'100vh', background:'#F8F5EF', display:'flex',
      alignItems:'center', justifyContent:'center',
      fontFamily:'system-ui', fontSize:28, fontWeight:700, color:'#1C1611'}}>
      Ken<span style={{color:'#1D9E75'}}>op</span>
    </div>
  }><LoginForm /></Suspense>
}
