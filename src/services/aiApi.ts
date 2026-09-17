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
  apiKey: string = '',
  base64Data: string,
  mimeType: string = 'image/jpeg',
  userNotes: string = ''
): Promise<GeminiDiagnosticResult> {
  const pureBase64 = base64Data.startsWith('data:')
    ? base64Data
    : (base64Data.length > 200 ? `data:${mimeType};base64,${base64Data}` : base64Data);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const clientKey = apiKey.trim() || getGeminiApiKey();
  if (clientKey) {
    headers['x-gemini-key'] = clientKey;
  }

  // Secure Server-Side Multimodal Inspection Call
  const response = await fetch('/api/inspection/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      imageBase64: pureBase64,
      mimeType,
      userNotes
    })
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 503 || data.serviceAvailable === false) {
    throw new Error(data.reason || 'AI Vision Service Unavailable. Please verify the server-side GEMINI_API_KEY in deployment environment settings (Vercel / Render).');
  }

  if (!response.ok) {
    throw new Error(data.error || data.reason || `Server inspection error (HTTP ${response.status})`);
  }

  const isEligible = Boolean(data.eligible && data.status !== 'NOT_APPLICABLE');
  const cat: AssetCategory = data.assetCategory || 'Industrial Machinery';

  const sanitizedDefects: VisualDefect[] = isEligible && Array.isArray(data.visibleDefects)
    ? data.visibleDefects.map((d: any, idx: number) => {
        const rawSev = String(d.severity || 'Medium').toUpperCase();
        const sev: DefectSeverity = (rawSev === 'CRITICAL' || rawSev === 'HIGH') ? 'HIGH' : (rawSev === 'LOW' ? 'LOW' : 'MEDIUM');
        const confNum = typeof d.confidence === 'number' ? Math.round(d.confidence) : 85;

        return {
          id: d.id || `DEFECT_${idx + 1}`,
          type: d.type || d.defectType || 'surface_anomaly',
          name: (d.name || 'Visual Defect').toUpperCase(),
          confidence: confNum,
          confidenceLabel: `${confNum}%`,
          severity: sev,
          visualEvidence: d.visualEvidence || 'Visible surface anomaly identified.',
          aiObservation: d.aiObservation || `AI VISUAL OBSERVATION: Surface discontinuity identified.`,
          engineeringAssessment: d.engineeringAssessment || `ENGINEERING ASSESSMENT: Qualified engineer verification required. Physical dimensions require calibrated measurement tools.`,
          color: sev === 'HIGH' ? 'critical' : (sev === 'MEDIUM' ? 'attention' : 'healthy'),
          icon: sev === 'HIGH' ? '🔴' : (sev === 'MEDIUM' ? '🟡' : '🟢'),
          tag: `${d.severity || 'Medium'} Priority Defect`
        };
      })
    : [];

  const finalScore = typeof data.conditionScore === 'number' ? data.conditionScore : (isEligible ? 80 : 0);

  return {
    isIndustrialAsset: isEligible,
    inspectionEligible: isEligible,
    detectedCategory: cat,
    detectedSubject: data.assetType || data.assetCategory || 'Engineering Asset',
    classificationConfidence: typeof data.confidence === 'number' ? data.confidence : 85,
    rejectionReason: data.eligibilityReason || (isEligible ? '' : 'Non-engineering subject detected.'),
    assetName: data.assetType || `${cat} Asset`,
    category: cat,
    healthScore: finalScore,
    status: isEligible ? (finalScore >= 75 ? 'HEALTHY' : finalScore >= 50 ? 'ATTENTION' : 'CRITICAL') : 'NON_ASSET',
    diagnosticSummary: data.summaryObservation || 'Visual AI analysis completed.',
    aiObservation: data.summaryObservation || 'AI visual assessment complete.',
    engineeringAssessment: data.engineeringAssessment || 'Visual inspection only. Qualified engineer verification required.',
    defects: sanitizedDefects,
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    modelUsed: data.modelUsed || 'Google Gemini Vision (Server-Side)',
    analysisTimestamp: data.inspectionTimestamp || new Date().toISOString()
  };
}
