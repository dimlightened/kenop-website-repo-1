import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ','')
    const { data:{ user } } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).auth.getUser(token)
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 })

    const { data:client } = await supabase.from('clients').select('id,vertical').eq('auth_user_id', user.id).single()
    if (!client) return Response.json({ error:'No client' }, { status:404 })

    let { data:comp } = await supabase.from('onboarding_completion').select('*').eq('client_id', client.id).single()

    if (!comp) {
      const { data:newComp } = await supabase.from('onboarding_completion')
        .insert({ client_id: client.id, vertical: client.vertical })
        .select().single()
      comp = newComp
    }

    await supabase.rpc('calc_onboarding_completion', { p_client_id: client.id })
    const { data:fresh } = await supabase.from('onboarding_completion').select('*').eq('client_id', client.id).single()

    // Flatten missing_fields from nested arrays
    const missing = (fresh?.missing_fields || []).flat().filter(Boolean)
    return Response.json({ ...fresh, missing_fields: missing, vertical: client.vertical })
  } catch(err) {
    return Response.json({ error:'Server error' }, { status:500 })
  }
}
