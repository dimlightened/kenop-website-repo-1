import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { question, vertical } = await request.json()
    if (!question) return Response.json({ error: 'Question required' }, { status: 400 })

    // RAG: full-text search against knowledge base
    const { data: ragResults } = await sb
      .from('knowledge_base')
      .select('question, answer, section')
      .eq('vertical', vertical || 'edible_oil')
      .textSearch('question', question.split(' ').filter(w => w.length > 3).slice(0, 5).join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(4)

    let pairs = ragResults || []
    if (pairs.length === 0) {
      const keywords = question.split(' ').filter(w => w.length > 4)
      for (const kw of keywords.slice(0, 3)) {
        const { data } = await sb
          .from('knowledge_base')
          .select('question, answer, section')
          .eq('vertical', vertical || 'edible_oil')
          .ilike('question', `%${kw}%`)
          .limit(2)
        if (data?.length) {
          pairs = [...pairs, ...data]
          if (pairs.length >= 4) break
        }
      }
    }

    const seen = new Set()
    pairs = pairs.filter(p => {
      if (seen.has(p.question)) return false
      seen.add(p.question)
      return true
    }).slice(0, 4)

    const ragContext = pairs.length > 0
      ? `PROCESS KNOWLEDGE REFERENCES:\n\n${pairs.map((p, i) =>
          `[Reference ${i + 1}]\nQ: ${p.question}\nA: ${p.answer}`
        ).join('\n\n---\n\n')}`
      : ''

    const verticalLabel = vertical === 'biodiesel' ? 'Biodiesel Plant' : 'Edible Oil Refinery'

    const systemPrompt = `You are Kenop Intelligence, a process consultant for ${verticalLabel}s in India with deep oleochemical expertise.

${ragContext ? ragContext + '\n\nIMPORTANT: Use the references above to understand MECHANISMS and PRINCIPLES only. Do NOT quote plant-specific operational data or specific plant numbers from references — extract the general process principle and apply it to the question. Give industry-typical ranges, not case-specific values.\n' : ''}

RESPONSE FORMAT — always follow this structure:
1. What is happening (the core mechanism in 2-3 sentences)
2. Stage by stage explanation (if multi-stage question)
3. Typical industry benchmarks / ranges
4. What to check if values are abnormal

STYLE RULES:
- Write in clear plain English, no markdown symbols or hashtags
- Use numbers and ranges where relevant — be quantitative
- Keep total response under 300 words
- End with 1-2 diagnostic questions to help narrow down their specific situation
- Write like a senior consultant explaining to a plant manager, not like a textbook`

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }]
      })
    })

    const claudeData = await claudeRes.json()
    if (!claudeRes.ok) throw new Error(claudeData.error?.message || 'Claude API error')

    const response = claudeData.content?.[0]?.text || 'No response generated.'
    const inputTokensEstimate = Math.round((systemPrompt.length + question.length) / 4)

    return Response.json({
      response,
      ragPairs: pairs.map(p => ({ question: p.question, answer: p.answer })),
      stats: {
        ragPairsFound: pairs.length,
        inputTokensEstimate,
        model: 'claude-sonnet-4-5'
      }
    })

  } catch (err) {
    console.error('Lab route error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
