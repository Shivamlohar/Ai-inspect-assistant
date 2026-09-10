import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldAlert, LineChart as LineChartIcon, FileText, AlertTriangle, ArrowLeft, Copy, Check, Download, Layers, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function InspectionResult() {
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'CRACK' | 'RUST' | 'WEAR'>('ALL');
  const [copiedToast, setCopiedToast] = useState(false);

  const [inspectionData] = useState<{
    assetName: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    mediaName: string;
    description: string;
    isMachine?: boolean;
  }>(() => {
    const saved = sessionStorage.getItem('currentInspection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
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

  const issues = isMachine ? [
    { id: 'CRACK', name: 'RIM CRACK / FRACTURE', severity: 'High Severity', conf: '96% Confidence', color: 'critical', icon: '🔴', tag: 'High Severity' },
    { id: 'RUST', name: 'SURFACE OXIDATION & RUST', severity: 'Medium Severity', conf: '89% Confidence', color: 'attention', icon: '🟡', tag: 'Medium Severity' },
    { id: 'WEAR', name: 'CENTER BORE WEAR', severity: 'Low Severity', conf: '84% Confidence', color: 'healthy', icon: '🟢', tag: 'Low Severity' },
  ] : [
    { id: 'CRACK', name: 'CRACK', severity: 'High Severity', conf: '94% Confidence', color: 'critical', icon: '🔴', tag: 'High Severity' },
    { id: 'RUST', name: 'SPALLING', severity: 'Medium Severity', conf: '87% Confidence', color: 'attention', icon: '🟡', tag: 'Medium Severity' },
    { id: 'WEAR', name: 'CORROSION', severity: 'Low Severity', conf: '81% Confidence', color: 'healthy', icon: '🟢', tag: 'Low Severity' },
  ];

  const recommendations = isMachine ? [
    { icon: '🔴', title: 'Immediate component replacement', sub: 'Casting fracture presents catastrophic fragmentation risk during rotation' },
    { icon: '🟡', title: 'Sandblast & apply anti-corrosion barrier', sub: 'Arrest oxidation spread across recessed friction cavity' },
    { icon: '🟢', title: 'Measure spline shaft tolerance', sub: 'Verify keyway clearance prior to mounting replacement hub' },
  ] : [
    { icon: '🔴', title: 'Immediate structural inspection', sub: 'Deploy civil structural engineering team within 48 hours' },
    { icon: '🟡', title: 'Repair spalling within 3 months', sub: 'Seal concrete surfaces before freeze-thaw degradation' },
    { icon: '🟢', title: 'Continue monitoring corrosion', sub: 'Routine monthly AI scan at next scheduled maintenance route' },
  ];

  const handleCopySummary = () => {
    const summaryText = `AI INSPECTION ASSISTANCE DIAGNOSTIC REPORT\nAsset: ${inspectionData.assetName}\nHealth Score: ${isMachine ? '58/100' : '64/100'} (AT RISK)\nPrimary Defect: ${isMachine ? 'Rim Fracture (96% Conf)' : 'Structural Crack (94% Conf)'}\nRecommendation: ${recommendations[0].title} - ${recommendations[0].sub}`;
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

      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/inspect" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Start another inspection
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">ID: DIAG-2026-M401</span>
          <span className="text-[11px] font-bold bg-healthy/10 text-healthy border border-healthy/20 px-2 py-0.5 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Certified Secure
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
        
        {/* Large Health Score Card */}
        <div className="card p-8 mt-4 flex flex-col items-center justify-center border-risk/30 bg-gradient-to-b from-risk/5 to-white shadow-lg max-w-xs w-full">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Health Score</p>
          <div className="text-6xl md:text-7xl font-black text-slate-800 my-2">
            {isMachine ? '58' : '64'}<span className="text-3xl font-bold text-slate-400">/100</span>
          </div>
          <div className="badge-risk text-sm font-extrabold px-5 py-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-risk animate-pulse"></span>
            🔴 AT RISK
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

            {/* Layer Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 p-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Layers:
              </span>
              {[
                { id: 'ALL', label: 'All Defects (3)' },
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
              {(activeLayer === 'ALL' || activeLayer === 'CRACK') && (
                <div className="absolute top-[20%] left-[18%] w-[28%] h-[32%] border-3 border-critical bg-critical/20 rounded-lg flex flex-col justify-start p-1.5 shadow-lg pointer-events-none transition-all animate-in zoom-in-95">
                  <span className="bg-critical text-white text-[10px] font-black px-1.5 py-0.5 rounded w-fit uppercase tracking-wider shadow-sm">
                    {isMachine ? 'Rim Crack • 96%' : 'Crack • 94%'}
                  </span>
                </div>
              )}

              {/* Bounding Box 2: Surface Rust / Spalling (Yellow / Medium) */}
              {(activeLayer === 'ALL' || activeLayer === 'RUST') && (
                <div className="absolute top-[48%] left-[45%] w-[38%] h-[30%] border-3 border-attention bg-attention/20 rounded-lg flex flex-col justify-start p-1.5 shadow-lg pointer-events-none transition-all animate-in zoom-in-95">
                  <span className="bg-attention-dark text-white text-[10px] font-black px-1.5 py-0.5 rounded w-fit uppercase tracking-wider shadow-sm">
                    {isMachine ? 'Surface Rust • 89%' : 'Spalling • 87%'}
                  </span>
                </div>
              )}

              {/* Bounding Box 3: Center Bore Wear / Corrosion (Green / Low) */}
              {(activeLayer === 'ALL' || activeLayer === 'WEAR') && (
                <div className="absolute top-[34%] left-[34%] w-[24%] h-[26%] border-3 border-healthy bg-healthy/20 rounded-lg flex flex-col justify-start p-1.5 shadow-lg pointer-events-none transition-all animate-in zoom-in-95">
                  <span className="bg-healthy text-white text-[10px] font-black px-1.5 py-0.5 rounded w-fit uppercase tracking-wider shadow-sm">
                    {isMachine ? 'Bore Wear • 84%' : 'Corrosion • 81%'}
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
            <p className="text-slate-700 text-base leading-relaxed font-medium">
              {isMachine ? (
                "Industrial mechanical hub inspected. High-severity structural fracture detected along the outer circular rim lip with extensive surface oxidation inside the recessed chamber. High risk of complete mechanical fragmentation under rotational load."
              ) : (
                "Crack and surface deterioration were detected. The asset shows signs of deterioration compared with previous inspections."
              )}
            </p>
          </section>
        </div>

        {/* Right Column: AI Detected Issues & Recommended Action */}
        <div className="space-y-6">
          
          {/* AI Detected 3 Issues */}
          <section className="card p-6 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-800">AI Detected 3 Issues</h3>
              <span className="text-xs font-bold text-slate-400">Confidence verified</span>
            </div>
            
            <div className="space-y-3.5">
              {issues.map((issue, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl ${
                  issue.color === 'critical' ? 'bg-critical/5 border border-critical/15' :
                  issue.color === 'attention' ? 'bg-attention/10 border border-attention/20' :
                  'bg-healthy/10 border border-healthy/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{issue.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base">{issue.name}</h4>
                      <p className={`text-xs font-bold ${
                        issue.color === 'critical' ? 'text-critical' :
                        issue.color === 'attention' ? 'text-attention-dark' :
                        'text-healthy'
                      }`}>{issue.severity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-white border border-slate-200 text-slate-800 font-extrabold text-xs px-3 py-1 rounded-full shadow-xs">
                      {issue.conf}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Action Card */}
          <section className="card p-6 md:p-8 bg-slate-900 text-white shadow-xl">
            <h3 className="text-xl font-black mb-5 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              Recommended Action
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
              <LineChartIcon className="w-6 h-6 text-primary" /> Historical Comparison
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
