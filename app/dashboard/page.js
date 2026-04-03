'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const C = {
  bg:'#F8F5EF', bgCard:'#FFFFFF', bgAlt:'#F0EDE5',
  text:'#1C1611', textMid:'#6B6056', textLight:'#A09285',
  green:'#1D9E75', greenLight:'#EAF6F1', greenBorder:'rgba(29,158,117,0.2)',
  amber:'#B45309', amberLight:'#FEF8EE',
  border:'rgba(28,22,17,0.09)', borderMid:'rgba(28,22,17,0.14)',
}
const S = (x={}) => ({ fontFamily:"'Fraunces',Georgia,serif", ...x })
const M = (x={}) => ({ fontFamily:"'JetBrains Mono',monospace", ...x })
const D = (x={}) => ({ fontFamily:"'DM Sans',sans-serif", ...x })

function KPI({ label, value, unit, sub, color }) {
  return (
    <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'16px 18px' }}>
      <div style={{ ...M({ fontSize:9, color:C.textLight, letterSpacing:'0.12em', marginBottom:8 }) }}>{label.toUpperCase()}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:4 }}>
        <span style={{ ...S({ fontSize:28, fontWeight:700, color: color || C.text, lineHeight:1, letterSpacing:'-0.5px' }) }}>{value ?? '—'}</span>
        {unit && <span style={{ ...D({ fontSize:12, color:C.textLight }) }}>{unit}</span>}
      </div>
      {sub && <div style={{ ...D({ fontSize:11, color:C.textLight, lineHeight:1.4 }) }}>{sub}</div>}
    </div>
  )
}

function DocBadge({ category }) {
  const map = {
    lab_report:       { label:'Lab Report',   bg:'#EAF6F1', color:C.green },
    pid:              { label:'P&ID',          bg:'#E6F1FB', color:'#0C447C' },
    operations_manual:{ label:'Manual',        bg:C.amberLight, color:C.amber },
    equipment_spec:   { label:'Equipment',     bg:'#EEEDFE', color:'#534AB7' },
    photo:            { label:'Photo',         bg:C.bgAlt, color:C.textMid },
    other:            { label:'Document',      bg:C.bgAlt, color:C.textMid },
  }
  const s = map[category] || map.other
  return <span style={{ ...M({ fontSize:9, padding:'2px 8px', borderRadius:999, background:s.bg, color:s.color, letterSpacing:'0.06em' }) }}>{s.label.toUpperCase()}</span>
}

export default function Dashboard() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [readings, setReadings] = useState([])
  const [docs, setDocs] = useState([])
  const [aoBatches, setAoBatches] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [tab, setTab] = useState('intelligence')
  const chatRef = useRef(null)

  useEffect(() => { loadAll() }, [])
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])

  async function loadAll() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data: cl } = await supabase.from('clients').select('*').eq('auth_user_id', session.user.id).single()
    if (!cl) return
    setClient(cl)

    const [{ data: r }, { data: d }, { data: ao }] = await Promise.all([
      supabase.from('lab_readings').select('*').eq('client_id', cl.id).order('recorded_at', { ascending: false }).limit(10),
      supabase.from('client_files').select('file_name,doc_category,summary,processed,created_at').eq('client_id', cl.id).order('created_at', { ascending: false }),
      supabase.from('acidoil_batches').select('*').eq('client_id', cl.id).order('recorded_at', { ascending: false }).limit(5),
    ])
    setReadings(r || [])
    setDocs(d || [])
    setAoBatches(ao || [])
  }

  async function ask() {
    if (!input.trim() || asking) return
    const q = input.trim()
    setInput('')
    setAsking(true)
    setMessages(m => [...m, { role:'user', content:q }])
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/ask', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${session?.access_token}` },
        body: JSON.stringify({ message: q })
      })
      const data = await res.json()
      setMessages(m => [...m, { role:'assistant', content: data.answer || 'No response', has_doc_context: data.has_doc_context }])
    } catch(e) {
      setMessages(m => [...m, { role:'assistant', content:'Error getting response. Please try again.' }])
    }
    setAsking(false)
  }

  // Calculate KPIs from readings
  const latestReading = readings[0]
  const avgFFA = readings.length ? (readings.reduce((s,r) => s + (r.ffa_pct||0), 0) / readings.filter(r=>r.ffa_pct).length || 0).toFixed(2) : null
  const avgYield = readings.length ? (readings.reduce((s,r) => s + (r.yield_pct||0), 0) / readings.filter(r=>r.yield_pct).length || 0).toFixed(1) : null
  const processedDocs = docs.filter(d => d.processed && d.summary)
  const pendingDocs = docs.filter(d => !d.processed)

  const TABS = ['intelligence', 'readings', 'documents', 'chat']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:ital,wght@0,300;0,400;0,500&family=JetBrains+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#F8F5EF; color:#1C1611; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar { width:3px; } ::-webkit-scrollbar-thumb { background:rgba(28,22,17,0.12); }
        textarea:focus, input:focus { outline:none; }
        @media(max-width:768px){ .kpi-grid{grid-template-columns:1fr 1fr!important} }
      `}</style>

      {/* Nav */}
      <nav style={{ height:52, padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', background:C.bgCard, borderBottom:`0.5px solid ${C.border}`, position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div onClick={() => router.push('/')} style={{ cursor:'pointer' }}>
            <span style={{ ...S({ fontSize:17, fontWeight:700, color:C.text }) }}>Ken<span style={{ color:C.green }}>op</span></span>
          </div>
          {client && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:C.green }} />
              <span style={{ ...D({ fontSize:12, color:C.textMid }) }}>{client.name}</span>
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...D({ fontSize:12, padding:'5px 12px', borderRadius:6, border:'none', background: tab===t ? C.bgAlt : 'transparent', color: tab===t ? C.text : C.textLight, cursor:'pointer', fontWeight: tab===t ? 500 : 400 }) }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>

        {/* ── INTELLIGENCE TAB ── */}
        {tab === 'intelligence' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom:24 }}>
              <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.16em', marginBottom:6 }) }}>
                {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' }).toUpperCase()}
              </p>
              <h1 style={{ ...S({ fontSize:34, fontWeight:700, letterSpacing:'-0.5px', color:C.text, lineHeight:1.1 }) }}>
                {readings.length === 0 ? 'Waiting for plant data.' : 'Plant intelligence overview.'}
              </h1>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              <KPI label="Feed FFA" value={latestReading?.ffa_pct || avgFFA} unit="%" sub="Latest reading" color={latestReading?.ffa_pct > 3 ? C.amber : C.green} />
              <KPI label="Yield" value={avgYield} unit="%" sub={`${readings.filter(r=>r.yield_pct).length} readings`} color={C.green} />
              <KPI label="Lab readings" value={readings.length} sub="In system" color={C.text} />
              <KPI label="Documents" value={processedDocs.length} sub={pendingDocs.length > 0 ? `${pendingDocs.length} processing` : 'Indexed'} color={C.text} />
            </div>

            {/* Document Intelligence */}
            {processedDocs.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ ...M({ fontSize:9, color:C.textLight, letterSpacing:'0.14em', marginBottom:10 }) }}>PLANT INTELLIGENCE FROM YOUR DOCUMENTS</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {processedDocs.slice(0,5).map((doc, i) => (
                    <div key={i} style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
                      <div style={{ flexShrink:0, marginTop:2 }}><DocBadge category={doc.doc_category} /></div>
                      <div>
                        <div style={{ ...D({ fontSize:12, fontWeight:500, color:C.text, marginBottom:3 }) }}>{doc.file_name}</div>
                        <div style={{ ...D({ fontSize:12, color:C.textMid, lineHeight:1.6, fontWeight:300 }) }}>{doc.summary}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {readings.length === 0 && processedDocs.length === 0 && (
              <div style={{ background:C.amberLight, border:`0.5px solid rgba(180,83,9,0.2)`, borderRadius:12, padding:'24px 28px' }}>
                <div style={{ ...M({ fontSize:10, color:C.amber, letterSpacing:'0.12em', marginBottom:10 }) }}>DATA SETUP IN PROGRESS</div>
                <h2 style={{ ...S({ fontSize:22, fontWeight:600, color:C.text, marginBottom:10, letterSpacing:'-0.3px' }) }}>Your documents are being indexed.</h2>
                <p style={{ ...D({ fontSize:14, color:C.textMid, lineHeight:1.7, fontWeight:300, marginBottom:16 }) }}>
                  Kenop is processing your uploaded files — PID diagrams, equipment specs, operations manual, and lab reports. Once indexed, the AI will reference them in every answer. This takes 2–5 minutes per document.
                </p>
                <p style={{ ...D({ fontSize:13, color:C.textMid, lineHeight:1.7, fontWeight:300 }) }}>
                  While waiting, try the <button onClick={() => setTab('chat')} style={{ background:'none', border:'none', color:C.green, cursor:'pointer', fontSize:13, textDecoration:'underline', ...D() }}>AI chat</button> — it already has context from what has been processed so far.
                </p>
              </div>
            )}

            {/* Latest readings table */}
            {readings.length > 0 && (
              <div>
                <div style={{ ...M({ fontSize:9, color:C.textLight, letterSpacing:'0.14em', marginBottom:10 }) }}>RECENT LAB READINGS</div>
                <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ background:C.bgAlt }}>
                        {['Date','FFA %','Temp °C','Colour','Yield %','Moisture %','Source'].map(h => (
                          <th key={h} style={{ ...D({ padding:'8px 14px', textAlign:'left', color:C.textLight, fontWeight:400 }) }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {readings.slice(0,8).map((r, i) => (
                        <tr key={i} style={{ borderTop:`0.5px solid ${C.border}` }}>
                          <td style={{ ...M({ padding:'8px 14px', color:C.textMid, fontSize:11 }) }}>{r.recorded_at?.slice(0,10) || '—'}</td>
                          <td style={{ ...D({ padding:'8px 14px', color: r.ffa_pct > 3 ? C.amber : C.text, fontWeight: r.ffa_pct > 3 ? 500 : 400 }) }}>{r.ffa_pct ?? '—'}</td>
                          <td style={{ ...D({ padding:'8px 14px', color:C.text }) }}>{r.temp_c ?? '—'}</td>
                          <td style={{ ...D({ padding:'8px 14px', color:C.text }) }}>{r.colour_lovibond ?? '—'}</td>
                          <td style={{ ...D({ padding:'8px 14px', color:C.text }) }}>{r.yield_pct ?? '—'}</td>
                          <td style={{ ...D({ padding:'8px 14px', color:C.text }) }}>{r.moisture_pct ?? '—'}</td>
                          <td style={{ ...M({ padding:'8px 14px', fontSize:10, color:C.textLight }) }}>{r.source || 'manual'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── READINGS TAB ── */}
        {tab === 'readings' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.16em', marginBottom:6 }) }}>LAB READINGS</p>
              <h1 style={{ ...S({ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', color:C.text }) }}>All recorded readings</h1>
            </div>
            {readings.length === 0 ? (
              <div style={{ ...D({ fontSize:14, color:C.textMid, padding:'40px 0', textAlign:'center' }) }}>
                No readings yet. Data arrives automatically via Excel macro or WhatsApp.
              </div>
            ) : (
              <div style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr style={{ background:C.bgAlt }}>
                      {['Date','Batch','FFA %','Temp °C','Colour','Yield %','Moisture %','Soap ppm','Source'].map(h => (
                        <th key={h} style={{ ...D({ padding:'9px 14px', textAlign:'left', color:C.textLight, fontWeight:400 }) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((r, i) => (
                      <tr key={i} style={{ borderTop:`0.5px solid ${C.border}` }}>
                        <td style={{ ...M({ padding:'9px 14px', color:C.textMid, fontSize:11 }) }}>{r.recorded_at?.slice(0,10)}</td>
                        <td style={{ ...M({ padding:'9px 14px', color:C.textLight, fontSize:11 }) }}>{r.batch_id?.slice(0,12) || '—'}</td>
                        <td style={{ ...D({ padding:'9px 14px', color: r.ffa_pct > 3 ? C.amber : C.text, fontWeight: r.ffa_pct > 3 ? 500 : 400 }) }}>{r.ffa_pct ?? '—'}</td>
                        <td style={{ ...D({ padding:'9px 14px' }) }}>{r.temp_c ?? '—'}</td>
                        <td style={{ ...D({ padding:'9px 14px' }) }}>{r.colour_lovibond ?? '—'}</td>
                        <td style={{ ...D({ padding:'9px 14px' }) }}>{r.yield_pct ?? '—'}</td>
                        <td style={{ ...D({ padding:'9px 14px' }) }}>{r.moisture_pct ?? '—'}</td>
                        <td style={{ ...D({ padding:'9px 14px' }) }}>{r.soap_ppm ?? '—'}</td>
                        <td style={{ ...M({ padding:'9px 14px', fontSize:10, color:C.textLight }) }}>{r.source || 'manual'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {tab === 'documents' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.16em', marginBottom:6 }) }}>PLANT DOCUMENTS</p>
              <h1 style={{ ...S({ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', color:C.text }) }}>Indexed plant knowledge</h1>
            </div>
            {docs.length === 0 ? (
              <div style={{ ...D({ fontSize:14, color:C.textMid, padding:'40px 0', textAlign:'center' }) }}>No documents indexed yet.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {docs.map((doc, i) => (
                  <div key={i} style={{ background:C.bgCard, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'16px 18px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:doc.summary ? 8 : 0 }}>
                      <DocBadge category={doc.doc_category} />
                      <span style={{ ...D({ fontSize:13, fontWeight:500, color:C.text, flex:1 }) }}>{doc.file_name}</span>
                      <span style={{ ...M({ fontSize:9, color: doc.processed ? C.green : C.amber }) }}>
                        {doc.processed ? '✓ INDEXED' : '⟳ PROCESSING'}
                      </span>
                    </div>
                    {doc.summary && <p style={{ ...D({ fontSize:12, color:C.textMid, lineHeight:1.65, fontWeight:300 }) }}>{doc.summary}</p>}
                    {!doc.summary && !doc.processed && (
                      <p style={{ ...D({ fontSize:12, color:C.textLight, fontStyle:'italic' }) }}>Extracting content — will be available shortly.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CHAT TAB ── */}
        {tab === 'chat' && (
          <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 160px)' }}>
            <div style={{ marginBottom:16 }}>
              <p style={{ ...M({ fontSize:10, color:C.textLight, letterSpacing:'0.16em', marginBottom:4 }) }}>KENOP INTELLIGENCE</p>
              <h1 style={{ ...S({ fontSize:26, fontWeight:700, letterSpacing:'-0.3px', color:C.text }) }}>Ask about your plant</h1>
            </div>

            {/* Suggested questions */}
            {messages.length === 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                {[
                  'What does my P&ID show about the neutralisation section?',
                  'What is the typical FFA in my feed based on reports?',
                  'What do my acid oil reports show?',
                  'What equipment specs do you have for my plant?',
                ].map((q, i) => (
                  <button key={i} onClick={() => { setInput(q); }} style={{ ...D({ fontSize:12, padding:'7px 14px', border:`0.5px solid ${C.border}`, borderRadius:999, background:C.bgCard, color:C.textMid, cursor:'pointer' }) }}>{q}</button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div ref={chatRef} style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, marginBottom:12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth:'75%', padding:'12px 16px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: m.role === 'user' ? C.green : C.bgCard, border: m.role === 'user' ? 'none' : `0.5px solid ${C.border}` }}>
                    <p style={{ ...D({ fontSize:13, color: m.role === 'user' ? '#fff' : C.text, lineHeight:1.65 }) }}>{m.content}</p>
                    {m.has_doc_context && <p style={{ ...M({ fontSize:9, color: m.role === 'user' ? 'rgba(255,255,255,0.6)' : C.green, marginTop:6 }) }}>✓ REFERENCED YOUR PLANT DOCUMENTS</p>}
                  </div>
                </div>
              ))}
              {asking && (
                <div style={{ display:'flex', justifyContent:'flex-start' }}>
                  <div style={{ padding:'12px 16px', borderRadius:'12px 12px 12px 2px', background:C.bgCard, border:`0.5px solid ${C.border}` }}>
                    <span style={{ ...M({ fontSize:12, color:C.textLight }) }}>Analysing your plant data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ display:'flex', gap:8, background:C.bgCard, border:`0.5px solid ${C.borderMid}`, borderRadius:10, padding:'8px 8px 8px 16px' }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask()}
                placeholder="Ask about your process, readings, equipment..."
                style={{ flex:1, border:'none', background:'transparent', fontSize:14, color:C.text, ...D() }}
              />
              <button onClick={ask} disabled={asking || !input.trim()} style={{ ...D({ fontSize:13, fontWeight:500, padding:'8px 18px', background: asking || !input.trim() ? C.bgAlt : C.green, color: asking || !input.trim() ? C.textLight : '#fff', border:'none', borderRadius:7, cursor: asking || !input.trim() ? 'not-allowed' : 'pointer' }) }}>
                {asking ? '...' : 'Ask →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
