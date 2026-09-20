/**
 * Asset Health Score Calculator Service
 * Evidence-Driven Condition Assessment Engine.
 * 
 * Rules:
 * - Baseline condition starts at 100.
 * - Each High Severity defect reduces score significantly (-28 to -40 points).
 * - Each Medium Severity defect reduces score moderately (-14 to -22 points).
 * - Each Low Severity defect reduces score slightly (-5 to -8 points).
 * - Multiple defect interaction penalty.
 * - Score bounded between 0 and 100.
 * 
 * Strict condition constraints:
 * - High Severity present: Condition CANNOT be "Good". MUST be "Poor" or "Critical" (<50).
 * - Medium Severity present: Condition CANNOT be "Good". MUST be "Fair" (50-74).
 * - Clean asset (0 defects): Condition = "Condition Appears Acceptable Based on Available Visual Evidence" (90-100).
 * - Poor image quality / no evidence: Score = null, Condition = "Insufficient Evidence".
 */

import type { VisualDefect, HealthScoreBreakdown } from './types';

export function calculateAssetHealthScore(
  isEligible: boolean,
  defects: VisualDefect[],
  classificationConfidence: number,
  visualQualityScore: number = 80
): HealthScoreBreakdown {
  // 1. Ineligible non-engineering subjects
  if (!isEligible) {
    return {
      isAvailable: false,
      finalScore: null,
      overallCondition: 'Out of Scope',
      unavailabilityReason: 'Health score unavailable: Subject is not a supported infrastructure or engineering asset.',
      explanation: 'Defect metrology and condition scoring are not applicable to non-engineering subjects.'
    };
  }

  // 2. Insufficient visual quality / unreadable image
  if (visualQualityScore < 40) {
    return {
      isAvailable: false,
      finalScore: null,
      overallCondition: 'Insufficient Evidence',
      unavailabilityReason: 'Health score unavailable: Insufficient visual evidence for a reliable condition assessment.',
      explanation: 'Insufficient visual evidence for a reliable condition assessment. Image resolution, illumination, or focus prevents defensible surface defect metrology.'
    };
  }

  // 3. Clean Asset Case (No defects visible)
  if (!defects || defects.length === 0) {
    const cleanScore = Math.min(100, Math.max(90, Math.round(visualQualityScore)));
    const visualContrib = cleanScore * 0.40;
    return {
      isAvailable: true,
      finalScore: cleanScore,
      overallCondition: 'Condition Appears Acceptable Based on Available Visual Evidence',
      components: {
        visualCondition: { score: cleanScore, weight: 0.40, contribution: parseFloat(visualContrib.toFixed(1)) },
        defectCondition: { score: 100, weight: 0.30, contribution: 30.0 },
        severityPenalty: { score: 100, weight: 0.20, contribution: 20.0 },
        confidenceFactor: { score: Math.round(classificationConfidence), weight: 0.10, contribution: parseFloat((classificationConfidence * 0.10).toFixed(1)) }
      },
      explanation: 'No visible defects identified in the provided image. Overall condition appears acceptable based on available visual evidence (never assumed 100% safe without physical internal testing).'
    };
  }

  // 4. Evidence-Driven Penalty Deduction from Baseline 100
  let totalPenalty = 0;
  const highDefects = defects.filter(d => d.severity === 'HIGH');
  const medDefects = defects.filter(d => d.severity === 'MEDIUM');
  const lowDefects = defects.filter(d => d.severity === 'LOW');

  defects.forEach(d => {
    const confFactor = Math.max(0.5, Math.min(1.0, (d.confidence || 85) / 100));
    if (d.severity === 'HIGH') {
      // High: -28 to -40 points
      const p = Math.round(28 + confFactor * 12);
      totalPenalty += p;
    } else if (d.severity === 'MEDIUM') {
      // Medium: -14 to -22 points
      const p = Math.round(14 + confFactor * 8);
      totalPenalty += p;
    } else {
      // Low: -5 to -8 points
      const p = Math.round(5 + confFactor * 3);
      totalPenalty += p;
    }
  });

  // Multiple defect interaction penalty
  if (defects.length === 2) {
    totalPenalty += 6;
  } else if (defects.length >= 3) {
    totalPenalty += 12;
  }

  let calculatedScore = Math.max(0, Math.min(100, 100 - totalPenalty));

  // ENFORCE STRICT DEFECT SEVERITY CEILINGS:
  // Any High Severity defect (severe crack, spalling, exposed rebar, major leak)
  // Condition CANNOT be "Good". MUST be "Poor" or "Critical" with score < 50.
  if (highDefects.length > 0) {
    calculatedScore = Math.min(calculatedScore, 48);
  }
  // Medium severity defect (moderate crack, surface corrosion, minor spalling)
  // Condition CANNOT be "Good". MUST be "Fair" with score 50 - 74.
  else if (medDefects.length > 0) {
    calculatedScore = Math.min(Math.max(50, calculatedScore), 72);
  }

  // Condition classification mapping
  let overallCond = 'Fair';
  if (calculatedScore >= 90) {
    overallCond = 'Excellent';
  } else if (calculatedScore >= 75) {
    overallCond = 'Good';
  } else if (calculatedScore >= 50) {
    overallCond = 'Fair';
  } else if (calculatedScore >= 25) {
    overallCond = 'Poor';
  } else {
    overallCond = 'Critical';
  }

  // Defensible component breakdown
  const visualScore = Math.max(15, Math.min(100, visualQualityScore - (highDefects.length > 0 ? 52 : medDefects.length > 0 ? 32 : 14)));
  const defectScore = Math.max(10, Math.min(100, 100 - (highDefects.length * 40 + medDefects.length * 24 + lowDefects.length * 10)));
  const severityScore = highDefects.length > 0 ? 20 : medDefects.length > 0 ? 55 : 80;
  const avgConf = Math.round((classificationConfidence + defects.reduce((acc, d) => acc + (d.confidence || 85), 0) / defects.length) / 2);

  const visualContrib = visualScore * 0.40;
  const defectContrib = defectScore * 0.30;
  const severityContrib = severityScore * 0.20;
  const confContrib = avgConf * 0.10;

  return {
    isAvailable: true,
    finalScore: calculatedScore,
    overallCondition: overallCond,
    components: {
      visualCondition: { score: visualScore, weight: 0.40, contribution: parseFloat(visualContrib.toFixed(1)) },
      defectCondition: { score: defectScore, weight: 0.30, contribution: parseFloat(defectContrib.toFixed(1)) },
      severityPenalty: { score: severityScore, weight: 0.20, contribution: parseFloat(severityContrib.toFixed(1)) },
      confidenceFactor: { score: avgConf, weight: 0.10, contribution: parseFloat(confContrib.toFixed(1)) }
    },
    explanation: `Evidence-driven calculation: Baseline 100 minus ${totalPenalty} penalty points across ${defects.length} defect(s) (High: ${highDefects.length}, Medium: ${medDefects.length}, Low: ${lowDefects.length}). Defensible condition: ${calculatedScore}/100 (${overallCond}).`
  };
}
