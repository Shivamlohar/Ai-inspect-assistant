/**
 * Severity Analyzer Service
 * Maps visible evidence strictly to LOW, MEDIUM, HIGH without overclaiming structural failure.
 */

import type { VisualDefect, DefectSeverity } from './types';

export interface SeverityAssessmentResult {
  overallSeverity: DefectSeverity | 'NONE';
  severitySummary: string;
  hasHighPriority: boolean;
  engineeringCaution: string;
}

export function analyzeOverallSeverity(defects: VisualDefect[]): SeverityAssessmentResult {
  if (!defects || defects.length === 0) {
    return {
      overallSeverity: 'NONE',
      severitySummary: 'No active defect severity flags.',
      hasHighPriority: false,
      engineeringCaution: 'Visual survey indicates nominal surface baseline. Routine periodic monitoring advised.'
    };
  }

  const hasHigh = defects.some(d => d.severity === 'HIGH');
  const hasMedium = defects.some(d => d.severity === 'MEDIUM');

  if (hasHigh) {
    return {
      overallSeverity: 'HIGH',
      severitySummary: 'HIGH: Large or extensive visible defect that warrants prompt professional inspection.',
      hasHighPriority: true,
      engineeringCaution: 'Potential structural concern detected — professional engineering assessment recommended. Do not assume structural failure confirmed until on-site NDT testing is complete.'
    };
  }

  if (hasMedium) {
    return {
      overallSeverity: 'MEDIUM',
      severitySummary: 'MEDIUM: Clearly visible defect requiring maintenance review.',
      hasHighPriority: false,
      engineeringCaution: 'Defect is clearly discernible on optical inspection. Schedule routine field verification and surface monitoring.'
    };
  }

  return {
    overallSeverity: 'LOW',
    severitySummary: 'LOW: Minor visible surface deterioration.',
    hasHighPriority: false,
    engineeringCaution: 'Superficial anomaly. Track during standard maintenance intervals.'
  };
}
