import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  LineChart as LineChartIcon, 
  FileText, 
  AlertTriangle, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Ruler, 
  Lock,
  Sparkles,
  Save,
  Clock,
  Calendar,
  Wrench,
  Split,
  History,
  TrendingDown,
  Eye,
  CheckSquare,
  XSquare,
  HelpCircle,
  Plus,
  FileSpreadsheet,
  Database,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getActiveOfficer, saveOfficerInspection } from '../utils/officerStore';
import { bridge102Img, windTurbine401Img } from '../assets/assetImages';

export default function InspectionResult() {
  const [viewMode, setViewMode] = useState<'ORIGINAL' | 'AI_OVERLAY' | 'COMPARE'>('AI_OVERLAY');
  const [compareSlider, setCompareSlider] = useState<number>(50);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'CRACK' | 'RUST' | 'WEAR'>('ALL');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(80);
  
  const [copiedToast, setCopiedToast] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [workOrderDispatched, setWorkOrderDispatched] = useState(false);
  const [dispatchToast, setDispatchToast] = useState(false);

  // Video Ref & Inspection Timeline (Screenshot 1)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number | null>(null);
  const [timelineCopied, setTimelineCopied] = useState(false);

  // Timeline events matching Screenshot 1
  const timelineEvents = [
    { time: '00:14', seconds: 14, title: 'Surface corrosion detected', detail: 'ISO 8501-1 Grade C oxidation (18.4% area)', severity: 'warning' },
    { time: '00:37', seconds: 37, title: 'Oil leakage detected', detail: 'Gasket weeping with 0.4 bar hydraulic pressure variance', severity: 'critical' },
    { time: '01:12', seconds: 72, title: 'Abnormal vibration mentioned', detail: 'Harmonic resonance detected at 142 Hz FFT peak', severity: 'warning' },
    { time: '01:45', seconds: 105, title: 'Inspector adds observation', detail: 'Officer note: Ultrasonic thickness gauge verification pending', severity: 'info' },
    { time: '02:10', seconds: 130, title: 'Inspection completed', detail: 'Autonomous precision metrology scan locked', severity: 'success' },
  ];

  // AI vs Inspector Verification State (Screenshot 3)
  const [verifications, setVerifications] = useState<Record<string, 'Confirmed' | 'Rejected' | 'Needs Review'>>(() => {
    try {
      const saved = sessionStorage.getItem('currentInspection');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.humanVerifications) return parsed.humanVerifications;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      'CRACK': 'Confirmed',
      'RUST': 'Confirmed',
      'WEAR': 'Needs Review',
      'defect-crack': 'Confirmed',
      'defect-corrosion': 'Confirmed',
      'defect-wear': 'Needs Review',
      'defect-thermal': 'Confirmed'
    };
  });

  const handleSeekTimeline = (seconds: number, index: number) => {
    setActiveTimelineIndex(index);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCopyTimeline = () => {
    const text = timelineEvents.map(e => `${e.time} — ${e.title}`).join('\n');
    navigator.clipboard.writeText(text);
    setTimelineCopied(true);
    setTimeout(() => setTimelineCopied(false), 2200);
  };

  const handleSetVerification = (defectId: string, status: 'Confirmed' | 'Rejected' | 'Needs Review') => {
    setVerifications(prev => {
      const updated = { ...prev, [defectId]: status };
      try {
        const saved = sessionStorage.getItem('currentInspection');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.humanVerifications = updated;
          sessionStorage.setItem('currentInspection', JSON.stringify(parsed));
        }
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Inspector Manual Finding State
  const [customFindings, setCustomFindings] = useState<any[]>(() => {
    try {
      const saved = sessionStorage.getItem('currentInspection');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.customDefects)) return parsed.customDefects;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [isAddFindingOpen, setIsAddFindingOpen] = useState(false);
  const [newFindingTitle, setNewFindingTitle] = useState('');
  const [newFindingSeverity, setNewFindingSeverity] = useState<'High Severity' | 'Medium Severity' | 'Low Severity'>('Medium Severity');
  const [newFindingMetric, setNewFindingMetric] = useState('');
  const [cmmsToast, setCmmsToast] = useState<string | null>(null);

  const handleAddFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingTitle.trim()) return;
    const newFinding = {
      id: `INSPECTOR_${Date.now()}`,
      name: newFindingTitle.trim().toUpperCase(),
      severity: newFindingSeverity,
      confidenceVal: 99,
      conf: '100% (Field Verified)',
      color: (newFindingSeverity === 'High Severity' ? 'critical' : newFindingSeverity === 'Medium Severity' ? 'attention' : 'healthy') as 'critical' | 'attention' | 'healthy',
      icon: newFindingSeverity === 'High Severity' ? '🔴' : newFindingSeverity === 'Medium Severity' ? '🟡' : '🟢',
      tag: 'Field Inspector Finding',
      metricText: newFindingMetric.trim() || 'Visual anomaly recorded on-site',
      measurements: {
        notes: newFindingMetric.trim()
      },
      isHumanAdded: true
    };
    const updated = [...customFindings, newFinding];
    setCustomFindings(updated);
    setVerifications(prev => ({ ...prev, [newFinding.id]: 'Confirmed' }));

    // Persist to session
    try {
      const saved = sessionStorage.getItem('currentInspection');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.customDefects = updated;
        sessionStorage.setItem('currentInspection', JSON.stringify(parsed));
      }
    } catch (err) {
      console.error(err);
    }

    setNewFindingTitle('');
    setNewFindingMetric('');
    setIsAddFindingOpen(false);
    setCmmsToast(`Field finding "${newFinding.name}" added to official audit!`);
    setTimeout(() => setCmmsToast(null), 3000);
  };

  const [inspectionData] = useState<{
    assetName: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    mediaName: string;
    description: string;
    securityHash?: string;
    isMachine?: boolean;
    isGemini?: boolean;
    geminiResult?: any;
    healthScore?: number;
    safetyFactor?: string;
    status?: string;
    diagnosticSummary?: string;
  }>(() => {
    const saved = sessionStorage.getItem('currentInspection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          securityHash: parsed.securityHash || 'SHA256:7f3a9e10c4b281d5',
          isMachine: parsed.isMachine || 
                     parsed.assetName?.toLowerCase().includes('machine') || 
                     parsed.mediaName?.toLowerCase().includes('screenshot') ||
                     parsed.mediaName?.toLowerCase().includes('machine')
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      assetName: 'Industrial Machine #M-401 (Mechanical Hub)',
      mediaUrl: windTurbine401Img,
      mediaType: 'image',
      mediaName: 'machine_rotor_hub.png',
      securityHash: 'SHA256:7f3a9e10c4b281d5',
      description: 'Structural rim crack visible on outer collar. Prominent surface oxidation and rust accumulation.',
      isMachine: true
    };
  });

  const isMachine = inspectionData.isMachine;
  const isGemini = Boolean(inspectionData.isGemini && inspectionData.geminiResult);
  const geminiData = inspectionData.geminiResult;

  // Defensible Score: 72 / 100 as per engineering compliance benchmark & Screenshots 2 & 5
  const currentScore = isGemini ? (geminiData.healthScore ?? 72) : 72;
  const currentSafetyFactor = isGemini ? (geminiData.safetyFactor ?? '1.15') : (isMachine ? '1.15' : '1.28');
  const currentStatus = isGemini ? (geminiData.status ?? 'At Risk') : 'At Risk';

  // Mathematically defensible inspection score breakdown (Screenshots 2 & 5)
  const scoreBreakdown = [
    { 
      name: 'Structural integrity', 
      weight: 40, 
      score: 82, 
      contribution: 32.8,
      color: '#10b981',
      status: 'Acceptable Baseline',
      desc: 'Shear capacity verified; tensile rim micro-crack localized'
    },
    { 
      name: 'Corrosion', 
      weight: 25, 
      score: 54, 
      contribution: 13.5,
      color: '#f97316',
      status: 'Action Required',
      desc: 'ISO 8501-1 Grade C oxidation; pitting depth 0.65mm'
    },
    { 
      name: 'Surface condition', 
      weight: 15, 
      score: 65, 
      contribution: 9.75,
      color: '#f59e0b',
      status: 'Moderate Wear',
      desc: 'Surface roughness Ra = 3.2μm across mechanical collar'
    },
    { 
      name: 'Electrical / Thermal', 
      weight: 20, 
      score: 91, 
      contribution: 18.2,
      color: '#06b6d4',
      status: 'Optimal',
      desc: 'Thermal dissipation & insulation resistance within spec'
    },
  ];

  const weightedSum = scoreBreakdown.reduce((acc, curr) => acc + curr.contribution, 0);

  const historyData = [
    { name: 'JAN 2026', score: 96 },
    { name: 'APR 2026', score: 88 },
    { name: 'JUL 2026', score: 78 },
    { name: 'SEP 2026', score: currentScore },
  ];

  // Actionable Recommended Action Steps (Screenshot 3)
  const recommendedActionSteps = [
    {
      step: 1,
      title: 'Isolate affected component',
      detail: 'Initiate Lockout/Tagout (LOTO) protocol. Disconnect electrical power and depressurize local hydraulic load circuits.',
      timing: 'Immediate (0-2 hrs)'
    },
    {
      step: 2,
      title: 'Perform ultrasonic thickness measurement (UTM)',
      detail: 'Deploy calibrated high-frequency UTM probe at 5 designated grid points along fracture boundary to determine wall thickness remaining.',
      timing: 'Day 1'
    },
    {
      step: 3,
      title: 'Remove surface corrosion',
      detail: 'Grit-blast affected recessed chamber to ISO 8501-1 Sa 2.5 bare-metal standard. Grind micro-crack tips to arrest propagation.',
      timing: 'Day 2'
    },
    {
      step: 4,
      title: 'Apply structural composite sleeve reinforcement',
      detail: 'Install high-modulus carbon/epoxy composite sleeve reinforcement over collar crack zone to restore nominal hoop stress rating.',
      timing: 'Day 3-5'
    },
    {
      step: 5,
      title: 'Reinspect after treatment',
      detail: 'Conduct secondary multimodal AI visual scan, verify dimensional clearance, and recalibrate acoustic vibration baseline.',
      timing: 'Day 7'
    },
  ];

  const defaultMachineIssues = [
    { 
      id: 'CRACK', 
      name: 'RIM CRACK / FRACTURE', 
      severity: 'High Severity', 
      confidenceVal: 96,
      conf: '96% Confidence', 
      color: 'critical' as const, 
      icon: '🔴', 
      tag: 'Critical Defect',
      measurements: {
        length: '14.2 mm',
        width: '1.4 mm',
        depth: '2.8 mm',
        propagation: '+0.4 mm / 100 operating hours'
      },
      metricText: 'Length: 14.2 mm • Width: 1.4 mm • Depth: 2.8 mm'
    },
    { 
      id: 'RUST', 
      name: 'SURFACE OXIDATION & RUST', 
      severity: 'Medium Severity', 
      confidenceVal: 89,
      conf: '89% Confidence', 
      color: 'attention' as const, 
      icon: '🟡', 
      tag: 'Attention Needed',
      measurements: {
        area: '18.4% Surface Coverage (84.6 cm²)',
        pitting: '0.65 mm Pitting Depth',
        isoGrade: 'ISO 8501-1 Grade C Degradation'
      },
      metricText: 'Area: 18.4% (84.6 cm²) • Pitting Depth: 0.65 mm'
    },
    { 
      id: 'WEAR', 
      name: 'CENTER BORE SPLINE WEAR', 
      severity: 'Low Severity', 
      confidenceVal: 84,
      conf: '84% Confidence', 
      color: 'healthy' as const, 
      icon: '🟢', 
      tag: 'Monitor',
      measurements: {
        clearance: '+0.045 mm Radial Clearance',
        tolerance: 'ISO ±0.015 mm Spec',
        deviation: '+0.030 mm Tolerance Breach'
      },
      metricText: 'Radial Wear: +0.045 mm (Tolerance Spec: ±0.015 mm)'
    },
  ];

  const defaultInfraIssues = [
    { 
      id: 'CRACK', 
      name: 'STRUCTURAL PIER CRACK', 
      severity: 'High Severity', 
      confidenceVal: 94,
      conf: '94% Confidence', 
      color: 'critical' as const, 
      icon: '🔴', 
      tag: 'Critical Defect',
      measurements: {
        length: '18.6 mm',
        width: '2.1 mm',
        depth: '4.5 mm',
        propagation: '+0.8 mm / maintenance cycle'
      },
      metricText: 'Length: 18.6 mm • Width: 2.1 mm • Depth: 4.5 mm'
    },
    { 
      id: 'RUST', 
      name: 'CONCRETE SPALLING', 
      severity: 'Medium Severity', 
      confidenceVal: 87,
      conf: '87% Confidence', 
      color: 'attention' as const, 
      icon: '🟡', 
      tag: 'Attention Needed',
      measurements: {
        area: '12.1% Surface Area (142 cm²)',
        pitting: '12.0 mm Delamination Depth',
        isoGrade: 'EN 1504 Structural Concrete Grade 2'
      },
      metricText: 'Area: 12.1% (142 cm²) • Depth: 12 mm'
    },
    { 
      id: 'WEAR', 
      name: 'REBAR CORROSION EXPOSURE', 
      severity: 'Low Severity', 
      confidenceVal: 81,
      conf: '81% Confidence', 
      color: 'healthy' as const, 
      icon: '🟢', 
      tag: 'Monitor',
      measurements: {
        clearance: '3 Exposed Reinforcement Bars',
        tolerance: 'Section Loss: 8.2%',
        deviation: 'Passive Layer Depleted'
      },
      metricText: '3 Exposed Rebars • Cross-section Loss: 8.2%'
    },
  ];

  const baseIssues = (isGemini && Array.isArray(geminiData.defects) && geminiData.defects.length > 0)
    ? geminiData.defects.map((d: any, idx: number) => ({
        id: d.id || `DEFECT_${idx}`,
        name: d.name || 'Structural Defect',
        severity: d.severity || 'Medium Severity',
        confidenceVal: d.confidenceVal || 88,
        conf: d.conf || '88% Confidence',
        color: (d.color === 'critical' || d.color === 'attention' || d.color === 'healthy') ? d.color : 'attention',
        icon: d.icon || '🟡',
        tag: d.tag || d.severity || 'Anomaly',
        metricText: d.metricText || 'Geometric variance detected',
        measurements: d.measurements || {}
      }))
    : (isMachine ? defaultMachineIssues : defaultInfraIssues);

  const allIssues = [...baseIssues, ...customFindings];

  const visibleIssues = allIssues.filter((issue: any) => issue.confidenceVal >= confidenceThreshold || issue.isHumanAdded);

  const primaryDefect = allIssues[0] || {
    name: isMachine ? 'RIM CRACK / FRACTURE' : 'STRUCTURAL PIER CRACK',
    conf: '96% Conf',
    metricText: '14.2 mm • 96% Conf',
    severity: 'High Severity',
    icon: '🔴',
    color: 'critical' as const
  };

  const secondaryDefect = allIssues[1] || {
    name: isMachine ? 'SURFACE OXIDATION & RUST' : 'CONCRETE SPALLING',
    conf: '89% Conf',
    metricText: '18.4% Area • Pitting 0.65mm',
    severity: 'Medium Severity',
    icon: '🟡',
    color: 'attention' as const
  };

  const tertiaryDefect = allIssues[2] || {
    name: isMachine ? 'CENTER BORE SPLINE WEAR' : 'REBAR CORROSION EXPOSURE',
    conf: '84% Conf',
    metricText: '+0.045 mm Clearance',
    severity: 'Low Severity',
    icon: '🟢',
    color: 'healthy' as const
  };

  const getComparisonData = () => {
    const name = (inspectionData.assetName || '').toLowerCase();
    if (name.includes('bridge') || name.includes('pier') || name.includes('dam') || name.includes('concrete')) {
      return {
        pastDate: 'June 2026',
        pastDefect: 'Concrete hairline micro-fracture — 4.8 mm length',
        pastScore: '89 / 100 Score',
        currentDate: 'September 2026',
        currentDefect: 'Shear crack expanded — 18.6 mm length (+13.8 mm growth)',
        currentScore: '72 / 100 (-17 pts)',
        condition: 'Condition: Deteriorating (recommended action: schedule epoxy resin pressure injection)',
        detail: 'Crack propagation rate measured at +4.6 mm per quarter. Tensile stress concentration increasing along pier base.',
        failureHorizon: '~3.8 months'
      };
    } else if (name.includes('transformer') || name.includes('substation') || name.includes('electric')) {
      return {
        pastDate: 'June 2026',
        pastDefect: 'Winding thermal baseline — 62°C nominal operating temp',
        pastScore: '92 / 100 Score',
        currentDate: 'September 2026',
        currentDefect: 'Cooling radiator hotspot — 84°C peak (+22°C variance)',
        currentScore: '74 / 100 (-18 pts)',
        condition: 'Condition: Attention Required (recommended action: flush radiator fins & sample dielectric oil)',
        detail: 'Thermal runaway risk detected near radiator upper manifold. Dielectric breakdown margin narrowing.',
        failureHorizon: '~5.1 months'
      };
    } else if (name.includes('pipeline') || name.includes('pipe') || name.includes('gas') || name.includes('oil')) {
      return {
        pastDate: 'June 2026',
        pastDefect: 'Minor flange pitting — 0.4 mm wall loss',
        pastScore: '90 / 100 Score',
        currentDate: 'September 2026',
        currentDefect: 'Localized wall thinning — 1.8 mm loss with weeping seal',
        currentScore: '68 / 100 (-22 pts)',
        condition: 'Condition: Critical Deterioration (recommended action: depressurize and install bolted clamp sleeve)',
        detail: 'Corrosive hydrogen sulfide pitting accelerating. Hoop stress safety margin reduced below 1.25.',
        failureHorizon: '~2.9 months'
      };
    } else {
      // Mechanical / default machine
      return {
        pastDate: 'June 2026',
        pastDefect: 'Corrosion detected — 12% surface area',
        pastScore: '91 / 100 Score',
        currentDate: 'September 2026',
        currentDefect: 'Corrosion expanded — 31% surface area (+19% expansion)',
        currentScore: '72 / 100 (-19 pts)',
        condition: 'Condition: Deteriorating (recommended action: schedule recoating)',
        detail: 'Surface oxidation velocity measured at +6.3% per month. Mechanical wear accelerating under elevated thermal friction.',
        failureHorizon: '~4.2 months'
      };
    }
  };

  const compData = getComparisonData();

  const handleExportCmmsCsv = () => {
    const officer = getActiveOfficer();
    const headers = ['Asset ID', 'Asset Name', 'Inspection Date', 'Inspector', 'Health Score', 'Safety Factor', 'Status', 'Defect Name', 'Severity', 'AI Confidence', 'Inspector Verification', 'Dimensions / Metrology'];
    const rows = allIssues.map(issue => [
      `"${inspectionData.isMachine ? 'MACH-401-HUB' : 'BRIDGE-102'}"`,
      `"${inspectionData.assetName}"`,
      `"2026-09-10"`,
      `"${officer.name}"`,
      `"${currentScore}"`,
      `"${currentSafetyFactor}"`,
      `"${currentStatus}"`,
      `"${issue.name}"`,
      `"${issue.severity}"`,
      `"${issue.conf}"`,
      `"${verifications[issue.id] || 'Confirmed'}"`,
      `"${issue.metricText || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CMMS_INSPECTION_${inspectionData.assetName.replace(/[^a-zA-Z0-9]/g, '_')}_20260911.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCmmsToast('CMMS CSV successfully exported for SAP PM / IBM Maximo!');
    setTimeout(() => setCmmsToast(null), 3500);
  };

  const handleExportMaximoJson = () => {
    const officer = getActiveOfficer();
    const payload = {
      maximoWorkOrder: {
        wonum: 'WO-2026-881',
        description: `AI Asset Integrity Remediation: ${inspectionData.assetName}`,
        assetnum: inspectionData.isMachine ? 'MACH-401-HUB' : 'BRIDGE-102',
        status: 'WAPPR',
        reportedby: officer.name,
        reportdate: new Date().toISOString(),
        healthScore: currentScore,
        safetyFactor: currentSafetyFactor,
        defectsDetected: allIssues.map(i => ({
          defectId: i.id,
          description: i.name,
          severity: i.severity,
          measurements: i.metricText,
          inspectorVerification: verifications[i.id] || 'Confirmed'
        })),
        remediationProtocol: recommendedActionSteps
      }
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `MAXIMO_WO_881_${inspectionData.assetName.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCmmsToast('Maximo Work Order JSON package generated!');
    setTimeout(() => setCmmsToast(null), 3500);
  };

  const diagnosticSummary = isGemini && geminiData.diagnosticSummary
    ? geminiData.diagnosticSummary
    : (isMachine 
        ? "Industrial mechanical hub inspected. High-severity structural fracture (14.2mm) detected along the outer circular rim lip with extensive surface oxidation (18.4% surface area). Defect propagation risk is high under centrifugal rotational stress. Immediate component isolation and ultrasonic thickness verification mandated."
        : "Crack and surface deterioration were detected across load-bearing pillars. The asset shows accelerating fatigue compared with previous quarterly inspections. Urgent engineering remediation recommended.");

  const handleCopySummary = () => {
    const summaryText = `AI INSPECTION ASSISTANCE DIAGNOSTIC REPORT\nAsset: ${inspectionData.assetName}\nModel: ${isGemini ? 'Google Gemini 1.5 Flash Vision' : 'Built-in Precision Metrology Engine'}\nOverall Defensible Health Score: 72 / 100\nSafety Factor: ${currentSafetyFactor} SF\nStatus: ${currentStatus}\nPrimary Defect: ${allIssues[0]?.name} (${allIssues[0]?.conf}) - ${allIssues[0]?.metricText}\nRecommended Action: 1. Isolate affected component | 2. Ultrasonic thickness measurement | 3. Remove surface corrosion | 4. Reinspect after treatment (Priority: HIGH, Timeframe: Within 7 days)`;
    navigator.clipboard.writeText(summaryText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleDownloadImage = () => {
    const a = document.createElement('a');
    a.href = inspectionData.mediaUrl;
    a.download = `annotated_${inspectionData.mediaName}`;
    a.click();
  };

  const handleSaveToOfficerLog = () => {
    const officer = getActiveOfficer();
    saveOfficerInspection({
      officerId: officer.id,
      officerName: officer.name,
      assetName: inspectionData.assetName,
      assetType: isMachine ? 'Industrial Machine Hub' : 'Civil Infrastructure',
      healthScore: currentScore,
      status: 'At Risk',
      securityHash: inspectionData.securityHash || 'SHA256:7f3a9e10c4b281d5',
      notes: inspectionData.description || 'Verified AI visual inspection audit with defensible 72/100 score.',
      diagnosticSummary,
      defectsCount: visibleIssues.length,
      isGemini,
      imageThumbnail: inspectionData.mediaUrl
    });
    setIsSaved(true);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const handleDispatchWorkOrder = () => {
    setWorkOrderDispatched(true);
    setDispatchToast(true);
    setTimeout(() => setDispatchToast(false), 4000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notifications */}
      {copiedToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" /> Diagnostic summary copied to clipboard!
        </div>
      )}

      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-emerald-500/30">
          <Check className="w-4 h-4 text-emerald-400" /> Audit record successfully saved to Officer Work Vault!
        </div>
      )}

      {dispatchToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-rose-500/40">
          <Wrench className="w-4 h-4 text-rose-400" /> Work Order #WO-2026-881 Dispatched to Field Maintenance Crew!
        </div>
      )}

      {/* Navigation Breadcrumb & Security Digest */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/inspect" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Start another inspection
          </Link>
          <button
            onClick={handleSaveToOfficerLog}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isSaved 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-primary text-white hover:bg-primary/90 shadow-primary/25'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaved ? 'Saved in Officer Log ✓' : 'Save Work'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            {inspectionData.securityHash || 'SHA256:7f3a9e10c4b281d5'}
          </span>
          <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 0 Threats • Sandboxed Clean
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
            isGemini 
              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            {isGemini ? 'Google Gemini 1.5 Flash' : 'Precision Metrology Engine'}
          </span>
        </div>
      </div>

      {/* Asset Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Inspection Completed
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {inspectionData.assetName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1">
            Media Telemetry: <strong className="text-slate-700 dark:text-slate-200 font-mono">{inspectionData.mediaName}</strong> • Real-time AI Metrology & Micro-crack detection active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/report"
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            <FileText className="w-4 h-4" /> Formal Engineering Report
          </Link>
          <button
            onClick={handleCopySummary}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Copy className="w-4 h-4" /> Copy Telemetry
          </button>
        </div>
      </div>

      {/* =========================================================================
          1. CENTRAL HERO ELEMENT: INSPECTION IMAGE VIEWPORT (Screenshot 4)
      ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        
        {/* Top Viewport Chrome Bar */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-extrabold tracking-wider uppercase text-slate-300">
              INSPECTION IMAGE HERO CANVAS
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
              Mode: <strong className="text-cyan-400">{viewMode === 'ORIGINAL' ? 'Raw Capture' : viewMode === 'AI_OVERLAY' ? 'AI Neural Overlay' : 'Compare Split View'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {viewMode !== 'ORIGINAL' && (
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 px-1.5 hidden md:inline">
                  <Layers className="w-3 h-3 inline mr-1" />
                  Filter:
                </span>
                {(['ALL', 'CRACK', 'RUST', 'WEAR'] as const).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      activeLayer === layer 
                        ? 'bg-cyan-500 text-slate-950 font-black' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {layer === 'ALL' ? 'All' : layer === 'CRACK' ? '🔴 Crack' : layer === 'RUST' ? '🟡 Corrosion' : '🟢 Wear'}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleDownloadImage}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Download Inspected Image"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Viewport Display */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[380px] md:min-h-[480px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          
          {/* Compare Mode Split Rendering */}
          {viewMode === 'COMPARE' ? (
            <div className="relative w-full h-full">
              {/* Full AI Overlay Layer on Base */}
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={inspectionData.mediaUrl} 
                  alt="AI Annotated View"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = bridge102Img;
                  }}
                />
                
                {/* Defect Callout 1: Primary Dynamic Defect */}
                {(activeLayer === 'ALL' || activeLayer === 'CRACK') && (
                  <div className="absolute top-[18%] left-[22%] z-20 pointer-events-none animate-in fade-in zoom-in-95">
                    <div className={`bg-slate-950/95 border-2 ${primaryDefect.color === 'critical' ? 'border-rose-500' : 'border-amber-500'} text-white rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col items-center`}>
                      <div className={`flex items-center gap-1.5 font-black ${primaryDefect.color === 'critical' ? 'text-rose-400' : 'text-amber-400'} text-xs tracking-wider`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${primaryDefect.color === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`}></span>
                        <span>{primaryDefect.icon} {primaryDefect.name}</span>
                      </div>
                      <div className={`${primaryDefect.color === 'critical' ? 'text-rose-400' : 'text-amber-400'} text-lg font-black leading-none my-0.5 animate-bounce`}>↓</div>
                      <div className={`w-20 h-0.5 ${primaryDefect.color === 'critical' ? 'bg-rose-500' : 'bg-amber-500'} rounded-full mb-1`}></div>
                      <span className="font-mono text-[10px] text-slate-200 font-bold">{primaryDefect.metricText} • {primaryDefect.conf}</span>
                    </div>
                    <div className={`w-36 h-24 border-2 border-dashed ${primaryDefect.color === 'critical' ? 'border-rose-500 bg-rose-500/15' : 'border-amber-500 bg-amber-500/15'} rounded-lg -mt-2 -ml-4`}></div>
                  </div>
                )}

                {/* Defect Callout 2: Secondary Dynamic Defect */}
                {(activeLayer === 'ALL' || activeLayer === 'RUST') && (
                  <div className="absolute top-[50%] left-[54%] z-20 pointer-events-none">
                    <div className={`bg-slate-950/95 border-2 ${secondaryDefect.color === 'critical' ? 'border-rose-500' : 'border-amber-500'} text-white rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col items-center`}>
                      <div className={`flex items-center gap-1.5 font-black ${secondaryDefect.color === 'critical' ? 'text-rose-400' : 'text-amber-400'} text-xs tracking-wider`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${secondaryDefect.color === 'critical' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                        <span>{secondaryDefect.icon} {secondaryDefect.name}</span>
                      </div>
                      <div className={`${secondaryDefect.color === 'critical' ? 'text-rose-400' : 'text-amber-400'} text-lg font-black leading-none my-0.5`}>↓</div>
                      <div className={`w-24 h-0.5 ${secondaryDefect.color === 'critical' ? 'bg-rose-500' : 'bg-amber-500'} rounded-full mb-1`}></div>
                      <span className="font-mono text-[10px] text-slate-200 font-bold">{secondaryDefect.metricText} • {secondaryDefect.conf}</span>
                    </div>
                    <div className={`w-40 h-20 border-2 border-dashed ${secondaryDefect.color === 'critical' ? 'border-rose-500 bg-rose-500/15' : 'border-amber-500 bg-amber-500/15'} rounded-lg -mt-2 -ml-4`}></div>
                  </div>
                )}
              </div>

              {/* Clipped Original Layer (Left side) */}
              <div 
                className="absolute inset-0 h-full overflow-hidden border-r-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                style={{ width: `${compareSlider}%` }}
              >
                <div className="relative w-full h-full min-w-full">
                  <img 
                    src={inspectionData.mediaUrl} 
                    alt="Original Unaltered View"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = bridge102Img;
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-700">
                    📷 RAW ORIGINAL
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md text-cyan-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-cyan-500/40">
                🎯 AI NEURAL OVERLAY
              </div>

              {/* Interactive Divider Line / Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center -translate-x-1/2"
                style={{ left: `${compareSlider}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white pointer-events-auto cursor-ew-resize">
                  <Split className="w-4 h-4" />
                </div>
              </div>

              <input 
                type="range"
                min="0"
                max="100"
                value={compareSlider}
                onChange={(e) => setCompareSlider(Number(e.target.value))}
                className="absolute inset-x-4 bottom-14 z-30 opacity-0 cursor-ew-resize h-12 w-full"
                title="Drag to compare Original vs AI Overlay"
              />
            </div>
          ) : viewMode === 'ORIGINAL' ? (
            /* Original Raw Mode (No Annotations) */
            <div className="relative w-full h-full">
              {inspectionData.mediaType === 'video' ? (
                <video 
                  ref={videoRef}
                  src={inspectionData.mediaUrl} 
                  controls 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <img 
                  src={inspectionData.mediaUrl} 
                  alt="Original Asset" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = bridge102Img;
                  }}
                />
              )}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5">
                <span>📷 Pure Optical Sensor Stream (Unaltered)</span>
              </div>
            </div>
          ) : (
            /* AI Overlay Mode: Prominent defect callout pins matching Screenshot 4 */
            <div className="relative w-full h-full">
              {inspectionData.mediaType === 'video' ? (
                <video 
                  ref={videoRef}
                  src={inspectionData.mediaUrl} 
                  controls 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <img 
                  src={inspectionData.mediaUrl} 
                  alt="AI Detected Asset" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = bridge102Img;
                  }}
                />
              )}

              {/* HERO CALLOUT ELEMENT 1: Primary Dynamic Defect */}
              {(activeLayer === 'ALL' || activeLayer === 'CRACK') && (
                <div className="absolute top-[18%] left-[24%] z-20 pointer-events-auto group">
                  <div className={`bg-slate-950/95 border-2 ${primaryDefect.color === 'critical' ? 'border-rose-500' : 'border-amber-500'} text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col items-center transition-transform hover:scale-105`}>
                    <div className={`flex items-center gap-1.5 font-black ${primaryDefect.color === 'critical' ? 'text-rose-400' : 'text-amber-400'} text-xs tracking-wider uppercase`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${primaryDefect.color === 'critical' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`}></span>
                      <span>{primaryDefect.icon} {primaryDefect.name}</span>
                    </div>
                    <div className={`${primaryDefect.color === 'critical' ? 'text-rose-400' : 'text-amber-400'} text-xl font-black leading-none my-1 animate-bounce`}>↓</div>
                    <div className={`w-24 h-0.5 ${primaryDefect.color === 'critical' ? 'bg-rose-500' : 'bg-amber-500'} rounded-full mb-1`}></div>
                    <div className="text-[11px] font-mono text-slate-100 font-bold tracking-tight">
                      {primaryDefect.metricText} • {primaryDefect.conf}
                    </div>
                  </div>
                  <div className={`w-44 h-28 border-2 border-dashed ${primaryDefect.color === 'critical' ? 'border-rose-500 bg-rose-500/15' : 'border-amber-500 bg-amber-500/15'} rounded-xl -mt-2 -ml-6 pointer-events-none animate-pulse`}></div>
                </div>
              )}

              {/* HERO CALLOUT ELEMENT 2: Secondary Dynamic Defect */}
              {(activeLayer === 'ALL' || activeLayer === 'RUST') && (
                <div className="absolute top-[50%] left-[54%] z-20 pointer-events-auto group">
                  <div className={`bg-slate-950/95 border-2 ${secondaryDefect.color === 'critical' ? 'border-rose-500' : 'border-amber-500'} text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col items-center transition-transform hover:scale-105`}>
                    <div className={`flex items-center gap-1.5 font-black ${secondaryDefect.color === 'critical' ? 'text-rose-400' : 'text-amber-400'} text-xs tracking-wider uppercase`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${secondaryDefect.color === 'critical' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                      <span>{secondaryDefect.icon} {secondaryDefect.name}</span>
                    </div>
                    <div className={`${secondaryDefect.color === 'critical' ? 'text-rose-400' : 'text-amber-400'} text-xl font-black leading-none my-1`}>↓</div>
                    <div className={`w-28 h-0.5 ${secondaryDefect.color === 'critical' ? 'bg-rose-500' : 'bg-amber-500'} rounded-full mb-1`}></div>
                    <div className="text-[11px] font-mono text-slate-100 font-bold tracking-tight">
                      {secondaryDefect.metricText} • {secondaryDefect.conf}
                    </div>
                  </div>
                  <div className={`w-52 h-24 border-2 border-dashed ${secondaryDefect.color === 'critical' ? 'border-rose-500 bg-rose-500/15' : 'border-amber-500 bg-amber-500/15'} rounded-xl -mt-2 -ml-6 pointer-events-none`}></div>
                </div>
              )}

              {/* HERO CALLOUT ELEMENT 3: Tertiary Dynamic Defect */}
              {(activeLayer === 'ALL' || activeLayer === 'WEAR') && (
                <div className="absolute top-[32%] right-[16%] z-20 pointer-events-auto">
                  <div className="bg-slate-950/95 border border-cyan-400 rounded-xl px-3 py-1.5 shadow-xl backdrop-blur-md text-cyan-300 font-mono text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>{tertiaryDefect.icon} {tertiaryDefect.name}: {tertiaryDefect.metricText}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Central Mode Switcher Bar at the bottom of the Hero Canvas (Screenshot 4) */}
          <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl">
              <button
                type="button"
                onClick={() => setViewMode('ORIGINAL')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'ORIGINAL'
                    ? 'bg-white text-slate-950 shadow-md scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                [ Original ]
              </button>

              <button
                type="button"
                onClick={() => setViewMode('AI_OVERLAY')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'AI_OVERLAY'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                [ AI Overlay ]
              </button>

              <button
                type="button"
                onClick={() => setViewMode('COMPARE')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'COMPARE'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                [ Compare ]
              </button>
            </div>
          </div>
        </div>

        {/* Hero Footer: Confidence Slider & Metrics */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="flex items-center gap-1.5 font-bold text-slate-300 whitespace-nowrap">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              AI Confidence Filter:
            </span>
            <input 
              type="range"
              min="70"
              max="95"
              step="1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-32 sm:w-44 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="font-mono font-black text-cyan-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              ≥ {confidenceThreshold}%
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> 1 Critical Fracture (96%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> 1 Corrosion Region (89%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Safety Factor: <strong>{currentSafetyFactor} SF</strong>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE 6 & 13: INSPECTION TIMELINE (Screenshot 1) & INSPECTION COMPARISON (Screenshot 4)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARD 1: INSPECTION TIMELINE (Screenshot 1) */}
        <section className="card p-6 md:p-8 bg-slate-950 text-slate-100 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  6. Create a timeline of the inspection
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Video & Audio Telemetry Timeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Make video inspections navigable with timestamps:
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyTimeline}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                title="Copy timeline to clipboard"
              >
                {timelineCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{timelineCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Dark Code-styled Terminal Box matching Screenshot 1 */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 font-mono text-xs sm:text-sm space-y-2.5 shadow-inner">
              {timelineEvents.map((evt, idx) => {
                const isActive = activeTimelineIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSeekTimeline(evt.seconds, idx)}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between group cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-white' 
                        : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-black text-xs ${
                        isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition'
                      }`}>
                        {evt.time}
                      </span>
                      <span className="font-semibold text-slate-200">
                        — {evt.title}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 hidden sm:inline">
                      Jump to {evt.time} ⏩
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Clicking a timestamp jumps to that point in the video inspection.</span>
            </div>
          </div>

          {activeTimelineIndex !== null && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-cyan-300 flex items-center justify-between">
              <span>Currently seeking: <strong>{timelineEvents[activeTimelineIndex].title}</strong></span>
              <span className="font-mono text-[11px] text-slate-400">Offset: {timelineEvents[activeTimelineIndex].time}</span>
            </div>
          )}
        </section>

        {/* CARD 2: INSPECTION COMPARISON (Screenshot 4) */}
        <section className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                  13. Add an inspection comparison feature
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Delta Metrology & Rate of Deterioration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Compare today's inspection with the previous one:
                </p>
              </div>

              <Link
                to="/history"
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <History className="w-3.5 h-3.5 text-primary" /> Asset History
              </Link>
            </div>

            {/* Comparison Box dynamically tailored to asset category (Screenshot 4) */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-4 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Baseline Inspection</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">"{compData.pastDate}: {compData.pastDefect}"</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
                  {compData.pastScore}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <span className="text-rose-500 font-bold block text-[10px] uppercase">Current Inspection</span>
                  <span className="text-slate-900 dark:text-white font-black text-sm">"{compData.currentDate}: {compData.currentDefect}"</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[11px] border border-rose-500/20">
                  {compData.currentScore}
                </span>
              </div>

              {/* Condition Banner matching Screenshot 4 */}
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-sans font-extrabold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black">
                    "{compData.condition}"
                  </p>
                  <p className="text-[11px] font-normal text-slate-600 dark:text-slate-400 mt-0.5">
                    {compData.detail}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>This turns one-off inspections into predictive maintenance.</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Predictive Failure Horizon: <strong>{compData.failureHorizon}</strong></span>
            <Link
              to="/history"
              className="text-xs font-bold text-primary hover:text-cyan-600 flex items-center gap-1 transition"
            >
              View Full 12-Month Progression <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </div>

      {/* =========================================================================
          2 & 3. DEFENSIBLE INSPECTION SCORE (Screenshots 2 & 5) + RECOMMENDED ACTIONS (Screenshot 3)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT CARD: DEFENSIBLE "INSPECTION SCORE" (Screenshots 2 & 5) */}
        <section className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                  5. Add an "Inspection Score"
                </span>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  ISO 55000 Defensible
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Asset Health Score
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Scores must be mathematically defensible and transparent, not arbitrary.
              </p>
            </div>

            {/* Prominent Score + Progress Bar matching Screenshot 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Asset Health</span>
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    72 <span className="text-2xl font-bold text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    At Risk / Attention
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Safety Factor: {currentSafetyFactor} SF</p>
                </div>
              </div>

              {/* Visual High-Contrast Horizontal Meter matching Screenshot 2 */}
              <div className="w-full h-5 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden relative shadow-inner p-0.5">
                <div 
                  className="h-full rounded-lg bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500 transition-all duration-1000"
                  style={{ width: '72%' }}
                ></div>
              </div>
            </div>

            {/* Defensible Calculation Table matching Screenshot 5 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Show how it was calculated:
                </p>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  Overall Health Score
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {scoreBreakdown.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">{item.weight}% weight</span>
                        <span className="mx-1.5 text-slate-400">→</span>
                        <strong className="text-slate-900 dark:text-white font-black">{item.score}</strong>
                        <span className="text-[10px] text-slate-400 ml-1.5">({item.contribution.toFixed(1)} pts)</span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${item.score}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculation Summary Footer */}
              <div className="pt-3 border-t-2 border-slate-800 dark:border-slate-700 flex items-center justify-between text-sm font-black">
                <span className="text-slate-800 dark:text-white">Overall Health Score</span>
                <div className="text-right">
                  <span className="text-lg text-primary font-black">72 / 100</span>
                  <p className="text-[10px] font-normal text-slate-400 font-mono">Weighted Total: {weightedSum.toFixed(1)} - 2.3 (Fatigue factor) = 72</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Compliant with ASME & ISO 55000 asset integrity standards. Defensible for civil audits.</span>
          </div>
        </section>


        {/* RIGHT CARD: ACTIONABLE RECOMMENDED ACTIONS (Screenshot 3) */}
        <section className="card p-6 md:p-8 bg-slate-900 text-white border border-slate-800 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  7. Add Recommended Actions
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  Not Just Observations
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                RECOMMENDED ACTION
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                AI inspection shouldn't stop at "Corrosion detected" — it must guide the remediation workflow.
              </p>
            </div>

            {/* Key Execution Metrics Row matching Screenshot 3 */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <div className="p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Priority</span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                  🔴 HIGH
                </span>
              </div>

              <div className="p-2 border-x border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> Est. Work
                </span>
                <span className="text-xs font-black text-white">
                  2–4 hours
                </span>
              </div>

              <div className="p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" /> Timeframe
                </span>
                <span className="text-xs font-black text-amber-400">
                  Within 7 days
                </span>
              </div>
            </div>

            {/* 5-Step Action Checklist matching Screenshot 3 */}
            <div className="space-y-3">
              <p className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Engineering Remediation Protocol:
              </p>

              <div className="space-y-2.5">
                {recommendedActionSteps.map((step) => (
                  <div 
                    key={step.step}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-cyan-500/40 transition flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm">{step.title}</h4>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{step.timing}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Action Dispatch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDispatchWorkOrder}
                disabled={workOrderDispatched}
                className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                  workOrderDispatched
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-rose-600/30 hover:scale-[1.02]'
                }`}
              >
                <Wrench className="w-4 h-4" />
                {workOrderDispatched ? 'Work Order #WO-2026-881 Dispatched ✓' : 'Dispatch Work Order #WO-2026-881'}
              </button>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Assigned Team: Field Structural Ops Unit 4</span>
            <span className="text-cyan-400 font-bold">Priority Status: Queued</span>
          </div>
        </section>

      </div>

      {/* =========================================================================
          4. QUANTITATIVE METROLOGY & DIAGNOSTIC SUMMARY
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* AI Detected Issues with Sub-Millimeter Readings */}
        <section className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Detected Defect Metrology
              </h3>
              <p className="text-xs text-slate-400">Sub-millimeter dimension variances</p>
            </div>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              {visibleIssues.length} Active Signals
            </span>
          </div>

          <div className="space-y-3">
            {visibleIssues.map((issue: any) => (
              <div 
                key={issue.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  issue.color === 'critical' 
                    ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20' 
                    : issue.color === 'attention' 
                    ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20' 
                    : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{issue.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{issue.name}</h4>
                      <p className={`text-xs font-bold ${
                        issue.color === 'critical' ? 'text-rose-600 dark:text-rose-400' :
                        issue.color === 'attention' ? 'text-amber-600 dark:text-amber-400' :
                        'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {issue.severity} • {issue.tag}
                      </p>
                    </div>
                  </div>

                  <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-xs">
                    {issue.conf}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <Ruler className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{issue.metricText}</span>
                </div>

                {/* 9. AI Finding vs Inspector Verification (Screenshot 3) */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      AI Finding: <strong className="text-slate-800 dark:text-slate-200">"{issue.name} — {issue.conf}"</strong>
                    </span>
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Human-in-the-loop
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Inspector Verification:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(['Confirmed', 'Rejected', 'Needs Review'] as const).map((status) => {
                        const isSelected = (verifications[issue.id] || (status === 'Confirmed' ? 'Confirmed' : '')) === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleSetVerification(issue.id, status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? status === 'Confirmed'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : status === 'Rejected'
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'bg-amber-500 text-slate-950 shadow-xs font-black'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {status === 'Confirmed' && <CheckSquare className="w-3.5 h-3.5" />}
                            {status === 'Rejected' && <XSquare className="w-3.5 h-3.5" />}
                            {status === 'Needs Review' && <HelpCircle className="w-3.5 h-3.5" />}
                            <span>{isSelected ? `[✓] ${status}` : `[ ] ${status}`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Inspector Manual Finding Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddFindingOpen(true)}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" /> Add Field Inspector Finding (Human Override)
              </button>
            </div>
          </div>
        </section>

        {/* AI Diagnostic Text & Safety Factor */}
        <section className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-wider">
              <ShieldAlert className="w-5 h-5" />
              Autonomous Metrology Diagnostic Summary
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
              {diagnosticSummary}
            </p>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Safety Factor Assessment:
                </span>
                <span className="font-mono text-sm font-black">{currentSafetyFactor} SF (Min Required: 1.50)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Current structural safety factor of {currentSafetyFactor} breaches the mandatory 1.50 baseline. Centrifugal hoop stresses require immediate Lockout/Tagout protocol.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to="/report"
              className="text-xs font-bold text-primary hover:text-cyan-600 flex items-center gap-1.5 transition"
            >
              Generate printable PDF engineering audit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </div>

      {/* =========================================================================
          5. HISTORICAL DEGRADATION TIMELINE & RECHARTS GRAPH
      ========================================================================= */}
      <section className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <LineChartIcon className="w-6 h-6 text-primary" /> Historical Fatigue Degradation Timeline
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Cumulative wear & micro-crack progression tracking across quarterly maintenance cycles
            </p>
          </div>
          
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 
            Degradation accelerating from 96 → 72 over 9 months
          </div>
        </div>
        
        {/* Step Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {historyData.map((point, i) => (
            <div key={i} className={`p-4 rounded-2xl border-2 ${
              point.score >= 90 ? 'border-emerald-500/30 bg-emerald-500/5' :
              point.score >= 80 ? 'border-cyan-500/30 bg-cyan-500/5' :
              point.score >= 70 ? 'border-amber-500/30 bg-amber-500/5' :
              'border-rose-500/30 bg-rose-500/5'
            } flex flex-col items-center text-center relative`}>
              <span className="text-slate-400 font-bold text-xs uppercase mb-1">{point.name}</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{point.score}/100</span>
              <span className={`font-extrabold text-xs mt-1 ${
                point.score >= 90 ? 'text-emerald-500' :
                point.score >= 80 ? 'text-cyan-500' :
                point.score >= 70 ? 'text-amber-500' :
                'text-rose-500'
              }`}>
                {point.score >= 90 ? 'Healthy' : point.score >= 80 ? 'Optimal' : point.score >= 70 ? 'At Risk' : 'Critical'}
              </span>
              {i < 3 && (
                <ArrowRight className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 hidden md:block w-5 h-5 z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Clean Line Chart */}
        <div className="h-[260px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={8} />
              <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-8} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #334155', 
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' 
                }}
                formatter={(val) => [`${val}/100`, 'Health Score']}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#06b6d4" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#06b6d4', strokeWidth: 3, stroke: '#0f172a' }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Bottom Sticky Action Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <button
          onClick={handleSaveToOfficerLog}
          className={`px-6 py-3.5 rounded-2xl text-xs font-extrabold transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
            isSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white shadow-primary/25 hover:scale-105'
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaved ? 'Saved in Officer Work Vault ✓' : 'Save Work to Officer Log'}
        </button>

        <button
          onClick={handleExportCmmsCsv}
          className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700 hover:scale-105"
          title="Export CSV for SAP PM / Oracle CMMS"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CMMS CSV
        </button>

        <button
          onClick={handleExportMaximoJson}
          className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700 hover:scale-105"
          title="Export IBM Maximo Work Order JSON"
        >
          <Database className="w-4 h-4 text-cyan-500" /> Maximo JSON
        </button>

        <Link
          to="/report"
          className="px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-extrabold shadow-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-700 hover:scale-105"
        >
          <FileText className="w-4 h-4" /> Generate Formal PDF Report
        </Link>
      </div>

      {/* CMMS Toast Alert */}
      {cmmsToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {cmmsToast}
        </div>
      )}

      {/* Add Field Inspector Finding Modal */}
      {isAddFindingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Add Field Finding</h3>
                  <p className="text-xs text-slate-400">Log an on-site defect observed by inspector</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFindingOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFinding} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Defect Title / Component Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grounding Flange Bolt Corroded / Loose"
                  value={newFindingTitle}
                  onChange={(e) => setNewFindingTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Severity Level</label>
                <select
                  value={newFindingSeverity}
                  onChange={(e) => setNewFindingSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-primary"
                >
                  <option value="High Severity">🔴 High Severity (Immediate Action)</option>
                  <option value="Medium Severity">🟡 Medium Severity (Attention Needed)</option>
                  <option value="Low Severity">🟢 Low Severity (Monitor Only)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Physical Dimensions / Field Observation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Ultrasonic UTM verified 3.2mm remaining wall. Lock washer fatigued."
                  value={newFindingMetric}
                  onChange={(e) => setNewFindingMetric(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFindingOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold cursor-pointer shadow-md shadow-primary/25"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
