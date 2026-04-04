export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const gstin = searchParams.get('gstin')?.toUpperCase().trim()
  if (!gstin) return Response.json({ error: 'GSTIN required' }, { status: 400 })

  const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (!GSTIN_RE.test(gstin)) return Response.json({ valid: false, error: 'Invalid GSTIN format' })

  const apiKey = process.env.GSTIN_API_KEY
  if (!apiKey) return Response.json({ valid: true, gstin, manualRequired: true })

  try {
    const res = await fetch('https://my.gstzen.in/api/gstin-validator/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Token': apiKey },
      body: JSON.stringify({ gstin }),
      signal: AbortSignal.timeout(6000)
    })
    const d = await res.json()
    if (d.status === 0) return Response.json({ valid: true, gstin, manualRequired: true })
    if (!d.valid) return Response.json({ valid: false, error: 'GSTIN not found in government records' })

    const c = d.company_details
    const pradr = c.pradr || {}
    return Response.json({
      valid: true, gstin,
      legalName: c.legal_name || '',
      tradeName: c.trade_name || c.legal_name || '',
      status: c.company_status || 'Active',
      state: c.state_info?.name || '',
      stateCode: c.state_info?.code || '',
      pincode: pradr.pincode || '',
      address: pradr.addr || '',
      city: pradr.city || '',
      district: pradr.district || '',
      pan: c.pan || ''
    })
  } catch (err) {
    return Response.json({ valid: true, gstin, manualRequired: true })
  }
}