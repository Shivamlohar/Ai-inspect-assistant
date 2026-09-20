import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  Sliders, 
  Cpu, 
  Layers, 
  Search, 
  Activity, 
  FileText, 
  ShieldCheck, 
  ArrowDown, 
  Factory, 
  Building2, 
  Zap, 
  Wrench, 
  Wind, 
  Sun, 
  Truck,
  Droplets,
  Radio, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  SUPPORTED_DOMAINS, 
  REJECTION_RULES, 
  REPORT_FIELDS_SCHEMA 
} from '../data/domainRegistry';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  Factory,
  Building2,
  Zap,
  Wrench,
  Wind,
  Sun,
  Truck,
  Droplets,
  Radio
};

export default function InspectionProcessFlow() {
  const [selectedDomainId, setSelectedDomainId] = useState<string>(SUPPORTED_DOMAINS[0].id);
  const activeDomain = SUPPORTED_DOMAINS.find(d => d.id === selectedDomainId) || SUPPORTED_DOMAINS[0];

  return (
    <section className="card p-6 sm:p-8 md:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-10 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Multi-Domain Visual Inspection Architecture
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          AI INSPECTION ASSISTANT
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
          Multi-Domain Visual Inspection for a Safer, Smarter World
        </p>

        {/* Top Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Multi-Domain Support
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Evidence-Based Metrology
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Zero Sensor Hallucinations
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Engineer Verification Required
          </span>
        </div>
      </div>

      {/* =========================================================================
          STAGE 1 TO 3: INTAKE & PREPROCESSING PIPELINE
      ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        
        {/* Step 1: Input Image */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between hover:border-primary/50 transition shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">Step 1</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">1. INPUT IMAGE</h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Upload clear, high-resolution optical image or optical sensor feed (JPG / PNG / WEBP).
          </p>
          <div className="text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            • Max 50MB • Single/Batch • Optical Zoom
          </div>
        </div>

        {/* Step 2: Image Preprocessing */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between hover:border-primary/50 transition shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step 2</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">2. IMAGE PREPROCESSING</h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Validate file integrity, check quality/resolution, enhance exposure, and compute SHA-256 hash.
          </p>
          <div className="text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            • Aspect Normalized • Tamper Sandbox Active
          </div>
        </div>

        {/* Step 3: AI Model Analysis */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between hover:border-primary/50 transition shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">Step 3</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">3. AI MODEL ANALYSIS</h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Multimodal deep vision inference + Built-in Local Precision Metrology offline fallback.
          </p>
          <div className="text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            • GPT-4o Vision • Precision Local Engine
          </div>
        </div>

      </div>

      {/* Downward connecting arrow */}
      <div className="flex justify-center -my-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      {/* =========================================================================
          THE 7 SUPPORTED DOMAINS
      ========================================================================= */}
      <div className="space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary">Core Architectural Pillars</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Supported Engineering Domains (7 Fields)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Select a domain to inspect equipment taxonomy:
          </span>
        </div>

        {/* Domain Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {SUPPORTED_DOMAINS.map((domain) => {
            const IconComponent = DOMAIN_ICONS[domain.iconName] || Factory;
            const isSelected = domain.id === selectedDomainId;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => setSelectedDomainId(domain.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? `${domain.color.badge} shadow-md scale-102`
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{domain.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Domain Detail Card */}
        <div className={`p-6 rounded-3xl ${activeDomain.color.bg} border-2 ${activeDomain.color.border} transition-all`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Domain Overview & Standards */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${activeDomain.color.badge} flex items-center justify-center shadow-md`}>
                  {React.createElement(DOMAIN_ICONS[activeDomain.iconName] || Factory, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Domain Specification</span>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">{activeDomain.name}</h4>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {activeDomain.description}
              </p>

              <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Compliance Standards</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDomain.standards.map((std, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold">
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Typical Equipment Catalog */}
            <div className="space-y-2 bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-primary" /> Supported Equipment & Assets:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600 dark:text-slate-300">
                {activeDomain.equipment.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Observable Surface Defects */}
            <div className="space-y-2 bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Observable Surface Flaws:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {activeDomain.sampleDefects.map((defect, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{defect}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Downward connecting arrow */}
      <div className="flex justify-center -my-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>

      {/* =========================================================================
          STAGE 4 TO 7: CONVERGENCE PIPELINE & CONDITION ASSESSMENT
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        
        {/* Step 4: Domain Classification */}
        <div className="p-5 rounded-2xl bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/25 space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">4. DOMAIN CLASSIFICATION</h4>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Identifies asset type & maps to valid domain (Machine, Civil, Electrical, etc.).
          </p>
          <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
            • Boundary verification gate
          </span>
        </div>

        {/* Step 5: Defect Analysis */}
        <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/25 space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">5. DEFECT ANALYSIS</h4>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Detects observable surface defects, generates pins/boxes & assigns confidence.
          </p>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            • Visual evidence anchored
          </span>
        </div>

        {/* Step 6: Condition Assessment */}
        <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/25 space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">6. CONDITION ASSESSMENT</h4>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Calculates overall health (Good / Fair / Poor) with defensible 4-factor scoring.
          </p>
          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
            • 40/30/20/10 formula + SF
          </span>
        </div>

        {/* Step 7: Generate Report */}
        <div className="p-5 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/25 space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">7. GENERATE REPORT</h4>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Creates structured dossier with CMMS export & engineer sign-off section.
          </p>
          <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
            • Formal 11-point PDF ready
          </span>
        </div>

      </div>

      {/* =========================================================================
          ERROR / REJECTION HANDLING & STANDARDIZED REPORT FIELDS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 relative z-10">
        
        {/* Rejection / Error Handling Box */}
        <div className="p-6 rounded-3xl bg-rose-500/5 dark:bg-rose-950/20 border-2 border-rose-500/30 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <XCircle className="w-5 h-5" />
            <h4 className="text-sm font-black uppercase tracking-wider">Rejection & Error Handling Policy</h4>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            To guarantee zero-hallucination integrity, inspection is automatically rejected if the image matches:
          </p>

          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {REJECTION_RULES.triggers.map((trigger, idx) => (
              <li key={idx} className="flex items-center gap-2 text-[11px]">
                <span className="w-4 h-4 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px] font-black shrink-0">✕</span>
                <span>{trigger}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-rose-500/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-1">Standardized Rejection Outputs:</span>
            <div className="flex flex-wrap gap-2">
              {REJECTION_RULES.standardOutputs.map((out, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                  {out.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Standardized Report Fields Output */}
        <div className="p-6 rounded-3xl bg-indigo-500/5 dark:bg-indigo-950/20 border-2 border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
            <h4 className="text-sm font-black uppercase tracking-wider">Standardized Report Output Schema</h4>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Every inspection report delivers verified metadata conformant to industrial audit standards:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {REPORT_FIELDS_SCHEMA.map((field, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>{field}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER BANNER */}
      <div className="p-4 rounded-2xl bg-slate-950 text-slate-300 text-xs text-center border border-slate-800 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-semibold">
        <span className="flex items-center gap-1.5 text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Reliable Visual Inspection
        </span>
        <span className="text-slate-600">•</span>
        <span>Evidence-Based Analysis</span>
        <span className="text-slate-600">•</span>
        <span>Multi-Domain Support (7 Fields)</span>
        <span className="text-slate-600">•</span>
        <span>Engineering Guidance</span>
        <span className="text-slate-600">•</span>
        <span className="text-cyan-400 font-bold">Built for a Safer Tomorrow</span>
      </div>

    </section>
  );
}
