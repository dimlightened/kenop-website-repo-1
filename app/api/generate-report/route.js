import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
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

    const body = await request.json()
    const { report_type = 'daily', format = 'pdf' } = body

    // ── Fetch data ───────────────────────────────────────────
    const { data: client } = await supabase
      .from('clients').select('*').eq('auth_user_id', user.id).single()
    if (!client) return new Response('Client not found', { status: 404 })

    const [{ data: readings }, { data: acidBatches }, { data: prices }] = await Promise.all([
      supabase.from('lab_readings').select('*').eq('client_id', client.id)
        .order('recorded_at', { ascending: false }).limit(30),
      supabase.from('acidoil_batches').select('*').eq('client_id', client.id)
        .order('created_at', { ascending: false }).limit(10),
      supabase.from('market_prices').select('*').order('updated_at', { ascending: false }).limit(1)
    ])

    const cp = prices?.[0] || { acid_oil_price_per_kg: 52, edible_oil_price_per_kg: 90 }
    const latest = readings?.[0]
    const tpd = client.throughput_tpd || 350
    const dfaPrice = parseFloat(cp.acid_oil_price_per_kg) + 40

    const sepEff = latest?.soap_ppm_pre_separator && latest?.soap_ppm_post_separator
      ? (((latest.soap_ppm_pre_separator - latest.soap_ppm_post_separator) / latest.soap_ppm_pre_separator) * 100).toFixed(1)
      : null

    const dailyAcidMT = tpd * 0.015 * 0.789 * 0.88
    const currentRevenue = Math.round(dailyAcidMT * 1000 * cp.acid_oil_price_per_kg)
    const separatedRevenue = Math.round(dailyAcidMT * 1000 * (dfaPrice * 0.635 + cp.edible_oil_price_per_kg * 0.325))
    const dailyGap = Math.max(0, separatedRevenue - currentRevenue)
    const paybackDays = dailyGap > 0 ? Math.round(18000000 / dailyGap) : 0
    const reportDate = new Date().toISOString().split('T')[0]
    const safeName = (client.name || 'Plant').replace(/[^a-zA-Z0-9]/g, '_')
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    // ── Build data summary for Groq ──────────────────────────
    const dataSummary = `
PLANT: ${client.name}, ${client.location}
FEEDSTOCK: ${client.feedstock_primary}, ${tpd} TPD
SEPARATOR: ${client.separator_model || 'Not specified'}
MIXING: ${client.mixing_devices || 'Not specified'}
PLC: ${client.plc_connected ? `Yes — ${client.plc_make}` : 'No — Manual plant'}

LATEST READINGS:
Pre-separator soap: ${latest?.soap_ppm_pre_separator ?? 'No data'} ppm (target <2200)
Post-separator soap: ${latest?.soap_ppm_post_separator ?? 'No data'} ppm (target <700)
Separator efficiency: ${sepEff ?? 'No data'}% (target >75%)
Sep feed temperature: ${latest?.separator_feed_temp_degc ?? 'No data'}°C (target 82-85)
Neutral oil FFA: ${latest?.neutral_oil_ffa_pct ?? 'No data'}% (target <0.10%)
Refining loss: ${latest?.refining_loss_pct ?? 'No data'}% (theoretical min 0.885%)

LAST 7 READINGS TREND:
${(readings || []).slice(0,7).map(r =>
  `${new Date(r.recorded_at).toLocaleDateString('en-IN')} — Pre: ${r.soap_ppm_pre_separator??'?'} ppm, Post: ${r.soap_ppm_post_separator??'?'} ppm, Temp: ${r.separator_feed_temp_degc??'?'}°C, FFA: ${r.neutral_oil_ffa_pct??'?'}%`
).join('\n')}

MARKET PRICES:
Acid oil: Rs ${cp.acid_oil_price_per_kg}/kg
Edible oil: Rs ${cp.edible_oil_price_per_kg}/kg
Distilled FFA: Rs ${dfaPrice}/kg

VALUE ADDITION:
Current acid oil revenue: Rs ${currentRevenue.toLocaleString('en-IN')}/day
With separation: Rs ${separatedRevenue.toLocaleString('en-IN')}/day
Daily gap: Rs ${dailyGap.toLocaleString('en-IN')}/day
Payback at Rs 1.8Cr: ${paybackDays} days
    `.trim()

    // ── Call Groq ────────────────────────────────────────────
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are Kenop Intelligence — a process intelligence system for edible oil refineries. Write structured professional reports. Use ## for section headings. Be specific with numbers. All financial figures in Indian Rupees.' },
          { role: 'user', content: `Write a ${report_type} process assessment report with these sections:\n## Executive Summary\n## KPI Status\n## Key Observations\n## Financial Impact\n## Recommended Actions\n## Value Addition Opportunity\n\nPlant data:\n${dataSummary}\n\nBe specific and actionable.` }
        ],
        max_tokens: 2048,
        temperature: 0.3
      })
    })
    const groqData = await groqRes.json()
    const content = groqData.choices?.[0]?.message?.content || 'Report content unavailable.'

    // Parse sections
    const sections = []
    let cur = { title: '', lines: [] }
    content.split('\n').forEach(line => {
      if (line.startsWith('## ')) {
        if (cur.title) sections.push({ ...cur })
        cur = { title: line.replace('## ', ''), lines: [] }
      } else { cur.lines.push(line) }
    })
    if (cur.title) sections.push(cur)

    // ════════════════════════════════════════════════════════
    // PDF — generated as HTML then returned as HTML for browser print
    // (Vercel-safe: no native binaries needed)
    // ════════════════════════════════════════════════════════
    if (format === 'pdf') {
      const kpis = [
        ['Pre-sep soap', (latest?.soap_ppm_pre_separator ?? '—') + ' ppm', latest?.soap_ppm_pre_separator > 2200 ? '#FDECEA' : '#E1F5EE'],
        ['Post-sep soap ★', (latest?.soap_ppm_post_separator ?? '—') + ' ppm', latest?.soap_ppm_post_separator > 700 ? '#FDECEA' : '#E1F5EE'],
        ['Sep efficiency', (sepEff ?? '—') + '%', sepEff < 70 ? '#FDECEA' : '#E1F5EE'],
        ['Sep temp', (latest?.separator_feed_temp_degc ?? '—') + '°C', '#F4F6F8'],
        ['Neutral FFA', (latest?.neutral_oil_ffa_pct ?? '—') + '%', latest?.neutral_oil_ffa_pct > 0.10 ? '#FDECEA' : '#E1F5EE'],
        ['Refining loss', (latest?.refining_loss_pct ?? '—') + '%', latest?.refining_loss_pct > 1.5 ? '#FAEEDA' : '#E1F5EE'],
      ]

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${client.name} — ${report_type} Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;color:#222;font-size:11px;background:white}
  .header{background:#1B2A4A;color:white;padding:20px 30px;margin-bottom:0}
  .header h1{font-size:20px;margin-bottom:4px}
  .header p{font-size:11px;color:#aaa}
  .plant-bar{background:#E1F5EE;padding:8px 30px;border-bottom:2px solid #1D9E75;font-size:11px;color:#085041;font-weight:bold}
  .body{padding:20px 30px}
  .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{padding:10px 12px;border-radius:6px;border:1px solid #eee}
  .kpi-val{font-size:16px;font-weight:bold;color:#1B2A4A}
  .kpi-lbl{font-size:9px;color:#666;margin-top:2px}
  .prices{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
  .price-box{padding:10px;border-radius:6px;text-align:center}
  .price-val{font-size:14px;font-weight:bold}
  .price-lbl{font-size:9px;margin-top:2px}
  .value-box{background:#1B2A4A;color:white;padding:12px 16px;border-radius:8px;display:flex;justify-content:space-between;margin-bottom:16px}
  .section-hdr{background:#1B2A4A;color:white;padding:6px 12px;font-size:11px;font-weight:bold;margin:12px 0 6px;border-radius:4px}
  .line{font-size:10px;line-height:1.6;margin-bottom:3px;padding-left:4px}
  .bullet{font-size:10px;line-height:1.6;margin-bottom:3px;padding-left:12px}
  .bold-line{font-size:10px;font-weight:bold;color:#1B2A4A;margin-bottom:3px;padding-left:4px}
  .footer{margin-top:24px;padding-top:10px;border-top:1px solid #eee;text-align:center;font-size:9px;color:#aaa}
  @media print{
    @page{margin:15mm;size:A4}
    body{font-size:10px}
    .no-print{display:none}
  }
</style>
</head>
<body>
<div class="no-print" style="background:#1D9E75;color:white;padding:12px 20px;text-align:center;font-size:13px;font-family:Arial">
  <strong>Print or Save as PDF:</strong> Press Ctrl+P (Windows) or Cmd+P (Mac) → Choose "Save as PDF"
  &nbsp;&nbsp;
  <button onclick="window.print()" style="background:white;color:#1D9E75;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-weight:bold">Print / Save PDF</button>
</div>

<div class="header">
  <h1>KENOP INTELLIGENCE</h1>
  <p>Process Assessment Report &nbsp;·&nbsp; ${dateStr}</p>
</div>

<div class="plant-bar">
  ${client.name} &nbsp;·&nbsp; ${client.location} &nbsp;·&nbsp; ${tpd} TPD &nbsp;·&nbsp; ${client.feedstock_primary}
</div>

<div class="body">

  <div class="kpi-grid">
    ${kpis.map(([lbl, val, bg]) => `
      <div class="kpi-box" style="background:${bg}">
        <div class="kpi-val">${val}</div>
        <div class="kpi-lbl">${lbl}</div>
      </div>`).join('')}
  </div>

  <div class="prices">
    <div class="price-box" style="background:#FAEEDA">
      <div class="price-val" style="color:#412402">Rs ${cp.acid_oil_price_per_kg}/kg</div>
      <div class="price-lbl" style="color:#412402">Acid oil</div>
    </div>
    <div class="price-box" style="background:#E1F5EE">
      <div class="price-val" style="color:#085041">Rs ${cp.edible_oil_price_per_kg}/kg</div>
      <div class="price-lbl" style="color:#085041">Edible oil</div>
    </div>
    <div class="price-box" style="background:#E6F1FB">
      <div class="price-val" style="color:#042C53">Rs ${dfaPrice}/kg</div>
      <div class="price-lbl" style="color:#042C53">Distilled FFA</div>
    </div>
  </div>

  <div class="value-box">
    <div>
      <div style="font-size:9px;color:#aaa">Current acid oil revenue</div>
      <div style="font-size:14px;font-weight:bold">Rs ${currentRevenue.toLocaleString('en-IN')}/day</div>
    </div>
    <div style="text-align:center">
      <div style="font-size:9px;color:#aaa">Value addition gap</div>
      <div style="font-size:14px;font-weight:bold;color:#1D9E75">Rs ${dailyGap.toLocaleString('en-IN')}/day</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:9px;color:#aaa">CAPEX payback</div>
      <div style="font-size:14px;font-weight:bold">${paybackDays} days</div>
    </div>
  </div>

  ${sections.map(s => `
    <div class="section-hdr">${s.title}</div>
    ${s.lines.map(line => {
      if (!line.trim()) return ''
      if (line.startsWith('- ') || line.startsWith('* '))
        return `<div class="bullet">• ${line.replace(/^[-*] /, '')}</div>`
      if (line.includes('Rs ') || line.match(/\d+.*ppm|°C|%/))
        return `<div class="bold-line">${line}</div>`
      return `<div class="line">${line}</div>`
    }).join('')}
  `).join('')}

  <div class="footer">
    Kenop Intelligence &nbsp;·&nbsp; E-Shakti Binary Currents Pvt. Ltd. &nbsp;·&nbsp; nachiket@idhma.in &nbsp;·&nbsp; +91 9403922222
  </div>
</div>
</body>
</html>`

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        }
      })
    }

    // ════════════════════════════════════════════════════════
    // WORD (.docx)
    // ════════════════════════════════════════════════════════
    if (format === 'word') {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType } = await import('docx')

      const children = []

      children.push(new Paragraph({
        text: 'KENOP INTELLIGENCE — Process Assessment Report',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }))
      children.push(new Paragraph({
        children: [new TextRun({ text: `${client.name}  ·  ${client.location}  ·  ${tpd} TPD`, color: '1D9E75', bold: true })],
        alignment: AlignmentType.CENTER,
      }))
      children.push(new Paragraph({
        children: [new TextRun({ text: dateStr, color: '888888', size: 18 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      }))

      children.push(new Paragraph({ text: 'Key Performance Indicators', heading: HeadingLevel.HEADING_1 }))
      const kpiRows = [
        ['Parameter', 'Value', 'Target', 'Status'],
        ['Post-sep soap ★', (latest?.soap_ppm_post_separator ?? '—') + ' ppm', '< 700 ppm', latest?.soap_ppm_post_separator > 700 ? '⚠ Above' : '✓ OK'],
        ['Sep efficiency', (sepEff ?? '—') + '%', '> 75%', sepEff < 70 ? '⚠ Low' : '✓ OK'],
        ['Sep temperature', (latest?.separator_feed_temp_degc ?? '—') + '°C', '82–85°C', '—'],
        ['Neutral oil FFA', (latest?.neutral_oil_ffa_pct ?? '—') + '%', '< 0.10%', '—'],
        ['Refining loss', (latest?.refining_loss_pct ?? '—') + '%', '< 1.5%', latest?.refining_loss_pct > 1.5 ? '⚠ High' : '✓ OK'],
      ]
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: kpiRows.map((row, ri) => new TableRow({
          children: row.map(cell => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: cell, bold: ri === 0, color: ri === 0 ? 'FFFFFF' : '222222', size: 18 })] })],
            shading: ri === 0 ? { type: ShadingType.SOLID, color: '1B2A4A' } : undefined,
          }))
        }))
      }))
      children.push(new Paragraph({ spacing: { after: 200 } }))

      children.push(new Paragraph({ text: 'Market Prices & Value Addition', heading: HeadingLevel.HEADING_1 }))
      children.push(new Table({
        width: { size: 60, type: WidthType.PERCENTAGE },
        rows: [
          ['Acid oil', `Rs ${cp.acid_oil_price_per_kg}/kg`],
          ['Edible oil', `Rs ${cp.edible_oil_price_per_kg}/kg`],
          ['Distilled FFA (acid oil + Rs40)', `Rs ${dfaPrice}/kg`],
          ['Value addition gap', `Rs ${dailyGap.toLocaleString('en-IN')}/day`],
          ['CAPEX payback at Rs 1.8Cr', `${paybackDays} days`],
        ].map(([k, v]) => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v, color: '1D9E75', bold: true, size: 18 })] })] }),
          ]
        }))
      }))
      children.push(new Paragraph({ spacing: { after: 200 } }))

      sections.forEach(section => {
        children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1 }))
        section.lines.forEach(line => {
          if (!line.trim()) return
          const isBullet = line.startsWith('- ') || line.startsWith('* ')
          children.push(new Paragraph({
            children: [new TextRun({ text: isBullet ? line.replace(/^[-*] /, '') : line, size: 18 })],
            bullet: isBullet ? { level: 0 } : undefined,
            spacing: { after: 60 }
          }))
        })
        children.push(new Paragraph({ spacing: { after: 100 } }))
      })

      children.push(new Paragraph({
        children: [new TextRun({ text: 'Kenop Intelligence  ·  E-Shakti Binary Currents Pvt. Ltd.  ·  nachiket@idhma.in  ·  +91 9403922222', color: 'aaaaaa', size: 16 })],
        alignment: AlignmentType.CENTER,
      }))

      const doc = new Document({ sections: [{ children }] })
      const buf = await Packer.toBuffer(doc)
      return new Response(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeName}_${report_type}_${reportDate}.docx"`,
        }
      })
    }

    // ════════════════════════════════════════════════════════
    // EXCEL (.xlsx)
    // ════════════════════════════════════════════════════════
    if (format === 'excel') {
      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator = 'Kenop Intelligence'
      const navy = { argb: 'FF1B2A4A' }, green = { argb: 'FF1D9E75' }, white = { argb: 'FFFFFFFF' }

      // Sheet 1: Summary
      const ws1 = wb.addWorksheet('Summary')
      ws1.getColumn('A').width = 32; ws1.getColumn('B').width = 20; ws1.getColumn('C').width = 20; ws1.getColumn('D').width = 20

      ws1.mergeCells('A1:D1')
      const t1 = ws1.getCell('A1')
      t1.value = `KENOP INTELLIGENCE — ${client.name} — ${report_type.toUpperCase()} REPORT — ${dateStr}`
      t1.font = { bold: true, color: white, size: 12, name: 'Arial' }
      t1.fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      t1.alignment = { horizontal: 'center', vertical: 'middle' }
      ws1.getRow(1).height = 26

      ws1.mergeCells('A3:D3')
      const h1 = ws1.getCell('A3')
      h1.value = 'KEY PROCESS KPIs'
      h1.font = { bold: true, color: white, size: 11, name: 'Arial' }
      h1.fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      h1.alignment = { horizontal: 'center' }
      ws1.getRow(3).height = 20

      const kpiData = [
        ['Parameter', 'Value', 'Unit', 'Target'],
        ['Pre-separator soap', latest?.soap_ppm_pre_separator, 'ppm', '< 2200'],
        ['Post-separator soap ★', latest?.soap_ppm_post_separator, 'ppm', '< 700'],
        ['Separator efficiency', sepEff ? parseFloat(sepEff) : null, '%', '> 75'],
        ['Sep feed temperature', latest?.separator_feed_temp_degc, '°C', '82–85'],
        ['Neutral oil FFA', latest?.neutral_oil_ffa_pct, '%', '< 0.10'],
        ['Refining loss', latest?.refining_loss_pct, '%', '< 1.5'],
      ]
      kpiData.forEach((row, i) => {
        const r = ws1.getRow(4 + i)
        r.values = row
        r.height = 18
        const bg = i === 0 ? { argb: 'FFF4F6F8' } : { argb: i%2===0 ? 'FFFFFFFF' : 'FFF4F6F8' }
        r.eachCell(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: bg }
          c.font = { bold: i === 0, size: 10, name: 'Arial', color: i === 0 ? { argb: 'FF1B2A4A' } : { argb: 'FF333333' } }
          c.alignment = { horizontal: i === 0 ? 'center' : 'left', vertical: 'middle' }
        })
      })

      ws1.mergeCells('A13:D13')
      const h2 = ws1.getCell('A13')
      h2.value = 'MARKET PRICES & FINANCIALS'
      h2.font = { bold: true, color: white, size: 11, name: 'Arial' }
      h2.fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      h2.alignment = { horizontal: 'center' }
      ws1.getRow(13).height = 20

      const finData = [
        ['Acid oil price', cp.acid_oil_price_per_kg, 'Rs/kg', ''],
        ['Edible oil price', cp.edible_oil_price_per_kg, 'Rs/kg', ''],
        ['Distilled FFA price (acid oil + Rs40)', dfaPrice, 'Rs/kg', 'auto-calculated'],
        ['Current acid oil revenue', currentRevenue, 'Rs/day', ''],
        ['Revenue with value addition', separatedRevenue, 'Rs/day', ''],
        ['Value addition gap', dailyGap, 'Rs/day', ''],
        ['CAPEX payback at Rs 1.8Cr', paybackDays, 'days', ''],
      ]
      finData.forEach((row, i) => {
        const r = ws1.getRow(14 + i)
        r.values = row
        r.height = 18
        r.eachCell(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i%2===0 ? 'FFFFFFFF' : 'FFF4F6F8' } }
          c.font = { size: 10, name: 'Arial' }
          c.alignment = { vertical: 'middle' }
        })
        r.getCell(1).font = { bold: true, size: 10, name: 'Arial', color: { argb: 'FF1B2A4A' } }
        r.getCell(2).font = { bold: true, size: 11, name: 'Arial', color: green }
      })

      // Sheet 2: Lab readings
      const ws2 = wb.addWorksheet('Lab Readings')
      const rHeaders = ['Date', 'Pre-sep soap (ppm)', 'Post-sep soap (ppm)', 'Sep temp °C', 'Neutral FFA %', 'Refining loss %', 'Sep efficiency %', 'Notes']
      ws2.getRow(1).values = rHeaders
      ws2.getRow(1).font = { bold: true, color: white, name: 'Arial', size: 10 }
      ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      ws2.getRow(1).height = 20
      rHeaders.forEach((_, i) => { ws2.getColumn(i+1).width = [20,18,18,14,14,14,16,30][i] })

      readings?.forEach((r, i) => {
        const eff = r.soap_ppm_pre_separator && r.soap_ppm_post_separator
          ? parseFloat((((r.soap_ppm_pre_separator - r.soap_ppm_post_separator) / r.soap_ppm_pre_separator) * 100).toFixed(1)) : null
        const row = ws2.getRow(i + 2)
        row.values = [new Date(r.recorded_at).toLocaleDateString('en-IN'), r.soap_ppm_pre_separator, r.soap_ppm_post_separator, r.separator_feed_temp_degc, r.neutral_oil_ffa_pct, r.refining_loss_pct, eff, r.notes || '']
        row.height = 16
        row.eachCell(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i%2===0 ? 'FFFFFFFF' : 'FFF4F6F8' } }
          c.font = { size: 10, name: 'Arial' }
          c.alignment = { horizontal: 'center' }
        })
      })

      // Sheet 3: Report text
      const ws4 = wb.addWorksheet('Report Text')
      ws4.getColumn('A').width = 110
      ws4.getCell('A1').value = `KENOP REPORT — ${client.name} — ${dateStr}`
      ws4.getCell('A1').font = { bold: true, color: white, size: 12, name: 'Arial' }
      ws4.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      ws4.getRow(1).height = 24

      let rr = 2
      content.split('\n').forEach(line => {
        const c = ws4.getCell(rr, 1)
        if (line.startsWith('## ')) {
          c.value = line.replace('## ', '')
          c.font = { bold: true, color: white, size: 11, name: 'Arial' }
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
          ws4.getRow(rr).height = 20
        } else if (line.trim()) {
          c.value = (line.startsWith('- ') || line.startsWith('* ')) ? '•  ' + line.replace(/^[-*] /, '') : line
          c.font = { size: 10, name: 'Arial', color: { argb: 'FF333333' } }
          c.alignment = { wrapText: true, vertical: 'top' }
          ws4.getRow(rr).height = 14
        }
        rr++
      })

      const buf = await wb.xlsx.writeBuffer()
      return new Response(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${safeName}_${report_type}_${reportDate}.xlsx"`,
        }
      })
    }

    return new Response('Invalid format. Use: pdf, word, or excel', { status: 400 })

  } catch (error) {
    console.error('Report generation error:', error)
    return new Response('Report generation failed: ' + error.message, { status: 500 })
  }
}