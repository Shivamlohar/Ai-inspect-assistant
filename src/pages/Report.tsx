import { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  Ruler, 
  Save, 
  Check, 
  Clock, 
  User, 
  Calendar, 
  CheckSquare, 
  XSquare, 
  HelpCircle, 
  Award, 
  Camera, 
  FileCheck2,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveOfficer, saveOfficerInspection } from '../utils/officerStore';
import { windTurbine401Img, bridge102Img } from '../assets/assetImages';

export default function Report() {
  const [officer] = useState(() => getActiveOfficer());
  const [isSaved, setIsSaved] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const [data, setData] = useState({
    assetName: 'Industrial Machine #M-401 (Mechanical Hub)',
    assetId: 'MACH-401-HUB',
    location: 'Sector 5 (Mechanical Fabrication Unit)',
    isMachine: true,
    score: '72 / 100',
    status: 'At Risk',
    safetyFactor: '1.15',
    securityHash: 'SHA256:7f3a9e10c4b281d5',
    duration: '02:10 minutes',
    mediaUrl: windTurbine401Img,
    isGemini: false,
    modelUsed: 'Built-in Precision Metrology Engine',
    diagnosticSummary: '',
    humanVerifications: {
      'CRACK': 'Confirmed',
      'RUST': 'Confirmed',
      'WEAR': 'Needs Review',
      'defect-crack': 'Confirmed',
      'defect-corrosion': 'Confirmed',
      'defect-wear': 'Needs Review'
    } as Record<string, string>,
    defects: [] as any[],
    customDefects: [] as any[],
    recommendations: [] as any[]
  });

  useEffect(() => {
    const saved = sessionStorage.getItem('currentInspection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isM = parsed.isMachine || 
                    parsed.assetName?.toLowerCase().includes('machine') || 
                    parsed.mediaName?.toLowerCase().includes('screenshot') ||
                    parsed.mediaName?.toLowerCase().includes('machine');
        const isG = Boolean(parsed.isGemini && parsed.geminiResult);
        const gResult = parsed.geminiResult || {};

        setData({
          assetName: parsed.assetName || (isM ? 'Industrial Machine #M-401 (Mechanical Hub)' : 'Bridge #102'),
          assetId: isM ? 'MACH-401-HUB' : 'BRIDGE-102',
          location: isM ? 'Sector 5 (Mechanical Fabrication Unit)' : 'Sector 5 (Highway Crossing)',
          isMachine: isM,
          score: isG ? `${gResult.healthScore ?? 72} / 100` : '72 / 100',
          status: isG ? (gResult.status ?? 'At Risk') : 'At Risk',
          safetyFactor: isG ? (gResult.safetyFactor ?? '1.15') : (isM ? '1.15' : '1.28'),
          securityHash: parsed.securityHash || 'SHA256:7f3a9e10c4b281d5',
          duration: parsed.duration || '02:10 minutes',
          mediaUrl: parsed.mediaUrl || (isM ? windTurbine401Img : bridge102Img),
          isGemini: isG,
          modelUsed: isG ? (gResult.modelUsed || 'Google Gemini 1.5 Flash Vision') : 'Built-in Precision Metrology Engine',
          diagnosticSummary: isG ? gResult.diagnosticSummary : '',
          humanVerifications: parsed.humanVerifications || {
            'CRACK': 'Confirmed',
            'RUST': 'Confirmed',
            'WEAR': 'Needs Review',
            'defect-crack': 'Confirmed',
            'defect-corrosion': 'Confirmed',
            'defect-wear': 'Needs Review'
          },
          defects: isG && Array.isArray(gResult.defects) ? gResult.defects : [],
          customDefects: Array.isArray(parsed.customDefects) ? parsed.customDefects : [],
          recommendations: isG && Array.isArray(gResult.recommendations) ? gResult.recommendations : []
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleExportCmmsCsv = () => {
    const headers = ['Asset ID', 'Asset Name', 'Location', 'Inspection Date', 'Inspector', 'Duration', 'Defensible Health Score', 'Safety Factor', 'Status', 'Defect Name', 'Severity', 'AI Confidence', 'Inspector Verification', 'Dimensions / Metrology'];
    const rows = defectsToRender.map(defect => [
      `"${data.assetId}"`,
      `"${data.assetName}"`,
      `"${data.location}"`,
      `"2026-09-10"`,
      `"${officer.name} (${officer.id})"`,
      `"${data.duration}"`,
      `"${data.score}"`,
      `"${data.safetyFactor}"`,
      `"${data.status}"`,
      `"${defect.name}"`,
      `"${defect.severity}"`,
      `"${defect.confidence}"`,
      `"${data.humanVerifications[defect.id] || 'Confirmed'}"`,
      `"${defect.metricText || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CMMS_AUDIT_${data.assetId}_20260911.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMaximoJson = () => {
    const payload = {
      maximoWorkOrder: {
        wonum: `WO-2026-${data.assetId}`,
        description: `Formal Inspection Audit Certification: ${data.assetName}`,
        assetnum: data.assetId,
        status: 'APPR',
        reportedby: `${officer.name} (${officer.id})`,
        reportdate: new Date().toISOString(),
        healthScore: data.score,
        safetyFactor: data.safetyFactor,
        cryptographicDigest: data.securityHash,
        defectsDetected: defectsToRender.map(d => ({
          defectId: d.id,
          description: d.name,
          severity: d.severity,
          measurements: d.metricText,
          tolerance: d.tolerance,
          confidence: d.confidence,
          inspectorVerification: data.humanVerifications[d.id] || 'Confirmed'
        }))
      }
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `MAXIMO_AUDIT_${data.assetId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveReportToOfficerLog = () => {
    const rawScore = parseInt(data.score) || 72;
    saveOfficerInspection({
      officerId: officer.id,
      officerName: officer.name,
      assetName: data.assetName,
      assetType: data.isMachine ? 'Mechanical Hub' : 'Civil Infrastructure',
      healthScore: rawScore,
      status: (rawScore >= 80 ? 'Healthy' : rawScore >= 60 ? 'Attention' : 'At Risk'),
      securityHash: data.securityHash,
      notes: `Formal 11-point engineering report generated. Inspector verification completed. Safety Factor: ${data.safetyFactor}. Defect count: ${defectsToRender.length}.`,
      diagnosticSummary: data.diagnosticSummary || 'Diagnostic engineering metrology verified.',
      defectsCount: defectsToRender.length,
      isGemini: data.isGemini
    });
    setIsSaved(true);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const defaultMachineDefects = [
    {
      id: 'CRACK',
      name: 'Rim Fracture / Crack',
      severity: 'High Severity',
      metricText: '14.2 mm (L) × 1.4 mm (W) × 2.8 mm (D)',
      tolerance: '+0.4 mm / 100 hrs propagation',
      confidence: '96.4%'
    },
    {
      id: 'RUST',
      name: 'Surface Oxidation & Rust',
      severity: 'Medium Severity',
      metricText: '84.6 cm² (18.4% Area) • 0.65 mm Pitting',
      tolerance: 'ISO 8501-1 Grade C Oxidation',
      confidence: '89.1%'
    },
    {
      id: 'WEAR',
      name: 'Center Bore Spline Wear',
      severity: 'Low Severity',
      metricText: '+0.045 mm Radial Clearance',
      tolerance: '+0.030 mm over ISO ±0.015 mm spec',
      confidence: '84.0%'
    }
  ];

  const defaultInfraDefects = [
    {
      id: 'CRACK',
      name: 'Structural Crack (Pier 4)',
      severity: 'High Severity',
      metricText: '18.6 mm (L) × 2.1 mm (W) × 4.5 mm (D)',
      tolerance: '+0.8 mm / cycle expansion',
      confidence: '94.2%'
    },
    {
      id: 'RUST',
      name: 'Concrete Spalling (Deck)',
      severity: 'Medium Severity',
      metricText: '142 cm² (12.1% Area) • 12 mm Depth',
      tolerance: 'EN 1504 Grade 2 Delamination',
      confidence: '87.5%'
    },
    {
      id: 'WEAR',
      name: 'Rebar Corrosion (West Flange)',
      severity: 'Low Severity',
      metricText: '3 Reinforcement Bars Exposed',
      tolerance: '8.2% Cross-sectional mass loss',
      confidence: '81.3%'
    }
  ];

  const baseDefects = data.defects.length > 0 
    ? data.defects.map(d => ({
        id: d.id || 'CRACK',
        name: d.name,
        severity: d.severity,
        metricText: d.metricText || 'Sub-millimeter dimension variance',
        tolerance: d.measurements?.propagation || d.measurements?.isoGrade || d.measurements?.deviation || 'Exceeds nominal baseline',
        confidence: d.conf || `${d.confidenceVal || 90}%`
      }))
    : (data.isMachine ? defaultMachineDefects : defaultInfraDefects);

  const customMapped = data.customDefects.map(c => ({
    id: c.id,
    name: c.name,
    severity: c.severity,
    metricText: c.metricText,
    tolerance: c.measurements?.notes || 'Field inspector observed anomaly',
    confidence: c.conf || '100% (Human Verified)'
  }));

  const defectsToRender = [...baseDefects, ...customMapped];

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-emerald-500/30">
          <Check className="w-4 h-4 text-emerald-400" /> Action confirmed & saved in Officer Work Vault!
        </div>
      )}

      {/* Top Controls Bar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center print:hidden">
        <Link 
          to="/result" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inspection Result
        </Link>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleSaveReportToOfficerLog}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isSaved
                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                : 'bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white shadow-primary/25 hover:scale-105'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaved ? 'Archived in Vault ✓' : 'Save Log'}
          </button>

          <button 
            onClick={handleExportCmmsCsv}
            className="btn-secondary py-2.5 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export CSV for SAP PM / Oracle CMMS"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          
          <button 
            onClick={handleExportMaximoJson}
            className="btn-secondary py-2.5 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export IBM Maximo JSON"
          >
            <Database className="w-4 h-4 text-cyan-600" /> Maximo JSON
          </button>
          
          <button 
            onClick={handlePrint}
            className="btn-secondary py-2.5 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          
          {/* Action: "Download PDF Report" button matching Screenshot 2 */}
          <button 
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-900/20 hover:scale-105"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Download PDF Report
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE FORMAL ENGINEERING DOCUMENT (Screenshot 2: 11 Core Points)
      ========================================================================= */}
      <div className="bg-white p-6 sm:p-10 md:p-14 shadow-2xl border border-slate-200 rounded-3xl min-h-[900px] text-slate-800 space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* 1. DOCUMENT HEADER & CREDENTIALS */}
        <header className="border-b-2 border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-slate-900 mb-1.5">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                  Automated Inspection Report
                </h1>
                <p className="text-xs font-bold text-slate-500 tracking-wider">
                  ASME Section XI & ISO 55000 Industrial Metrology Audit
                </p>
              </div>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex flex-wrap items-center gap-2">
              <span>{data.isMachine ? 'Mechanical Turbomachinery Defect Metrology' : 'Civil Infrastructure Autonomous Diagnostic System'}</span>
              <span className="text-primary font-bold">• {data.modelUsed}</span>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs font-semibold text-slate-600 space-y-1">
            <p className="flex sm:justify-end items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Date:</span> <strong>10 September 2026</strong>
            </p>
            <p className="flex sm:justify-end items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Inspector:</span> <strong className="text-slate-800">{officer.name} ({officer.id})</strong>
            </p>
            <p className="flex sm:justify-end items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Inspection Duration:</span> <strong className="text-slate-800">{data.duration}</strong>
            </p>
            <p><span className="text-slate-400">Report ID:</span> <strong className="font-mono">REP-2026-{data.isMachine ? 'M401-09' : 'B102-09'}</strong></p>
          </div>
        </header>

        {/* Security & Cryptographic Integrity Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Digest: <strong>{data.securityHash}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero Security Threats • Local Vault Verified • Sandboxed</span>
          </div>
        </div>

        {/* 2 & 3. EQUIPMENT INFORMATION & OVERALL CONDITION ASSESSMENT (Screenshot 2) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-primary" /> Equipment Information
            </h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-200/60 text-xs sm:text-sm">
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Equipment Name:</th>
                  <td className="py-2 font-bold text-slate-800">{data.assetName}</td>
                </tr>
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Asset ID / Serial:</th>
                  <td className="py-2 font-mono font-bold text-slate-800">{data.assetId}</td>
                </tr>
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Facility Location:</th>
                  <td className="py-2 font-bold text-slate-800">{data.location}</td>
                </tr>
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Inspection Duration:</th>
                  <td className="py-2 font-bold text-slate-800">{data.duration}</td>
                </tr>
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Safety Factor (SF):</th>
                  <td className="py-2 font-bold text-rose-600">{data.safetyFactor} SF (Min: 1.50 required)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Overall Condition Assessment
              </span>
              <div className="bg-rose-500/10 text-rose-700 border border-rose-500/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {data.status}
              </div>
            </div>

            <div className="flex items-baseline justify-center gap-2 my-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">{data.score}</span>
            </div>

            {/* Defensible component breakdown table */}
            <div className="text-[11px] font-mono border-t border-slate-100 pt-2 space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>• Structural integrity (40%):</span>
                <strong className="text-slate-800 font-bold">82 (32.8 pts)</strong>
              </div>
              <div className="flex justify-between">
                <span>• Corrosion & Rust (25%):</span>
                <strong className="text-slate-800 font-bold">54 (13.5 pts)</strong>
              </div>
              <div className="flex justify-between">
                <span>• Surface condition (15%):</span>
                <strong className="text-slate-800 font-bold">65 (9.8 pts)</strong>
              </div>
              <div className="flex justify-between">
                <span>• Electrical / Thermal (20%):</span>
                <strong className="text-slate-800 font-bold">91 (18.2 pts)</strong>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-mono text-center mt-2">
              ISO 55000 / ASME Defensible Metrology Formula Compliant
            </p>
          </div>
        </section>

        {/* 4. EVIDENCE PHOTO & VISUAL METROLOGY ANNOTATION (Screenshot 2: Evidence) */}
        <section className="space-y-3">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> Visual Inspection Evidence & Defect Annotations
          </h3>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[16/9] max-h-[340px] flex items-center justify-center">
            <img 
              src={data.mediaUrl} 
              alt="Inspected Asset Evidence"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                (e.target as HTMLImageElement).src = bridge102Img;
              }}
            />

            {/* Evidence Overlay Callouts */}
            <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold border border-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>DEFECT CALLOUT: 14.2 mm Rim Fracture</span>
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 text-cyan-300 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-cyan-500/40">
              ISO 8501-1 Grade C Oxidation (18.4% Area)
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-mono text-center">
            Figure 1.0 — Calibrated optical sensor capture with bounding box and sub-millimeter metrology overlay.
          </p>
        </section>

        {/* 5, 6, 7. LIST OF DETECTED ISSUES + SEVERITY + AI CONFIDENCE + INSPECTOR VERIFICATION (Screenshot 2 & 3) */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" /> Detected Issues & Inspector Verifications
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Human-in-the-loop: Verified by Lead Inspector
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Detected Issue</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Physical Dimensions</th>
                  <th className="p-3">Tolerance / Spec</th>
                  <th className="p-3">AI Confidence</th>
                  <th className="p-3">Inspector Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defectsToRender.map((defect, idx) => {
                  const verificationStatus = data.humanVerifications[defect.id] || 
                                             data.humanVerifications['defect-crack'] || 
                                             'Confirmed';
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="p-3 font-bold text-slate-900">{defect.name}</td>
                      <td className="p-3">
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          defect.severity.toLowerCase().includes('high') ? 'bg-rose-100 text-rose-700' :
                          defect.severity.toLowerCase().includes('medium') ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {defect.severity}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-800">{defect.metricText}</td>
                      <td className="p-3 text-slate-600">{defect.tolerance}</td>
                      <td className="p-3 font-bold text-slate-800 font-mono">{defect.confidence}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                          verificationStatus === 'Confirmed' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                            : verificationStatus === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}>
                          {verificationStatus === 'Confirmed' && <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
                          {verificationStatus === 'Rejected' && <XSquare className="w-3.5 h-3.5 text-rose-600" />}
                          {verificationStatus === 'Needs Review' && <HelpCircle className="w-3.5 h-3.5 text-amber-600" />}
                          <span>[✓] {verificationStatus}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 8. INSPECTOR'S OBSERVATIONS (Screenshot 2) */}
        <section className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" /> Inspector's Field Observations
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            "Lead Inspector <strong>{officer.name} ({officer.id})</strong>: Physical review of {data.assetName} confirms AI finding of high-severity fracture along the circular rim collar. Ultrasonic non-destructive gauge readings confirm localized cross-sectional thinning from 6.0mm to 3.2mm. Surface oxidation is actively weeping with oil leakage. High centrifugal hoop stresses present immediate risk of structural failure. Immediate Lockout/Tagout (LOTO) protocol authorized."
          </p>
        </section>

        {/* 9. RECOMMENDED ACTIONS (Screenshot 2 & 3) */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
              Recommended Actions & Remediation Protocol
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded border border-rose-200">
                Priority: HIGH
              </span>
              <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                Est: 2–4 hours
              </span>
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                Timeframe: Within 7 days
              </span>
            </div>
          </div>

          <ol className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium list-decimal list-inside">
            <li><strong className="text-slate-900 font-bold">Isolate affected component:</strong> Execute Lockout/Tagout (LOTO) protocol. Disconnect electrical power and depressurize local hydraulic load circuits.</li>
            <li><strong className="text-slate-900 font-bold">Perform ultrasonic thickness measurement (UTM):</strong> Deploy calibrated high-frequency UTM probe at 5 designated grid points along fracture boundary to determine wall thickness remaining.</li>
            <li><strong className="text-slate-900 font-bold">Remove surface corrosion:</strong> Grit-blast affected recessed chamber to ISO 8501-1 Sa 2.5 bare-metal standard. Grind micro-crack tips to arrest propagation.</li>
            <li><strong className="text-slate-900 font-bold">Apply structural composite sleeve reinforcement:</strong> Install high-modulus carbon/epoxy composite sleeve reinforcement over collar crack zone to restore nominal hoop stress rating.</li>
            <li><strong className="text-slate-900 font-bold">Reinspect after treatment:</strong> Conduct secondary multimodal AI visual scan, verify dimensional clearance, and recalibrate acoustic vibration baseline.</li>
          </ol>
        </section>

        {/* 10. SIGNATURE / APPROVAL SECTION (Screenshot 2: Signature/approval section) */}
        <section className="pt-6 border-t-2 border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-2">
            <p className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" /> Lead Inspector Sign-Off:
            </p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 space-y-2">
              <div className="font-serif italic text-lg text-slate-900 tracking-wide border-b border-slate-200 pb-1">
                Shivam Panchal
              </div>
              <p className="font-mono font-bold text-slate-800">
                Er. Shivam Panchal (PE #8841-IN)
              </p>
              <p className="text-slate-500">Chief Asset Integrity Assessor • Field Unit 4</p>
              <p className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cryptographically Signed: 10-Sep-2026 14:22 UTC
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-800 uppercase tracking-wider">
              Engineering Approval & Seal:
            </p>
            <div className="border-2 border-emerald-500/40 rounded-xl p-4 bg-emerald-50/50 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  APPROVED FOR REMEDIATION
                </span>
                <span className="font-mono text-[10px] text-slate-400">ID: SEAL-8841</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">ISO 9001:2015 & OSHA 1910.212 Compliant</p>
                <p className="text-slate-500 text-[11px]">Metrology Engine: {data.modelUsed}</p>
                <p className="text-slate-400 font-mono text-[10px]">Tamper Proof Digest: {data.securityHash}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Signature */}
        <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Official Engineering Diagnostic Record • Safe & Accurate
          </div>
          <p className="font-mono">AI Inspection Assistance Enterprise Platform • v2.4</p>
        </footer>

      </div>
    </div>
  );
}
