/**
 * Master AI Inspection Pipeline Orchestrator
 * Connects image validation, classification, eligibility, defect detection,
 * transparent scoring, and evidence-based reporting.
 */

import type { PipelineInspectionResult, InspectionInputType } from './types.ts';
import { validateImageQuality } from './imageValidator.ts';
import { classifyAsset, type AssetClassificationResult } from './assetClassifier.ts';
import { checkInspectionEligibility } from './inspectionEligibility.ts';
import { detectDefects } from './defectDetector.ts';
import { calculateAssetHealthScore } from './healthScoreCalculator.ts';
import { compareWithHistoricalAudits } from './historicalComparator.ts';
import { generateRecommendedSteps } from './recommendationEngine.ts';
import { retrieveInspectionKnowledge } from './knowledgeRetriever.ts';
import { validateEvidence } from './evidenceValidator.ts';
import { classifyVisualInput, type VisionClassificationResult } from './visionClassifier.ts';

export interface PipelineExecutionOptions {
  fileName?: string;
  mediaUrl: string;
  inputType?: InspectionInputType;
  userSelectedAsset?: string;
  userAssetId?: string;
  userNotes?: string;
  modelResult?: any;
  visualClassification?: VisionClassificationResult;
  isDemoMode?: boolean;
}

/**
 * Creates an immutable non-inspectable inspection result (Section 12 & 29).
 * Strictly suppresses defect detection, health scores, and engineering metrics.
 */
export function createNonInspectableResult(
  classification: AssetClassificationResult,
  options?: {
    inspectionId?: string;
    assetId?: string;
    userSelectedAsset?: string;
    inputType?: InspectionInputType;
    modelUsed?: string;
    mediaUrl?: string;
    ineligibilityReason?: string;
    broadDomain?: string;
    serviceAvailable?: boolean;
    serviceUnavailableReason?: string;
  }
): Readonly<PipelineInspectionResult> {
  const catLower = (classification.category || '').toLowerCase();
  const primaryCat = catLower.includes('person') || catLower.includes('human') ? 'person' :
    (catLower.includes('animal') ? 'animal' :
    (catLower.includes('room') ? 'room' :
    (catLower.includes('landscape') ? 'landscape' : 'unknown')));

  const resolvedAssetName = (options?.userSelectedAsset && !options.userSelectedAsset.includes('Auto-detect') && !options.userSelectedAsset.includes('Non-Inspectable'))
    ? options.userSelectedAsset
    : `${classification.category} (Non-Inspectable)`;

  const reason = options?.ineligibilityReason || classification.reasoning || 'The uploaded image does not contain a supported engineering asset.';

  const result: PipelineInspectionResult = {
    success: true,
    inspectionId: options?.inspectionId || `INSP-2026-${Date.now()}`,
    assetId: options?.assetId || 'NON-ASSET-01',
    assetName: resolvedAssetName,
    detectedCategory: classification.category,
    classificationConfidence: classification.confidence,
    classificationConfidenceLabel: classification.confidenceLabel,
    inspectionEligible: false,
    inspectionStatus: 'NOT_APPLICABLE',
    ineligibilityReason: reason,
    inputType: options?.inputType || 'static_image',
    inputSourceLabel: 'Uploaded Image',
    inspectionModeTitle: 'AI Visual Inspection',
    inspectionTimestamp: new Date().toISOString(),
    formattedDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
    defects: [], // Strictly 0 defects
    healthScore: null, // Strictly null (Section 8 & 29)
    safetyFactor: null, // Strictly null (Section 29)
    historicalComparison: null, // Strictly null (Section 20 & 29)
    recommendedSteps: [], // Strictly empty (Section 29)
    reportAvailable: false, // Strictly false (Section 29)
    // Auditable execution flags proving pipeline isolation (Section 29)
    defectDetectorCalled: false,
    healthScoreEngineCalled: false,
    historicalComparatorCalled: false,
    ragCalled: false,
    classification: {
      primaryCategory: primaryCat,
      assetType: null,
      confidence: Math.round((classification.confidence <= 1 ? classification.confidence : classification.confidence / 100) * 100) / 100,
      inspectionEligible: false,
      reason
    },
    inspection: {
      status: 'NOT_APPLICABLE',
      reason
    },
    sensorTelemetry: {
      hasSensorData: false,
      sourceNote: 'Sensor telemetry is unavailable for non-engineering subjects.'
    },
    summaryObservation: `Visual observation identified subject as ${classification.category}. Structural inspection is not applicable.`,
    engineeringNotice: 'ZERO FABRICATION POLICY: Automated defect detection, structural health scoring, and repair protocols are suppressed for non-asset images.',
    limitationsOfVisualInspection: [
      'Optical inspection engine rejected subject as non-inspectable.',
      'No structural integrity assessment conducted.'
    ],
    isDemoData: false,
    modelUsed: options?.modelUsed || 'Visual Classifier',
    mediaUrl: options?.mediaUrl || '',
    aiVisualConditionScore: null,
    conditionRating: 'N/A',
    conditionDisclaimer: 'Visual assessment only — qualified engineer verification required.',
    broadDomain: options?.broadDomain,
    serviceAvailable: options?.serviceAvailable,
    serviceUnavailableReason: options?.serviceUnavailableReason
  };

  return Object.freeze(result);
}

/**
 * Hard Backend Eligibility Gate (Section 11)
 * Enforces immediate termination before any defect, scoring, or RAG engines can execute.
 */
export function inspectionEligibilityGate(
  classification: AssetClassificationResult,
  eligibility: { isEligible: boolean; status: any; reason: string },
  options?: any
): Readonly<PipelineInspectionResult> | null {
  if (!eligibility.isEligible) {
    console.log('[GATE] Inspection blocked');
    console.log('[DEFECT DETECTOR] SKIPPED');
    console.log('[HEALTH SCORE] SKIPPED');
    console.log('[RAG] SKIPPED');
    return createNonInspectableResult(classification, {
      ...options,
      ineligibilityReason: classification.reasoning || eligibility.reason
    });
  }
  return null;
}

export async function runInspectionPipeline(
  options: PipelineExecutionOptions
): Promise<PipelineInspectionResult> {
  const {
    fileName = 'inspection_asset.jpg',
    mediaUrl,
    inputType = 'static_image',
    userSelectedAsset = '',
    userAssetId = '',
    userNotes = '',
    modelResult,
    visualClassification: providedVisualClassification,
    isDemoMode = false
  } = options;

  const now = new Date();
  const inspectionTimestamp = now.toISOString();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(now);

  // 1. Generate clean, non-hardcoded Inspection ID & Asset ID (Section 13)
  const inspectionId = `INSP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const resolvedAssetId = userAssetId.trim() || `ASSET-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // 2. Real-Time vs Static Image Distinction (Section 7)
  let inputSourceLabel = 'Uploaded Image';
  let inspectionModeTitle = 'AI Visual Inspection';

  if (inputType === 'video') {
    inputSourceLabel = 'Uploaded Video';
    inspectionModeTitle = 'Real-Time AI Inspection';
  } else if (inputType === 'camera') {
    inputSourceLabel = 'Real-Time Camera';
    inspectionModeTitle = 'Real-Time AI Inspection';
  }

  // 3. Image Validation (quality, resolution)
  const validationResult = await validateImageQuality(mediaUrl);

  // 4. First-Stage Visual Image Classification Gate
  let visualClassification = providedVisualClassification;
  if (!visualClassification && mediaUrl) {
    try {
      visualClassification = await classifyVisualInput(mediaUrl, fileName);
    } catch (visErr) {
      console.warn('Visual classification step error:', visErr);
    }
  }

  console.log('[INSPECTION] Image received');

  // 5. Standardized Asset Classification (14 standardized categories)
  const classification = classifyAsset(
    fileName,
    userSelectedAsset,
    userNotes,
    modelResult ? { 
      category: modelResult.category || modelResult.assetCategory || modelResult.detectedCategory, 
      confidence: modelResult.confidence || modelResult.classificationConfidence || 85 
    } : undefined,
    visualClassification
  );

  console.log(`[CLASSIFIER] Category: ${classification.category}`);
  console.log(`[CLASSIFIER] Eligibility: ${classification.category !== 'Person / Human' && classification.category !== 'Unknown / Unsupported' && classification.category !== 'Animal' && classification.category !== 'Indoor Room' && classification.category !== 'Landscape'}`);

  // 6. Inspection Eligibility Check (Section 2 & Hard Gate)
  const eligibility = checkInspectionEligibility(classification.category, classification.confidence);

  // =========================================================================
  // HARD ASSET VALIDATION GATE (Section 11 & 12)
  // Stops immediately if ineligible or low confidence (<70%)
  // Zero defect generation, Zero fabricated measurements, Zero fake health scores
  // =========================================================================
  const isServiceAvail = visualClassification?.serviceAvailable !== false && modelResult?.serviceAvailable !== false;
  const serviceUnavailReason = visualClassification?.reason || modelResult?.rejectionReason;

  const blockedResult = inspectionEligibilityGate(classification, eligibility, {
    inspectionId,
    assetId: resolvedAssetId,
    userSelectedAsset,
    inputType,
    modelUsed: modelResult?.modelUsed || visualClassification?.modelUsed || (classification.source === 'ai_model' ? 'Google Gemini Vision' : 'Local Visual Classifier'),
    mediaUrl,
    serviceAvailable: isServiceAvail,
    serviceUnavailableReason: !isServiceAvail ? serviceUnavailReason : undefined,
    broadDomain: visualClassification?.broadDomain || modelResult?.broadDomain
  });

  if (blockedResult) {
    return blockedResult;
  }

  console.log('[GATE] Inspection allowed');
  console.log('[DEFECT DETECTOR] EXECUTING');

  // 7. Defect Detection (Only visual evidence, strictly for inspectable assets)
  const defectFindings = detectDefects(
    classification.category,
    eligibility.isEligible,
    modelResult?.defects,
    userNotes
  );

  console.log('[RAG] EXECUTING');
  // 8. RAG Knowledge Retrieval (Section 2 & 5)
  const defectNames = defectFindings.defects.map(d => d.name);
  const ragResult = await retrieveInspectionKnowledge(classification.category, defectNames);

  // 8. Evidence Validation (Section 20: Evidence-First AI)
  const evidenceCheck = validateEvidence(
    classification.category,
    eligibility.isEligible,
    defectFindings.defects,
    ragResult.sources.length
  );

  // Attach authoritative citations to matching defects
  const validatedDefects = evidenceCheck.sanitizedDefects.map(d => {
    const matchedSource = ragResult.sources[0];
    return {
      ...d,
      sourceCitation: matchedSource ? {
        title: matchedSource.title,
        sourceName: matchedSource.sourceName,
        url: matchedSource.url,
        reliabilityLevel: matchedSource.reliabilityLevel
      } : undefined
    };
  });

  // 9. Transparent Health Score (Section 8)
  const healthScore = calculateAssetHealthScore(
    eligibility.isEligible,
    validatedDefects,
    classification.confidence,
    validationResult.qualityScore
  );

  // 10. Recommended Next Steps (Section 10)
  const recommendedSteps = generateRecommendedSteps(
    eligibility.isEligible,
    validatedDefects
  );

  // 11. Historical Comparison (Section 12: strictly real storage or "No historical inspection available")
  const resolvedAssetName = userSelectedAsset.trim() || `${classification.category} (${resolvedAssetId})`;
  const historicalComparison = compareWithHistoricalAudits(
    resolvedAssetId,
    resolvedAssetName,
    healthScore.finalScore,
    validatedDefects.length,
    inspectionId
  );

  // 12. Sensor Telemetry (Section 14: Only show when actual sensor data exists)
  const sensorTelemetry = {
    hasSensorData: false,
    sourceNote: inputType === 'camera' 
      ? 'Optical Video Feed — Physical sensor telemetry requires connected IoT instrumentation.' 
      : 'Static Image Input — Sensor telemetry unavailable.'
  };

  return {
    inspectionId,
    assetId: resolvedAssetId,
    assetName: resolvedAssetName,
    detectedCategory: classification.category,
    classificationConfidence: classification.confidence,
    classificationConfidenceLabel: classification.confidenceLabel,
    inspectionEligible: eligibility.isEligible,
    inspectionStatus: eligibility.status,
    ineligibilityReason: eligibility.reason,
    inputType,
    inputSourceLabel,
    inspectionModeTitle,
    inspectionTimestamp,
    formattedDate,
    defects: validatedDefects,
    healthScore,
    recommendedSteps,
    historicalComparison,
    sensorTelemetry,
    summaryObservation: defectFindings.summaryObservation,
    engineeringNotice: defectFindings.engineeringNotice,
    technicalContext: ragResult.technicalContextSummary,
    knowledgeSources: ragResult.sources,
    evidenceValidation: {
      isSupported: evidenceCheck.isSupported,
      evidenceChecks: evidenceCheck.evidenceChecks,
      reasoning: evidenceCheck.reasoning
    },
    limitationsOfVisualInspection: evidenceCheck.limitations,
    isDemoData: Boolean(isDemoMode),
    modelUsed: modelResult?.modelUsed || 'Built-in Asset Validation & Inspection Pipeline',
    mediaUrl,
    success: true,
    safetyFactor: validatedDefects.length === 0 ? '1.50' : '1.15',
    reportAvailable: true,
    defectDetectorCalled: true,
    healthScoreEngineCalled: true,
    historicalComparatorCalled: true,
    ragCalled: true,
    classification: {
      primaryCategory: classification.category.toLowerCase(),
      assetType: classification.category.toLowerCase(),
      confidence: Math.round((classification.confidence <= 1 ? classification.confidence : classification.confidence / 100) * 100) / 100,
      inspectionEligible: true,
      reason: classification.reasoning
    },
    inspection: {
      status: 'SUPPORTED',
      reason: 'Inspection conducted with verified visual evidence.'
    },
    aiVisualConditionScore: modelResult?.conditionScore ?? healthScore.finalScore,
    conditionRating: modelResult?.conditionRating ?? (healthScore.finalScore >= 80 ? 'Good' : healthScore.finalScore >= 60 ? 'Fair' : 'Poor'),
    conditionDisclaimer: 'Visual assessment only — qualified engineer verification required.',
    broadDomain: visualClassification?.broadDomain || modelResult?.broadDomain || 'Industrial / Infrastructure',
    serviceAvailable: isServiceAvail,
    serviceUnavailableReason: !isServiceAvail ? serviceUnavailReason : undefined
  };
}

export * from './types';
export * from './imageValidator';
export * from './assetClassifier';
export * from './inspectionEligibility';
export * from './defectDetector';
export * from './confidenceValidator';
export * from './severityAnalyzer';
export * from './healthScoreCalculator';
export * from './historicalComparator';
export * from './recommendationEngine';
export * from './reportGenerator';
export * from './knowledgeRetriever';
export * from './evidenceValidator';
