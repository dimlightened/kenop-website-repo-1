import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function classifyDoc(name) {
  const n = name.toLowerCase()
  if (n.includes('report') || n.includes('cdsbo') || n.includes('nsbo') || n.includes('acid oil')) return 'lab_report'
  if (n.includes('pid') || n.includes('flow')) return 'pid'
  if (n.includes('manual') || n.includes('operation')) return 'operations_manual'
  if (n.includes('pump') || n.includes('motor') || n.includes('gear') || n.includes('separator')) return 'equipment_spec'
  if (name.match(/\.(jpg|jpeg|png|webp)$/i)) return 'photo'
  return 'other'
}

function extractLabNumbers(text) {
  const patterns = {
    ffa:          [...text.matchAll(/\bffa\b[^\d]*([\d.]+)\s*%/gi)].map(m => parseFloat(m[1])),
    acid_value:   [...text.matchAll(/acid\s*value[^\d]*([\d.]+)/gi)].map(m => parseFloat(m[1])),
    moisture:     [...text.matchAll(/moisture[^\d]*([\d.]+)\s*%/gi)].map(m => parseFloat(m[1])),
    colour:       [...text.matchAll(/colou?r[^\d]*([\d.]+)/gi)].map(m => parseFloat(m[1])),
    fatty_matter: [...text.matchAll(/fatty\s*matter[^\d]*([\d.]+)\s*%/gi)].map(m => parseFloat(m[1])),
    refining_loss:[...text.matchAll(/refining\s*loss[^\d]*([\d.]+)\s*%/gi)].map(m => parseFloat(m[1])),
  }
  const out = {}
  for (const [k,v] of Object.entries(patterns)) if (v.length) out[k] = v
  return Object.keys(out).length ? out : null
}

async function callGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 800, messages })
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callGroqVision(base64, mediaType, prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      max_tokens: 1000,
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
        { type: 'text', text: prompt }
      ]}]
    })
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(request) {
  // Allow Vercel cron (no auth header) or manual calls with secret
  const secret = request.headers.get('x-kenop-secret')
  const isCron = request.headers.get('x-vercel-cron') === '1'
  if (!isCron && secret !== process.env.KENOP_ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // Get pending jobs
    const { data: jobs } = await supabase
      .from('document_processing_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('created_at')
      .limit(5)

    if (!jobs?.length) return Response.json({ processed: 0, message: 'No pending jobs' })

    const results = []

    for (const job of jobs) {
      await supabase.from('document_processing_queue')
        .update({ status: 'processing', attempts: job.attempts + 1 })
        .eq('id', job.id)

      try {
        const { data: fileBlob, error: dlErr } = await supabase.storage
          .from(job.bucket_id).download(job.storage_path)
        if (dlErr) throw new Error('Download failed: ' + dlErr.message)

        const buffer = await fileBlob.arrayBuffer()
        const ext = (job.file_name.split('.').pop() || '').toLowerCase()
        const isImage = ['jpg','jpeg','png','webp'].includes(ext)
        const category = classifyDoc(job.file_name)

        let text = ''
        let summary = ''
        let extractedData = null

        if (isImage) {
          const bytes = new Uint8Array(buffer)
          let binary = ''
          for (let i = 0; i < bytes.length; i += 8192) {
            binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
          }
          const base64 = btoa(binary)
          const mediaType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
          text = await callGroqVision(base64, mediaType,
            'This is a photo from an edible oil refinery or biodiesel plant. List all equipment visible, any labels, gauges, readings, or settings. Be specific and technical.')
          summary = text.slice(0, 250)

        } else if (ext === 'pdf') {
          // Extract text from PDF raw bytes
          const bytes = new Uint8Array(buffer)
          let raw = ''
          let inStr = false, cur = ''
          for (let i = 0; i < bytes.length; i++) {
            const c = bytes[i]
            if (c === 40) { inStr = true; cur = ''; continue }
            if (c === 41) { if (inStr && cur.length > 1) raw += cur + ' '; inStr = false; continue }
            if (inStr && c >= 32 && c < 127) cur += String.fromCharCode(c)
          }
          text = raw.replace(/\s+/g, ' ').trim()
          if (text.length > 30) {
            extractedData = extractLabNumbers(text)
            summary = await callGroq([
              { role: 'system', content: 'You are an edible oil refinery expert. Summarise plant documents concisely.' },
              { role: 'user', content: `Document: ${job.file_name}\n\n${text.slice(0, 2000)}\n\nSummarise in 2 sentences what this document contains and any key numbers found.` }
            ])
          } else {
            summary = `PDF document: ${job.file_name}`
          }

        } else {
          // DOCX/other - decode as text
          try { text = new TextDecoder('utf-8', { fatal: false }).decode(buffer).slice(0, 3000) } catch { text = '' }
          if (text.length > 20) {
            summary = await callGroq([
              { role: 'system', content: 'Summarise this plant document in 2 sentences.' },
              { role: 'user', content: `${job.file_name}: ${text.slice(0, 2000)}` }
            ])
          }
        }

        // Save to client_files
        const { error: upsertErr } = await supabase.from('client_files').upsert({
          client_id: job.client_id,
          storage_path: job.storage_path,
          bucket_id: job.bucket_id,
          file_name: job.file_name,
          original_name: job.file_name,
          file_type: ext,
          doc_category: category,
          extracted_text: text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').slice(0, 8000),
          extracted_data: extractedData,
          summary: summary.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF]/g,'').slice(0, 500),
          processed: true,
          processed_at: new Date().toISOString()
        }, { onConflict: 'client_id,storage_path' })

        if (upsertErr) throw new Error('Save failed: ' + upsertErr.message)

        // If lab report — insert readings
        if (category === 'lab_report' && extractedData) {
          const r = extractedData
          if (r.ffa?.[0] || r.acid_value?.[0]) {
            await supabase.from('lab_readings').insert({
              client_id: job.client_id, source: 'document_extraction',
              batch_id: `DOC-${job.id.slice(0,8)}`,
              ffa_pct: r.ffa?.[0], colour_lovibond: r.colour?.[0],
              moisture_pct: r.moisture?.[0], recorded_at: new Date().toISOString()
            })
          }
          if (r.acid_value?.[0] || r.fatty_matter?.[0]) {
            await supabase.from('acidoil_batches').insert({
              client_id: job.client_id, source: 'document_extraction',
              batch_id: `DOC-AO-${job.id.slice(0,8)}`,
              av: r.acid_value?.[0], fatty_matter_pct: r.fatty_matter?.[0],
              ffa_pct: r.ffa?.[0], moisture_pct: r.moisture?.[0],
              recorded_at: new Date().toISOString()
            })
          }
        }

        await supabase.from('document_processing_queue')
          .update({ status: 'done', processed_at: new Date().toISOString() })
          .eq('id', job.id)

        results.push({ file: job.file_name, status: 'done', category, chars: text.length })

      } catch (err) {
        await supabase.from('document_processing_queue')
          .update({ status: 'failed', error: err.message })
          .eq('id', job.id)
        results.push({ file: job.file_name, status: 'failed', error: err.message })
      }
    }

    return Response.json({ processed: results.length, results })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
