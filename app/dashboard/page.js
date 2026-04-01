'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

function UploadSection({ clientId }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setUploadError('')
    const filename = `${clientId}_${Date.now()}_${file.name}`
    const { error } = await supabase.storage
      .from('plant-photos')
      .upload(`submissions/${filename}`, file)
    setUploading(false)
    if (error) setUploadError('Upload failed: ' + error.message)
    else setUploaded(true)
  }

  if (uploaded) return (
    <div style={{background:'#E1F5EE',padding:'10px 14px',borderRadius:6,fontSize:13,color:'#085041'}}>
      File uploaded. Our team will review and contact you within 24 hours.
    </div>
  )

  return (
    <div>
      <input type="file" accept=".xlsx,.xls,.pdf"
        onChange={e=>setFile(e.target.files[0])}
        style={{display:'block',marginBottom:10,fontSize:13,color:'#333'}}/>
      {file && (
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:12,color:'#888'}}>{file.name}</span>
          <button onClick={upload} disabled={uploading}
            style={{padding:'8px 18px',background:'#1D9E75',color:'white',
            border:'none',borderRadius:6,fontSize:13,cursor:'pointer'}}>
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      )}
      {uploadError && <p style={{fontSize:12,color:'#C0392B',marginTop:8}}>{uploadError}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [client, setClient] = useState(null)
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single()

      if (!clientData) { router.push('/lab'); return }
      setClient(clientData)

      const { data: readingsData } = await supabase
        .from('lab_readings')
        .select('*')
        .eq('client_id', clientData.id)
        .order('recorded_at', { ascending: false })
        .limit(10)

      setReadings(readingsData || [])
      setLoading(false)
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const downloadTemplate = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/download-template', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    if (!res.ok) { alert('Download failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const disposition = res.headers.get('Content-Disposition') || ''
    a.download = disposition.split('filename=')[1]?.replace(/"/g, '') || 'DataRequest.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',
      justifyContent:'center',background:'#F4F6F8',fontFamily:'sans-serif',color:'#888'}}>
      Loading...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F4F6F8',fontFamily:'sans-serif'}}>

      <div style={{background:'#1B2A4A',padding:'16px 24px',
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'white',fontWeight:700,fontSize:17}}>Kenop Intelligence</span>
        <button onClick={logout}
          style={{background:'none',border:'1px solid #555',color:'#ccc',
          padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:13}}>
          Sign out
        </button>
      </div>

      <div style={{maxWidth:600,margin:'0 auto',padding:'24px 16px'}}>

        <div style={{background:'white',borderRadius:12,padding:24,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:20}}>
          <div style={{fontSize:12,color:'#1D9E75',fontWeight:600,
            textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Your plant</div>
          <h2 style={{margin:'0 0 4px',color:'#1B2A4A',fontSize:20}}>{client.name}</h2>
          <p style={{margin:'0 0 16px',color:'#888',fontSize:13}}>
            {client.location} · {client.feedstock_primary} · {client.throughput_tpd} TPD
          </p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <button onClick={()=>router.push('/lab')}
              style={{padding:'12px 24px',background:'#1D9E75',color:'white',
              border:'none',borderRadius:8,fontSize:15,cursor:'pointer',fontWeight:600}}>
              + New lab reading
            </button>
            <button onClick={()=>router.push('/acidoil')}
              style={{padding:'12px 24px',background:'white',color:'#1B2A4A',
              border:'1px solid #1B2A4A',borderRadius:8,fontSize:15,cursor:'pointer',fontWeight:600}}>
              + Acid oil batch
            </button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:20}}>
          {[
            ['Total readings', readings.length, '#E1F5EE', '#1D9E75'],
            ['Latest pre-sep soap', readings[0]?.soap_ppm_pre_separator ? readings[0].soap_ppm_pre_separator + ' ppm' : '—', '#FAEEDA', '#BA7517'],
            ['Latest post-sep soap', readings[0]?.soap_ppm_post_separator ? readings[0].soap_ppm_post_separator + ' ppm' : '—', '#E6F1FB', '#042C53'],
          ].map(([label, value, bg, color]) => (
            <div key={label} style={{background:bg,borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:18,fontWeight:700,color}}>{value}</div>
              <div style={{fontSize:11,color:'#666',marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{background:'white',borderRadius:12,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:20}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #f0f0f0',
            display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{margin:0,color:'#1B2A4A',fontSize:15}}>Recent readings</h3>
            <span style={{fontSize:12,color:'#aaa'}}>{readings.length} entries</span>
          </div>
          {readings.length === 0
            ? <div style={{padding:32,textAlign:'center',color:'#aaa',fontSize:14}}>
                No readings yet — enter your first reading above
              </div>
            : readings.map((r, i) => (
              <div key={r.id} style={{padding:'12px 20px',
                borderBottom: i < readings.length-1 ? '1px solid #f8f8f8' : 'none',
                display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{fontSize:13,color:'#333',fontWeight:500}}>
                    Pre: {r.soap_ppm_pre_separator ?? '—'} ppm
                  </span>
                  <span style={{marginLeft:12,fontSize:13,color:'#888'}}>
                    Post: {r.soap_ppm_post_separator ?? '—'} ppm
                  </span>
                  {r.separator_feed_temp_degc && (
                    <span style={{marginLeft:12,fontSize:13,color:'#888'}}>
                      {r.separator_feed_temp_degc}°C
                    </span>
                  )}
                </div>
                <span style={{fontSize:11,color:'#aaa'}}>
                  {new Date(r.recorded_at).toLocaleDateString('en-IN', {
                    day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'
                  })}
                </span>
              </div>
            ))
          }
        </div>

        <div style={{background:'white',borderRadius:12,padding:20,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h3 style={{margin:'0 0 4px',color:'#1B2A4A',fontSize:15}}>Process Assessment</h3>
          <p style={{margin:'0 0 16px',color:'#888',fontSize:13,lineHeight:1.6}}>
            Download the data template with your plant details pre-filled. Fill 5 batches from your lab records and upload below.
          </p>
          <button onClick={downloadTemplate}
            style={{display:'inline-block',padding:'10px 20px',background:'#1B2A4A',
            color:'white',borderRadius:8,fontSize:14,border:'none',
            fontWeight:600,marginBottom:20,cursor:'pointer'}}>
            ⬇ Download my data template
          </button>
          <div style={{borderTop:'1px solid #f0f0f0',paddingTop:16}}>
            <p style={{margin:'0 0 10px',fontSize:13,color:'#555',fontWeight:500}}>
              Upload completed file
            </p>
            <UploadSection clientId={client.id} />
          </div>
        </div>

      </div>
    </div>
  )
}