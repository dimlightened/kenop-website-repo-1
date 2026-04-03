import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    await supabase.from('leads').insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      vertical: body.vertical,
      source: body.source || 'website',
      created_at: new Date().toISOString()
    })
    return Response.json({ ok: true })
  } catch(err) {
    return Response.json({ ok: false })
  }
}
