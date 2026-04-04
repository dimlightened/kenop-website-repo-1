import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ─── DYNAMIC SCHEMA READER ────────────────────────────────────────────────────
// Reads actual columns from the live database. Never hardcodes column names.
const schemaCache = {}
async function getLiveColumns(tableName) {
  if (schemaCache[tableName]) return schemaCache[tableName]
  const { data } = await sb
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_name', tableName)
    .eq('table_schema', 'public')
    .order('ordinal_position')
  const cols = (data || []).map(c => ({ name: c.column_name, type: c.data_type }))
  schemaCache[tableName] = cols
  return cols
}

// ─── DYNAMIC INSERT ───────────────────────────────────────────────────────────
// Strips any key that doesn't exist in the actual table. Zero column mismatch.
async function dynamicInsert(tableName, data) {
  const cols = await getLiveColumns(tableName)
  const validNames = new Set(cols.map(c => c.name))
  const safe = {}
  for (const [k, v] of Object.entries(data)) {
    if (validNames.has(k) && v !== null && v !== undefined) safe[k] = v
  }
  if (!Object.keys(safe).length) return
  const { error } = await sb.from(tableName).insert(safe)
  if (error) console.error(`dynamicInsert(${tableName}):`, error.message)
}

// ─── GROQ ─────────────────────────────────────────────────────────────────────
async function groqVision(base64, mediaType, prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview', max_tokens: 2000,
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
        { type: 'text', text: prompt }
      ]}]
    })
  })
  return (await res.json()).choices?.[0]?.message?.content || ''
}

async function groqText(messages, jsonMode = false) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', max_tokens: 1000, temperature: 0.1,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      messages
    })
  })
  return (await res.json()).choices?.[0]?.message?.content || ''
}

// ─── SMART LAB EXTRACTION ─────────────────────────────────────────────────────
// Tells Groq exactly what columns exist. Groq can only return valid keys.
async function extractAndInsertLabReadings(text, clientId, fileName) {
  const cols = await getLiveColumns('lab_readings')
  const numericCols = cols
    .filter(c => ['numeric','integer','bigint','real','double precision'].includes(c.type))
    .map(c => c.name)
    .filter(c => !['id','batch_id','client_id','created_at'].includes(c))

  if (!numericCols.length) return

  const result = await groqText([{
    role: 'user',
    content: `Extract data from this edible oil refinery lab report.
The database table has EXACTLY these numeric columns:
${numericCols.join(', ')}

Return ONLY a JSON object. Keys must be from the list above only.
Values must be numbers. Omit columns you cannot find. No explanation.

Document: ${fileName}
Text: ${text.slice(0, 4000)}`
  }], true)

  let extracted = {}
  try { extracted = JSON.parse(result) } catch { return }

  // dynamicInsert does final validation — drops anything not in schema
  await dynamicInsert('lab_readings', {
    ...extracted,
    client_id: clientId,
    notes: `Auto-extracted from: ${fileName}`,
    recorded_at: new Date().toISOString()
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function classifyDoc(name) {
  const n = name.toLowerCase()
  if (/report|cdsbo|nsbo|acid.?oil|lab/.test(n)) return 'lab_report'
  if (/pid|flow|tentative/.test(n)) return 'pid'
  if (/manual|operation/.test(n)) return 'operations_manual'
  if (/pump|motor|gear|separator|reactor|nano/.test(n)) return 'equipment_spec'
  return 'other'
}

function sanitize(t) {
  return (t||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF]/g,'').trim()
}

async function toBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(binary)
}

function extractPDFText(buffer) {
  const raw = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
  const parts = []
  for (const m of raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
    for (const s of m[1].matchAll(/\(([^)\\]|\\.)*\)/g)) {
      const c = s[0].slice(1,-1).replace(/\\n/g,' ').replace(/\\r/g,' ')
        .replace(/\\t/g,' ').replace(/\\\\/g,'\\').replace(/\\[0-9]{3}/g,' ')
      if (c.length > 2 && /[a-zA-Z0-9]/.test(c)) parts.push(c)
    }
  }
  return parts.join(' ').replace(/\s+/g,' ').trim()
}

// ─── MAIN JOB PROCESSOR ───────────────────────────────────────────────────────
async function processJob(job) {
  const { data: client } = await sb.from('clients').select('vertical,name').eq('id', job.client_id).single()
  const vertical = client?.vertical || 'edible_oil'
  const clientName = client?.name || 'Plant'

  const { data: fileBlob, error: dlErr } = await sb.storage.from(job.bucket_id).download(job.storage_path)
  if (dlErr) throw new Error('Download failed: ' + dlErr.message)

  const buffer = await fileBlob.arrayBuffer()
  const ext = (job.file_name.split('.').pop() || '').toLowerCase()
  const isImage = ['jpg','jpeg','png','webp'].includes(ext)
  const isPDF = ext === 'pdf'
  const category = classifyDoc(job.file_name)

  let text = '', summary = ''

  if (isImage) {
    const base64 = await toBase64(buffer)
    const mediaType = ['jpg','jpeg'].includes(ext) ? 'image/jpeg' : `image/${ext}`
    const prompt = category === 'lab_report'
      ? `Lab report from ${clientName}. Extract ALL numbers, parameters, measurements, labels and units. Be precise.`
      : `Equipment/plant photo from ${clientName} (${vertical}). Describe all labels, nameplates, gauges, readings, and text visible.`
    text = await groqVision(base64, mediaType, prompt)
    summary = await groqText([{ role:'user', content:`Summarise in 2 sentences:\n${text.slice(0,1000)}` }])

  } else if (isPDF) {
    text = extractPDFText(buffer)
    if (text.length < 50) {
      // PDF text extraction failed — send to vision
      const base64 = await toBase64(buffer.slice(0, 200000))
      text = await groqVision(base64, 'image/jpeg',
        `PDF from ${clientName}. Extract all text, numbers, parameters, and measurements visible.`)
    }
    summary = await groqText([
      { role:'system', content:`Expert in ${vertical} refinery processes.` },
      { role:'user', content:`Document: ${job.file_name}\n\n${text.slice(0,3000)}\n\nSummarise in 2-3 sentences. Include key numbers found.` }
    ])

  } else {
    try {
      text = new TextDecoder('utf-8',{fatal:false}).decode(buffer)
        .replace(/[^\x20-\x7E\n\r\t]/g,' ').replace(/\s+/g,' ').trim().slice(0,4000)
      if (text.length > 50)
        summary = await groqText([{ role:'user', content:`Summarise in 2 sentences:\n${text.slice(0,2000)}` }])
    } catch { text=''; summary='' }
  }

  // Save using dynamicInsert — validates every column against live schema
  await dynamicInsert('client_files', {
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
    summary: sanitize(summary).slice(0, 500),
    processed: true,
    processed_at: new Date().toISOString()
  })

  // Lab reports: extract numbers using live schema → insert only valid columns
  if (category === 'lab_report' && text.length > 30) {
    await extractAndInsertLabReadings(text, job.client_id, job.file_name)
  }

  return { file: job.file_name, status: 'done', category, chars: text.length, summary: summary.slice(0,80) }
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const secret = request.headers.get('x-kenop-secret')
    const isCron = request.headers.get('x-vercel-cron') === '1'
    if (!isCron && secret !== process.env.KENOP_ADMIN_SECRET)
      return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: jobs } = await sb
      .from('document_processing_queue')
      .select('*').eq('status','pending').lt('attempts',3)
      .order('created_at').limit(5)

    if (!jobs?.length) return Response.json({ processed: 0, message: 'No pending jobs' })

    const results = []
    for (const job of jobs) {
      await sb.from('document_processing_queue')
        .update({ status:'processing', attempts: job.attempts + 1 }).eq('id', job.id)
      try {
        const result = await processJob(job)
        await sb.from('document_processing_queue')
          .update({ status:'done', processed_at: new Date().toISOString() }).eq('id', job.id)
        results.push(result)
      } catch (err) {
        await sb.from('document_processing_queue')
          .update({ status:'failed', error: err.message }).eq('id', job.id)
        results.push({ file: job.file_name, status:'failed', error: err.message })
      }
    }
    return Response.json({ processed: results.length, results })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
