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

    const { report_type = 'daily', format = 'pdf' } = await request.json()

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
Distilled FFA (DFA): Rs ${dfaPrice}/kg

ACID OIL VALUE ADDITION:
Current acid oil revenue: Rs ${currentRevenue.toLocaleString('en-IN')}/day
With value addition: Rs ${separatedRevenue.toLocaleString('en-IN')}/day
Daily gap: Rs ${dailyGap.toLocaleString('en-IN')}/day
Payback at Rs 1.8Cr CAPEX: ${dailyGap > 0 ? Math.round(18000000/dailyGap) : 'N/A'} days
    `.trim()

    // ── Call Groq ────────────────────────────────────────────
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are Kenop Intelligence — a process intelligence system for edible oil refineries. Write structured professional reports. Use ## for section headings. Be specific with numbers. All financial figures in Indian Rupees.`
          },
          {
            role: 'user',
            content: `Write a ${report_type} process assessment report. Include these exact sections:
## Executive Summary
## KPI Status
## Key Observations
## Financial Impact
## Recommended Actions
## Value Addition Opportunity

Plant data:
${dataSummary}

Be specific and actionable. Mention rupee figures. Keep each section concise but complete.`
          }
        ],
        max_tokens: 2048,
        temperature: 0.3
      })
    })

    const groqData = await groqRes.json()
    const content = groqData.choices?.[0]?.message?.content || 'Report generation failed.'

    const reportDate = new Date().toISOString().split('T')[0]
    const safeName = (client.name || 'Plant').replace(/[^a-zA-Z0-9]/g, '_')

    // ── Parse sections ───────────────────────────────────────
    const sections = []
    let currentSection = { title: '', lines: [] }
    content.split('\n').forEach(line => {
      if (line.startsWith('## ')) {
        if (currentSection.title) sections.push({ ...currentSection })
        currentSection = { title: line.replace('## ', ''), lines: [] }
      } else {
        currentSection.lines.push(line)
      }
    })
    if (currentSection.title) sections.push(currentSection)

    // ════════════════════════════════════════════════════════
    // PDF
    // ════════════════════════════════════════════════════════
    if (format === 'pdf') {
      const PDFDocument = (await import('pdfkit')).default
      const chunks = []
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      doc.on('data', chunk => chunks.push(chunk))

      await new Promise((resolve, reject) => {
        doc.on('end', resolve)
        doc.on('error', reject)

        // Header band
        doc.rect(0, 0, doc.page.width, 75).fill('#1B2A4A')
        doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('KENOP INTELLIGENCE', 50, 18)
        doc.fontSize(11).font('Helvetica').text('Process Assessment Report', 50, 40)
        doc.fontSize(9).text(new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }), 50, 57)

        // Plant info
        doc.fillColor('#1D9E75').fontSize(10).font('Helvetica-Bold')
          .text(`${client.name}  ·  ${client.location}  ·  ${tpd} TPD  ·  ${client.feedstock_primary}`, 50, 90)
        doc.moveTo(50, 106).lineTo(545, 106).strokeColor('#1D9E75').lineWidth(1).stroke()

        let y = 116

        // KPI summary boxes
        const kpis = [
          ['Post-sep soap', (latest?.soap_ppm_post_separator ?? '—') + ' ppm', latest?.soap_ppm_post_separator > 700 ? '#FDECEA' : '#E1F5EE'],
          ['Sep efficiency', (sepEff ?? '—') + '%', sepEff < 70 ? '#FDECEA' : '#E1F5EE'],
          ['Refining loss', (latest?.refining_loss_pct ?? '—') + '%', latest?.refining_loss_pct > 1.5 ? '#FAEEDA' : '#E1F5EE'],
          ['Value gap/day', 'Rs ' + dailyGap.toLocaleString('en-IN'), '#E6F1FB'],
        ]
        const boxW = 115, boxH = 40, boxGap = 8, boxStart = 50
        kpis.forEach(([ label, val, bg ], i) => {
          const x = boxStart + i * (boxW + boxGap)
          doc.rect(x, y, boxW, boxH).fill(bg)
          doc.fillColor('#333').fontSize(8).font('Helvetica').text(label, x + 6, y + 6, { width: boxW - 12 })
          doc.fillColor('#1B2A4A').fontSize(13).font('Helvetica-Bold').text(val, x + 6, y + 18, { width: boxW - 12 })
        })
        y += boxH + 14

        doc.fillColor('#222').fontSize(10).font('Helvetica')

        // Sections
        sections.forEach(section => {
          if (y > 740) { doc.addPage(); y = 50 }
          y += 8
          // Section heading
          doc.rect(50, y, 495, 18).fill('#1B2A4A')
          doc.fillColor('white').fontSize(11).font('Helvetica-Bold').text(section.title, 56, y + 4)
          y += 24
          doc.fillColor('#222').font('Helvetica').fontSize(10)

          section.lines.forEach(line => {
            if (y > 750) { doc.addPage(); y = 50 }
            if (line.trim() === '') { y += 4; return }

            const isBullet = line.startsWith('- ') || line.startsWith('* ')
            const text = isBullet ? '•  ' + line.replace(/^[-*] /, '') : line
            const indent = isBullet ? 58 : 50
            const w = isBullet ? 487 : 495

            const bold = line.includes('Rs ') || line.match(/\d+.*ppm|°C|%/)
            if (bold) { doc.font('Helvetica-Bold').fillColor('#1B2A4A') }
            doc.text(text, indent, y, { width: w, lineGap: 1 })
            if (bold) { doc.font('Helvetica').fillColor('#222') }
            y += doc.heightOfString(text, { width: w }) + 3
          })
        })

        // Footer
        doc.fillColor('#aaa').fontSize(8).font('Helvetica')
          .text('Kenop Intelligence  ·  E-Shakti Binary Currents Pvt. Ltd.  ·  nachiket@idhma.in  ·  +91 9403922222', 50, 800, { align: 'center', width: 495 })

        doc.end()
      })

      const buf = Buffer.concat(chunks)
      return new Response(buf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeName}_${report_type}_${reportDate}.pdf"`,
        }
      })
    }

    // ════════════════════════════════════════════════════════
    // WORD (.docx)
    // ════════════════════════════════════════════════════════
    if (format === 'word') {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, BorderStyle } = await import('docx')

      const children = []

      // Title
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
        children: [new TextRun({ text: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }), color: '888888', size: 18 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }))

      // KPI table
      children.push(new Paragraph({ text: 'Key Performance Indicators', heading: HeadingLevel.HEADING_1 }))
      const kpiRows = [
        ['Parameter', 'Value', 'Target', 'Status'],
        ['Post-separator soap', (latest?.soap_ppm_post_separator ?? '—') + ' ppm', '< 700 ppm', latest?.soap_ppm_post_separator > 700 ? '⚠ Above target' : '✓ On target'],
        ['Separator efficiency', (sepEff ?? '—') + '%', '> 75%', sepEff < 70 ? '⚠ Below target' : '✓ On target'],
        ['Sep feed temperature', (latest?.separator_feed_temp_degc ?? '—') + '°C', '82–85°C', '—'],
        ['Neutral oil FFA', (latest?.neutral_oil_ffa_pct ?? '—') + '%', '< 0.10%', '—'],
        ['Refining loss', (latest?.refining_loss_pct ?? '—') + '%', '< 1.5%', latest?.refining_loss_pct > 1.5 ? '⚠ Above target' : '✓ On target'],
      ]
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: kpiRows.map((row, ri) => new TableRow({
          children: row.map((cell, ci) => new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: cell, bold: ri === 0 || ci === 0, color: ri === 0 ? 'FFFFFF' : '222222', size: ri === 0 ? 20 : 18 })],
            })],
            shading: ri === 0 ? { type: ShadingType.SOLID, color: '1B2A4A' } : ci % 2 === 0 ? { type: ShadingType.SOLID, color: 'F4F6F8' } : undefined,
          }))
        }))
      }))
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }))

      // Market prices
      children.push(new Paragraph({ text: 'Current Market Prices', heading: HeadingLevel.HEADING_1 }))
      children.push(new Table({
        width: { size: 60, type: WidthType.PERCENTAGE },
        rows: [
          ['Acid oil', `Rs ${cp.acid_oil_price_per_kg}/kg`],
          ['Edible oil', `Rs ${cp.edible_oil_price_per_kg}/kg`],
          ['Distilled FFA (DFA)', `Rs ${dfaPrice}/kg`],
          ['Value addition gap', `Rs ${dailyGap.toLocaleString('en-IN')}/day`],
        ].map(([k, v]) => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v, color: '1D9E75', bold: true, size: 18 })] })] }),
          ]
        }))
      }))
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }))

      // Report sections
      sections.forEach(section => {
        children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1 }))
        section.lines.forEach(line => {
          if (line.trim() === '') return
          const isBullet = line.startsWith('- ') || line.startsWith('* ')
          children.push(new Paragraph({
            children: [new TextRun({ text: isBullet ? line.replace(/^[-*] /, '') : line, size: 18 })],
            bullet: isBullet ? { level: 0 } : undefined,
            spacing: { after: 60 }
          }))
        })
        children.push(new Paragraph({ text: '', spacing: { after: 100 } }))
      })

      // Footer note
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

      // ── Sheet 1: Summary dashboard ──
      const ws1 = wb.addWorksheet('Summary')
      ws1.getColumn('A').width = 30
      ws1.getColumn('B').width = 20
      ws1.getColumn('C').width = 20
      ws1.getColumn('D').width = 20

      const navy = { argb: 'FF1B2A4A' }, green = { argb: 'FF1D9E75' }, white = { argb: 'FFFFFFFF' }
      const ltgreen = { argb: 'FFE1F5EE' }, ltamber = { argb: 'FFFFF3CD' }, ltred = { argb: 'FFFDECEA' }, ltblue = { argb: 'FFE6F1FB' }

      const addHeader = (ws, row, text, span = 4) => {
        ws.mergeCells(row, 1, row, span)
        const c = ws.getCell(row, 1)
        c.value = text
        c.font = { bold: true, color: white, size: 12, name: 'Arial' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
        c.alignment = { horizontal: 'center', vertical: 'middle' }
        ws.getRow(row).height = 22
      }

      const addRow = (ws, row, label, val, unit = '', target = '', bg = null) => {
        const r = ws.getRow(row)
        r.height = 18
        const lc = r.getCell(1)
        lc.value = label
        lc.font = { size: 10, name: 'Arial', color: { argb: 'FF333333' } }

        const vc = r.getCell(2)
        vc.value = val !== null && val !== undefined ? (typeof val === 'number' ? val : val) : '—'
        vc.font = { bold: true, size: 11, name: 'Arial', color: green }
        if (unit) {
          const uc = r.getCell(3)
          uc.value = unit
          uc.font = { size: 10, name: 'Arial', color: { argb: 'FF888888' } }
        }
        if (target) {
          const tc = r.getCell(4)
          tc.value = target
          tc.font = { italic: true, size: 10, name: 'Arial', color: { argb: 'FFAAAAAA' } }
        }
        if (bg) {
          [1,2,3,4].forEach(col => {
            r.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: bg }
          })
        }
      }

      // Title
      ws1.mergeCells('A1:D1')
      const t = ws1.getCell('A1')
      t.value = `KENOP INTELLIGENCE — ${report_type.toUpperCase()} REPORT — ${client.name}`
      t.font = { bold: true, color: white, size: 13, name: 'Arial' }
      t.fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      t.alignment = { horizontal: 'center', vertical: 'middle' }
      ws1.getRow(1).height = 28

      ws1.mergeCells('A2:D2')
      const s = ws1.getCell('A2')
      s.value = `${client.location}  ·  ${client.feedstock_primary}  ·  ${tpd} TPD  ·  ${new Date().toLocaleDateString('en-IN')}`
      s.font = { bold: true, color: green, size: 10, name: 'Arial' }
      s.alignment = { horizontal: 'center' }
      ws1.getRow(2).height = 16

      addHeader(ws1, 4, 'KEY PROCESS KPIs')
      ws1.getRow(5).values = ['Parameter', 'Value', 'Unit', 'Target']
      ws1.getRow(5).font = { bold: true, size: 10, name: 'Arial' }
      ws1.getRow(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6F8' } }

      addRow(ws1, 6, 'Pre-separator soap', latest?.soap_ppm_pre_separator, 'ppm', '< 2200 ppm', { argb: latest?.soap_ppm_pre_separator > 2200 ? 'FFFDECEA' : 'FFE1F5EE' })
      addRow(ws1, 7, 'Post-separator soap ★', latest?.soap_ppm_post_separator, 'ppm', '< 700 ppm', { argb: latest?.soap_ppm_post_separator > 700 ? 'FFFDECEA' : 'FFE1F5EE' })
      addRow(ws1, 8, 'Separator efficiency', sepEff ? parseFloat(sepEff) : null, '%', '> 75%', { argb: sepEff < 70 ? 'FFFDECEA' : 'FFE1F5EE' })
      addRow(ws1, 9, 'Separator feed temperature', latest?.separator_feed_temp_degc, '°C', '82–85°C', { argb: 'FFF4F6F8' })
      addRow(ws1, 10, 'Neutral oil FFA', latest?.neutral_oil_ffa_pct, '%', '< 0.10%', { argb: latest?.neutral_oil_ffa_pct > 0.10 ? 'FFFDECEA' : 'FFE1F5EE' })
      addRow(ws1, 11, 'Refining loss', latest?.refining_loss_pct, '%', '< 1.5%', { argb: latest?.refining_loss_pct > 1.5 ? 'FFFFF3CD' : 'FFE1F5EE' })

      addHeader(ws1, 13, 'MARKET PRICES & FINANCIALS')
      addRow(ws1, 14, 'Acid oil price', cp.acid_oil_price_per_kg, 'Rs/kg', '', { argb: 'FFFFF3CD' })
      addRow(ws1, 15, 'Edible oil price', cp.edible_oil_price_per_kg, 'Rs/kg', '', { argb: 'FFE1F5EE' })
      addRow(ws1, 16, 'Distilled FFA price (acid oil + Rs40)', dfaPrice, 'Rs/kg', 'auto-calculated', { argb: 'FFE6F1FB' })
      addRow(ws1, 17, 'Current acid oil revenue', currentRevenue, 'Rs/day', '', { argb: 'FFF4F6F8' })
      addRow(ws1, 18, 'Revenue with value addition', separatedRevenue, 'Rs/day', '', { argb: 'FFE1F5EE' })
      addRow(ws1, 19, 'Daily value addition gap', dailyGap, 'Rs/day', '', { argb: 'FFE6F1FB' })
      addRow(ws1, 20, 'CAPEX payback (at Rs 1.8Cr)', dailyGap > 0 ? Math.round(18000000/dailyGap) : 'N/A', 'days', '', { argb: 'FFE1F5EE' })

      // ── Sheet 2: All readings ──
      const ws2 = wb.addWorksheet('Lab Readings')
      ws2.getRow(1).values = ['Date', 'Pre-sep soap (ppm)', 'Post-sep soap (ppm)', 'Sep temp °C', 'Neutral FFA %', 'Refining loss %', 'Sep efficiency %', 'Notes']
      ws2.getRow(1).font = { bold: true, color: white, name: 'Arial', size: 10 }
      ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      ws2.getRow(1).height = 20
      ;['A','B','C','D','E','F','G','H'].forEach((col, i) => {
        ws2.getColumn(col).width = [20,18,18,14,14,14,16,30][i]
      })

      readings?.forEach((r, i) => {
        const eff = r.soap_ppm_pre_separator && r.soap_ppm_post_separator
          ? (((r.soap_ppm_pre_separator - r.soap_ppm_post_separator) / r.soap_ppm_pre_separator) * 100).toFixed(1)
          : null
        const row = ws2.getRow(i + 2)
        row.values = [
          new Date(r.recorded_at).toLocaleDateString('en-IN'),
          r.soap_ppm_pre_separator,
          r.soap_ppm_post_separator,
          r.separator_feed_temp_degc,
          r.neutral_oil_ffa_pct,
          r.refining_loss_pct,
          eff ? parseFloat(eff) : null,
          r.notes || ''
        ]
        row.height = 16
        const bg = { type: 'pattern', pattern: 'solid', fgColor: { argb: i%2===0 ? 'FFFFFFFF' : 'FFF4F6F8' } }
        row.eachCell(c => { c.fill = bg; c.font = { size: 10, name: 'Arial' }; c.alignment = { horizontal: 'center' } })
        row.getCell(1).alignment = { horizontal: 'left' }
        row.getCell(8).alignment = { horizontal: 'left' }
      })

      // ── Sheet 3: Acid oil batches ──
      const ws3 = wb.addWorksheet('Acid Oil Batches')
      ws3.getRow(1).values = ['Date', 'Soapstock FFA %', 'Soapstock TFM %', 'H2SO4 dose (kg)', 'Acid oil FFA %', 'Acid oil moisture %', 'Yield %', 'Separation', 'Rag layer (kg)']
      ws3.getRow(1).font = { bold: true, color: white, name: 'Arial', size: 10 }
      ws3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      ws3.getRow(1).height = 20
      ;['A','B','C','D','E','F','G','H','I'].forEach((col, i) => {
        ws3.getColumn(col).width = [20,16,16,16,16,16,14,18,14][i]
      })

      acidBatches?.forEach((b, i) => {
        const row = ws3.getRow(i + 2)
        row.values = [
          new Date(b.created_at).toLocaleDateString('en-IN'),
          b.soapstock_ffa_pct,
          b.soapstock_tfm_pct,
          b.h2so4_dose_kg,
          b.acid_oil_ffa_pct,
          b.acid_oil_moisture_pct,
          b.acid_oil_yield_pct,
          b.separation_behaviour,
          b.rag_layer_collected_kg
        ]
        row.height = 16
        const bg = { type: 'pattern', pattern: 'solid', fgColor: { argb: i%2===0 ? 'FFFFFFFF' : 'FFF4F6F8' } }
        row.eachCell(c => { c.fill = bg; c.font = { size: 10, name: 'Arial' }; c.alignment = { horizontal: 'center' } })
      })

      // ── Sheet 4: Report text ──
      const ws4 = wb.addWorksheet('Report Text')
      ws4.getColumn('A').width = 100
      ws4.mergeCells('A1:A1')
      const rt = ws4.getCell('A1')
      rt.value = `KENOP INTELLIGENCE — ${report_type.toUpperCase()} ASSESSMENT REPORT — ${client.name}`
      rt.font = { bold: true, color: white, size: 13, name: 'Arial' }
      rt.fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
      rt.alignment = { horizontal: 'center' }
      ws4.getRow(1).height = 26

      let reportRow = 2
      content.split('\n').forEach(line => {
        const c = ws4.getCell(reportRow, 1)
        if (line.startsWith('## ')) {
          c.value = line.replace('## ', '')
          c.font = { bold: true, color: white, size: 11, name: 'Arial' }
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: navy }
          ws4.getRow(reportRow).height = 20
        } else if (line.trim()) {
          c.value = line.startsWith('- ') || line.startsWith('* ')
            ? '•  ' + line.replace(/^[-*] /, '') : line
          c.font = { size: 10, name: 'Arial', color: { argb: 'FF333333' } }
          c.alignment = { wrapText: true, vertical: 'top' }
          ws4.getRow(reportRow).height = 14
        }
        reportRow++
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