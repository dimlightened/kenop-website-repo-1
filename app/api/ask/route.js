import { createClient } from '@supabase/supabase-js'

const DOMAIN_KEYWORDS = [
  'soap','ppm','caustic','separator','neutralisation','neutralization',
  'soapstock','acid oil','ffa','unsap','refining loss','residence',
  'micro-zone','microzone','tfm','alkalinity','pre-sep','post-sep',
  'phosphoric','conditioning','coalesce','coalescence','rag layer',
  'neutralised oil','neutral oil','bleaching','deodorisation','mass balance',
  'value addition','acid value','av ','saponification','emulsion',
  'separator efficiency','tank agitator','vfd','caustic dose',
  'refining','cdsbo','soya refinery','oil refinery','edible oil'
]

const MARKET_KEYWORDS = [
  'price','crop','war','import','duty','market','commodity','export',
  'soya prices','palm prices','inflation','harvest','monsoon',
  'cbot','ncdex','futures','spot price','weather','drought','flood',
  'geopolitical','ukraine','argentina','brazil','supply chain',
  'freight','shipping','tariff','government policy','subsidy'
]

const REPORT_KEYWORDS = [
  'generate report','write report','create report','assessment report',
  'summarise','summarize','executive summary','pdf','document',
  'monthly report','weekly report','send report','prepare report'
]

function classifyQuery(question) {
  const q = question.toLowerCase()
  if (REPORT_KEYWORDS.some(k => q.includes(k))) return 'report'
  if (DOMAIN_KEYWORDS.some(k => q.includes(k))) return 'domain'
  if (MARKET_KEYWORDS.some(k => q.includes(k))) return 'market'
  return 'domain'
}

// ── Layer 1: Your Llama adapter via Ollama ─────────────────────
async function callOllama(systemPrompt, userMessage) {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
  try {
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'kenop-v1',
        prompt: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
        stream: false,
        options: { temperature: 0.3, top_p: 0.9 }
      }),
      signal: AbortSignal.timeout(30000)
    })
    if (!res.ok) throw new Error('Ollama unavailable')
    const data = await res.json()
    return { answer: data.response, source: 'adapter', confident: true }
  } catch (e) {
    return { answer: null, source: 'adapter', confident: false, error: e.message }
  }
}

// ── Layer 2: Groq API — Llama 3 70B (free, global) ────────────
async function callGroq(systemPrompt, userMessage) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.4
      }),
      signal: AbortSignal.timeout(30000)
    })
    if (!res.ok) throw new Error('Groq unavailable')
    const data = await res.json()
    return {
      answer: data.choices?.[0]?.message?.content,
      source: 'groq',
      confident: true
    }
  } catch (e) {
    return { answer: null, source: 'groq', confident: false, error: e.message }
  }
}

// ── Layer 3: Claude Sonnet — reports and final fallback ────────
async function callClaude(systemPrompt, userMessage, adapterDraft = null) {
  const userContent = adapterDraft
    ? `${userMessage}\n\n[Draft answer from domain model for refinement: ${adapterDraft}]`
    : userMessage
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      }),
      signal: AbortSignal.timeout(45000)
    })
    if (!res.ok) throw new Error('Claude unavailable')
    const data = await res.json()
    return {
      answer: data.content?.[0]?.text,
      source: 'claude',
      confident: true
    }
  } catch (e) {
    return { answer: null, source: 'claude', confident: false, error: e.message }
  }
}

function isLowConfidence(answer) {
  if (!answer || answer.length < 80) return true
  const hedges = [
    "i'm not sure","i don't know","i cannot","i'm unable",
    "not enough information","outside my knowledge","i don't have",
    "unclear","uncertain","cannot determine"
  ]
  return hedges.some(h => answer.toLowerCase().includes(h))
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { question } = await request.json()
    if (!question) return Response.json({ error: 'No question provided' }, { status: 400 })

    // ── Fetch client + RAG context from Supabase ────────────
    const { data: client } = await supabase
      .from('clients').select('*')
      .eq('auth_user_id', user.id).single()

    if (!client) return Response.json({ error: 'Client not found' }, { status: 404 })

    const { data: readings } = await supabase
      .from('lab_readings').select('*')
      .eq('client_id', client.id)
      .order('recorded_at', { ascending: false }).limit(30)

    const { data: acidBatches } = await supabase
      .from('acidoil_batches').select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }).limit(10)

    // ── Build RAG context ────────────────────────────────────
    const plantContext = `
PLANT: ${client.name}
LOCATION: ${client.location}
FEEDSTOCK: ${client.feedstock_primary}
CAPACITY: ${client.throughput_tpd} TPD
SEPARATOR: ${client.separator_model || 'Not specified'}
MIXING: ${client.mixing_devices || 'Not specified'}
RESIDENCE TANKS: ${client.residence_tanks || 'Not specified'}
PLC: ${client.plc_connected ? `Yes — ${client.plc_make}` : 'No — Manual plant'}
PLANT NOTES: ${client.plant_notes || 'None'}`.trim()

    const readingsContext = readings?.length > 0
      ? `RECENT LAB READINGS (last ${readings.length} shifts):\n` +
        readings.slice(0, 10).map(r =>
          `${new Date(r.recorded_at).toLocaleDateString('en-IN')} — Pre-sep: ${r.soap_ppm_pre_separator ?? '?'} ppm, Post-sep: ${r.soap_ppm_post_separator ?? '?'} ppm, Sep temp: ${r.separator_feed_temp_degc ?? '?'}°C, FFA: ${r.neutral_oil_ffa_pct ?? '?'}%, Loss: ${r.refining_loss_pct ?? '?'}%`
        ).join('\n')
      : 'No lab readings recorded yet.'

    const acidContext = acidBatches?.length > 0
      ? `RECENT ACID OIL BATCHES:\n` +
        acidBatches.slice(0, 5).map(b =>
          `Acid oil FFA: ${b.acid_oil_ffa_pct ?? '?'}%, Yield: ${b.acid_oil_yield_pct ?? '?'}%, Sep: ${b.separation_behaviour ?? '?'}`
        ).join('\n')
      : 'No acid oil batches recorded yet.'

    // ── System prompts ───────────────────────────────────────
    const domainSystem = `You are Kenop, an expert process intelligence assistant for edible oil refineries. You have deep expertise in neutralisation, acid oil processing, soapstock management, and value addition for vegetable oil refining. Answer with specific numbers, financial impact in Indian Rupees, and actionable parameter adjustments. Always reference the plant's own data when available.

${plantContext}

${readingsContext}

${acidContext}

Answer based on the plant's actual data above. If data is missing, say what measurement would help and why.`

    const marketSystem = `You are a commodity markets and agricultural analyst specialising in edible oils, particularly the Indian vegetable oil market. Provide accurate, nuanced analysis of market conditions, crop data, trade flows, and price dynamics. Be specific with numbers and timeframes.

Plant context: ${client.name} processes ${client.feedstock_primary} at ${client.throughput_tpd} TPD in ${client.location}.`

    const reportSystem = `You are Kenop's report generation engine. Create structured, professional process assessment reports for edible oil refineries. Use formal language suitable for management review. Include tables where helpful. All financial figures in Indian Rupees.

${plantContext}

${readingsContext}

${acidContext}`

    // ── Route and execute ────────────────────────────────────
    const queryType = classifyQuery(question)
    let result = { answer: null, source: null }
    let usedFallback = false

    if (queryType === 'report') {
      // Reports → Claude directly
      result = await callClaude(reportSystem, question)
      if (!result.answer) result = await callGroq(reportSystem, question)

    } else if (queryType === 'market') {
      // Market → Groq (free Llama 70B)
      result = await callGroq(marketSystem, question)
      if (!result.answer || isLowConfidence(result.answer)) {
        result = await callClaude(marketSystem, question)
        usedFallback = true
      }

    } else {
      // Domain → adapter first
      result = await callOllama(domainSystem, question)

      if (!result.answer || isLowConfidence(result.answer)) {
        // Adapter uncertain → Groq second
        result = await callGroq(domainSystem, question)
        usedFallback = true

        if (!result.answer || isLowConfidence(result.answer)) {
          // Groq also uncertain → Claude refines
          const draft = result.answer
          result = await callClaude(domainSystem, question, draft)
        }
      }
    }

    return Response.json({
      answer: result.answer || 'Unable to generate an answer at this time. Please try again.',
      source: result.source,
      query_type: queryType,
      used_fallback: usedFallback,
      plant: client.name,
      readings_used: readings?.length || 0
    })

  } catch (error) {
    console.error('Ask API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}