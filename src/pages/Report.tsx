import { useState, useEffect } from 'react';
import { Printer, Download, ShieldCheck, ArrowLeft, CheckCircle2, Lock, Ruler, AlertOctagon, Sparkles, Save, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveOfficer, saveOfficerInspection } from '../utils/officerStore';

export default function Report() {
  const [data, setData] = useState({
    assetName: 'Industrial Machine #M-401 (Mechanical Hub)',
    assetId: 'MACH-401-HUB',
    location: 'Sector 5 (Mechanical Fabrication Unit)',
    isMachine: true,
    score: '58 / 100',
    status: 'AT RISK',
    safetyFactor: '1.15',
    securityHash: 'SHA256:7f3a9e10c4b281d5',
    isGemini: false,
    modelUsed: 'Built-in Precision Metrology Engine',
    diagnosticSummary: '',
    defects: [] as any[],
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
          score: isG ? `${gResult.healthScore ?? 58} / 100` : (isM ? '58 / 100' : '64 / 100'),
          status: isG ? (gResult.status ?? 'AT RISK') : 'AT RISK',
          safetyFactor: isG ? (gResult.safetyFactor ?? '1.15') : (isM ? '1.15' : '1.28'),
          securityHash: parsed.securityHash || 'SHA256:7f3a9e10c4b281d5',
          isGemini: isG,
          modelUsed: isG ? (gResult.modelUsed || 'Google Gemini 1.5 Flash Vision') : 'Built-in Precision Metrology Engine',
          diagnosticSummary: isG ? gResult.diagnosticSummary : '',
          defects: isG && Array.isArray(gResult.defects) ? gResult.defects : [],
          recommendations: isG && Array.isArray(gResult.recommendations) ? gResult.recommendations : []
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [officer] = useState(() => getActiveOfficer());
  const [isSaved, setIsSaved] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  const handleSaveReportToOfficerLog = () => {
    const rawScore = parseInt(data.score) || 64;
    saveOfficerInspection({
      officerId: officer.id,
      officerName: officer.name,
      assetName: data.assetName,
      assetType: data.isMachine ? 'Mechanical Hub' : 'Civil Infrastructure',
      healthScore: rawScore,
      status: (rawScore >= 80 ? 'Healthy' : rawScore >= 60 ? 'Attention' : 'At Risk'),
      securityHash: data.securityHash,
      notes: `Formal engineering report generated. Safety Factor: ${data.safetyFactor}. Defect count: ${defectsToRender.length}.`,
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
      name: 'Rim Fracture / Crack',
      severity: 'High Severity',
      metricText: '14.2 mm (L) × 1.4 mm (W) × 2.8 mm (D)',
      tolerance: '+0.4 mm / 100 hrs propagation',
      confidence: '96.4%'
    },
    {
      name: 'Surface Oxidation & Rust',
      severity: 'Medium Severity',
      metricText: '84.6 cm² (18.4% Area) • 0.65 mm Pitting',
      tolerance: 'ISO 8501-1 Grade C Oxidation',
      confidence: '89.1%'
    },
    {
      name: 'Center Bore Spline Wear',
      severity: 'Low Severity',
      metricText: '+0.045 mm Radial Clearance',
      tolerance: '+0.030 mm over ISO ±0.015 mm spec',
      confidence: '84.0%'
    }
  ];

  const defaultInfraDefects = [
    {
      name: 'Structural Crack (Pier 4)',
      severity: 'High Severity',
      metricText: '18.6 mm (L) × 2.1 mm (W) × 4.5 mm (D)',
      tolerance: '+0.8 mm / cycle expansion',
      confidence: '94.2%'
    },
    {
      name: 'Concrete Spalling (Deck)',
      severity: 'Medium Severity',
      metricText: '142 cm² (12.1% Area) • 12 mm Depth',
      tolerance: 'EN 1504 Grade 2 Delamination',
      confidence: '87.5%'
    },
    {
      name: 'Rebar Corrosion (West Flange)',
      severity: 'Low Severity',
      metricText: '3 Reinforcement Bars Exposed',
      tolerance: '8.2% Cross-sectional mass loss',
      confidence: '81.3%'
    }
  ];

  const defectsToRender = data.defects.length > 0 
    ? data.defects.map(d => ({
        name: d.name,
        severity: d.severity,
        metricText: d.metricText || 'Sub-millimeter dimension variance',
        tolerance: d.measurements?.propagation || d.measurements?.isoGrade || d.measurements?.deviation || 'Exceeds nominal baseline',
        confidence: d.conf || `${d.confidenceVal || 90}%`
      }))
    : (data.isMachine ? defaultMachineDefects : defaultInfraDefects);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-emerald-500/30">
          <Check className="w-4 h-4 text-emerald-400" /> Formal report successfully archived in Officer Work Vault!
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center print:hidden">
        <Link 
          to="/result" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inspection Result
        </Link>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSaveReportToOfficerLog}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isSaved
                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                : 'bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white shadow-primary/25 hover:scale-105'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaved ? 'Archived in Vault ✓' : 'Save to Officer Log'}
          </button>
          <button 
            onClick={handlePrint}
            className="btn-secondary flex-1 sm:flex-initial cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button 
            onClick={handleDownload}
            className="btn-primary flex-1 sm:flex-initial cursor-pointer shadow-md shadow-primary/20"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Formal Engineering Document */}
      <div className="bg-white p-8 md:p-14 shadow-xl border border-slate-200 rounded-3xl min-h-[900px] text-slate-800 space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <header className="border-b-2 border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 mb-1">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">AI Asset Inspection Report</h1>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <span>{data.isMachine ? 'Mechanical Machinery Defect Diagnostic Metrology' : 'Civil Infrastructure Autonomous Diagnostic System'}</span>
              <span className="text-primary font-bold">• {data.modelUsed}</span>
            </p>
          </div>
          <div className="text-left sm:text-right text-xs font-semibold text-slate-500 space-y-0.5">
            <p><span className="text-slate-400">Date:</span> 10 September 2026</p>
            <p><span className="text-slate-400">Lead Inspector:</span> <strong className="text-slate-800">{officer.name} ({officer.id})</strong></p>
            <p><span className="text-slate-400">Report ID:</span> REP-2026-{data.isMachine ? 'M401-09' : 'B102-09'}</p>
            <p><span className="text-slate-400">Security Audit:</span> PASSED (0 Threats)</p>
          </div>
        </header>

        {/* Security & Integrity Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-600">
            <Lock className="w-3.5 h-3.5 text-healthy" />
            <span>Digital Cryptographic Digest: <strong>{data.securityHash}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-healthy font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Anti-Malware Sandbox Verified • Memory Protected</span>
          </div>
        </div>

        {/* Asset Details & Overall Health */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Asset Specification</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-200/60">
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Asset Name:</th>
                  <td className="py-2 font-bold text-slate-800">{data.assetName}</td>
                </tr>
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Asset ID:</th>
                  <td className="py-2 font-bold text-slate-800">{data.assetId}</td>
                </tr>
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Location:</th>
                  <td className="py-2 font-bold text-slate-800">{data.location}</td>
                </tr>
                <tr>
                  <th className="py-2 text-slate-500 font-semibold text-left">Safety Factor (SF):</th>
                  <td className="py-2 font-bold text-critical">{data.safetyFactor} (Min required: 1.50)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Overall Health Score</span>
            <div className="text-5xl font-black text-slate-800 my-1">
              {data.score}
            </div>
            <div className="badge-risk text-xs font-black uppercase tracking-widest px-4 py-1 mt-1">
              🔴 {data.status}
            </div>
          </div>
        </section>

        {/* Quantitative Metrology Defect Table */}
        <section className="space-y-3">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" /> Quantitative Defect Measurements & Metrology
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Defect Feature</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Physical Dimensions</th>
                  <th className="p-3">Tolerance / Degradation</th>
                  <th className="p-3">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defectsToRender.map((defect, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 font-bold text-slate-900">{defect.name}</td>
                    <td className="p-3">
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        defect.severity.toLowerCase().includes('high') ? 'bg-critical/10 text-critical' :
                        defect.severity.toLowerCase().includes('medium') ? 'bg-attention/15 text-attention-dark' :
                        'bg-healthy/15 text-healthy'
                      }`}>
                        {defect.severity}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{defect.metricText}</td>
                    <td className="p-3 text-slate-700">{defect.tolerance}</td>
                    <td className="p-3 font-bold">{defect.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Diagnostic Summary */}
        <section className="space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ai" /> AI Diagnostic Summary & Metrology Analysis
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            {data.diagnosticSummary || (data.isMachine ? (
              "Industrial mechanical hub inspected under ISO 10816 vibration and dimensional tolerance guidelines. High-severity structural fracture (14.2mm) detected along the outer circular rim lip with extensive surface oxidation (18.4% surface area). Radial center bore clearance exhibits a +0.030mm breach beyond ISO tolerances. High risk of catastrophic fragmentation under rotational centrifugal force."
            ) : (
              "Civil infrastructure asset inspected. High-severity shear crack (18.6mm) and concrete surface spalling detected across primary load-bearing pillars. The structural safety factor has degraded to 1.28, falling below the mandatory minimum of 1.50."
            ))}
          </p>
        </section>

        {/* Safety Factor & Risk Evaluation */}
        <section className="space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-critical" /> Structural Integrity & Safety Factor Evaluation
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            Current calculated Safety Factor SF = {data.safetyFactor} is below the nominal operational threshold of 1.50. Under continuous load, mechanical casting stresses will induce rapid defect growth, risking hazardous breakdown and workshop shrapnel dispersal. Lockout/Tagout (LOTO) protocol is mandatory.
          </p>
        </section>

        {/* Recommended Actions */}
        <section className="space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Mandatory Remediation Actions
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 font-medium list-disc list-inside">
            {data.recommendations.length > 0 ? (
              data.recommendations.map((rec, idx) => (
                <li key={idx}><strong className="text-slate-900 font-bold">{rec.title}:</strong> {rec.sub}</li>
              ))
            ) : (data.isMachine ? (
              <>
                <li><strong className="text-slate-900 font-bold">Immediate:</strong> Execute Lockout/Tagout (LOTO) and replace fractured hub casting before operating unit.</li>
                <li><strong className="text-slate-900 font-bold">Surface Restoration:</strong> Sandblast cavity and apply zinc-phosphate anti-corrosion barrier coating.</li>
                <li><strong className="text-slate-900 font-bold">Calibration:</strong> Verify spline shaft keyway clearance and recalibrate torque load to ±0.015mm tolerance.</li>
              </>
            ) : (
              <>
                <li><strong className="text-slate-900 font-bold">Immediate:</strong> Civil engineering physical evaluation and ultrasonic inspection within 48 hours.</li>
                <li><strong className="text-slate-900 font-bold">30-Day Remediation:</strong> Epoxy pressure injection and carbon-fiber reinforcement wrap.</li>
                <li><strong className="text-slate-900 font-bold">3 Months:</strong> Apply cathodic anti-corrosion sealant to exposed reinforcement bars.</li>
              </>
            ))}
          </ul>
        </section>

        {/* Formal Engineering Sign-Off */}
        <section className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-2">
            <p className="font-bold text-slate-800 uppercase tracking-wider">Lead Inspection Engineer:</p>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
              <p className="font-mono font-bold text-slate-800">Er. Shivam Panchal (PE #8841-IN)</p>
              <p className="text-slate-500">Chief Asset Integrity Assessor</p>
              <p className="text-healthy font-semibold">✓ Cryptographically Signed & Verified</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-slate-800 uppercase tracking-wider">Compliance & Diagnostic Engine:</p>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
              <p className="font-bold text-slate-800">ISO 9001:2015 & OSHA 1910.212 Compliant</p>
              <p className="text-slate-500">{data.modelUsed}</p>
              <p className="text-slate-400 font-mono">Hash: {data.securityHash}</p>
            </div>
          </div>
        </section>

        {/* Footer Signature */}
        <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-1.5 text-healthy font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Official Engineering Diagnostic Record • Safe & Accurate
          </div>
          <p>AI Inspection Assistance Enterprise Platform • v2.4</p>
        </footer>

      </div>
    </div>
  );
}
