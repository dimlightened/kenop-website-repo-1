'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AcidOilForm() {
  const [client, setClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    soapstock_ffa_pct: '',
    soapstock_soap_pct: '',
    soapstock_moisture_pct: '',
    soapstock_tfm_pct: '',
    soapstock_alkalinity_naoh_eq: '',
    soapstock_batch_volume_mt: '',
    recycled_water_tds_mg_l: '',
    recycled_water_ph: '',
    h2so4_dose_kg: '',
    reaction_temp_hold_degc: '',
    settle_duration_hrs: '',
    endpoint_ph: '',
    soap_check_at_endpoint: '',
    acid_oil_ffa_pct: '',
    acid_oil_moisture_pct: '',
    acid_oil_yield_pct: '',
    separation_behaviour: '',
    rag_layer_collected_kg: '',
    rag_layer_disposition: '',
    notes: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single()
      if (!clientData) { router.push('/dashboard'); return }
      setClient(clientData)
      setLoading(false)
    })
  }, [])

  const update = (k, v) => setForm(f => ({...f, [k]: v}))

  const save = async () => {
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('acidoil_batches')
      .insert({
        client_id: client.id,
        soapstock_ffa_pct: form.soapstock_ffa_pct ? parseFloat(form.soapstock_ffa_pct) : null,
        soapstock_soap_pct: form.soapstock_soap_pct ? parseFloat(form.soapstock_soap_pct) : null,
        soapstock_moisture_pct: form.soapstock_moisture_pct ? parseFloat(form.soapstock_moisture_pct) : null,
        soapstock_tfm_pct: form.soapstock_tfm_pct ? parseFloat(form.soapstock_tfm_pct) : null,
        soapstock_alkalinity_naoh_eq: form.soapstock_alkalinity_naoh_eq ? parseFloat(form.soapstock_alkalinity_naoh_eq) : null,
        soapstock_batch_volume_mt: form.soapstock_batch_volume_mt ? parseFloat(form.soapstock_batch_volume_mt) : null,
        recycled_water_tds_mg_l: form.recycled_water_tds_mg_l ? parseInt(form.recycled_water_tds_mg_l) : null,
        recycled_water_ph: form.recycled_water_ph ? parseFloat(form.recycled_water_ph) : null,
        h2so4_dose_kg: form.h2so4_dose_kg ? parseFloat(form.h2so4_dose_kg) : null,
        reaction_temp_hold_degc: form.reaction_temp_hold_degc ? parseFloat(form.reaction_temp_hold_degc) : null,
        settle_duration_hrs: form.settle_duration_hrs ? parseFloat(form.settle_duration_hrs) : null,
        endpoint_ph: form.endpoint_ph ? parseFloat(form.endpoint_ph) : null,
        soap_check_at_endpoint: form.soap_check_at_endpoint,
        acid_oil_ffa_pct: form.acid_oil_ffa_pct ? parseFloat(form.acid_oil_ffa_pct) : null,
        acid_oil_moisture_pct: form.acid_oil_moisture_pct ? parseFloat(form.acid_oil_moisture_pct) : null,
        acid_oil_yield_pct: form.acid_oil_yield_pct ? parseFloat(form.acid_oil_yield_pct) : null,
        separation_behaviour: form.separation_behaviour,
        rag_layer_collected_kg: form.rag_layer_collected_kg ? parseFloat(form.rag_layer_collected_kg) : null,
        rag_layer_disposition: form.rag_layer_disposition,
        notes: form.notes
      })
    setSaving(false)
    if (!error) setSaved(true)
    else setError('Save failed: ' + error.message)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'white',fontFamily:'sans-serif',color:'#888'}}>Loading...</div>
  )

  if (saved) return (
    <div style={{padding:32,fontFamily:'sans-serif',textAlign:'center',background:'white',minHeight:'100vh'}}>
      <div style={{fontSize:40,marginBottom:12}}>✅</div>
      <h2 style={{color:'#1D9E75',marginBottom:8}}>Acid oil batch saved</h2>
      <p style={{color:'#888',fontSize:13,marginBottom:20}}>{client.name}</p>
      <div style={{display:'flex',gap:12,justifyContent:'center'}}>
        <button onClick={()=>setSaved(false)}
          style={{padding:'12px 24px',background:'#1D9E75',color:'white',border:'none',borderRadius:8,fontSize:15,cursor:'pointer'}}>
          New batch
        </button>
        <button onClick={()=>router.push('/dashboard')}
          style={{padding:'12px 24px',background:'white',color:'#1B2A4A',border:'1px solid #1B2A4A',borderRadius:8,fontSize:15,cursor:'pointer'}}>
          Dashboard
        </button>
      </div>
    </div>
  )

  const numField = (label, key, placeholder='') => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:13,color:'#555',marginBottom:4}}>{label}</label>
      <input type="number" value={form[key]} onChange={e=>update(key,e.target.value)}
        placeholder={placeholder}
        style={{width:'100%',padding:'10px',fontSize:16,border:'1px solid #ccc',
        borderRadius:6,boxSizing:'border-box',color:'#222',background:'white'}}/>
    </div>
  )

  const selField = (label, key, options) => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:13,color:'#555',marginBottom:4}}>{label}</label>
      <select value={form[key]} onChange={e=>update(key,e.target.value)}
        style={{width:'100%',padding:'10px',fontSize:16,border:'1px solid #ccc',
        borderRadius:6,boxSizing:'border-box',color:'#222',background:'white'}}>
        <option value=''>Select...</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const sectionHead = (text, color='#1B2A4A') => (
    <div style={{fontSize:12,fontWeight:700,color,textTransform:'uppercase',
      letterSpacing:1,marginBottom:12,marginTop:20,paddingBottom:6,
      borderBottom:`2px solid ${color}`}}>
      {text}
    </div>
  )

  return (
    <div style={{padding:24,maxWidth:480,fontFamily:'sans-serif',background:'white',minHeight:'100vh',color:'#222'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
        <h2 style={{color:'#1B2A4A',margin:0,fontSize:18}}>Acid Oil Batch</h2>
        <button onClick={()=>router.push('/dashboard')}
          style={{background:'none',border:'1px solid #ddd',padding:'6px 12px',
          borderRadius:6,cursor:'pointer',fontSize:13,color:'#888'}}>
          ← Dashboard
        </button>
      </div>
      {client && <p style={{fontSize:12,color:'#1D9E75',marginBottom:20,marginTop:4}}>{client.name}</p>}

      {sectionHead('Soapstock Feed', '#BA7517')}
      {numField('Soapstock FFA %', 'soapstock_ffa_pct')}
      {numField('Soapstock soap %', 'soapstock_soap_pct')}
      {numField('Soapstock moisture %', 'soapstock_moisture_pct')}
      {numField('Soapstock TFM %', 'soapstock_tfm_pct')}
      {numField('Alkalinity (kg NaOH eq/ton) ★', 'soapstock_alkalinity_naoh_eq', 'Titrate before dosing')}
      {numField('Batch volume (MT)', 'soapstock_batch_volume_mt')}

      {sectionHead('Water Balance', '#042C53')}
      {numField('Recycled water TDS (mg/L)', 'recycled_water_tds_mg_l', 'Flag above 8000')}
      {numField('Recycled water pH', 'recycled_water_ph')}

      {sectionHead('Acidulation', '#085041')}
      {numField('H2SO4 dose (kg) ★', 'h2so4_dose_kg', 'From alkalinity titration')}
      {numField('Reaction hold temp °C', 'reaction_temp_hold_degc', 'Target 90-95°C')}
      {numField('Settle duration (hrs)', 'settle_duration_hrs', 'Min 3 hours')}
      {numField('Endpoint pH', 'endpoint_ph', 'Target 1.5-2.0')}
      {selField('Soap check at endpoint', 'soap_check_at_endpoint', ['Nil','Trace','Present'])}

      {sectionHead('Acid Oil Output', '#1B2A4A')}
      {numField('Acid oil FFA % ★', 'acid_oil_ffa_pct', 'Target 64-66%')}
      {numField('Acid oil moisture %', 'acid_oil_moisture_pct', 'Target below 1%')}
      {numField('Acid oil yield %', 'acid_oil_yield_pct')}
      {selField('Separation behaviour', 'separation_behaviour',
        ['Clean split','Partial emulsion','Full emulsion','Rag heavy'])}
      {numField('Rag layer collected (kg)', 'rag_layer_collected_kg')}
      {selField('Rag layer disposition', 'rag_layer_disposition',
        ['Reprocessed','Blended into main','Discarded'])}

      <div style={{marginBottom:16}}>
        <label style={{display:'block',fontSize:13,color:'#555',marginBottom:4}}>Notes</label>
        <textarea value={form.notes} onChange={e=>update('notes',e.target.value)}
          style={{width:'100%',padding:10,fontSize:14,border:'1px solid #ccc',borderRadius:6,
          height:72,boxSizing:'border-box',color:'#222',background:'white'}}/>
      </div>

      {error && <div style={{background:'#FDECEA',padding:'10px 14px',borderRadius:6,
        marginBottom:12,fontSize:13,color:'#C0392B'}}>{error}</div>}

      <button onClick={save} disabled={saving}
        style={{width:'100%',padding:16,background:'#1D9E75',color:'white',
        border:'none',borderRadius:8,fontSize:16,cursor:'pointer',marginBottom:32}}>
        {saving ? 'Saving...' : 'Save Acid Oil Batch'}
      </button>
    </div>
  )
}
