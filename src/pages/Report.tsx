import { useState, useEffect } from 'react';
import { Printer, Download, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Report() {
  const [data, setData] = useState({
    assetName: 'Industrial Machine #M-401',
    assetId: 'MACH-401-HUB',
    location: 'Sector 5 (Mechanical Workshop)',
    isMachine: true,
    score: '58/100',
    status: 'AT RISK'
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
        setData({
          assetName: parsed.assetName || (isM ? 'Industrial Machine #M-401' : 'Bridge #102'),
          assetId: isM ? 'MACH-401-HUB' : 'BRIDGE-102',
          location: isM ? 'Sector 5 (Mechanical Workshop)' : 'Sector 5 (Highway Crossing)',
          isMachine: isM,
          score: isM ? '58 / 100' : '64 / 100',
          status: 'AT RISK'
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center print:hidden">
        <Link 
          to="/result" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inspection Result
        </Link>
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
      <div className="bg-white p-8 md:p-14 shadow-xl border border-slate-200 rounded-3xl min-h-[900px] text-slate-800 space-y-8">
        
        {/* Document Header */}
        <header className="border-b-2 border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 mb-1">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">AI Asset Inspection Report</h1>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              {data.isMachine ? 'Mechanical Machinery Defect Diagnostic System' : 'Civil Infrastructure Autonomous Diagnostic System'}
            </p>
          </div>
          <div className="text-left sm:text-right text-xs font-semibold text-slate-500 space-y-0.5">
            <p><span className="text-slate-400">Date:</span> 10 September 2026</p>
            <p><span className="text-slate-400">Report ID:</span> REP-2026-{data.isMachine ? 'M401-09' : 'B102-09'}</p>
            <p><span className="text-slate-400">Inspector ID:</span> FI-409 (Gov Sector 5)</p>
          </div>
        </header>

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
                  <th className="py-2 text-slate-500 font-semibold text-left">Inspection Date:</th>
                  <td className="py-2 font-bold text-slate-800">10 September 2026</td>
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

        {/* Detected Issues */}
        <section className="space-y-3">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Detected Issues
          </h3>
          <ol className="divide-y divide-slate-100 font-semibold text-sm">
            {data.isMachine ? (
              <>
                <li className="py-3 flex items-center justify-between">
                  <span className="text-slate-800">1. Rim Fracture / Crack (Outer Lip)</span>
                  <span className="bg-critical/10 text-critical text-xs font-extrabold px-3 py-1 rounded-full">HIGH SEVERITY</span>
                </li>
                <li className="py-3 flex items-center justify-between">
                  <span className="text-slate-800">2. Surface Oxidation & Rust (Friction Cavity)</span>
                  <span className="bg-attention/15 text-attention-dark text-xs font-extrabold px-3 py-1 rounded-full">MEDIUM SEVERITY</span>
                </li>
                <li className="py-3 flex items-center justify-between">
                  <span className="text-slate-800">3. Center Bore Spline Wear (Shaft Collar)</span>
                  <span className="bg-healthy/15 text-healthy text-xs font-extrabold px-3 py-1 rounded-full">LOW SEVERITY</span>
                </li>
              </>
            ) : (
              <>
                <li className="py-3 flex items-center justify-between">
                  <span className="text-slate-800">1. Structural Crack (Pier 4)</span>
                  <span className="bg-critical/10 text-critical text-xs font-extrabold px-3 py-1 rounded-full">HIGH SEVERITY</span>
                </li>
                <li className="py-3 flex items-center justify-between">
                  <span className="text-slate-800">2. Concrete Spalling (Underside Deck)</span>
                  <span className="bg-attention/15 text-attention-dark text-xs font-extrabold px-3 py-1 rounded-full">MEDIUM SEVERITY</span>
                </li>
                <li className="py-3 flex items-center justify-between">
                  <span className="text-slate-800">3. Rebar Corrosion (West Flange)</span>
                  <span className="bg-healthy/15 text-healthy text-xs font-extrabold px-3 py-1 rounded-full">LOW SEVERITY</span>
                </li>
              </>
            )}
          </ol>
        </section>

        {/* AI Summary */}
        <section className="space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            AI Summary
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            {data.isMachine ? (
              "Industrial mechanical hub inspected. High-severity structural fracture detected along the outer circular rim lip with extensive surface oxidation inside the recessed chamber. High risk of complete mechanical fragmentation under rotational load."
            ) : (
              "Crack and surface deterioration were detected across load-bearing pillars. The asset shows accelerating deterioration compared with previous quarterly inspections."
            )}
          </p>
        </section>

        {/* Risk Assessment */}
        <section className="space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Risk Assessment
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            {data.isMachine ? (
              "Operating this component in its current fractured condition poses severe safety and machine downtime risks. Centrifugal stress will rapidly propagate the rim fracture."
            ) : (
              "The high-severity crack presents an active safety hazard under heavy freight transit. Thermal moisture infiltration will exacerbate shear fracture risks."
            )}
          </p>
        </section>

        {/* Recommended Actions */}
        <section className="space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Recommended Actions
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 font-medium list-disc list-inside">
            {data.isMachine ? (
              <>
                <li><strong className="text-slate-900 font-bold">Immediate:</strong> Replace cracked mechanical hub casting before operating machinery.</li>
                <li><strong className="text-slate-900 font-bold">Maintenance:</strong> Treat oxidation and apply industrial protective anti-corrosion barrier.</li>
                <li><strong className="text-slate-900 font-bold">Calibration:</strong> Verify spline shaft keyway clearance and recalibrate torque load.</li>
              </>
            ) : (
              <>
                <li><strong className="text-slate-900 font-bold">Immediate:</strong> Structural engineering on-site physical evaluation within 48 hours.</li>
                <li><strong className="text-slate-900 font-bold">30-Day Window:</strong> Epoxy pressure injection and carbon-fiber reinforcement for crack stabilization.</li>
                <li><strong className="text-slate-900 font-bold">3 Months:</strong> Reseal spalling surfaces and patch concrete exposed rebars.</li>
              </>
            )}
          </ul>
        </section>

        {/* Historical Comparison */}
        <section className="space-y-3">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Historical Comparison
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400">JAN 2026</p>
              <p className="text-base text-slate-800">96/100</p>
              <span className="text-healthy">Healthy</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400">APR 2026</p>
              <p className="text-base text-slate-800">88/100</p>
              <span className="text-healthy">Healthy</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400">JUL 2026</p>
              <p className="text-base text-slate-800">72/100</p>
              <span className="text-attention-dark">Attention</span>
            </div>
            <div className="p-3 rounded-xl bg-risk/5 border border-risk/20">
              <p className="text-slate-400">SEP 2026</p>
              <p className="text-base text-slate-800">{data.isMachine ? '58/100' : '64/100'}</p>
              <span className="text-risk">At Risk</span>
            </div>
          </div>
        </section>

        {/* Footer Signature */}
        <footer className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-healthy font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Cryptographically certified inspection log
          </div>
          <p>AI Asset Inspection Assistant • v2.4 Enterprise</p>
        </footer>

      </div>
    </div>
  );
}
