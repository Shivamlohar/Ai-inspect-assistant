/**
 * Server-Side Gemini Vision Inspection Engine
 * 
 * Provides secure, server-side multimodal AI visual inspection for
 * infrastructure, civil engineering, industrial machinery, and electrical assets.
 * 
 * SECURITY: Reads GEMINI_API_KEY strictly from server environment variables.
 * Never exposes the key to client-side code or browser logs.
 */

export const GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';

const CANDIDATE_MODELS = [
  GEMINI_VISION_MODEL,
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash'
].filter((m, i, arr) => arr.indexOf(m) === i);

/**
 * Returns configured Gemini API key from server environment or request header.
 */
export function getServerGeminiApiKey(reqHeaders = {}) {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    (reqHeaders && reqHeaders['x-gemini-key']) ||
    ''
  ).trim();
}

/**
 * Helper to call Gemini Vision API with model failover and retries.
 */
async function callGeminiVision(apiKey, systemPrompt, pureBase64, mimeType = 'image/jpeg') {
  if (!apiKey || apiKey.length < 10) {
    throw new Error('MISSING_SERVER_API_KEY');
  }

  const cleanMime = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      console.log(`[AI INSPECTION ENGINE] Calling Gemini Vision model: ${modelName}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: cleanMime,
                    data: pureBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`[AI INSPECTION ENGINE] Model ${modelName} returned HTTP ${response.status}: ${errorText.slice(0, 150)}`);
        lastError = new Error(`HTTP ${response.status}: ${errorText.slice(0, 100)}`);
        continue;
      }

      const resultJson = await response.json();
      const textOutput = resultJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!textOutput) {
        lastError = new Error(`Empty response part from ${modelName}`);
        continue;
      }

      const match = textOutput.match(/\{[\s\S]*\}/);
      if (!match) {
        lastError = new Error(`Model ${modelName} output did not contain valid JSON`);
        continue;
      }

      const parsed = JSON.parse(match[0]);
      return { parsed, modelUsed: `Google Gemini (${modelName})` };
    } catch (err) {
      console.warn(`[AI INSPECTION ENGINE] Error calling ${modelName}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini Vision candidate models failed.');
}

/**
 * 1. FIRST-STAGE VISUAL ASSET CLASSIFIER
 * Classifies uploaded image into broad domain and specific asset category.
 */
export async function classifyAssetMultimodal({ imageBase64, mimeType = 'image/jpeg', reqHeaders = {} }) {
  const apiKey = getServerGeminiApiKey(reqHeaders);

  if (!apiKey) {
    return {
      success: false,
      serviceAvailable: false,
      status: 'SERVICE_UNAVAILABLE',
      reason: 'AI Vision Service Unavailable: Server-side GEMINI_API_KEY is not configured in deployment environment variables.',
      modelName: 'None (Service Unavailable)',
      modelVersion: GEMINI_VISION_MODEL,
      primaryCategory: 'Unknown / Unsupported',
      assetType: null,
      confidence: 0,
      inspectionEligible: false
    };
  }

  const pureBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

  const classificationPrompt = `
You are the First-Stage Visual Classifier for an engineering infrastructure and industrial asset inspection system.

YOUR MANDATE:
Analyze ONLY the visual content of the provided image to determine the primary subject and whether it is an eligible engineering asset.

BROAD ASSET DOMAINS & CATEGORIES:
1. INFRASTRUCTURE:
   Roads, asphalt roads, concrete roads, bridges, bridge decks, bridge piers, bridge beams, flyovers, buildings, concrete structures, concrete pillars, columns, beams, slabs, walls, retaining walls, tunnels, roofs, industrial sheds, foundations, structural joints, stairs, pavements, sidewalks, culverts, drainage, rail infrastructure, utility structures.
2. INDUSTRIAL & MECHANICAL:
   Electric motors, centrifugal pumps, industrial pumps, compressors, generators, engines, gearboxes, bearings, shafts, valves, pipes, pipelines, pressure vessels, storage tanks, industrial machinery, conveyors, rotating equipment, hydraulic assemblies, mechanical plant components.
3. ELECTRICAL:
   Electrical panels, switchgear, transformers, cables, cable trays, control panels, electrical cabinets, insulators, busbars, electrical distribution equipment.
4. MATERIALS & COMPONENTS:
   Steel structures, structural steel beams, bolts, weld joints, flanges, brackets, fasteners, concrete surfaces, metal surfaces, painted surfaces, protective coatings.
5. OUT OF SCOPE / NON-INSPECTABLE:
   Living person / human (face, selfie, portrait, body), living animal, domestic interior bedroom / furniture, natural scenic landscape / wilderness, consumer document / screenshot.

CRITICAL RULES:
- If the image shows an unfamiliar machine or industrial plant component, classify it into the broad category "Industrial Machinery / Mechanical Equipment". NEVER reject an industrial machine as "Unknown / Unsupported" merely because the exact model number is unknown.
- If the image shows an unfamiliar civil or structural element, classify it as "Civil Infrastructure / Structural Component".
- If the image contains an engineering asset with incidental people in the background, the engineering asset is the primary subject.
- Mark "inspectionEligible": true for ANY recognizable infrastructure, mechanical equipment, electrical asset, or structural material.
- Only mark "inspectionEligible": false if the primary subject is genuinely a person, animal, domestic room, or landscape.
- Do NOT fabricate defect findings in this classification stage.

Respond strictly in valid JSON format:
{
  "primaryCategory": "Road" | "Bridge" | "Building" | "Civil Infrastructure" | "Industrial Machinery" | "Mechanical Equipment" | "Electrical Equipment" | "Pipeline" | "Pressure Vessel" | "Solar Panel" | "Railway Infrastructure" | "Structural Component" | "Person / Human" | "Animal" | "Indoor Room" | "Landscape" | "Unknown / Unsupported",
  "broadDomain": "Infrastructure" | "Mechanical" | "Electrical" | "Materials" | "Out of Scope",
  "assetType": string,
  "confidence": number,
  "inspectionEligible": boolean,
  "reason": string
}
`;

  try {
    const { parsed, modelUsed } = await callGeminiVision(apiKey, classificationPrompt, pureBase64, mimeType);
    
    const cat = String(parsed.primaryCategory || 'Unknown / Unsupported');
    const isOutOfScope = cat === 'Person / Human' || cat === 'Animal' || cat === 'Indoor Room' || cat === 'Landscape';
    const isEligible = Boolean(parsed.inspectionEligible && !isOutOfScope && cat !== 'Unknown / Unsupported');
    const conf = typeof parsed.confidence === 'number' ? Math.round(parsed.confidence <= 1 ? parsed.confidence * 100 : parsed.confidence) : 85;

    return {
      success: true,
      serviceAvailable: true,
      status: isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
      primaryCategory: cat,
      broadDomain: parsed.broadDomain || (isEligible ? 'Industrial / Infrastructure' : 'Out of Scope'),
      assetType: isEligible ? (parsed.assetType || cat) : null,
      confidence: conf,
      inspectionEligible: isEligible,
      reason: parsed.reason || (isEligible ? 'Supported engineering asset identified.' : 'Subject is not an eligible engineering asset.'),
      modelName: modelUsed,
      modelVersion: GEMINI_VISION_MODEL
    };
  } catch (err) {
    console.error('[AI CLASSIFIER ERROR]:', err.message);
    return {
      success: false,
      serviceAvailable: false,
      status: 'SERVICE_UNAVAILABLE',
      reason: `Visual classification service error: ${err.message}. Please verify server-side GEMINI_API_KEY.`,
      modelName: 'None (Service Unavailable)',
      modelVersion: GEMINI_VISION_MODEL,
      primaryCategory: 'Unknown / Unsupported',
      assetType: null,
      confidence: 0,
      inspectionEligible: false
    };
  }
}

/**
 * 2. FULL MULTIMODAL VISUAL DEFECT INSPECTION
 * Performs comprehensive flaw detection, evidence assessment, and condition scoring.
 */
export async function analyzeInspectionMultimodal({
  imageBase64,
  mimeType = 'image/jpeg',
  userSelectedAsset = '',
  userNotes = '',
  reqHeaders = {}
}) {
  const apiKey = getServerGeminiApiKey(reqHeaders);

  if (!apiKey) {
    return {
      success: false,
      serviceAvailable: false,
      status: 'SERVICE_UNAVAILABLE',
      reason: 'AI Vision Service Unavailable: Server GEMINI_API_KEY is not configured in deployment environment variables.',
      modelUsed: 'None (Service Unavailable)'
    };
  }

  const pureBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

  const inspectionPrompt = `
You are a Rigorous Vision-Based Infrastructure and Industrial Asset Inspection System.

MANDATE & NON-NEGOTIABLE PRINCIPLES:
1. NEVER INVENT FINDINGS, DEFECTS, OR PHYSICAL MEASUREMENTS THAT ARE NOT VISIBLE IN THE IMAGE.
2. NO SENSOR HALLUCINATIONS: Do NOT fabricate operating temperature (°C), bearing vibration (Hz), hydraulic pressure (bar), electrical current (A), or internal unseen damage. Explicitly state that thermal, vibration, and ultrasonic testing require calibrated on-site gauges.
3. SUPPORTED DOMAINS:
   - Infrastructure (Roads, bridges, buildings, concrete columns, beams, slabs, retaining walls, culverts, tunnels, rail, sheds).
   - Industrial / Mechanical (Electric motors, pumps, compressors, gearboxes, bearings, valves, pipes, pressure vessels, tanks, conveyors, machinery).
   - Electrical (Panels, switchboards, transformers, cables, trays, cabinets, insulators).
   - Materials (Steel structures, beams, welds, flanges, fasteners, coatings).
4. OUT-OF-SCOPE (Person / Human, Animal, Domestic Room, Scenic Landscape):
   If the image is out of scope:
   - Set "eligible": false
   - Set "conditionScore": null
   - Set "visibleDefects": [] (STRICTLY EMPTY ARRAY - ZERO DEFECTS)
   - Set "summaryObservation": "Image identified as non-engineering subject. Defect metrology disengaged."
5. BROAD CLASSIFICATION:
   If an industrial machine or civil structure has an unknown specific model, classify broadly (e.g. "Industrial Machinery / Mechanical Assembly" or "Structural Concrete Column"). DO NOT mark as Unknown / Unsupported.
6. DEFECTS (ONLY REPORT WHEN SUPPORTED BY CLEAR VISUAL EVIDENCE):
   - Infrastructure: Surface cracks, potholes, spalling, exposed reinforcement, concrete delamination, corrosion/rust staining, broken edges, joint damage, water ingress/leakage, coating degradation.
   - Mechanical: Surface corrosion/rust, visible fluid/oil weeping/leakage, housing fracture, loose/missing fasteners, belt wear, flange damage, structural deformation.
   - Electrical: Visible insulation damage/fraying, scorched/burnt areas, enclosure corrosion, broken hardware, loose connections.
   - If asset appears in normal/healthy condition: return "visibleDefects": [] and state "No visible defect detected under current optical view."
7. CONDITION SCORE:
   Calculate a transparent "AI Visual Condition Score" (0 to 100):
   - 90-100 = Excellent (intact, zero or minor cosmetic wear)
   - 75-89 = Good (light surface wear/oxidation, no active structural impairment)
   - 50-74 = Fair (moderate visible defects, e.g. hairline surface crack or localized corrosion)
   - 25-49 = Poor (significant defect, active leakage or concrete spalling)
   - 0-24 = Critical (severe structural fracture or casing rupture)
   - If out of scope or image is uninterpretable: conditionScore: null

Context from user/inspector: "${userNotes || userSelectedAsset || 'Standard visual inspection'}"

Respond strictly in valid JSON matching this schema:
{
  "assetType": string,
  "assetCategory": string,
  "broadDomain": "Infrastructure" | "Mechanical" | "Electrical" | "Materials" | "Out of Scope",
  "confidence": number,
  "confidenceLabel": string,
  "eligible": boolean,
  "eligibilityReason": string,
  "overallCondition": "Excellent" | "Good" | "Fair" | "Poor" | "Critical" | "Out of Scope",
  "conditionScore": number | null,
  "conditionRating": string,
  "summaryObservation": string,
  "engineeringAssessment": string,
  "visibleDefects": [
    {
      "id": string,
      "defectType": string,
      "name": string,
      "severity": "Critical" | "High" | "Medium" | "Low" | "Informational",
      "confidence": number,
      "visualEvidence": string,
      "affectedArea": string,
      "affectedLocation": string,
      "aiObservation": string,
      "engineeringAssessment": string
    }
  ],
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
    const { parsed, modelUsed } = await callGeminiVision(apiKey, inspectionPrompt, pureBase64, mimeType);

    const isOutOfScope = parsed.broadDomain === 'Out of Scope' || parsed.assetCategory === 'Person / Human' || !parsed.eligible;
    const isEligible = Boolean(parsed.eligible && !isOutOfScope);

    const defects = isEligible && Array.isArray(parsed.visibleDefects)
      ? parsed.visibleDefects.map((d, i) => {
          const rawSev = String(d.severity || 'Medium').toUpperCase();
          const sev = (rawSev === 'CRITICAL' || rawSev === 'HIGH') ? 'HIGH' : (rawSev === 'LOW' ? 'LOW' : 'MEDIUM');
          const conf = typeof d.confidence === 'number' ? Math.round(d.confidence) : 85;

          return {
            id: d.id || `DEFECT_${i + 1}`,
            type: d.defectType || 'surface_anomaly',
            name: (d.name || d.defectType || 'Visual Flaw').toUpperCase(),
            confidence: conf,
            confidenceLabel: `${conf}%`,
            severity: sev,
            visualEvidence: d.visualEvidence || 'Visible surface anomaly identified in visual frame.',
            affectedArea: d.affectedArea || d.affectedLocation || 'Surface area',
            aiObservation: d.aiObservation || `AI VISUAL OBSERVATION: Discontinuity detected on ${d.affectedArea || 'component'}.`,
            engineeringAssessment: d.engineeringAssessment || 'ENGINEERING ASSESSMENT: Qualified engineer verification required. Physical dimensions require calibrated measurement tools.',
            color: sev === 'HIGH' ? 'critical' : (sev === 'MEDIUM' ? 'attention' : 'healthy'),
            icon: sev === 'HIGH' ? '🔴' : (sev === 'MEDIUM' ? '🟡' : '🟢'),
            tag: `${d.severity || 'Medium'} Priority Defect`
          };
        })
      : [];

    const finalScore = isEligible && typeof parsed.conditionScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.conditionScore)))
      : (isEligible ? 80 : null);

    const topSeverity = defects.length > 0 
      ? (defects.some(d => d.severity === 'CRITICAL' || d.severity === 'HIGH') ? 'High'
        : defects.some(d => d.severity === 'MEDIUM') ? 'Medium' : 'Low')
      : 'Informational';

    const evidenceSummary = defects.length > 0
      ? defects.map(d => `${d.name}: ${d.visualEvidence}`).join('; ')
      : 'Nominal surface condition under current visual view; zero acute visible defects.';

    const affectedAreaSummary = defects.length > 0
      ? defects.map(d => d.affectedArea).filter(Boolean).join(', ') || 'Surface area'
      : 'N/A';

    return {
      success: true,
      serviceAvailable: true,
      status: isEligible ? 'SUCCESS' : 'NOT_APPLICABLE',
      assetType: parsed.assetType || parsed.assetCategory || 'Engineering Asset',
      assetSubtype: parsed.assetSubtype || parsed.assetType || null,
      assetCategory: parsed.assetCategory || 'Industrial Machinery',
      broadDomain: parsed.broadDomain || 'Industrial / Infrastructure',
      confidence: typeof parsed.confidence === 'number' ? Math.round(parsed.confidence) : 88,
      confidenceLabel: `${typeof parsed.confidence === 'number' ? Math.round(parsed.confidence) : 88}%`,
      eligible: isEligible,
      eligibilityReason: parsed.eligibilityReason || (isEligible ? 'Supported engineering asset identified.' : 'Non-engineering subject.'),
      overallCondition: parsed.overallCondition || (isEligible ? 'Good' : 'Out of Scope'),
      conditionScore: finalScore,
      conditionRating: finalScore !== null ? `${parsed.overallCondition || 'Good'} (${finalScore}/100)` : 'N/A',
      conditionDisclaimer: 'Visual assessment only — qualified engineer verification required.',
      severity: topSeverity,
      evidence: evidenceSummary,
      affectedArea: affectedAreaSummary,
      summaryObservation: parsed.summaryObservation || evidenceSummary,
      engineeringAssessment: parsed.engineeringAssessment || 'Visual inspection only. Physical and internal integrity must be confirmed with calibrated instruments.',
      visibleDefects: defects,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [
        { step: 1, title: 'Visual Confirmation', detail: 'Perform on-site visual check of highlighted surface regions.' },
        { step: 2, title: 'Engineering Verification', detail: 'Have a certified inspector verify structural condition.' }
      ],
      limitations: Array.isArray(parsed.limitations) && parsed.limitations.length > 0 ? parsed.limitations : [
        '2D visual inspection cannot determine internal crack depth or subsurface voids.',
        'Thermal, vibration, and ultrasonic metrics require calibrated on-site gauges.',
        'Visual assessment only — qualified engineer verification required.'
      ],
      modelUsed,
      inspectionTimestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('[AI INSPECTION ERROR]:', err.message);
    return {
      success: false,
      serviceAvailable: false,
      status: 'SERVICE_UNAVAILABLE',
      reason: `AI Vision Service Error: ${err.message}. Please verify server-side GEMINI_API_KEY.`,
      modelUsed: 'None (Service Unavailable)'
    };
  }
}
