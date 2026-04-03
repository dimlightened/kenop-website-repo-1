import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ','')
    const { data:{ user } } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).auth.getUser(token)
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 })

    const { data:client } = await supabase.from('clients').select('id').eq('auth_user_id', user.id).single()
    if (!client) return Response.json({ error:'No client' }, { status:404 })

    const body = await request.json()
    const { section, values } = body

    // Save values to plant_onboarding_progress
    await supabase.from('plant_onboarding_progress').upsert({
      client_id: client.id,
      section,
      data: values,
      completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'client_id,section' })

    // Mark section complete
    await supabase.from('onboarding_completion')
      .upsert({ client_id: client.id, [section]: true }, { onConflict: 'client_id' })

    // Recalculate
    await supabase.rpc('calc_onboarding_completion', { p_client_id: client.id })

    return Response.json({ ok: true })
  } catch(err) {
    console.error(err)
    return Response.json({ error:'Server error' }, { status:500 })
  }
}
