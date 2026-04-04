'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const G = '#1D9E75'
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const MAX_FREE = 3

export default function TryPage() {
  const router = useRouter()
  const [gstin, setGstin] = useState('')
  const [company, setCompany] = useState(null)
  const [gstinLoading, setGstinLoading] = useState(false)
  const [gstinConfirmed, setGstinConfirmed] = useState(false)
  const [queriesLeft, setQueriesLeft] = useState(MAX_FREE)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const g = gstin.toUpperCase().trim()
    clearTimeout(timer.current)
    setCompany(null)
    if (g.length !== 15 || !GSTIN_RE.test(g)) return
    setGstinLoading(true)
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/gstin?gstin=' + g)
        const d = await r.json()
        if (d.valid) setCompany(d)
      } catch {}
      finally { setGstinLoading(false) }
    }, 700)
  }, [gstin])

  const confirmGSTIN = async () => {
    if (!GSTIN_RE.test(gstin.toUpperCase())) return
    // Check existing query count
    const { data } = await sb.from('gstin_queries')
      .select('query_count')
      .eq('gstin', gstin.toUpperCase())
      .single()

    const used = data?.query_count || 0
    setQueriesLeft(MAX_FREE - used)
    setGstinConfirmed(true)

    if (used >= MAX_FREE) {
      setMessages([{
        role: 'assistant',
        content: `You have used all ${MAX_FREE} free queries for this GSTIN. Sign up for full access to continue.`
      }])
    } else {
      setMessages([{
        role: 'assistant',
        content: `Welcome${company?.tradeName ? ', ' + company.tradeName : ''}. You have ${MAX_FREE - used} free ${MAX_FREE - used === 1 ? 'query' : 'queries'} remaining. Ask me anything about your process — FFA trends, yield loss, caustic consumption, bleaching efficiency, or any process challenge you are facing right now.`
      }])
    }
  }

  const ask = async (e) => {
    e.preventDefault()
    if (!question.trim() || loading || queriesLeft <= 0) return

    const userMsg = question.trim()
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/try', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstin: gstin.toUpperCase(), question: userMsg, company })
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `You have used all ${MAX_FREE} free queries. Sign up to continue with full access.`
          }])
          setQueriesLeft(0)
          return
        }
        throw new Error(data.error || 'Failed')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      setQueriesLeft(data.queriesLeft)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = { width: '100%', padding: '11px 14px', fontSize: 14, border: '0.5px solid rgba(28,22,17,0.12)', borderRadius: 8, background: '#F8F5EF', color: '#1C1611', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F5EF', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" />

      {/* Nav */}
      <div style={{ padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(28,22,17,0.09)', background: '#fff' }}>
        <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 20, fontWeight: 700, color: '#1C1611' }}>Ken<span style={{ color: G }}>op</span></span>
        <Link href="/signup" style={{ fontSize: 13, color: G, textDecoration: 'none', fontWeight: 500 }}>Sign up for full access →</Link>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>

        {!gstinConfirmed ? (
          /* GSTIN Entry */
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,22,17,0.09)', borderRadius: 16, padding: '36px 32px' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: G, letterSpacing: '0.12em', marginBottom: 12 }}>FREE TRIAL — NO SIGNUP NEEDED</div>
            <h1 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 24, fontWeight: 700, color: '#1C1611', marginBottom: 8, letterSpacing: '-0.3px' }}>
              Ask Kenop 3 free questions
            </h1>
            <p style={{ fontSize: 14, color: '#A09285', marginBottom: 28, fontWeight: 300, lineHeight: 1.6 }}>
              Enter your GSTIN. No account needed. Get instant process intelligence for your plant.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#A09285', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>YOUR GSTIN</label>
              <input type="text" maxLength={15} placeholder="27AAPFU0939F1ZV" value={gstin}
                onChange={e => setGstin(e.target.value.toUpperCase())}
                style={{ ...inp, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, fontSize: 13, borderColor: gstin.length === 15 ? (GSTIN_RE.test(gstin) ? 'rgba(29,158,117,0.5)' : 'rgba(220,38,38,0.5)') : 'rgba(28,22,17,0.12)' }} />
              {gstinLoading && <div style={{ fontSize: 12, color: '#A09285', marginTop: 6 }}>Verifying GSTIN...</div>}
              {company?.legalName && (
                <div style={{ background: 'rgba(29,158,117,0.06)', border: '0.5px solid rgba(29,158,117,0.2)', borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: G, letterSpacing: '0.1em', marginBottom: 4 }}>VERIFIED</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1611' }}>{company.tradeName || company.legalName}</div>
                  <div style={{ fontSize: 12, color: '#A09285' }}>{company.state} · GST {company.status}</div>
                </div>
              )}
            </div>

            <button onClick={confirmGSTIN}
              disabled={!GSTIN_RE.test(gstin.toUpperCase())}
              style={{ width: '100%', padding: '13px', background: GSTIN_RE.test(gstin.toUpperCase()) ? G : '#A8D5C4', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: 'inherit', cursor: GSTIN_RE.test(gstin.toUpperCase()) ? 'pointer' : 'not-allowed' }}>
              Start free — 3 questions
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#A09285', marginTop: 12, fontWeight: 300 }}>
              No credit card. No account. Just answers.
            </p>
          </div>
        ) : (
          /* Chat Interface */
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1611' }}>{company?.tradeName || company?.legalName || gstin}</div>
                <div style={{ fontSize: 12, color: '#A09285' }}>{company?.state}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: queriesLeft > 0 ? G : '#DC2626', fontWeight: 500 }}>
                  {queriesLeft}/{MAX_FREE} queries left
                </div>
                {queriesLeft === 0 && (
                  <Link href="/signup" style={{ fontSize: 12, color: G, textDecoration: 'none', fontWeight: 500 }}>Get full access →</Link>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{ background: '#fff', border: '0.5px solid rgba(28,22,17,0.09)', borderRadius: 12, padding: '20px', marginBottom: 16, minHeight: 200 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 16, display: 'flex', gap: 10, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(29,158,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 11, fontWeight: 700, color: G }}>K</span>
                    </div>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: 10, fontSize: 14, lineHeight: 1.6, fontWeight: 300,
                    background: m.role === 'user' ? G : '#F8F5EF',
                    color: m.role === 'user' ? '#fff' : '#1C1611'
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(29,158,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 11, fontWeight: 700, color: G }}>K</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#A09285' }}>Analysing...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Query limit reached */}
            {queriesLeft === 0 && (
              <div style={{ background: 'rgba(29,158,117,0.06)', border: '0.5px solid rgba(29,158,117,0.2)', borderRadius: 12, padding: '20px 24px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1C1611', marginBottom: 6 }}>Ready for full access?</div>
                <div style={{ fontSize: 13, color: '#A09285', marginBottom: 16, fontWeight: 300 }}>Get unlimited queries, daily morning reports, and continuous process monitoring.</div>
                <Link href="/signup" style={{ display: 'inline-block', padding: '12px 32px', background: G, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  Sign up — ₹2,000/month
                </Link>
              </div>
            )}

            {/* Input */}
            {queriesLeft > 0 && (
              <form onSubmit={ask} style={{ display: 'flex', gap: 8 }}>
                <input type="text" placeholder="Ask about FFA, yield loss, caustic consumption..." value={question}
                  onChange={e => setQuestion(e.target.value)}
                  disabled={loading}
                  style={{ ...inp, flex: 1 }} />
                <button type="submit" disabled={loading || !question.trim()}
                  style={{ padding: '11px 20px', background: loading || !question.trim() ? '#A8D5C4' : G, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: loading || !question.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                  {loading ? '...' : 'Ask'}
                </button>
              </form>
            )}
            {error && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 8 }}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
