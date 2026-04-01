'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

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

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#F4F6F8',fontFamily:'sans-serif',color:'#888'}}>Loading...</div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F4F6F8',fontFamily:'sans-serif'}}>

      {/* Header */}
      <div style={{background:'#1B2A4A',padding:'16px 24px',display:'flex',
        justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <span style={{color:'white',fontWeight:700,fontSize:17}}>Kenop Intelligence</span>
        </div>
        <button onClick={logout} style={{background:'none',border:'1px solid #555',
          color:'#ccc',padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:13}}>
          Sign out
        </button>
      </div>

      <div style={{maxWidth:600,margin:'0 auto',padding:'24px 16px'}}>

        {/* Plant card */}
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

        {/* Stats */}
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

        {/* Recent readings */}
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
                    day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
                  })}
                </span>
              </div>
            ))
          }
        </div>

        {/* Data request download */}
        <div style={{background:'white',borderRadius:12,padding:20,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h3 style={{margin:'0 0 8px',color:'#1B2A4A',fontSize:15}}>Data request</h3>
          <p style={{margin:'0 0 16px',color:'#888',fontSize:13,lineHeight:1.6}}>
            Download the data request template, fill it with your batch data, and upload it for process assessment.
          </p>
          <a href="mailto:nachiket@idhma.in?subject=Data Request — Assessment"
            style={{display:'inline-block',padding:'10px 20px',background:'#1B2A4A',
            color:'white',borderRadius:8,fontSize:14,textDecoration:'none',fontWeight:600}}>
            Request assessment
          </a>
        </div>

      </div>
    </div>
  )
}
