'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [approving, setApproving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const email = session.user.email
      if (email !== 'nachiket@idhma.in') { router.push('/lab'); return }
      setUser(session.user)
      loadData()
    })
  }, [])

  const loadData = async () => {
    const { data: apps } = await supabase
      .from('onboarding_applications')
      .select('*')
      .order('submitted_at', { ascending: false })

    const { data: cls } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    setApplications(apps || [])
    setClients(cls || [])
    setLoading(false)
  }

  const approve = async (app) => {
    setApproving(true)
    try {
      // 1 — Create client record
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: app.company_name,
          location: `${app.city}, ${app.state}`,
          contact_name: app.contact_name,
          email: app.email,
          phone: app.phone,
          feedstock_primary: (app.feedstock_types || []).join(', '),
          throughput_tpd: app.throughput_tpd,
          status: 'active'
        })
        .select()
        .single()

      if (clientError) throw clientError

      // 2 — Update application status
      await supabase
        .from('onboarding_applications')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', app.id)

      alert(`✅ Client record created for ${app.company_name}.\n\nNow go to Supabase → Authentication → Users → Invite user\nEmail: ${app.email}\n\nAfter they set password, link their auth_user_id to clients table.`)
      setSelected(null)
      loadData()
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setApproving(false)
  }

  const reject = async (app) => {
    if (!confirm(`Reject application from ${app.company_name}?`)) return
    await supabase
      .from('onboarding_applications')
      .update({ status: 'rejected' })
      .eq('id', app.id)
    loadData()
  }

  const statusColor = (s) => ({
    pending: '#BA7517', approved: '#1D9E75', rejected: '#C0392B'
  }[s] || '#888')

  const statusBg = (s) => ({
    pending: '#FFF3CD', approved: '#E1F5EE', rejected: '#FDECEA'
  }[s] || '#F4F6F8')

  if (loading) return <div style={{padding:32,fontFamily:'sans-serif'}}>Loading...</div>

  return (
    <div style={{minHeight:'100vh',background:'#F4F6F8',fontFamily:'sans-serif'}}>
      {/* Header */}
      <div style={{background:'#1B2A4A',padding:'16px 32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <span style={{color:'white',fontWeight:700,fontSize:18}}>Kenop Intelligence</span>
          <span style={{color:'#aaa',fontSize:13,marginLeft:16}}>Admin Panel</span>
        </div>
        <button onClick={()=>{supabase.auth.signOut();router.push('/login')}}
          style={{background:'none',border:'1px solid #555',color:'#ccc',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:13}}>
          Sign out
        </button>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:32}}>

        {/* Stats row */}
        <div style={{display:'flex',gap:16,marginBottom:32}}>
          {[
            ['Pending', applications.filter(a=>a.status==='pending').length, '#FFF3CD', '#BA7517'],
            ['Approved', applications.filter(a=>a.status==='approved').length, '#E1F5EE', '#1D9E75'],
            ['Total clients', clients.length, '#E6F1FB', '#042C53'],
          ].map(([label, count, bg, color]) => (
            <div key={label} style={{background:bg,borderRadius:10,padding:'16px 24px',minWidth:140}}>
              <div style={{fontSize:28,fontWeight:700,color}}>{count}</div>
              <div style={{fontSize:13,color:'#666'}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Applications table */}
        <div style={{background:'white',borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:32}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{margin:0,color:'#1B2A4A'}}>Onboarding Applications</h3>
            <span style={{fontSize:13,color:'#888'}}>{applications.length} total</span>
          </div>

          {applications.length === 0
            ? <div style={{padding:32,textAlign:'center',color:'#aaa'}}>No applications yet</div>
            : applications.map(app => (
              <div key={app.id} style={{
                padding:'16px 24px',borderBottom:'1px solid #f8f8f8',
                background: selected?.id===app.id ? '#F4F6F8' : 'white',
                cursor:'pointer'
              }} onClick={()=>setSelected(selected?.id===app.id ? null : app)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <span style={{fontWeight:600,color:'#1B2A4A',fontSize:15}}>{app.company_name}</span>
                    <span style={{marginLeft:12,color:'#888',fontSize:13}}>{app.city}, {app.state}</span>
                    <span style={{marginLeft:12,color:'#888',fontSize:13}}>{app.throughput_tpd} TPD</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{
                      padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600,
                      background:statusBg(app.status),color:statusColor(app.status)
                    }}>{app.status}</span>
                    <span style={{color:'#aaa',fontSize:12}}>
                      {new Date(app.submitted_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id===app.id && (
                  <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid #f0f0f0'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
                      {[
                        ['Contact', app.contact_name],
                        ['Email', app.email],
                        ['Phone', app.phone],
                        ['Feedstock', (app.feedstock_types||[]).join(', ')],
                        ['Route', app.refining_route],
                        ['Mode', app.operating_mode],
                        ['PLC', app.plc_connected ? `Yes — ${app.plc_make||'?'}` : 'No'],
                        ['Mixing', app.mixing_device],
                        ['Separator', `${app.separator_make||''} ${app.separator_model||''}`.trim()||'—'],
                        ['Residence tanks', app.number_of_residence_tanks],
                      ].map(([k,v])=>(
                        <div key={k}>
                          <div style={{fontSize:11,color:'#aaa',marginBottom:2}}>{k}</div>
                          <div style={{fontSize:13,color:'#333'}}>{v||'—'}</div>
                        </div>
                      ))}
                    </div>

                    {app.pid_file_url && (
                      <div style={{marginBottom:12}}>
                        <span style={{fontSize:12,color:'#888'}}>P&ID: </span>
                        <span style={{fontSize:12,color:'#1D9E75'}}>{app.pid_file_url}</span>
                      </div>
                    )}

                    {app.status === 'pending' && (
                      <div style={{display:'flex',gap:12,marginTop:8}}>
                        <button onClick={(e)=>{e.stopPropagation();approve(app)}} disabled={approving}
                          style={{padding:'10px 24px',background:'#1D9E75',color:'white',border:'none',
                          borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:14}}>
                          {approving ? 'Approving...' : '✅ Approve & create client'}
                        </button>
                        <button onClick={(e)=>{e.stopPropagation();reject(app)}}
                          style={{padding:'10px 24px',background:'white',color:'#C0392B',
                          border:'1px solid #C0392B',borderRadius:8,cursor:'pointer',fontSize:14}}>
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          }
        </div>

        {/* Active clients table */}
        <div style={{background:'white',borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid #f0f0f0'}}>
            <h3 style={{margin:0,color:'#1B2A4A'}}>Active Clients</h3>
          </div>
          {clients.length === 0
            ? <div style={{padding:32,textAlign:'center',color:'#aaa'}}>No clients yet</div>
            : clients.map(cl => (
              <div key={cl.id} style={{padding:'14px 24px',borderBottom:'1px solid #f8f8f8',
                display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{fontWeight:600,color:'#1B2A4A'}}>{cl.name}</span>
                  <span style={{marginLeft:12,color:'#888',fontSize:13}}>{cl.location}</span>
                  <span style={{marginLeft:12,color:'#888',fontSize:13}}>{cl.feedstock_primary}</span>
                  <span style={{marginLeft:12,color:'#888',fontSize:13}}>{cl.throughput_tpd} TPD</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{
                    fontSize:11,padding:'2px 8px',borderRadius:20,
                    background: cl.auth_user_id ? '#E1F5EE' : '#FFF3CD',
                    color: cl.auth_user_id ? '#1D9E75' : '#BA7517'
                  }}>
                    {cl.auth_user_id ? 'Login linked' : 'Login not linked'}
                  </span>
                  <span style={{fontSize:11,color:'#aaa'}}>{cl.id.slice(0,8)}...</span>
                </div>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  )
}
