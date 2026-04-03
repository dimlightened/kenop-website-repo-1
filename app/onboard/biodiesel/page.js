'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STEPS = [
  { n: 1, label: 'Plant basics',       icon: '🏭' },
  { n: 2, label: 'Feedstocks',         icon: '🛢️' },
  { n: 3, label: 'Process units',      icon: '⚙️' },
  { n: 4, label: 'Process sequence',   icon: '🔄' },
  { n: 5, label: 'Batch records',      icon: '📋' },
  { n: 6, label: 'Equipment & tanks',  icon: '🔧' },
  { n: 7, label: 'Data collection',    icon: '📡' },
]

const PROCESS_UNITS = [
  { key: 'has_acid_oil_washing',      label: 'Acid oil washing',         group: 'Pretreatment',      desc: 'Washing soapstock/acid oil before processing' },
  { key: 'has_bleaching',             label: 'Bleaching',                group: 'Pretreatment',      desc: 'ABE treatment for colour and metals removal' },
  { key: 'has_plf_filter_press',      label: 'PLF / Filter press',       group: 'Pretreatment',      desc: 'Pressure leaf filter or plate-and-frame press' },
  { key: 'has_acid_esterification',   label: 'Acid esterification',      group: 'Esterification',    desc: 'H₂SO₄ catalyst, methanol, high FFA conversion' },
  { key: 'has_enzymatic_esterification', label: 'Enzymatic esterification', group: 'Esterification', desc: 'Lipase catalyst, single-step FFA + glyceride' },
  { key: 'has_glycerolysis',          label: 'Glycerolysis',             group: 'Esterification',    desc: 'High-temp glycerol + FFA → glycerides' },
  { key: 'has_transesterification',   label: 'Transesterification',      group: 'Biodiesel',         desc: 'NaOH/KOH + methanol, triglyceride → FAME' },
  { key: 'has_water_wash',            label: 'Water washing',            group: 'Purification',      desc: 'Hot water wash to remove soap and catalyst' },
  { key: 'has_dry_wash',              label: 'Dry washing',              group: 'Purification',      desc: 'Adsorbent or ion exchange resin polishing' },
  { key: 'has_ion_exchange',          label: 'Ion exchange resin',       group: 'Purification',      desc: 'Lead-lag resin columns, trace glycerol removal' },
  { key: 'has_centrifuge',            label: 'Centrifuge / Separator',   group: 'Purification',      desc: 'Disc stack centrifuge for phase separation' },
  { key: 'has_post_wash_bleaching',   label: 'Post-wash bleaching',      group: 'Purification',      desc: 'ABE treatment after water wash' },
  { key: 'has_fame_distillation',     label: 'FAME distillation',        group: 'Purification',      desc: 'Vacuum distillation for IS 15607 compliance' },
  { key: 'has_methanol_recovery',     label: 'Methanol recovery',        group: 'Recovery',          desc: 'Flash or distillation methanol recycle' },
  { key: 'has_glycerine_split',       label: 'Glycerine splitting',      group: 'Recovery',          desc: 'Acid splitting of crude glycerol' },
  { key: 'has_glycerine_purification',label: 'Glycerine purification',   group: 'Recovery',          desc: 'Evaporation to 80%+ crude glycerine' },
  { key: 'has_glycerine_distillation',label: 'Glycerine distillation',   group: 'Recovery',          desc: 'Pharmaceutical/food grade glycerine' },
]

const FEEDSTOCK_TYPES = [
  'Acid oil (soybean refinery)',
  'Acid oil (cottonseed refinery)',
  'Acid oil (palm refinery)',
  'PFAD (palm fatty acid distillate)',
  'Used cooking oil (UCO)',
  'Animal tallow (beef)',
  'Animal tallow (chicken)',
  'Palm stearin',
  'Non-edible oil (jatropha)',
  'Algal oil',
  'Other'
]

const BATCH_FIELDS = [
  { key: 'batch_number',          label: 'Batch no.',      type: 'text',   width: 80 },
  { key: 'batch_date',            label: 'Date',           type: 'date',   width: 110 },
  { key: 'feedstock_type',        label: 'Feedstock',      type: 'text',   width: 120 },
  { key: 'feed_quantity_mt',      label: 'Feed (MT)',      type: 'number', width: 80 },
  { key: 'feed_ffa_pct',          label: 'Feed FFA%',      type: 'number', width: 80 },
  { key: 'feed_av',               label: 'Feed AV',        type: 'number', width: 70 },
  { key: 'post_esterification_av',label: 'Post-est AV',    type: 'number', width: 90 },
  { key: 'methanol_used_kg',      label: 'MeOH (kg)',      type: 'number', width: 80 },
  { key: 'catalyst_used_kg',      label: 'Cat. (kg)',      type: 'number', width: 80 },
  { key: 'glycerol_recovered_kg', label: 'Gly. (kg)',      type: 'number', width: 80 },
  { key: 'fame_yield_pct',        label: 'Yield %',        type: 'number', width: 70 },
  { key: 'fame_flash_point_degc', label: 'Flash°C',        type: 'number', width: 75 },
  { key: 'fame_cfpp_degc',        label: 'CFPP°C',         type: 'number', width: 70 },
  { key: 'passed_is15607',        label: 'IS pass?',       type: 'bool',   width: 70 },
]

function emptyBatch() {
  return BATCH_FIELDS.reduce((a, f) => ({ ...a, [f.key]: '' }), {})
}

export default function BiodieselOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [client, setClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Step 1: Plant basics
  const [basics, setBasics] = useState({
    name: '', location: '', capacity_tpd: '', vertical: 'biodiesel',
    contact_name: '', phone: '', email: ''
  })

  // Step 2: Feedstocks
  const [feedstocks, setFeedstocks] = useState([])
  const [newFeedstock, setNewFeedstock] = useState({ feedstock_type: '', typical_ffa_pct: '', monthly_volume_mt: '', is_primary: false })

  // Step 3: Process units
  const [processes, setProcesses] = useState(
    PROCESS_UNITS.reduce((a, p) => ({ ...a, [p.key]: false }), {})
  )

  // Step 4: Process sequence
  const [sequence, setSequence] = useState([])

  // Step 5: Batch records
  const [batches, setBatches] = useState(Array(5).fill(null).map(emptyBatch))

  // Step 6: Equipment
  const [equipment, setEquipment] = useState([
    { equipment_type: 'Feed storage tank', tag_number: 'T-101', capacity_kl: '', material_of_construction: 'MS', notes: '' },
    { equipment_type: 'Reaction vessel', tag_number: 'R-201', capacity_kl: '', material_of_construction: 'SS304', notes: '' },
    { equipment_type: 'FAME storage tank', tag_number: 'T-301', capacity_kl: '', material_of_construction: 'MS', notes: '' },
    { equipment_type: 'Glycerine storage tank', tag_number: 'T-401', capacity_kl: '', material_of_construction: 'MS', notes: '' },
  ])

  // Step 7: Data collection
  const [dataConfig, setDataConfig] = useState({
    automation_level: 'manual',
    plc_make: '',
    data_entry_method: 'excel',
    whatsapp_number: '',
    excel_format: '',
    reading_frequency_hrs: '2'
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      supabase.from('clients').select('*').eq('auth_user_id', session.user.id).single()
        .then(({ data }) => { if (data) setClient(data) })
    })
  }, [])

  // Update sequence when processes change
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

  async function saveAndContinue() {
    setSaving(true)
    try {
      if (step === 1 && client) {
        await supabase.from('clients').update({
          name: basics.name, location: basics.location,
          capacity_tpd: parseInt(basics.capacity_tpd) || 20,
          vertical: 'biodiesel', contact_name: basics.contact_name,
          phone: basics.phone
        }).eq('id', client.id)
      }
      if (step === 2) {
        for (const f of feedstocks) {
          await supabase.from('plant_feedstocks').upsert({ ...f, client_id: client.id })
        }
      }
      if (step === 3 || step === 4) {
        const { data: existing } = await supabase.from('plant_processes').select('id').eq('client_id', client.id).single()
        const payload = { ...processes, process_sequence: sequence, client_id: client.id, updated_at: new Date().toISOString() }
        if (existing) await supabase.from('plant_processes').update(payload).eq('id', existing.id)
        else await supabase.from('plant_processes').insert(payload)
      }
      if (step === 5) {
        const validBatches = batches.filter(b => b.batch_number)
        for (const b of validBatches) {
          await supabase.from('plant_batch_history').insert({ ...b, client_id: client.id })
        }
      }
      if (step === 6) {
        const validEq = equipment.filter(e => e.equipment_type)
        for (const e of validEq) {
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
          client_id: client.id, current_step: 7, status: 'submitted',
          submitted_at: new Date().toISOString(), completed_steps: [1,2,3,4,5,6,7]
        }, { onConflict: 'client_id' })
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
    <div style={{ ...pageStyle, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:48, marginBottom:20 }}>✓</div>
        <div style={{ fontSize:22, fontWeight:500, color:'#E6EDF3', marginBottom:12 }}>Plant onboarded successfully</div>
        <div style={{ fontSize:14, color:'#7D8590', lineHeight:1.7, marginBottom:32 }}>
          Your plant profile is complete. The Kenop AI now knows your process capabilities, feedstocks, and historical performance. Your dashboard will be ready with plant-specific intelligence.
        </div>
        <div style={{ fontSize:10, color:'rgba(29,158,117,0.5)', letterSpacing:'0.3em', marginBottom:24, fontFamily:'monospace' }}>
          THE USER SHALL RECEIVE MORE THAN THEY GIVE · KENOPANISHAD
        </div>
        <button onClick={() => router.push('/dashboard')} style={btnPrimary}>
          Go to dashboard →
        </button>
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
          <span style={{ fontSize:18, fontWeight:600, color:'#E6EDF3', letterSpacing:'0.08em' }}>KEN<span style={{ color:'#1D9E75' }}>OP</span></span>
        </div>
        <div style={{ fontSize:12, color:'#7D8590' }}>Biodiesel plant onboarding</div>
      </div>

      {/* STEP INDICATOR */}
      <div style={{ padding:'24px 32px 0', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:4, minWidth:600 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor: s.n <= step ? 'pointer' : 'default' }}
              onClick={() => s.n < step && setStep(s.n)}>
              <div style={{ display:'flex', alignItems:'center', width:'100%' }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:12,
                  background: s.n < step ? '#1D9E75' : s.n === step ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${s.n <= step ? '#1D9E75' : 'rgba(255,255,255,0.1)'}`,
                  color: s.n < step ? '#fff' : s.n === step ? '#1D9E75' : '#7D8590',
                  fontWeight: s.n === step ? 600 : 400
                }}>
                  {s.n < step ? '✓' : s.n}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex:1, height:'1px', background: s.n < step ? '#1D9E75' : 'rgba(255,255,255,0.06)', margin:'0 4px' }} />
                )}
              </div>
              <span style={{ fontSize:10, color: s.n === step ? '#1D9E75' : '#7D8590', letterSpacing:'0.03em', textAlign:'center', whiteSpace:'nowrap' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP CONTENT */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 32px', flex:1 }}>

        {/* STEP 1: PLANT BASICS */}
        {step === 1 && (
          <div>
            <StepHeader n={1} title="Tell us about your plant" sub="Basic information to set up your plant profile" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[
                { key:'name', label:'Plant / Company name', full:true },
                { key:'location', label:'Location (city, state)' },
                { key:'capacity_tpd', label:'Processing capacity (TPD)', type:'number' },
                { key:'contact_name', label:'Contact person name' },
                { key:'phone', label:'WhatsApp number', type:'tel' },
                { key:'email', label:'Email address', type:'email' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                  <Label>{f.label}</Label>
                  <Input
                    type={f.type || 'text'}
                    value={basics[f.key]}
                    onChange={e => setBasics(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.label}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: FEEDSTOCKS */}
        {step === 2 && (
          <div>
            <StepHeader n={2} title="Applicable feedstocks" sub="What raw materials does your plant process?" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {FEEDSTOCK_TYPES.map(ft => {
                const active = feedstocks.some(f => f.feedstock_type === ft)
                return (
                  <div key={ft} onClick={() => {
                    if (active) setFeedstocks(prev => prev.filter(f => f.feedstock_type !== ft))
                    else setFeedstocks(prev => [...prev, { feedstock_type: ft, typical_ffa_pct: '', monthly_volume_mt: '', is_primary: prev.length === 0 }])
                  }} style={{
                    padding:'12px 16px', borderRadius:8, cursor:'pointer',
                    background: active ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `0.5px solid ${active ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    display:'flex', alignItems:'center', gap:10, transition:'all 0.15s'
                  }}>
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
                <div style={{ padding:'12px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', fontSize:12, color:'#7D8590' }}>Add details for selected feedstocks</div>
                {feedstocks.map((f, i) => (
                  <div key={i} style={{ padding:'12px 16px', borderBottom: i < feedstocks.length-1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#E6EDF3' }}>{f.feedstock_type}</span>
                    <div>
                      <Label style={{ fontSize:10 }}>Typical FFA%</Label>
                      <Input type="number" value={f.typical_ffa_pct} placeholder="e.g. 65"
                        onChange={e => setFeedstocks(prev => prev.map((x,j) => j===i ? {...x, typical_ffa_pct: e.target.value} : x))}
                        style={{ padding:'6px 10px', fontSize:12 }} />
                    </div>
                    <div>
                      <Label style={{ fontSize:10 }}>Monthly volume (MT)</Label>
                      <Input type="number" value={f.monthly_volume_mt} placeholder="e.g. 200"
                        onChange={e => setFeedstocks(prev => prev.map((x,j) => j===i ? {...x, monthly_volume_mt: e.target.value} : x))}
                        style={{ padding:'6px 10px', fontSize:12 }} />
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <input type="checkbox" checked={f.is_primary}
                        onChange={e => setFeedstocks(prev => prev.map((x,j) => ({...x, is_primary: j===i ? e.target.checked : false})))} />
                      <span style={{ fontSize:10, color:'#7D8590' }}>Primary</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PROCESS UNITS */}
        {step === 3 && (
          <div>
            <StepHeader n={3} title="Process capabilities" sub="Select all unit operations your plant has" />
            {['Pretreatment','Esterification','Biodiesel','Purification','Recovery'].map(group => (
              <div key={group} style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, color:'#7D8590', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, paddingBottom:6, borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>{group}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {PROCESS_UNITS.filter(p => p.group === group).map(p => (
                    <div key={p.key} onClick={() => setProcesses(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                      style={{
                        padding:'12px 16px', borderRadius:8, cursor:'pointer', transition:'all 0.15s',
                        background: processes[p.key] ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `0.5px solid ${processes[p.key] ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        display:'flex', gap:12, alignItems:'flex-start'
                      }}>
                      <div style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${processes[p.key] ? '#1D9E75' : 'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                        {processes[p.key] && <div style={{ width:9, height:9, borderRadius:2, background:'#1D9E75' }} />}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color: processes[p.key] ? '#E6EDF3' : '#7D8590', marginBottom:3 }}>{p.label}</div>
                        <div style={{ fontSize:11, color:'#7D8590', lineHeight:1.4 }}>{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 4: PROCESS SEQUENCE */}
        {step === 4 && (
          <div>
            <StepHeader n={4} title="Process sequence" sub="Drag to arrange the order your plant processes materials" />
            {sequence.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#7D8590', fontSize:13 }}>
                No processes selected. Go back to Step 3 and select your unit operations.
              </div>
            ) : (
              <div>
                <div style={{ fontSize:12, color:'#7D8590', marginBottom:16 }}>Click ↑ ↓ to reorder. This sequence tells the AI how your plant processes each batch.</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {sequence.map((item, i) => (
                    <div key={item} style={{
                      display:'flex', alignItems:'center', gap:12,
                      background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)',
                      borderRadius:8, padding:'12px 16px'
                    }}>
                      <div style={{ width:24, height:24, borderRadius:6, background:'rgba(29,158,117,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#1D9E75', flexShrink:0 }}>
                        {i + 1}
                      </div>
                      <span style={{ flex:1, fontSize:13, color:'#E6EDF3' }}>{item}</span>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => i > 0 && moveInSequence(i, i-1)}
                          style={{ ...iconBtn, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                        <button onClick={() => i < sequence.length-1 && moveInSequence(i, i+1)}
                          style={{ ...iconBtn, opacity: i === sequence.length-1 ? 0.3 : 1 }}>↓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: BATCH RECORDS */}
        {step === 5 && (
          <div>
            <StepHeader n={5} title="Last 10 batch records" sub="Enter what you have — even 3-5 batches helps the AI understand your plant performance" />
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
                      <button onClick={() => setBatches(prev => [...prev, emptyBatch()])}
                        style={{ ...iconBtn, fontSize:14 }}>+</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b, i) => (
                    <tr key={i} style={{ borderBottom:'0.5px solid rgba(255,255,255,0.04)' }}>
                      {BATCH_FIELDS.map(f => (
                        <td key={f.key} style={{ padding:'4px 6px' }}>
                          {f.type === 'bool' ? (
                            <select value={b[f.key]} onChange={e => setBatches(prev => prev.map((x,j) => j===i ? {...x,[f.key]:e.target.value==='true'} : x))}
                              style={{ ...inputStyle, padding:'5px 6px', fontSize:11, width:70 }}>
                              <option value="">—</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <input type={f.type} value={b[f.key]}
                              onChange={e => setBatches(prev => prev.map((x,j) => j===i ? {...x,[f.key]:e.target.value} : x))}
                              style={{ ...inputStyle, padding:'5px 6px', fontSize:11, width:f.width - 8 }} />
                          )}
                        </td>
                      ))}
                      <td style={{ padding:'4px 6px' }}>
                        <button onClick={() => setBatches(prev => prev.filter((_,j) => j!==i))}
                          style={{ ...iconBtn, color:'#F85149' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize:11, color:'#7D8590' }}>Leave blank any values you do not have. The AI learns from whatever data is available.</div>
          </div>
        )}

        {/* STEP 6: EQUIPMENT */}
        {step === 6 && (
          <div>
            <StepHeader n={6} title="Equipment and tanks" sub="Storage and process vessel capacities help the AI understand your plant scale" />
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
              {equipment.map((e, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 2fr auto', gap:10, alignItems:'center' }}>
                  <Input value={e.equipment_type} placeholder="Equipment type"
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,equipment_type:ev.target.value} : x))} />
                  <Input value={e.tag_number} placeholder="Tag no."
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,tag_number:ev.target.value} : x))} />
                  <Input type="number" value={e.capacity_kl} placeholder="Capacity KL"
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,capacity_kl:ev.target.value} : x))} />
                  <select value={e.material_of_construction}
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,material_of_construction:ev.target.value} : x))}
                    style={{ ...inputStyle }}>
                    {['MS','SS304','SS316','HDPE','FRP'].map(m => <option key={m}>{m}</option>)}
                  </select>
                  <Input value={e.notes} placeholder="Notes (optional)"
                    onChange={ev => setEquipment(prev => prev.map((x,j) => j===i ? {...x,notes:ev.target.value} : x))} />
                  <button onClick={() => setEquipment(prev => prev.filter((_,j) => j!==i))}
                    style={{ ...iconBtn, color:'#F85149', fontSize:16 }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => setEquipment(prev => [...prev, { equipment_type:'', tag_number:'', capacity_kl:'', material_of_construction:'SS304', notes:'' }])}
              style={{ fontSize:12, color:'#1D9E75', background:'rgba(29,158,117,0.08)', border:'0.5px solid rgba(29,158,117,0.2)', borderRadius:7, padding:'7px 16px', cursor:'pointer' }}>
              + Add equipment
            </button>
          </div>
        )}

        {/* STEP 7: DATA COLLECTION */}
        {step === 7 && (
          <div>
            <StepHeader n={7} title="How your plant records data" sub="This determines how Kenop collects readings from your operators" />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
              <div>
                <Label>Automation level</Label>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {[
                    { v:'manual', l:'Manual — paper or Excel, no PLC' },
                    { v:'semi_auto', l:'Semi-auto — some automated instruments' },
                    { v:'plc', l:'PLC — programmable logic controller' },
                    { v:'scada', l:'SCADA — full digital control system' },
                  ].map(opt => (
                    <div key={opt.v} onClick={() => setDataConfig(p => ({ ...p, automation_level: opt.v }))}
                      style={{ padding:'10px 14px', borderRadius:7, cursor:'pointer', transition:'all 0.15s',
                        background: dataConfig.automation_level === opt.v ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `0.5px solid ${dataConfig.automation_level === opt.v ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', border:`1.5px solid ${dataConfig.automation_level === opt.v ? '#1D9E75' : 'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {dataConfig.automation_level === opt.v && <div style={{ width:7, height:7, borderRadius:'50%', background:'#1D9E75' }} />}
                      </div>
                      <span style={{ fontSize:12, color: dataConfig.automation_level === opt.v ? '#E6EDF3' : '#7D8590' }}>{opt.l}</span>
                    </div>
                  ))}
                </div>
                {(dataConfig.automation_level === 'plc' || dataConfig.automation_level === 'scada') && (
                  <div style={{ marginTop:12 }}>
                    <Label>PLC / SCADA make and model</Label>
                    <Input value={dataConfig.plc_make} placeholder="e.g. Siemens S7-1200"
                      onChange={e => setDataConfig(p => ({ ...p, plc_make: e.target.value }))} />
                  </div>
                )}
              </div>

              <div>
                <Label>How will operators send readings to Kenop?</Label>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                  {[
                    { v:'excel', l:'Excel file — macro-enabled, auto-sends on save' },
                    { v:'whatsapp', l:'WhatsApp — operator sends readings via message' },
                    { v:'both', l:'Both — Excel for lab, WhatsApp for shift' },
                    { v:'platform', l:'Platform — operators use kenop.in/lab directly' },
                  ].map(opt => (
                    <div key={opt.v} onClick={() => setDataConfig(p => ({ ...p, data_entry_method: opt.v }))}
                      style={{ padding:'10px 14px', borderRadius:7, cursor:'pointer', transition:'all 0.15s',
                        background: dataConfig.data_entry_method === opt.v ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `0.5px solid ${dataConfig.data_entry_method === opt.v ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', border:`1.5px solid ${dataConfig.data_entry_method === opt.v ? '#1D9E75' : 'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {dataConfig.data_entry_method === opt.v && <div style={{ width:7, height:7, borderRadius:'50%', background:'#1D9E75' }} />}
                      </div>
                      <span style={{ fontSize:12, color: dataConfig.data_entry_method === opt.v ? '#E6EDF3' : '#7D8590' }}>{opt.l}</span>
                    </div>
                  ))}
                </div>

                <Label>Reading frequency (hours)</Label>
                <select value={dataConfig.reading_frequency_hrs}
                  onChange={e => setDataConfig(p => ({ ...p, reading_frequency_hrs: e.target.value }))}
                  style={{ ...inputStyle }}>
                  {['1','2','4','8','12','24'].map(h => <option key={h} value={h}>{h === '1' ? 'Every hour' : `Every ${h} hours`}</option>)}
                </select>

                {(dataConfig.data_entry_method === 'whatsapp' || dataConfig.data_entry_method === 'both') && (
                  <div style={{ marginTop:12 }}>
                    <Label>Operator WhatsApp number</Label>
                    <Input value={dataConfig.whatsapp_number} placeholder="+91 9876543210"
                      onChange={e => setDataConfig(p => ({ ...p, whatsapp_number: e.target.value }))} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ background:'rgba(29,158,117,0.06)', border:'0.5px solid rgba(29,158,117,0.15)', borderRadius:10, padding:'16px 20px' }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#1D9E75', marginBottom:8 }}>What happens after you submit</div>
              <div style={{ fontSize:12, color:'#7D8590', lineHeight:1.8 }}>
                Your plant profile will be reviewed and activated within 24 hours. Once activated, your dashboard will show plant-specific intelligence — yield analysis, financial performance, process efficiency trends, and AI answers that reference your actual historical data. The Kenop AI will know your plant as well as you do.
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:24, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => step > 1 && setStep(s => s-1)}
            disabled={step === 1}
            style={{ fontSize:13, color:'#7D8590', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 20px', cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1 }}>
            ← Back
          </button>
          <button onClick={saveAndContinue} disabled={saving}
            style={btnPrimary}>
            {saving ? 'Saving...' : step === 7 ? 'Submit and activate →' : 'Save and continue →'}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign:'center', padding:'16px', borderTop:'0.5px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.1)', letterSpacing:'0.25em', fontFamily:'monospace' }}>
          THE USER SHALL RECEIVE MORE THAN THEY GIVE · KENOPANISHAD
        </span>
      </div>
    </div>
  )
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0D1117;color:#E6EDF3;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  input,select,textarea{font-family:'DM Sans',system-ui,sans-serif;outline:none}
  button{font-family:'DM Sans',system-ui,sans-serif}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
`

const pageStyle = {
  background: '#0D1117', minHeight: '100vh', color: '#E6EDF3',
  fontFamily: "'DM Sans',system-ui,sans-serif", display: 'flex', flexDirection: 'column'
}

const inputStyle = {
  width: '100%', background: '#161B22',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: 7, padding: '10px 14px',
  color: '#E6EDF3', fontSize: 13,
}

const btnPrimary = {
  background: '#1D9E75', border: 'none', borderRadius: 8,
  padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 500,
  cursor: 'pointer'
}

const iconBtn = {
  width: 28, height: 28, borderRadius: 6, border: '0.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)', color: '#7D8590', fontSize: 13,
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
}

function StepHeader({ n, title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: 'rgba(29,158,117,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'monospace' }}>
        Step {n} of 7
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, color: '#E6EDF3', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#7D8590' }}>{sub}</div>
    </div>
  )
}

function Label({ children, style }) {
  return <div style={{ fontSize: 11, color: '#7D8590', marginBottom: 6, letterSpacing: '0.02em', ...style }}>{children}</div>
}

function Input({ style, ...props }) {
  return (
    <input {...props} style={{ ...inputStyle, ...style }}
      onFocus={e => e.target.style.borderColor = 'rgba(29,158,117,0.4)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
  )
}