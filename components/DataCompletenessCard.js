'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const C = {
  text:'#1C1611', textMid:'#6B6056', textLight:'#A09285',
  green:'#1D9E75', greenLight:'#EAF6F1', greenBorder:'rgba(29,158,117,0.2)',
  amber:'#B45309', amberLight:'#FEF8EE',
  red:'#E24B4A', redLight:'#FCEBEB',
  border:'rgba(28,22,17,0.09)', bg:'#F8F5EF', bgCard:'#FFFFFF',
}
const M = (x={}) => ({ fontFamily:"'JetBrains Mono',monospace", ...x })
const D = (x={}) => ({ fontFamily:"'DM Sans',sans-serif", ...x })

// Quick-entry fields per section
const SECTION_FIELDS = {
  'Plant basics — capacity, location, feedstock type': {
    key: 'plant_basics',
    fields: [
      { id:'capacity_tpd', label:'Plant capacity (TPD)', type:'number', placeholder:'50' },
      { id:'location', label:'Plant location', type:'text', placeholder:'Chikalthana, Aurangabad' },
      { id:'feedstock_primary', label:'Primary feedstock', type:'text', placeholder:'Tallow / Soybean oil' },
    ]
  },
  'Feedstock details — AV, FFA, moisture, source': {
    key: 'feedstocks',
    fields: [
      { id:'feed_av', label:'Feed acid value (mg KOH/g)', type:'number', placeholder:'4.5' },
      { id:'feed_ffa', label:'Feed FFA %', type:'number', placeholder:'2.3' },
      { id:'feed_moisture', label:'Feed moisture %', type:'number', placeholder:'0.1' },
    ]
  },
  'Batch records — last 10 batches with parameters': {
    key: 'batch_records',
    redirect: '/lab',
    label: 'Enter batch records in Lab form'
  },
  'Equipment — reactor size, tank capacities': {
    key: 'equipment_tanks',
    fields: [
      { id:'reactor_capacity_mt', label:'Reactor capacity (MT)', type:'number', placeholder:'5' },
      { id:'storage_capacity_mt', label:'Total storage capacity (MT)', type:'number', placeholder:'100' },
    ]
  },
}

function QualityBadge({ quality }) {
  const map = {
    full:    { label:'Full intelligence', bg:C.greenLight,   color:C.green,  border:C.greenBorder },
    good:    { label:'Good intelligence', bg:C.greenLight,   color:C.green,  border:C.greenBorder },
    partial: { label:'Partial intelligence', bg:C.amberLight, color:C.amber, border:'rgba(180,83,9,0.2)' },
    limited: { label:'Limited intelligence', bg:C.redLight,   color:C.red,   border:'rgba(226,75,74,0.2)' },
  }
  const s = map[quality] || map.limited
  return (
    <span style={{ ...M({ fontSize:10, padding:'2px 10px', borderRadius:999, background:s.bg, color:s.color, border:`0.5px solid ${s.border}`, letterSpacing:'0.06em' }) }}>
      {s.label.toUpperCase()}
    </span>
  )
}

function ProgressBar({ pct }) {
  const color = pct >= 85 ? C.green : pct >= 60 ? C.green : pct >= 40 ? C.amber : C.red
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ ...D({ fontSize:11, color:C.textLight }) }}>Data completeness</span>
        <span style={{ ...M({ fontSize:11, color }) }}>{pct}%</span>
      </div>
      <div style={{ height:5, borderRadius:3, background:'rgba(28,22,17,0.08)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function QuickEntry({ item, clientId, onDone }) {
  const router = useRouter()
  const def = SECTION_FIELDS[item]
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)

  if (!def) return null
  if (def.redirect) return (
    <div style={{ marginTop:12, padding:'12px 14px', background:C.bg, borderRadius:8, border:`0.5px solid ${C.border}` }}>
      <p style={{ ...D({ fontSize:12, color:C.textMid, marginBottom:8 }) }}>Batch records need to be entered in the Lab form — it handles each reading properly.</p>
      <button onClick={() => router.push(def.redirect)} style={{ ...D({ fontSize:12, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'7px 16px', borderRadius:6, cursor:'pointer' }) }}>
        {def.label} →
      </button>
    </div>
  )

  async function save() {
    setSaving(true)
    try {
      const { data:{ session } } = await supabase.auth.getSession()
      await fetch('/api/onboarding/quick-save', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${session?.access_token}` },
        body: JSON.stringify({ section: def.key, values })
      })
      onDone(item)
    } catch(e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ marginTop:12, padding:'14px 16px', background:C.bg, borderRadius:8, border:`0.5px solid ${C.border}` }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        {def.fields.map(f => (
          <div key={f.id}>
            <label style={{ ...D({ fontSize:11, color:C.textLight, display:'block', marginBottom:4 }) }}>{f.label}</label>
            <input
              type={f.type} placeholder={f.placeholder} value={values[f.id]||''}
              onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))}
              style={{ width:'100%', padding:'7px 10px', border:`0.5px solid rgba(28,22,17,0.14)`, borderRadius:6, fontSize:13, ...D(), background:'#fff' }}
            />
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving} style={{ ...D({ fontSize:12, fontWeight:500, background:C.green, border:'none', color:'#fff', padding:'7px 16px', borderRadius:6, cursor:'pointer' }) }}>
        {saving ? 'Saving...' : 'Save →'}
      </button>
    </div>
  )
}

export default function DataCompletenessCard() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [dismissed, setDismissed] = useState([])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/onboarding/completion', {
        headers: { Authorization:`Bearer ${session.access_token}` }
      })
      if (res.ok) setData(await res.json())
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  function handleDone(item) {
    setDismissed(d => [...d, item])
    setExpanded(null)
    fetchData()
  }

  if (loading || !data) return null
  if (data.completion_pct >= 85) return null // hide when complete

  const missing = (data.missing_fields || []).filter(m => !dismissed.includes(m))
  if (missing.length === 0) return null

  const isUrgent = data.completion_pct < 40

  return (
    <div style={{
      background: isUrgent ? C.amberLight : '#FFFBF5',
      border: `0.5px solid ${isUrgent ? 'rgba(180,83,9,0.25)' : C.border}`,
      borderRadius:12, padding:'18px 20px', marginBottom:20
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background: isUrgent ? C.amber : C.green, flexShrink:0 }} />
          <span style={{ ...M({ fontSize:11, color: isUrgent ? C.amber : C.textMid, letterSpacing:'0.08em' }) }}>
            ONBOARDING INCOMPLETE
          </span>
          <QualityBadge quality={data.intelligence_quality} />
        </div>
        <button onClick={() => router.push(data.vertical === 'edible_oil' ? '/onboard/edible-oil' : '/onboard/biodiesel')}
          style={{ ...D({ fontSize:12, color:C.green, background:'transparent', border:`0.5px solid ${C.greenBorder}`, padding:'5px 12px', borderRadius:6, cursor:'pointer' }) }}>
          Complete onboarding →
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:16 }}>
        <ProgressBar pct={data.completion_pct} />
      </div>

      {/* Why this matters */}
      <div style={{ ...D({ fontSize:12, color:C.textMid, lineHeight:1.65, marginBottom:14, fontWeight:300 }) }}>
        {isUrgent
          ? 'Kenop has limited data to work with. The intelligence you receive will be generic until the gaps below are filled. Each section takes 2–5 minutes.'
          : 'A few sections are still incomplete. Filling them improves the accuracy and specificity of your morning reports and AI answers.'}
      </div>

      {/* Missing items */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {missing.map((item, i) => (
          <div key={i}>
            <div
              onClick={() => setExpanded(expanded === item ? null : item)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'rgba(255,255,255,0.7)', border:`0.5px solid ${C.border}`, borderRadius:8, cursor:'pointer' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:C.amber, flexShrink:0 }} />
                <span style={{ ...D({ fontSize:13, color:C.text }) }}>{item}</span>
              </div>
              <span style={{ fontSize:12, color:C.textLight, transform: expanded === item ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', display:'inline-block' }}>▾</span>
            </div>
            {expanded === item && (
              <QuickEntry item={item} onDone={handleDone} />
            )}
          </div>
        ))}
      </div>

      <p style={{ ...D({ fontSize:10, color:C.textLight, marginTop:12, fontStyle:'italic' }) }}>
        You can fill these here directly or return to the full onboarding wizard. All data is saved immediately.
      </p>
    </div>
  )
}
