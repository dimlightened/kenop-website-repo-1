import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await sb.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const { data: client } = await sb
        .from('clients')
        .select('status, vertical')
        .eq('auth_user_id', data.user.id)
        .single()

      if (client?.status === 'expired') {
        return NextResponse.redirect(origin + '/trial-expired')
      }

      const onboardPath = client?.vertical === 'biodiesel'
        ? '/onboard/biodiesel'
        : '/onboard/edible-oil'

      return NextResponse.redirect(origin + onboardPath)
    }
  }

  return NextResponse.redirect(origin + '/login')
}
