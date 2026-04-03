'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STATUS = {
  good: { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)', label: 'Normal' },
  warn: { color: '#E6A817', bg: 'rgba(230,168,23,0.1)', label: 'Watch' },
  bad:  { color: '#F85149', bg: 'rgba(248,81,73,0.1)',  label: 'Act now' },
}

function getStatus(key, val) {
  if (val === null || val === undefined || val === '') return null
  const v = parseFloat(val)
  const rules = {
    neutral_oil_ffa_pct:      v < 0.1 ? 'good' : v < 0.15 ? 'warn' : 'bad',
    soap_ppm_post_separator:  v < 30  ? 'good' : v < 60   ? 'warn' : 'bad',
    refining_loss_pct:        v < 0.5 ? 'good' : v < 0.8  ? 'warn' : 'bad',
    separator_feed_temp_degc: v >= 85 && v <= 92 ? 'good' : v >= 80 ? 'warn' : 'bad',
  }
  return rules[key] || null
}

const KPI_DEFS = [
  { key: 'refining_loss_pct',        label: 'Refining loss',      unit: '%',   mono: true },
  { key: 'neutral_oil_ffa_pct',      label: 'Neutral oil FFA',    unit: '%',   mono: true },
  { key: 'soap_ppm_post_separator',  label: 'Soap post-separator',unit: 'ppm', mono: true },
  { key: 'separator_feed_temp_degc', label: 'Separator temp',     unit: '°C',  mono: true },
]

export default function Dashboard() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [client, setClient] = useState(null)
  const [readings, setReadings] = useState([])
  const [prices, setPrices] = useState({ acid_oil: 45, edible_oil: 90 })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [now, setNow] = useState(new Date())
  const [priceEdit, setPriceEdit] = useState(false)
  const [editPrices, setEditPrices] = useState({})
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setSession(session)
      loadClient(session)
    })
  }, [])

  async function loadClient(sess) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('auth_user_id', sess.user.id)
      .single()
    if (data) setClient(data)

    const { data: r } = await supabase
      .from('lab_readings')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(20)
    if (r) setReadings(r)

    const { data: mp } = await supabase
      .from('market_prices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (mp) setPrices({ acid_oil: mp.acid_oil_price_per_kg, edible_oil: mp.edible_oil_price_per_kg })
  }

  // Chat
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          question: text,
          vertical: client?.vertical || 'edible_oil',
          clientId: client?.id
        })
      })
      const data = await res.json()
      const msg = { role: 'assistant', text: data.answer || data.response || 'No response' }
      setMessages(prev => [...prev, msg])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error. Please try again.' }])
    }
    setLoading(false)
  }, [input, loading, session, client])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const latestReading = readings[0] || {}
  const acidOilValue = prices.acid_oil + 40
  const dfa = acidOilValue

  async function savePrice() {
    await supabase.from('market_prices').insert({
      acid_oil_price_per_kg: parseFloat(editPrices.acid_oil) || prices.acid_oil,
      edible_oil_price_per_kg: parseFloat(editPrices.edible_oil) || prices.edible_oil,
      updated_by: session?.user?.email
    })
    setPrices({
      acid_oil: parseFloat(editPrices.acid_oil) || prices.acid_oil,
      edible_oil: parseFloat(editPrices.edible_oil) || prices.edible_oil
    })
    setPriceEdit(false)
  }

  const shift = now.getHours() < 8 ? 'Night' : now.getHours() < 16 ? 'Morning' : 'Evening'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0D1117;color:#E6EDF3;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        textarea,input{outline:none;font-family:inherit}
        button{font-family:inherit;cursor:pointer}
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#0D1117' }}>

        {/* TOP BAR */}
        <header style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 24px', height:52,
          background:'#0D1117',
          borderBottom:'0.5px solid rgba(255,255,255,0.06)',
          position:'sticky', top:0, zIndex:100
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              <span style={{ fontSize:11, color:'rgba(29,158,117,0.5)', letterSpacing:'0.2em', fontFamily:"'JetBrains Mono',monospace", fontWeight:300 }}>अथ</span>
              <span style={{ fontSize:16, fontWeight:600, letterSpacing:'0.08em', color:'#E6EDF3' }}>KEN<span style={{ color:'#1D9E75' }}>OP</span></span>
            </div>
            <div style={{ width:'0.5px', height:24, background:'rgba(255,255,255,0.08)' }} />
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              <span style={{ fontSize:13, fontWeight:500, color:'#E6EDF3' }}>{client?.name || 'Loading...'}</span>
              <span style={{ fontSize:11, color:'#7D8590' }}>{client?.location || ''}</span>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{
                width:6, height:6, borderRadius:'50%', background:'#1D9E75',
                boxShadow:'0 0 8px rgba(29,158,117,0.6)',
                animation:'pulse 2.5s ease infinite'
              }} />
              <span style={{ fontSize:11, color:'#7D8590', fontFamily:"'JetBrains Mono',monospace" }}>LIVE</span>
            </div>
            <span style={{ fontSize:11, color:'#7D8590', fontFamily:"'JetBrains Mono',monospace" }}>
              {shift} shift · {now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
            </span>
            <button
              onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
              style={{ fontSize:12, color:'#7D8590', background:'none', border:'none', cursor:'pointer', padding:'4px 8px' }}
            >Sign out</button>
          </div>
        </header>

        <style>{`
          @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 8px rgba(29,158,117,0.6)}50%{opacity:0.7;box-shadow:0 0 16px rgba(29,158,117,0.3)}}
          @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @media(max-width:768px){.main-grid{flex-direction:column!important}.chat-panel{position:fixed!important;bottom:0!important;left:0!important;right:0!important;height:60vh!important;border-radius:16px 16px 0 0!important;display:none}.chat-panel.open{display:flex!important}.chat-fab{display:flex!important}}
        `}</style>

        <main style={{ flex:1, padding:'20px 24px', maxWidth:1400, margin:'0 auto', width:'100%' }}>

          {/* KPI CARDS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            {KPI_DEFS.map(kpi => {
              const val = latestReading[kpi.key]
              const status = getStatus(kpi.key, val)
              const s = status ? STATUS[status] : null
              return (
                <div key={kpi.key} style={{
                  background:'#161B22',
                  border:`0.5px solid ${s ? s.color + '30' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius:10, padding:'16px 20px',
                  animation:'fadeIn 0.4s ease'
                }}>
                  <div style={{ fontSize:11, color:'#7D8590', marginBottom:10, letterSpacing:'0.02em' }}>{kpi.label}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8 }}>
                    <span style={{
                      fontSize:28, fontWeight:500,
                      fontFamily:"'JetBrains Mono',monospace",
                      color: s ? s.color : '#E6EDF3'
                    }}>
                      {val !== undefined && val !== null && val !== '' ? parseFloat(val).toFixed(2) : '—'}
                    </span>
                    <span style={{ fontSize:12, color:'#7D8590', fontFamily:"'JetBrains Mono',monospace" }}>{kpi.unit}</span>
                  </div>
                  {s && (
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:s.color }} />
                      <span style={{ fontSize:10, color:s.color, letterSpacing:'0.08em' }}>{s.label.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* MARKET PRICES + FINANCIALS */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
            {[
              { label:'Acid oil', value:`₹${prices.acid_oil}/kg`, sub:'Market price', color:'#E6EDF3' },
              { label:'DFA value', value:`₹${dfa}/kg`, sub:'Acid oil + ₹40', color:'#1D9E75' },
              { label:'Edible oil', value:`₹${prices.edible_oil}/kg`, sub:'Refined price', color:'#E6EDF3' },
            ].map((item, i) => (
              <div key={i} style={{
                background:'#161B22', border:'0.5px solid rgba(255,255,255,0.06)',
                borderRadius:10, padding:'14px 20px',
                display:'flex', justifyContent:'space-between', alignItems:'center'
              }}>
                <div>
                  <div style={{ fontSize:11, color:'#7D8590', marginBottom:6 }}>{item.label}</div>
                  <div style={{ fontSize:20, fontWeight:500, color:item.color, fontFamily:"'JetBrains Mono',monospace" }}>{item.value}</div>
                  <div style={{ fontSize:10, color:'#7D8590', marginTop:3 }}>{item.sub}</div>
                </div>
                {i === 0 && (
                  <button onClick={() => { setPriceEdit(true); setEditPrices({ acid_oil: prices.acid_oil, edible_oil: prices.edible_oil }) }}
                    style={{ fontSize:11, color:'#7D8590', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'5px 10px' }}>
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* PRICE EDIT MODAL */}
          {priceEdit && (
            <div style={{
              position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200,
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              <div style={{ background:'#161B22', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:12, padding:28, width:320 }}>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:20 }}>Update market prices</div>
                {['acid_oil','edible_oil'].map(k => (
                  <div key={k} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:11, color:'#7D8590', display:'block', marginBottom:6 }}>
                      {k === 'acid_oil' ? 'Acid oil (₹/kg)' : 'Edible oil (₹/kg)'}
                    </label>
                    <input
                      type="number" step="0.5"
                      value={editPrices[k]}
                      onChange={e => setEditPrices(p => ({ ...p, [k]: e.target.value }))}
                      style={{
                        width:'100%', background:'#0D1117', border:'0.5px solid rgba(255,255,255,0.1)',
                        borderRadius:6, padding:'8px 12px', color:'#E6EDF3', fontSize:14,
                        fontFamily:"'JetBrains Mono',monospace"
                      }}
                    />
                  </div>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <button onClick={savePrice} style={{
                    flex:1, padding:'9px', background:'#1D9E75', border:'none',
                    borderRadius:7, color:'#fff', fontSize:13, fontWeight:500
                  }}>Save</button>
                  <button onClick={() => setPriceEdit(false)} style={{
                    flex:1, padding:'9px', background:'rgba(255,255,255,0.04)',
                    border:'0.5px solid rgba(255,255,255,0.08)',
                    borderRadius:7, color:'#7D8590', fontSize:13
                  }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN GRID: READINGS + CHAT */}
          <div className="main-grid" style={{ display:'flex', gap:16, alignItems:'flex-start' }}>

            {/* LEFT: READINGS TABLE */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                background:'#161B22', border:'0.5px solid rgba(255,255,255,0.06)',
                borderRadius:10, overflow:'hidden'
              }}>
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'14px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.06)'
                }}>
                  <span style={{ fontSize:13, fontWeight:500 }}>Recent readings</span>
                  <div style={{ display:'flex', gap:8 }}>
                    <a href="/lab" style={{
                      fontSize:11, color:'#1D9E75',
                      background:'rgba(29,158,117,0.1)', border:'0.5px solid rgba(29,158,117,0.2)',
                      borderRadius:6, padding:'5px 12px', textDecoration:'none'
                    }}>+ Add reading</a>
                    <a href="/documents" style={{
                      fontSize:11, color:'#7D8590',
                      background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)',
                      borderRadius:6, padding:'5px 12px', textDecoration:'none'
                    }}>Documents</a>
                  </div>
                </div>

                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
                        {['Time', 'FFA %', 'Soap ppm', 'Ref. loss %', 'Sep. temp °C', 'Status'].map(h => (
                          <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:'#7D8590', fontWeight:400, whiteSpace:'nowrap', fontSize:11 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {readings.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding:'32px 16px', textAlign:'center', color:'#7D8590', fontSize:12 }}>
                          No readings yet — <a href="/lab" style={{ color:'#1D9E75' }}>add the first one</a>
                        </td></tr>
                      ) : readings.slice(0, 10).map((r, i) => {
                        const overallStatus = ['refining_loss_pct','neutral_oil_ffa_pct','soap_ppm_post_separator','separator_feed_temp_degc']
                          .map(k => getStatus(k, r[k])).filter(Boolean)
                        const worst = overallStatus.includes('bad') ? 'bad' : overallStatus.includes('warn') ? 'warn' : 'good'
                        const s = overallStatus.length ? STATUS[worst] : null
                        return (
                          <tr key={r.id} style={{
                            borderBottom:'0.5px solid rgba(255,255,255,0.04)',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                            animation:`fadeIn ${0.1 + i * 0.05}s ease`
                          }}>
                            <td style={{ padding:'10px 16px', color:'#7D8590', fontFamily:"'JetBrains Mono',monospace", fontSize:11, whiteSpace:'nowrap' }}>
                              {new Date(r.recorded_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                            </td>
                            {[
                              r.neutral_oil_ffa_pct,
                              r.soap_ppm_post_separator,
                              r.refining_loss_pct,
                              r.separator_feed_temp_degc,
                            ].map((val, j) => {
                              const keys = ['neutral_oil_ffa_pct','soap_ppm_post_separator','refining_loss_pct','separator_feed_temp_degc']
                              const st = getStatus(keys[j], val)
                              return (
                                <td key={j} style={{
                                  padding:'10px 16px',
                                  fontFamily:"'JetBrains Mono',monospace",
                                  color: st ? STATUS[st].color : '#7D8590'
                                }}>
                                  {val !== null && val !== undefined ? parseFloat(val).toFixed(2) : '—'}
                                </td>
                              )
                            })}
                            <td style={{ padding:'10px 16px' }}>
                              {s ? (
                                <span style={{
                                  fontSize:10, padding:'2px 8px', borderRadius:999,
                                  background:s.bg, color:s.color, letterSpacing:'0.06em'
                                }}>{s.label}</span>
                              ) : <span style={{ color:'#7D8590', fontSize:11 }}>—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QUICK LINKS */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
                {[
                  { label:'Process assessment', sub:'Upload data, get report', href:'/documents', color:'#1D9E75' },
                  { label:'Acid oil batches', sub:'Track batch processing', href:'/acidoil', color:'#7D8590' },
                ].map(item => (
                  <a key={item.href} href={item.href} style={{
                    display:'block', textDecoration:'none',
                    background:'#161B22', border:'0.5px solid rgba(255,255,255,0.06)',
                    borderRadius:10, padding:'16px 20px',
                    transition:'border-color 0.15s'
                  }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'#E6EDF3', marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontSize:11, color:'#7D8590' }}>{item.sub}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* RIGHT: CHAT PANEL */}
            <div className="chat-panel" style={{
              width:360, flexShrink:0,
              background:'#161B22', border:'0.5px solid rgba(255,255,255,0.06)',
              borderRadius:10, display:'flex', flexDirection:'column',
              height:'calc(100vh - 200px)', maxHeight:700, minHeight:400,
              position:'sticky', top:68
            }}>
              {/* Chat header */}
              <div style={{
                padding:'14px 18px', borderBottom:'0.5px solid rgba(255,255,255,0.06)',
                display:'flex', alignItems:'center', gap:10
              }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#1D9E75', boxShadow:'0 0 8px rgba(29,158,117,0.5)' }} />
                <span style={{ fontSize:13, fontWeight:500 }}>Ask Kenop</span>
                <span style={{ marginLeft:'auto', fontSize:10, color:'#7D8590', fontFamily:"'JetBrains Mono',monospace" }}>
                  {client?.vertical === 'biodiesel' ? 'Biodiesel' : 'Edible oil'} · AI
                </span>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
                {messages.length === 0 && (
                  <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:16 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:13, color:'#7D8590', marginBottom:16 }}>Ask anything about your process</div>
                      {[
                        'Why is my refining loss high today?',
                        'What should my separator temperature be?',
                        'How do I reduce soap in neutral oil?'
                      ].map(q => (
                        <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
                          style={{
                            display:'block', width:'100%', textAlign:'left',
                            background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.06)',
                            borderRadius:8, padding:'10px 14px', marginBottom:8,
                            color:'#7D8590', fontSize:12, cursor:'pointer',
                            transition:'background 0.15s, color 0.15s'
                          }}
                          onMouseEnter={e => { e.target.style.background='rgba(29,158,117,0.08)'; e.target.style.color='#E6EDF3' }}
                          onMouseLeave={e => { e.target.style.background='rgba(255,255,255,0.03)'; e.target.style.color='#7D8590' }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display:'flex', flexDirection:'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    animation:'fadeIn 0.2s ease'
                  }}>
                    <div style={{
                      maxWidth:'88%', padding:'10px 14px', borderRadius:10,
                      fontSize:13, lineHeight:1.6,
                      background: msg.role === 'user' ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `0.5px solid ${msg.role === 'user' ? 'rgba(29,158,117,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      color: msg.role === 'user' ? '#E6EDF3' : '#C9D1D9',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ display:'flex', gap:4 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width:5, height:5, borderRadius:'50%', background:'#1D9E75',
                          animation:`pulse ${0.6 + i * 0.2}s ease infinite`,
                          animationDelay:`${i * 0.15}s`
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize:11, color:'#7D8590' }}>Thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding:'12px', borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{
                  display:'flex', gap:8, alignItems:'flex-end',
                  background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)',
                  borderRadius:8, padding:'8px 12px'
                }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Ask about your process..."
                    rows={1}
                    style={{
                      flex:1, background:'transparent', border:'none',
                      color:'#E6EDF3', fontSize:13, lineHeight:1.5, resize:'none',
                      fontFamily:"'DM Sans',sans-serif", maxHeight:100, overflowY:'auto'
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    style={{
                      width:30, height:30, borderRadius:7, border:'none', flexShrink:0,
                      background: loading || !input.trim() ? 'rgba(255,255,255,0.06)' : '#1D9E75',
                      color: loading || !input.trim() ? '#7D8590' : '#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, transition:'background 0.15s'
                    }}
                  >↑</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* MOBILE FAB */}
        <button className="chat-fab" onClick={() => setChatOpen(!chatOpen)} style={{
          display:'none', position:'fixed', bottom:24, right:24, zIndex:150,
          width:52, height:52, borderRadius:'50%', border:'none',
          background:'#1D9E75', color:'#fff', fontSize:20,
          boxShadow:'0 4px 20px rgba(29,158,117,0.4)',
          alignItems:'center', justifyContent:'center'
        }}>💬</button>

        {/* FOOTER */}
        <footer style={{
          padding:'14px 24px',
          borderTop:'0.5px solid rgba(255,255,255,0.04)',
          display:'flex', justifyContent:'center'
        }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.12)', letterSpacing:'0.25em', fontFamily:"'JetBrains Mono',monospace" }}>
            E SHAKTI BINARY CURRENTS P LTD
          </span>
        </footer>

      </div>
    </>
  )
}