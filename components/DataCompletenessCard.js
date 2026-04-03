'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DataCompletenessCard() {
  const router = useRouter()
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const s = await import('@supabase/supabase-js')
        const sb = s.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        const { data: { session } } = await sb.auth.getSession()
        if (!session) return
        const res = await fetch('/api/onboarding/completion', { headers: { Authorization: 'Bearer ' + session.access_token } })
        if (res.ok) setData(await res.json())
      } catch(e) {}
    }
    load()
  }, [])

  if (!data || (data.completion_pct || 0) >= 85) return null
  const missing = (data.missing_fields || []).flat().filter(Boolean)
  if (!missing.length) return null
  const pct = data.completion_pct || 0
  const col = pct < 40 ? '#E24B4A' : pct < 60 ? '#B45309' : '#1D9E75'
  return (
    <div style={{background:'#FEF8EE',border:'0.5px solid rgba(180,83,9,0.2)',borderRadius:12,padding:'18px 20px',marginBottom:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
        <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'#6B6056',letterSpacing:'0.08em'}}>ONBOARDING {pct}% COMPLETE</span>
        <button onClick={()=>router.push(data.vertical==='edible_oil'?'/onboard/edible-oil':'/onboard/biodiesel')} style={{fontSize:12,color:'#1D9E75',background:'transparent',border:'0.5px solid rgba(29,158,117,0.2)',padding:'5px 12px',borderRadius:6,cursor:'pointer'}}>Complete onboarding →</button>
      </div>
      <div style={{height:5,borderRadius:3,background:'rgba(28,22,17,0.08)',overflow:'hidden',marginBottom:10}}>
        <div style={{height:'100%',width:pct+'%',background:col,borderRadius:3}}/>
      </div>
      {missing.map((item,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'rgba(255,255,255,0.7)',border:'0.5px solid rgba(28,22,17,0.09)',borderRadius:7,marginBottom:5}}>
          <div style={{width:5,height:5,borderRadius:'50%',background:'#B45309',flexShrink:0}}/>
          <span style={{fontSize:12,color:'#1C1611'}}>{item}</span>
        </div>
      ))}
    </div>
  )
}
