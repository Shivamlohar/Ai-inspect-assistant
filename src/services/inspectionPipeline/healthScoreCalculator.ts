/**
 * Asset Health Score Calculator Service
 * Transparently computes health score using the 40/30/20/10 weighted formula.
 */

import type { VisualDefect, HealthScoreBreakdown } from './types';

export function calculateAssetHealthScore(
  isEligible: boolean,
  defects: VisualDefect[],
  classificationConfidence: number,
  visualQualityScore: number = 80
): HealthScoreBreakdown {
  // If asset is ineligible (e.g. Person, Animal, Room, or low confidence), health score is unavailable!
  if (!isEligible) {
    return {
      isAvailable: false,
      finalScore: 0,
      unavailabilityReason: 'Health score unavailable: Subject is not a supported infrastructure or industrial asset.',
      components: {
        visualCondition: { score: 0, weight: 0.40, contribution: 0 },
        defectCondition: { score: 0, weight: 0.30, contribution: 0 },
        severityPenalty: { score: 0, weight: 0.20, contribution: 0 },
        confidenceFactor: { score: 0, weight: 0.10, contribution: 0 }
      },
      explanation: 'Asset health score is not applicable to non-engineering subjects.'
    };
  }

  // If visual quality is insufficient, cannot compute defensible score
  if (visualQualityScore < 40) {
    return {
      isAvailable: false,
      finalScore: 0,
      unavailabilityReason: 'Health score unavailable: Image resolution or quality is insufficient for defensible scoring.',
      components: {
        visualCondition: { score: visualQualityScore, weight: 0.40, contribution: 0 },
        defectCondition: { score: 0, weight: 0.30, contribution: 0 },
        severityPenalty: { score: 0, weight: 0.20, contribution: 0 },
        confidenceFactor: { score: 0, weight: 0.10, contribution: 0 }
      },
      explanation: 'Additional inspection data or higher quality visual frame is required.'
    };
  }

  // 1. Visual Condition Score (Weight: 40%)
  // Baseline visual clarity & surface integrity (0-100)
  const visualConditionScore = Math.max(20, Math.min(100, visualQualityScore));
  const visualContrib = visualConditionScore * 0.40;

  // 2. Detected Defects Score (Weight: 30%)
  // 0 defects = 100
  // 1 defect = 75
  // 2 defects = 60
  // 3+ defects = 45
  let defectScore = 100;
  if (defects.length === 1) defectScore = 75;
  else if (defects.length === 2) defectScore = 60;
  else if (defects.length >= 3) defectScore = 45;
  const defectContrib = defectScore * 0.30;

  // 3. Defect Severity Penalty Score (Weight: 20%)
  // HIGH severity = 40
  // MEDIUM severity = 70
  // LOW severity = 85
  // No defects = 100
  let severityScore = 100;
  if (defects.some(d => d.severity === 'HIGH')) {
    severityScore = 40;
  } else if (defects.some(d => d.severity === 'MEDIUM')) {
    severityScore = 70;
  } else if (defects.length > 0) {
    severityScore = 85;
  }
  const severityContrib = severityScore * 0.20;

  // 4. Inspection Confidence Factor (Weight: 10%)
  // Classification & defect confidence (0-100)
  const avgConf = defects.length > 0
    ? Math.round((classificationConfidence + defects.reduce((acc, d) => acc + d.confidence, 0) / defects.length) / 2)
    : classificationConfidence;
  const confidenceScore = Math.max(10, Math.min(100, avgConf));
  const confidenceContrib = confidenceScore * 0.10;

  const rawFinal = visualContrib + defectContrib + severityContrib + confidenceContrib;
  const finalScore = Math.round(Math.max(10, Math.min(100, rawFinal)));

  return {
    isAvailable: true,
    finalScore,
    components: {
      visualCondition: { score: visualConditionScore, weight: 0.40, contribution: parseFloat(visualContrib.toFixed(1)) },
      defectCondition: { score: defectScore, weight: 0.30, contribution: parseFloat(defectContrib.toFixed(1)) },
      severityPenalty: { score: severityScore, weight: 0.20, contribution: parseFloat(severityContrib.toFixed(1)) },
      confidenceFactor: { score: confidenceScore, weight: 0.10, contribution: parseFloat(confidenceContrib.toFixed(1)) }
    },
    explanation: `Calculated from Visual Condition (${visualConditionScore} × 40%) + Defect State (${defectScore} × 30%) + Severity (${severityScore} × 20%) + Confidence (${confidenceScore} × 10%).`
  };
}
