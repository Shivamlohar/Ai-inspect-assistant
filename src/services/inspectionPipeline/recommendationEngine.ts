/**
 * Recommendation Engine Service
 * Generates safe evidence-based next inspection workflows.
 * Avoids independently prescribing engineering repair procedures.
 */

import type { RecommendedNextStep, VisualDefect } from './types';

export function generateRecommendedSteps(
  isEligible: boolean,
  defects: VisualDefect[]
): RecommendedNextStep[] {
  // 1. If subject is unsupported (e.g. Person, Animal, Room)
  if (!isEligible) {
    return [
      {
        step: 1,
        title: 'Verify Asset Target',
        detail: 'Ensure the photo depicts an infrastructure component, civil structure, or industrial machine.',
        type: 'review'
      },
      {
        step: 2,
        title: 'Upload Supported Asset',
        detail: 'Upload an image of a supported category (e.g., Road, Bridge, Building, Industrial Machine, Pipeline, Solar Panel).',
        type: 'capture'
      }
    ];
  }

  // 2. If eligible and NO defects detected
  if (!defects || defects.length === 0) {
    return [
      {
        step: 1,
        title: 'Confirm Baseline Coverage',
        detail: 'Verify that all critical sides and mechanical angles of the asset were captured in the current inspection frame.',
        type: 'review'
      },
      {
        step: 2,
        title: 'Maintain Standard Monitoring Cycle',
        detail: 'Visual surface condition appears nominal. Log this clean audit and resume standard scheduled maintenance intervals.',
        type: 'assessment'
      }
    ];
  }

  // 3. If defects exist, provide the standard 5-step evidence-based workflow (Section 10)
  return [
    {
      step: 1,
      title: 'Review the detected area manually',
      detail: 'Inspect the flagged surface region on-site to confirm whether lighting, shadow, or surface discoloration caused optical artifacting.',
      timing: 'Immediate',
      type: 'review'
    },
    {
      step: 2,
      title: 'Capture additional close-up images',
      detail: 'Record higher-resolution orthogonal photos and macro perspectives under uniform, non-glare illumination.',
      timing: 'Day 1',
      type: 'capture'
    },
    {
      step: 3,
      title: 'Perform calibrated measurement if dimensions are required',
      detail: 'Deploy certified measurement tools (e.g., optical crack gauge, feeler gauge, or calibrated reference scale) rather than relying on 2D uncalibrated estimates.',
      timing: 'Day 2',
      type: 'measurement'
    },
    {
      step: 4,
      title: 'Have a qualified inspector/engineer assess the defect',
      detail: 'A certified structural engineer or NDT specialist must evaluate whether the finding impacts load capacity or operational safety.',
      timing: 'Day 3-5',
      type: 'assessment'
    },
    {
      step: 5,
      title: 'Schedule repair based on the verified inspection result',
      detail: 'Determine maintenance priority and execute appropriate remediation protocols strictly following certified engineering sign-off.',
      timing: 'Post-Approval',
      type: 'repair_planning'
    }
  ];
}
