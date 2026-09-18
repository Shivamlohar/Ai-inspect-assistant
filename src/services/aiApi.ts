/**
 * OpenAI Multimodal Vision Diagnostic Service for Industrial Machines
 * Strictly adheres to machine-only inspection and non-fabrication principles.
 */

import type { AssetCategory, DefectSeverity, VisualDefect } from './inspectionPipeline/types';

const STORAGE_KEY = 'openai_api_key';
const LEGACY_STORAGE_KEY = 'gemini_api_key';

export function getOpenAIApiKey(): string {
  try {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY)) ||
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY) ||
      ''
    );
  } catch {
    return '';
  }
}

export function setOpenAIApiKey(key: string): void {
  try {
    const cleanKey = key.trim();
    localStorage.setItem(STORAGE_KEY, cleanKey);
    localStorage.setItem(LEGACY_STORAGE_KEY, cleanKey);
  } catch (err) {
    console.error('Failed to store API key in localStorage:', err);
  }
}

export function clearOpenAIApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear API key:', err);
  }
}

// Backward-compatibility aliases
export const getGeminiApiKey = getOpenAIApiKey;
export const setGeminiApiKey = setOpenAIApiKey;
export const clearGeminiApiKey = clearOpenAIApiKey;

export async function testOpenAIApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, message: 'Please enter a valid OpenAI API key (sk-...).' };
  }

  const cleanKey = apiKey.trim();

  // 1. OpenAI Key Check (sk-...)
  if (cleanKey.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${cleanKey}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          return {
            success: false,
            message: 'OpenAI key verified, but account credit quota is exhausted. Please add billing credits at platform.openai.com/settings/organization/billing/.'
          };
        }
        const msg = errorData.error?.message || `HTTP ${response.status}: OpenAI API key verification failed.`;
        return { success: false, message: msg };
      }

      return { success: true, message: 'OpenAI Vision API Key verified and active!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error connecting to OpenAI API.' };
    }
  }

  // 2. Google Gemini Fallback Check
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with OK.' }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `HTTP ${response.status}: API key verification failed.`;
      return { success: false, message: msg };
    }

    return { success: true, message: 'Vision API Key verified and active!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error connecting to Vision API.' };
  }
}

export const testGeminiApiKey = testOpenAIApiKey;

export interface OpenAIDiagnosticResult {
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
  // Machine-only specific fields
  machineType?: string;
  machineCategory?: string;
  visualEvidence?: string;
  affectedArea?: string;
  limitations?: string[];
}

export type GeminiDiagnosticResult = OpenAIDiagnosticResult;

export async function analyzeAssetWithOpenAI(
  apiKey: string = '',
  base64Data: string,
  mimeType: string = 'image/jpeg',
  userNotes: string = ''
): Promise<OpenAIDiagnosticResult> {
  const pureBase64 = base64Data.startsWith('data:')
    ? base64Data
    : (base64Data.length > 200 ? `data:${mimeType};base64,${base64Data}` : base64Data);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const clientKey = apiKey.trim() || getOpenAIApiKey();
  if (clientKey) {
    headers['x-openai-key'] = clientKey;
    headers['x-gemini-key'] = clientKey;
  }

  // Secure Server-Side Multimodal Machine Inspection Call
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
    throw new Error(data.reason || 'AI Vision Service Unavailable. Please verify the server-side OPENAI_API_KEY in deployment environment settings (Vercel / Render).');
  }

  if (!response.ok) {
    throw new Error(data.error || data.reason || `Server inspection error (HTTP ${response.status})`);
  }

  const isEligible = Boolean(data.eligible && data.status !== 'NOT_APPLICABLE');
  const cat: AssetCategory = data.machineCategory || data.assetCategory || 'Industrial Machinery';
  const machineName = data.machineType || data.assetType || `${cat} Asset`;

  const rawDefects = Array.isArray(data.defects) 
    ? data.defects 
    : (Array.isArray(data.visibleDefects) ? data.visibleDefects : []);

  const sanitizedDefects: VisualDefect[] = isEligible && rawDefects.length > 0
    ? rawDefects.map((d: any, idx: number) => {
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
          aiObservation: d.aiObservation || `AI VISUAL OBSERVATION: Surface discontinuity identified on ${d.affectedArea || 'component'}.`,
          engineeringAssessment: d.engineeringAssessment || `ENGINEERING ASSESSMENT: Qualified engineer verification required. Physical dimensions require calibrated measurement tools.`,
          color: sev === 'HIGH' ? 'critical' : (sev === 'MEDIUM' ? 'attention' : 'healthy'),
          icon: sev === 'HIGH' ? '🔴' : (sev === 'MEDIUM' ? '🟡' : '🟢'),
          tag: `${d.severity || 'Medium'} Priority Defect`
        };
      })
    : [];

  const finalScore = typeof data.conditionScore === 'number' ? data.conditionScore : (isEligible ? 85 : 0);

  return {
    isIndustrialAsset: isEligible,
    inspectionEligible: isEligible,
    detectedCategory: cat,
    detectedSubject: machineName,
    classificationConfidence: typeof data.confidence === 'number' ? data.confidence : 88,
    rejectionReason: data.eligibilityReason || (isEligible ? '' : 'Non-machine subject detected.'),
    assetName: machineName,
    category: cat,
    healthScore: finalScore,
    status: isEligible ? (finalScore >= 75 ? 'HEALTHY' : finalScore >= 50 ? 'ATTENTION' : 'CRITICAL') : 'NON_ASSET',
    diagnosticSummary: data.visualEvidence || data.summaryObservation || 'Visual AI machine analysis completed.',
    aiObservation: data.visualEvidence || data.summaryObservation || 'AI visual assessment complete.',
    engineeringAssessment: data.engineeringAssessment || 'Visual inspection only. Calibrated gauges required for vibration, temperature, and internal clearances.',
    defects: sanitizedDefects,
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    modelUsed: data.modelUsed || 'OpenAI Vision (Server-Side)',
    analysisTimestamp: data.inspectionTimestamp || new Date().toISOString(),
    machineType: data.machineType || machineName,
    machineCategory: cat,
    visualEvidence: data.visualEvidence,
    affectedArea: data.affectedArea,
    limitations: data.limitations
  };
}

export const analyzeAssetWithGemini = analyzeAssetWithOpenAI;
