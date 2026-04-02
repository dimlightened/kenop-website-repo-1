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
  'Acid oil value addition opportunity?',
]

function UploadSection({ clientId }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const upload = async () => {
    if (!file) return
    setUploading(true)
    const fn = `${clientId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`
    const { error } = await supabase.storage.from('plant-photos').upload(`submissions/${fn}`, file)
    setUploading(false)
    if (!error) setUploaded(true)
  }
  if (uploaded) return <div style={{background:'#E1F5EE',padding:'8px 12px',borderRadius:6,fontSize:12,color:'#085041'}}>✅ Uploaded — team will review within 24hrs</div>
  return (
    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
      <input type="file" accept=".xlsx,.xls,.pdf" onChange={e=>setFile(e.target.files[0])} style={{fontSize:12,color:'#333'}}/>
      {file && <button onClick={upload} disabled={uploading} style={{padding:'6px 14px',background:'#1D9E75',color:'white',border:'none',borderRadius:6,fontSize:12,cursor:'pointer'}}>{uploading?'Uploading...':'Submit'}</button>}
    </div>
  )
}

// ── ChatPanel defined OUTSIDE Dashboard to prevent remount on every keystroke ──
function ChatPanel({ messages, question, setQuestion, asking, onAsk, onClose, bottomRef, mobile }) {
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'white',
      ...(mobile ? {} : {borderLeft:'1px solid #eee'})}}>
      <div style={{padding:'12px 16px',borderBottom:'1px solid #f0f0f0',flexShrink:0,
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:'#1B2A4A'}}>Ask Kenop</div>
          <div style={{fontSize:11,color:'#aaa'}}>Saved · Domain · Market · Reports</div>
        </div>
        {mobile && (
          <button onClick={onClose}
            style={{background:'none',border:'1px solid #ddd',padding:'5px 12px',
            borderRadius:6,cursor:'pointer',fontSize:12,color:'#888'}}>
            ← Dashboard
          </button>
        )}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px',display:'flex',flexDirection:'column',gap:8}}>
        {messages.length === 0 && (
          <div>
            <div style={{textAlign:'center',padding:'12px 0 10px',color:'#aaa',fontSize:12}}>
              Ask about your process or market
            </div>
            {SUGGESTIONS.map((s,i)=>(
              <button key={i} onClick={()=>onAsk(s)}
                style={{display:'block',width:'100%',padding:'8px 12px',background:'#F4F6F8',
                border:'none',borderRadius:8,cursor:'pointer',fontSize:12,color:'#333',
                textAlign:'left',marginBottom:6,lineHeight:1.4}}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',flexDirection:'column',
            alignItems:m.role==='user'?'flex-end':'flex-start'}}>
            {m.role==='user'
              ? <div style={{background:'#1B2A4A',color:'white',padding:'8px 12px',
                  borderRadius:'10px 10px 2px 10px',maxWidth:'85%',fontSize:13,lineHeight:1.5}}>
                  {m.text}
                </div>
              : <div style={{maxWidth:'95%'}}>
                  <div style={{background:'#F4F6F8',padding:'10px 12px',
                    borderRadius:'2px 10px 10px 10px',fontSize:13,lineHeight:1.7,
                    color:'#222',whiteSpace:'pre-wrap'}}>
                    {m.text}
                  </div>
                  {m.source && SOURCE_LABELS[m.source] && (
                    <span style={{fontSize:10,padding:'2px 6px',borderRadius:20,marginTop:4,
                      display:'inline-block',background:SOURCE_LABELS[m.source].bg,
                      color:SOURCE_LABELS[m.source].color}}>
                      {SOURCE_LABELS[m.source].label}
                    </span>
                  )}
                </div>
            }
          </div>
        ))}

        {asking && (
          <div style={{display:'flex',gap:4,padding:'6px 0'}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#1D9E75',
                animation:`bounce 1.2s ${i*0.2}s infinite`}}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{padding:'10px 12px',borderTop:'1px solid #f0f0f0',flexShrink:0}}>
        <div style={{display:'flex',gap:8}}>
          <input
            value={question}
            onChange={e=>setQuestion(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&onAsk()}
            placeholder="Ask anything..."
            style={{flex:1,padding:'8px 12px',fontSize:13,border:'1px solid #ddd',
            borderRadius:8,outline:'none',color:'#222',background:'white'}}
          />
          <button onClick={()=>onAsk()} disabled={asking||!question.trim()}
            style={{padding:'8px 14px',background:question.trim()?'#1D9E75':'#ccc',
            color:'white',border:'none',borderRadius:8,fontSize:13,
            cursor:question.trim()?'pointer':'not-allowed',fontWeight:600}}>
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [client, setClient] = useState(null)
  const [readings, setReadings] = useState([])
  const [acidBatches, setAcidBatches] = useState([])
  const [prices, setPrices] = useState({ acid_oil: 52, edible_oil: 90 })
  const [editPrices, setEditPrices] = useState(false)
  const [tempPrices, setTempPrices] = useState({ acid_oil: 52, edible_oil: 90 })
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [mobileChat, setMobileChat] = useState(false)
  const bottomRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: cl } = await supabase.from('clients').select('*').eq('auth_user_id', session.user.id).single()
      if (!cl) { router.push('/lab'); return }
      setClient(cl)

      const [{ data: r }, { data: a }, { data: c }, { data: p }] = await Promise.all([
        supabase.from('lab_readings').select('*').eq('client_id', cl.id).order('recorded_at',{ascending:false}).limit(30),
        supabase.from('acidoil_batches').select('*').eq('client_id', cl.id).order('created_at',{ascending:false}).limit(10),
        supabase.from('conversations').select('*').eq('client_id', cl.id).order('created_at',{ascending:true}).limit(50),
        supabase.from('market_prices').select('*').order('updated_at',{ascending:false}).limit(1)
      ])
      setReadings(r || [])
      setAcidBatches(a || [])
      if (c?.length > 0) setMessages(c.map(m=>({role:m.role,text:m.message,source:m.source})))
      if (p?.length > 0) {
        const lp = p[0]
        setPrices({ acid_oil: lp.acid_oil_price_per_kg, edible_oil: lp.edible_oil_price_per_kg })
        setTempPrices({ acid_oil: lp.acid_oil_price_per_kg, edible_oil: lp.edible_oil_price_per_kg })
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const savePrices = async () => {
    await supabase.from('market_prices').insert({
      acid_oil_price_per_kg: parseFloat(tempPrices.acid_oil),
      edible_oil_price_per_kg: parseFloat(tempPrices.edible_oil),
      updated_by: client?.email || 'admin'
    })
    setPrices({ ...tempPrices })
    setEditPrices(false)
  }

  const handleAsk = async (q) => {
    const text = typeof q === 'string' ? q : question
    if (!text.trim() || asking) return
    setQuestion('')
    setAsking(true)
    setMobileChat(true)
    setMessages(prev => [...prev, { role: 'user', text }])
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ question: text })
      })
      const data = await res.json()
      const msg = { role: 'assistant', text: data.answer, source: data.source }
      setMessages(prev => [...prev, msg])
      await supabase.from('conversations').insert([
        { client_id: client.id, role: 'user', message: text },
        { client_id: client.id, role: 'assistant', message: data.answer, source: data.source, query_type: data.query_type }
      ])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }])
    }
    setAsking(false)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const latest = readings[0]
  const tpd = client?.throughput_tpd || 350
  const sepEff = latest?.soap_ppm_pre_separator && latest?.soap_ppm_post_separator
    ? (((latest.soap_ppm_pre_separator - latest.soap_ppm_post_separator) / latest.soap_ppm_pre_separator) * 100).toFixed(1) : null

  const theoreticalLoss = 0.885
  const actualLoss = latest?.refining_loss_pct || 1.62
  const excessLossRs = Math.max(0, (actualLoss - theoreticalLoss) / 100 * tpd * 1000) * prices.edible_oil
  const soapLossRs = (latest?.soap_ppm_post_separator || 650) * tpd * 1000 / 1000000 * 0.68 * prices.edible_oil

  const avgAcidFFA = acidBatches.length > 0
    ? (acidBatches.filter(b=>b.acid_oil_ffa_pct).reduce((s,b)=>s+b.acid_oil_ffa_pct,0) / Math.max(1, acidBatches.filter(b=>b.acid_oil_ffa_pct).length))
    : 63.5
  const dailyAcidMT = tpd * 0.015 * 0.789 * 0.88
  const dfaPrice = parseFloat(prices.acid_oil) + 40
  const currentAcidRevenue = dailyAcidMT * 1000 * parseFloat(prices.acid_oil)
  const separatedRevenue = dailyAcidMT * 1000 * (dfaPrice * avgAcidFFA/100 + parseFloat(prices.edible_oil) * (1 - avgAcidFFA/100 - 0.032))
  const dailyGap = Math.max(0, separatedRevenue - currentAcidRevenue)
  const paybackDays = dailyGap > 0 ? Math.round(18000000 / dailyGap) : 0

  const sc = (v,g,w) => !v?'#888':v<=g?'#1D9E75':v<=w?'#BA7517':'#C0392B'
  const sb = (v,g,w) => !v?'#F4F6F8':v<=g?'#E1F5EE':v<=w?'#FAEEDA':'#FDECEA'
  const rs = (n) => '₹'+Math.round(n).toLocaleString('en-IN')

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F4F6F8',fontFamily:'sans-serif',color:'#888'}}>Loading...</div>

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',fontFamily:'sans-serif',background:'#F4F6F8'}}>

      <div style={{background:'#1B2A4A',padding:'12px 20px',flexShrink:0,
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'white',fontWeight:700,fontSize:15}}>Kenop Intelligence</span>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setMobileChat(c=>!c)} className="mobile-only"
            style={{background:mobileChat?'#1D9E75':'rgba(255,255,255,0.15)',border:'none',
            color:'white',padding:'5px 12px',borderRadius:6,cursor:'pointer',fontSize:12,display:'none'}}>
            {mobileChat?'← Dashboard':'💬 Ask'}
          </button>
          <button onClick={logout}
            style={{background:'none',border:'1px solid #555',color:'#ccc',
            padding:'5px 12px',borderRadius:6,cursor:'pointer',fontSize:12}}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>

        {/* ── Dashboard scroll area ── */}
        <div style={{flex:1,overflowY:'auto',padding:'14px 14px 80px',minWidth:0}}
          className={mobileChat?'hide-mobile':''}>

          <div style={{background:'white',borderRadius:12,padding:14,boxShadow:'0 1px 6px rgba(0,0,0,0.05)',marginBottom:10}}>
            <div style={{fontSize:10,color:'#1D9E75',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>Your plant</div>
            <div style={{fontSize:16,fontWeight:600,color:'#1B2A4A',marginBottom:2}}>{client.name}</div>
            <div style={{fontSize:12,color:'#888',marginBottom:10}}>{client.location} · {client.feedstock_primary} · {client.throughput_tpd} TPD</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[['+ Lab reading','/lab','#1D9E75','white'],['+ Acid oil','/acidoil','white','#1B2A4A'],['📁 Docs','/documents','white','#1B2A4A']].map(([l,p,bg,c])=>(
                <button key={p} onClick={()=>router.push(p)}
                  style={{padding:'7px 14px',background:bg,color:c,border:bg==='white'?'1px solid #ddd':'none',borderRadius:8,fontSize:12,cursor:'pointer',fontWeight:600}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
            {[
              ['Pre-sep soap',latest?.soap_ppm_pre_separator,'ppm',1800,2200],
              ['Post-sep soap ★',latest?.soap_ppm_post_separator,'ppm',600,700],
              ['Sep efficiency',sepEff,'%',75,70],
              ['Sep temp',latest?.separator_feed_temp_degc,'°C',82,80],
              ['Neutral FFA',latest?.neutral_oil_ffa_pct,'%',0.08,0.10],
              ['Refining loss',latest?.refining_loss_pct,'%',1.0,1.5],
            ].map(([label,val,unit,g,w])=>(
              <div key={label} style={{background:sb(val,g,w),borderRadius:10,padding:'10px 12px'}}>
                <div style={{fontSize:16,fontWeight:700,color:sc(val,g,w)}}>{val??'—'}{val?unit:''}</div>
                <div style={{fontSize:10,color:'#666',marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Market prices */}
          <div style={{background:'white',borderRadius:12,padding:14,boxShadow:'0 1px 6px rgba(0,0,0,0.05)',marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:600,color:'#1B2A4A'}}>Current market prices</div>
              <button onClick={()=>setEditPrices(e=>!e)}
                style={{fontSize:11,padding:'4px 10px',background:'none',border:'1px solid #ddd',borderRadius:6,cursor:'pointer',color:'#888'}}>
                {editPrices?'Cancel':'Update'}
              </button>
            </div>
            {editPrices ? (
              <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
                {[['Acid oil (₹/kg)','acid_oil'],['Edible oil (₹/kg)','edible_oil']].map(([label,key])=>(
                  <div key={key}>
                    <div style={{fontSize:11,color:'#888',marginBottom:4}}>{label}</div>
                    <input type="number" value={tempPrices[key]}
                      onChange={e=>setTempPrices(p=>({...p,[key]:e.target.value}))}
                      style={{width:80,padding:'6px 8px',fontSize:14,border:'1px solid #ddd',borderRadius:6,color:'#222'}}/>
                  </div>
                ))}
                <button onClick={savePrices}
                  style={{padding:'7px 16px',background:'#1D9E75',color:'white',border:'none',borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:600}}>
                  Save
                </button>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[
                  ['Acid oil','₹'+prices.acid_oil+'/kg','#FAEEDA','#412402'],
                  ['Edible oil','₹'+prices.edible_oil+'/kg','#E1F5EE','#085041'],
                  ['Distilled FFA','₹'+dfaPrice+'/kg','#E6F1FB','#042C53'],
                ].map(([label,val,bg,color])=>(
                  <div key={label} style={{background:bg,borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:15,fontWeight:700,color}}>{val}</div>
                    <div style={{fontSize:10,color,opacity:0.8,marginTop:2}}>{label}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{fontSize:10,color:'#aaa',marginTop:8}}>
              Distilled FFA = Acid oil + ₹40 fixed premium · Update prices daily for accurate financials
            </div>
          </div>

          {/* Monthly P&L */}
          <div style={{background:'white',borderRadius:12,padding:14,boxShadow:'0 1px 6px rgba(0,0,0,0.05)',marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600,color:'#1B2A4A',marginBottom:10}}>Monthly loss estimate</div>
            {[
              ['Oil entrained above theoretical min', excessLossRs*30,'#FDECEA','#C0392B'],
              ['Soap carry-over in neutral oil', soapLossRs*30,'#FAEEDA','#BA7517'],
            ].map(([label,val,bg,color])=>(
              <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,background:bg,marginBottom:6}}>
                <span style={{fontSize:12,color:'#333'}}>{label}</span>
                <span style={{fontSize:13,fontWeight:700,color}}>{rs(val)}/mo</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',borderRadius:8,background:'#1B2A4A',marginTop:2}}>
              <span style={{fontSize:13,color:'white',fontWeight:600}}>Total recoverable</span>
              <span style={{fontSize:14,fontWeight:700,color:'#1D9E75'}}>{rs((excessLossRs+soapLossRs)*30)}/mo</span>
            </div>
            <div style={{fontSize:10,color:'#aaa',marginTop:6}}>Based on {readings.length} readings · ₹{prices.edible_oil}/kg edible oil</div>
          </div>

          {/* Acid oil value addition */}
          <div style={{background:'white',borderRadius:12,padding:14,boxShadow:'0 1px 6px rgba(0,0,0,0.05)',marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600,color:'#1B2A4A',marginBottom:4}}>Acid oil value addition</div>
            <div style={{fontSize:11,color:'#888',marginBottom:10}}>
              {dailyAcidMT.toFixed(1)} MT/day · {avgAcidFFA.toFixed(1)}% FFA · Distilled FFA ₹{dfaPrice}/kg
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
              <div style={{padding:'10px 12px',background:'#F4F6F8',borderRadius:8}}>
                <div style={{fontSize:11,color:'#888',marginBottom:3}}>Current — crude acid oil</div>
                <div style={{fontSize:16,fontWeight:700,color:'#333'}}>{rs(currentAcidRevenue)}/day</div>
                <div style={{fontSize:10,color:'#888'}}>at ₹{prices.acid_oil}/kg</div>
              </div>
              <div style={{padding:'10px 12px',background:'#E1F5EE',borderRadius:8}}>
                <div style={{fontSize:11,color:'#085041',marginBottom:3}}>With value addition</div>
                <div style={{fontSize:16,fontWeight:700,color:'#1D9E75'}}>{rs(separatedRevenue)}/day</div>
                <div style={{fontSize:10,color:'#085041'}}>FFA + oil + unsap fractions</div>
              </div>
            </div>
            <div style={{padding:'10px 14px',background:'#1B2A4A',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div>
                <div style={{fontSize:10,color:'#aaa'}}>Daily gap</div>
                <div style={{fontSize:18,fontWeight:700,color:'#1D9E75'}}>{rs(dailyGap)}/day</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:10,color:'#aaa'}}>At ₹1.8Cr CAPEX</div>
                <div style={{fontSize:16,fontWeight:700,color:'white'}}>{paybackDays} day payback</div>
              </div>
            </div>
            <div style={{fontSize:11,color:'#888',lineHeight:1.6}}>
              Two pathways exist to capture this value. Your Kenop team can evaluate which suits your plant's volumes and market access.
            </div>
          </div>

          {/* Recent readings */}
          <div style={{background:'white',borderRadius:12,boxShadow:'0 1px 6px rgba(0,0,0,0.05)',marginBottom:10}}>
            <div style={{padding:'10px 14px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:13,fontWeight:600,color:'#1B2A4A'}}>Recent readings</span>
              <span style={{fontSize:11,color:'#aaa'}}>{readings.length} total</span>
            </div>
            {readings.length===0
              ? <div style={{padding:16,textAlign:'center',color:'#aaa',fontSize:12}}>No readings yet</div>
              : readings.slice(0,5).map((r,i)=>(
                <div key={r.id} style={{padding:'8px 14px',borderBottom:i<4?'1px solid #f8f8f8':'none',display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{color:'#333'}}>{r.soap_ppm_pre_separator??'—'} → {r.soap_ppm_post_separator??'—'} ppm{r.separator_feed_temp_degc?` · ${r.separator_feed_temp_degc}°C`:''}</span>
                  <span style={{color:'#aaa'}}>{new Date(r.recorded_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                </div>
              ))
            }
          </div>

          {/* Process assessment */}
          <div style={{background:'white',borderRadius:12,padding:14,boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
            <div style={{fontSize:13,fontWeight:600,color:'#1B2A4A',marginBottom:4}}>Process Assessment</div>
            <div style={{fontSize:12,color:'#888',marginBottom:10,lineHeight:1.5}}>Download template, fill 5 batches, upload for assessment.</div>
            <button onClick={async()=>{
              const {data:{session}}=await supabase.auth.getSession()
              const res=await fetch('/api/download-template',{headers:{Authorization:`Bearer ${session.access_token}`}})
              if(!res.ok){alert('Download failed');return}
              const blob=await res.blob()
              const url=URL.createObjectURL(blob)
              const a=document.createElement('a')
              a.href=url
              const d=res.headers.get('Content-Disposition')||''
              a.download=d.split('filename=')[1]?.replace(/"/g,'')||'DataRequest.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }} style={{padding:'7px 16px',background:'#1B2A4A',color:'white',border:'none',borderRadius:8,fontSize:12,cursor:'pointer',fontWeight:600,marginBottom:10}}>
              ⬇ Download template
            </button>
            <div style={{borderTop:'1px solid #f0f0f0',paddingTop:10}}>
              <div style={{fontSize:12,color:'#555',fontWeight:600,marginBottom:6}}>Upload completed file</div>
              <UploadSection clientId={client.id}/>
            </div>
          </div>
        </div>

        {/* ── Desktop chat panel (always visible) ── */}
        <div style={{width:340,flexShrink:0,overflow:'hidden',display:'flex',flexDirection:'column'}}
          className="desktop-chat">
          <ChatPanel
            messages={messages}
            question={question}
            setQuestion={setQuestion}
            asking={asking}
            onAsk={handleAsk}
            onClose={()=>setMobileChat(false)}
            bottomRef={bottomRef}
            mobile={false}
          />
        </div>

        {/* ── Mobile fullscreen chat ── */}
        {mobileChat && (
          <div style={{position:'fixed',top:49,left:0,right:0,bottom:0,zIndex:100,
            display:'flex',flexDirection:'column'}} className="mobile-chat-overlay">
            <ChatPanel
              messages={messages}
              question={question}
              setQuestion={setQuestion}
              asking={asking}
              onAsk={handleAsk}
              onClose={()=>setMobileChat(false)}
              bottomRef={bottomRef}
              mobile={true}
            />
          </div>
        )}

        {/* Mobile floating button */}
        {!mobileChat && (
          <button onClick={()=>setMobileChat(true)} className="mobile-fab"
            style={{position:'fixed',bottom:20,right:20,background:'#1D9E75',
            color:'white',border:'none',borderRadius:'50%',width:54,height:54,
            fontSize:20,cursor:'pointer',boxShadow:'0 4px 12px rgba(29,158,117,0.4)',
            display:'none',alignItems:'center',justifyContent:'center',zIndex:99}}>
            💬
          </button>
        )}
      </div>

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @media(max-width:768px){
          .desktop-chat{display:none!important}
          .mobile-fab{display:flex!important}
          .mobile-only{display:block!important}
          .hide-mobile{display:none!important}
        }
      `}</style>
    </div>
  )
}