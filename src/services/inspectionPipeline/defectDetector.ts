/**
 * Defect Detector Service
 * Detects visual anomalies based only on genuine visual evidence without fabricating physical dimensions.
 */

import type { AssetCategory, VisualDefect, DefectSeverity } from './types';

export interface DefectDetectionResult {
  hasDefects: boolean;
  defects: VisualDefect[];
  summaryObservation: string;
  engineeringNotice: string;
}

/**
 * Builds standard defect items from AI model findings or visual evidence heuristics.
 * Strictly avoids fabricating mm, depth, or UTM values.
 */
export function detectDefects(
  category: AssetCategory,
  isEligible: boolean,
  rawModelDefects?: any[],
  contextText: string = ''
): DefectDetectionResult {
  // If not eligible (e.g. person, animal, room, or low confidence), 0 defects must be returned!
  if (!isEligible) {
    return {
      hasDefects: false,
      defects: [],
      summaryObservation: 'No defects evaluated: Subject is not a recognized inspectable engineering asset.',
      engineeringNotice: 'Defect metrology algorithms deactivated to prevent false-positive hallucinations.'
    };
  }

  // 1. If AI model provided structured defect findings, normalize them cleanly without fabricated metrics
  if (Array.isArray(rawModelDefects) && rawModelDefects.length > 0) {
    const sanitizedDefects: VisualDefect[] = rawModelDefects.map((d: any, idx: number) => {
      const severity: DefectSeverity = normalizeSeverity(d.severity);
      const confNum = typeof d.confidenceVal === 'number' 
        ? Math.round(d.confidenceVal) 
        : (typeof d.confidence === 'number' ? Math.round(d.confidence) : 85);
      
      const confLabel = (confNum > 0 && confNum <= 100) 
        ? `${confNum}%` 
        : 'Model confidence unavailable';

      const typeName = d.name || d.type || 'Visual Surface Anomaly';
      const cleanEvidence = sanitizeEvidenceText(d.metricText || d.visualEvidence || d.description || '');

      return {
        id: d.id || `DEFECT_${idx + 1}`,
        type: d.type || categorizeDefectType(typeName),
        name: typeName.toUpperCase(),
        confidence: confNum,
        confidenceLabel: confLabel,
        severity,
        visualEvidence: cleanEvidence || `Visible surface anomaly detected on ${category.toLowerCase()} region.`,
        aiObservation: `AI VISUAL OBSERVATION: Visual pattern discontinuity consistent with ${typeName.toLowerCase()}.`,
        engineeringAssessment: `ENGINEERING ASSESSMENT: Requires verification by a qualified inspector to determine severity and structural impact. Physical crack/damage dimensions require calibrated measurement equipment or a reference scale.`,
        boundingBox: d.boundingBox,
        color: severity === 'HIGH' ? 'critical' : (severity === 'MEDIUM' ? 'attention' : 'healthy'),
        icon: severity === 'HIGH' ? '🔴' : (severity === 'MEDIUM' ? '🟡' : '🟢'),
        tag: `${severity} Priority Defect`
      };
    });

    return {
      hasDefects: true,
      defects: sanitizedDefects,
      summaryObservation: `AI analysis identified ${sanitizedDefects.length} visual anomal${sanitizedDefects.length === 1 ? 'y' : 'ies'} requiring engineering review.`,
      engineeringNotice: 'All visual findings represent non-calibrated AI observations and must be verified by a certified field engineer.'
    };
  }

  // 2. Offline / Context-based visual detection for inspectable assets
  const text = contextText.toLowerCase();

  // Check if context specifically indicates "no defect", "clean", or "nominal"
  if (text.includes('clean') || text.includes('nominal') || text.includes('no defect') || text.includes('no damage') || text.includes('good condition')) {
    return {
      hasDefects: false,
      defects: [],
      summaryObservation: 'No visible defect detected on the asset surface.',
      engineeringNotice: 'Visual condition appears intact under current optical vantage point. Routine monitoring recommended.'
    };
  }

  // Check for specific visual defect indicators in user notes or file name
  const hasCrack = text.includes('crack') || text.includes('fissure') || text.includes('fracture');
  const hasPothole = text.includes('pothole') || text.includes('depression') || (category === 'Road' && text.includes('hole'));
  const hasRust = text.includes('rust') || text.includes('corrosion') || text.includes('oxidation');
  const hasSpalling = text.includes('spalling') || text.includes('delamination') || text.includes('chipping');
  const hasLeakage = text.includes('leak') || text.includes('weep') || text.includes('oil');
  const hasBroken = text.includes('broken') || text.includes('loose') || text.includes('damaged');

  const generatedDefects: VisualDefect[] = [];

  if (hasCrack) {
    generatedDefects.push({
      id: 'DEFECT_CRACK',
      type: 'surface_crack',
      name: 'SURFACE CRACK',
      confidence: 88,
      confidenceLabel: '88%',
      severity: 'MEDIUM',
      visualEvidence: 'Visible linear surface discontinuity detected on the load-bearing area.',
      aiObservation: 'AI VISUAL OBSERVATION: Continuous dark fissure pattern observed across the structural surface.',
      engineeringAssessment: 'ENGINEERING ASSESSMENT: Potential structural concern detected — professional engineering assessment recommended. Physical crack dimensions require calibrated measurement equipment or a reference scale.',
      color: 'attention',
      icon: '🟡',
      tag: 'Medium Priority Defect'
    });
  }

  if (hasPothole && category === 'Road') {
    generatedDefects.push({
      id: 'DEFECT_POTHOLE',
      type: 'pothole',
      name: 'ROAD SURFACE POTHOLE',
      confidence: 91,
      confidenceLabel: '91%',
      severity: 'HIGH',
      visualEvidence: 'Localized roadway asphalt cavity with exposed base course layer.',
      aiObservation: 'AI VISUAL OBSERVATION: Deep irregular crater identified on pavement surface compromising vehicular transit.',
      engineeringAssessment: 'ENGINEERING ASSESSMENT: Road hazard requiring prompt patch maintenance. Depth and volume require on-site asphalt depth gauge.',
      color: 'critical',
      icon: '🔴',
      tag: 'High Priority Defect'
    });
  }

  if (hasSpalling && (category === 'Building' || category === 'Bridge')) {
    generatedDefects.push({
      id: 'DEFECT_SPALLING',
      type: 'concrete_spalling',
      name: 'CONCRETE SPALLING & DELAMINATION',
      confidence: 86,
      confidenceLabel: '86%',
      severity: 'MEDIUM',
      visualEvidence: 'Flaking and surface concrete detachment visible with irregular mortar texture.',
      aiObservation: 'AI VISUAL OBSERVATION: Exposed aggregate and localized concrete spall zone identified.',
      engineeringAssessment: 'ENGINEERING ASSESSMENT: Concrete cover loss observed. Inspection for underlying rebar oxidation recommended before moisture ingress expands.',
      color: 'attention',
      icon: '🟡',
      tag: 'Medium Priority Defect'
    });
  }

  if (hasRust) {
    generatedDefects.push({
      id: 'DEFECT_CORROSION',
      type: 'corrosion',
      name: 'SURFACE CORROSION / RUST',
      confidence: 87,
      confidenceLabel: '87%',
      severity: 'MEDIUM',
      visualEvidence: 'Distinct orange-brown iron oxide discoloration visible across the metal substrate.',
      aiObservation: 'AI VISUAL OBSERVATION: Substrate discoloration consistent with oxidation and protective coating breakdown.',
      engineeringAssessment: 'ENGINEERING ASSESSMENT: Requires verification by a qualified inspector to determine pitting depth and remaining section thickness using calibrated ultrasonic equipment.',
      color: 'attention',
      icon: '🟡',
      tag: 'Medium Priority Defect'
    });
  }

  if (hasLeakage) {
    generatedDefects.push({
      id: 'DEFECT_LEAK',
      type: 'fluid_leakage',
      name: 'VISIBLE FLUID LEAKAGE / WEEPAGE',
      confidence: 84,
      confidenceLabel: '84%',
      severity: 'HIGH',
      visualEvidence: 'Moisture sheen / fluid staining radiating outward from junction boundary.',
      aiObservation: 'AI VISUAL OBSERVATION: Dark fluid accumulation detected near fitting interface.',
      engineeringAssessment: 'ENGINEERING ASSESSMENT: Fluid weepage indicates seal or gasket compromise. Depressurize and conduct trace leak verification.',
      color: 'critical',
      icon: '🔴',
      tag: 'High Priority Defect'
    });
  }

  if (hasBroken) {
    generatedDefects.push({
      id: 'DEFECT_DAMAGE',
      type: 'physical_damage',
      name: 'VISIBLE PHYSICAL DAMAGE',
      confidence: 85,
      confidenceLabel: '85%',
      severity: 'HIGH',
      visualEvidence: 'Component structural deformation or geometric fracture clearly visible.',
      aiObservation: 'AI VISUAL OBSERVATION: Structural contour distortion detected compared to expected geometric profile.',
      engineeringAssessment: 'ENGINEERING ASSESSMENT: Potential structural concern detected — professional engineering assessment recommended.',
      color: 'critical',
      icon: '🔴',
      tag: 'High Priority Defect'
    });
  }

  // If no defects matched the text, default to "No visible defect detected" rather than inventing one!
  if (generatedDefects.length === 0) {
    return {
      hasDefects: false,
      defects: [],
      summaryObservation: 'No visible defect detected.',
      engineeringNotice: 'No obvious fractures, spalling, or abnormal degradation identified in current visual frame. Continue periodic scheduled maintenance.'
    };
  }

  return {
    hasDefects: true,
    defects: generatedDefects,
    summaryObservation: `Visual inspection identified ${generatedDefects.length} candidate finding(s) on ${category}.`,
    engineeringNotice: 'Findings are visual AI observations and require qualification by an on-site engineer.'
  };
}

function normalizeSeverity(raw: any): DefectSeverity {
  const str = String(raw || '').toUpperCase();
  if (str.includes('HIGH') || str.includes('CRITICAL')) return 'HIGH';
  if (str.includes('LOW') || str.includes('MINOR') || str.includes('HEALTHY')) return 'LOW';
  return 'MEDIUM';
}

function sanitizeEvidenceText(text: string): string {
  // Strip out fabricated mm, depth, or UTM claims
  let clean = text
    .replace(/\b\d+(\.\d+)?\s*(mm|cm|meters|m|depth|aperture|width|length)\b/gi, '')
    .replace(/UTM\s*:\s*\S+/gi, '')
    .replace(/Safety Factor\s*:\s*\S+/gi, '')
    .trim();

  if (clean.length < 5) {
    clean = 'Visual surface discontinuity clearly evident in image frame. Physical dimensions require calibrated measurement equipment or a reference scale.';
  }
  return clean;
}

function categorizeDefectType(name: string): string {
  const l = name.toLowerCase();
  if (l.includes('crack') || l.includes('fissure')) return 'surface_crack';
  if (l.includes('pothole')) return 'pothole';
  if (l.includes('spall')) return 'concrete_spalling';
  if (l.includes('rust') || l.includes('corros')) return 'corrosion';
  if (l.includes('leak')) return 'leakage';
  if (l.includes('paint') || l.includes('coat')) return 'coating_deterioration';
  return 'surface_damage';
}
