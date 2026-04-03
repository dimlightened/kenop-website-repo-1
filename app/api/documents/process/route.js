import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Called automatically after any file upload
export async function POST(request) {
  try {
    const body = await request.json()
    const { client_id, storage_path, bucket_id, file_name } = body

    if (!client_id || !storage_path || !bucket_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Add to processing queue
    await supabase.from('document_processing_queue').insert({
      client_id,
      storage_path,
      bucket_id,
      file_name: file_name || storage_path.split('/').pop(),
      status: 'pending'
    })

    // Trigger Edge Function immediately
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    fetch(`${supabaseUrl}/functions/v1/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ client_id })
    }).catch(e => console.error('Edge function trigger failed:', e))

    return Response.json({ ok: true, message: 'Document queued for processing' })
  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
