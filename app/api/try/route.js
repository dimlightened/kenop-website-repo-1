import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MAX_FREE = 3

export async function POST(request) {
  try {
    const { gstin, question, company } = await request.json()
    if (!gstin || !question) return Response.json({ error: 'GSTIN and question required' }, { status: 400 })

    // Get remaining queries (handles 24hr reset automatically)
    const { data: remaining } = await sb.rpc('get_gstin_queries_remaining', { p_gstin: gstin })
    const queriesLeft = remaining ?? MAX_FREE

    if (queriesLeft <= 0) {
      // Check if this is a hot lead returning
      const { data: rec } = await sb.from('gstin_queries').select('return_count, is_hot_lead').eq('gstin', gstin).single()
      const hoursMsg = 'Your 3 free queries for this window are used. Come back in 24 hours for 3 more — or sign up for unlimited access.'
      return Response.json({ 
        error: hoursMsg, 
        isHotLead: rec?.is_hot_lead || false,
        returnCount: rec?.return_count || 0
      }, { status: 429 })
    }

    // Increment query count
    const { data: existing } = await sb.from('gstin_queries').select('id, query_count, return_count').eq('gstin', gstin).single()

    if (existing) {
      await sb.from('gstin_queries').update({
        query_count: existing.query_count + 1,
        last_query_at: new Date().toISOString()
      }).eq('gstin', gstin)
    } else {
      await sb.from('gstin_queries').insert({
        gstin,
        query_count: 1,
        window_started_at: new Date().toISOString()
      })
    }

    const newQueriesLeft = queriesLeft - 1

    // Build system prompt
    const companyName = company?.tradeName || company?.legalName || gstin
    const isReturning = (existing?.return_count || 0) > 0

    const systemPrompt = `You are Kenop Intelligence, an expert process consultant for edible oil refineries and biodiesel plants in India.

You are responding to a free trial query from ${companyName} (GSTIN: ${gstin}, ${company?.state || 'India'}).
${isReturning ? 'This company has returned for more queries — they are clearly interested.' : ''}

Provide a genuinely useful, specific, quantitative answer that demonstrates real expertise.
Reference Indian refinery context, typical Indian feedstock quality, and realistic benchmarks.
This is their free trial — give them real value that makes them want to sign up.
Keep response under 250 words — crisp, expert, actionable.`

    // Call Together AI
    const togetherKey = process.env.TOGETHER_API_KEY
    const model = process.env.TOGETHER_MODEL_NU || process.env.TOGETHER_MODEL_BD || 'Qwen/Qwen3-8B'

    let aiText
    if (togetherKey) {
      const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${togetherKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      })
      const d = await res.json()
      aiText = d.choices?.[0]?.message?.content || 'No response generated.'
    } else {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      })
      const d = await res.json()
      aiText = d.choices?.[0]?.message?.content || 'No response generated.'
    }

    // Flag as hot lead if returning
    if (isReturning) {
      await sb.from('gstin_queries').update({ is_hot_lead: true }).eq('gstin', gstin)
    }

    return Response.json({
      response: aiText,
      queriesLeft: newQueriesLeft,
      queriesUsed: MAX_FREE - newQueriesLeft,
      isReturning
    })

  } catch (err) {
    console.error('Try route error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// GET - check queries remaining for a GSTIN
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const gstin = searchParams.get('gstin')
  if (!gstin) return Response.json({ error: 'GSTIN required' }, { status: 400 })

  const { data: remaining } = await sb.rpc('get_gstin_queries_remaining', { p_gstin: gstin })
  const { data: rec } = await sb.from('gstin_queries').select('return_count, is_hot_lead, window_started_at').eq('gstin', gstin).single()

  return Response.json({
    queriesLeft: remaining ?? MAX_FREE,
    returnCount: rec?.return_count || 0,
    isHotLead: rec?.is_hot_lead || false,
    windowStarted: rec?.window_started_at || null
  })
}
