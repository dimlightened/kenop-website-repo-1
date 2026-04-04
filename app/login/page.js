'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState('enter') // enter | verify
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'

  const C = {
    bg: '#F8F5EF', card: '#FFFFFF', border: 'rgba(28,22,17,0.09)',
    text: '#1C1611', light: '#A09285', green: '#1D9E75'
  }

  const isPhone = (val) => /^[+]?[0-9\s\-()]{8,15}$/.test(val.trim())
  const isEmail = (val) => /^[^@]+@[^@]+\.[^@]+$/.test(val.trim())

  const sendCode = async (e) => {
    e.preventDefault()
    const val = identifier.trim()
    if (!val) return
    setLoading(true); setError('')

    try {
      if (isPhone(val)) {
        // Phone OTP
        const phone = val.replace(/[\s\-()]/g, '')
        const { error } = await supabase.auth.signInWithOtp({ phone })
        if (error) throw error
      } else if (isEmail(val)) {
        // Email OTP — 6-digit code, not magic link
        const { error } = await supabase.auth.signInWithOtp({
          email: val,
          options: { shouldCreateUser: false }
        })
        if (error) throw error
      } else {
        throw new Error('Enter a valid email or phone number')
      }
      setStage('verify')
      setCodeSent(true)
    } catch (err) {
      setError(err.message === 'Signups not allowed for otp'
        ? 'No account found. Contact your Kenop administrator.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    if (code.length < 6) return
    setLoading(true); setError('')

    try {
      const val = identifier.trim()
      let result
      if (isPhone(val)) {
        const phone = val.replace(/[\s\-()]/g, '')
        result = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' })
      } else {
        result = await supabase.auth.verifyOtp({ email: val, token: code, type: 'email' })
      }
      if (result.error) throw result.error
      router.push(next)
    } catch (err) {
      setError('Incorrect code. Check and try again.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    fontFamily: "'DM Sans',sans-serif", fontSize: 15,
    border: '0.5px solid rgba(28,22,17,0.12)', borderRadius: 10,
    background: C.bg, color: C.text, boxSizing: 'border-box',
    outline: 'none'
  }

  const btnStyle = {
    width: '100%', padding: '13px',
    background: loading ? '#A8D5C4' : C.green,
    color: '#fff', border: 'none', borderRadius: 10,
    fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 500,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s'
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:28,fontWeight:700,color:C.text}}>
            Ken<span style={{color:C.green}}>op</span>
          </span>
        </div>

        <div style={{background:C.card,border:'0.5px solid ' + C.border,borderRadius:16,padding:'36px 32px',boxShadow:'0 2px 24px rgba(28,22,17,0.06)'}}>

          {stage === 'enter' ? (
            <>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:24,fontWeight:600,color:C.text,marginBottom:6,letterSpacing:'-0.4px'}}>
                Sign in
              </h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.light,marginBottom:28,fontWeight:300,lineHeight:1.5}}>
                Enter your email or WhatsApp number. We'll send a 6-digit code.
              </p>
              <form onSubmit={sendCode}>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Email or WhatsApp number"
                  autoFocus
                  style={{...inputStyle, marginBottom: 16}}
                />
                {error && (
                  <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.15)',borderRadius:8,
                    padding:'10px 14px',marginBottom:16,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#DC2626'}}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading} style={btnStyle}>
                  {loading ? 'Sending code...' : 'Send code →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => { setStage('enter'); setError(''); setCode('') }}
                style={{background:'none',border:'none',color:C.light,cursor:'pointer',
                  fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:0,marginBottom:20,display:'flex',alignItems:'center',gap:4}}>
                ← Back
              </button>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:24,fontWeight:600,color:C.text,marginBottom:6,letterSpacing:'-0.4px'}}>
                Enter code
              </h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.light,marginBottom:28,fontWeight:300,lineHeight:1.6}}>
                We sent a 6-digit code to<br/>
                <strong style={{color:C.text}}>{identifier}</strong>
              </p>
              <form onSubmit={verifyCode}>
                <input
                  type="text"
                  value={code}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                    setCode(v)
                  }}
                  placeholder="000000"
                  autoFocus
                  inputMode="numeric"
                  style={{
                    ...inputStyle,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 28, letterSpacing: 12,
                    textAlign: 'center', marginBottom: 16
                  }}
                />
                {error && (
                  <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.15)',borderRadius:8,
                    padding:'10px 14px',marginBottom:16,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#DC2626'}}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading || code.length < 6} style={{...btnStyle,
                  background: (loading || code.length < 6) ? '#A8D5C4' : C.green}}>
                  {loading ? 'Verifying...' : 'Verify →'}
                </button>
                <button type="button"
                  onClick={() => { setStage('enter'); setCode(''); setError('') }}
                  style={{width:'100%',padding:'10px',background:'none',border:'none',
                    fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.light,cursor:'pointer',marginTop:8}}>
                  Didn't receive it? Try again
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{textAlign:'center',fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.light,marginTop:20,fontWeight:300}}>
          E-Shakti Binary Currents Pvt. Ltd.
        </p>
      </div>
    </div>
  )
}

export default function Login() {
  return <Suspense><LoginForm /></Suspense>
}
