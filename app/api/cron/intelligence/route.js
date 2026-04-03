import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function groq(messages, max_tokens=1200) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens, temperature: 0.2, messages })
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function analyseClient(client) {
  const clientId = client.id
  const vertical = client.vertical || 'edible_oil'
  const now = new Date()
  const periodStart = new Date(now - 24 * 60 * 60 * 1000) // last 24 hours

  // Get recent lab readings
  const { data: readings } = await supabase
    .from('lab_readings')
    .select('*')
    .eq('client_id', clientId)
    .gte('recorded_at', periodStart.toISOString())
    .order('recorded_at', { ascending: false })

  // Get acid oil batches
  const { data: aoBatches } = await supabase
    .from('acidoil_batches')
    .select('*')
    .eq('client_id', clientId)
    .gte('recorded_at', periodStart.toISOString())

  // Get benchmarks
  const { data: benchmarks } = await supabase
    .from('client_benchmarks')
    .select('*')
    .eq('client_id', clientId)

  // Get document summaries for context
  const { data: docs } = await supabase
    .from('client_files')
    .select('file_name, doc_category, summary')
    .eq('client_id', clientId)
    .eq('processed', true)
    .not('summary', 'is', null)

  const insights = []

  // If no readings today, flag it
  if (!readings?.length && !aoBatches?.length) {
    insights.push({
      client_id: clientId,
      vertical,
      insight_type: 'alert',
      severity: 'warning',
      title: 'No lab readings received today',
      body: 'No lab readings or acid oil batch data was received in the last 24 hours. Verify the Excel macro is running or check if WhatsApp data submission is working.',
      data_points: null,
      recommendations: JSON.stringify(['Check Excel macro on plant computer', 'Verify WhatsApp data format', 'Contact plant operator']),
      period_start: periodStart.toISOString(),
      period_end: now.toISOString()
    })
  }

  // Check deviations against benchmarks
  if (readings?.length && benchmarks?.length) {
    const deviations = []
    const bMap = {}
    for (const b of benchmarks) bMap[b.parameter] = b

    for (const r of readings) {
      for (const [param, bm] of Object.entries(bMap)) {
        const val = r[param]
        if (val == null) continue
        if (bm.critical_max && val > bm.critical_max) {
          deviations.push({ param, value: val, benchmark: bm, severity: 'critical', reading: r })
        } else if (bm.acceptable_max && val > bm.acceptable_max) {
          deviations.push({ param, value: val, benchmark: bm, severity: 'warning', reading: r })
        } else if (bm.acceptable_min && val < bm.acceptable_min) {
          deviations.push({ param, value: val, benchmark: bm, severity: 'warning', reading: r })
        }
      }
    }

    if (deviations.length) {
      const deviationText = deviations.map(d =>
        `${d.param}: ${d.value}${d.benchmark.unit} (${d.severity === 'critical' ? 'CRITICAL' : 'above/below'} acceptable range ${d.benchmark.acceptable_min}-${d.benchmark.acceptable_max}${d.benchmark.unit})`
      ).join('\n')

      const docContext = docs?.map(d => `${d.file_name}: ${d.summary}`).join('\n') || ''

      const analysis = await groq([
        { role: 'system', content: `You are Kenop Intelligence, an expert in ${vertical === 'edible_oil' ? 'edible oil refining' : 'biodiesel production'}. Analyse process deviations and give specific, actionable recommendations. Reference actual numbers. Be direct and technical.` },
        { role: 'user', content: `Plant: ${client.name}\nVertical: ${vertical}\n\nDeviations detected in last 24 hours:\n${deviationText}\n\nRecent readings:\n${JSON.stringify(readings.slice(0,5), null, 2)}\n\nPlant documents context:\n${docContext}\n\nProvide:\n1. Root cause analysis for each deviation\n2. Specific corrective actions (with numbers where possible)\n3. What to watch in next shift\n\nBe specific to their actual numbers.` }
      ])

      const maxSeverity = deviations.some(d => d.severity === 'critical') ? 'critical' : 'warning'

      insights.push({
        client_id: clientId,
        vertical,
        insight_type: 'deviation',
        severity: maxSeverity,
        title: `${deviations.length} process deviation${deviations.length > 1 ? 's' : ''} detected`,
        body: analysis,
        data_points: JSON.stringify(deviations.map(d => ({ param: d.param, value: d.value, threshold: d.benchmark.acceptable_max || d.benchmark.acceptable_min }))),
        recommendations: null,
        period_start: periodStart.toISOString(),
        period_end: now.toISOString()
      })
    }
  }

  // Trend analysis if enough readings exist
  const { data: weekReadings } = await supabase
    .from('lab_readings')
    .select('ffa_pct, yield_pct, colour_lovibond, recorded_at')
    .eq('client_id', clientId)
    .gte('recorded_at', new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: true })

  if (weekReadings?.length >= 5) {
    const ffaValues = weekReadings.filter(r => r.ffa_pct).map(r => r.ffa_pct)
    const avgFirst = ffaValues.slice(0, Math.floor(ffaValues.length/2)).reduce((a,b) => a+b, 0) / Math.floor(ffaValues.length/2)
    const avgLast  = ffaValues.slice(Math.floor(ffaValues.length/2)).reduce((a,b) => a+b, 0) / ffaValues.slice(Math.floor(ffaValues.length/2)).length
    const trend = ((avgLast - avgFirst) / avgFirst) * 100

    if (Math.abs(trend) > 10) {
      const trendAnalysis = await groq([
        { role: 'system', content: `You are Kenop Intelligence, expert in ${vertical === 'edible_oil' ? 'edible oil refining' : 'biodiesel production'}.` },
        { role: 'user', content: `FFA trend over 7 days for ${client.name}: ${trend > 0 ? '+' : ''}${trend.toFixed(1)}% change.\nValues: ${ffaValues.join(', ')}\n\nExplain what this trend means and what the plant should do. Be specific.` }
      ])
      insights.push({
        client_id: clientId,
        vertical,
        insight_type: 'trend',
        severity: Math.abs(trend) > 20 ? 'warning' : 'info',
        title: `FFA ${trend > 0 ? 'increasing' : 'decreasing'} trend — ${Math.abs(trend).toFixed(1)}% over 7 days`,
        body: trendAnalysis,
        data_points: JSON.stringify({ ffa_trend_pct: trend, readings: ffaValues }),
        period_start: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: now.toISOString()
      })
    }
  }

  // Save all insights
  if (insights.length) {
    await supabase.from('intelligence_insights').insert(insights)
  }

  return { client: client.name, insights_generated: insights.length }
}

export async function POST(request) {
  try {
    const secret = request.headers.get('x-kenop-secret')
    const isCron = request.headers.get('x-vercel-cron') === '1'
    if (!isCron && secret !== process.env.KENOP_ADMIN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, vertical')

    if (!clients?.length) return Response.json({ message: 'No clients' })

    const results = []
    for (const client of clients) {
      try {
        const result = await analyseClient(client)
        results.push(result)
      } catch(e) {
        results.push({ client: client.name, error: e.message })
      }
    }

    return Response.json({ ran_at: new Date().toISOString(), results })
  } catch(err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
