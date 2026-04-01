import { createClient } from '@supabase/supabase-js'
import ExcelJS from 'exceljs'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!client) return new Response('Client not found', { status: 404 })

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Kenop Intelligence'

  // ── SHEET 1: How to Fill ──────────────────────────
  const ws1 = wb.addWorksheet('How to Fill')
  ws1.getColumn('A').width = 2
  ws1.getColumn('B').width = 72

  ws1.getRow(1).height = 30
  const t1 = ws1.getRow(1).getCell('B')
  t1.value = 'KENOP INTELLIGENCE — Plant Data Request'
  t1.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14, name: 'Arial' }
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2A4A' } }
  t1.alignment = { horizontal: 'center', vertical: 'middle' }

  const lines = [
    [3, 'WHAT THIS FILE IS FOR', true, 'FF1B2A4A', 'FFFFFFFF'],
    [4, 'We need data from 5 representative batches to assess your process performance.', false, 'FFE6F1FB', 'FF042C53'],
    [5, 'This takes about 30-40 minutes to fill from your lab registers.', false, 'FFE6F1FB', 'FF042C53'],
    [7, 'HOW TO FILL — 3 STEPS', true, 'FF1D9E75', 'FFFFFFFF'],
    [8, 'Step 1 — Check Sheet 2 (Plant Details). Your details are pre-filled. Correct if needed.', false, 'FFE1F5EE', 'FF085041'],
    [9, 'Step 2 — Go to Sheet 3 (Batch Data). Fill the yellow cells for each of your 5 batches.', false, 'FFE1F5EE', 'FF085041'],
    [10, 'Step 3 — Save and upload at kenop.in/dashboard under Process Assessment.', false, 'FFE1F5EE', 'FF085041'],
    [12, 'COLOUR CODE', true, 'FFBA7517', 'FFFFFFFF'],
    [13, 'Yellow = YOU fill from your lab records', false, 'FFFFF3CD', 'FF412402'],
    [14, 'Green = Example data already filled — use as guide', false, 'FFE1F5EE', 'FF085041'],
    [15, '★ = Most important fields — fill these first if short on time', false, 'FFFFF3CD', 'FF412402'],
    [17, 'QUESTIONS?', true, 'FF444444', 'FFFFFFFF'],
    [18, 'Nachiket Muley  ·  +91 9403922222  ·  nachiket@idhma.in', false, 'FFF4F6F8', 'FF444444'],
  ]
  lines.forEach(([row, text, bold, bg, fg]) => {
    const r = ws1.getRow(row)
    r.height = 17
    const c = r.getCell('B')
    c.value = text
    c.font = { bold, color: { argb: fg }, size: bold ? 11 : 10, name: 'Arial' }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
  })

  // ── SHEET 2: Plant Details ────────────────────────
  const ws2 = wb.addWorksheet('Plant Details')
  ws2.getColumn('A').width = 2
  ws2.getColumn('B').width = 36
  ws2.getColumn('C').width = 40
  ws2.getColumn('D').width = 20

  ws2.getRow(1).height = 26
  const t2 = ws2.getRow(1).getCell('B')
  t2.value = 'SHEET 2 — Your Plant Details (check and complete)'
  t2.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Arial' }
  t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2A4A' } }
  t2.alignment = { horizontal: 'center', vertical: 'middle' }
  ws2.mergeCells('B1:D1')

  const plantFields = [
    ['Company name', client.name],
    ['Plant location', client.location],
    ['Your name', client.contact_name],
    ['Your email', client.email],
    ['Your phone', client.phone],
    ['Primary feedstock', client.feedstock_primary],
    ['Refining capacity (TPD)', client.throughput_tpd?.toString()],
    ['Separator make and model', ''],
    ['Caustic mixing device', ''],
    ['Number of residence tanks', ''],
    ['PLC connected?', ''],
    ['Acid oil reactor type', ''],
    ['Acid oil mixing method', ''],
  ]

  plantFields.forEach(([label, value], i) => {
    const row = i + 3
    const r = ws2.getRow(row)
    r.height = 16
    const bg = row % 2 === 0 ? 'FFFFFFFF' : 'FFF4F6F8'

    const lbl = r.getCell('B')
    lbl.value = label
    lbl.font = { color: { argb: 'FF333333' }, size: 9, name: 'Arial' }
    lbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    lbl.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }

    const val = r.getCell('C')
    val.value = value || ''
    val.font = { color: { argb: 'FF222222' }, size: 10, name: 'Arial' }
    val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: value ? 'FFE1F5EE' : 'FFFFF3CD' } }
    val.alignment = { horizontal: 'left', vertical: 'middle' }

    const hint = r.getCell('D')
    hint.value = value ? '← Check' : '← Fill'
    hint.font = { italic: true, color: { argb: 'FFAAAAAA' }, size: 8, name: 'Arial' }
    hint.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    hint.alignment = { horizontal: 'left', vertical: 'middle' }
  })

  // ── SHEET 3: Batch Data ───────────────────────────
  const ws3 = wb.addWorksheet('Batch Data')
  ws3.getColumn('A').width = 2
  ws3.getColumn('B').width = 40
  ws3.getColumn('C').width = 15
  ws3.getColumn('D').width = 15
  ws3.getColumn('E').width = 15
  ws3.getColumn('F').width = 15
  ws3.getColumn('G').width = 15

  ws3.getRow(1).height = 26
  const t3 = ws3.getRow(1).getCell('B')
  t3.value = 'SHEET 3 — Batch Data (fill yellow cells — green = example)'
  t3.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Arial' }
  t3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2A4A' } }
  t3.alignment = { horizontal: 'center', vertical: 'middle' }
  ws3.mergeCells('B1:G1')

  const batchDefs = [
    'Batch 1\nTypical routine',
    'Batch 2\nTypical routine',
    'Batch 3\nHigh FFA/moisture',
    'Batch 4\nLow FFA/clean',
    'Batch 5\nKnown problem',
  ]
  const hdrRow = ws3.getRow(2)
  hdrRow.height = 36
  const paramHdr = hdrRow.getCell('B')
  paramHdr.value = 'Parameter'
  paramHdr.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9, name: 'Arial' }
  paramHdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2A4A' } }
  paramHdr.alignment = { horizontal: 'center', vertical: 'middle' }

  batchDefs.forEach((label, i) => {
    const c = hdrRow.getCell(['C','D','E','F','G'][i])
    c.value = label
    c.font = { bold: true, color: { argb: 'FF1B2A4A' }, size: 8, name: 'Arial' }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })

  let currentRow = 3

  const addSec = (text, bg) => {
    ws3.mergeCells(`B${currentRow}:G${currentRow}`)
    const r = ws3.getRow(currentRow)
    r.height = 18
    const c = r.getCell('B')
    c.value = text
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Arial' }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg } }
    c.alignment = { horizontal: 'left', vertical: 'middle' }
    currentRow++
  }

  const addRow = (label, star, b1 = '', b2 = '') => {
    const r = ws3.getRow(currentRow)
    r.height = 15
    const bg = currentRow % 2 === 0 ? 'FFFFFFFF' : 'FFF4F6F8'
    const lbl = r.getCell('B')
    lbl.value = label + (star ? ' ★' : '')
    lbl.font = { bold: star, color: { argb: 'FF333333' }, size: 9, name: 'Arial' }
    lbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    lbl.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }

    const vals = [b1, b2, '', '', '']
    vals.forEach((val, i) => {
      const c = r.getCell(['C','D','E','F','G'][i])
      c.value = val
      c.font = { color: { argb: val ? 'FF085041' : 'FF222222' }, size: 10, name: 'Arial', italic: !!val }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: val ? 'FFE1F5EE' : 'FFFFF3CD' } }
      c.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    currentRow++
  }

  addSec('A — FEED OIL QUALITY', '1D9E75')
  addRow('Feed FFA %', true, '0.59', '0.64')
  addRow('Feed moisture %', true, '0.11', '0.11')
  addRow('Feed soap ppm (incoming crude)', true, '134', '134')
  addRow('Feed gums %', false, '0.43', '0.45')
  addRow('Feed unsaponifiables %', false, '0.77', '0.80')
  currentRow++

  addSec('B — CAUSTIC SETUP', 'BA7517')
  addRow('Caustic concentration %', true, '11', '11')
  addRow('Caustic dose (kg/ton oil)', true, '1.28', '1.28')
  addRow('Caustic injection temperature °C', true, '85', '85')
  addRow('Oil temperature at injection point °C', true, '65', '65')
  addRow('Caustic flow type (Steady / Pulsating / PLC)', false, 'Pulsating', 'Pulsating')
  currentRow++

  addSec('C — FEED CONDITIONING & NEUTRALISATION', '042C53')
  addRow('Feed conditioning done with phosphoric acid? (Yes/No)', true, 'Yes', 'Yes')
  addRow('Soap ppm after conditioning (should be nil)', true, 'nil', '')
  addRow('Soap ppm — static mixer / micro-zone exit', false, '5275', '')
  addRow('Soap ppm — before separator (pre-sep)', true, '1900', '1900')
  addRow('Temperature when soap sample was tested °C', true, '40', '40')
  addRow('Soap ppm — after separator (post-sep)', true, '650', '680')
  addRow('Temperature at separator feed °C', true, '78', '78')
  addRow('Total residence time in tanks (min)', true, '7', '7')
  currentRow++

  addSec('D — NEUTRALISED OIL QUALITY', '085041')
  addRow('Neutral oil FFA %', true, '0.085', '0.085')
  addRow('Neutral oil colour R (1-inch cell, Lovibond)', true, '44', '44')
  addRow('Neutral oil moisture %', false, '0.80', '0.80')
  addRow('Refining loss %', true, '', '')
  addRow('Separation behaviour (Clean/Emulsion/Rag)', true, 'Emulsion', 'Emulsion')
  currentRow++

  addSec('E — SOAPSTOCK', '26215C')
  addRow('Soapstock soap content %', true, '', '')
  addRow('Soapstock FFA %', true, '', '')
  addRow('Soapstock moisture %', true, '', '')
  addRow('Soapstock TFM % (Total Fatty Matter)', true, '', '')
  addRow('Soapstock alkalinity (kg NaOH eq/ton) — from titration', true, '', '')
  currentRow++

  addSec('F — ACID OIL / SOAPSTOCK SPLITTING', 'C0392B')
  addRow('H2SO4 dose used (kg)', true, '180', '180')
  addRow('TFM % after dilution (before acid addition)', true, '', '')
  addRow('Reaction hold temperature °C', true, '90', '90')
  addRow('Settle duration (hours)', true, '3', '3')
  addRow('pH at end of reaction', true, '', '')
  addRow('Soap check at endpoint (Nil/Trace/Present)', true, '', '')
  addRow('Acid oil FFA %', true, '61.5', '60.2')
  addRow('Acid oil moisture %', true, '1.58', '1.40')
  addRow('Acid oil yield % (on soapstock input)', true, '1.39', '1.39')
  addRow('Separation behaviour (Clean/Emulsion/Rag)', true, 'Emulsion', 'Emulsion')
  addRow('Rag layer collected (kg)', false, '', '')
  addRow('Rag layer disposition (Reprocessed/Blended/Discarded)', false, '', '')
  currentRow++

  addSec('G — NOTES & OBSERVATIONS', '444444')
  addRow('Any known issues this batch?', false, '', '')
  addRow('Corrective actions tried?', false, '', '')

  const buffer = await wb.xlsx.writeBuffer()
  const safeName = (client.name || 'Plant').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `${safeName}_DataRequest_Kenop.xlsx`

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  })
}