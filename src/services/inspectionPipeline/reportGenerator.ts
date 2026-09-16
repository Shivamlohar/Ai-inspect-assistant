/**
 * Report Generator Service
 * Formats inspection dossiers into transparent, evidence-based reports with required disclaimers.
 */

import type { PipelineInspectionResult } from './types';

export interface GeneratedReportSummary {
  inspectionId: string;
  assetId: string;
  assetType: string;
  assetName: string;
  inspectionDate: string;
  formattedDate: string;
  inputTypeLabel: string;
  inspectionModeTitle: string;
  statusLabel: string;
  healthScoreText: string;
  defectsCount: number;
  defectsSummary: {
    type: string;
    severity: string;
    confidence: string;
    visualEvidence: string;
  }[];
  recommendedActions: {
    step: number;
    title: string;
    detail: string;
  }[];
  limitationsDisclaimer: string;
  aiObservationSummary: string;
  engineeringNotice: string;
  isDemoData: boolean;
}

export function generateReportSummary(inspection: PipelineInspectionResult): GeneratedReportSummary {
  const limitationsDisclaimer = 
    'AI-generated visual inspection. Findings are derived exclusively from uncalibrated 2D optical frames and should be verified by a qualified professional where safety, operational tolerances, or structural decisions are involved. This document does not constitute an ISO or certified engineering sign-off.';

  return {
    inspectionId: inspection.inspectionId,
    assetId: inspection.assetId,
    assetType: inspection.detectedCategory,
    assetName: inspection.assetName,
    inspectionDate: inspection.inspectionTimestamp,
    formattedDate: inspection.formattedDate,
    inputTypeLabel: inspection.inputSourceLabel,
    inspectionModeTitle: inspection.inspectionModeTitle,
    statusLabel: inspection.inspectionStatus === 'NOT SUPPORTED' 
      ? 'Inspection Not Applicable' 
      : (inspection.inspectionStatus === 'MANUAL_VERIFICATION_REQUIRED' ? 'Manual Verification Required' : 'Inspection Completed'),
    healthScoreText: inspection.healthScore.isAvailable 
      ? `${inspection.healthScore.finalScore} / 100` 
      : 'Health score unavailable',
    defectsCount: inspection.defects.length,
    defectsSummary: inspection.defects.map(d => ({
      type: d.name,
      severity: d.severity,
      confidence: d.confidenceLabel,
      visualEvidence: d.visualEvidence
    })),
    recommendedActions: inspection.recommendedSteps.map(r => ({
      step: r.step,
      title: r.title,
      detail: r.detail
    })),
    limitationsDisclaimer,
    aiObservationSummary: inspection.summaryObservation,
    engineeringNotice: inspection.engineeringNotice,
    isDemoData: inspection.isDemoData
  };
}
