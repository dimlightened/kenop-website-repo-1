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

    // Fallback: if no text search results, get top pairs by simple ilike
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

    // Deduplicate
    const seen = new Set()
    pairs = pairs.filter(p => {
      if (seen.has(p.question)) return false
      seen.add(p.question)
      return true
    }).slice(0, 4)

    // Build RAG context block
    const ragContext = pairs.length > 0
      ? `RELEVANT KNOWLEDGE FROM KENOP'S PROCESS ASSESSMENT DATABASE:\n\n${pairs.map((p, i) =>
          `[Reference ${i + 1}]\nQ: ${p.question}\nA: ${p.answer}`
        ).join('\n\n---\n\n')}`
      : ''

    const verticalLabel = vertical === 'biodiesel' ? 'Biodiesel Plant' : 'Edible Oil Refinery'

    const systemPrompt = `You are Kenop Intelligence, an expert process consultant for ${verticalLabel}s in India.

You have access to Kenop's proprietary process assessment database — real knowledge from plant assessments, process diagnostics, and process engineering expertise specific to Indian oleochemical operations.

${ragContext ? ragContext + '\n\nUSE THE ABOVE REFERENCES as your primary knowledge source when they are relevant. Cite specific numbers and thresholds from the references.' : ''}

RESPONSE GUIDELINES:
- Be specific and quantitative — always cite actual numbers, thresholds, and benchmarks
- Reference Indian refinery context (feedstock quality, Indian market conditions)
- If relevant reference material is provided above, use it directly — do not ignore it
- Keep responses focused and actionable — under 300 words unless the question demands more
- Never say "I don't know" — use your process engineering expertise to give a best answer
- Format clearly — use line breaks for readability, not markdown headers`

    // Call Claude API
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

    if (!claudeRes.ok) {
      throw new Error(claudeData.error?.message || 'Claude API error')
    }

    const response = claudeData.content?.[0]?.text || 'No response generated.'

    // Estimate tokens
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
