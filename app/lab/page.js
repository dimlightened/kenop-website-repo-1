'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LabForm() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    soap_ppm_pre_separator: '',
    soap_ppm_post_separator: '',
    separator_feed_temp_degc: '',
    neutral_oil_colour_r: '',
    neutral_oil_ffa_pct: '',
    refining_loss_pct: '',
    sample_temp_at_measurement_degc: '',
    notes: ''
  })

  const update = (k, v) => setForm(f => ({...f, [k]: v}))

  const save = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('lab_readings')
      .insert({
        client_id: '1f935757-a82f-40b5-8a4c-1d90715d7537',
        form_type: 'quick',
        soap_ppm_pre_separator: form.soap_ppm_pre_separator ? parseInt(form.soap_ppm_pre_separator) : null,
        soap_ppm_post_separator: form.soap_ppm_post_separator ? parseInt(form.soap_ppm_post_separator) : null,
        separator_feed_temp_degc: form.separator_feed_temp_degc ? parseFloat(form.separator_feed_temp_degc) : null,
        neutral_oil_colour_r: form.neutral_oil_colour_r ? parseFloat(form.neutral_oil_colour_r) : null,
        neutral_oil_ffa_pct: form.neutral_oil_ffa_pct ? parseFloat(form.neutral_oil_ffa_pct) : null,
        refining_loss_pct: form.refining_loss_pct ? parseFloat(form.refining_loss_pct) : null,
        sample_temp_at_measurement_degc: form.sample_temp_at_measurement_degc ? parseFloat(form.sample_temp_at_measurement_degc) : null,
        notes: form.notes
      })
    setSaving(false)
    if (!error) setSaved(true)
    else alert('Save failed: ' + error.message)
  }

  if (saved) return (
    <div style={{padding:32,fontFamily:'sans-serif',textAlign:'center'}}>
      <h2 style={{color:'#1D9E75'}}>Saved</h2>
      <button onClick={()=>setSaved(false)} style={{marginTop:16,padding:'12px 32px',background:'#1D9E75',color:'white',border:'none',borderRadius:8,fontSize:16,cursor:'pointer'}}>
        Next reading
      </button>
    </div>
  )

  return (
    <div style={{padding:24,maxWidth:480,fontFamily:'sans-serif'}}>
      <h2 style={{marginBottom:20,color:'#1B2A4A'}}>Kenop Lab Entry</h2>
      {[
        ['Soap ppm pre-separator','soap_ppm_pre_separator'],
        ['Soap ppm post-separator','soap_ppm_post_separator'],
        ['Separator feed temp °C','separator_feed_temp_degc'],
        ['Colour R Lovibond','neutral_oil_colour_r'],
        ['Neutral oil FFA %','neutral_oil_ffa_pct'],
        ['Refining loss %','refining_loss_pct'],
        ['Sample temp at measurement °C','sample_temp_at_measurement_degc'],
      ].map(([label,key])=>(
        <div key={key} style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:13,color:'#555',marginBottom:4}}>{label}</label>
          <input
            type="number"
            value={form[key]}
            onChange={e=>update(key,e.target.value)}
            style={{width:'100%',padding:'10px',fontSize:18,border:'1px solid #ccc',borderRadius:6,boxSizing:'border-box'}}
          />
        </div>
      ))}
      <div style={{marginBottom:16}}>
        <label style={{display:'block',fontSize:13,color:'#555',marginBottom:4}}>Notes</label>
        <textarea
          value={form.notes}
          onChange={e=>update('notes',e.target.value)}
          style={{width:'100%',padding:10,fontSize:14,border:'1px solid #ccc',borderRadius:6,height:72,boxSizing:'border-box'}}
        />
      </div>
      <button
        onClick={save}
        disabled={saving}
        style={{width:'100%',padding:16,background:'#1D9E75',color:'white',border:'none',borderRadius:8,fontSize:16,cursor:'pointer'}}
      >
        {saving ? 'Saving...' : 'Save Reading'}
      </button>
    </div>
  )
}
