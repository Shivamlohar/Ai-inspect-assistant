/**
 * Confidence Validator Service
 * Validates AI confidence scores and prevents fabricated precision numbers.
 */

export interface ConfidenceAssessment {
  isValid: boolean;
  score: number; // 0 - 100
  label: string;
  isModelProvided: boolean;
  level: 'HIGH' | 'MODERATE' | 'LOW' | 'UNAVAILABLE';
}

export function validateConfidence(rawConfidence: any): ConfidenceAssessment {
  if (rawConfidence === undefined || rawConfidence === null || rawConfidence === '') {
    return {
      isValid: false,
      score: 0,
      label: 'Model confidence unavailable',
      isModelProvided: false,
      level: 'UNAVAILABLE'
    };
  }

  let num = typeof rawConfidence === 'number' ? rawConfidence : parseFloat(String(rawConfidence).replace(/[^0-9.]/g, ''));

  if (isNaN(num) || num <= 0) {
    return {
      isValid: false,
      score: 0,
      label: 'Model confidence unavailable',
      isModelProvided: false,
      level: 'UNAVAILABLE'
    };
  }

  // If provided as 0.0 - 1.0, scale to 0 - 100
  if (num <= 1.0 && num > 0) {
    num = num * 100;
  }

  const rounded = Math.round(Math.min(100, Math.max(0, num)));

  let level: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
  if (rounded >= 85) level = 'HIGH';
  else if (rounded < 70) level = 'LOW';

  return {
    isValid: true,
    score: rounded,
    label: `${rounded}%`,
    isModelProvided: true,
    level
  };
}
