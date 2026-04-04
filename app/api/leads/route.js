import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { name, email, whatsapp, company, vertical } = await request.json()
    if (!name || !email) return Response.json({ error: 'Name and email required' }, { status: 400 })

    const verticalPath = vertical === 'biodiesel' ? 'biodiesel' : 'edible-oil'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kenop.in'

    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existingUser = users?.find(u => u.email === email)
    let authUserId = existingUser?.id

    if (!authUserId) {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email, email_confirm: true,
        user_metadata: { name, company: company || name, whatsapp }
      })
      if (createErr) throw new Error(createErr.message)
      authUserId = newUser.user.id
    }

    const { data: existingClient } = await supabase
      .from('clients').select('id').eq('auth_user_id', authUserId).single()
    let clientId = existingClient?.id

    if (!clientId) {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({ name: company || name, email, auth_user_id: authUserId,
          vertical: vertical || 'edible_oil', contact_name: name, whatsapp })
        .select().single()
      if (clientErr) throw new Error(clientErr.message)
      clientId = newClient.id
    }

    const { data: existingSub } = await supabase
      .from('subscriptions').select('id').eq('client_id', clientId).single()
    if (!existingSub) {
      await supabase.from('subscriptions').insert({
        client_id: clientId, email, tier: 'trial', status: 'active',
        trial_started_at: new Date().toISOString(),
        trial_expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        vertical: vertical || 'edible_oil'
      })
    }

    await supabase.from('leads').upsert({
      name, email, whatsapp, company: company || name,
      vertical: vertical || 'edible_oil', source: 'onboarding'
    }, { onConflict: 'email' }).catch(() => null)

    await supabase.auth.admin.generateLink({
      type: 'magiclink', email,
      options: { redirectTo: siteUrl + '/onboard/' + verticalPath }
    })

    return Response.json({ success: true, clientId })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
