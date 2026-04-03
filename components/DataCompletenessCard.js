'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function DataCompletenessCard() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data:{ session } } = await supabase.auth.getSession()
        if (!session) return
        const res = await fetch('/api/onboarding/completion', {
          headers: { Authorization: 'Bearer ' + session.access_token }
        })
        if (res.ok) setData(await res.json())
      } catch(e) {}
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading || !data || (data.completion_pct || 0) >= 85) return null
  const missing = (data.missing_fields || []).flat().filter(Boolean)
  if (missing.length === 0) return null

  const pct = data.completion_pct || 0
  const barColor = pct < 40 ? '#E24B4A' : pct < 60 ? '#B45309' : '#1D9E75'

  return (
    <div style={{ background:'#FEF8EE', border:'0.5px solid rgba(180,83,9,0.2)', borderRadius:12, padding:'18px 20px', marginBottom:20, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:barColor }} />
          <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'#6B6056', letterSpacing:'0.08em' }}>
            ONBOARDING {pct}% COMPLETE
          </span>
        </div>
        <button onClick={() => router.push(data.vertical === 'edible_oil' ? '/onboard/edible-oil' : '/onboard/biodiesel')}
          style={{ fontSize:12, color:'#1D9E75', background:'transparent', border:'0.5px solid rgba(29,158,117,0.2)', padding:'5px 12px', borderRadius:6, cursor:'pointer' }}>
          Complete onboarding →
        </button>
      </div>
      <div style={{ height:5, borderRadius:3, background:'rgba(28,22,17,0.08)', overflow:'hidden', marginBottom:12 }}>
        <div style={{ height:'100%', width: pct + '%', background:barColor, borderRadius:3, transition:'width 0.6s' }} />
      </div>
      <div style={{ fontSize:12, color:'#6B6056', marginBottom:12, lineHeight:1.6 }}>
        {pct < 40 ? 'Limited data — intelligence will be generic until gaps below are filled.' : 'A few sections incomplete. Filling them improves your reports and AI answers.'}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {missing.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'rgba(255,255,255,0.7)', border:'0.5px solid rgba(28,22,17,0.09)', borderRadius:7 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#B45309', flexShrink:0 }} />
            <span style={{ fontSize:12, color:'#1C1611' }}>{item}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize:10, color:'#A09285', marginTop:10, fontStyle:'italic' }}>Return to onboarding to complete these sections — all data saves immediately.</p>
    </div>
  )
}
