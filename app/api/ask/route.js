import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function classifyQuery(text) {
  const t = text.toLowerCase()

  const processAreas = {
    transesterification: ['methanol','naoh','koh','soap','saponification','phase separation','tlc','27/3','fame','methyl ester','catalyst','reflux','two stage','rag layer','emulsion','batch reactor'],
    glycerolysis: ['glycerolysis','glycerol dose','ffa conversion','deacidification','monoglyceride','diglyceride','thermic fluid','thermal oil','vacuum glycerolysis','glycerolysis temperature'],
    acid_esterification: ['acid esterification','h2so4','sulfuric acid','sulphuric','esterification','av below 2','ffa reduction','acid catalyst','two step','pre-esterification'],
    enzymatic_esterification: ['enzyme','enzymatic','lipase','immobilized','packed bed enzyme','enzymatic biodiesel','biocatalyst'],
    glycerol_purification: ['glycerol split','crude glycerol','glycerine split','mong','acidulation','soap split','glycerol purification','glycerol yield','glycerol moisture','glycerol 80%','crude glycerine'],
    fame_quality: ['cfpp','flash point','oxidation stability','rancimat','is 15607','astm d6751','en14214','ester content','bound glycerol','free glycerol','total glycerol','cold soak','iodine value','acid value fame','water content fame','density biodiesel','viscosity biodiesel','cetane','sodium potassium','phosphorus fame','linolenic','winter grade','summer grade'],
    fame_distillation: ['distillation','fame distill','still','vacuum distill','packing column','antioxidant','still bottoms','distillate yield','falling film','wiped film','limpet still','batch distill','overhead temperature'],
    omc_tender: ['bpcl','iocl','hpcl','omc','tender','empanelment','eoi','type certificate','is 15607 tender','supply biodiesel','tpia','nabcb','joint sampling','receipt protocol','tank truck','cfpp cluster','holiday listing','iqcm'],
    water_wash: ['water wash','soap test','wash biodiesel','dry wash','ion exchange resin','resin column','lead lag','wash water','soft water','tds wash','hard water','wash temperature','hot water wash','citric acid wash'],
    bleaching: ['bleaching earth','abe','activated earth','colour fame','color biodiesel','metals removal','iron ppm','copper ppm','phospholipid removal','bleaching dose','clay selection','silica adsorbent'],
    feedstock_pretreatment: ['acid oil washing','degumming','phosphoric acid pretreat','bleaching acid oil','pretreatment','phosphatide','gum removal','feed preparation','moisture drying feed'],
    methanol_recovery: ['methanol recovery','methanol removal','demethylation','flash methanol','methanol recycle','methanol distillation','methanol strip'],
    degassing_drying: ['degassing','vacuum dry','moisture removal','drying fame','moisture 500ppm','karl fischer','water content removal','flash dry','vacuum drying','dewatering'],
    process_monitoring: ['temperature control','pressure reading','level indicator','batch monitoring','shift log','process parameter','reading out of range','instrument','sensor','alarm']
  }

  const productInterests = {
    methanol: ['methanol','meoh','methanol price','methanol supplier','anhydrous methanol'],
    naoh_koh: ['naoh','koh','sodium hydroxide','potassium hydroxide','caustic soda'],
    bleaching_earth: ['bleaching earth','abe','clay','activated earth'],
    glycerine: ['refined glycerine','crude glycerol','glycerine price','glycerol quality'],
    phosphoric_acid: ['phosphoric acid','h3po4'],
    sulphuric_acid: ['sulphuric acid','h2so4','sulfuric'],
    citric_acid: ['citric acid','citric wash'],
    msa: ['methanesulfonic','msa acid'],
    antioxidants: ['antioxidant','pyrogallol','tbhq','bht','propyl gallate'],
    cold_flow_improver: ['cold flow improver','cfi','cfpp additive','pour point'],
    acid_oil: ['acid oil','acid oil price','acid oil quality','soapstock'],
    tallow: ['tallow','animal fat','beef tallow','chicken fat','chicken oil'],
    uco: ['used cooking oil','uco','restaurant oil','waste oil'],
    pfad: ['pfad','palm fatty acid','palm acid'],
    palm_stearin: ['palm stearin','palm oil','palm rbd'],
    centrifuge: ['centrifuge','disc stack','separator','centrifugal separator'],
    filter_press: ['filter press','plate frame','leaf filter','plf','pressure filter'],
    reactor: ['reactor','batch reactor','cstr','agitated vessel','reaction vessel'],
    distillation_column: ['distillation column','packed column','still pot','limpet still','falling film still','wiped film'],
    pumps: ['pump','centrifugal pump','gear pump','dosing pump','metering pump','positive displacement pump'],
    motors: ['motor','electric motor','vfd','variable frequency drive','variable speed drive','inverter drive'],
    valves: ['valve','control valve','solenoid valve','ball valve','butterfly valve','gate valve','check valve','prv'],
    pipes_flanges: ['pipe','flange','fitting','ss304 pipe','ss316 pipe','piping','pipeline','gasket'],
    level_transmitter: ['level transmitter','level indicator','level switch','lt','float switch','capacitance level','radar level'],
    pressure_transmitter: ['pressure transmitter','pressure gauge','pressure indicator','pt','pi','manometer','pressure switch'],
    temperature_transmitter: ['temperature transmitter','thermocouple','rtd','tt','ti','temperature indicator','temperature controller'],
    flow_meter: ['flow meter','flow indicator','fi','flow transmitter','mass flow','rotameter','magnetic flow'],
    control_panel: ['control panel','plc','scada','dcs','automation','hmi','control system','electrical panel'],
    lab_av_titration: ['burette','titration','av test','acid value test','phenolphthalein','koh titration'],
    lab_moisture: ['karl fischer','moisture analyser','moisture meter','water content analyser'],
    lab_flash_point: ['flash point tester','pensky martens','pmcc tester','flash point apparatus'],
    lab_viscosity: ['viscometer','viscosity bath','kinematic viscosity','ubbelohde'],
    lab_density: ['density meter','hydrometer','density bottle','specific gravity'],
    lab_cfpp: ['cfpp apparatus','cold filter plugging','cfpp tester','cold flow tester'],
    lab_tlc: ['tlc plate','thin layer','silica plate','tlc solvent','developing chamber'],
    lab_general: ['laboratory','lab equipment','analytical','testing equipment','reagent'],
    heat_exchanger: ['heat exchanger','phe','plate heat exchanger','shell tube','condenser','cooler'],
    thermal_oil_heater: ['thermal oil heater','thermic fluid heater','thermic heater','hot oil system'],
    vacuum_system: ['vacuum pump','ejector','vacuum system','steam ejector','barometric condenser'],
    storage_tanks: ['storage tank','ss tank','ms tank','holding tank','day tank','product tank'],
    methanol_recovery_equipment: ['methanol column','methanol distillation','methanol recovery column','demethylation column'],
    degassing_equipment: ['degasser','vacuum dryer','flash tank','thin film evaporator','mvr','evaporator'],
    tpia_certification: ['tpia','nabcb','type certificate','third party inspection','iso 17025 lab','bis lab'],
    process_engineering: ['process design','process technologist','plant design','engineering consultant','feasibility']
  }

  const intents = {
    troubleshooting: ['failed','not working','problem','issue','wrong','off spec','rejected','help','why is','what happened','cloudy','hazy','not separating','low yield','high av'],
    optimization: ['improve','increase yield','reduce cost','optimise','optimize','better','efficient','save','lower consumption'],
    compliance: ['is 15607','astm','en14214','tender','omc','specification','pass test','meet spec','cfpp limit'],
    learning: ['what is','how does','explain','why is','what happens','difference between','mechanism','process'],
    procurement: ['price','supplier','where to buy','cost','vendor','quote','purchase','source'],
    calculation: ['calculate','how much','dose','quantity','ratio','how many kg','stoichiometry','mass balance']
  }

  const urgencyWords = ['urgent','immediately','asap','failed batch','rejected','shutdown','stop','emergency','loss','cannot supply']

  let topArea = null
  let topScore = 0
  for (const [area, keywords] of Object.entries(processAreas)) {
    const score = keywords.filter(k => t.includes(k)).length
    if (score > topScore) { topScore = score; topArea = area }
  }

  const productTags = Object.entries(productInterests)
    .filter(([_, kw]) => kw.some(k => t.includes(k)))
    .map(([product]) => product)

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

    const { data: recent } = await supabase
      .from('conversation_tags')
      .select('process_area, product_interest')
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
    console.error('Classification save error:', err)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
const message = body.message || body.question || body.query || body.content || body.text
const { clientId, conversationId } = body

    if (!message) return Response.json({ error: 'No message' }, { status: 400 })

    const classification = classifyQuery(message)

    if (clientId) {
      setImmediate(() => saveClassification(clientId, conversationId, message, classification))
    }

    const systemPrompt = `You are Kenop, an AI process intelligence assistant for edible oil refineries and biodiesel plants in India. You have deep expertise in glycerolysis, transesterification, acid esterification, FAME quality, IS 15607:2022 compliance, and OMC tender requirements.

Respond in the same language the user writes in. If the user writes in Hindi, respond in Hindi. If in Marathi, respond in Marathi. If in English, respond in English.

Be specific with numbers. Give actionable answers. When relevant, mention safety and quality implications.`

    let response = null
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'

    try {
      const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'kenop-biodiesel', prompt: message, stream: false }),
        signal: AbortSignal.timeout(3000)
      })
      if (ollamaRes.ok) {
        const data = await ollamaRes.json()
        if (data.response && data.response.length > 50) response = data.response
      }
    } catch { }

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
      } catch { }
    }

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

    if (!response) return Response.json({ error: 'All AI layers unavailable' }, { status: 503 })

    return Response.json({ response, classification })

  } catch (err) {
    console.error('Ask route error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}