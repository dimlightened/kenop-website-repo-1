import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Detects whether incoming data is acid oil or regular lab reading
function detectDataType(data) {
  const acidOilKeys = ['av', 'acid_value', 'ffa_ao', 'moisture_ao', 'colour_ao', 'fm', 'fatty_matter']
  const keys = Object.keys(data).map(k => k.toLowerCase())
  return keys.some(k => acidOilKeys.includes(k)) ? 'acid_oil' : 'lab_reading'
}

// Parse WhatsApp message into structured data
// Accepts formats like: "AV 4.5 FM 62 MOISTURE 0.8 COLOUR 12"
function parseWhatsAppMessage(text) {
  const patterns = {
    av:            /(?:av|acid.?value)\s*[:=]?\s*([\d.]+)/i,
    ffa:           /(?:ffa|free.?fatty.?acid)\s*[:=]?\s*([\d.]+)/i,
    fatty_matter:  /(?:fm|fatty.?matter)\s*[:=]?\s*([\d.]+)/i,
    moisture:      /(?:moisture|mc)\s*[:=]?\s*([\d.]+)/i,
    colour:        /(?:colour|color|lovibond)\s*[:=]?\s*([\d.]+)/i,
    temp:          /(?:temp|temperature)\s*[:=]?\s*([\d.]+)/i,
    ffa_ao:        /(?:ffa.?ao|ao.?ffa)\s*[:=]?\s*([\d.]+)/i,
    yield:         /(?:yield|fame.?yield)\s*[:=]?\s*([\d.]+)/i,
    flash:         /(?:flash|flash.?point)\s*[:=]?\s*([\d.]+)/i,
    soap:          /(?:soap|soap.?ppm)\s*[:=]?\s*([\d.]+)/i,
  }
  const result = {}
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match) result[key] = parseFloat(match[1])
  }
  return result
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { client_id, source, raw_message, data: rawData, batch_id } = body

    if (!client_id) return Response.json({ error: 'client_id required' }, { status: 400 })

    // Parse WhatsApp text if source is whatsapp
    const data = source === 'whatsapp' && raw_message
      ? parseWhatsAppMessage(raw_message)
      : rawData

    if (!data || Object.keys(data).length === 0) {
      return Response.json({ error: 'No parseable data' }, { status: 400 })
    }

    const dataType = detectDataType(data)
    const timestamp = new Date().toISOString()

    if (dataType === 'acid_oil') {
      // Save to acidoil_batches
      const { error } = await supabase.from('acidoil_batches').insert({
        client_id,
        batch_id: batch_id || `AO-${Date.now()}`,
        source: source || 'api',
        recorded_at: timestamp,
        av: data.av || data.acid_value,
        ffa_pct: data.ffa || data.ffa_ao,
        fatty_matter_pct: data.fatty_matter || data.fm,
        moisture_pct: data.moisture,
        colour_lovibond: data.colour,
        raw_payload: data,
      })
      if (error) throw error
    } else {
      // Save to lab_readings
      const { error } = await supabase.from('lab_readings').insert({
        client_id,
        batch_id: batch_id || `B-${Date.now()}`,
        source: source || 'api',
        recorded_at: timestamp,
        ffa_pct: data.ffa,
        temp_c: data.temp,
        colour_lovibond: data.colour,
        moisture_pct: data.moisture,
        soap_ppm: data.soap,
        yield_pct: data.yield,
        flash_point: data.flash,
        raw_payload: data,
      })
      if (error) throw error
    }

    // Update onboarding completion — first reading received
    await supabase.from('onboarding_completion')
      .upsert({ client_id, lab_readings_first: true }, { onConflict: 'client_id' })
    await supabase.rpc('calc_onboarding_completion', { p_client_id: client_id })

    return Response.json({ ok: true, type: dataType, fields_captured: Object.keys(data).length })
  } catch(err) {
    console.error('lab-data error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
