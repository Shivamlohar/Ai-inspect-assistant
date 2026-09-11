import { Link } from 'react-router-dom';
import { 
  Plus, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowRight, 
  Eye, 
  TrendingUp, 
  Clock, 
  ShieldAlert,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const healthData = [
    { name: 'Healthy', value: 186, color: '#10b981', pct: '75%', strokeDash: '202 270', offset: '0' },
    { name: 'Attention', value: 34, color: '#f59e0b', pct: '14%', strokeDash: '38 270', offset: '-202' },
    { name: 'At Risk', value: 16, color: '#f97316', pct: '6%', strokeDash: '16 270', offset: '-240' },
    { name: 'Critical', value: 12, color: '#f43f5e', pct: '5%', strokeDash: '14 270', offset: '-256' },
  ];

  const recentInspections = [
    {
      name: 'Bridge #102',
      id: 'BRG-102-S5',
      type: 'Highway Viaduct',
      health: 64,
      date: 'Today, 08:30 AM',
      status: 'At Risk',
      statusClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      scoreRing: '#f97316',
      image: 'https://images.unsplash.com/photo-1545464197-09d3b8417c82?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Transformer T-204',
      id: 'TRN-204-N',
      type: 'Substation North',
      health: 82,
      date: 'Today, 07:15 AM',
      status: 'Attention',
      statusClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      scoreRing: '#f59e0b',
      image: 'https://images.unsplash.com/photo-1613398774005-728b49911e3b?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Rotor Hub M-401',
      id: 'WND-401-E',
      type: 'Wind Turbine Gen-3',
      health: 91,
      date: 'Yesterday, 16:40',
      status: 'Healthy',
      statusClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      scoreRing: '#10b981',
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Cell Tower #44',
      id: 'TWR-044-RP',
      type: 'Telecom Lattice Array',
      health: 96,
      date: '01 Sep 2026',
      status: 'Healthy',
      statusClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      scoreRing: '#06b6d4',
      image: 'https://images.unsplash.com/photo-1581092334812-78d10b7b13df?q=80&w=200&auto=format&fit=crop'
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* ==========================================================
          1. EXECUTIVE HERO BANNER (Approved Bionic Glassmorphic Design)
      ========================================================== */}
      <section className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/60 shadow-xl">
        {/* Luminous ambient background lighting */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-widest uppercase bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                FIELD OPS MODE ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                • GPS: 37.7749° N, 122.4194° W
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Good Morning, Officer #409 <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
              AI Metrology & Structural Integrity Engine is online across 5 monitored sectors. All visual diagnostic systems are running at nominal latency.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
            <Link 
              to="/inspect" 
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" /> Start New Inspection
            </Link>
            <Link 
              to="/assets" 
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" /> View Assets
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================
          2. FOUR LUMINOUS STAT CARDS WITH SVG WAVE SPARKLINES
      ========================================================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Total Assets */}
        <div className="luminous-card glow-cyan p-5 md:p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <TrendingUp className="w-3 h-3" /> +4% this wk
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">248</h3>
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Total Monitored Assets</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">Spanning 5 industrial sectors</p>
          </div>

          {/* Glowing Wave Sparkline */}
          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,20 Q 25,5 50,15 T 100,8 L 100,25 L 0,25 Z" fill="url(#grad-cyan)" />
              <path d="M 0,20 Q 25,5 50,15 T 100,8" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Inspected */}
        <div className="luminous-card glow-emerald p-5 md:p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                75% Complete
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">186</h3>
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Inspected & Verified</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">Cleared within last 30 days</p>
          </div>

          {/* Glowing Wave Sparkline */}
          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,22 Q 25,18 50,10 T 100,5 L 100,25 L 0,25 Z" fill="url(#grad-emerald)" />
              <path d="M 0,22 Q 25,18 50,10 T 100,5" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Need Attention */}
        <div className="luminous-card glow-amber p-5 md:p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                14% Scheduled
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">34</h3>
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Need Attention</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">Minor wear & micro-fractures</p>
          </div>

          {/* Glowing Wave Sparkline */}
          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-amber" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,12 Q 30,22 60,8 T 100,14 L 100,25 L 0,25 Z" fill="url(#grad-amber)" />
              <path d="M 0,12 Q 30,22 60,8 T 100,14" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Critical */}
        <div className="luminous-card glow-rose p-5 md:p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse">
                High Alert
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">12</h3>
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Critical Severity</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">Immediate mitigation flagged</p>
          </div>

          {/* Glowing Wave Sparkline */}
          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-rose" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,18 Q 30,5 60,20 T 100,10 L 100,25 L 0,25 Z" fill="url(#grad-rose)" />
              <path d="M 0,18 Q 30,5 60,20 T 100,10" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ==========================================================
          3. MAIN ANALYTICS ROW: DUAL-RING DONUT + RECENT INSPECTIONS
      ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Overall Asset Health Futuristic Donut Card */}
        <section className="luminous-card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Overall Asset Health</h3>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                AI 98.4%
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Real-time condition breakdown</p>
          </div>

          {/* Futuristic Glowing Donut Graphic */}
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
              />

              {/* Segment 1: Healthy (Cyan/Emerald) */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray="198 264"
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Segment 2: Attention (Amber) */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeDasharray="37 264"
                strokeDashoffset="-200"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Segment 3: Critical (Rose) */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#f43f5e"
                strokeWidth="10"
                strokeDasharray="14 264"
                strokeDashoffset="-242"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner Decorative Accent Ring */}
              <circle
                cx="50"
                cy="50"
                r="32"
                fill="transparent"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            </svg>

            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">84</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                Health Index
              </span>
              <span className="text-[10px] text-slate-400 font-medium">248 Assets</span>
            </div>
          </div>

          {/* Breakdown Chips */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              {healthData.map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.pct}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sensor telemetry verified across all 5 sectors</span>
            </div>
          </div>
        </section>

        {/* Right Column: Recent Inspections Table with Photo Thumbnails & Circular Rings */}
        <section className="luminous-card lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Recent Inspections</h3>
              <p className="text-xs text-slate-400 font-medium">Completed visual & AI sensor metrology audits</p>
            </div>
            <Link 
              to="/assets" 
              className="text-primary hover:text-cyan-600 font-bold flex items-center gap-1 text-xs transition-colors cursor-pointer"
            >
              View All Assets <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 pl-6">Asset & Thumbnail</th>
                  <th className="p-4 hidden sm:table-cell">Sub-system</th>
                  <th className="p-4 text-center">AI Score</th>
                  <th className="p-4 hidden md:table-cell">Timestamp</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {recentInspections.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Asset name + Image thumbnail */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={row.image} 
                          alt={row.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                          loading="lazy"
                        />
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-white text-sm leading-tight">{row.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Sub-system / Type */}
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell font-medium">
                      {row.type}
                    </td>

                    {/* Circular Glowing Health Score Ring */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center relative w-10 h-10">
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-slate-100 dark:text-slate-800"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="transparent"
                            stroke={row.scoreRing}
                            strokeWidth="3"
                            strokeDasharray={`${(row.health / 100) * 100} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-xs font-black text-slate-800 dark:text-white">
                          {row.health}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="p-4 text-slate-400 text-xs hidden md:table-cell font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {row.date}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        to="/result" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ==========================================================
          4. CRITICAL ATTENTION BANNER (Bridge #102 Fracture Alert)
      ========================================================== */}
      <section className="luminous-card border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-rose-500/15 p-3.5 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0 border border-rose-500/25">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  ⚠ Critical Defect Detected
                </span>
                <span className="text-xs text-slate-400 font-medium">Detected 2 hours ago by Edge Vision</span>
              </div>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mb-1">
                Bridge #102: Primary Pier 4 Shear Crack
              </h4>
              <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1">
                High severity tensile crack (estimated width: 3.8mm, depth: 14.2mm) detected on load-bearing concrete beam.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Structural integrity reduced to 64%. Maintenance team dispatch recommended within 30 days.
              </p>
            </div>
          </div>
          <Link 
            to="/result" 
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 whitespace-nowrap transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Review Inspection Telemetry
          </Link>
        </div>
      </section>

      {/* ==========================================================
          5. LARGE BOTTOM FIELD INSPECTION CALL-TO-ACTION
      ========================================================== */}
      <section className="pt-2 flex justify-center">
        <Link 
          to="/inspect" 
          className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white font-black text-base md:text-lg py-4 md:py-5 px-8 md:px-12 rounded-2xl shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 flex items-center gap-3 w-full max-w-2xl justify-center tracking-wide cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[3]" /> START NEW INSPECTION
        </Link>
      </section>

    </div>
  );
}
