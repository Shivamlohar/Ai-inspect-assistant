/**
 * Google Gemini Multimodal Vision Diagnostic Service
 * Enables live asset defect detection, quantitative metrology, and safety factor evaluation.
 */

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

export interface GeminiDefectItem {
  id: string;
  name: string;
  severity: string;
  confidenceVal: number;
  conf: string;
  color: 'critical' | 'attention' | 'healthy';
  icon: string;
  tag: string;
  metricText: string;
  measurements: {
    length?: string;
    width?: string;
    depth?: string;
    propagation?: string;
    area?: string;
    pitting?: string;
    isoGrade?: string;
    clearance?: string;
    tolerance?: string;
    deviation?: string;
  };
}

export interface GeminiDiagnosticResult {
  assetName: string;
  category: string;
  healthScore: number;
  status: 'HEALTHY' | 'ATTENTION' | 'AT RISK' | 'CRITICAL';
  safetyFactor: string;
  safetyBreached: boolean;
  diagnosticSummary: string;
  defects: GeminiDefectItem[];
  recommendations: {
    icon: string;
    title: string;
    sub: string;
  }[];
  modelUsed: string;
  analysisTimestamp: string;
}

export async function analyzeAssetWithGemini(
  apiKey: string,
  base64Data: string,
  mimeType: string,
  userNotes: string
): Promise<GeminiDiagnosticResult> {
  const cleanKey = apiKey.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;

  // Clean base64 string if it has data URL prefix
  const pureBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

  const systemPrompt = `
You are an ASME & ISO 9001 Senior Asset Integrity & Diagnostic Engineer.
Carefully inspect this asset image for any physical defects (such as cracks, fractures, surface oxidation/rust, erosion, fatigue wear, deformation, spalling, or tolerance breaches).

User inspector notes: "${userNotes || 'Routine visual asset diagnostic'}"

You must respond ONLY with a valid, raw JSON object (no markdown formatting, no \`\`\`json code fences, no extra text).
JSON schema to strictly follow:
{
  "assetName": "Brief name identifying the asset, e.g. Industrial Machine Rotor Hub or Bridge Pier #102",
  "category": "Asset category, e.g. Industrial Machinery, Civil Infrastructure, Electrical Power Equipment",
  "healthScore": 58,
  "status": "AT RISK",
  "safetyFactor": "1.15",
  "safetyBreached": true,
  "diagnosticSummary": "A clear, precise, 2-3 sentence root cause diagnosis describing visible defects and structural risk.",
  "defects": [
    {
      "id": "CRACK",
      "name": "Defect Title (e.g. Outer Rim Fracture)",
      "severity": "High Severity",
      "confidenceVal": 96,
      "conf": "96% Confidence",
      "color": "critical",
      "icon": "🔴",
      "tag": "Critical Defect",
      "metricText": "Length: 14.2 mm • Width: 1.4 mm • Depth: 2.8 mm",
      "measurements": {
        "length": "14.2 mm",
        "width": "1.4 mm",
        "depth": "2.8 mm",
        "propagation": "+0.4 mm / 100 operating hours"
      }
    },
    {
      "id": "RUST",
      "name": "Defect Title (e.g. Surface Rust & Oxidation)",
      "severity": "Medium Severity",
      "confidenceVal": 89,
      "conf": "89% Confidence",
      "color": "attention",
      "icon": "🟡",
      "tag": "Attention Needed",
      "metricText": "Area: 18.4% (84.6 cm²) • Pitting: 0.65 mm",
      "measurements": {
        "area": "18.4% Surface Coverage",
        "pitting": "0.65 mm Depth",
        "isoGrade": "ISO 8501-1 Grade C Degradation"
      }
    },
    {
      "id": "WEAR",
      "name": "Defect Title (e.g. Center Bore Spline Wear)",
      "severity": "Low Severity",
      "confidenceVal": 84,
      "conf": "84% Confidence",
      "color": "healthy",
      "icon": "🟢",
      "tag": "Monitor",
      "metricText": "Radial Wear: +0.045 mm (Tolerance: ±0.015 mm)",
      "measurements": {
        "clearance": "+0.045 mm Radial Clearance",
        "tolerance": "ISO ±0.015 mm Spec",
        "deviation": "+0.030 mm Breach"
      }
    }
  ],
  "recommendations": [
    {
      "icon": "🔴",
      "title": "Immediate Action",
      "sub": "Clear risk explanation and mandatory engineering protocol"
    },
    {
      "icon": "🟡",
      "title": "Maintenance Action",
      "sub": "Preventative surface treatment or stabilization"
    },
    {
      "icon": "🟢",
      "title": "Calibration & Monitoring",
      "sub": "Next scheduled tolerance inspection"
    }
  ]
}

If the image shows no critical defect, set healthScore appropriately higher (80-95), status to HEALTHY or ATTENTION, safetyFactor to >= 1.50, and safetyBreached to false.
Ensure color is exactly one of: "critical" | "attention" | "healthy".
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
      temperature: 0.2,
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

  return {
    assetName: parsed.assetName || 'Inspected Asset Component',
    category: parsed.category || 'Industrial Component',
    healthScore: typeof parsed.healthScore === 'number' ? parsed.healthScore : 65,
    status: parsed.status || 'ATTENTION',
    safetyFactor: parsed.safetyFactor || '1.25',
    safetyBreached: Boolean(parsed.safetyBreached),
    diagnosticSummary: parsed.diagnosticSummary || 'Visual AI analysis completed.',
    defects: Array.isArray(parsed.defects) ? parsed.defects : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    modelUsed: 'Google Gemini 1.5 Flash Vision (Live Neural Diagnostic)',
    analysisTimestamp: new Date().toISOString()
  };
}
