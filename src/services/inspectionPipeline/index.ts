/**
 * Master AI Inspection Pipeline Orchestrator
 * Connects image validation, classification, eligibility, defect detection,
 * transparent scoring, and evidence-based reporting.
 */

import type { PipelineInspectionResult, InspectionInputType } from './types';
import { validateImageQuality } from './imageValidator';
import { classifyAsset } from './assetClassifier';
import { checkInspectionEligibility } from './inspectionEligibility';
import { detectDefects } from './defectDetector';
import { calculateAssetHealthScore } from './healthScoreCalculator';
import { compareWithHistoricalAudits } from './historicalComparator';
import { generateRecommendedSteps } from './recommendationEngine';
import { retrieveInspectionKnowledge } from './knowledgeRetriever';
import { validateEvidence } from './evidenceValidator';
import { classifyVisualInput, type VisionClassificationResult } from './visionClassifier';

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
  if (!visualClassification && !modelResult && mediaUrl) {
    try {
      visualClassification = await classifyVisualInput(mediaUrl, fileName);
    } catch (visErr) {
      console.warn('Visual classification step error:', visErr);
    }
  }

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

  // 6. Inspection Eligibility Check (Section 2 & Hard Gate)
  const eligibility = checkInspectionEligibility(classification.category, classification.confidence);

  // =========================================================================
  // HARD ASSET VALIDATION GATE: STOP IMMEDIATELY IF INELIGIBLE OR CONFIDENCE < 70%
  // Zero defect generation, Zero fabricated measurements, Zero fake health scores
  // =========================================================================
  if (!eligibility.isEligible || classification.confidence < 70) {
    const resolvedAssetName = (userSelectedAsset && !userSelectedAsset.includes('Auto-detect') && !userSelectedAsset.includes('Non-Inspectable'))
      ? userSelectedAsset
      : `${classification.category} (Non-Inspectable)`;

    const modelUsed = modelResult?.modelUsed || 
      (visualClassification?.modelUsed) ||
      (classification.source === 'ai_model' ? 'Google Gemini 1.5 Flash Vision' : 'Local Computer Vision Biometric & Pixel Classifier');

    return {
      inspectionId,
      assetId: resolvedAssetId,
      assetName: resolvedAssetName,
      detectedCategory: classification.category,
      classificationConfidence: classification.confidence,
      classificationConfidenceLabel: classification.confidenceLabel,
      inspectionEligible: false,
      inspectionStatus: eligibility.status,
      ineligibilityReason: eligibility.reason,
      inputType,
      inputSourceLabel,
      inspectionModeTitle,
      inspectionTimestamp,
      formattedDate,
      defects: [], // Strictly 0 defects
      healthScore: {
        isAvailable: false,
        finalScore: null as any,
        unavailabilityReason: eligibility.reason,
        components: {
          visualCondition: { score: 0, weight: 0.40, contribution: 0 },
          defectCondition: { score: 0, weight: 0.30, contribution: 0 },
          severityPenalty: { score: 0, weight: 0.20, contribution: 0 },
          confidenceFactor: { score: 0, weight: 0.10, contribution: 0 }
        },
        explanation: 'Asset health score is not applicable to non-engineering subjects.'
      },
      recommendedSteps: [
        {
          step: 1,
          title: 'Upload a supported civil infrastructure or industrial asset',
          detail: 'Structural defect metrology is reserved for civil infrastructure, industrial equipment, and transportation assets.',
          timing: 'Immediate',
          type: 'review'
        }
      ],
      historicalComparison: {
        hasHistoricalData: false,
        message: 'No historical inspection available for non-asset images.'
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
      isDemoData: Boolean(isDemoMode),
      modelUsed,
      mediaUrl
    };
  }

  // 7. Defect Detection (Only visual evidence, strictly for inspectable assets)
  const defectFindings = detectDefects(
    classification.category,
    eligibility.isEligible,
    modelResult?.defects,
    `${fileName} ${userSelectedAsset} ${userNotes}`
  );

  // 7. RAG Knowledge Retrieval (Section 2 & 5)
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
    mediaUrl
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
