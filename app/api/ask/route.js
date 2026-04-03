import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ─── ZERO-COST LOCAL CLASSIFIER ───────────────────────────────────────────────
// Runs in <1ms. No API. No cost. Builds user profile silently.

function classifyQuery(text) {
  const t = text.toLowerCase()

  // Process areas — what part of the plant is this query about?
  const processAreas = {
    transesterification: [
      'methanol', 'naoh', 'koh', 'sodium hydroxide', 'potassium hydroxide',
      'soap', 'saponification', 'phase separation', 'glycerol settling',
      'tlc', '27/3', 'fame', 'methyl ester', 'catalyst', 'reflux',
      'two stage', 'second stage', 'molar ratio', 'stoichiometry',
      'rag layer', 'emulsion', 'glycerol drain', 'batch reactor'
    ],
    glycerolysis: [
      'glycerolysis', 'glycerol dose', 'ffa conversion', 'deacidification',
      'monoglyceride', 'diglyceride', 'partial glyceride', 'thermic fluid',
      'thermal oil', 'vacuum glycerolysis', 'structured packing glycero',
      'glycerolysis temperature', 'zinc oxide catalyst'
    ],
    acid_esterification: [
      'acid esterification', 'h2so4', 'sulfuric acid', 'sulphuric',
      'esterification', 'av below 2', 'ffa reduction', 'methanol sulfuric',
      'acid catalyst', 'two step', 'pre-esterification'
    ],
    enzymatic_esterification: [
      'enzyme', 'enzymatic', 'lipase', 'immobilized', 'packed bed enzyme',
      'enzymatic biodiesel', 'biocatalyst', 'single step enzyme'
    ],
    glycerol_purification: [
      'glycerol split', 'crude glycerol', 'glycerine split', 'mong',
      'acidulation', 'h3po4 glycerol', 'soap split', 'glycerol purification',
      'glycerol yield', 'glycerol moisture', 'glycerol 80%', 'glycerine quality',
      'crude glycerine', 'glycerol aq', 'fatty acid recovery glycerol'
    ],
    fame_quality: [
      'cfpp', 'flash point', 'oxidation stability', 'rancimat', 'induction period',
      'is 15607', 'astm d6751', 'en14214', 'ester content', 'bound glycerol',
      'free glycerol', 'total glycerol', 'cold soak', 'csf', 'iodine value',
      'acid value fame', 'water content fame', 'density biodiesel',
      'viscosity biodiesel', 'sulphur biodiesel', 'cetane', 'copper strip',
      'sodium potassium', 'calcium magnesium', 'phosphorus fame',
      'linolenic', 'polyunsaturated', 'winter grade', 'summer grade'
    ],
    fame_distillation: [
      'distillation', 'fame distill', 'still', 'vacuum distill', 'packing column',
      'antioxidant', 'still bottoms', 'distillate yield', 'falling film',
      'wiped film', 'limpet still', 'structured packing distill',
      'batch distill', 'continuous distill', 'overhead temperature',
      'distillation vacuum', 'steryl glucoside', 'unsaponifiable distill'
    ],
    omc_tender: [
      'bpcl', 'iocl', 'hpcl', 'omc', 'tender', 'empanelment', 'eoi',
      'type certificate', 'is 15607 tender', 'supply biodiesel',
      'quantity bid', 'tpia', 'nabcb', 'joint sampling', 'receipt protocol',
      'tank truck', 'cfpp cluster', 'winter cluster', 'holiday listing',
      'performance bank guarantee', 'iqcm', 'biodiesel supply'
    ],
    water_wash: [
      'water wash', 'soap test', 'wash biodiesel', 'dry wash', 'ion exchange resin',
      'resin column', 'lead lag', 'glycerol resin', 'wash water', 'soft water',
      'tds wash', 'hard water', 'wash temperature', 'hot water wash',
      'wash effluent', 'wash methanol', 'citric acid wash', 'acid wash fame'
    ],
    bleaching: [
      'bleaching earth', 'abe', 'activated earth', 'colour fame', 'color biodiesel',
      'metals removal', 'iron ppm', 'copper ppm', 'phospholipid removal',
      'bleaching dose', 'filter press bleach', 'colour lovibond',
      'clay selection', 'silica adsorbent', 'magnesium silicate'
    ],
    feedstock_pretreatment: [
      'acid oil washing', 'degumming', 'phosphoric acid pretreat',
      'bleaching acid oil', 'pretreatment', 'wash bleach', 'phosphatide',
      'gum removal', 'feed preparation', 'moisture drying feed'
    ],
    methanol_recovery: [
      'methanol recovery', 'methanol removal', 'demethylation', 'flash methanol',
      'methanol recycle', 'methanol distillation', 'methanol strip',
      'methanol from glycerol', 'methanol purity recycle'
    ],
    degassing_drying: [
      'degassing', 'vacuum dry', 'moisture removal', 'drying fame',
      'moisture 500ppm', 'karl fischer', 'water content removal',
      'flash dry', 'vacuum drying', 'dewatering'
    ],
    process_monitoring: [
      'temperature control', 'pressure reading', 'level indicator',
      'batch monitoring', 'shift log', 'process parameter',
      'reading out of range', 'instrument', 'sensor', 'alarm'
    ]
  }

  // Product interests — what could they buy?
  const productInterests = {
    // Chemicals
    methanol: ['methanol', 'meoh', 'methanol price', 'methanol supplier', 'anhydrous methanol'],
    naoh_koh: ['naoh', 'koh', 'sodium hydroxide', 'potassium hydroxide', 'caustic soda'],
    bleaching_earth: ['bleaching earth', 'abe', 'clay', 'activated earth', 'silica'],
    glycerine: ['refined glycerine', 'crude glycerol', 'glycerine price', 'glycerol quality'],
    phosphoric_acid: ['phosphoric acid', 'h3po4', 'phosphoric'],
    sulphuric_acid: ['sulphuric acid', 'h2so4', 'sulfuric'],
    citric_acid: ['citric acid', 'citric wash'],
    msa: ['methanesulfonic', 'msa acid'],
    antioxidants: ['antioxidant', 'pyrogallol', 'tbhq', 'bht', 'propyl gallate'],
    cold_flow_improver: ['cold flow improver', 'cfi', 'cfpp additive', 'pour point'],
    acid_oil: ['acid oil', 'acid oil price', 'acid oil quality', 'soapstock'],
    tallow: ['tallow', 'animal fat', 'beef tallow', 'chicken fat', 'chicken oil'],
    uco: ['used cooking oil', 'uco', 'restaurant oil', 'waste oil'],
    pfad: ['pfad', 'palm fatty acid', 'palm acid'],
    palm_stearin: ['palm stearin', 'palm oil', 'palm rbd'],

    // Process equipment
    centrifuge: ['centrifuge', 'disc stack', 'separator', 'alfa laval type', 'centrifugal separator'],
    filter_press: ['filter press', 'plate frame', 'leaf filter', 'plf', 'pressure filter'],
    reactor: ['reactor', 'batch reactor', 'cstr', 'agitated vessel', 'reaction vessel'],
    distillation_column: ['distillation column', 'packed column', 'still pot', 'limpet still', 'falling film still', 'wiped film'],
    
    // Pumps and motors
    pumps: ['pump', 'centrifugal pump', 'gear pump', 'dosing pump', 'metering pump', 'positive displacement pump', 'submersible pump'],
    motors: ['motor', 'electric motor', 'vfd', 'variable frequency drive', 'variable speed drive', 'inverter drive'],
    
    // Valves and piping
    valves: ['valve', 'control valve', 'solenoid valve', 'ball valve', 'butterfly valve', 'gate valve', 'check valve', 'pressure reducing valve', 'prv'],
    pipes_flanges: ['pipe', 'flange', 'fitting', 'ss304 pipe', 'ss316 pipe', 'piping', 'pipeline', 'gasket', 'seal'],
    
    // Instruments and automation
    level_transmitter: ['level transmitter', 'level indicator', 'level switch', 'lt', 'float switch', 'capacitance level', 'radar level'],
    pressure_transmitter: ['pressure transmitter', 'pressure gauge', 'pressure indicator', 'pt', 'pi', 'manometer', 'pressure switch'],
    temperature_transmitter: ['temperature transmitter', 'thermocouple', 'rtd', 'tt', 'ti', 'temperature indicator', 'temperature controller'],
    flow_meter: ['flow meter', 'flow indicator', 'fi', 'flow transmitter', 'mass flow', 'rotameter', 'magnetic flow'],
    control_panel: ['control panel', 'plc', 'scada', 'dcs', 'automation', 'hmi', 'control system', 'electrical panel'],
    
    // Lab equipment
    lab_av_titration: ['burette', 'titration', 'av test', 'acid value test', 'phenolphthalein', 'koh titration', 'titrino'],
    lab_moisture: ['karl fischer', 'moisture analyser', 'moisture meter', 'water content analyser'],
    lab_flash_point: ['flash point tester', 'pensky martens', 'pmcc tester', 'flash point apparatus'],
    lab_viscosity: ['viscometer', 'viscosity bath', 'kinematic viscosity', 'ubbelohde'],
    lab_density: ['density meter', 'hydrometer', 'density bottle', 'specific gravity'],
    lab_cfpp: ['cfpp apparatus', 'cold filter plugging', 'cfpp tester', 'cold flow tester'],
    lab_tlc: ['tlc plate', 'thin layer', 'silica plate', 'tlc solvent', 'developing chamber'],
    lab_general: ['laboratory', 'lab equipment', 'analytical', 'testing equipment', 'reagent', 'chemical standard'],
    
    // Heat transfer
    heat_exchanger: ['heat exchanger', 'phe', 'plate heat exchanger', 'shell tube', 'condenser', 'cooler'],
    thermal_oil_heater: ['thermal oil heater', 'thermic fluid heater', 'thermic heater', 'hot oil system'],
    
    // Vacuum and gas
    vacuum_system: ['vacuum pump', 'ejector', 'vacuum system', 'steam ejector', 'vacuum pump oil', 'barometric condenser'],
    
    // Storage and tanks
    storage_tanks: ['storage tank', 'ss tank', 'ms tank', 'holding tank', 'day tank', 'product tank'],
    
    // Methanol handling
    methanol_recovery_equipment: ['methanol column', 'methanol distillation', 'methanol recovery column', 'methanol condenser', 'demethylation column'],
    
    // Degassing
    degassing_equipment: ['degasser', 'vacuum dryer', 'flash tank', 'thin film evaporator', 'mvr', 'evaporator'],
    
    // Certification and services
    tpia_certification: ['tpia', 'nabcb', 'type certificate', 'third party inspection', 'iso 17025 lab', 'bis lab'],
    process_engineering: ['process design', 'dvc', 'process technologist', 'plant design', 'engineering consultant', 'feasibility'],
    
    // Trading and supply
    equipment_trading: ['second hand equipment', 'used equipment', 'refurbished', 'surplus equipment']
  }

  // Intent classification
  const intents = {
    troubleshooting: ['failed', 'not working', 'problem', 'issue', 'wrong', 'off spec', 'rejected', 'help', 'why is', 'what happened', 'cloudy', 'hazy', 'not separating', 'low yield', 'high av'],
    optimization: ['improve', 'increase yield', 'reduce cost', 'optimise', 'optimize', 'better', 'efficient', 'save', 'lower consumption'],
    compliance: ['is 15607', 'astm', 'en14214', 'tender', 'omc', 'specification', 'pass test', 'meet spec', 'cfpp limit'],
    learning: ['what is', 'how does', 'explain', 'why is', 'what happens', 'difference between', 'mechanism', 'process'],
    procurement: ['price', 'supplier', 'where to buy', 'cost', 'vendor', 'quote', 'purchase', 'source'],
    calculation: ['calculate', 'how much', 'dose', 'quantity', 'ratio', 'how many kg', 'stoichiometry', 'mass balance']
  }

  const urgencyWords = ['urgent', 'immediately', 'asap', 'failed batch', 'rejected', 'shutdown', 'stop', 'emergency', 'loss', 'cannot supply']

  // Score process areas
  let topArea = null
  let topScore = 0
  for (const [area, keywords] of Object.entries(processAreas)) {
    const score = keywords.filter(k => t.includes(k)).length
    if (score > topScore) { topScore = score; topArea = area }
  }

  // Collect product interests
  const productTags = Object.entries(productInterests)
    .filter(([_, kw]) => kw.some(k => t.includes(k)))
    .map(([product]) => product)

  // Score intent
  let topIntent = 'general'
  let intentScore = 0
  for (const [intent, keywords] of Object.entries(intents)) {
    const score = keywords.filter(k => t.includes(k)).length
    if (score > intentScore) { intentScore = score; topIntent = intent }
  }

  const isUrgent = urgencyWords.some(w => t.includes(w))

  return {
    process_area: topArea,
    product_interest: productTags,
    intent: topIntent,
    urgency: isUrgent ? 'urgent' : 'routine'
  }
}

// ─── SAVE CLASSIFICATION (non-blocking) ───────────────────────────────────────
async function saveClassification(clientId, conversationId, rawQuery, classification) {
  try {
    await supabase.from('conversation_tags').insert({
      client_id: clientId,
      conversation_id: conversationId,
      raw_query: rawQuery.slice(0, 500),
      process_area: classification.process_area,
      product_interest: classification.product_interest,
      intent: classification.intent,
      urgency: classification.urgency
    })

    // Update client profile summary (top 5 areas and products in last 30 days)
    const { data: recent } = await supabase
      .from('conversation_tags')
      .select('process_area, product_interest, intent')
      .eq('client_id', clientId)
      .gte('tagged_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (recent && recent.length > 0) {
      const areaCounts = {}
      const productCounts = {}
      recent.forEach(r => {
        if (r.process_area) areaCounts[r.process_area] = (areaCounts[r.process_area] || 0) + 1
        if (r.product_interest) r.product_interest.forEach(p => {
          productCounts[p] = (productCounts[p] || 0) + 1
        })
      })
      const topAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0])
      const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(x => x[0])

      await supabase.from('client_profiles').upsert({
        client_id: clientId,
        top_process_areas: topAreas,
        top_products_of_interest: topProducts,
        last_updated: new Date().toISOString()
      }, { onConflict: 'client_id' })
    }
  } catch (err) {
    console.error('Classification save error (non-critical):', err)
  }
}

// ─── MAIN ROUTE ───────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { message, clientId, conversationId } = await request.json()

    if (!message) return Response.json({ error: 'No message' }, { status: 400 })

    // Classify locally — zero cost, zero latency impact
    const classification = classifyQuery(message)

    // Save classification non-blocking (does not delay the response)
    if (clientId) {
      setImmediate(() => saveClassification(clientId, conversationId, message, classification))
    }

    // ─── Three-layer AI routing ────────────────────────────────────────────────
    const systemPrompt = `You are Kenop, an AI process intelligence assistant for edible oil refineries and biodiesel plants in India. You have deep expertise in glycerolysis, transesterification, acid esterification, FAME quality, IS 15607:2022 compliance, and OMC tender requirements.

Respond in the same language the user writes in. If the user writes in Hindi, respond in Hindi. If in Marathi, respond in Marathi. If in English, respond in English.

Be specific with numbers. Give actionable answers. When relevant, mention safety and quality implications.`

    // Layer 1: Try local Ollama adapter first
    let response = null
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'

    try {
      const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'kenop-biodiesel',
          prompt: message,
          stream: false
        }),
        signal: AbortSignal.timeout(3000)
      })
      if (ollamaRes.ok) {
        const data = await ollamaRes.json()
        if (data.response && data.response.length > 50) {
          response = data.response
        }
      }
    } catch {
      // Adapter not available, fall through to Groq
    }

    // Layer 2: Groq (free tier, fast)
    if (!response && process.env.GROQ_API_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 1024,
            temperature: 0.3
          })
        })
        if (groqRes.ok) {
          const data = await groqRes.json()
          response = data.choices?.[0]?.message?.content
        }
      } catch {
        // Fall through to Claude
      }
    }

    // Layer 3: Claude (paid, used sparingly)
    if (!response && process.env.ANTHROPIC_API_KEY) {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }]
        })
      })
      if (claudeRes.ok) {
        const data = await claudeRes.json()
        response = data.content?.[0]?.text
      }
    }

    if (!response) {
      return Response.json({ error: 'All AI layers unavailable' }, { status: 503 })
    }

    return Response.json({
      response,
      classification, // returned so dashboard can show "process area: transesterification" badge
      layer: response ? 'ok' : 'fallback'
    })

  } catch (err) {
    console.error('Ask route error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}