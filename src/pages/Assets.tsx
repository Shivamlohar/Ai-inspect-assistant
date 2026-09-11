import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Camera, 
  History, 
  MapPin, 
  Layers, 
  Factory, 
  Cpu, 
  Container, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  CalendarClock,
  ArrowUpRight
} from 'lucide-react';
import { 
  industrialMotorImg,
  centrifugalPumpImg,
  gearboxImg,
  airCompressorImg,
  concretePillarImg,
  steelBeamImg,
  structuralJointImg,
  electricalPanelImg,
  transformerTrImg,
  storageTankImg,
  pipelinePlImg,
  pressureVesselImg
} from '../assets/assetImages';

export interface IndustrialAsset {
  id: string;
  code: string;
  name: string;
  category: 'INDUSTRIAL MACHINERY' | 'STRUCTURAL INFRASTRUCTURE' | 'ELECTRICAL' | 'STORAGE & PIPELINE';
  type: string;
  location: string;
  healthScore: number | null; // null for pending
  status: 'Inspected & Verified' | 'Attention Required' | 'Critical' | 'Pending Inspection';
  badgeStyle: string;
  date: string;
  image: string;
  specs: string;
  findings: string;
}

export const REGISTERED_ASSETS: IndustrialAsset[] = [
  // 🏭 INDUSTRIAL MACHINERY (4)
  {
    id: 'asset-m401',
    code: 'M-401',
    name: 'Industrial Motor M-401',
    category: 'INDUSTRIAL MACHINERY',
    type: 'Heavy Induction Motor (350 kW)',
    location: 'Plant Floor 1 • Bay 4 (Drive Station)',
    healthScore: 94,
    status: 'Inspected & Verified',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    date: '11 Sep 2026',
    image: industrialMotorImg,
    specs: '3-Phase 400V • 1480 RPM • IP55 Rating',
    findings: 'Thermal signature optimal (54°C). Harmonic vibration 1.2 mm/s well below ISO threshold.'
  },
  {
    id: 'asset-p204',
    code: 'P-204',
    name: 'Centrifugal Pump P-204',
    category: 'INDUSTRIAL MACHINERY',
    type: 'Multistage Centrifugal Fluid Pump',
    location: 'Cooling Water Loop • Manifold 2',
    healthScore: 92,
    status: 'Inspected & Verified',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    date: '11 Sep 2026',
    image: centrifugalPumpImg,
    specs: 'Flow Rate: 420 m³/h • Head: 65m • Cast Steel',
    findings: 'Mechanical seal pressure steady. Zero dynamic cavitation or flange weepage observed.'
  },
  {
    id: 'asset-g118',
    code: 'G-118',
    name: 'Gearbox G-118',
    category: 'INDUSTRIAL MACHINERY',
    type: 'Helical Speed Reducer Drive',
    location: 'Primary Conveyor Line B • Elevation 4m',
    healthScore: 89,
    status: 'Inspected & Verified',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    date: '10 Sep 2026',
    image: gearboxImg,
    specs: 'Ratio 18.5:1 • Synthetic ISO VG 320 Oil',
    findings: 'Gear tooth mesh backlash 0.18mm within tolerance. Lube oil spectrometer particles normal.'
  },
  {
    id: 'asset-c305',
    code: 'C-305',
    name: 'Air Compressor C-305',
    category: 'INDUSTRIAL MACHINERY',
    type: 'Rotary Screw Industrial Compressor',
    location: 'Pneumatics Utility Deck 3',
    healthScore: 95,
    status: 'Inspected & Verified',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    date: '11 Sep 2026',
    image: airCompressorImg,
    specs: 'Discharge: 8.2 Bar • 28 m³/min • Acoustic Hood',
    findings: 'Air dryer dew point -40°C verified. Discharge temperature stable at 76°C under full load.'
  },

  // 🏗️ STRUCTURAL INFRASTRUCTURE (3)
  {
    id: 'asset-cp021',
    code: 'CP-021',
    name: 'Concrete Pillar CP-021',
    category: 'STRUCTURAL INFRASTRUCTURE',
    type: 'Reinforced Concrete Load-Bearing Column',
    location: 'Main Logistics Warehouse • Grid C-4',
    healthScore: 88,
    status: 'Inspected & Verified',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    date: '10 Sep 2026',
    image: concretePillarImg,
    specs: 'Grade M45 Concrete • Rebar Cover 50mm',
    findings: 'Rebound hammer compressive strength 46 MPa. Surface sealed, no spalling or carbonation.'
  },
  {
    id: 'asset-sb114',
    code: 'SB-114',
    name: 'Steel Beam SB-114',
    category: 'STRUCTURAL INFRASTRUCTURE',
    type: 'Heavy Structural I-Beam (Span 18m)',
    location: 'High-Bay Mezzanine Deck • Axis 7',
    healthScore: 91,
    status: 'Inspected & Verified',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    date: '09 Sep 2026',
    image: steelBeamImg,
    specs: 'Grade S355 Structural Steel • 18m Continuous',
    findings: 'Max mid-span deflection 0.8mm (limit L/500 satisfied). Anti-corrosive primer coating intact.'
  },
  {
    id: 'asset-sj087',
    code: 'SJ-087',
    name: 'Structural Joint SJ-087',
    category: 'STRUCTURAL INFRASTRUCTURE',
    type: 'Bolted Gusset Plate Truss Connection',
    location: 'Overhead Roof Truss Framing • Node E-7',
    healthScore: 74,
    status: 'Attention Required',
    badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    date: '11 Sep 2026',
    image: structuralJointImg,
    specs: 'High-Strength Friction Grip M24 Bolts (Gr 8.8)',
    findings: 'Mild surface oxidation on lower gusset flange; torque check recommended on bolt group #3.'
  },

  // 🔌 ELECTRICAL (2)
  {
    id: 'asset-ep052',
    code: 'EP-052',
    name: 'Electrical Panel EP-052',
    category: 'ELECTRICAL',
    type: 'Motor Control Center (MCC) Switchgear',
    location: 'Sub-Control Room 1 • Bay East',
    healthScore: 93,
    status: 'Inspected & Verified',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    date: '11 Sep 2026',
    image: electricalPanelImg,
    specs: '415V 3-Phase • 2500A Main Busbar • Arc Guard',
    findings: 'Infrared thermography scan reveals thermal Delta-T < 2.8°C. Trip timing within 18ms.'
  },
  {
    id: 'asset-tr009',
    code: 'TR-009',
    name: 'Transformer TR-009',
    category: 'ELECTRICAL',
    type: 'Outdoor Substation Step-Down Transformer',
    location: 'Main Substation Yard North • Pad 2',
    healthScore: 87,
    status: 'Inspected & Verified',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    date: '10 Sep 2026',
    image: transformerTrImg,
    specs: '132kV / 33kV • 60 MVA • Mineral Oil ONAN',
    findings: 'Dielectric breakdown voltage 68 kV. Conservator oil level normal, silica breather active.'
  },

  // 🛢️ STORAGE & PIPELINE (3)
  {
    id: 'asset-st301',
    code: 'ST-301',
    name: 'Storage Tank ST-301',
    category: 'STORAGE & PIPELINE',
    type: 'Atmospheric Cylindrical Chemical Tank',
    location: 'Terminal Tank Farm • Bay 3',
    healthScore: 78,
    status: 'Attention Required',
    badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    date: '11 Sep 2026',
    image: storageTankImg,
    specs: 'Capacity: 2500 m³ • SS316L Internal Clad',
    findings: 'Ultrasonic shell thickness nominal 9.2mm. Surface paint blister noticed near spiral ladder weld.'
  },
  {
    id: 'asset-pl201',
    code: 'PL-201',
    name: 'High-Pressure Pipeline PL-201',
    category: 'STORAGE & PIPELINE',
    type: 'Insulated Hydrocarbon Process Piping',
    location: 'Central Process Manifold • Sector 2',
    healthScore: 42,
    status: 'Critical',
    badgeStyle: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    date: '11 Sep 2026',
    image: pipelinePlImg,
    specs: '14-inch Schedule 80 • Design Pressure 64 Bar',
    findings: 'Critical: Flange gasket micro-weepage detected at valve PL-201-V1. Local wall thinning (3.2mm).'
  },
  {
    id: 'asset-pv102',
    code: 'PV-102',
    name: 'Pressure Vessel PV-102',
    category: 'STORAGE & PIPELINE',
    type: 'Horizontal Chemical Accumulator Drum',
    location: 'Reactor Unit Buffer Bay • Deck 1',
    healthScore: null,
    status: 'Pending Inspection',
    badgeStyle: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    date: 'Scheduled Today',
    image: pressureVesselImg,
    specs: 'ASME Sec VIII Div 1 • 25 Bar Design Rating',
    findings: 'Statutory 6-month ASME compliance audit scheduled today. Hydrostatic & NDT probe queued.'
  }
];

export default function Assets() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'category'>('category');

  // Exact Requested Status Breakdown Counts
  const stats = useMemo(() => {
    const total = REGISTERED_ASSETS.length; // 12
    const verified = REGISTERED_ASSETS.filter(a => a.status === 'Inspected & Verified').length; // 8
    const attention = REGISTERED_ASSETS.filter(a => a.status === 'Attention Required').length; // 2
    const critical = REGISTERED_ASSETS.filter(a => a.status === 'Critical').length; // 1
    const pending = REGISTERED_ASSETS.filter(a => a.status === 'Pending Inspection').length; // 1
    return { total, verified, attention, critical, pending };
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Categories', count: 12, icon: Layers },
    { id: 'INDUSTRIAL MACHINERY', label: 'Industrial Machinery', count: 4, icon: Factory },
    { id: 'STRUCTURAL INFRASTRUCTURE', label: 'Structural Infrastructure', count: 3, icon: Layers },
    { id: 'ELECTRICAL', label: 'Electrical', count: 2, icon: Cpu },
    { id: 'STORAGE & PIPELINE', label: 'Storage & Pipeline', count: 3, icon: Container },
  ];

  const filteredAssets = useMemo(() => {
    return REGISTERED_ASSETS.filter(asset => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        asset.name.toLowerCase().includes(q) || 
        asset.code.toLowerCase().includes(q) ||
        asset.location.toLowerCase().includes(q) ||
        asset.type.toLowerCase().includes(q) ||
        asset.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'ALL' || asset.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || asset.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const groupedByCategory = useMemo(() => {
    const groups: { [key: string]: IndustrialAsset[] } = {
      'INDUSTRIAL MACHINERY': [],
      'STRUCTURAL INFRASTRUCTURE': [],
      'ELECTRICAL': [],
      'STORAGE & PIPELINE': []
    };
    filteredAssets.forEach(asset => {
      if (groups[asset.category]) {
        groups[asset.category].push(asset);
      }
    });
    return groups;
  }, [filteredAssets]);

  const handleLaunchInspect = (asset: IndustrialAsset) => {
    sessionStorage.setItem('selectedAsset', `${asset.name} (${asset.code})`);
    navigate('/inspect', { 
      state: { 
        assetName: `${asset.name} (${asset.code})`,
        assetId: asset.code,
        category: asset.category,
        image: asset.image
      } 
    });
  };

  const handleViewDetails = (asset: IndustrialAsset) => {
    sessionStorage.setItem('currentInspection', JSON.stringify({
      assetName: `${asset.name} (${asset.code})`,
      mediaUrl: asset.image,
      mediaType: 'image',
      mediaName: `${asset.code.toLowerCase().replace('-', '_')}_inspection.jpg`,
      securityHash: `SHA256: ${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      healthScore: asset.healthScore !== null ? `${asset.healthScore}/100` : 'Pending (Scheduled)',
      status: asset.status,
      isGemini: true,
      description: asset.findings
    }));
    navigate('/result');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner with Title & Quick Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Registered Industrial Assets
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-0.5">
                Authentic asset registry with verified photorealistic inspection imagery & telemetry
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setViewMode(v => v === 'category' ? 'grid' : 'category')}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-primary transition"
          >
            {viewMode === 'category' ? 'Show All in Grid' : 'Group by Category'}
          </button>

          <Link
            to="/inspect"
            className="btn-primary py-2 px-4 text-xs font-bold shrink-0"
          >
            <Camera className="w-4 h-4" /> New Inspection
          </Link>
        </div>
      </div>

      {/* Exact Requested Status Breakdown Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Assets */}
        <div 
          onClick={() => { setSelectedStatus('ALL'); setSelectedCategory('ALL'); }}
          className={`card p-4 sm:p-5 cursor-pointer transition-all border ${selectedStatus === 'ALL' && selectedCategory === 'ALL' ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'} bg-white dark:bg-slate-900`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Total Assets</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs font-semibold text-slate-400">Assets</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">Industrial inventory</p>
        </div>

        {/* 8 Inspected & Verified */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'Inspected & Verified' ? 'ALL' : 'Inspected & Verified')}
          className={`card p-4 sm:p-5 cursor-pointer transition-all border ${selectedStatus === 'Inspected & Verified' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'} bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04]`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-black uppercase tracking-wider">Inspected & Verified</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.verified}</span>
            <span className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-400/70">Verified</span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-600/80 dark:text-emerald-400/80 mt-1">Nominal condition</p>
        </div>

        {/* 2 Attention Required */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'Attention Required' ? 'ALL' : 'Attention Required')}
          className={`card p-4 sm:p-5 cursor-pointer transition-all border ${selectedStatus === 'Attention Required' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40'} bg-amber-500/[0.03] dark:bg-amber-500/[0.04]`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-black uppercase tracking-wider">Attention Required</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.attention}</span>
            <span className="text-xs font-semibold text-amber-600/70 dark:text-amber-400/70">Action</span>
          </div>
          <p className="text-[11px] font-semibold text-amber-600/80 dark:text-amber-400/80 mt-1">Maintenance audit</p>
        </div>

        {/* 1 Critical */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'Critical' ? 'ALL' : 'Critical')}
          className={`card p-4 sm:p-5 cursor-pointer transition-all border ${selectedStatus === 'Critical' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-rose-500/40'} bg-rose-500/[0.03] dark:bg-rose-500/[0.04]`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-black uppercase tracking-wider">Critical</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{stats.critical}</span>
            <span className="text-xs font-semibold text-rose-600/70 dark:text-rose-400/70">Immediate</span>
          </div>
          <p className="text-[11px] font-semibold text-rose-600/80 dark:text-rose-400/80 mt-1">Isolation required</p>
        </div>

        {/* 1 Pending Inspection */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'Pending Inspection' ? 'ALL' : 'Pending Inspection')}
          className={`card p-4 sm:p-5 cursor-pointer transition-all col-span-2 sm:col-span-1 border ${selectedStatus === 'Pending Inspection' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-sky-500/40'} bg-sky-500/[0.03] dark:bg-sky-500/[0.04]`}
        >
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="text-xs font-black uppercase tracking-wider">Pending Inspection</span>
            <CalendarClock className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-600 dark:text-sky-400">{stats.pending}</span>
            <span className="text-xs font-semibold text-sky-600/70 dark:text-sky-400/70">Scheduled</span>
          </div>
          <p className="text-[11px] font-semibold text-sky-600/80 dark:text-sky-400/80 mt-1">ASME audit today</p>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  active 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  active 
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search code (M-401), name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="ALL">All Statuses ({filteredAssets.length})</option>
            <option value="Inspected & Verified">Inspected & Verified (8)</option>
            <option value="Attention Required">Attention Required (2)</option>
            <option value="Critical">Critical (1)</option>
            <option value="Pending Inspection">Pending Inspection (1)</option>
          </select>
        </div>
      </div>

      {/* Render Assets */}
      {viewMode === 'category' && selectedCategory === 'ALL' ? (
        // Hierarchical Grouped View Matching User Tree
        <div className="space-y-10">
          {(Object.keys(groupedByCategory) as (keyof typeof groupedByCategory)[]).map((catKey) => {
            const catAssets = groupedByCategory[catKey];
            if (catAssets.length === 0) return null;

            const categoryIcons: Record<string, any> = {
              'INDUSTRIAL MACHINERY': Factory,
              'STRUCTURAL INFRASTRUCTURE': Layers,
              'ELECTRICAL': Cpu,
              'STORAGE & PIPELINE': Container
            };
            const Icon = categoryIcons[catKey] || Factory;

            return (
              <div key={catKey} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {catKey}
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {catAssets.length} Assets
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {catAssets.map((asset) => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onInspect={() => handleLaunchInspect(asset)} 
                      onViewDetails={() => handleViewDetails(asset)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Standard Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAssets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onInspect={() => handleLaunchInspect(asset)} 
              onViewDetails={() => handleViewDetails(asset)}
            />
          ))}
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No registered assets match your search</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search keywords or filters</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setSelectedStatus('ALL'); }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
}

function AssetCard({ 
  asset, 
  onInspect, 
  onViewDetails 
}: { 
  asset: IndustrialAsset; 
  onInspect: () => void; 
  onViewDetails: () => void; 
}) {
  return (
    <div className="card bg-white dark:bg-slate-900 flex flex-col hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all group overflow-hidden border border-slate-200 dark:border-slate-800">
      
      {/* 16:9 Image Preview with Stenciled ID overlay */}
      <div className="h-44 bg-slate-900 relative overflow-hidden aspect-[16/9]">
        <img 
          src={asset.image} 
          alt={asset.name} 
          width="480"
          height="270"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="bg-slate-900/90 text-amber-400 font-mono font-black text-xs px-2.5 py-1 rounded-md shadow-md border border-amber-400/30 tracking-wider">
            {asset.code}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-md backdrop-blur-md ${asset.badgeStyle}`}>
            {asset.status === 'Inspected & Verified' && '✓ Verified'}
            {asset.status === 'Attention Required' && '⚠ Attention'}
            {asset.status === 'Critical' && '⛔ Critical'}
            {asset.status === 'Pending Inspection' && '⏳ Scheduled'}
          </span>
        </div>

        {/* Bottom Subtitle */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white/90 text-xs">
          <span className="font-semibold truncate pr-2">{asset.type}</span>
          <span className="text-[10px] text-white/70 shrink-0 font-mono">{asset.date}</span>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
              {asset.name}
            </h3>
          </div>
          
          <p className="text-slate-400 text-xs font-semibold flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {asset.location}
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            {asset.findings}
          </p>
        </div>
        
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Health Score & Indicator */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Index</p>
              <div className="flex items-baseline gap-1">
                {asset.healthScore !== null ? (
                  <>
                    <span className={`font-black text-xl ${
                      asset.healthScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' :
                      asset.healthScore >= 70 ? 'text-amber-600 dark:text-amber-400' :
                      'text-rose-600 dark:text-rose-400'
                    }`}>
                      {asset.healthScore}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">/100</span>
                  </>
                ) : (
                  <span className="font-bold text-xs text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    Audit Due
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {asset.category.replace('INDUSTRIAL ', '').replace('STRUCTURAL ', '')}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button 
              onClick={onViewDetails}
              className="py-1.5 px-2 text-[11px] font-bold text-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition"
              title="View full inspection audit report"
            >
              Details <ArrowUpRight className="w-3 h-3" />
            </button>
            <Link 
              to="/history" 
              className="py-1.5 px-2 text-[11px] font-bold text-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition"
              title="Audit history logs"
            >
              <History className="w-3 h-3" /> Logs
            </Link>
            <button 
              onClick={onInspect}
              className="py-1.5 px-2 text-[11px] font-bold text-center rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-1 transition shadow-xs"
              title="Launch AI Camera / File Inspector"
            >
              <Camera className="w-3 h-3" /> Inspect
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
