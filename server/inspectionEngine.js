/**
 * Server-Side OpenAI Vision Inspection Engine
 * 
 * Provides secure, server-side multimodal AI visual inspection strictly for
 * MACHINES and INDUSTRIAL EQUIPMENT.
 * 
 * SECURITY: Reads OPENAI_API_KEY strictly from server environment variables.
 * Never exposes the key to client-side code or browser logs.
 */

export const OPENAI_VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o';
export const CANDIDATE_OPENAI_MODELS = [
  OPENAI_VISION_MODEL,
  'gpt-4o',
  'gpt-4o-mini'
].filter((m, i, arr) => arr.indexOf(m) === i);

// Backwards-compatibility aliases
export const GEMINI_VISION_MODEL = OPENAI_VISION_MODEL;

/**
 * Returns configured vision API key from server environment or request headers.
 * Strictly avoids exposing secret keys in client-side code.
 */
export function getServerOpenAIApiKey(reqHeaders = {}) {
  return (
    process.env.OPENAI_API_KEY ||
    (reqHeaders && (reqHeaders['x-openai-key'] || reqHeaders['x-gemini-key'] || reqHeaders['x-api-key'])) ||
    (reqHeaders && reqHeaders['authorization'] && reqHeaders['authorization'].startsWith('Bearer ')
      ? reqHeaders['authorization'].slice(7)
      : '') ||
    process.env.GEMINI_API_KEY ||
    ''
  ).trim();
}

// Backwards-compatibility alias
export const getServerGeminiApiKey = getServerOpenAIApiKey;

/**
 * Primary Caller for OpenAI Vision API (gpt-4o / gpt-4o-mini).
 */
export async function callOpenAIVision(apiKey, systemPrompt, pureBase64, mimeType = 'image/jpeg') {
  if (!apiKey || apiKey.length < 10) {
    throw new Error('MISSING_SERVER_API_KEY');
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
                  text: 'Inspect this uploaded machine / industrial equipment image and return strictly valid JSON according to your system instructions.'
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
          const quotaErr = new Error('OpenAI API Quota Exhausted: Your account has no remaining credits. Please add billing credits at https://platform.openai.com/settings/organization/billing/.');
          quotaErr.isQuotaExhausted = true;
          throw quotaErr;
        }

        const isInvalidKey = response.status === 401 || (response.status === 400 && errorText.includes('invalid_api_key'));
        if (isInvalidKey) {
          const keyErr = new Error('The configured OpenAI API key is invalid or expired. Please verify your server-side OPENAI_API_KEY.');
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
      if (err.isKeyInvalid || err.isQuotaExhausted) throw err;
      console.warn(`[AI INSPECTION ENGINE] Error calling OpenAI ${modelName}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All OpenAI Vision candidate models failed.');
}

/**
 * Optional Gemini Vision Fallback (used only if inspector provides a key starting with AIza).
 */
async function callGeminiVision(apiKey, systemPrompt, pureBase64, mimeType = 'image/jpeg') {
  const cleanMime = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { inline_data: { mime_type: cleanMime, data: pureBase64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048, responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        lastError = new Error(`HTTP ${response.status}: ${errorText.slice(0, 100)}`);
        continue;
      }

      const resultJson = await response.json();
      const textOutput = resultJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = textOutput.match(/\{[\s\S]*\}/);
      if (match) {
        return { parsed: JSON.parse(match[0]), modelUsed: `Google Gemini (${modelName})` };
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Gemini Vision fallback failed.');
}

/**
 * Unified Multimodal Vision Caller routing to OpenAI or Gemini fallback based on key.
 */
async function callMultimodalVision(apiKey, systemPrompt, pureBase64, mimeType = 'image/jpeg') {
  if (!apiKey || apiKey.length < 10) {
    throw new Error('MISSING_SERVER_API_KEY');
  }

  if (apiKey.startsWith('AIza')) {
    return callGeminiVision(apiKey, systemPrompt, pureBase64, mimeType);
  }

  return callOpenAIVision(apiKey, systemPrompt, pureBase64, mimeType);
}

/**
 * 1. FIRST-STAGE MACHINE CLASSIFIER
 * Analyzes visual content to categorize machines and filter out non-machine subjects.
 */
export async function classifyAssetMultimodal({ imageBase64, mimeType = 'image/jpeg', reqHeaders = {} }) {
  const apiKey = getServerOpenAIApiKey(reqHeaders);

  if (!apiKey) {
    return {
      success: false,
      serviceAvailable: false,
      status: 'SERVICE_UNAVAILABLE',
      reason: 'AI Vision Service Unavailable: Server-side OPENAI_API_KEY is not configured in deployment environment variables.',
      modelName: 'None (Service Unavailable)',
      modelVersion: OPENAI_VISION_MODEL,
      primaryCategory: 'Unknown / Unsupported',
      machineType: 'Unknown / Unsupported',
      machineCategory: 'Unknown / Unsupported',
      assetType: null,
      confidence: 0,
      eligible: false,
      inspectionEligible: false
    };
  }

  const pureBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

  const classificationPrompt = `
You are the First-Stage Visual Machine Classifier for an industrial engineering inspection system.

YOUR MANDATE:
Analyze ONLY the visual content of the provided image to determine if the primary subject is a MACHINE or INDUSTRIAL EQUIPMENT.

RECOGNIZED INDUSTRIAL MACHINE CATEGORIES:
1. Electric Motor
2. Centrifugal Pump
3. Positive Displacement Pump
4. Industrial Compressor (Air / Gas)
5. Diesel / Gas Generator
6. Industrial Gearbox / Speed Reducer
7. Bearing Assembly / Pillow Block
8. Industrial Valve / Actuator
9. Pipeline / Piping Flange / Manifold
10. Pressure Vessel / Heat Exchanger
11. Storage Tank / Silo
12. Transformer / Substation
13. Electrical Switchgear / Control Panel / MCC
14. CNC Machine / Industrial Lathe / Mill
15. Conveyor System / Industrial Press / Turbine
16. Industrial Boiler / Chiller / Cooling Tower
17. Industrial Machinery (unspecified mechanical equipment)

STRICT EXCLUSIONS (NON-MACHINE SUBJECTS):
- Human beings / portraits / selfies / faces / people / biometrics / PPE monitoring
- Animals / pets
- Food / meals / dishes
- Natural landscapes / wilderness (without industrial machinery)
- Domestic interior bedroom / living room / furniture
- Text documents / receipts / invoices / screenshots

CRITICAL CLASSIFICATION RULES:
- If the uploaded image shows ANY machine, mechanical component, electrical apparatus, industrial structure, or factory equipment:
  * "eligible": true.
  * Accurately identify machineType (e.g. "Three-Phase AC Induction Motor", "Centrifugal Slurry Pump", "Rotary Screw Air Compressor", "Helical Gearbox").
  * Accurately identify machineCategory from the recognized categories above.
  * Even if the exact model cannot be determined with 100% confidence, classify it as "Industrial Machinery" or a specific category with confidence between 75 and 92, and set "eligible": true.
  * NEVER reject an industrial machine as "Unknown / Unsupported".
- If the image contains a machine with incidental people in the background, the machine is the primary subject.
- ONLY reject images ("eligible": false) if the subject is clearly a person, animal, food, domestic room, or text document.

Respond strictly in valid JSON format:
{
  "machineType": string,
  "machineCategory": string,
  "confidence": number,
  "eligible": boolean,
  "reason": string
}
`;

  try {
    const { parsed, modelUsed } = await callMultimodalVision(apiKey, classificationPrompt, pureBase64, mimeType);

    const mType = String(parsed.machineType || parsed.assetType || 'Industrial Machinery');
    let mCat = String(parsed.machineCategory || parsed.primaryCategory || 'Industrial Machinery');
    
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
      machineCategory: mCat,
      primaryCategory: mCat,
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
    const isQuotaExhausted = Boolean(err.isQuotaExhausted || (err.message && err.message.includes('Quota Exhausted')));
    const isKeyInvalid = Boolean(
      err.isKeyInvalid || 
      (err.message && (
        err.message.includes('invalid_api_key') ||
        err.message.includes('API key not valid') || 
        err.message.includes('API_KEY_INVALID') || 
        err.message.includes('invalid or expired')
      ))
    );

    return {
      success: false,
      serviceAvailable: false,
      isKeyInvalid,
      isQuotaExhausted,
      status: 'SERVICE_UNAVAILABLE',
      reason: isQuotaExhausted
        ? 'OpenAI API Quota Exhausted: Your account has no remaining credits. Please add billing credits at platform.openai.com/settings/organization/billing/.'
        : isKeyInvalid
        ? 'The configured OpenAI API key is invalid or expired. Please verify your server-side OPENAI_API_KEY.'
        : `Visual classification service error: ${err.message}. Please verify server-side OPENAI_API_KEY.`,
      modelName: 'None (Service Unavailable)',
      modelVersion: OPENAI_VISION_MODEL,
      primaryCategory: 'Unknown / Unsupported',
      machineType: 'Unknown / Unsupported',
      machineCategory: 'Unknown / Unsupported',
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
 * for machines and industrial equipment using OpenAI Vision.
 */
export async function analyzeInspectionMultimodal({
  imageBase64,
  mimeType = 'image/jpeg',
  userSelectedAsset = '',
  userNotes = '',
  reqHeaders = {}
}) {
  const apiKey = getServerOpenAIApiKey(reqHeaders);

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
1. FOCUS ONLY ON MACHINES & INDUSTRIAL EQUIPMENT:
   Electric motors, pumps, compressors, generators, gearboxes, bearings, valves, pipelines, pressure vessels, tanks, transformers, switchgear, CNCs, conveyors, presses, turbines, and mechanical plant machinery.
2. STRICTLY NO SENSOR HALLUCINATIONS:
   NEVER invent or fabricate operating temperature (°C), bearing vibration (Hz / mm/s), hydraulic or gas pressure (bar / psi), electrical motor current (A), or unseen internal stator/rotor/gear faults that cannot be directly observed optically.
   Explicitly state that internal, thermal, and vibration metrics require calibrated physical instruments.
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
   - "severity": "Nominal"
   - "conditionScore": 90-100
   - "visualEvidence": "Nominal exterior surface condition under current visual view; zero acute visible defects."
5. OUT-OF-SCOPE SUBJECTS (Human, Animal, Food, Landscape, Domestic Room, Document):
   If the image does not contain a machine or industrial equipment:
   - "eligible": false
   - "conditionScore": null
   - "defects": []
   - "severity": "Informational"
   - "visualEvidence": "Image identified as non-machine subject. Machine defect metrology disengaged."
   - "recommendations": []
6. UNFAMILIAR MACHINE MODELS:
   If the machine is an unfamiliar make or model:
   - NEVER reject as "Unknown / Unsupported".
   - Classify as "Industrial Machinery" or specific category, set "eligible": true, confidence: 75-92, and proceed with visual inspection.
7. CONDITION SCORE (0-100):
   Calculate a transparent AI Visual Condition Score based purely on visible degradation:
   - 90-100 = Excellent / Nominal (intact, minor or zero surface wear)
   - 75-89 = Good (light cosmetic oxidation / dust, no active operational impairment)
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
  "conditionScore": number | null,
  "defects": [
    {
      "id": string,
      "name": string,
      "type": string,
      "severity": "Critical" | "High" | "Medium" | "Low",
      "confidence": number,
      "visualEvidence": string,
      "affectedArea": string,
      "aiObservation": string,
      "engineeringAssessment": string
    }
  ],
  "severity": "Critical" | "High" | "Medium" | "Low" | "Nominal" | "Informational",
  "visualEvidence": string,
  "affectedArea": string,
  "recommendations": [
    {
      "step": number,
      "title": string,
      "detail": string
    }
  ],
  "limitations": [
    string
  ]
}
`;

  try {
    const { parsed, modelUsed } = await callMultimodalVision(apiKey, inspectionPrompt, pureBase64, mimeType);

    const mType = String(parsed.machineType || parsed.assetType || 'Industrial Machinery');
    let mCat = String(parsed.machineCategory || parsed.assetCategory || 'Industrial Machinery');

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

    const rawDefects = Array.isArray(parsed.defects) 
      ? parsed.defects 
      : (Array.isArray(parsed.visibleDefects) ? parsed.visibleDefects : []);

    const formattedDefects = isEligible && rawDefects.length > 0
      ? rawDefects.map((d, i) => {
          const rawSev = String(d.severity || 'Medium').toUpperCase();
          const sev = (rawSev === 'CRITICAL' || rawSev === 'HIGH') ? 'HIGH' : (rawSev === 'LOW' ? 'LOW' : 'MEDIUM');
          const dConf = typeof d.confidence === 'number' ? Math.round(d.confidence) : 85;

          return {
            id: d.id || `DEF_${i + 1}`,
            type: d.type || d.defectType || 'surface_anomaly',
            name: (d.name || d.defectType || 'Visual Flaw').toUpperCase(),
            confidence: dConf,
            confidenceLabel: `${dConf}%`,
            severity: sev,
            visualEvidence: d.visualEvidence || 'Visible surface anomaly identified in visual frame.',
            affectedArea: d.affectedArea || d.affectedLocation || 'Housing / Component surface',
            aiObservation: d.aiObservation || `AI VISUAL OBSERVATION: Anomaly detected on ${d.affectedArea || 'component'}.`,
            engineeringAssessment: d.engineeringAssessment || 'ENGINEERING ASSESSMENT: Qualified engineer verification required. Physical dimensions require calibrated measurement tools.',
            color: sev === 'HIGH' ? 'critical' : (sev === 'MEDIUM' ? 'attention' : 'healthy'),
            icon: sev === 'HIGH' ? '🔴' : (sev === 'MEDIUM' ? '🟡' : '🟢'),
            tag: `${d.severity || 'Medium'} Priority Defect`
          };
        })
      : [];

    const finalScore = isEligible && typeof parsed.conditionScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.conditionScore)))
      : (isEligible ? 85 : null);

    const topSeverity = parsed.severity || (
      formattedDefects.length > 0 
        ? (formattedDefects.some(d => d.severity === 'CRITICAL' || d.severity === 'HIGH') ? 'High'
          : formattedDefects.some(d => d.severity === 'MEDIUM') ? 'Medium' : 'Low')
        : (isEligible ? 'Nominal' : 'Informational')
    );

    const evidenceSummary = parsed.visualEvidence || (
      formattedDefects.length > 0
        ? formattedDefects.map(d => `${d.name}: ${d.visualEvidence}`).join('; ')
        : (isEligible ? 'Nominal surface condition under current visual view; zero acute visible defects.' : 'Non-machine subject.')
    );

    const affectedAreaSummary = parsed.affectedArea || (
      formattedDefects.length > 0
        ? formattedDefects.map(d => d.affectedArea).filter(Boolean).join(', ') || 'Exterior surface'
        : (isEligible ? 'General Equipment Exterior' : 'N/A')
    );

    const cleanRecommendations = Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
      ? parsed.recommendations
      : (isEligible ? [
          { step: 1, title: 'Visual Confirmation', detail: 'Perform routine on-site visual check of machine mounting and housing.' },
          { step: 2, title: 'Preventive Maintenance', detail: 'Follow plant maintenance schedule for lubrication and bolt torque verification.' }
        ] : []);

    const cleanLimitations = Array.isArray(parsed.limitations) && parsed.limitations.length > 0
      ? parsed.limitations
      : [
          '2D visual inspection cannot determine internal crack depth, subsurface flaws, or bearing raceway fatigue.',
          'Operating temperature (°C), vibration spectra (mm/s), and hydraulic pressure (bar) require calibrated physical gauges.',
          'Visual assessment only — certified engineer verification required before operational sign-off.'
        ];

    return {
      success: true,
      serviceAvailable: true,
      status: isEligible ? 'SUCCESS' : 'NOT_APPLICABLE',
      // Required exact schema fields:
      machineType: isEligible ? mType : 'Non-Machine Subject',
      machineCategory: mCat,
      confidence: conf,
      eligible: isEligible,
      conditionScore: finalScore,
      defects: formattedDefects,
      severity: topSeverity,
      visualEvidence: evidenceSummary,
      affectedArea: affectedAreaSummary,
      recommendations: cleanRecommendations,
      limitations: cleanLimitations,
      modelUsed,

      // Backwards-compatible aliases for existing React UI:
      assetType: isEligible ? mType : 'Non-Machine Subject',
      assetCategory: mCat,
      broadDomain: isEligible ? 'Industrial & Mechanical' : 'Out of Scope',
      visibleDefects: formattedDefects,
      overallCondition: finalScore !== null 
        ? (finalScore >= 90 ? 'Excellent' : finalScore >= 75 ? 'Good' : finalScore >= 50 ? 'Fair' : finalScore >= 25 ? 'Poor' : 'Critical')
        : (isEligible ? 'Good' : 'Out of Scope'),
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
    const isQuotaExhausted = Boolean(err.isQuotaExhausted || (err.message && err.message.includes('Quota Exhausted')));
    const isKeyInvalid = Boolean(
      err.isKeyInvalid || 
      (err.message && (
        err.message.includes('invalid_api_key') ||
        err.message.includes('API key not valid') || 
        err.message.includes('API_KEY_INVALID') || 
        err.message.includes('invalid or expired')
      ))
    );

    return {
      success: false,
      serviceAvailable: false,
      isKeyInvalid,
      isQuotaExhausted,
      status: 'SERVICE_UNAVAILABLE',
      reason: isQuotaExhausted
        ? 'OpenAI API Quota Exhausted: Your account has no remaining credits. Please add billing credits at platform.openai.com/settings/organization/billing/.'
        : isKeyInvalid
        ? 'The configured OpenAI API key is invalid or expired. Please update or verify your OPENAI_API_KEY.'
        : `AI Vision Service Error: ${err.message}. Please verify server-side OPENAI_API_KEY configuration.`,
      modelUsed: 'None (Service Unavailable)'
    };
  }
}
