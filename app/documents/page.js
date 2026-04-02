'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

// Auto-detect bucket and file type from file extension and name
function detectFileType(file) {
  const name = file.name.toLowerCase()
  const ext = name.split('.').pop()

  if (['dwg','dxf'].includes(ext) || name.includes('pid') || name.includes('p&id') || name.includes('flow'))
    return { bucket: 'pid-files', type: 'pid', label: 'P&ID / Flow diagram' }

  if (['jpg','jpeg','png','heic','webp'].includes(ext))
    return { bucket: 'plant-photos', type: 'photo', label: 'Plant photo' }

  if (name.includes('manual') || name.includes('sop') || name.includes('operation'))
    return { bucket: 'client-documents', type: 'operations_manual', label: 'Operations manual / SOP' }

  if (name.includes('report') || name.includes('lab') || name.includes('analysis'))
    return { bucket: 'client-documents', type: 'lab_report', label: 'Lab report' }

  if (name.includes('pump') || name.includes('motor') || name.includes('gear') ||
      name.includes('separator') || name.includes('reactor'))
    return { bucket: 'client-documents', type: 'equipment_doc', label: 'Equipment document' }

  if (['pdf'].includes(ext))
    return { bucket: 'client-documents', type: 'document', label: 'Document' }

  if (['xlsx','xls','csv'].includes(ext))
    return { bucket: 'client-documents', type: 'data_file', label: 'Data file' }

  if (['docx','doc'].includes(ext))
    return { bucket: 'client-documents', type: 'document', label: 'Document' }

  return { bucket: 'client-documents', type: 'other', label: 'Other file' }
}

const TYPE_COLORS = {
  pid: ['#E6F1FB', '#042C53'],
  photo: ['#E1F5EE', '#085041'],
  operations_manual: ['#EEEDFE', '#26215C'],
  lab_report: ['#FAEEDA', '#412402'],
  equipment_doc: ['#FFF3CD', '#BA7517'],
  data_file: ['#FDECEA', '#C0392B'],
  document: ['#F4F6F8', '#333333'],
  other: ['#F4F6F8', '#333333'],
}

export default function DocumentsPage() {
  const [client, setClient] = useState(null)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState([])
  const [existing, setExisting] = useState([])
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

      if (!clientData) { router.push('/dashboard'); return }
      setClient(clientData)

      const { data: existingFiles } = await supabase
        .from('client_files')
        .select('*')
        .eq('client_id', clientData.id)
        .order('uploaded_at', { ascending: false })

      setExisting(existingFiles || [])
      setLoading(false)
    })
  }, [])

  const onFilesSelected = (e) => {
    const selected = Array.from(e.target.files).map(file => ({
      file,
      detected: detectFileType(file),
      description: '',
      status: 'pending'
    }))
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadAll = async () => {
    if (files.length === 0) return
    setUploading(true)
    const results = []

    for (let i = 0; i < files.length; i++) {
      const { file, detected, description } = files[i]
      const safeName = `${client.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'uploading' } : f
      ))

      const { error } = await supabase.storage
        .from(detected.bucket)
        .upload(safeName, file)

      if (error) {
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'error', error: error.message } : f
        ))
        continue
      }

      const fileUrl = `https://wvjohfmeubnxlwzgszhe.supabase.co/storage/v1/object/public/${detected.bucket}/${safeName}`

      await supabase.from('client_files').insert({
        client_id: client.id,
        file_name: safeName,
        original_name: file.name,
        bucket: detected.bucket,
        file_url: fileUrl,
        file_type: detected.type,
        description: description || detected.label,
        size_bytes: file.size,
      })

      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'done' } : f
      ))
      results.push({ name: file.name, url: fileUrl, type: detected.type })
    }

    // Refresh existing files list
    const { data: refreshed } = await supabase
      .from('client_files')
      .select('*')
      .eq('client_id', client.id)
      .order('uploaded_at', { ascending: false })

    setExisting(refreshed || [])
    setUploaded(results)
    setUploading(false)

    // Clear completed files after 3 seconds
    setTimeout(() => {
      setFiles(prev => prev.filter(f => f.status !== 'done'))
    }, 3000)
  }

  const typeColor = (type) => TYPE_COLORS[type] || TYPE_COLORS.other

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
          <span style={{color:'#aaa',fontSize:13,marginLeft:16}}>Plant Documents</span>
        </div>
        <button onClick={()=>router.push('/dashboard')}
          style={{background:'none',border:'1px solid #555',color:'#ccc',
          padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:13}}>
          ← Dashboard
        </button>
      </div>

      <div style={{maxWidth:640,margin:'0 auto',padding:'24px 16px'}}>

        {/* Plant name */}
        <div style={{marginBottom:20}}>
          <h2 style={{margin:'0 0 4px',color:'#1B2A4A'}}>{client.name}</h2>
          <p style={{margin:0,color:'#888',fontSize:13}}>{client.location} · {client.feedstock_primary}</p>
        </div>

        {/* Upload zone */}
        <div style={{background:'white',borderRadius:12,padding:24,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:20}}>
          <h3 style={{margin:'0 0 8px',color:'#1B2A4A',fontSize:15}}>Upload files</h3>
          <p style={{margin:'0 0 16px',color:'#888',fontSize:13,lineHeight:1.6}}>
            Upload any plant documents — P&IDs, photos, equipment specs, lab reports, SOPs, data files. The system will automatically sort them into the correct category.
          </p>

          <label style={{display:'block',border:'2px dashed #ccc',borderRadius:8,
            padding:32,textAlign:'center',cursor:'pointer',marginBottom:16,
            background:'#FAFAFA'}}>
            <div style={{fontSize:28,marginBottom:8}}>📎</div>
            <div style={{fontWeight:600,color:'#1B2A4A',marginBottom:4}}>
              Click to select files
            </div>
            <div style={{fontSize:12,color:'#aaa'}}>
              PDF, Excel, Word, Images, DWG — any format accepted
            </div>
            <input type="file" multiple style={{display:'none'}}
              onChange={onFilesSelected}/>
          </label>

          {/* Staged files */}
          {files.length > 0 && (
            <div style={{marginBottom:16}}>
              {files.map((f, i) => {
                const [bg, color] = typeColor(f.detected.type)
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,
                    padding:'10px 12px',borderRadius:8,marginBottom:8,
                    background: f.status==='done' ? '#E1F5EE' : f.status==='error' ? '#FDECEA' : bg}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color,
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {f.file.name}
                      </div>
                      <div style={{fontSize:11,color:'#888',marginTop:2}}>
                        {f.detected.label} · {(f.file.size/1024).toFixed(0)} KB
                        {f.status === 'uploading' && ' · Uploading...'}
                        {f.status === 'done' && ' · ✅ Done'}
                        {f.status === 'error' && ` · ❌ ${f.error}`}
                      </div>
                    </div>
                    {f.status === 'pending' && (
                      <button onClick={()=>removeFile(i)}
                        style={{background:'none',border:'none',color:'#aaa',
                        cursor:'pointer',fontSize:18,padding:0}}>×</button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {files.length > 0 && (
            <button onClick={uploadAll} disabled={uploading}
              style={{width:'100%',padding:14,background:'#1D9E75',color:'white',
              border:'none',borderRadius:8,fontSize:15,cursor:'pointer',fontWeight:600}}>
              {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length>1?'s':''}`}
            </button>
          )}
        </div>

        {/* Existing files */}
        <div style={{background:'white',borderRadius:12,
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #f0f0f0',
            display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{margin:0,color:'#1B2A4A',fontSize:15}}>All documents</h3>
            <span style={{fontSize:12,color:'#aaa'}}>{existing.length} files</span>
          </div>

          {existing.length === 0
            ? <div style={{padding:32,textAlign:'center',color:'#aaa',fontSize:14}}>
                No files uploaded yet
              </div>
            : existing.map((f, i) => {
              const [bg, color] = typeColor(f.file_type)
              return (
                <div key={f.id} style={{padding:'12px 20px',
                  borderBottom: i < existing.length-1 ? '1px solid #f8f8f8' : 'none',
                  display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                      <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,
                        background:bg,color,fontWeight:600}}>
                        {f.file_type?.replace(/_/g,' ')}
                      </span>
                    </div>
                    <div style={{fontSize:13,color:'#333',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {f.original_name}
                    </div>
                    <div style={{fontSize:11,color:'#aaa',marginTop:2}}>
                      {new Date(f.uploaded_at).toLocaleDateString('en-IN',{
                        day:'numeric',month:'short',year:'numeric'
                      })}
                      {f.size_bytes && ` · ${(f.size_bytes/1024).toFixed(0)} KB`}
                    </div>
                  </div>
                  <a href={f.file_url} target="_blank" rel="noopener noreferrer"
                    style={{fontSize:13,color:'#1D9E75',textDecoration:'none',
                    padding:'6px 12px',border:'1px solid #1D9E75',borderRadius:6,
                    flexShrink:0,marginLeft:12}}>
                    View
                  </a>
                </div>
              )
            })
          }
        </div>

      </div>
    </div>
  )
}