'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function LoginForm() {
  const params = useSearchParams()
  const router = useRouter()
  const next = params.get('next') || '/dashboard'
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const send = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: window.location.origin + next
        }
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err.message === 'Signups not allowed for otp'
        ? 'No account found. Contact your Kenop administrator.'
        : err.message)
    } finally { setLoading(false) }
  }

  const G = '#1D9E75'
  const card = { background:'#fff', border:'0.5px solid rgba(28,22,17,0.09)', borderRadius:14, padding:'36px 32px' }
  const inp = { width:'100%', padding:'12px 16px', fontSize:15, border:'0.5px solid rgba(28,22,17,0.12)', borderRadius:10, background:'#F8F5EF', color:'#1C1611', boxSizing:'border-box', outline:'none', fontFamily:'inherit', display:'block' }

  return (
    <div style={{minHeight:'100vh',background:'#F8F5EF',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:28,fontWeight:700,color:'#1C1611'}}>
            Ken<span style={{color:G}}>op</span>
          </span>
        </div>

        <div style={card}>
          {!sent ? (
            <>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:600,color:'#1C1611',marginBottom:6,letterSpacing:'-0.3px'}}>
                Sign in
              </h2>
              <p style={{fontSize:13,color:'#A09285',marginBottom:28,fontWeight:300,lineHeight:1.6}}>
                Enter your email — we will send you a login link. No password needed.
              </p>
              <form onSubmit={send}>
                <input type="email" required autoFocus placeholder="you@yourplant.com"
                  value={email} onChange={e=>setEmail(e.target.value)}
                  style={{...inp, marginBottom:16}} />
                {error && (
                  <div style={{background:'#FEF2F2',border:'0.5px solid rgba(220,38,38,0.15)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#DC2626'}}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading||!email}
                  style={{width:'100%',padding:'13px',background:loading||!email?'#A8D5C4':G,color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'inherit',cursor:loading||!email?'not-allowed':'pointer'}}>
                  {loading ? 'Sending...' : 'Send login link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:40,marginBottom:20}}>📬</div>
              <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:20,fontWeight:600,color:'#1C1611',marginBottom:12}}>
                Check your email
              </h2>
              <p style={{fontSize:14,color:'#A09285',lineHeight:1.7,fontWeight:300}}>
                We sent a login link to<br/>
                <strong style={{color:'#1C1611'}}>{email}</strong><br/><br/>
                Click the link in the email to sign in.<br/>
                You can close this tab.
              </p>
              <button onClick={()=>{setSent(false);setEmail('')}}
                style={{marginTop:24,background:'none',border:'none',fontSize:13,color:'#A09285',cursor:'pointer',fontFamily:'inherit',textDecoration:'underline'}}>
                Use a different email
              </button>
            </div>
          )}
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>
          E-Shakti Binary Currents Pvt. Ltd.
        </p>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh',background:'#F8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:700,color:'#1C1611',fontFamily:'serif'}}>
        Ken<span style={{color:'#1D9E75'}}>op</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
