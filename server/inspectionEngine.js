/**
 * Server-Side OpenAI Vision Inspection Engine
 * 
 * Provides secure, server-side multimodal AI visual inspection strictly for
 * MACHINES and INDUSTRIAL EQUIPMENT.
 * 
 * SECURITY: Reads OPENAI_API_KEY strictly from server environment variables (process.env.OPENAI_API_KEY).
 * Never exposes the key to client-side code, browser JavaScript, or HTML.
 */

export const OPENAI_VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o';
export const CANDIDATE_OPENAI_MODELS = [
  OPENAI_VISION_MODEL,
  'gpt-4o',
  'gpt-4o-mini'
].filter((m, i, arr) => arr.indexOf(m) === i);

// Backward-compatibility alias
export const GEMINI_VISION_MODEL = OPENAI_VISION_MODEL;

/**
 * Returns configured OpenAI API key strictly from server environment variables.
 */
export function getServerOpenAIApiKey() {
  return (process.env.OPENAI_API_KEY || '').trim();
}

export const getServerGeminiApiKey = getServerOpenAIApiKey;

/**
 * Primary Caller for OpenAI Vision API (gpt-4o / gpt-4o-mini).
 */
export async function callOpenAIVision(apiKey, systemPrompt, pureBase64, mimeType = 'image/jpeg') {
  if (!apiKey || apiKey.length < 10) {
    const missingErr = new Error('AI Vision Service Unavailable: Server OPENAI_API_KEY is not configured in environment variables.');
    missingErr.isMissingKey = true;
    throw missingErr;
  }

  const cleanMime = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
  let lastError = null;

  for (const modelName of CANDIDATE_OPENAI_MODELS) {
    try {
      console.log(`[AI INSPECTION ENGINE] Calling OpenAI Vision model: ${modelName}`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this uploaded machine image. Return strictly valid JSON conforming to the requested schema.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${cleanMime};base64,${pureBase64}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 2500,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`[AI INSPECTION ENGINE] OpenAI ${modelName} returned HTTP ${response.status}: ${errorText.slice(0, 150)}`);

        if (response.status === 429 && errorText.includes('insufficient_quota')) {
          const quotaErr = new Error('AI Vision Service Unavailable: OpenAI API quota exhausted. Please check billing credits on OpenAI platform.');
          quotaErr.isQuotaExhausted = true;
          throw quotaErr;
        }

        const isInvalidKey = response.status === 401 || (response.status === 400 && errorText.includes('invalid_api_key'));
        if (isInvalidKey) {
          const keyErr = new Error('AI Vision Service Unavailable: The configured OPENAI_API_KEY is invalid or expired.');
          keyErr.isKeyInvalid = true;
          throw keyErr;
        }

        lastError = new Error(`HTTP ${response.status}: ${errorText.slice(0, 100)}`);
        continue;
      }

      const resultJson = await response.json();
      const textOutput = resultJson.choices?.[0]?.message?.content || '';

      if (!textOutput) {
        lastError = new Error(`Empty response content from OpenAI ${modelName}`);
        continue;
      }

      const match = textOutput.match(/\{[\s\S]*\}/);
      if (!match) {
        lastError = new Error(`Model ${modelName} output did not contain valid JSON`);
        continue;
      }

      const parsed = JSON.parse(match[0]);
      return { parsed, modelUsed: `OpenAI (${modelName})` };
    } catch (err) {
      if (err.isKeyInvalid || err.isQuotaExhausted || err.isMissingKey) throw err;
      console.warn(`[AI INSPECTION ENGINE] Error calling OpenAI ${modelName}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All OpenAI Vision candidate models failed.');
}

/**
 * 1. FIRST-STAGE MACHINE CLASSIFIER
 * Analyzes visual content to categorize machines and filter out non-machine subjects.
 */
export async function classifyAssetMultimodal({ imageBase64, mimeType = 'image/jpeg' }) {
  const apiKey = getServerOpenAIApiKey();

  if (!apiKey) {
    return {
      success: false,
      serviceAvailable: false,
      status: 'SERVICE_UNAVAILABLE',
      reason: 'AI Vision Service Unavailable: Server-side OPENAI_API_KEY is not configured in Vercel / Render deployment environment variables.',
      modelName: 'None (Service Unavailable)',
      modelVersion: OPENAI_VISION_MODEL,
      primaryCategory: 'AI Vision Service Unavailable',
      machineType: 'AI Vision Service Unavailable',
      machineCategory: 'AI Vision Service Unavailable',
      assetType: null,
      confidence: 0,
      eligible: false,
      inspectionEligible: false
    };
  }

  const pureBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

  const classificationPrompt = `
You are the First-Stage Visual Machine Classifier for an industrial inspection system.

YOUR MANDATE:
Analyze ONLY the visual content of the provided image to determine if the primary subject is a MACHINE or INDUSTRIAL EQUIPMENT.

SUPPORTED INDUSTRIAL EQUIPMENT:
- Electric Motors
- Centrifugal & Positive Displacement Pumps
- Compressors (Air / Gas)
- Generators & Engines
- Gearboxes & Speed Reducers
- Bearings, Shafts, Couplings
- Fans, Blowers, Turbines
- Conveyors & Material Handling Equipment
- Valves & Actuators
- Pipelines, Pipes, Flanges
- Pressure Vessels & Heat Exchangers
- Storage Tanks & Silos
- Transformers & Substations
- Electrical Panels, Switchgear, MCCs
- Industrial Machinery
- CNC Machines, Lathes, Milling Machines, Machine Tools
- Manufacturing, Hydraulic, & Pneumatic Equipment
- Construction Machinery

STRICT PROHIBITIONS (DO NOT ANALYZE):
- Living people, human faces, portraits, selfies, bodies, biometrics, human health, PPE monitoring, or identity.
- Animals / pets.
- Food / meals.
- Natural landscapes / scenic wilderness (without machinery).
- Domestic furniture / household rooms.
- Invoices / receipts / text documents.

CRITICAL RULES:
1. If the image depicts ANY machine, mechanical apparatus, or electrical industrial equipment:
   - "eligible": true
   - Identify machineType (e.g. "Three-Phase Induction Motor", "Centrifugal Slurry Pump", "Rotary Screw Compressor", "Helical Gearbox").
   - Identify machineCategory from the supported list above.
   - UNKNOWN MACHINE RULE: If the exact machine model is unknown but it is clearly industrial equipment:
     → Classify broadly as machineCategory: "Industrial Machinery", machineType: "Industrial Machinery Assembly".
     → Set "eligible": true, and confidence between 75 and 92.
     → NEVER reject an industrial machine as "Unknown / Unsupported".
2. ONLY set "eligible": false if the subject is clearly a person, animal, food, scenic landscape, or document.

Respond strictly in valid JSON:
{
  "machineType": string,
  "machineCategory": string,
  "confidence": number,
  "eligible": boolean,
  "reason": string
}
`;

  try {
    const { parsed, modelUsed } = await callOpenAIVision(apiKey, classificationPrompt, pureBase64, mimeType);

    const mType = String(parsed.machineType || 'Industrial Machinery');
    let mCat = String(parsed.machineCategory || 'Industrial Machinery');
    
    const catLower = mCat.toLowerCase();
    const isOutOfScope = catLower.includes('person') || 
                         catLower.includes('human') || 
                         catLower.includes('animal') || 
                         catLower.includes('food') || 
                         catLower.includes('room') || 
                         catLower.includes('landscape') || 
                         catLower.includes('document') ||
                         parsed.eligible === false;

    if (!isOutOfScope && (mCat === 'Unknown / Unsupported' || !mCat)) {
      mCat = 'Industrial Machinery';
    }

    const isEligible = !isOutOfScope;
    const conf = typeof parsed.confidence === 'number'
      ? Math.max(70, Math.round(parsed.confidence <= 1 ? parsed.confidence * 100 : parsed.confidence))
      : 88;

    return {
      success: true,
      serviceAvailable: true,
      status: isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
      machineType: isEligible ? mType : 'Non-Machine Subject',
      machineCategory: isEligible ? mCat : 'Non-Machine Subject',
      primaryCategory: isEligible ? mCat : 'Non-Machine Subject',
      broadDomain: isEligible ? 'Industrial & Mechanical' : 'Out of Scope',
      assetType: isEligible ? mType : null,
      confidence: conf,
      eligible: isEligible,
      inspectionEligible: isEligible,
      reason: parsed.reason || (isEligible ? 'Supported industrial equipment identified.' : 'Subject is out of scope for machine inspection.'),
      modelName: modelUsed,
      modelVersion: OPENAI_VISION_MODEL
    };
  } catch (err) {
    console.error('[AI CLASSIFIER ERROR]:', err.message);
    const isQuotaExhausted = Boolean(err.isQuotaExhausted || (err.message && err.message.includes('quota')));
    const isKeyInvalid = Boolean(err.isKeyInvalid || (err.message && (err.message.includes('invalid') || err.message.includes('expired'))));

    return {
      success: false,
      serviceAvailable: false,
      isKeyInvalid,
      isQuotaExhausted,
      status: 'SERVICE_UNAVAILABLE',
      reason: 'AI Vision Service Unavailable: Please ensure OPENAI_API_KEY is configured in your deployment environment variables.',
      modelName: 'None (Service Unavailable)',
      modelVersion: OPENAI_VISION_MODEL,
      primaryCategory: 'AI Vision Service Unavailable',
      machineType: 'AI Vision Service Unavailable',
      machineCategory: 'AI Vision Service Unavailable',
      assetType: null,
      confidence: 0,
      eligible: false,
      inspectionEligible: false
    };
  }
}

/**
 * 2. FULL MULTIMODAL MACHINE DEFECT INSPECTION
 * Performs comprehensive flaw detection, evidence assessment, and condition scoring
 * for machines and industrial equipment strictly using OpenAI Vision.
 */
export async function analyzeInspectionMultimodal({
  imageBase64,
  mimeType = 'image/jpeg',
  userSelectedAsset = '',
  userNotes = ''
}) {
  const apiKey = getServerOpenAIApiKey();

  if (!apiKey) {
    return {
      success: false,
      serviceAvailable: false,
      status: 'SERVICE_UNAVAILABLE',
      reason: 'AI Vision Service Unavailable: Server OPENAI_API_KEY is not configured in deployment environment variables.',
      modelUsed: 'None (Service Unavailable)'
    };
  }

  const pureBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

  const inspectionPrompt = `
You are an expert Vision-Based Industrial Machine & Equipment Inspection System powered by OpenAI Vision.

MANDATE & NON-NEGOTIABLE PRINCIPLES:
1. SCOPE: ONLY MACHINES & INDUSTRIAL EQUIPMENT:
   Electric motors, pumps, compressors, generators, engines, gearboxes, bearings, shafts, couplings, fans, blowers, turbines, conveyors, valves, pipelines, pipes, pressure vessels, tanks, transformers, electrical panels, switchgear, industrial machinery, CNC machines, machine tools, manufacturing equipment, hydraulic equipment, pneumatic equipment, construction machinery.
   DO NOT analyze people, faces, biometrics, human health, PPE, or identity.

2. STRICTLY NO SENSOR HALLUCINATIONS:
   NEVER invent or fabricate operating temperature (°C), bearing vibration (Hz / mm/s), hydraulic or gas pressure (bar / psi), electrical motor current (A), internal bearing condition, or hidden mechanical failures that cannot be seen directly.
   Report ONLY what is visually observable on external surfaces. Explicitly state that thermal, vibration, and internal checks require physical instruments.

3. ONLY REPORT VISUALLY SUPPORTED DEFECTS:
   Report ONLY defects visible in the exterior image frame:
   - External surface corrosion, oxidation, or paint blistering
   - Visible fluid, oil, or coolant weeping, dripping, or leakage
   - Visible housing fractures, hairline surface cracks, or casing fissures
   - Loose, missing, or corroded fasteners, bolts, or tie-rods
   - Drive belt fraying, surface glazing, or pulley misalignment
   - Flange gap irregularity or extruded gasket material
   - Heavy particulate, slag, or oil contamination on cooling fins / vents

4. NOMINAL / HEALTHY MACHINES:
   If the machine is clean, undamaged, and well-maintained:
   - "defects": [] (STRICTLY EMPTY ARRAY - ZERO DEFECTS)
   - "overallCondition": "Excellent"
   - "conditionScore": 90-100

5. UNKNOWN MACHINE:
   If the exact machine model is unknown but it is clearly industrial equipment:
   → Classify broadly (e.g. machineCategory: "Industrial Machinery", machineType: "Industrial Machinery Assembly")
   → Set "eligible": true, confidence: 75-92, and ALLOW the inspection to proceed.

6. OUT-OF-SCOPE SUBJECTS (Human, Animal, Food, Landscape, Domestic Room, Document):
   If the image does not contain a machine:
   - "eligible": false
   - "overallCondition": "Out of Scope"
   - "conditionScore": null
   - "defects": []
   - "recommendations": []

7. CONDITION SCORE (0-100):
   Calculate an AI Visual Condition Score based purely on visible degradation:
   - 90-100 = Excellent (intact, minor or zero surface wear)
   - 75-89 = Good (light cosmetic oxidation / dust, no operational impairment)
   - 50-74 = Fair (moderate surface corrosion, minor seal weeping, or hairline surface fissure)
   - 25-49 = Poor (significant defect, active oil leakage, or loose mounting bolt)
   - 0-24 = Critical (casing rupture, severe flange fracture, structural failure)
   - Out of scope: conditionScore: null

Context from user/inspector: "${userNotes || userSelectedAsset || 'Industrial machine visual inspection'}"

Respond strictly in valid JSON matching this exact schema:
{
  "machineType": string,
  "machineCategory": string,
  "confidence": number,
  "eligible": boolean,
  "overallCondition": "Excellent" | "Good" | "Fair" | "Poor" | "Critical" | "Out of Scope",
  "conditionScore": number | null,
  "defects": [
    {
      "defectType": string,
      "severity": "Critical" | "High" | "Medium" | "Low",
      "confidence": number,
      "visualEvidence": string,
      "affectedArea": string
    }
  ],
  "recommendations": [
    string
  ],
  "limitations": [
    string
  ]
}
`;

  try {
    const { parsed, modelUsed } = await callOpenAIVision(apiKey, inspectionPrompt, pureBase64, mimeType);

    const mType = String(parsed.machineType || 'Industrial Machinery');
    let mCat = String(parsed.machineCategory || 'Industrial Machinery');

    const catLower = mCat.toLowerCase();
    const isOutOfScope = catLower.includes('person') || 
                         catLower.includes('human') || 
                         catLower.includes('animal') || 
                         catLower.includes('food') || 
                         catLower.includes('room') || 
                         catLower.includes('landscape') || 
                         catLower.includes('document') ||
                         parsed.eligible === false;

    if (!isOutOfScope && (mCat === 'Unknown / Unsupported' || !mCat)) {
      mCat = 'Industrial Machinery';
    }

    const isEligible = !isOutOfScope;
    const conf = typeof parsed.confidence === 'number'
      ? Math.max(70, Math.round(parsed.confidence <= 1 ? parsed.confidence * 100 : parsed.confidence))
      : 88;

    const rawDefects = Array.isArray(parsed.defects) ? parsed.defects : [];

    const formattedDefects = isEligible && rawDefects.length > 0
      ? rawDefects.map((d, i) => {
          const rawSev = String(d.severity || 'Medium').toUpperCase();
          const sev = (rawSev === 'CRITICAL' || rawSev === 'HIGH') ? 'HIGH' : (rawSev === 'LOW' ? 'LOW' : 'MEDIUM');
          const dConf = typeof d.confidence === 'number' ? Math.round(d.confidence) : 85;

          return {
            id: `DEF_${i + 1}`,
            defectType: d.defectType || 'surface_anomaly',
            name: (d.defectType || 'Visual Flaw').toUpperCase(),
            type: d.defectType || 'surface_anomaly',
            confidence: dConf,
            confidenceLabel: `${dConf}%`,
            severity: sev,
            visualEvidence: d.visualEvidence || 'Visible surface anomaly identified in visual frame.',
            affectedArea: d.affectedArea || 'Exterior surface',
            aiObservation: `AI VISUAL OBSERVATION: Anomaly detected on ${d.affectedArea || 'component'}. ${d.visualEvidence || ''}`,
            engineeringAssessment: 'ENGINEERING ASSESSMENT: Qualified engineer verification required. Physical dimensions require calibrated measurement tools.',
            color: sev === 'HIGH' ? 'critical' : (sev === 'MEDIUM' ? 'attention' : 'healthy'),
            icon: sev === 'HIGH' ? '🔴' : (sev === 'MEDIUM' ? '🟡' : '🟢'),
            tag: `${d.severity || 'Medium'} Priority Defect`
          };
        })
      : [];

    const finalScore = isEligible && typeof parsed.conditionScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.conditionScore)))
      : (isEligible ? 85 : null);

    const topSeverity = formattedDefects.length > 0 
      ? (formattedDefects.some(d => d.severity === 'HIGH') ? 'High'
        : formattedDefects.some(d => d.severity === 'MEDIUM') ? 'Medium' : 'Low')
      : (isEligible ? 'Nominal' : 'Informational');

    const evidenceSummary = formattedDefects.length > 0
      ? formattedDefects.map(d => `${d.defectType}: ${d.visualEvidence}`).join('; ')
      : (isEligible ? 'Nominal surface condition under current visual view; zero acute visible defects.' : 'Non-machine subject.');

    const affectedAreaSummary = formattedDefects.length > 0
      ? formattedDefects.map(d => d.affectedArea).filter(Boolean).join(', ') || 'Exterior surface'
      : (isEligible ? 'General Equipment Exterior' : 'N/A');

    const cleanRecommendations = Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
      ? parsed.recommendations.map((r, idx) => typeof r === 'string' ? { step: idx + 1, title: 'Action Item', detail: r } : r)
      : (isEligible ? [
          { step: 1, title: 'Visual Confirmation', detail: 'Perform routine on-site visual check of machine mounting and housing.' },
          { step: 2, title: 'Preventive Maintenance', detail: 'Follow plant maintenance schedule for lubrication and bolt torque verification.' }
        ] : []);

    const cleanLimitations = Array.isArray(parsed.limitations) && parsed.limitations.length > 0
      ? parsed.limitations
      : [
          '2D visual inspection cannot determine internal bearing raceway condition or subsurface voids.',
          'Operating temperature (°C), vibration spectra (mm/s), and hydraulic pressure (bar) require calibrated physical gauges.',
          'Visual assessment only — certified engineer verification required before operational sign-off.'
        ];

    const overallCond = parsed.overallCondition || (
      finalScore !== null 
        ? (finalScore >= 90 ? 'Excellent' : finalScore >= 75 ? 'Good' : finalScore >= 50 ? 'Fair' : finalScore >= 25 ? 'Poor' : 'Critical')
        : (isEligible ? 'Good' : 'Out of Scope')
    );

    return {
      success: true,
      serviceAvailable: true,
      status: isEligible ? 'SUCCESS' : 'NOT_APPLICABLE',
      // Exact requested structured data:
      machineType: isEligible ? mType : 'Non-Machine Subject',
      machineCategory: isEligible ? mCat : 'Non-Machine Subject',
      confidence: conf,
      eligible: isEligible,
      overallCondition: overallCond,
      conditionScore: finalScore,
      defects: formattedDefects,
      recommendations: cleanRecommendations,
      limitations: cleanLimitations,
      modelUsed,

      // UI compatibility aliases:
      assetType: isEligible ? mType : 'Non-Machine Subject',
      assetCategory: isEligible ? mCat : 'Non-Machine Subject',
      broadDomain: isEligible ? 'Industrial & Mechanical' : 'Out of Scope',
      visibleDefects: formattedDefects,
      severity: topSeverity,
      visualEvidence: evidenceSummary,
      affectedArea: affectedAreaSummary,
      conditionRating: finalScore !== null ? `${finalScore}/100` : 'N/A',
      conditionDisclaimer: 'Visual assessment only — qualified engineer verification required.',
      summaryObservation: evidenceSummary,
      engineeringAssessment: isEligible 
        ? 'Visual inspection only. Calibrated gauges required for vibration, temperature, and internal clearances.'
        : 'Inspection suppressed: Subject is not a recognized machine or industrial asset.',
      inspectionTimestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('[AI INSPECTION ERROR]:', err.message);
    const isQuotaExhausted = Boolean(err.isQuotaExhausted || (err.message && err.message.includes('quota')));
    const isKeyInvalid = Boolean(err.isKeyInvalid || (err.message && (err.message.includes('invalid') || err.message.includes('expired'))));

    return {
      success: false,
      serviceAvailable: false,
      isKeyInvalid,
      isQuotaExhausted,
      status: 'SERVICE_UNAVAILABLE',
      reason: 'AI Vision Service Unavailable: Please ensure OPENAI_API_KEY is configured in your deployment environment variables.',
      modelUsed: 'None (Service Unavailable)'
    };
  }
}
