import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  ArrowRight, 
  Plus, 
  ChevronRight,
  Filter,
  Split,
  BarChart3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { 
  bridge102Img, 
  transformer204Img, 
  pipeline201Img, 
  cellTower44Img, 
  mainDam01Img, 
  windTurbine401Img 
} from '../assets/assetImages';

interface InspectionHistoryEntry {
  date: string;
  condition: 'Good' | 'Moderate' | 'Critical';
  issues: number;
  inspector: string;
  score: number;
  status: 'Baseline' | 'Resolved' | 'Under Review' | 'Mitigation Required';
  keyDefect: string;
}

interface AssetProfile {
  id: string;
  name: string;
  type: string;
  location: string;
  image: string;
  currentHealth: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  trendDetails: string;
  predictiveAlert?: string;
  history: InspectionHistoryEntry[];
  chartData: { date: string; score: number; tolerance: number }[];
}

const ASSET_REGISTRY: AssetProfile[] = [
  {
    id: 'CNC-104',
    name: 'CNC Milling Machine — Asset #CNC-104',
    type: 'High-Precision 5-Axis Milling Machine',
    location: 'Mechanical Fabrication Unit • Sector 4',
    image: windTurbine401Img,
    currentHealth: 68,
    trend: 'deteriorating',
    trendDetails: 'Spindle collar micro-fracture & hydraulic pressure drop of 0.4 bar detected over last quarter.',
    predictiveAlert: 'Condition Deteriorating: Accelerated wear pattern detected. Bearing fatigue threshold projected in 3.8 months without realignment.',
    history: [
      { date: 'Sep 2026', condition: 'Moderate', issues: 3, inspector: 'OFF-409', score: 68, status: 'Under Review', keyDefect: 'Spindle collar micro-fracture (14.2mm)' },
      { date: 'Jun 2026', condition: 'Good', issues: 1, inspector: 'OFF-409', score: 88, status: 'Resolved', keyDefect: 'Minor coolant line vibration' },
      { date: 'Mar 2026', condition: 'Good', issues: 0, inspector: 'OFF-302', score: 96, status: 'Baseline', keyDefect: 'Zero anomalies reported' },
      { date: 'Dec 2025', condition: 'Good', issues: 0, inspector: 'OFF-112', score: 98, status: 'Baseline', keyDefect: 'Annual commissioning calibration' }
    ],
    chartData: [
      { date: 'Dec 2025', score: 98, tolerance: 70 },
      { date: 'Mar 2026', score: 96, tolerance: 70 },
      { date: 'Jun 2026', score: 88, tolerance: 70 },
      { date: 'Sep 2026', score: 68, tolerance: 70 }
    ]
  },
  {
    id: 'BRG-102',
    name: 'Highway Viaduct — Bridge #102',
    type: 'Pre-stressed Concrete Girder Bridge',
    location: 'Sector 5 • Interstate River Crossing',
    image: bridge102Img,
    currentHealth: 64,
    trend: 'deteriorating',
    trendDetails: 'Pier 4 shear crack expansion and rebar corrosion detected by ultrasonic sensor.',
    predictiveAlert: 'Condition Deteriorating: Rebar pitting growth rate +19% since June 2026. Epoxying required before freeze-thaw winter cycle.',
    history: [
      { date: 'Sep 2026', condition: 'Moderate', issues: 3, inspector: 'OFF-409', score: 64, status: 'Under Review', keyDefect: 'Pier 4 concrete shear crack (14.2 mm)' },
      { date: 'Jun 2026', condition: 'Good', issues: 1, inspector: 'OFF-409', score: 82, status: 'Resolved', keyDefect: 'Surface hairline stress fractures' },
      { date: 'Jan 2026', condition: 'Good', issues: 0, inspector: 'OFF-201', score: 94, status: 'Baseline', keyDefect: 'Periodic structural compliance pass' }
    ],
    chartData: [
      { date: 'Jan 2026', score: 94, tolerance: 65 },
      { date: 'Jun 2026', score: 82, tolerance: 65 },
      { date: 'Sep 2026', score: 64, tolerance: 65 }
    ]
  },
  {
    id: 'TRN-204',
    name: 'Power Substation — Transformer T-204',
    type: 'Step-Down 300 MVA Oil-Cooled Transformer',
    location: 'North Grid Substation • Sector 2',
    image: transformer204Img,
    currentHealth: 82,
    trend: 'stable',
    trendDetails: 'Thermal signature normalized after radiator cleaning. Slight oil weeping at upper flange.',
    predictiveAlert: 'Condition Stable: Oil breakdown voltage within normal ASTM D877 thresholds. Scheduled for routine re-gasketing.',
    history: [
      { date: 'Sep 2026', condition: 'Good', issues: 1, inspector: 'OFF-409', score: 82, status: 'Under Review', keyDefect: 'Upper flange minor seepage' },
      { date: 'May 2026', condition: 'Moderate', issues: 2, inspector: 'OFF-305', score: 78, status: 'Resolved', keyDefect: 'Radiator fin thermal hot spot' },
      { date: 'Jan 2026', condition: 'Good', issues: 0, inspector: 'OFF-305', score: 92, status: 'Baseline', keyDefect: 'Nominal baseline telemetry' }
    ],
    chartData: [
      { date: 'Jan 2026', score: 92, tolerance: 70 },
      { date: 'May 2026', score: 78, tolerance: 70 },
      { date: 'Sep 2026', score: 82, tolerance: 70 }
    ]
  },
  {
    id: 'PIP-201',
    name: 'Industrial Pipeline — Junction #P-201',
    type: 'High-Pressure Cryogenic Steel Pipeline',
    location: 'Sector 8 • Chemical Storage Corridor',
    image: pipeline201Img,
    currentHealth: 74,
    trend: 'deteriorating',
    trendDetails: 'External galvanic oxidation accelerated around flange bolted connection.',
    predictiveAlert: 'Condition Deteriorating: Wall thickness reduced by 0.65mm due to localized pitting corrosion. Non-destructive ultrasonic test required.',
    history: [
      { date: 'Sep 2026', condition: 'Moderate', issues: 2, inspector: 'OFF-409', score: 74, status: 'Under Review', keyDefect: 'Flange localized pitting corrosion' },
      { date: 'Apr 2026', condition: 'Good', issues: 1, inspector: 'OFF-212', score: 89, status: 'Resolved', keyDefect: 'Paint micro-blistering' },
      { date: 'Nov 2025', condition: 'Good', issues: 0, inspector: 'OFF-212', score: 95, status: 'Baseline', keyDefect: 'Post-overhaul hydro-test passed' }
    ],
    chartData: [
      { date: 'Nov 2025', score: 95, tolerance: 75 },
      { date: 'Apr 2026', score: 89, tolerance: 75 },
      { date: 'Sep 2026', score: 74, tolerance: 75 }
    ]
  },
  {
    id: 'TWR-044',
    name: 'Telecom Mast — Cell Tower #44',
    type: 'Galvanized Lattice Mast 48m',
    location: 'Ridge Peak Sector • Relay Station',
    image: cellTower44Img,
    currentHealth: 96,
    trend: 'improving',
    trendDetails: 'Guy-wire re-tensioning and zinc spray coating completed successfully in August 2026.',
    predictiveAlert: 'Condition Improving: Structural harmonic frequency restored to nominal design limits.',
    history: [
      { date: 'Sep 2026', condition: 'Good', issues: 0, inspector: 'OFF-409', score: 96, status: 'Baseline', keyDefect: 'Optimal structural tension' },
      { date: 'Aug 2026', condition: 'Moderate', issues: 2, inspector: 'OFF-104', score: 80, status: 'Resolved', keyDefect: 'Guy wire #3 slack tension' },
      { date: 'Feb 2026', condition: 'Good', issues: 1, inspector: 'OFF-104', score: 91, status: 'Resolved', keyDefect: 'Antenna bracket surface oxidation' }
    ],
    chartData: [
      { date: 'Feb 2026', score: 91, tolerance: 75 },
      { date: 'Aug 2026', score: 80, tolerance: 75 },
      { date: 'Sep 2026', score: 96, tolerance: 75 }
    ]
  },
  {
    id: 'DAM-001',
    name: 'Hydro Dam — Gravity Dam #01',
    type: 'Reinforced Hydroelectric Gravity Barrier',
    location: 'Reservoir Sector 3 • Spillway Unit',
    image: mainDam01Img,
    currentHealth: 88,
    trend: 'stable',
    trendDetails: 'Spillway seepage pressure sensors reading 12% below allowable engineering limits.',
    predictiveAlert: 'Condition Stable: Core hydrostatic pressure within 50-year operating envelope.',
    history: [
      { date: 'Sep 2026', condition: 'Good', issues: 1, inspector: 'OFF-409', score: 88, status: 'Under Review', keyDefect: 'Spillway crest micro-efflorescence' },
      { date: 'May 2026', condition: 'Good', issues: 1, inspector: 'OFF-301', score: 89, status: 'Resolved', keyDefect: 'Debris gate joint wear' },
      { date: 'Dec 2025', condition: 'Good', issues: 0, inspector: 'OFF-301', score: 92, status: 'Baseline', keyDefect: 'Annual bathymetric survey pass' }
    ],
    chartData: [
      { date: 'Dec 2025', score: 92, tolerance: 80 },
      { date: 'May 2026', score: 89, tolerance: 80 },
      { date: 'Sep 2026', score: 88, tolerance: 80 }
    ]
  }
];

export default function AssetHistory() {
  const navigate = useNavigate();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('CNC-104');

  const asset = ASSET_REGISTRY.find(a => a.id === selectedAssetId) || ASSET_REGISTRY[0];

  const handleRunComparison = () => {
    // Navigate to results page with comparison mode triggered
    navigate('/result');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Header Breadcrumbs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <Link to="/assets" className="hover:text-primary transition-colors flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Assets Registry
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-extrabold flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> Asset History & Predictive Lifecycle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Asset Lifecycle & Inspection History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Multi-year audit telemetry, condition degradation trends, and predictive maintenance forecasting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunComparison}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center gap-2 border border-cyan-500/30 transition cursor-pointer"
          >
            <Split className="w-4 h-4" /> Compare Inspections
          </button>
          <Link
            to="/inspect"
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Inspection
          </Link>
        </div>
      </div>

      {/* Equipment Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-primary" /> Select Equipment / Machine:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {ASSET_REGISTRY.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAssetId(a.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 border cursor-pointer ${
                a.id === asset.id
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-primary dark:border-primary shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                a.trend === 'deteriorating' ? 'bg-amber-400' :
                a.trend === 'improving' ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}></span>
              <span>{a.name.split('—')[0]}</span>
              <span className="font-mono text-[10px] opacity-70 bg-black/15 dark:bg-white/15 px-1.5 py-0.5 rounded">
                #{a.id}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Asset Hero Card */}
      <div className="luminous-card p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Asset Info & Image */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl shrink-0 bg-slate-800">
              <img 
                src={asset.image} 
                alt={asset.name} 
                width="112"
                height="112"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  Asset ID: #{asset.id}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • {asset.location}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {asset.name}
              </h2>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                {asset.type}
              </p>
            </div>
          </div>

          {/* Condition & Health Meter */}
          <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
            <div className="text-right">
              <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Current Health Index</p>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-4xl font-black text-white">{asset.currentHealth}</span>
                <span className="text-xs font-bold text-slate-400">/100</span>
              </div>
              <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                asset.currentHealth >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                asset.currentHealth >= 65 ? 'bg-amber-500/20 text-amber-300' :
                'bg-rose-500/20 text-rose-300'
              }`}>
                {asset.currentHealth >= 80 ? 'Optimal Baseline' : asset.currentHealth >= 65 ? 'Requires Attention' : 'Critical Risk'}
              </span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
              {asset.trend === 'deteriorating' ? (
                <TrendingDown className="w-8 h-8 text-amber-400" />
              ) : asset.trend === 'improving' ? (
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              ) : (
                <Minus className="w-8 h-8 text-cyan-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Condition Trend Callout Box (Screenshot 5) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          asset.trend === 'deteriorating' 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200' 
            : asset.trend === 'improving'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-950 dark:text-cyan-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            asset.trend === 'deteriorating' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' :
            asset.trend === 'improving' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' :
            'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300'
          }`}>
            {asset.trend === 'deteriorating' ? <AlertTriangle className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-wider">
                Condition Trend:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                asset.trend === 'deteriorating' ? 'bg-amber-500 text-slate-950' :
                asset.trend === 'improving' ? 'bg-emerald-500 text-slate-950' :
                'bg-cyan-500 text-slate-950'
              }`}>
                {asset.trend === 'deteriorating' ? '📉 Deteriorating' :
                 asset.trend === 'improving' ? '📈 Improving' : '➡️ Stable'}
              </span>
            </div>
            <p className="text-xs font-medium mt-1 leading-relaxed opacity-90">
              {asset.predictiveAlert || asset.trendDetails}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunComparison}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs shadow-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>View Comparison Delta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Main Grid: History Table + Health Degradation Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left 2 Cols: Inspection History Table (Screenshot 5) */}
        <div className="luminous-card lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Inspection History
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Chronological audits recorded for {asset.name}
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300">
                {asset.history.length} Audits On Record
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3 pl-4">Date</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3 text-center">Issues</th>
                    <th className="p-3">Inspector</th>
                    <th className="p-3">AI Score</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {asset.history.map((entry, idx) => (
                    <tr 
                      key={idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                      onClick={() => navigate('/result')}
                    >
                      <td className="p-3.5 pl-4 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{entry.date}</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] ${
                          entry.condition === 'Good' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                          entry.condition === 'Moderate' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          {entry.condition === 'Good' ? '✔️ Good' :
                           entry.condition === 'Moderate' ? '⚠️ Moderate' : '🔴 Critical'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {entry.issues}
                      </td>

                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                        {entry.inspector}
                      </td>

                      <td className="p-3.5 font-bold">
                        <span className={`px-2 py-0.5 rounded-md ${
                          entry.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                          entry.score >= 65 ? 'bg-amber-500/10 text-amber-600' :
                          'bg-rose-500/10 text-rose-600'
                        }`}>
                          {entry.score} / 100
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Click any inspection row to view audit details</span>
            <Link to="/report" className="text-primary font-bold hover:underline">
              Generate Full Historical PDF Summary &rarr;
            </Link>
          </div>
        </div>

        {/* Right Col: Degradation & Predictive Trend Chart */}
        <div className="luminous-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-500" /> Condition Trend Chart
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">12-Month Telemetry</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-4">
              Historical score progression vs minimum engineering tolerance
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={asset.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="100%">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: '1px solid #334155',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#fff'
                    }} 
                  />
                  <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" name="Asset Score" />
                  <Area type="monotone" dataKey="tolerance" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Safety Threshold" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Health Curve
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-rose-500"></span> Safety Tolerance (70)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Predictive models utilize historical deterioration velocities to forecast component failure points before structural damage occurs.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
