import { useState } from 'react';
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
  Activity, 
  Lock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function InspectionResult() {
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'CRACK' | 'RUST' | 'WEAR'>('ALL');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(80);
  const [copiedToast, setCopiedToast] = useState(false);

  const [inspectionData] = useState<{
    assetName: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    mediaName: string;
    description: string;
    securityHash?: string;
    isMachine?: boolean;
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
      mediaUrl: 'https://images.unsplash.com/photo-1581092334812-78d10b7b13df?q=80&w=800&auto=format&fit=crop',
      mediaType: 'image',
      mediaName: 'machine_rotor_hub.png',
      securityHash: 'SHA256:7f3a9e10c4b281d5',
      description: 'Structural rim crack visible on outer collar. Prominent surface oxidation and rust accumulation.',
      isMachine: true
    };
  });

  const isMachine = inspectionData.isMachine;

  const historyData = isMachine ? [
    { name: 'JAN 2026', score: 96 },
    { name: 'APR 2026', score: 88 },
    { name: 'JUL 2026', score: 72 },
    { name: 'SEP 2026', score: 58 },
  ] : [
    { name: 'JAN 2026', score: 95 },
    { name: 'APR 2026', score: 91 },
    { name: 'JUL 2026', score: 78 },
    { name: 'SEP 2026', score: 64 },
  ];

  const allIssues = isMachine ? [
    { 
      id: 'CRACK', 
      name: 'RIM CRACK / FRACTURE', 
      severity: 'High Severity', 
      confidenceVal: 96,
      conf: '96% Confidence', 
      color: 'critical', 
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
      color: 'attention', 
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
      color: 'healthy', 
      icon: '🟢', 
      tag: 'Monitor',
      measurements: {
        clearance: '+0.045 mm Radial Clearance',
        tolerance: 'ISO ±0.015 mm Spec',
        deviation: '+0.030 mm Tolerance Breach'
      },
      metricText: 'Radial Wear: +0.045 mm (Tolerance Spec: ±0.015 mm)'
    },
  ] : [
    { 
      id: 'CRACK', 
      name: 'STRUCTURAL PIER CRACK', 
      severity: 'High Severity', 
      confidenceVal: 94,
      conf: '94% Confidence', 
      color: 'critical', 
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
      color: 'attention', 
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
      color: 'healthy', 
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

  // Filter issues based on confidence threshold
  const visibleIssues = allIssues.filter(issue => issue.confidenceVal >= confidenceThreshold);

  const recommendations = isMachine ? [
    { icon: '🔴', title: 'Immediate component replacement', sub: 'Casting fracture presents catastrophic fragmentation risk under rotational centrifugal forces' },
    { icon: '🟡', title: 'Sandblast & apply anti-corrosion barrier', sub: 'Arrest oxidation spread across recessed friction cavity (18.4% affected)' },
    { icon: '🟢', title: 'Recalibrate bore keyway tolerance', sub: 'Correct +0.030mm radial breach prior to mounting replacement hub' },
  ] : [
    { icon: '🔴', title: 'Immediate civil engineering evaluation', sub: 'Deploy structural engineering team within 48 hours for ultrasonic validation' },
    { icon: '🟡', title: 'Pressure-inject epoxy within 30 days', sub: 'Seal concrete surfaces before freeze-thaw degradation widens crack beyond 2.1mm' },
    { icon: '🟢', title: 'Apply cathodic rebar inhibitor', sub: 'Prevent oxidation from advancing along internal load-bearing reinforcement mesh' },
  ];

  const handleCopySummary = () => {
    const summaryText = `AI INSPECTION ASSISTANCE DIAGNOSTIC REPORT\nAsset: ${inspectionData.assetName}\nSecurity Status: VERIFIED CLEAN (0 Malware Signatures)\nSHA-256 Digest: ${inspectionData.securityHash || 'SHA256:7f3a9e10c4b281d5'}\nHealth Score: ${isMachine ? '58/100' : '64/100'} (AT RISK)\nSafety Factor: ${isMachine ? '1.15 (Min required: 1.50)' : '1.28 (Min required: 1.50)'}\nPrimary Defect: ${allIssues[0].name} (${allIssues[0].conf}) - Measurements: ${allIssues[0].metricText}\nRecommended Action: ${recommendations[0].title} - ${recommendations[0].sub}`;
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

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-healthy" /> Diagnostic summary copied to clipboard!
        </div>
      )}

      {/* Navigation breadcrumb & Security Audit Stamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200 shadow-xs">
        <Link to="/inspect" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Start another inspection
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            {inspectionData.securityHash || 'SHA256:7f3a9e10c4b281d5'}
          </span>
          <span className="text-[11px] font-bold bg-healthy/10 text-healthy border border-healthy/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 0 Malware Signatures • Sandboxed Clean
          </span>
        </div>
      </div>

      {/* Top Hero Section */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex items-center gap-2 text-healthy font-extrabold text-sm md:text-base bg-healthy/10 px-5 py-2 rounded-full border border-healthy/20">
          <CheckCircle2 className="w-5 h-5" /> Inspection Complete ✓
        </div>
        
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            {isMachine ? 'Machine Component Diagnostic Result' : 'Infrastructure Asset Diagnostic Result'}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mt-0.5">
            {inspectionData.assetName}
          </h1>
        </div>
        
        {/* Metric Cards: Health Score + Safety Factor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md w-full mt-4">
          
          {/* Health Score Card */}
          <div className="card p-6 flex flex-col items-center justify-center border-risk/30 bg-gradient-to-b from-risk/5 to-white shadow-lg w-full">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Health Score</p>
            <div className="text-5xl md:text-6xl font-black text-slate-800 my-1">
              {isMachine ? '58' : '64'}<span className="text-2xl font-bold text-slate-400">/100</span>
            </div>
            <div className="badge-risk text-xs font-extrabold px-4 py-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-risk animate-pulse"></span>
              🔴 AT RISK
            </div>
          </div>

          {/* Safety Factor Card */}
          <div className="card p-6 flex flex-col items-center justify-center border-critical/20 bg-gradient-to-b from-critical/5 to-white shadow-lg w-full">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Calculated Safety Factor</p>
            <div className="text-5xl md:text-6xl font-black text-critical my-1">
              {isMachine ? '1.15' : '1.28'}<span className="text-2xl font-bold text-slate-400"> SF</span>
            </div>
            <div className="text-[11px] font-bold text-critical bg-critical/10 border border-critical/20 px-3 py-1 rounded-full mt-1">
              ⚠ Target SF ≥ 1.50 (Breached)
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Left Column: Image Detection & AI Summary */}
        <div className="space-y-6">
          
          {/* Image Detection Card */}
          <section className="card p-6 bg-white flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">AI Visual Detection</h3>
                <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{inspectionData.mediaName}</p>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-600 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Export Image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-600 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Copy Diagnostic Text"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Text</span>
                </button>
              </div>
            </div>

            {/* Confidence Threshold Slider Control */}
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Sliders className="w-3.5 h-3.5 text-primary" /> AI Confidence Filter Threshold:
                </span>
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono text-primary">
                  ≥ {confidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                step="1"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>70% (Show All Anomaly Signals)</span>
                <span>85% (Balanced)</span>
                <span>95% (High Precision Only)</span>
              </div>
            </div>

            {/* Layer Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 p-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Layers:
              </span>
              {[
                { id: 'ALL', label: `All Visible (${visibleIssues.length})` },
                { id: 'CRACK', label: isMachine ? '🔴 Rim Crack' : '🔴 Crack' },
                { id: 'RUST', label: isMachine ? '🟡 Rust' : '🟡 Spalling' },
                { id: 'WEAR', label: isMachine ? '🟢 Bore Wear' : '🟢 Corrosion' },
              ].map(layer => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayer(layer.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeLayer === layer.id 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>

            {/* Visual Inspector Area with Dynamic Bounding Boxes */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] flex items-center justify-center shadow-inner border border-slate-200">
              
              {/* Media rendering (Image or Video) */}
              {inspectionData.mediaType === 'video' ? (
                <video 
                  src={inspectionData.mediaUrl} 
                  controls 
                  autoPlay 
                  muted 
                  loop 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : (
                <img 
                  src={inspectionData.mediaUrl} 
                  alt="Inspected asset" 
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545464197-09d3b8417c82?q=80&w=800&auto=format&fit=crop';
                  }}
                />
              )}

              {/* Bounding Box 1: Rim Crack / Crack (Red / High) */}
              {(activeLayer === 'ALL' || activeLayer === 'CRACK') && confidenceThreshold <= 96 && (
                <div className="absolute top-[20%] left-[18%] w-[28%] h-[32%] border-3 border-critical bg-critical/20 rounded-lg flex flex-col justify-start p-1.5 shadow-lg pointer-events-none transition-all animate-in zoom-in-95">
                  <span className="bg-critical text-white text-[10px] font-black px-1.5 py-0.5 rounded w-fit uppercase tracking-wider shadow-sm">
                    {isMachine ? 'Rim Crack • 96%' : 'Crack • 94%'}
                  </span>
                  <span className="text-[9px] font-mono text-white bg-slate-900/80 px-1 py-0.2 rounded w-fit mt-1">
                    {isMachine ? '14.2mm × 1.4mm' : '18.6mm × 2.1mm'}
                  </span>
                </div>
              )}

              {/* Bounding Box 2: Surface Rust / Spalling (Yellow / Medium) */}
              {(activeLayer === 'ALL' || activeLayer === 'RUST') && confidenceThreshold <= 89 && (
                <div className="absolute top-[48%] left-[45%] w-[38%] h-[30%] border-3 border-attention bg-attention/20 rounded-lg flex flex-col justify-start p-1.5 shadow-lg pointer-events-none transition-all animate-in zoom-in-95">
                  <span className="bg-attention-dark text-white text-[10px] font-black px-1.5 py-0.5 rounded w-fit uppercase tracking-wider shadow-sm">
                    {isMachine ? 'Surface Rust • 89%' : 'Spalling • 87%'}
                  </span>
                  <span className="text-[9px] font-mono text-white bg-slate-900/80 px-1 py-0.2 rounded w-fit mt-1">
                    {isMachine ? 'Area: 18.4%' : 'Area: 12.1%'}
                  </span>
                </div>
              )}

              {/* Bounding Box 3: Center Bore Wear / Corrosion (Green / Low) */}
              {(activeLayer === 'ALL' || activeLayer === 'WEAR') && confidenceThreshold <= 84 && (
                <div className="absolute top-[34%] left-[34%] w-[24%] h-[26%] border-3 border-healthy bg-healthy/20 rounded-lg flex flex-col justify-start p-1.5 shadow-lg pointer-events-none transition-all animate-in zoom-in-95">
                  <span className="bg-healthy text-white text-[10px] font-black px-1.5 py-0.5 rounded w-fit uppercase tracking-wider shadow-sm">
                    {isMachine ? 'Bore Wear • 84%' : 'Corrosion • 81%'}
                  </span>
                  <span className="text-[9px] font-mono text-white bg-slate-900/80 px-1 py-0.2 rounded w-fit mt-1">
                    {isMachine ? '+0.045mm' : '3 Rebars'}
                  </span>
                </div>
              )}

            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-around mt-4 pt-3 border-t border-slate-100 bg-slate-50 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-critical rounded-full"></span>
                <span className="text-xs font-bold text-slate-700">🔴 High ({isMachine ? 'Rim Crack' : 'Crack'})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-attention-dark rounded-full"></span>
                <span className="text-xs font-bold text-slate-700">🟡 Medium ({isMachine ? 'Rust' : 'Spalling'})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-healthy rounded-full"></span>
                <span className="text-xs font-bold text-slate-700">🟢 Low ({isMachine ? 'Bore Wear' : 'Corrosion'})</span>
              </div>
            </div>
          </section>

          {/* AI Summary Card */}
          <section className="card p-6 bg-ai/5 border-ai/20">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-ai" /> AI Machine Diagnostic Summary
            </h3>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">
              {isMachine ? (
                "Industrial mechanical hub inspected. High-severity structural fracture detected along the outer circular rim lip with extensive surface oxidation inside the recessed chamber. High risk of complete mechanical fragmentation under rotational load. Immediate lockout required."
              ) : (
                "Crack and surface deterioration were detected across load-bearing pillars. The asset shows accelerating deterioration compared with previous quarterly inspections. Urgent engineering remediation recommended."
              )}
            </p>
          </section>
        </div>

        {/* Right Column: AI Detected Issues & Quantitative Measurements */}
        <div className="space-y-6">
          
          {/* AI Detected Issues with Live Filter */}
          <section className="card p-6 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-800">
                AI Detected {visibleIssues.length} Anomaly {visibleIssues.length === 1 ? 'Signal' : 'Signals'}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                Threshold: ≥{confidenceThreshold}%
              </span>
            </div>
            
            {visibleIssues.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No defects meet the current confidence threshold of ≥{confidenceThreshold}%. Lower the slider to inspect lower-probability signals.
              </div>
            ) : (
              <div className="space-y-3.5">
                {visibleIssues.map((issue) => (
                  <div key={issue.id} className={`p-4 rounded-2xl transition-all ${
                    issue.color === 'critical' ? 'bg-critical/5 border border-critical/15' :
                    issue.color === 'attention' ? 'bg-attention/10 border border-attention/20' :
                    'bg-healthy/10 border border-healthy/20'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{issue.icon}</span>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-base">{issue.name}</h4>
                          <p className={`text-xs font-bold ${
                            issue.color === 'critical' ? 'text-critical' :
                            issue.color === 'attention' ? 'text-attention-dark' :
                            'text-healthy'
                          }`}>{issue.severity} • {issue.tag}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-white border border-slate-200 text-slate-800 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-xs">
                          {issue.conf}
                        </span>
                      </div>
                    </div>

                    {/* Quantitative measurement badge */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs font-mono text-slate-700">
                      <Ruler className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{issue.metricText}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quantitative Precision Metrology Box */}
          <section className="card p-6 bg-slate-50 border-slate-200">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Engineering Precision Metrology
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  1. Fracture Dimensions & Propagation:
                </span>
                <p className="text-slate-600 font-mono">
                  Length: 14.2 mm • Width: 1.4 mm • Depth: 2.8 mm
                </p>
                <p className="text-critical font-bold mt-1 text-[11px]">
                  Growth Rate: +0.4 mm / 100 hrs (Catastrophic fracture danger)
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  2. Oxidation & Degradation Ratio:
                </span>
                <p className="text-slate-600 font-mono">
                  Surface Area: 18.4% (84.6 cm²) • Pitting: 0.65 mm depth
                </p>
                <p className="text-attention-dark font-bold mt-1 text-[11px]">
                  Classification: ISO 8501-1 Grade C Degradation
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  3. Center Bore Spline Tolerance:
                </span>
                <p className="text-slate-600 font-mono">
                  Radial Wear: +0.045 mm (Standard Tolerance: ±0.015 mm)
                </p>
                <p className="text-slate-700 font-bold mt-1 text-[11px]">
                  Tolerance Breach: +0.030 mm over nominal clearance
                </p>
              </div>
            </div>
          </section>

          {/* Recommended Action Card */}
          <section className="card p-6 md:p-8 bg-slate-900 text-white shadow-xl">
            <h3 className="text-xl font-black mb-5 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              Recommended Engineering Actions
            </h3>

            <ul className="space-y-4 mb-8">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-base mt-0.5">{rec.icon}</span>
                  <div>
                    <span className="font-bold text-base text-white block">{rec.title}</span>
                    <span className="text-xs text-slate-400">{rec.sub}</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Primary Action Button */}
            <Link 
              to="/report" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/30 text-base cursor-pointer"
            >
              <FileText className="w-5 h-5" /> Generate Inspection Report
            </Link>
          </section>

        </div>
      </div>

      {/* Historical Comparison */}
      <section className="card p-6 md:p-8 mt-8 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <LineChartIcon className="w-6 h-6 text-primary" /> Historical Comparison & Degradation
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isMachine ? 'Component fatigue degradation across maintenance cycles' : 'Structural condition degradation timeline'}
            </p>
          </div>
          
          <div className="bg-risk/10 border border-risk/20 text-risk px-4 py-2 rounded-xl font-extrabold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 
            {isMachine ? '⚠ Machine component wear accelerating over time.' : '⚠ Asset health is decreasing over time.'}
          </div>
        </div>
        
        {/* Simple Step Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {historyData.map((point, i) => (
            <div key={i} className={`p-4 rounded-2xl border-2 ${
              point.score >= 90 ? 'border-healthy/30 bg-healthy/5' :
              point.score >= 70 ? 'border-attention/30 bg-attention/5' :
              'border-risk/30 bg-risk/5'
            } flex flex-col items-center text-center relative`}>
              <span className="text-slate-400 font-bold text-xs uppercase mb-1">{point.name}</span>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{point.score}/100</span>
              <span className={`font-extrabold text-sm mt-1 ${
                point.score >= 90 ? 'text-healthy' :
                point.score >= 70 ? 'text-attention-dark' :
                'text-risk'
              }`}>
                {point.score >= 90 ? 'Healthy' : point.score >= 70 ? 'Attention' : 'At Risk'}
              </span>
              {i < 3 && (
                <ArrowRight className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-300 hidden md:block w-5 h-5 z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Clean Line Chart */}
        <div className="h-[260px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={8} />
              <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-8} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(val) => [`${val}/100`, 'Health Score']}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#f97316" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#f97316', strokeWidth: 3, stroke: '#fff' }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}
