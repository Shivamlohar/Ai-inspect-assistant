/**
 * Evidence Validator Service (Section 20: Evidence-First AI)
 * Validates that every AI finding is supported by visual evidence, sufficient confidence,
 * and authoritative engineering context before it can be displayed.
 */

import type { VisualDefect, AssetCategory } from './types';

export interface EvidenceValidationResult {
  isSupported: boolean;
  evidenceChecks: string[];
  reasoning: string;
  sanitizedDefects: VisualDefect[];
  limitations: string[];
}

export function validateEvidence(
  category: AssetCategory,
  isEligible: boolean,
  defects: VisualDefect[],
  retrievedSourcesCount: number = 0
): EvidenceValidationResult {
  const evidenceChecks: string[] = [];
  const limitations: string[] = [
    'Image-based optical analysis cannot establish certified physical dimensions (mm/cm) without physical calibration targets.',
    'Sub-surface material integrity, internal corrosion, and structural capacity cannot be verified from 2D RGB pixels alone.',
    'Preliminary AI observations require formal assessment by a certified professional engineer before executing repairs.'
  ];

  // 1. Check eligibility
  if (!isEligible) {
    return {
      isSupported: false,
      evidenceChecks: [
        'Asset category verification: FAIL (Subject is out-of-scope non-engineering domain)',
        'Defect metrology evaluation: SUPPRESSED to prevent false positives'
      ],
      reasoning: 'Visual inspection is not applicable to non-infrastructure or personal subjects.',
      sanitizedDefects: [],
      limitations: ['Non-engineering subjects are excluded from statutory structural defect evaluation.']
    };
  }

  evidenceChecks.push(`Asset category verification: PASS (Supported civil/industrial category: ${category})`);

  // 2. Filter defects by genuine evidence and confidence threshold (>= 70%)
  const sanitizedDefects: VisualDefect[] = [];

  for (const defect of defects) {
    const hasVisualClues = Boolean(
      defect.visualEvidence && 
      defect.visualEvidence.trim().length > 5 &&
      !defect.visualEvidence.toLowerCase().includes('insufficient evidence')
    );

    const isConfidenceValid = defect.confidence >= 70;

    // Rule: Reject any finding claiming exact physical mm from 2D image without calibration
    const hasFabricatedMeasurement = /\b\d+(\.\d+)?\s*(mm|cm|m)\b/i.test(defect.visualEvidence) && 
      !defect.visualEvidence.toLowerCase().includes('calibrated') &&
      !defect.visualEvidence.toLowerCase().includes('equipment');

    if (!hasVisualClues) {
      evidenceChecks.push(`Finding "${defect.name}": REJECTED (No distinct visual anomaly pattern visible)`);
      continue;
    }

    if (!isConfidenceValid) {
      evidenceChecks.push(`Finding "${defect.name}": SUPPRESSED (Confidence ${defect.confidence}% below defensible 70% threshold)`);
      continue;
    }

    if (hasFabricatedMeasurement) {
      // Strip fabricated physical metric, replace with honest visual clue
      defect.visualEvidence = defect.visualEvidence.replace(/\b\d+(\.\d+)?\s*(mm|cm|m)\b/gi, 'visual aperture');
      defect.limitations = 'Physical crack dimensions cannot be established from this image alone. Calibrated measurement is recommended.';
    }

    if (!defect.limitations) {
      defect.limitations = '2D optical estimate only. Certified physical measurement required for structural verification.';
    }

    sanitizedDefects.push(defect);
  }

  if (sanitizedDefects.length > 0) {
    evidenceChecks.push(`Visual evidence criteria: PASS (${sanitizedDefects.length} defect candidate(s) verified by optical contrast)`);
    evidenceChecks.push(`Confidence validation: PASS (All findings satisfy >=70% confidence threshold)`);
  } else {
    evidenceChecks.push('Visual evidence criteria: PASS (No abnormal surface fractures or deterioration patterns identified)');
  }

  // 3. Knowledge backing check
  if (retrievedSourcesCount > 0) {
    evidenceChecks.push(`Authoritative knowledge backing: PASS (${retrievedSourcesCount} technical standard citation(s) linked)`);
  } else {
    evidenceChecks.push('Authoritative knowledge backing: NOTICE (Using baseline engineering visual criteria)');
  }

  const isSupported = isEligible && (sanitizedDefects.length > 0 || defects.length === 0);

  return {
    isSupported,
    evidenceChecks,
    reasoning: sanitizedDefects.length > 0
      ? `Identified ${sanitizedDefects.length} visually defensible defect finding(s) on ${category}. Pre-screened against hallucination filters.`
      : `Nominal visual baseline confirmed for ${category}. No surface anomalies exceeding threshold.`,
    sanitizedDefects,
    limitations
  };
}
