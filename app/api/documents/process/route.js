import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function classifyDoc(name) {
  const n = name.toLowerCase()
  if (n.includes('report') || n.includes('cdsbo') || n.includes('nsbo') || n.includes('acid oil') || n.includes('lab')) return 'lab_report'
  if (n.includes('pid') || n.includes('flow') || n.includes('tentative')) return 'pid'
  if (n.includes('manual') || n.includes('operation')) return 'operations_manual'
  if (/pump|motor|gear|separator|reactor|nano/i.test(name)) return 'equipment_spec'
  if (/\.(jpg|jpeg|png|webp)$/i.test(name)) return 'photo'
  return 'other'
}

async function toBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return btoa(binary)
}

async function groqVision(base64, mediaType, prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      max_tokens: 1500,
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
        { type: 'text', text: prompt }
      ]}]
    })
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function groqText(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1000, messages })
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function sanitize(text) {
  return (text || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF]/g, '').trim()
}

async function processJob(job) {
  const { data: fileBlob, error: dlErr } = await supabase.storage
    .from(job.bucket_id).download(job.storage_path)
  if (dlErr) throw new Error('Download failed: ' + dlErr.message)

  const buffer = await fileBlob.arrayBuffer()
  const ext = (job.file_name.split('.').pop() || '').toLowerCase()
  const isImage = ['jpg','jpeg','png','webp'].includes(ext)
  const isPDF = ext === 'pdf'
  const category = classifyDoc(job.file_name)

  let text = ''
  let summary = ''

  if (isImage) {
    const base64 = await toBase64(buffer)
    const mediaType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
    const prompt = category === 'lab_report'
      ? 'This is a lab report from an edible oil refinery. Extract ALL numbers, measurements, parameters, dates, and values. List every reading with its label and unit.'
      : 'This is from an edible oil refinery. Describe all equipment, labels, gauges, readings, nameplate data, and any text visible. Be specific and technical.'
    text = await groqVision(base64, mediaType, prompt)
    summary = text.slice(0, 300)

  } else if (isPDF) {
    const bytes = new Uint8Array(buffer)
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const rawText = decoder.decode(bytes)
    const textParts = []
    const streamMatches = rawText.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)
    for (const match of streamMatches) {
      const strMatches = match[1].matchAll(/\(([^)\\]|\\.)*\)/g)
      for (const s of strMatches) {
        const cleaned = s[0].slice(1,-1).replace(/\\n/g,' ').replace(/\\r/g,' ').replace(/\\t/g,' ').replace(/\\\\/g,'\\').replace(/\\[0-9]{3}/g,' ')
        if (cleaned.length > 2 && /[a-zA-Z0-9]/.test(cleaned)) textParts.push(cleaned)
      }
    }
    const extracted = textParts.join(' ').replace(/\s+/g, ' ').trim()

    if (extracted.length > 50) {
      text = extracted.slice(0, 6000)
      summary = await groqText([
        { role: 'system', content: 'You are an edible oil refinery expert. Summarise this document in 2-3 sentences, mentioning key numbers and parameters.' },
        { role: 'user', content: `Document: ${job.file_name}\n\n${text.slice(0, 3000)}\n\nSummarise what this contains and list the most important readings found.` }
      ])
    } else {
      const base64 = await toBase64(buffer.slice(0, 200000))
      text = await groqVision(base64, 'image/jpeg', `This is a PDF from an edible oil refinery: ${job.file_name}. Extract all text, numbers, measurements, and parameters visible.`)
      summary = text.slice(0, 300)
    }
  } else {
    try {
      text = new TextDecoder('utf-8', { fatal: false }).decode(buffer).replace(/[^\x20-\x7E\n\r\t]/g,' ').replace(/\s+/g,' ').trim().slice(0,4000)
      if (text.length > 50) summary = await groqText([
        { role: 'system', content: 'Summarise this edible oil refinery document in 2 sentences.' },
        { role: 'user', content: `${job.file_name}: ${text.slice(0,2000)}` }
      ])
    } catch { text = ''; summary = '' }
  }

  let extractedData = null
  if (category === 'lab_report' && text.length > 20) {
    const numExtract = await groqText([
      { role: 'system', content: 'Extract numerical readings from this edible oil refinery lab report. Return ONLY a JSON object with keys: soap_ppm_post_separator, neutral_oil_ffa_pct, neutral_oil_colour_r, neutral_oil_colour_y, neutral_oil_moisture_pct, refining_loss_pct, neutral_oil_unsap_pct. Use null for missing values. No explanation, just JSON.' },
      { role: 'user', content: text.slice(0, 3000) }
    ])
    try { extractedData = JSON.parse(numExtract.replace(/```json|```/g,'').trim()) } catch { extractedData = null }
  }

  const { error: upsertErr } = await supabase.from('client_files').upsert({
    client_id: job.client_id,
    storage_path: job.storage_path,
    bucket_id: job.bucket_id,
    bucket: job.bucket_id,
    file_name: job.file_name,
    original_name: job.file_name,
    file_url: '',
    file_type: ext,
    doc_category: category,
    extracted_text: sanitize(text).slice(0, 8000),
    extracted_data: extractedData,
    summary: sanitize(summary).slice(0, 500),
    processed: true,
    processed_at: new Date().toISOString()
  }, { onConflict: 'client_id,storage_path' })

  if (upsertErr) throw new Error('Save failed: ' + upsertErr.message)

  if (category === 'lab_report' && extractedData) {
    const r = extractedData
    if (r.soap_ppm_post_separator || r.neutral_oil_ffa_pct) {
      await supabase.from('lab_readings').insert({
        client_id: job.client_id,
        notes: `Extracted from: ${job.file_name}`,
        soap_ppm_post_separator: r.soap_ppm_post_separator || null,
        neutral_oil_ffa_pct: r.neutral_oil_ffa_pct || null,
        neutral_oil_colour_r: r.neutral_oil_colour_r || null,
        neutral_oil_colour_y: r.neutral_oil_colour_y || null,
        neutral_oil_moisture_pct: r.neutral_oil_moisture_pct || null,
        refining_loss_pct: r.refining_loss_pct || null,
        neutral_oil_unsap_pct: r.neutral_oil_unsap_pct || null,
        recorded_at: new Date().toISOString()
      }).catch(() => null)
    }
  }

  return { file: job.file_name, status: 'done', category, chars: text.length }
}

export async function POST(request) {
  try {
    const secret = request.headers.get('x-kenop-secret')
    const isCron = request.headers.get('x-vercel-cron') === '1'
    if (!isCron && secret !== process.env.KENOP_ADMIN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: jobs } = await supabase
      .from('document_processing_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('created_at')
      .limit(3)

    if (!jobs?.length) return Response.json({ processed: 0, message: 'No pending jobs' })

    const results = []
    for (const job of jobs) {
      await supabase.from('document_processing_queue').update({ status: 'processing', attempts: job.attempts + 1 }).eq('id', job.id)
      try {
        const result = await processJob(job)
        await supabase.from('document_processing_queue').update({ status: 'done', processed_at: new Date().toISOString() }).eq('id', job.id)
        results.push(result)
      } catch (err) {
        await supabase.from('document_processing_queue').update({ status: 'failed', error: err.message }).eq('id', job.id)
        results.push({ file: job.file_name, status: 'failed', error: err.message })
      }
    }
    return Response.json({ processed: results.length, results })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
