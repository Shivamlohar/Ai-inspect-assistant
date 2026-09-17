/**
 * Inspection Eligibility Service
 * Determines whether a classified asset is eligible for defect metrology analysis.
 */

import type { AssetCategory } from './types';

export interface EligibilityResult {
  isEligible: boolean;
  status: 'SUPPORTED' | 'NOT SUPPORTED' | 'MANUAL_VERIFICATION_REQUIRED';
  reason: string;
  recommendedAction: string;
}

// Strict out-of-scope categories that must NEVER be inspected
const OUT_OF_SCOPE_CATEGORIES = new Set<string>([
  'Person / Human',
  'Animal',
  'Indoor Room',
  'Landscape'
]);

export function checkInspectionEligibility(
  category: AssetCategory | string,
  confidence: number
): EligibilityResult {
  const catNormalized = (category || '').trim();
  const lower = catNormalized.toLowerCase();

  // 1. Strict Out-of-Scope Checks (People, Animals, Domestic Furniture, Scenic Landscapes)
  if (
    OUT_OF_SCOPE_CATEGORIES.has(catNormalized) ||
    lower.includes('person') ||
    lower.includes('human') ||
    lower.includes('face') ||
    lower.includes('selfie') ||
    lower.includes('portrait')
  ) {
    return {
      isEligible: false,
      status: 'NOT SUPPORTED',
      reason: 'Human / person image detected. Structural civil and industrial defect metrology is not applicable.',
      recommendedAction: 'Upload an infrastructure, industrial machinery, or electrical equipment image.'
    };
  }

  if (lower.includes('animal') || lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) {
    return {
      isEligible: false,
      status: 'NOT SUPPORTED',
      reason: 'Living animal detected. Living organisms are outside the scope of industrial defect metrology.',
      recommendedAction: 'Upload an inspectable engineering asset image.'
    };
  }

  if (lower.includes('indoor room') || lower.includes('bedroom') || lower.includes('living room')) {
    return {
      isEligible: false,
      status: 'NOT SUPPORTED',
      reason: 'Domestic interior living space detected. Residential furniture is not an inspectable industrial asset.',
      recommendedAction: 'Upload an industrial plant or civil infrastructure asset.'
    };
  }

  if (lower.includes('landscape') || lower.includes('scenery') || lower.includes('wilderness')) {
    return {
      isEligible: false,
      status: 'NOT SUPPORTED',
      reason: 'Natural scenery detected without structural engineering elements.',
      recommendedAction: 'Upload an engineered structure, road, bridge, or machinery asset.'
    };
  }

  // 2. Low Confidence (< 40%) or Genuinely Uninterpretable Image
  if (confidence < 40 || catNormalized === 'Unknown / Unsupported') {
    if (confidence < 40) {
      return {
        isEligible: false,
        status: 'MANUAL_VERIFICATION_REQUIRED',
        reason: `Image confidence (${confidence}%) is insufficient for reliable automated inspection. The frame may be too dark, blurred, or obstructed.`,
        recommendedAction: 'Capture a higher-resolution, well-lit, centered photo of the asset.'
      };
    }
    return {
      isEligible: false,
      status: 'NOT SUPPORTED',
      reason: 'The image could not be verified as a recognized infrastructure or industrial asset.',
      recommendedAction: 'Upload a clear image of an industrial machine, electrical panel, bridge, road, or civil structure.'
    };
  }

  // 3. Medium Confidence (40% - 69%): Asset broadly recognizable but exact subtype uncertain
  // -> ELIGIBLE: Inspect visible condition, clearly indicate uncertainty (Rule Requirement)
  if (confidence >= 40 && confidence < 70) {
    return {
      isEligible: true,
      status: 'SUPPORTED',
      reason: `Asset broadly recognized (${catNormalized}) with moderate confidence (${confidence}%). Eligible for visual condition assessment with subtype uncertainty noted.`,
      recommendedAction: 'Proceed with visual defect analysis. Verify specific component tag on-site.'
    };
  }

  // 4. High Confidence (>= 70%): Asset clearly recognizable -> Fully Eligible
  return {
    isEligible: true,
    status: 'SUPPORTED',
    reason: `Asset verified as ${catNormalized} with high confidence (${confidence}%). Eligible for visual defect detection and condition scoring.`,
    recommendedAction: 'Proceed with visual defect inspection and anomaly mapping.'
  };
}
