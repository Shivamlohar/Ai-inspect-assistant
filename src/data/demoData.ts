/**
 * Isolated Demo Mode Dataset (Section 20)
 * Provides verified demonstration assets for presentations/hackathons.
 * Every item is explicitly marked as `isDemoData: true`.
 * Real uploads NEVER pull from this file.
 */

import {
  industrialMotorImg,
  bridge102Img,
  pipelinePlImg
} from '../assets/assetImages';
import type { PipelineInspectionResult } from '../services/inspectionPipeline/types';

export interface DemoPreset {
  id: string;
  name: string;
  assetId: string;
  category: string;
  image: string;
  note: string;
  simulatedInspection: Partial<PipelineInspectionResult>;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo-motor-401',
    name: 'Industrial Motor M-401',
    assetId: 'MACH-M401-DEMO',
    category: 'Industrial Machinery',
    image: industrialMotorImg,
    note: 'Mechanical motor assembly with surface oxidation and visible vibration collar wear.',
    simulatedInspection: {
      inspectionId: 'DEMO-INSP-401',
      assetId: 'MACH-M401-DEMO',
      assetName: 'Industrial Motor M-401 (Demonstration Unit)',
      detectedCategory: 'Industrial Machinery',
      classificationConfidence: 94,
      classificationConfidenceLabel: '94%',
      inspectionEligible: true,
      inspectionStatus: 'SUPPORTED',
      inputType: 'static_image',
      inputSourceLabel: 'Uploaded Image (Demo Preset)',
      inspectionModeTitle: 'AI Visual Inspection',
      isDemoData: true,
      summaryObservation: 'DEMO DATA: Visual anomalies identified on motor stator housing and drive collar.',
      engineeringNotice: 'DEMO DATA: Simulated demonstration dataset for evaluation.',
      defects: [
        {
          id: 'DEMO_DEFECT_1',
          type: 'surface_crack',
          name: 'COLLAR SURFACE CRACK',
          confidence: 91,
          confidenceLabel: '91%',
          severity: 'MEDIUM',
          visualEvidence: 'Visible linear surface discontinuity observed on outer flange collar. Physical crack dimensions require calibrated measurement equipment or a reference scale.',
          aiObservation: 'AI VISUAL OBSERVATION: Circumferential hairline fissure identified near mechanical seal boundary.',
          engineeringAssessment: 'ENGINEERING ASSESSMENT: Potential structural concern detected — professional engineering assessment recommended.',
          color: 'attention',
          icon: '🟡',
          tag: 'Medium Priority Defect'
        },
        {
          id: 'DEMO_DEFECT_2',
          type: 'corrosion',
          name: 'SURFACE OXIDATION & RUST',
          confidence: 88,
          confidenceLabel: '88%',
          severity: 'LOW',
          visualEvidence: 'Localized surface iron-oxide discoloration along lower perimeter. Substrate metal remains intact.',
          aiObservation: 'AI VISUAL OBSERVATION: Discoloration consistent with superficial atmospheric oxidation.',
          engineeringAssessment: 'ENGINEERING ASSESSMENT: Superficial surface rust. Track during standard maintenance intervals.',
          color: 'healthy',
          icon: '🟢',
          tag: 'Low Priority Defect'
        }
      ],
      healthScore: {
        isAvailable: true,
        finalScore: 78,
        components: {
          visualCondition: { score: 85, weight: 0.40, contribution: 34 },
          defectCondition: { score: 75, weight: 0.30, contribution: 22.5 },
          severityPenalty: { score: 70, weight: 0.20, contribution: 14 },
          confidenceFactor: { score: 85, weight: 0.10, contribution: 8.5 }
        },
        explanation: 'DEMO CALCULATION: Visual (85 × 40%) + Defects (75 × 30%) + Severity (70 × 20%) + Confidence (85 × 10%) = 79.'
      }
    }
  },
  {
    id: 'demo-bridge-102',
    name: 'Highway Viaduct Bridge #102',
    assetId: 'BRG-102-DEMO',
    category: 'Bridge',
    image: bridge102Img,
    note: 'Reinforced concrete pier column displaying vertical tensile fissure and minor surface spalling.',
    simulatedInspection: {
      inspectionId: 'DEMO-INSP-102',
      assetId: 'BRG-102-DEMO',
      assetName: 'Highway Viaduct Bridge #102 (Demonstration Unit)',
      detectedCategory: 'Bridge',
      classificationConfidence: 96,
      classificationConfidenceLabel: '96%',
      inspectionEligible: true,
      inspectionStatus: 'SUPPORTED',
      inputType: 'static_image',
      inputSourceLabel: 'Uploaded Image (Demo Preset)',
      inspectionModeTitle: 'AI Visual Inspection',
      isDemoData: true,
      summaryObservation: 'DEMO DATA: Concrete pier shear crack and surface spalling detected.',
      engineeringNotice: 'DEMO DATA: Simulated demonstration dataset for evaluation.',
      defects: [
        {
          id: 'DEMO_DEFECT_BRG_1',
          type: 'surface_crack',
          name: 'VERTICAL PIER CRACK',
          confidence: 93,
          confidenceLabel: '93%',
          severity: 'HIGH',
          visualEvidence: 'Continuous vertical fissure traversing load-bearing pier column. Physical dimensions require calibrated measurement equipment or a reference scale.',
          aiObservation: 'AI VISUAL OBSERVATION: High-contrast vertical shear fissure detected in tension zone.',
          engineeringAssessment: 'ENGINEERING ASSESSMENT: Potential structural concern detected — professional engineering assessment recommended.',
          color: 'critical',
          icon: '🔴',
          tag: 'High Priority Defect'
        },
        {
          id: 'DEMO_DEFECT_BRG_2',
          type: 'concrete_spalling',
          name: 'CONCRETE SPALLING & DELAMINATION',
          confidence: 86,
          confidenceLabel: '86%',
          severity: 'MEDIUM',
          visualEvidence: 'Detached surface concrete layer exposing rough aggregate.',
          aiObservation: 'AI VISUAL OBSERVATION: Concrete cover delamination observed near joint interface.',
          engineeringAssessment: 'ENGINEERING ASSESSMENT: Cover concrete detachment requires field review before moisture ingress reaches internal rebar.',
          color: 'attention',
          icon: '🟡',
          tag: 'Medium Priority Defect'
        }
      ],
      healthScore: {
        isAvailable: true,
        finalScore: 68,
        components: {
          visualCondition: { score: 80, weight: 0.40, contribution: 32 },
          defectCondition: { score: 60, weight: 0.30, contribution: 18 },
          severityPenalty: { score: 40, weight: 0.20, contribution: 8 },
          confidenceFactor: { score: 90, weight: 0.10, contribution: 9 }
        },
        explanation: 'DEMO CALCULATION: Visual (80 × 40%) + Defects (60 × 30%) + Severity (40 × 20%) + Confidence (90 × 10%) = 67.'
      }
    }
  },
  {
    id: 'demo-pipeline-201',
    name: 'High-Pressure Pipeline PL-201',
    assetId: 'PIPE-PL201-DEMO',
    category: 'Pipeline',
    image: pipelinePlImg,
    note: 'Industrial transfer pipeline section exhibiting localized surface corrosion.',
    simulatedInspection: {
      inspectionId: 'DEMO-INSP-201',
      assetId: 'PIPE-PL201-DEMO',
      assetName: 'High-Pressure Pipeline PL-201 (Demonstration Unit)',
      detectedCategory: 'Pipeline',
      classificationConfidence: 92,
      classificationConfidenceLabel: '92%',
      inspectionEligible: true,
      inspectionStatus: 'SUPPORTED',
      inputType: 'static_image',
      inputSourceLabel: 'Uploaded Image (Demo Preset)',
      inspectionModeTitle: 'AI Visual Inspection',
      isDemoData: true,
      summaryObservation: 'DEMO DATA: Localized oxidation observed along pipe external curvature.',
      engineeringNotice: 'DEMO DATA: Simulated demonstration dataset for evaluation.',
      defects: [
        {
          id: 'DEMO_DEFECT_PL_1',
          type: 'corrosion',
          name: 'EXTERNAL SURFACE CORROSION',
          confidence: 89,
          confidenceLabel: '89%',
          severity: 'MEDIUM',
          visualEvidence: 'Substrate oxidation and blistered protective coating. Ultrasonic thickness measurement required for wall loss calculation.',
          aiObservation: 'AI VISUAL OBSERVATION: Surface discoloration indicating protective barrier degradation.',
          engineeringAssessment: 'ENGINEERING ASSESSMENT: Non-destructive ultrasonic thickness testing recommended to determine remaining wall section.',
          color: 'attention',
          icon: '🟡',
          tag: 'Medium Priority Defect'
        }
      ],
      healthScore: {
        isAvailable: true,
        finalScore: 82,
        components: {
          visualCondition: { score: 85, weight: 0.40, contribution: 34 },
          defectCondition: { score: 80, weight: 0.30, contribution: 24 },
          severityPenalty: { score: 70, weight: 0.20, contribution: 14 },
          confidenceFactor: { score: 90, weight: 0.10, contribution: 9 }
        },
        explanation: 'DEMO CALCULATION: Visual (85 × 40%) + Defects (80 × 30%) + Severity (70 × 20%) + Confidence (90 × 10%) = 81.'
      }
    }
  }
];
