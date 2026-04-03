import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { message, question, client_id } = body
    const query = message || question

    if (!query) return Response.json({ error: 'No message' }, { status: 400 })

    // Get client context
    let clientContext = ''
    let docContext = ''
    let clientIdToUse = client_id

    if (!clientIdToUse) {
      const token = request.headers.get('authorization')?.replace('Bearer ', '')
      if (token) {
        const { data: { user } } = await createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ).auth.getUser(token)
        if (user) {
          const { data: client } = await supabase.from('clients').select('id,name,vertical').eq('auth_user_id', user.id).single()
          if (client) clientIdToUse = client.id
        }
      }
    }

    if (clientIdToUse) {
      // Pull recent lab readings
      const { data: readings } = await supabase
        .from('lab_readings')
        .select('*')
        .eq('client_id', clientIdToUse)
        .order('recorded_at', { ascending: false })
        .limit(10)

      if (readings?.length) {
        clientContext = 'RECENT LAB READINGS:\n' + readings.map(r =>
          `${r.recorded_at?.slice(0,10)}: FFA ${r.ffa_pct || '-'}% | Temp ${r.temp_c || '-'}°C | Colour ${r.colour_lovibond || '-'} | Yield ${r.yield_pct || '-'}%`
        ).join('\n')
      }

      // Pull extracted document context — THIS IS THE KEY ADDITION
      const { data: docs } = await supabase
        .from('client_files')
        .select('file_name, doc_category, summary, extracted_text')
        .eq('client_id', clientIdToUse)
        .eq('processed', true)
        .not('summary', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10)

      if (docs?.length) {
        docContext = '\nPLANT DOCUMENTS ON FILE:\n' + docs.map(d =>
          `[${d.doc_category?.toUpperCase()}] ${d.file_name}:\n${d.summary}`
        ).join('\n\n')

        // For specific questions, include full extracted text of relevant docs
        const queryLower = query.toLowerCase()
        const relevantDocs = docs.filter(d => {
          if (queryLower.includes('acid') && d.doc_category === 'lab_report') return true
          if (queryLower.includes('pump') && d.doc_category === 'equipment_spec') return true
          if (queryLower.includes('manual') && d.doc_category === 'operations_manual') return true
          if (queryLower.includes('pid') && d.doc_category === 'pid') return true
          return false
        })

        if (relevantDocs.length) {
          docContext += '\n\nRELEVANT DOCUMENT DETAILS:\n' + relevantDocs.map(d =>
            `${d.file_name}:\n${d.extracted_text?.slice(0, 1500)}`
          ).join('\n---\n')
        }
      }

      // Acid oil batches
      const { data: aoBatches } = await supabase
        .from('acidoil_batches')
        .select('*')
        .eq('client_id', clientIdToUse)
        .order('recorded_at', { ascending: false })
        .limit(5)

      if (aoBatches?.length) {
        clientContext += '\n\nRECENT ACID OIL BATCHES:\n' + aoBatches.map(a =>
          `${a.recorded_at?.slice(0,10)}: AV ${a.av || '-'} | FM ${a.fatty_matter_pct || '-'}% | FFA ${a.ffa_pct || '-'}%`
        ).join('\n')
      }
    }

    const systemPrompt = `You are Kenop Intelligence — an AI process monitoring assistant specialised in edible oil refining and biodiesel production. You have access to this plant's actual data and documents.

${clientContext}
${docContext}

Answer questions using the plant's actual data above. Be specific — reference actual numbers, dates, readings from their documents and lab data. If you see a deviation from industry benchmarks, name it. If the documents mention specific equipment or process parameters, use them in your answer.

Keep answers concise and actionable. Always ground your answer in their actual data — never give generic advice when plant-specific data is available.`

    // Route to appropriate model
    const useGroq = true // Switch to local Llama when workstation ready

    let answer = ''

    if (useGroq) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      })
      const groqData = await groqRes.json()
      answer = groqData.choices?.[0]?.message?.content || 'No response'
    }

    // Log conversation
    if (clientIdToUse) {
      await supabase.from('conversations').insert({
        client_id: clientIdToUse,
        question: query,
        answer,
        source: 'dashboard',
        has_doc_context: !!docContext,
        created_at: new Date().toISOString()
      }).catch(() => {})
    }

    return Response.json({ answer, has_doc_context: !!docContext })

  } catch (err) {
    console.error('Ask API error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
