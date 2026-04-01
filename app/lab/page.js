'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LabForm() {
  const [user, setUser] = useState(null)
  const [client, setClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)

      // Look up client record for this user
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single()

      if (clientError || !clientData) {
        // Admin user — no client linked, show selector later
        // For now just allow with null client
        setLoading(false)
        return
      }

      setClient(clientData)
      setLoading(false)
    })
  }, [])

  const update = (k, v) => setForm(f => ({...f, [k]: v}))

  const save = async () => {
    if (!client) {
      setError('No client linked to your account. Contact admin.')
      return
    }
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('lab_readings')
      .insert({
        client_id: client.id,
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
    else setError('Save failed: ' + error.message)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{padding:32,fontFamily:'sans-serif',textAlign:'center',color:'#888'}}>
      Loading...
    </div>
  )

  if (saved) return (
    <div style={{padding:32,fontFamily:'sans-serif',textAlign:'center'}}>
      <div style={{fontSize:40,marginBottom:12}}>✅</div>
      <h2 style={{color:'#1D9E75',marginBottom:8}}>Saved</h2>
      {client && <p style={{color:'#888',fontSize:13,marginBottom:20}}>{client.name}</p>}
      <button onClick={()=>setSaved(false)}
        style={{padding:'12px 32px',background:'#1D9E75',color:'white',border:'none',borderRadius:8,fontSize:16,cursor:'pointer'}}>
        Next reading
      </button>
    </div>
  )

  return (
    <div style={{padding:24,maxWidth:480,fontFamily:'sans-serif',background:'white',minHeight:'100vh'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
        <h2 style={{color:'#1B2A4A',margin:0}}>Kenop Lab Entry</h2>
        <button onClick={logout}
          style={{background:'none',border:'1px solid #ddd',padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:13,color:'#888'}}>
          Sign out
        </button>
      </div>

      {client && (
        <p style={{fontSize:12,color:'#1D9E75',marginBottom:20,marginTop:4}}>
          {client.name} · {client.feedstock_primary}
        </p>
      )}

      {!client && (
        <div style={{background:'#FFF3CD',padding:'10px 14px',borderRadius:6,marginBottom:16,fontSize:13,color:'#BA7517'}}>
          No plant linked to your account. Contact admin to link your plant.
        </div>
      )}

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

      {error && (
        <div style={{background:'#FDECEA',padding:'10px 14px',borderRadius:6,marginBottom:12,fontSize:13,color:'#C0392B'}}>
          {error}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || !client}
        style={{width:'100%',padding:16,background: client ? '#1D9E75' : '#ccc',color:'white',border:'none',borderRadius:8,fontSize:16,cursor: client ? 'pointer' : 'not-allowed'}}
      >
        {saving ? 'Saving...' : 'Save Reading'}
      </button>
    </div>
  )
}