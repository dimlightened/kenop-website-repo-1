'use client'
import { useState, useRef, useEffect } from 'react'

const G = '#1D9E75'

export default function LabPage() {
  const [vertical, setVertical] = useState('edible_oil')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [ragPairs, setRagPairs] = useState([])
  const [showRag, setShowRag] = useState(false)
  const [stats, setStats] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const inp = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '0.5px solid rgba(28,22,17,0.12)', borderRadius: 8,
    background: '#F8F5EF', color: '#1C1611', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'inherit'
  }

  const ask = async (e) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    const q = question.trim()
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    setRagPairs([])
    setStats(null)

    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, vertical })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      setRagPairs(data.ragPairs || [])
      setStats(data.stats)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F5EF', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" />

      {/* Nav */}
      <div style={{ padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(28,22,17,0.09)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 18, fontWeight: 700, color: '#1C1611' }}>Ken<span style={{ color: G }}>op</span></span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#DC2626', letterSpacing: '0.12em', background: 'rgba(220,38,38,0.08)', padding: '2px 8px', borderRadius: 4 }}>LAB — INTERNAL TEST</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['edible_oil', 'biodiesel'].map(v => (
            <button key={v} onClick={() => setVertical(v)} style={{
              padding: '5px 14px', fontSize: 12, borderRadius: 6, fontFamily: 'inherit', cursor: 'pointer', fontWeight: vertical === v ? 500 : 400,
              background: vertical === v ? G : 'transparent',
              color: vertical === v ? '#fff' : '#6B6056',
              border: `0.5px solid ${vertical === v ? G : 'rgba(28,22,17,0.14)'}`
            }}>
              {v === 'edible_oil' ? 'Edible Oil' : 'Biodiesel'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: showRag ? '1fr 340px' : '1fr', gap: 16 }}>

        {/* Main chat */}
        <div>
          {/* Info banner */}
          <div style={{ background: 'rgba(29,158,117,0.06)', border: '0.5px solid rgba(29,158,117,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#085041', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span><strong>Model:</strong> Claude Sonnet 4.6 (Anthropic API)</span>
            <span><strong>RAG:</strong> Your training pairs from Supabase</span>
            <span><strong>Purpose:</strong> Baseline quality test</span>
          </div>

          {/* Messages */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,22,17,0.09)', borderRadius: 12, padding: 20, minHeight: 300, marginBottom: 16 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 20, color: '#1C1611', marginBottom: 8 }}>Ken<span style={{ color: G }}>op</span> Lab</div>
                <div style={{ fontSize: 13, color: '#A09285', fontWeight: 300 }}>Claude Sonnet + your training pairs as RAG context</div>
                <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {[
                    'My AV rises when soap stock is split',
                    'FFA rising in neutralisation — causes?',
                    'Caustic consumption 15% above theoretical',
                    'Soap content not dropping after washing'
                  ].map(s => (
                    <button key={s} onClick={() => setQuestion(s)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, border: '0.5px solid rgba(28,22,17,0.12)', background: '#F8F5EF', color: '#6B6056', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 16, display: 'flex', gap: 10, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(29,158,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 11, fontWeight: 700, color: G }}>K</span>
                  </div>
                )}
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: 10,
                  fontSize: 14, lineHeight: 1.7, fontWeight: 300,
                  background: m.role === 'user' ? G : '#F8F5EF',
                  color: m.role === 'user' ? '#fff' : '#1C1611',
                  whiteSpace: 'pre-wrap'
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
                <div style={{ fontSize: 13, color: '#A09285' }}>Claude is thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Stats bar */}
          {stats && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11, color: '#A09285', fontFamily: "'JetBrains Mono',monospace" }}>
              <span>RAG pairs found: {stats.ragPairsFound}</span>
              <span>Input tokens: ~{stats.inputTokensEstimate}</span>
              <span>Model: {stats.model}</span>
              <button onClick={() => setShowRag(!showRag)} style={{ marginLeft: 'auto', fontSize: 11, color: G, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {showRag ? 'Hide RAG context' : 'Show RAG context →'}
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={ask} style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder="Ask a process question..." value={question}
              onChange={e => setQuestion(e.target.value)} disabled={loading}
              style={{ ...inp, flex: 1 }} autoFocus />
            <button type="submit" disabled={loading || !question.trim()} style={{
              padding: '10px 20px', background: loading || !question.trim() ? '#A8D5C4' : G,
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
              fontWeight: 500, fontFamily: 'inherit', cursor: loading || !question.trim() ? 'not-allowed' : 'pointer'
            }}>
              {loading ? '...' : 'Ask'}
            </button>
          </form>
        </div>

        {/* RAG context panel */}
        {showRag && ragPairs.length > 0 && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,22,17,0.09)', borderRadius: 12, padding: 16, height: 'fit-content', position: 'sticky', top: 16 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#A09285', letterSpacing: '0.12em', marginBottom: 12 }}>RAG CONTEXT INJECTED</div>
            {ragPairs.map((p, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < ragPairs.length - 1 ? '0.5px solid rgba(28,22,17,0.06)' : 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#1C1611', marginBottom: 4, lineHeight: 1.4 }}>{p.question.substring(0, 100)}...</div>
                <div style={{ fontSize: 10, color: '#A09285', lineHeight: 1.5 }}>{p.answer.substring(0, 150)}...</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
