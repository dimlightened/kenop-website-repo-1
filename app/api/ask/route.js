import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { message, clientId } = await request.json()
    if (!message) return Response.json({ error: 'Message required' }, { status: 400 })

    // Get client details and vertical
    const { data: client } = await supabase
      .from('clients')
      .select('id, name, vertical, status')
      .eq('id', clientId)
      .single()

    // Check trial/subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status, trial_expires_at, queries_used_this_cycle, max_queries_per_month')
      .eq('client_id', clientId)
      .single()

    if (subscription) {
      // Check trial expiry
      if (subscription.tier === 'free_trial' && subscription.trial_expires_at) {
        if (new Date(subscription.trial_expires_at) < new Date()) {
          return Response.json({ error: 'Trial expired. Please contact us to continue.' }, { status: 403 })
        }
      }

      // Check query limits
      if (subscription.max_queries_per_month > 0 &&
          subscription.queries_used_this_cycle >= subscription.max_queries_per_month) {
        return Response.json({ error: `Query limit reached (${subscription.max_queries_per_month}/month). Upgrade to continue.` }, { status: 429 })
      }
    }

    // Get recent lab data for context
    const { data: labData } = await supabase
      .from('lab_readings')
      .select('parameter_name, value, unit, recorded_at')
      .eq('client_id', clientId)
      .order('recorded_at', { ascending: false })
      .limit(20)

    // Get client benchmarks
    const { data: benchmarks } = await supabase
      .from('client_benchmarks')
      .select('parameter_name, target_value, unit')
      .eq('client_id', clientId)
      .limit(10)

    // Build context
    const vertical = client?.vertical || 'edible_oil'
    const verticalLabel = vertical === 'biodiesel' ? 'Biodiesel Plant' : 'Edible Oil Refinery'

    const labContext = labData?.length
      ? `Recent lab readings:\n${labData.map(r => `${r.parameter_name}: ${r.value} ${r.unit || ''} (${new Date(r.recorded_at).toLocaleDateString('en-IN')})`).join('\n')}`
      : 'No recent lab readings available.'

    const benchmarkContext = benchmarks?.length
      ? `Plant benchmarks:\n${benchmarks.map(b => `${b.parameter_name}: ${b.target_value} ${b.unit || ''}`).join('\n')}`
      : ''

    const systemPrompt = `You are Kenop Intelligence, an expert process consultant for ${verticalLabel}s in India.

You have deep expertise in oleochemical processes, refinery operations, and process optimization.
You combine domain expertise with this plant's actual data to give specific, actionable guidance.
You can discuss general knowledge but always connect it back to process context when relevant.
Never make up specific numbers — only cite numbers from the plant data provided below.

Plant: ${client?.name || 'Unknown'}
Vertical: ${verticalLabel}

${labContext}

${benchmarkContext}`

    // Select model based on vertical
    const togetherKey = process.env.TOGETHER_API_KEY
    const model = vertical === 'biodiesel'
      ? (process.env.TOGETHER_MODEL_BD || 'Qwen/Qwen3-8B')
      : (process.env.TOGETHER_MODEL_NU || 'Qwen/Qwen3-8B')

    // Use Together AI if key available, else fall back to Groq
    let response, aiText

    if (togetherKey) {
      response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${togetherKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 1024,
          temperature: 0.3
        })
      })
      const data = await response.json()
      aiText = data.choices?.[0]?.message?.content || 'No response generated.'
    } else {
      // Fallback to Groq
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 1024,
          temperature: 0.3
        })
      })
      const data = await response.json()
      aiText = data.choices?.[0]?.message?.content || 'No response generated.'
    }

    // Log query and increment counter
    await supabase.from('query_logs').insert({
      client_id: clientId,
      query_type: 'ai_chat',
      tokens_used: aiText.length / 4
    })

    await supabase.from('subscriptions')
      .update({ queries_used_this_cycle: (subscription?.queries_used_this_cycle || 0) + 1 })
      .eq('client_id', clientId)

    return Response.json({
      response: aiText,
      model: model,
      queriesUsed: (subscription?.queries_used_this_cycle || 0) + 1,
      queriesLimit: subscription?.max_queries_per_month || 250
    })

  } catch (err) {
    console.error('Ask route error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
