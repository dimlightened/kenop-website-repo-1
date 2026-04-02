'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const SOURCE_LABELS = {
  adapter: { label: 'Domain expert', color: '#085041', bg: '#E1F5EE' },
  groq:    { label: 'Market intelligence', color: '#042C53', bg: '#E6F1FB' },
  claude:  { label: 'Advanced analysis', color: '#412402', bg: '#FAEEDA' },
}

const SUGGESTIONS = [
  'Why is my post-separator soap high?',
  'What is my neutralisation efficiency?',
  'How much oil am I losing per month?',
  'What is my acid oil value addition opportunity?',
]

function UploadSection({ clientId }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const upload = async () => {
    if (!file) return
    setUploading(true)
    const filename = `${clientId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error } = await supabase.storage.from('plant-photos').upload(`submissions/${filename}`, file)
    setUploading(false)
    if (!error) setUploaded(true)
  }

  if (uploaded) return (
    <div style={{background:'#E1F5EE',padding:'8px 12px',borderRadius:6,fontSize:12,color:'#085041'}}>
      ✅ Uploaded — team will review within 24 hours
    </div>
  )

  return (
    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
      <input type="file" accept=".xlsx,.xls,.pdf" onChange={e=>setFile(e.target.files[0])}
        style={{fontSize:12,color:'#333'}}/>
      {file && (
        <button onClick={upload} disabled={uploading}
          style={{padding:'6px 14px',background:'#1D9E75',color:'white',border:'none',
          borderRadius:6,fontSize:12,cursor:'pointer'}}>
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [client, setClient] = useState(null)
  const [readings, setReadings] = useState([])
  const [acidBatches, setAcidBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const bottomRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      const { data: clientData } = await supabase
        .from('clients').select('*').eq('auth_user_id', session.user.id).single()
      if (!clientData) { router.push('/lab'); return }
      setClient(clientData)

      const [{ data: r }, { data: a }, { data: convs }] = await Promise.all([
        supabase.from('lab_readings').select('*').eq('client_id', clientData.id)
          .order('recorded_at', { ascending: false }).limit(30),
        supabase.from('acidoil_batches').select('*').eq('client_id', clientData.id)
          .order('created_at', { ascending: false }).limit(10),
        supabase.from('conversations').select('*').eq('client_id', clientData.id)
          .order('created_at', { ascending: true }).limit(50)
      ])

      setReadings(r || [])
      setAcidBatches(a || [])
      if (convs && convs.length > 0) {
        setMessages(convs.map(c => ({
          role: c.role, text: c.message, source: c.source, query_type: c.query_type
        })))
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatOpen])

  const ask = async (q) => {
    const text = q || question
    if (!text.trim() || asking) return
    setQuestion('')
    setAsking(true)
    setChatOpen(true)

    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ question: text })
      })
      const data = await res.json()
      const assistantMsg = { role: 'assistant', text: data.answer, source: data.source, query_type: data.query_type }
      setMessages(prev => [...prev, assistantMsg])

      // Save to Supabase
      await supabase.from('conversations').insert([
        { client_id: client.id, role: 'user', message: text },
        { client_id: client.id, role: 'assistant', message: data.answer, source: data.source, query_type: data.query_type }
      ])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }])
    }
    setAsking(false)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const latest = readings[0]
  const tpd = client?.throughput_tpd || 350
  const sepEff = latest?.soap_ppm_pre_separator && latest?.soap_ppm_post_separator
    ? (((latest.soap_ppm_pre_separator - latest.soap_ppm_post_separator) / latest.soap_ppm_pre_separator) * 100).toFixed(1)
    : null

  const sc = (v, g, w) => !v ? '#888' : v <= g ? '#1D9E75' : v <= w ? '#BA7517' : '#C0392B'
  const sb = (v, g, w) => !v ? '#F4F6F8' : v <= g ? '#E1F5EE' : v <= w ? '#FAEEDA' : '#FDECEA'

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#F4F6F8',fontFamily:'sans-serif',color:'#888'}}>Loading...</div>
  )

  // ── Chat panel (shared between desktop right and mobile overlay) ──
  const ChatPanel = ({ mobile }) => (
    <div style={{
      display:'flex',flexDirection:'column',height:'100%',
      background:'white',
      ...(mobile ? {} : { borderLeft:'1px solid #eee' })
    }}>
      {/* Chat header */}
      <div style={{padding:'12px 16px',borderBottom:'1px solid #f0f0f0',
        display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:'#1B2A4A'}}>Ask Kenop</div>
          <div style={{fontSize:11,color:'#aaa'}}>Domain · Market · Reports</div>
        </div>
        {mobile && (
          <button onClick={()=>setChatOpen(false)}
            style={{background:'none',border:'1px solid #ddd',padding:'4px 10px',
            borderRadius:6,cursor:'pointer',fontSize:12,color:'#888'}}>
            Dashboard
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'12px',display:'flex',flexDirection:'column',gap:10}}>
        {messages.length === 0 && (
          <div>
            <div style={{textAlign:'center',padding:'16px 0 12px',color:'#aaa',fontSize:13}}>
              Ask about your process or market
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={()=>ask(s)}
                  style={{padding:'8px 12px',background:'#F4F6F8',border:'none',
                  borderRadius:8,cursor:'pointer',fontSize:12,color:'#333',textAlign:'left'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{display:'flex',flexDirection:'column',
            alignItems: m.role==='user' ? 'flex-end' : 'flex-start'}}>
            {m.role === 'user' ? (
              <div style={{background:'#1B2A4A',color:'white',padding:'8px 12px',
                borderRadius:'10px 10px 2px 10px',maxWidth:'85%',fontSize:13,lineHeight:1.5}}>
                {m.text}
              </div>
            ) : (
              <div style={{maxWidth:'95%'}}>
                <div style={{background:'#F4F6F8',padding:'10px 12px',
                  borderRadius:'2px 10px 10px 10px',fontSize:13,lineHeight:1.7,
                  color:'#222',whiteSpace:'pre-wrap'}}>
                  {m.text}
                </div>
                {m.source && SOURCE_LABELS[m.source] && (
                  <span style={{fontSize:10,padding:'2px 6px',borderRadius:20,marginTop:4,display:'inline-block',
                    background:SOURCE_LABELS[m.source].bg,color:SOURCE_LABELS[m.source].color}}>
                    {SOURCE_LABELS[m.source].label}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {asking && (
          <div style={{display:'flex',gap:4,padding:'8px 0'}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#1D9E75',
                animation:`bounce 1.2s ${i*0.2}s infinite`}}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'10px 12px',borderTop:'1px solid #f0f0f0',flexShrink:0}}>
        <div style={{display:'flex',gap:8}}>
          <input value={question} onChange={e=>setQuestion(e.target.value)}
            onKeyDown={e=>e.key==='Enter' && ask()}
            placeholder="Ask anything about your plant..."
            style={{flex:1,padding:'8px 12px',fontSize:13,border:'1px solid #ddd',
            borderRadius:8,outline:'none',color:'#222',background:'white'}}/>
          <button onClick={()=>ask()} disabled={asking || !question.trim()}
            style={{padding:'8px 16px',background: question.trim() ? '#1D9E75':'#ccc',
            color:'white',border:'none',borderRadius:8,fontSize:13,
            cursor: question.trim() ? 'pointer':'not-allowed',fontWeight:600}}>
            Ask
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F4F6F8',fontFamily:'sans-serif',display:'flex',flexDirection:'column'}}>

      {/* Header */}
      <div style={{background:'#1B2A4A',padding:'14px 20px',flexShrink:0,
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'white',fontWeight:700,fontSize:16}}>Kenop Intelligence</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {/* Mobile chat toggle */}
          <button onClick={()=>setChatOpen(c=>!c)}
            style={{background: chatOpen ? '#1D9E75' : 'rgba(255,255,255,0.15)',
            border:'none',color:'white',padding:'6px 12px',borderRadius:6,
            cursor:'pointer',fontSize:12,display:'none'}}
            className="mobile-chat-btn">
            {chatOpen ? '← Dashboard' : 'Ask Kenop'}
          </button>
          <button onClick={logout}
            style={{background:'none',border:'1px solid #555',color:'#ccc',
            padding:'5px 12px',borderRadius:6,cursor:'pointer',fontSize:12}}>
            Sign out
          </button>
        </div>
      </div>

      {/* Body — desktop: side by side, mobile: stacked */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        {/* ── LEFT: Dashboard ── */}
        <div style={{flex:1,overflowY:'auto',padding:'16px',minWidth:0}}
          className={chatOpen ? 'hide-mobile' : ''}>

          {/* Plant card */}
          <div style={{background:'white',borderRadius:12,padding:16,
            boxShadow:'0 2px 8px rgba(0,0,0,0.05)',marginBottom:12}}>
            <div style={{fontSize:11,color:'#1D9E75',fontWeight:700,
              textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Your plant</div>
            <div style={{fontSize:17,fontWeight:600,color:'#1B2A4A',marginBottom:2}}>{client.name}</div>
            <div style={{fontSize:12,color:'#888',marginBottom:12}}>
              {client.location} · {client.feedstock_primary} · {client.throughput_tpd} TPD
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[
                ['+ Lab reading', '/lab', '#1D9E75', 'white'],
                ['+ Acid oil', '/acidoil', 'white', '#1B2A4A'],
                ['📁 Documents', '/documents', 'white', '#1B2A4A'],
              ].map(([label, path, bg, color]) => (
                <button key={path} onClick={()=>router.push(path)}
                  style={{padding:'8px 16px',background:bg,color,
                  border: bg==='white' ? '1px solid #ddd' : 'none',
                  borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:600}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {[
              ['Pre-sep soap', latest?.soap_ppm_pre_separator, 'ppm', 1800, 2200],
              ['Post-sep soap ★', latest?.soap_ppm_post_separator, 'ppm', 600, 700],
              ['Sep efficiency', sepEff, '%', 75, 70],
              ['Sep temp', latest?.separator_feed_temp_degc, '°C', 82, 80],
              ['Neutral oil FFA', latest?.neutral_oil_ffa_pct, '%', 0.08, 0.10],
              ['Refining loss', latest?.refining_loss_pct, '%', 1.0, 1.5],
            ].map(([label, val, unit, g, w]) => (
              <div key={label} style={{background: sb(val,g,w),borderRadius:10,padding:'12px 14px'}}>
                <div style={{fontSize:18,fontWeight:700,color: sc(val,g,w)}}>
                  {val ?? '—'}{val ? unit : ''}
                </div>
                <div style={{fontSize:11,color:'#666',marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Recent readings */}
          <div style={{background:'white',borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.05)',marginBottom:12}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid #f0f0f0',
              display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:13,fontWeight:600,color:'#1B2A4A'}}>Recent readings</span>
              <span style={{fontSize:11,color:'#aaa'}}>{readings.length} total</span>
            </div>
            {readings.length === 0
              ? <div style={{padding:20,textAlign:'center',color:'#aaa',fontSize:13}}>No readings yet</div>
              : readings.slice(0,5).map((r, i) => (
                <div key={r.id} style={{padding:'10px 16px',
                  borderBottom: i<4 ? '1px solid #f8f8f8' : 'none',
                  display:'flex',justifyContent:'space-between',fontSize:13}}>
                  <span style={{color:'#333'}}>
                    {r.soap_ppm_pre_separator ?? '—'} → {r.soap_ppm_post_separator ?? '—'} ppm
                    {r.separator_feed_temp_degc ? ` · ${r.separator_feed_temp_degc}°C` : ''}
                  </span>
                  <span style={{color:'#aaa',fontSize:11}}>
                    {new Date(r.recorded_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                  </span>
                </div>
              ))
            }
          </div>

          {/* Process Assessment */}
          <div style={{background:'white',borderRadius:12,padding:16,
            boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
            <div style={{fontSize:13,fontWeight:600,color:'#1B2A4A',marginBottom:4}}>Process Assessment</div>
            <div style={{fontSize:12,color:'#888',marginBottom:12,lineHeight:1.6}}>
              Download template, fill 5 batches, upload for assessment.
            </div>
            <button onClick={async()=>{
              const { data:{session} } = await supabase.auth.getSession()
              const res = await fetch('/api/download-template',{headers:{Authorization:`Bearer ${session.access_token}`}})
              if(!res.ok){alert('Download failed');return}
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href=url
              const d = res.headers.get('Content-Disposition')||''
              a.download = d.split('filename=')[1]?.replace(/"/g,'')||'DataRequest.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }} style={{padding:'8px 16px',background:'#1B2A4A',color:'white',border:'none',
              borderRadius:8,fontSize:12,cursor:'pointer',fontWeight:600,marginBottom:12}}>
              ⬇ Download template
            </button>
            <div style={{borderTop:'1px solid #f0f0f0',paddingTop:12}}>
              <div style={{fontSize:12,color:'#555',fontWeight:600,marginBottom:8}}>Upload completed file</div>
              <UploadSection clientId={client.id}/>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Chat panel (desktop always visible, mobile overlay) ── */}
        <div style={{width:360,flexShrink:0,display:'flex',flexDirection:'column',
          overflow:'hidden'}}
          className="desktop-chat">
          <ChatPanel mobile={false}/>
        </div>

        {/* Mobile chat overlay */}
        {chatOpen && (
          <div style={{position:'fixed',top:49,left:0,right:0,bottom:0,
            background:'white',zIndex:100,display:'flex',flexDirection:'column'}}
            className="mobile-chat">
            <ChatPanel mobile={true}/>
          </div>
        )}
      </div>

      {/* Mobile bottom chat button */}
      {!chatOpen && (
        <button onClick={()=>setChatOpen(true)}
          style={{position:'fixed',bottom:20,right:20,
          background:'#1D9E75',color:'white',border:'none',borderRadius:50,
          width:56,height:56,fontSize:22,cursor:'pointer',boxShadow:'0 4px 12px rgba(29,158,117,0.4)',
          display:'none',alignItems:'center',justifyContent:'center',zIndex:99}}
          className="mobile-fab">
          💬
        </button>
      )}

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-6px)}
        }
        @media(max-width:768px){
          .desktop-chat{display:none!important}
          .mobile-fab{display:flex!important}
          .mobile-chat-btn{display:block!important}
          .hide-mobile{display:none!important}
        }
      `}</style>
    </div>
  )
}