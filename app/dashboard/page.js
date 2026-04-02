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
    const filename = `${clientId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error } = await supabase.storage
      .from('plant-photos')
      .upload(`submissions/${filename}`, file)
    setUploading(false)
    if (error) setUploadError('Upload failed: ' + error.message)
    else setUploaded(true)
  }

  if (uploaded) return (
    <div style={{background:'#E1F5EE',padding:'10px 14px',borderRadius:6,fontSize:13,color:'#085041'}}>
      ✅ File uploaded. Our team will review and contact you within 24 hours.
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

function ValueCard({ title, value, sub, bg, color }) {
  return (
    <div style={{background:bg,borderRadius:10,padding:'14px 16px'}}>
      <div style={{fontSize:20,fontWeight:700,color}}>{value}</div>
      <div style={{fontSize:11,color:'#555',marginTop:2,fontWeight:600}}>{title}</div>
      {sub && <div style={{fontSize:10,color:'#888',marginTop:2}}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [client, setClient] = useState(null)
  const [readings, setReadings] = useState([])
  const [acidBatches, setAcidBatches] = useState([])
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

      const [{ data: readingsData }, { data: acidData }] = await Promise.all([
        supabase.from('lab_readings').select('*')
          .eq('client_id', clientData.id)
          .order('recorded_at', { ascending: false })
          .limit(30),
        supabase.from('acidoil_batches').select('*')
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false })
          .limit(30)
      ])

      setReadings(readingsData || [])
      setAcidBatches(acidData || [])
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

  // ── Calculated metrics ──────────────────────────────
  const latest = readings[0]
  const best = readings.length > 0 ? {
    post_soap: Math.min(...readings.filter(r=>r.soap_ppm_post_separator).map(r=>r.soap_ppm_post_separator)),
    pre_soap: Math.min(...readings.filter(r=>r.soap_ppm_pre_separator).map(r=>r.soap_ppm_pre_separator)),
    refining_loss: Math.min(...readings.filter(r=>r.refining_loss_pct).map(r=>r.refining_loss_pct)),
  } : null

  // Separator efficiency
  const sepEff = latest?.soap_ppm_pre_separator && latest?.soap_ppm_post_separator
    ? (((latest.soap_ppm_pre_separator - latest.soap_ppm_post_separator) / latest.soap_ppm_pre_separator) * 100).toFixed(1)
    : null

  // Value addition estimates (based on throughput)
  const tpd = client?.throughput_tpd || 350
  const refLoss = latest?.refining_loss_pct || 1.62
  const theoreticalLoss = 0.885 // at 0.59% FFA
  const excessLossMT = (tpd * (refLoss - theoreticalLoss) / 100)
  const excessLossRs = excessLossMT * 90000
  const soapLossKg = (latest?.soap_ppm_post_separator || 650) * tpd * 1000 / 1000000 * 0.68
  const soapLossRs = soapLossKg * 90000

  // Acid oil value addition
  const avgAcidOilFFA = acidBatches.length > 0
    ? acidBatches.filter(b=>b.acid_oil_ffa_pct).reduce((s,b)=>s+b.acid_oil_ffa_pct,0) / acidBatches.filter(b=>b.acid_oil_ffa_pct).length
    : 63.5
  const dailyAcidOilMT = tpd * 0.015 * 0.789 * 0.88 // estimated
  const currentRealisation = dailyAcidOilMT * 1000 * 52
  const separatedRealisation = dailyAcidOilMT * 1000 * 80.5 // blended FFA+oil+unsap
  const dailyValueGap = separatedRealisation - currentRealisation
  const capexPaybackDays = 18000000 / dailyValueGap // ₹1.8 crore CAPEX

  const statusColor = (val, good, warn) => {
    if (val === null || val === undefined) return '#888'
    if (val <= good) return '#1D9E75'
    if (val <= warn) return '#BA7517'
    return '#C0392B'
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',
      justifyContent:'center',background:'#F4F6F8',fontFamily:'sans-serif',color:'#888'}}>
      Loading...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F4F6F8',fontFamily:'sans-serif'}}>

      {/* Header */}
      <div style={{background:'#1B2A4A',padding:'16px 24px',
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <span style={{color:'white',fontWeight:700,fontSize:17}}>Kenop Intelligence</span>
          <span style={{color:'#aaa',fontSize:12,marginLeft:12}}>Process Dashboard</span>
        </div>
        <button onClick={logout}
          style={{background:'none',border:'1px solid #555',color:'#ccc',
          padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:13}}>
          Sign out
        </button>
      </div>

      <div style={{maxWidth:640,margin:'0 auto',padding:'20px 16px'}}>

        {/* Plant card */}
        <div style={{background:'white',borderRadius:12,padding:20,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:16}}>
          <div style={{fontSize:11,color:'#1D9E75',fontWeight:700,
            textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Your plant</div>
          <h2 style={{margin:'0 0 4px',color:'#1B2A4A',fontSize:18}}>{client.name}</h2>
          <p style={{margin:'0 0 14px',color:'#888',fontSize:12}}>
            {client.location} · {client.feedstock_primary} · {client.throughput_tpd} TPD
          </p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <button onClick={()=>router.push('/lab')}
              style={{padding:'10px 20px',background:'#1D9E75',color:'white',
              border:'none',borderRadius:8,fontSize:14,cursor:'pointer',fontWeight:600}}>
              + Lab reading
            </button>
            <button onClick={()=>router.push('/acidoil')}
              style={{padding:'10px 20px',background:'white',color:'#1B2A4A',
              border:'1px solid #1B2A4A',borderRadius:8,fontSize:14,cursor:'pointer',fontWeight:600}}>
              + Acid oil batch
            </button>
            <button onClick={()=>router.push('/documents')}
              style={{padding:'10px 20px',background:'white',color:'#1B2A4A',
              border:'1px solid #ddd',borderRadius:8,fontSize:14,cursor:'pointer'}}>
              📁 Documents
            </button>
          </div>
        </div>

        {/* ── SECTION 1: Latest shift KPIs ── */}
        <div style={{marginBottom:6}}>
          <div style={{fontSize:11,color:'#888',fontWeight:700,textTransform:'uppercase',
            letterSpacing:1,marginBottom:8}}>Latest shift KPIs</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          <ValueCard
            title="Pre-separator soap"
            value={latest?.soap_ppm_pre_separator ? `${latest.soap_ppm_pre_separator} ppm` : '—'}
            sub="Target < 2200 ppm"
            bg={latest?.soap_ppm_pre_separator > 2200 ? '#FDECEA' : '#F4F6F8'}
            color={statusColor(latest?.soap_ppm_pre_separator, 1800, 2200)}
          />
          <ValueCard
            title="Post-separator soap ★"
            value={latest?.soap_ppm_post_separator ? `${latest.soap_ppm_post_separator} ppm` : '—'}
            sub="Target < 700 ppm"
            bg={latest?.soap_ppm_post_separator > 700 ? '#FDECEA' : '#E1F5EE'}
            color={statusColor(latest?.soap_ppm_post_separator, 600, 700)}
          />
          <ValueCard
            title="Separator efficiency"
            value={sepEff ? `${sepEff}%` : '—'}
            sub="Target > 75%"
            bg={sepEff < 70 ? '#FDECEA' : '#E6F1FB'}
            color={sepEff >= 75 ? '#1D9E75' : sepEff >= 65 ? '#BA7517' : '#C0392B'}
          />
          <ValueCard
            title="Sep feed temperature"
            value={latest?.separator_feed_temp_degc ? `${latest.separator_feed_temp_degc}°C` : '—'}
            sub="Target 82–85°C"
            bg={latest?.separator_feed_temp_degc < 80 ? '#FDECEA' : '#F4F6F8'}
            color={statusColor(latest?.separator_feed_temp_degc, 82, 85) === '#1D9E75' ? '#1D9E75' : latest?.separator_feed_temp_degc < 80 ? '#C0392B' : '#BA7517'}
          />
          <ValueCard
            title="Neutral oil FFA"
            value={latest?.neutral_oil_ffa_pct ? `${latest.neutral_oil_ffa_pct}%` : '—'}
            sub="Target < 0.10%"
            bg={latest?.neutral_oil_ffa_pct > 0.10 ? '#FDECEA' : '#E1F5EE'}
            color={statusColor(latest?.neutral_oil_ffa_pct, 0.08, 0.10)}
          />
          <ValueCard
            title="Refining loss"
            value={latest?.refining_loss_pct ? `${latest.refining_loss_pct}%` : '—'}
            sub={`Theoretical min: ${(1.5 * 0.59).toFixed(2)}%`}
            bg={latest?.refining_loss_pct > 1.5 ? '#FAEEDA' : '#E1F5EE'}
            color={statusColor(latest?.refining_loss_pct, 1.0, 1.5)}
          />
        </div>

        {/* ── SECTION 2: Best ever vs today ── */}
        {best && (
          <div style={{background:'white',borderRadius:12,padding:20,
            boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:'#1B2A4A',marginBottom:14}}>
              Today vs your best ever
            </div>
            {[
              ['Post-sep soap', latest?.soap_ppm_post_separator, best.post_soap, 'ppm', true],
              ['Pre-sep soap', latest?.soap_ppm_pre_separator, best.pre_soap, 'ppm', true],
              ['Refining loss', latest?.refining_loss_pct, best.refining_loss, '%', true],
            ].map(([label, today, bestVal, unit, lowerIsBetter]) => {
              if (!today || !bestVal) return null
              const gap = lowerIsBetter ? today - bestVal : bestVal - today
              const isGood = gap <= 0
              return (
                <div key={label} style={{display:'flex',alignItems:'center',
                  marginBottom:10,gap:12}}>
                  <div style={{width:130,fontSize:12,color:'#555'}}>{label}</div>
                  <div style={{fontSize:13,fontWeight:700,color:'#333',width:80}}>
                    {today}{unit}
                  </div>
                  <div style={{fontSize:11,color:'#aaa',width:80}}>
                    Best: {bestVal}{unit}
                  </div>
                  <div style={{fontSize:12,fontWeight:600,
                    color: isGood ? '#1D9E75' : '#C0392B'}}>
                    {isGood ? '✓ At best' : `+${gap.toFixed(1)}${unit} gap`}
                  </div>
                </div>
              )
            })}
            {latest?.refining_loss_pct && best.refining_loss && (
              <div style={{marginTop:12,padding:'10px 14px',background:'#FFF3CD',
                borderRadius:8,fontSize:13,color:'#412402'}}>
                ₹{((latest.refining_loss_pct - best.refining_loss)/100 * tpd * 1000 * 90).toLocaleString('en-IN')}/day
                {' '}left on table versus your own best shift
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 3: Financial P&L ── */}
        <div style={{background:'white',borderRadius:12,padding:20,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1B2A4A',marginBottom:14}}>
            Monthly loss estimate
          </div>
          {[
            ['Oil entrained above theoretical', excessLossRs * 30, '#FDECEA', '#C0392B'],
            ['Soap carry-over in neutral oil', soapLossRs * 30, '#FAEEDA', '#BA7517'],
          ].map(([label, val, bg, color]) => (
            <div key={label} style={{display:'flex',justifyContent:'space-between',
              padding:'10px 14px',borderRadius:8,background:bg,marginBottom:8}}>
              <span style={{fontSize:13,color:'#333'}}>{label}</span>
              <span style={{fontSize:13,fontWeight:700,color}}>
                ₹{Math.round(val).toLocaleString('en-IN')}/mo
              </span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',
            padding:'10px 14px',borderRadius:8,background:'#1B2A4A',marginTop:4}}>
            <span style={{fontSize:13,color:'white',fontWeight:600}}>Total recoverable</span>
            <span style={{fontSize:13,fontWeight:700,color:'#1D9E75'}}>
              ₹{Math.round((excessLossRs + soapLossRs) * 30).toLocaleString('en-IN')}/mo
            </span>
          </div>
          <div style={{fontSize:11,color:'#aaa',marginTop:8,textAlign:'right'}}>
            Based on {readings.length} readings · ₹90/kg refined oil
          </div>
        </div>

        {/* ── SECTION 4: Value addition opportunity ── */}
        <div style={{background:'white',borderRadius:12,padding:20,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1B2A4A',marginBottom:4}}>
            Acid oil value addition opportunity
          </div>
          <div style={{fontSize:11,color:'#888',marginBottom:14}}>
            Based on {dailyAcidOilMT.toFixed(1)} MT/day estimated acid oil at {avgAcidOilFFA.toFixed(1)}% FFA
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div style={{padding:'12px 14px',background:'#F4F6F8',borderRadius:8}}>
              <div style={{fontSize:11,color:'#888',marginBottom:4}}>Current (crude acid oil)</div>
              <div style={{fontSize:18,fontWeight:700,color:'#333'}}>
                ₹{Math.round(currentRealisation).toLocaleString('en-IN')}/day
              </div>
              <div style={{fontSize:11,color:'#888'}}>selling at ₹52/kg</div>
            </div>
            <div style={{padding:'12px 14px',background:'#E1F5EE',borderRadius:8}}>
              <div style={{fontSize:11,color:'#085041',marginBottom:4}}>With value addition</div>
              <div style={{fontSize:18,fontWeight:700,color:'#1D9E75'}}>
                ₹{Math.round(separatedRealisation).toLocaleString('en-IN')}/day
              </div>
              <div style={{fontSize:11,color:'#085041'}}>FFA + oil + unsap fractions</div>
            </div>
          </div>
          <div style={{padding:'12px 16px',background:'#1B2A4A',borderRadius:8,
            display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div>
              <div style={{fontSize:11,color:'#aaa'}}>Daily gap</div>
              <div style={{fontSize:20,fontWeight:700,color:'#1D9E75'}}>
                ₹{Math.round(dailyValueGap).toLocaleString('en-IN')}/day
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,color:'#aaa'}}>At ₹1.8Cr CAPEX</div>
              <div style={{fontSize:18,fontWeight:700,color:'white'}}>
                {Math.round(capexPaybackDays)} day payback
              </div>
            </div>
          </div>
          <div style={{fontSize:11,color:'#888',lineHeight:1.6}}>
            Two pathways exist to capture this value: (1) separating and purifying the FFA fraction for oleochemical use, or (2) converting FFA back to triglycerides for food ingredient applications at ₹150-300/kg. Your Kenop team can evaluate which pathway suits your plant's volumes and market access.
          </div>
        </div>

        {/* ── SECTION 5: Recent readings ── */}
        <div style={{background:'white',borderRadius:12,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:16}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid #f0f0f0',
            display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{margin:0,color:'#1B2A4A',fontSize:14}}>Recent lab readings</h3>
            <span style={{fontSize:11,color:'#aaa'}}>{readings.length} entries</span>
          </div>
          {readings.length === 0
            ? <div style={{padding:24,textAlign:'center',color:'#aaa',fontSize:13}}>
                No readings yet — enter your first reading above
              </div>
            : readings.slice(0,8).map((r, i) => (
              <div key={r.id} style={{padding:'10px 20px',
                borderBottom: i < 7 ? '1px solid #f8f8f8' : 'none',
                display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{fontSize:13,color:'#333',fontWeight:500}}>
                    {r.soap_ppm_pre_separator ?? '—'} → {r.soap_ppm_post_separator ?? '—'} ppm
                  </span>
                  {r.separator_feed_temp_degc && (
                    <span style={{marginLeft:10,fontSize:12,color:'#888'}}>
                      {r.separator_feed_temp_degc}°C
                    </span>
                  )}
                  {r.neutral_oil_ffa_pct && (
                    <span style={{marginLeft:10,fontSize:12,color:'#888'}}>
                      FFA {r.neutral_oil_ffa_pct}%
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

        {/* ── SECTION 6: Process Assessment ── */}
        <div style={{background:'white',borderRadius:12,padding:20,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h3 style={{margin:'0 0 4px',color:'#1B2A4A',fontSize:14}}>Process Assessment</h3>
          <p style={{margin:'0 0 14px',color:'#888',fontSize:12,lineHeight:1.6}}>
            Download your data template with plant details pre-filled. Fill 5 representative batches from your lab records and upload for assessment.
          </p>
          <button onClick={downloadTemplate}
            style={{display:'inline-block',padding:'10px 20px',background:'#1B2A4A',
            color:'white',borderRadius:8,fontSize:13,border:'none',
            fontWeight:600,marginBottom:16,cursor:'pointer'}}>
            ⬇ Download my data template
          </button>
          <div style={{borderTop:'1px solid #f0f0f0',paddingTop:14}}>
            <p style={{margin:'0 0 8px',fontSize:12,color:'#555',fontWeight:600}}>
              Upload completed file
            </p>
            <UploadSection clientId={client.id} />
          </div>
        </div>

      </div>
    </div>
  )
}