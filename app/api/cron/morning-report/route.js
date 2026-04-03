import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function groq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 600, temperature: 0.3, messages })
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function generateMorningReport(client) {
  const now = new Date()
  const yesterday = new Date(now - 24 * 60 * 60 * 1000)

  // Get last night's insights
  const { data: insights } = await supabase
    .from('intelligence_insights')
    .select('*')
    .eq('client_id', client.id)
    .gte('generated_at', yesterday.toISOString())
    .order('severity', { ascending: true }) // critical first

  // Get last 24h readings
  const { data: readings } = await supabase
    .from('lab_readings')
    .select('*')
    .eq('client_id', client.id)
    .gte('recorded_at', yesterday.toISOString())
    .order('recorded_at', { ascending: false })
    .limit(10)

  const { data: aoBatches } = await supabase
    .from('acidoil_batches')
    .select('*')
    .eq('client_id', client.id)
    .gte('recorded_at', yesterday.toISOString())

  const insightSummary = insights?.map(i => `[${i.severity.toUpperCase()}] ${i.title}: ${i.body.slice(0,200)}`).join('\n\n') || 'No issues detected.'
  const readingSummary = readings?.map(r => `FFA ${r.ffa_pct || '—'}% | Temp ${r.temp_c || '—'}°C | Colour ${r.colour_lovibond || '—'} | Yield ${r.yield_pct || '—'}%`).join('\n') || 'No readings.'

  const report = await groq([
    { role: 'system', content: `You are Kenop Intelligence. Write a concise WhatsApp morning report for a plant owner. Max 200 words. Plain language. Start with Good morning. Reference actual numbers. End with 1-2 specific things to watch today.` },
    { role: 'user', content: `Plant: ${client.name}\nDate: ${now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}\n\nYesterday's readings:\n${readingSummary}\n\nInsights generated:\n${insightSummary}\n\nWrite the morning WhatsApp report.` }
  ])

  // Save as morning report insight
  const { data: savedReport } = await supabase
    .from('intelligence_insights')
    .insert({
      client_id: client.id,
      vertical: client.vertical,
      insight_type: 'morning_report',
      severity: insights?.some(i => i.severity === 'critical') ? 'critical' : insights?.some(i => i.severity === 'warning') ? 'warning' : 'info',
      title: `Morning report — ${now.toLocaleDateString('en-IN', { day:'numeric', month:'short' })}`,
      body: report,
      data_points: JSON.stringify({ readings_count: readings?.length || 0, insights_count: insights?.length || 0 }),
      period_start: yesterday.toISOString(),
      period_end: now.toISOString()
    })
    .select()
    .single()

  // TODO: Send via WhatsApp Business API when configured
  // For now, saved to dashboard — WhatsApp delivery wired in next sprint

  return { client: client.name, report_preview: report.slice(0, 100) }
}

export async function POST(request) {
  try {
    const secret = request.headers.get('x-kenop-secret')
    const isCron = request.headers.get('x-vercel-cron') === '1'
    if (!isCron && secret !== process.env.KENOP_ADMIN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: clients } = await supabase.from('clients').select('id, name, vertical')
    if (!clients?.length) return Response.json({ message: 'No clients' })

    const results = []
    for (const client of clients) {
      try {
        results.push(await generateMorningReport(client))
      } catch(e) {
        results.push({ client: client.name, error: e.message })
      }
    }

    return Response.json({ ran_at: new Date().toISOString(), results })
  } catch(err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
