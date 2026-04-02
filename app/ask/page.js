'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const SOURCE_LABELS = {
  adapter: { label: 'Domain expert', color: '#1D9E75', bg: '#E1F5EE' },
  llama: { label: 'Market intelligence', color: '#042C53', bg: '#E6F1FB' },
  claude: { label: 'Advanced analysis', color: '#412402', bg: '#FAEEDA' },
}

const SUGGESTIONS = [
  'Why is my post-separator soap high?',
  'What is my neutralisation efficiency this week?',
  'How much oil am I losing to soapstock per month?',
  'What is the value addition opportunity from my acid oil?',
  'Compare my performance to my best ever batch',
  'What is the impact of current soya prices on my margins?',
]

export default function AskPage() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const bottomRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setPageLoading(false)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ask = async (q) => {
    const text = q || question
    if (!text.trim() || loading) return
    setQuestion('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', text }])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ question: text })
      })

      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.answer,
        source: data.source,
        query_type: data.query_type,
        readings_used: data.readings_used,
        used_fallback: data.used_fallback
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Something went wrong. Please try again.',
        source: 'error'
      }])
    }
    setLoading(false)
  }

  if (pageLoading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',
      justifyContent:'center',background:'#F4F6F8',fontFamily:'sans-serif',color:'#888'}}>
      Loading...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F4F6F8',fontFamily:'sans-serif',
      display:'flex',flexDirection:'column'}}>

      {/* Header */}
      <div style={{background:'#1B2A4A',padding:'14px 20px',
        display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div>
          <span style={{color:'white',fontWeight:700,fontSize:16}}>Kenop Intelligence</span>
          <span style={{color:'#aaa',fontSize:12,marginLeft:12}}>Ask anything</span>
        </div>
        <button onClick={()=>router.push('/dashboard')}
          style={{background:'none',border:'1px solid #555',color:'#ccc',
          padding:'5px 12px',borderRadius:6,cursor:'pointer',fontSize:12}}>
          ← Dashboard
        </button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'20px 16px',maxWidth:680,
        width:'100%',margin:'0 auto',boxSizing:'border-box'}}>

        {messages.length === 0 && (
          <div>
            <div style={{textAlign:'center',padding:'32px 0 24px'}}>
              <div style={{fontSize:28,marginBottom:8}}>🔬</div>
              <div style={{fontSize:16,fontWeight:500,color:'#1B2A4A',marginBottom:4}}>
                Ask about your plant
              </div>
              <div style={{fontSize:13,color:'#888'}}>
                Process diagnostics · Financial impact · Market intelligence · Reports
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={()=>ask(s)}
                  style={{padding:'10px 14px',background:'white',border:'0.5px solid #ddd',
                  borderRadius:8,cursor:'pointer',fontSize:12,color:'#333',
                  textAlign:'left',lineHeight:1.4}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{marginBottom:16,
            display:'flex',flexDirection:'column',
            alignItems: m.role==='user' ? 'flex-end' : 'flex-start'}}>

            {m.role === 'user' ? (
              <div style={{background:'#1B2A4A',color:'white',padding:'10px 14px',
                borderRadius:'12px 12px 2px 12px',maxWidth:'80%',fontSize:14,lineHeight:1.5}}>
                {m.text}
              </div>
            ) : (
              <div style={{maxWidth:'95%'}}>
                <div style={{background:'white',border:'0.5px solid #e8e8e8',
                  padding:'14px 16px',borderRadius:'2px 12px 12px 12px',
                  fontSize:14,lineHeight:1.7,color:'#222',whiteSpace:'pre-wrap'}}>
                  {m.text}
                </div>
                {m.source && SOURCE_LABELS[m.source] && (
                  <div style={{display:'flex',gap:8,marginTop:6,alignItems:'center'}}>
                    <span style={{
                      fontSize:11,padding:'2px 8px',borderRadius:20,
                      background:SOURCE_LABELS[m.source].bg,
                      color:SOURCE_LABELS[m.source].color,fontWeight:500
                    }}>
                      {SOURCE_LABELS[m.source].label}
                    </span>
                    {m.readings_used > 0 && (
                      <span style={{fontSize:11,color:'#aaa'}}>
                        {m.readings_used} readings used
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 0'}}>
            <div style={{display:'flex',gap:4}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{
                  width:6,height:6,borderRadius:'50%',background:'#1D9E75',
                  animation:`bounce 1.2s ${i*0.2}s infinite`
                }}/>
              ))}
            </div>
            <span style={{fontSize:12,color:'#888'}}>Analysing your plant data...</span>
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{background:'white',borderTop:'1px solid #eee',
        padding:'12px 16px',flexShrink:0}}>
        <div style={{maxWidth:680,margin:'0 auto',display:'flex',gap:8}}>
          <input
            value={question}
            onChange={e=>setQuestion(e.target.value)}
            onKeyDown={e=>e.key==='Enter' && !e.shiftKey && ask()}
            placeholder="Ask about your process, market, or request a report..."
            style={{flex:1,padding:'10px 14px',fontSize:14,border:'1px solid #ddd',
            borderRadius:8,outline:'none',color:'#222',background:'white'}}
          />
          <button onClick={()=>ask()} disabled={loading || !question.trim()}
            style={{padding:'10px 20px',background: question.trim() ? '#1D9E75' : '#ccc',
            color:'white',border:'none',borderRadius:8,fontSize:14,
            cursor: question.trim() ? 'pointer' : 'not-allowed',fontWeight:600,
            flexShrink:0}}>
            Ask
          </button>
        </div>
        <div style={{maxWidth:680,margin:'4px auto 0',fontSize:11,color:'#aaa',
          display:'flex',gap:12}}>
          <span style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#1D9E75',display:'inline-block'}}/>
            Domain expert
          </span>
          <span style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#042C53',display:'inline-block'}}/>
            Market intelligence
          </span>
          <span style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#BA7517',display:'inline-block'}}/>
            Advanced analysis
          </span>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-6px)}
        }
      `}</style>
    </div>
  )
}