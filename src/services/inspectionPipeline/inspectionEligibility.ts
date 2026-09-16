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

const SUPPORTED_INSPECTABLE_CATEGORIES = new Set<AssetCategory>([
  'Road',
  'Bridge',
  'Building',
  'Industrial Machinery',
  'Electrical Pole',
  'Pipeline',
  'Solar Panel',
  'Railway Infrastructure',
  'Vehicle / Equipment'
]);

const CONFIDENCE_THRESHOLD = 70; // 70% threshold as requested in Section 3

export function checkInspectionEligibility(
  category: AssetCategory,
  confidence: number
): EligibilityResult {
  // 1. Check if category is in the unsupported set
  if (!SUPPORTED_INSPECTABLE_CATEGORIES.has(category)) {
    let specificReason = 'The uploaded image does not appear to contain a supported inspectable asset.';

    if (category === 'Person / Human') {
      specificReason = 'Structural infrastructure defects cannot be reliably assessed from this image.';
    } else if (category === 'Animal') {
      specificReason = 'Living organisms and animals are outside the scope of industrial defect metrology.';
    } else if (category === 'Indoor Room') {
      specificReason = 'Domestic interiors, furniture, and living spaces do not constitute inspectable industrial assets.';
    } else if (category === 'Landscape') {
      specificReason = 'Natural landscapes and open scenery lack physical structural engineering elements.';
    } else if (category === 'Unknown / Unsupported') {
      specificReason = 'Unable to verify an engineering subject. The image does not match any recognized industrial asset.';
    }

    return {
      isEligible: false,
      status: 'NOT SUPPORTED',
      reason: specificReason,
      recommendedAction: 'Please upload an asset image such as a road, bridge, building, machine, pipeline or solar panel.'
    };
  }

  // 2. If supported category, check confidence threshold (Section 3: below 70% -> Manual verification required)
  if (confidence < CONFIDENCE_THRESHOLD) {
    return {
      isEligible: false,
      status: 'MANUAL_VERIFICATION_REQUIRED',
      reason: `Classification confidence (${confidence}%) is below the required ${CONFIDENCE_THRESHOLD}% threshold. Automated flaw metrology has been paused to prevent false-positive conclusions.`,
      recommendedAction: 'Manual verification required. Have a field officer confirm the asset category or capture a clearer, centered photo.'
    };
  }

  // 3. Supported and confidence >= 70%
  return {
    isEligible: true,
    status: 'SUPPORTED',
    reason: `Asset verified as ${category} with ${confidence}% confidence. Eligible for visual defect detection.`,
    recommendedAction: 'Proceed with visual defect inspection and anomaly mapping.'
  };
}
