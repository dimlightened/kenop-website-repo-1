'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STEPS = [
  { n: 1, label: 'Plant basics' },
  { n: 2, label: 'Feedstocks' },
  { n: 3, label: 'Process units' },
  { n: 4, label: 'Process sequence' },
  { n: 5, label: 'Batch records' },
  { n: 6, label: 'Equipment & tanks' },
  { n: 7, label: 'Data collection' },
]

const PROCESS_UNITS = [
  {
    key: 'has_degumming',
    label: 'Degumming',
    group: 'Pretreatment',
    desc: 'Phospholipid removal — acid, water, or enzymatic',
    live: false,
    sub: [
      { key: 'degumming_type', label: 'Type', type: 'select', options: ['Acid degumming','Water degumming','Enzymatic degumming','Dry degumming'] },
      { key: 'phosphoric_acid_dose_ppm', label: 'Phosphoric acid dose (ppm)', type: 'number' },
      { key: 'degumming_temp_degc', label: 'Temperature (°C)', type: 'number' },
    ]
  },
  {
    key: 'has_dewaxing',
    label: 'Dewaxing / Winterisation',
    group: 'Pretreatment',
    desc: 'Wax removal — sunflower, rice bran, corn oils',
    live: false,
    sub: [
      { key: 'dewaxing_temp_degc', label: 'Crystallisation temp (°C)', type: 'number' },
      { key: 'dewaxing_duration_hrs', label: 'Holding time (hours)', type: 'number' },
      { key: 'dewaxing_filter_type', label: 'Filter type', type: 'select', options: ['Plate & frame filter press','Leaf filter','Rotary vacuum filter'] },
    ]
  },
  {
    key: 'has_neutralisation',
    label: 'Neutralisation',
    group: 'Chemical refining',
    desc: 'Caustic refining — FFA removal via saponification',
    live: true,
    sub: [
      { key: 'caustic_type', label: 'Caustic type', type: 'select', options: ['NaOH (lye)','KOH'] },
      { key: 'caustic_concentration_pct', label: 'Caustic concentration (%)', type: 'number' },
      { key: 'neutralisation_mode', label: 'Mode', type: 'select', options: ['Batch','Continuous','Semi-continuous'] },
      { key: 'neutralisation_temp_degc', label: 'Neutralisation temperature (°C)', type: 'number' },
      { key: 'wash_water_temp_degc', label: 'Wash water temperature (°C)', type: 'number' },
    ]
  },
  {
    key: 'has_bleaching',
    label: 'Bleaching',
    group: 'Chemical refining',
    desc: 'ABE treatment — colour, metals, phospholipid removal',
    live: false,
    sub: [
      { key: 'bleaching_earth_dose_pct', label: 'ABE dose (% on oil)', type: 'number' },
      { key: 'bleaching_temp_degc', label: 'Bleaching temperature (°C)', type: 'number' },
      { key: 'bleaching_contact_time_min', label: 'Contact time (minutes)', type: 'number' },
      { key: 'bleaching_vacuum_mbar', label: 'Vacuum (mbar)', type: 'number' },
      { key: 'bleaching_filter_type', label: 'Filter type', type: 'select', options: ['PLF (Pressure Leaf Filter)','Plate & frame filter press','Both'] },
    ]
  },
  {
    key: 'has_deodorisation',
    label: 'Deodorisation',
    group: 'Physical refining',
    desc: 'Steam stripping — FFA, odour, colour bodies removal',
    live: false,
    sub: [
      { key: 'deodoriser_type', label: 'Deodoriser type', type: 'select', options: ['Batch','Semi-continuous','Continuous (packed column)','Structured packing'] },
      { key: 'deodorisation_temp_degc', label: 'Operating temperature (°C)', type: 'number' },
      { key: 'deodorisation_vacuum_mbar', label: 'Vacuum (mbar)', type: 'number' },
      { key: 'steam_consumption_kg_mt', label: 'Steam consumption (kg/MT)', type: 'number' },
    ]
  },
  {
    key: 'has_physical_refining',
    label: 'Physical refining (FFA distillation)',
    group: 'Physical refining',
    desc: 'Direct FFA stripping without caustic — PFAD recovery',
    live: false,
    sub: [
      { key: 'physical_refining_temp_degc', label: 'Stripping temperature (°C)', type: 'number' },
      { key: 'physical_refining_vacuum_mbar', label: 'Vacuum (mbar)', type: 'number' },
    ]
  },
  {
    key: 'has_acid_oil_processing',
    label: 'Acid oil processing',
    group: 'Byproduct',
    desc: 'Soapstock acidulation to recover acid oil',
    live: false,
    sub: [
      { key: 'acidulation_acid_type', label: 'Acid used', type: 'select', options: ['H₂SO₄ (sulphuric acid)','HCl (hydrochloric acid)','H₃PO₄ (phosphoric acid)'] },
      { key: 'acidulation_ph_endpoint', label: 'Endpoint pH', type: 'number' },
    ]
  },
  {
    key: 'has_fractionation',
    label: 'Fractionation',
    group: 'Byproduct',
    desc: 'Palm oil fractionation — olein and stearin separation',
    live: false,
    sub: [
      { key: 'fractionation_type', label: 'Type', type: 'select', options: ['Dry fractionation','Solvent fractionation','Detergent fractionation'] },
    ]
  },
  {
    key: 'has_separator',
    label: 'Centrifuge / Separator',
    group: 'Equipment',
    desc: 'Disc stack centrifuge for oil-soap-water separation',
    live: true,
    sub: [
      { key: 'separator_make', label: 'Make / model', type: 'text' },
      { key: 'separator_capacity_lph', label: 'Capacity (L/hr)', type: 'number' },
      { key: 'separator_feed_temp_degc', label: 'Optimal feed temperature (°C)', type: 'number' },
    ]
  },
  {
    key: 'has_plf',
    label: 'PLF / Filter press',
    group: 'Equipment',
    desc: 'Pressure leaf filter or plate-and-frame for earth filtration',
    live: true,
    sub: [
      { key: 'filter_type', label: 'Type', type: 'select', options: ['PLF (Pressure Leaf Filter)','Plate & frame filter press','Both'] },
      { key: 'filter_area_m2', label: 'Filter area (m²)', type: 'number' },
    ]
  },
]

const FEEDSTOCK_TYPES = [
  'Soybean crude oil',
  'Cottonseed crude oil',
  'Sunflower crude oil',
  'Rice bran crude oil',
  'Palm crude oil (CPO)',
  'Rapeseed / Canola crude oil',
  'Groundnut crude oil',
  'Sesame crude oil',
  'Mustard crude oil',
  'Corn crude oil',
  'Soapstock (from refinery)',
  'Acid oil (purchased)',
  'Other',
]

const BATCH_FIELDS = [
  { key: 'date',              label: 'Date',           type: 'date',   width: 100 },
  { key: 'feedstock',        label: 'Feedstock',      type: 'text',   width: 110 },
  { key: 'qty_mt',           label: 'Qty (MT)',        type: 'number', width: 70 },
  { key: 'feed_ffa',         label: 'Feed FFA%',      type: 'number', width: 75 },
  { key: 'feed_moisture',    label: 'Moisture%',      type: 'number', width: 75 },
  { key: 'feed_colour_r',    label: 'Colour R',       type: 'number', width: 65 },
  { key: 'caustic_dose',     label: 'Caustic kg/MT',  type: 'number', width: 90 },
  { key: 'neutral_ffa',      label: 'NO FFA%',        type: 'number', width: 70 },
  { key: 'soap_ppm',         label: 'Soap ppm',       type: 'number', width: 70 },
  { key: 'neutral_colour_r', label: 'NO Colour R',    type: 'number', width: 85 },
  { key: 'refining_loss',    label: 'Ref. loss%',     type: 'number', width: 75 },
  { key: 'bleached_colour_r',label: 'BO Colour R',    type: 'number', width: 85 },
  { key: 'deod_ffa',         label: 'DO FFA%',        type: 'number', width: 70 },
  { key: 'deod_colour_r',    label: 'DO Colour R',    type: 'number', width: 85 },
  { key: 'notes',            label: 'Notes',          type: 'text',   width: 100 },
]

function emptyBatch() {
  return BATCH_FIELDS.reduce((a, f) => ({ ...a, [f.key]: '' }), {})
}

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0D1117;color:#E6EDF3;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  input,select,textarea{font-family:'DM Sans',system-ui,sans-serif;outline:none}
  button{font-family:'DM Sans',system-ui,sans-serif;cursor:pointer}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
`

const pageStyle = { background:'#0D1117', minHeight:'100vh', color:'#E6EDF3', fontFamily:"'DM Sans',system-ui,sans-serif", display:'flex', flexDirection:'column' }
const inputStyle = { width:'100%', background:'#161B22', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:7, padding:'10px 14px', color:'#E6EDF3', fontSize:13 }
const btnPrimary = { background:'#1D9E75', border:'none', borderRadius:8, padding:'10px 24px', color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer' }
const iconBtn = { width:28, height:28, borderRadius:6, border:'0.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#7D8590', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }

function StepHeader({ n, title, sub }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:11, color:'rgba(29,158,117,0.6)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:6, fontFamily:'monospace' }}>Step {n} of 7</div>
      <div style={{ fontSize:20, fontWeight:500, color:'#E6EDF3', marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:13, color:'#7D8590' }}>{sub}</div>
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontSize:11, color:'#7D8590', marginBottom:6, letterSpacing:'0.02em' }}>{children}</div>
}

function Input({ style, ...props }) {
  return (
    <input {...props} style={{ ...inputStyle, ...style }}
      onFocus={e => e.target.style.borderColor='rgba(29,158,117,0.4)'}
      onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
  )
}

function Select({ children, ...props }) {
  return (
    <select {...props} style={{ ...inputStyle }}>
      {children}
    </select>
  )
}

export default function EdibleOilOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [client, setClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [basics, setBasics] = useState({ name:'', location:'', capacity_tpd:'', contact_name:'', phone:'', email:'' })
  const [feedstocks, setFeedstocks] = useState([])
  const [processes, setProcesses] = useState(PROCESS_UNITS.reduce((a,p) => ({ ...a, [p.key]:false }), {}))
  const [processDetails, setProcessDetails] = useState({})
  const [sequence, setSequence] = useState([])
  const [batches, setBatches] = useState(Array(5).fill(null).map(emptyBatch))
  const [equipment, setEquipment] = useState([
    { equipment_type:'Crude oil storage tank', tag_number:'T-101', capacity_kl:'', material_of_construction:'MS', notes:'' },
    { equipment_type:'Neutraliser vessel', tag_number:'R-201', capacity_kl:'', material_of_construction:'SS304', notes:'' },
    { equipment_type:'Bleacher vessel', tag_number:'R-301', capacity_kl:'', material_of_construction:'SS304', notes:'' },
    { equipment_type:'Refined oil storage tank', tag_number:'T-401', capacity_kl:'', material_of_construction:'MS', notes:'' },
    { equipment_type:'Soapstock tank', tag_number:'T-501', capacity_kl:'', material_of_construction:'MS', notes:'' },
  ])
  const [dataConfig, setDataConfig] = useState({ automation_level:'manual', plc_make:'', data_entry_method:'excel', whatsapp_number:'', reading_frequency_hrs:'2' })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data:{ session } }) => {
      if (!session) { router.push('/login'); return }
      let { data: cl } = await supabase.from('clients').select('*').eq('auth_user_id', session.user.id).single()
      if (!cl) {
        const { data: nc } = await supabase.from('clients').insert({
          name: session.user.user_metadata?.company || session.user.email,
          email: session.user.email,
          auth_user_id: session.user.id,
          contact_name: session.user.user_metadata?.name || '',
          whatsapp: session.user.user_metadata?.whatsapp || '',
          vertical: 'edible_oil'
        }).select().single()
        cl = nc
      }
      if (cl) { setClient(cl); setBasics(b => ({ ...b, name:cl.name||'', location:cl.location||'', contact_name:cl.contact_name||'' })) }
    })
  }, [])

  useEffect(() => {
    const enabled = PROCESS_UNITS.filter(p => processes[p.key]).map(p => p.label)
    setSequence(prev => {
      const kept = prev.filter(p => enabled.includes(p))
      const added = enabled.filter(p => !prev.includes(p))
      return [...kept, ...added]
    })
  }, [processes])

  function moveInSequence(from, to) {
    const s = [...sequence]
    const [item] = s.splice(from, 1)
    s.splice(to, 0, item)
    setSequence(s)
  }

  function setDetail(key, val) {
    setProcessDetails(p => ({ ...p, [key]:val }))
  }

  async function saveAndContinue() {
    setSaving(true)
    try {
      if (step === 1 && client) {
        await supabase.from('clients').update({
          name: basics.name, location: basics.location,
          capacity_tpd: parseInt(basics.capacity_tpd) || 20,
          vertical: 'edible_oil', contact_name: basics.contact_name, phone: basics.phone
        }).eq('id', client.id)
      }

      if (step === 2) {
        for (const f of feedstocks) {
          await supabase.from('plant_feedstocks').insert({ ...f, client_id: client.id })
        }
      }

      if (step === 3 || step === 4) {
        const payload = {
          client_id: client.id,
          ...processes,
          ...processDetails,
          process_sequence: sequence,
          updated_at: new Date().toISOString()
        }
        const { data: existing } = await supabase.from('plant_processes').select('id').eq('client_id', client.id).single()
        if (existing) await supabase.from('plant_processes').update(payload).eq('id', existing.id)
        else await supabase.from('plant_processes').insert(payload)
      }

      if (step === 5) {
        const valid = batches.filter(b => b.date || b.feedstock)
        for (const b of valid) {
          await supabase.from('plant_batch_history').insert({
            client_id: client.id,
            batch_date: b.date || null,
            feedstock_type: b.feedstock,
            feed_quantity_mt: parseFloat(b.qty_mt) || null,
            feed_ffa_pct: parseFloat(b.feed_ffa) || null,
            feed_moisture_pct: parseFloat(b.feed_moisture) || null,
            neutral_oil_ffa_pct: parseFloat(b.neutral_ffa) || null,
            refining_loss_pct: parseFloat(b.refining_loss) || null,
            notes: b.notes
          })
        }
      }

      if (step === 6) {
        for (const e of equipment.filter(e => e.equipment_type)) {
          await supabase.from('plant_equipment').insert({ ...e, client_id: client.id })
        }
      }

      if (step === 7) {
        const { data: existing } = await supabase.from('plant_processes').select('id').eq('client_id', client.id).single()
        if (existing) {
          await supabase.from('plant_processes').update({
            automation_level: dataConfig.automation_level,
            plc_make: dataConfig.plc_make,
            data_entry_method: dataConfig.data_entry_method,
          }).eq('id', existing.id)
        }
        await supabase.from('plant_onboarding_progress').upsert({
          client_id: client.id, current_step: 7, status:'submitted',
          submitted_at: new Date().toISOString(), completed_steps:[1,2,3,4,5,6,7]
        }, { onConflict:'client_id' })
        setSaved(true)
        setSaving(false)
        return
      }

      setSaving(false)
      setStep(s => s + 1)
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  if (saved) return (
    <div style={{ ...pageStyle, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{fonts}</style>
      <div style={{ textAlign:'center', maxWidth:480, padding:32 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(29,158,117,0.15)', border:'1.5px solid #1D9E75', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:28 }}>✓</div>
        <div style={{ fontSize:22, fontWeight:500, marginBottom:12 }}>Refinery onboarded</div>
        <div style={{ fontSize:14, color:'#7D8590', lineHeight:1.7, marginBottom:32 }}>
          Your refinery profile is complete. Kenop now knows your process route, feedstocks, and historical performance. Your dashboard will show plant-specific intelligence — refining loss trends, separator efficiency, and AI answers that reference your actual data.
        </div>
        <div style={{ fontSize:10, color:'rgba(29,158,117,0.4)', letterSpacing:'0.3em', marginBottom:24, fontFamily:'monospace' }}>
          THE USER SHALL RECEIVE MORE THAN THEY GIVE · KENOPANISHAD
        </div>
        <button onClick={() => router.push('/dashboard')} style={btnPrimary}>Go to dashboard →</button>
      </div>
    </div>
  )

  return (
    <div style={pageStyle}>
      <style>{fonts}</style>

      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 32px', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
        <div>
          <span style={{ fontSize:10, color:'rgba(29,158,117,0.5)', letterSpacing:'0.3em', fontFamily:'monospace', display:'block' }}>अथ</span>
          <span style={{ fontSize:18, fontWeight:600, letterSpacing:'0.08em' }}>KEN<span style={{ color:'#1D9E75' }}>OP</span></span>
        </div>
        <div style={{ fontSize:12, color:'#7D8590' }}>Edible oil refinery onboarding</div>
      </div>

      {/* STEP INDICATOR */}
      <div style={{ padding:'24px 32px 0', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:4, minWidth:560 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor: s.n < step ? 'pointer' : 'default' }}
              onClick={() => s.n < step && setStep(s.n)}>
              <div style={{ display:'flex', alignItems:'center', width:'100%' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12,
                  background: s.n < step ? '#1D9E75' : s.n === step ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.06)',
                  border:`1.5px solid ${s.n <= step ? '#1D9E75' : 'rgba(255,255,255,0.1)'}`,
                  color: s.n < step ? '#fff' : s.n === step ? '#1D9E75' : '#7D8590', fontWeight: s.n === step ? 600 : 400 }}>
                  {s.n < step ? '✓' : s.n}
                </div>
                {i < STEPS.length - 1 && <div style={{ flex:1, height:'1px', background: s.n < step ? '#1D9E75' : 'rgba(255,255,255,0.06)', margin:'0 4px' }} />}
              </div>
              <span style={{ fontSize:10, color: s.n === step ? '#1D9E75' : '#7D8590', textAlign:'center', whiteSpace:'nowrap' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 32px', flex:1, width:'100%' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <StepHeader n={1} title="Tell us about your refinery" sub="Basic information to set up your plant profile" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[
                { key:'name', label:'Company / plant name', full:true },
                { key:'location', label:'Location (city, state)' },
                { key:'capacity_tpd', label:'Refining capacity (TPD)', type:'number' },
                { key:'contact_name', label:'Contact person name' },
                { key:'phone', label:'WhatsApp number', type:'tel' },
                { key:'email', label:'Email address', type:'email' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                  <Label>{f.label}</Label>
                  <Input type={f.type||'text'} value={basics[f.key]} placeholder={f.label}
                    onChange={e => setBasics(p => ({ ...p, [f.key]:e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <StepHeader n={2} title="Crude oil feedstocks" sub="What oils does your refinery process?" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
              {FEEDSTOCK_TYPES.map(ft => {
                const active = feedstocks.some(f => f.feedstock_type === ft)
                return (
                  <div key={ft} onClick={() => {
                    if (active) setFeedstocks(prev => prev.filter(f => f.feedstock_type !== ft))
                    else setFeedstocks(prev => [...prev, { feedstock_type:ft, typical_ffa_pct:'', monthly_volume_mt:'', is_primary:prev.length===0 }])
                  }} style={{ padding:'12px 16px', borderRadius:8, cursor:'pointer', transition:'all 0.15s',
                    background: active ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                    border:`0.5px solid ${active ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius:4, border:`1.5px solid ${active ? '#1D9E75' : 'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {active && <div style={{ width:8, height:8, borderRadius:2, background:'#1D9E75' }} />}
                    </div>
                    <span style={{ fontSize:13, color: active ? '#E6EDF3' : '#7D8590' }}>{ft}</span>
                  </div>
                )
              })}
            </div>
            {feedstocks.length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:10, overflow:'hidden' }}>
                <div style={{ padding:'10px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', fontSize:11, color:'#7D8590' }}>Add typical parameters for selected feedstocks</div>
                {feedstocks.map((f, i) => (
                  <div key={i} style={{ padding:'10px 16px', borderBottom: i<feedstocks.length-1 ? '0.5px solid rgba(255,255,255,0.04)':'none', display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#E6EDF3' }}>{f.feedstock_type}</span>
                    <div>
                      <Label>Typical FFA%</Label>
                      <Input type="number" value={f.typical_ffa_pct} placeholder="e.g. 2.5"
                        onChange={e => setFeedstocks(prev => prev.map((x,j) => j===i ? {...x,typical_ffa_pct:e.target.value}:x))}
                        style={{ padding:'6px 10px', fontSize:12 }} />
                    </div>
                    <div>
                      <Label>Monthly volume (MT)</Label>
                      <Input type="number" value={f.monthly_volume_mt} placeholder="e.g. 500"
                        onChange={e => setFeedstocks(prev => prev.map((x,j) => j===i ? {...x,monthly_volume_mt:e.target.value}:x))}
                        style={{ padding:'6px 10px', fontSize:12 }} />
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, paddingTop:16 }}>
                      <input type="checkbox" checked={f.is_primary}
                        onChange={e => setFeedstocks(prev => prev.map((x,j) => ({...x,is_primary:j===i?e.target.checked:false})))} />
                      <span style={{ fontSize:10, color:'#7D8590' }}>Primary</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <StepHeader n={3} title="Process capabilities" sub="Select all unit operations your refinery has" />

            {/* Live badge notice */}
            <div style={{ display:'flex', gap:12, marginBottom:20, alignItems:'center', padding:'10px 14px', background:'rgba(29,158,117,0.06)', border:'0.5px solid rgba(29,158,117,0.15)', borderRadius:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#1D9E75', flexShrink:0, boxShadow:'0 0 8px rgba(29,158,117,0.5)' }} />
              <span style={{ fontSize:12, color:'#7D8590' }}>
                <span style={{ color:'#1D9E75', fontWeight:500 }}>Live now:</span> Neutralisation and Separator sections are active on the platform. Other sections are being added — select all that apply, data collection will follow as sections go live.
              </span>
            </div>

            {['Pretreatment','Chemical refining','Physical refining','Byproduct','Equipment'].map(group => (
              <div key={group} style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, color:'#7D8590', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, paddingBottom:6, borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>{group}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {PROCESS_UNITS.filter(p => p.group === group).map(p => (
                    <div key={p.key}>
                      <div onClick={() => setProcesses(prev => ({ ...prev, [p.key]:!prev[p.key] }))}
                        style={{ padding:'12px 16px', borderRadius:8, cursor:'pointer', transition:'all 0.15s',
                          background: processes[p.key] ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                          border:`0.5px solid ${processes[p.key] ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          display:'flex', gap:12, alignItems:'center' }}>
                        <div style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${processes[p.key] ? '#1D9E75' : 'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {processes[p.key] && <div style={{ width:9, height:9, borderRadius:2, background:'#1D9E75' }} />}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:13, fontWeight:500, color: processes[p.key] ? '#E6EDF3' : '#7D8590' }}>{p.label}</span>
                            {p.live && <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(29,158,117,0.2)', color:'#1D9E75', letterSpacing:'0.08em' }}>LIVE</span>}
                            {!p.live && <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(255,255,255,0.06)', color:'#7D8590', letterSpacing:'0.08em' }}>COMING SOON</span>}
                          </div>
                          <div style={{ fontSize:11, color:'#7D8590', marginTop:2 }}>{p.desc}</div>
                        </div>
                      </div>

                      {/* Sub-fields when selected */}
                      {processes[p.key] && p.sub && (
                        <div style={{ marginTop:4, marginLeft:16, background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.06)', borderRadius:8, padding:'14px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                          {p.sub.map(sf => (
                            <div key={sf.key}>
                              <Label>{sf.label}</Label>
                              {sf.type === 'select' ? (
                                <Select value={processDetails[sf.key]||''} onChange={e => setDetail(sf.key, e.target.value)}>
                                  <option value="">Select...</option>
                                  {sf.options.map(o => <option key={o}>{o}</option>)}
                                </Select>
                              ) : (
                                <Input type={sf.type} value={processDetails[sf.key]||''}
                                  onChange={e => setDetail(sf.key, e.target.value)}
                                  placeholder={sf.label} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <StepHeader n={4} title="Process sequence" sub="Arrange the order your refinery processes each batch of oil" />
            {sequence.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#7D8590', fontSize:13 }}>
                No processes selected. Go back to Step 3 to select your unit operations.
              </div>
            ) : (
              <div>
                <div style={{ fontSize:12, color:'#7D8590', marginBottom:16 }}>Use ↑ ↓ to reorder. The AI learns this exact sequence to understand your process flow.</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {sequence.map((item, i) => (
                    <div key={item} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'12px 16px' }}>
                      <div style={{ width:24, height:24, borderRadius:6, background:'rgba(29,158,117,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#1D9E75', flexShrink:0 }}>{i+1}</div>
                      <span style={{ flex:1, fontSize:13, color:'#E6EDF3' }}>{item}</span>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => i>0 && moveInSequence(i,i-1)} style={{ ...iconBtn, opacity:i===0?0.3:1 }}>↑</button>
                        <button onClick={() => i<sequence.length-1 && moveInSequence(i,i+1)} style={{ ...iconBtn, opacity:i===sequence.length-1?0.3:1 }}>↓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div>
            <StepHeader n={5} title="Last 10 days / batch records" sub="Enter what you have — even 3 batches helps the AI understand your refinery's normal performance" />
            <div style={{ fontSize:11, color:'#7D8590', marginBottom:14 }}>
              NO = Neutral oil · BO = Bleached oil · DO = Deodorised oil. Leave blank what you do not measure.
            </div>
            <div style={{ overflowX:'auto', marginBottom:12 }}>
              <table style={{ borderCollapse:'collapse', fontSize:11, whiteSpace:'nowrap' }}>
                <thead>
                  <tr>
                    {BATCH_FIELDS.map(f => (
                      <th key={f.key} style={{ padding:'8px 6px', textAlign:'left', color:'#7D8590', fontWeight:400, borderBottom:'0.5px solid rgba(255,255,255,0.08)', minWidth:f.width }}>
                        {f.label}
                      </th>
                    ))}
                    <th style={{ padding:'8px 6px' }}>
                      <button onClick={() => setBatches(prev => [...prev, emptyBatch()])} style={{ ...iconBtn, fontSize:14 }}>+</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b, i) => (
                    <tr key={i} style={{ borderBottom:'0.5px solid rgba(255,255,255,0.04)' }}>
                      {BATCH_FIELDS.map(f => (
                        <td key={f.key} style={{ padding:'4px 6px' }}>
                          <input type={f.type} value={b[f.key]}
                            onChange={e => setBatches(prev => prev.map((x,j) => j===i ? {...x,[f.key]:e.target.value}:x))}
                            style={{ ...inputStyle, padding:'5px 6px', fontSize:11, width:f.width-8 }} />
                        </td>
                      ))}
                      <td style={{ padding:'4px 6px' }}>
                        <button onClick={() => setBatches(prev => prev.filter((_,j) => j!==i))} style={{ ...iconBtn, color:'#F85149' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize:11, color:'#7D8590' }}>The AI uses this data to establish your baseline performance and detect anomalies.</div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div>
            <StepHeader n={6} title="Equipment and tank inventory" sub="Capacities help the AI understand your plant scale and throughput limits" />
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 2fr auto', gap:8, marginBottom:8 }}>
              {['Equipment / Tank', 'Tag no.', 'Capacity KL', 'MOC', 'Notes', ''].map(h => (
                <div key={h} style={{ fontSize:10, color:'#7D8590', paddingBottom:4 }}>{h}</div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
              {equipment.map((e, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 2fr auto', gap:8, alignItems:'center' }}>
                  <Input value={e.equipment_type} placeholder="Equipment type"
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,equipment_type:ev.target.value}:x))} />
                  <Input value={e.tag_number} placeholder="T-101"
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,tag_number:ev.target.value}:x))} />
                  <Input type="number" value={e.capacity_kl} placeholder="KL"
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,capacity_kl:ev.target.value}:x))} />
                  <Select value={e.material_of_construction}
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,material_of_construction:ev.target.value}:x))}>
                    {['MS','SS304','SS316','HDPE','FRP'].map(m => <option key={m}>{m}</option>)}
                  </Select>
                  <Input value={e.notes} placeholder="Notes"
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,notes:ev.target.value}:x))} />
                  <button onClick={() => setEquipment(prev => prev.filter((_,j) => j!==i))} style={{ ...iconBtn, color:'#F85149', fontSize:16 }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => setEquipment(prev => [...prev, { equipment_type:'', tag_number:'', capacity_kl:'', material_of_construction:'SS304', notes:'' }])}
              style={{ fontSize:12, color:'#1D9E75', background:'rgba(29,158,117,0.08)', border:'0.5px solid rgba(29,158,117,0.2)', borderRadius:7, padding:'7px 16px' }}>
              + Add equipment
            </button>
          </div>
        )}

        {/* STEP 7 */}
        {step === 7 && (
          <div>
            <StepHeader n={7} title="How will operators send readings to Kenop?" sub="Choose what fits your plant — no change to how your team works" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <div>
                <Label>Automation level</Label>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
                  {[
                    { v:'manual', l:'Manual — paper register or Excel, no PLC' },
                    { v:'semi_auto', l:'Semi-auto — some automated instruments' },
                    { v:'plc', l:'PLC connected — programmable logic controller' },
                    { v:'scada', l:'SCADA — full digital control system' },
                  ].map(opt => (
                    <div key={opt.v} onClick={() => setDataConfig(p => ({ ...p, automation_level:opt.v }))}
                      style={{ padding:'10px 14px', borderRadius:7, cursor:'pointer', transition:'all 0.15s',
                        background: dataConfig.automation_level===opt.v ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                        border:`0.5px solid ${dataConfig.automation_level===opt.v ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', border:`1.5px solid ${dataConfig.automation_level===opt.v ? '#1D9E75' : 'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {dataConfig.automation_level===opt.v && <div style={{ width:7, height:7, borderRadius:'50%', background:'#1D9E75' }} />}
                      </div>
                      <span style={{ fontSize:12, color: dataConfig.automation_level===opt.v ? '#E6EDF3' : '#7D8590' }}>{opt.l}</span>
                    </div>
                  ))}
                </div>
                {(dataConfig.automation_level==='plc'||dataConfig.automation_level==='scada') && (
                  <div>
                    <Label>PLC / SCADA make and model</Label>
                    <Input value={dataConfig.plc_make} placeholder="e.g. Siemens S7-1200"
                      onChange={e => setDataConfig(p => ({ ...p, plc_make:e.target.value }))} />
                  </div>
                )}
              </div>

              <div>
                <Label>How operators will send readings</Label>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                  {[
                    { v:'excel', l:'Excel macro — auto-sends on Ctrl+S save', icon:'📊' },
                    { v:'whatsapp', l:'WhatsApp — operator sends readings as message', icon:'💬' },
                    { v:'both', l:'Both — Excel for lab, WhatsApp for shift', icon:'🔄' },
                    { v:'platform', l:'Platform — operators use kenop.in/lab directly', icon:'🖥️' },
                  ].map(opt => (
                    <div key={opt.v} onClick={() => setDataConfig(p => ({ ...p, data_entry_method:opt.v }))}
                      style={{ padding:'10px 14px', borderRadius:7, cursor:'pointer', transition:'all 0.15s',
                        background: dataConfig.data_entry_method===opt.v ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                        border:`0.5px solid ${dataConfig.data_entry_method===opt.v ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        display:'flex', gap:10, alignItems:'center' }}>
                      <span style={{ fontSize:14 }}>{opt.icon}</span>
                      <div style={{ width:12, height:12, borderRadius:'50%', border:`1.5px solid ${dataConfig.data_entry_method===opt.v ? '#1D9E75' : 'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {dataConfig.data_entry_method===opt.v && <div style={{ width:6, height:6, borderRadius:'50%', background:'#1D9E75' }} />}
                      </div>
                      <span style={{ fontSize:12, color: dataConfig.data_entry_method===opt.v ? '#E6EDF3' : '#7D8590' }}>{opt.l}</span>
                    </div>
                  ))}
                </div>

                <Label>Reading frequency</Label>
                <Select value={dataConfig.reading_frequency_hrs}
                  onChange={e => setDataConfig(p => ({ ...p, reading_frequency_hrs:e.target.value }))}>
                  {['1','2','4','8','12','24'].map(h => <option key={h} value={h}>{h==='1'?'Every hour':`Every ${h} hours`}</option>)}
                </Select>

                {(dataConfig.data_entry_method==='whatsapp'||dataConfig.data_entry_method==='both') && (
                  <div style={{ marginTop:12 }}>
                    <Label>Operator WhatsApp number</Label>
                    <Input value={dataConfig.whatsapp_number} placeholder="+91 9876543210"
                      onChange={e => setDataConfig(p => ({ ...p, whatsapp_number:e.target.value }))} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ background:'rgba(29,158,117,0.06)', border:'0.5px solid rgba(29,158,117,0.15)', borderRadius:10, padding:'16px 20px', marginTop:20 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#1D9E75', marginBottom:8 }}>What activates after submission</div>
              <div style={{ fontSize:12, color:'#7D8590', lineHeight:1.8 }}>
                Your refinery profile will be reviewed and activated within 24 hours. Once live, your dashboard shows refining loss trends, separator efficiency, soapstock value, and AI answers that reference your actual plant data and historical batch performance. Morning reports will be tailored to your specific process route.
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:24, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => step>1 && setStep(s => s-1)} disabled={step===1}
            style={{ fontSize:13, color:'#7D8590', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 20px', cursor:step===1?'not-allowed':'pointer', opacity:step===1?0.4:1 }}>
            ← Back
          </button>
          <button onClick={saveAndContinue} disabled={saving} style={btnPrimary}>
            {saving ? 'Saving...' : step===7 ? 'Submit and activate →' : 'Save and continue →'}
          </button>
        </div>
      </div>

      <div style={{ textAlign:'center', padding:'14px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.1)', letterSpacing:'0.25em', fontFamily:'monospace' }}>
          E SHAKTI BINARY CURRENTS PRIVATE LIMITED
        </span>
      </div>
    </div>
  )
}