/**
 * Google Gemini Multimodal Vision Diagnostic Service
 * Strictly adheres to the 14 asset categories and non-fabrication principles.
 */

import type { AssetCategory, DefectSeverity, VisualDefect } from './inspectionPipeline/types';

const STORAGE_KEY = 'gemini_api_key';

export function getGeminiApiKey(): string {
  try {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY)) ||
      localStorage.getItem(STORAGE_KEY) ||
      ''
    );
  } catch {
    return '';
  }
}

export function setGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch (err) {
    console.error('Failed to store API key in localStorage:', err);
  }
}

export function clearGeminiApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear API key:', err);
  }
}

export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, message: 'Please enter a valid Gemini API key.' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with only the word OK if you can read this.' }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `HTTP ${response.status}: API key verification failed.`;
      return { success: false, message: msg };
    }

    return { success: true, message: 'Gemini Vision API Key verified and active!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error connecting to Gemini API.' };
  }
}

export interface GeminiDiagnosticResult {
  isIndustrialAsset: boolean;
  inspectionEligible: boolean;
  detectedCategory: AssetCategory;
  detectedSubject: string;
  classificationConfidence: number;
  rejectionReason?: string;
  assetName: string;
  category: string;
  healthScore: number;
  status: 'HEALTHY' | 'ATTENTION' | 'AT RISK' | 'CRITICAL' | 'NON_ASSET' | 'MANUAL_VERIFICATION_REQUIRED';
  diagnosticSummary: string;
  aiObservation: string;
  engineeringAssessment: string;
  defects: VisualDefect[];
  recommendations: {
    step: number;
    title: string;
    detail: string;
  }[];
  modelUsed: string;
  analysisTimestamp: string;
}

export async function analyzeAssetWithGemini(
  apiKey: string,
  base64Data: string,
  mimeType: string,
  userNotes: string = ''
): Promise<GeminiDiagnosticResult> {
  const cleanKey = apiKey.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;

  // Clean base64 string if it has data URL prefix
  const pureBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

  const systemPrompt = `
You are a Rigorous Vision-Based AI Asset Inspection Assistant.

YOUR CORE MANDATE: NEVER INVENT FINDINGS, DEFECTS, OR PHYSICAL MEASUREMENTS THAT ARE NOT VISIBLE IN THE IMAGE.

STEP 1: ASSET CLASSIFICATION
Classify the uploaded image into EXACTLY ONE of the following 14 categories:
- Road
- Bridge
- Building
- Industrial Machinery
- Electrical Pole
- Pipeline
- Solar Panel
- Railway Infrastructure
- Vehicle / Equipment
- Person / Human
- Animal
- Indoor Room
- Landscape
- Unknown / Unsupported

Assign a confidence score (0 to 100) for this classification.

STEP 2: INSPECTION ELIGIBILITY CHECK
If the image belongs to:
"Person / Human", "Animal", "Indoor Room", "Landscape", or "Unknown / Unsupported", OR classification confidence < 70:
- Set "inspectionEligible": false
- Set "isIndustrialAsset": false
- Set "status": "NON_ASSET"
- Set "healthScore": 0
- Set "rejectionReason": "The uploaded image does not appear to contain a supported inspectable asset. Structural infrastructure defects cannot be reliably assessed from this image."
- Set "defects": [] (MUST BE STRICTLY EMPTY ARRAY. DO NOT GENERATE CRACKS, CORROSION, OR REPAIRS FOR A PERSON, ANIMAL, ROOM, OR LANDSCAPE!)
- Set "aiObservation": "Image content identified as [Category]. Structural inspection is not applicable."
- Set "engineeringAssessment": "No engineering defect assessment conducted."

STEP 3: VISUAL DEFECT DETECTION (ONLY IF ELIGIBLE)
If and only if the image is an inspectable asset:
Inspect ONLY for defects that have CLEAR VISUAL EVIDENCE in the image:
- Surface crack, pothole, concrete spalling, corrosion/rust, paint/coating deterioration, surface damage, visible deformation, oil/fluid leakage.
- IF NO VISUAL DEFECT EXISTS: return "defects": [] and indicate "No visible defect detected."

CRITICAL RULE ON MEASUREMENTS:
NEVER fabricate exact physical measurements (NO crack width in mm, NO depth in mm, NO UTM values, NO temperature, NO vibration, NO safety factors).
Instead, provide descriptive visual evidence and state: "Physical dimensions require calibrated measurement equipment or a reference scale."

STEP 4: DISTINGUISH OBSERVATION FROM ASSESSMENT
For each finding, provide:
- "aiObservation": Visual features observed (e.g. "Continuous dark linear fissure pattern across the concrete beam.")
- "engineeringAssessment": Conservative guidance (e.g. "Potential structural concern detected — professional engineering assessment recommended.")

User notes/context: "${userNotes || 'Standard visual inspection'}"

You must respond ONLY with a valid JSON object matching this schema:
{
  "detectedCategory": "One of the 14 categories",
  "classificationConfidence": 92,
  "inspectionEligible": true,
  "isIndustrialAsset": true,
  "detectedSubject": "Specific subject, e.g. Concrete Highway Bridge Pier",
  "assetName": "Descriptive name based on image",
  "rejectionReason": "",
  "status": "HEALTHY" | "ATTENTION" | "AT RISK" | "CRITICAL" | "NON_ASSET",
  "healthScore": 75,
  "diagnosticSummary": "Clear 2-sentence summary based strictly on visual evidence.",
  "aiObservation": "Clear AI visual observation statement.",
  "engineeringAssessment": "Conservative engineering assessment statement.",
  "defects": [
    {
      "id": "DEFECT_1",
      "type": "surface_crack",
      "name": "SURFACE CRACK",
      "confidence": 91,
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "visualEvidence": "Visible linear surface discontinuity observed on concrete area. Physical crack dimensions require calibrated measurement equipment or a reference scale.",
      "aiObservation": "AI VISUAL OBSERVATION: Continuous fissure observed on load-bearing concrete.",
      "engineeringAssessment": "ENGINEERING ASSESSMENT: Potential structural concern detected — professional engineering assessment recommended."
    }
  ],
  "recommendations": [
    {
      "step": 1,
      "title": "Review the detected area manually",
      "detail": "Inspect flagged surface region on-site."
    },
    {
      "step": 2,
      "title": "Capture additional close-up images",
      "detail": "Record high-resolution macro perspectives."
    },
    {
      "step": 3,
      "title": "Perform calibrated measurement if dimensions are required",
      "detail": "Deploy certified measurement tools rather than relying on uncalibrated estimates."
    },
    {
      "step": 4,
      "title": "Have a qualified inspector/engineer assess the defect",
      "detail": "A certified engineer must evaluate structural impact."
    },
    {
      "step": 5,
      "title": "Schedule repair based on the verified inspection result",
      "detail": "Determine maintenance priority based on verified on-site inspection."
    }
  ]
}
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
              data: pureBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 2048
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini Vision API error (HTTP ${response.status})`);
  }

  const resultData = await response.json();
  const textOutput = resultData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Extract JSON from potential code block wrapping
  const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Gemini model response was not valid JSON.');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const isEligible = Boolean(parsed.inspectionEligible && parsed.isIndustrialAsset !== false);
  const cat: AssetCategory = parsed.detectedCategory || 'Unknown / Unsupported';

  const sanitizedDefects: VisualDefect[] = isEligible && Array.isArray(parsed.defects)
    ? parsed.defects.map((d: any, idx: number) => {
        const sev: DefectSeverity = d.severity === 'HIGH' ? 'HIGH' : (d.severity === 'LOW' ? 'LOW' : 'MEDIUM');
        return {
          id: d.id || `DEFECT_${idx + 1}`,
          type: d.type || 'surface_anomaly',
          name: (d.name || 'Visual Defect').toUpperCase(),
          confidence: typeof d.confidence === 'number' ? d.confidence : 85,
          confidenceLabel: typeof d.confidence === 'number' ? `${d.confidence}%` : 'Model confidence unavailable',
          severity: sev,
          visualEvidence: d.visualEvidence || 'Visible surface discontinuity evident in image.',
          aiObservation: d.aiObservation || `AI VISUAL OBSERVATION: Discontinuity detected.`,
          engineeringAssessment: d.engineeringAssessment || `ENGINEERING ASSESSMENT: Verification by a qualified inspector recommended. Physical dimensions require calibrated measurement equipment or a reference scale.`,
          color: sev === 'HIGH' ? 'critical' : (sev === 'MEDIUM' ? 'attention' : 'healthy'),
          icon: sev === 'HIGH' ? '🔴' : (sev === 'MEDIUM' ? '🟡' : '🟢'),
          tag: `${sev} Priority Defect`
        };
      })
    : [];

  return {
    isIndustrialAsset: isEligible,
    inspectionEligible: isEligible,
    detectedCategory: cat,
    detectedSubject: parsed.detectedSubject || parsed.assetName || cat,
    classificationConfidence: typeof parsed.classificationConfidence === 'number' ? parsed.classificationConfidence : 80,
    rejectionReason: parsed.rejectionReason || (isEligible ? '' : 'Structural infrastructure defects cannot be reliably assessed from this image.'),
    assetName: parsed.assetName || `${cat} Asset`,
    category: cat,
    healthScore: isEligible ? (typeof parsed.healthScore === 'number' ? parsed.healthScore : 75) : 0,
    status: isEligible ? (parsed.status || 'ATTENTION') : 'NON_ASSET',
    diagnosticSummary: parsed.diagnosticSummary || (isEligible ? 'Visual AI analysis completed.' : 'Inspection not applicable to this image.'),
    aiObservation: parsed.aiObservation || 'AI visual assessment complete.',
    engineeringAssessment: parsed.engineeringAssessment || 'On-site verification recommended.',
    defects: sanitizedDefects,
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    modelUsed: 'Google Gemini 1.5 Flash Vision (Evidence-Based Mode)',
    analysisTimestamp: new Date().toISOString()
  };
}
