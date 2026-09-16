/**
 * Structured Types for AI Asset Validation and Inspection Pipeline
 */

export type AssetCategory =
  | 'Road'
  | 'Bridge'
  | 'Building'
  | 'Industrial Machinery'
  | 'Electrical Pole'
  | 'Pipeline'
  | 'Solar Panel'
  | 'Railway Infrastructure'
  | 'Vehicle / Equipment'
  | 'Person / Human'
  | 'Animal'
  | 'Indoor Room'
  | 'Landscape'
  | 'Unknown / Unsupported';

export type InspectionInputType = 'static_image' | 'video' | 'camera';

export type DefectSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface VisualDefect {
  id: string;
  type: string;
  name: string;
  confidence: number; // 0 - 100
  confidenceLabel: string; // e.g. "91%" or "Model confidence unavailable"
  severity: DefectSeverity;
  visualEvidence: string;
  aiObservation: string;
  engineeringAssessment: string;
  boundingBox?: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number;
    height: number;
  };
  color: 'critical' | 'attention' | 'healthy';
  icon: string;
  tag: string;
  limitations?: string;
  sourceCitation?: {
    title: string;
    sourceName: string;
    url: string;
    reliabilityLevel?: string;
  };
}

export interface HealthScoreBreakdown {
  isAvailable: boolean;
  finalScore: number; // 0 - 100
  unavailabilityReason?: string;
  components: {
    visualCondition: { score: number; weight: number; contribution: number };
    defectCondition: { score: number; weight: number; contribution: number };
    severityPenalty: { score: number; weight: number; contribution: number };
    confidenceFactor: { score: number; weight: number; contribution: number };
  };
  explanation: string;
}

export interface RecommendedNextStep {
  step: number;
  title: string;
  detail: string;
  timing?: string;
  type: 'review' | 'capture' | 'measurement' | 'assessment' | 'repair_planning';
}

export interface HistoricalComparisonResult {
  hasHistoricalData: boolean;
  message: string;
  previousAudit?: {
    id: string;
    date: string;
    score: number;
    defectsCount: number;
    inspectorName: string;
  };
  deltaScore?: number;
  deltaDefects?: number;
  conditionTrend?: 'improving' | 'stable' | 'deteriorating';
  trendDetails?: string;
}

export interface SensorTelemetryData {
  hasSensorData: boolean;
  temperature?: { value: number; unit: string; status: 'nominal' | 'elevated' | 'critical' };
  vibration?: { value: number; unit: string; status: 'nominal' | 'elevated' | 'critical' };
  pressure?: { value: number; unit: string; status: 'nominal' | 'elevated' | 'critical' };
  ultrasonicThickness?: { value: number; unit: string; status: 'nominal' | 'elevated' | 'critical' };
  sourceNote: string;
}

export interface PipelineInspectionResult {
  inspectionId: string;
  assetId: string;
  assetName: string;
  detectedCategory: AssetCategory;
  classificationConfidence: number; // 0 - 100
  classificationConfidenceLabel: string;
  inspectionEligible: boolean;
  inspectionStatus: 'SUPPORTED' | 'NOT SUPPORTED' | 'MANUAL_VERIFICATION_REQUIRED';
  ineligibilityReason?: string;
  inputType: InspectionInputType;
  inputSourceLabel: string; // "Uploaded Image" | "Uploaded Video" | "Real-Time Camera"
  inspectionModeTitle: string; // "AI Visual Inspection" vs "Real-Time AI Inspection"
  inspectionTimestamp: string; // ISO 8601
  formattedDate: string;
  defects: VisualDefect[];
  healthScore: HealthScoreBreakdown;
  recommendedSteps: RecommendedNextStep[];
  historicalComparison: HistoricalComparisonResult;
  sensorTelemetry: SensorTelemetryData;
  summaryObservation: string;
  engineeringNotice: string;
  sourceCitation?: string;
  technicalContext?: string;
  knowledgeSources?: Array<{
    id: string;
    title: string;
    sourceName?: string;
    source_name?: string;
    url?: string;
    reliabilityLevel?: string;
    reliability_level?: string;
  }>;
  limitations?: string[];
  evidenceValidation?: {
    isSupported: boolean;
    evidenceChecks: string[];
    reasoning: string;
  };
  limitationsOfVisualInspection?: string[];
  auditTraceId?: string;
  isDemoData: boolean;
  modelUsed: string;
  mediaUrl: string;
}
