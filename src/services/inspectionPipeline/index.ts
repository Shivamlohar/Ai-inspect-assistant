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

export interface PipelineExecutionOptions {
  fileName?: string;
  mediaUrl: string;
  inputType?: InspectionInputType;
  userSelectedAsset?: string;
  userAssetId?: string;
  userNotes?: string;
  modelResult?: any;
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

  // 4. Asset Classification (14 standardized categories)
  const classification = classifyAsset(
    fileName,
    userSelectedAsset,
    userNotes,
    modelResult ? { category: modelResult.category || modelResult.assetCategory, confidence: modelResult.confidence || 85 } : undefined
  );

  // 5. Inspection Eligibility Check (Section 2)
  const eligibility = checkInspectionEligibility(classification.category, classification.confidence);

  // 6. Defect Detection (Only visual evidence, no fabricated mm dimensions)
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
