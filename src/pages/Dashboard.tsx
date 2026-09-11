import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
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
  Activity,
  Save,
  Trash2,
  Download,
  FolderLock,
  UserCheck
} from 'lucide-react';
import { 
  getActiveOfficer, 
  getOfficerInspections, 
  deleteOfficerInspection,
  type SavedInspectionRecord, 
  type OfficerProfile 
} from '../utils/officerStore';
import { 
  industrialMotorImg, 
  centrifugalPumpImg, 
  structuralJointImg, 
  pipelinePlImg,
  bridge102Img 
} from '../assets/assetImages';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 24,
      stiffness: 280,
    },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [officer, setOfficer] = useState<OfficerProfile>(() => getActiveOfficer());
  const [savedInspections, setSavedInspections] = useState<SavedInspectionRecord[]>(() => getOfficerInspections());
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  useEffect(() => {
    const handleOfficerChange = (e: any) => {
      setOfficer(e.detail || getActiveOfficer());
    };
    const handleWorkSaved = () => {
      setSavedInspections(getOfficerInspections());
    };

    window.addEventListener('officer_state_changed', handleOfficerChange);
    window.addEventListener('officer_work_saved', handleWorkSaved);
    return () => {
      window.removeEventListener('officer_state_changed', handleOfficerChange);
      window.removeEventListener('officer_work_saved', handleWorkSaved);
    };
  }, []);

  const getGreeting = (name: string) => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
    else if (hour >= 17) timeGreeting = 'Good Evening';
    return `${timeGreeting}, ${name}`;
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this saved inspection audit?')) {
      deleteOfficerInspection(id);
      setSavedInspections(getOfficerInspections());
    }
  };

  const handleReviewSaved = (record: SavedInspectionRecord) => {
    // Populate sessionStorage with the saved inspection data
    sessionStorage.setItem('currentInspection', JSON.stringify({
      assetName: record.assetName,
      mediaUrl: record.imageThumbnail || bridge102Img,
      mediaType: 'image',
      mediaName: `${record.assetName.toLowerCase().replace(/\s+/g, '_')}.jpg`,
      securityHash: record.securityHash,
      healthScore: record.healthScore,
      status: record.status,
      isGemini: record.isGemini,
      description: record.notes || 'Structural and surface inspection recorded by field officer.'
    }));
    navigate('/result');
  };

  const handleExportAllJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedInspections, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `officer_${officer.id.toLowerCase()}_audits_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    setCopiedNotification('All saved audit records exported as JSON file!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const healthData = [
    { name: 'Inspected & Verified', value: 8, color: '#10b981', pct: '67%', strokeDash: 176, offset: 0 },
    { name: 'Attention Required', value: 2, color: '#f59e0b', pct: '17%', strokeDash: 44, offset: -176 },
    { name: 'Critical Severity', value: 1, color: '#f43f5e', pct: '8%', strokeDash: 22, offset: -220 },
    { name: 'Pending Inspection', value: 1, color: '#0ea5e9', pct: '8%', strokeDash: 22, offset: -242 },
  ];

  const recentInspections = [
    {
      name: 'Industrial Motor M-401',
      id: 'M-401',
      type: 'Heavy Induction Motor (350 kW)',
      health: 94,
      date: 'Today, 11:20 AM',
      status: 'Verified',
      statusClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      scoreRing: '#10b981',
      image: industrialMotorImg
    },
    {
      name: 'Centrifugal Pump P-204',
      id: 'P-204',
      type: 'Multistage Fluid Pump',
      health: 92,
      date: 'Today, 10:45 AM',
      status: 'Verified',
      statusClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      scoreRing: '#10b981',
      image: centrifugalPumpImg
    },
    {
      name: 'Structural Joint SJ-087',
      id: 'SJ-087',
      type: 'Bolted Gusset Truss Joint',
      health: 74,
      date: 'Today, 09:30 AM',
      status: 'Attention',
      statusClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      scoreRing: '#f59e0b',
      image: structuralJointImg
    },
    {
      name: 'High-Pressure Pipeline PL-201',
      id: 'PL-201',
      type: 'Process Manifold Sector 2',
      health: 42,
      date: 'Today, 08:15 AM',
      status: 'Critical',
      statusClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      scoreRing: '#f43f5e',
      image: pipelinePlImg
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8"
    >
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <Save className="w-4 h-4 text-emerald-400" /> {copiedNotification}
        </div>
      )}
      
      {/* ==========================================================
          1. EXECUTIVE HERO BANNER WITH FLUID HOVER & SHIMMER
      ========================================================== */}
      <motion.section 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/60 shadow-xl laser-shimmer"
      >
        {/* Luminous ambient background lighting */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-float-subtle"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-widest uppercase bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                FIELD OPS MODE ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                • {officer.id} • {officer.department}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              {getGreeting(officer.name)} <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
              AI Metrology & Structural Integrity Engine is online. You have{' '}
              <strong className="text-cyan-400 font-black">{savedInspections.length} inspection audits saved</strong> in your local work vault.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link 
                to="/inspect" 
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" /> Start New Inspection
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link 
                to="/assets" 
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" /> View Assets
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ==========================================================
          2. FOUR LUMINOUS STAT CARDS WITH ANIMATED WAVE SPARKLINES
      ========================================================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Total Assets */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -6, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="luminous-card glow-cyan p-5 md:p-6 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <TrendingUp className="w-3 h-3" /> +4% this wk
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">12</h3>
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Total Monitored Assets</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">Spanning 4 industrial sectors</p>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,20 Q 25,5 50,15 T 100,8 L 100,25 L 0,25 Z" fill="url(#grad-cyan)" />
              <motion.path 
                d="M 0,20 Q 25,5 50,15 T 100,8" 
                fill="none" 
                stroke="#06b6d4" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 2: Inspected */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -6, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="luminous-card glow-emerald p-5 md:p-6 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                67% Verified
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">8</h3>
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Inspected & Verified</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">Cleared within last 48 hours</p>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,22 Q 25,18 50,10 T 100,5 L 100,25 L 0,25 Z" fill="url(#grad-emerald)" />
              <motion.path 
                d="M 0,22 Q 25,18 50,10 T 100,5" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 3: Need Attention */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -6, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="luminous-card glow-amber p-5 md:p-6 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                17% Action
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">2</h3>
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Need Attention</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">Minor wear & micro-fractures</p>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-amber" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,12 Q 30,22 60,8 T 100,14 L 100,25 L 0,25 Z" fill="url(#grad-amber)" />
              <motion.path 
                d="M 0,12 Q 30,22 60,8 T 100,14" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 4: Critical */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -6, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="luminous-card glow-rose p-5 md:p-6 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse">
                1 Critical • 1 Pending
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">1</h3>
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Critical Severity</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">Immediate mitigation flagged</p>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-rose" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,18 Q 30,5 60,20 T 100,10 L 100,25 L 0,25 Z" fill="url(#grad-rose)" />
              <motion.path 
                d="M 0,18 Q 30,5 60,20 T 100,10" 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* ==========================================================
          3. OFFICER WORK VAULT & SAVED INSPECTIONS (NEW PERSISTENCE)
      ========================================================== */}
      <motion.section variants={itemVariants} className="luminous-card p-6 border-primary/25 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Officer Saved Work Vault
                </h3>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {savedInspections.length} Saved
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Inspections saved by {officer.name} ({officer.id}) • Persisted across browser sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedInspections.length > 0 && (
              <button
                onClick={handleExportAllJSON}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Export all saved inspections to JSON"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
            )}
            <Link
              to="/inspect"
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Audit
            </Link>
          </div>
        </div>

        {savedInspections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {savedInspections.map((record) => (
              <div
                key={record.id}
                onClick={() => handleReviewSaved(record)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                        {record.assetName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">{record.formattedDate}</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteRecord(record.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="Delete this saved record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-black text-slate-800 dark:text-white leading-none">
                        {record.healthScore}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">/100</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        record.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        record.status === 'Attention' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        {record.status}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                        {record.notes || record.diagnosticSummary || 'Inspection verified by officer.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Open Full Analysis</span>
                  <Eye className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-800 dark:text-white">No Audits Saved in Vault Yet</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                When you run an inspection in the field, simply click <strong>"Save to Officer Log"</strong> on the results page to preserve your telemetry, photos, and fracture data permanently on this device.
              </p>
            </div>
            <Link
              to="/inspect"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Start First Inspection
            </Link>
          </div>
        )}
      </motion.section>

      {/* ==========================================================
          4. MAIN ANALYTICS ROW: DUAL-RING DONUT + RECENT INSPECTIONS
      ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Overall Asset Health Futuristic Donut Card */}
        <motion.section 
          variants={itemVariants}
          className="luminous-card p-6 lg:col-span-1 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Overall Asset Health</h3>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                AI 98.4%
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Real-time condition breakdown</p>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
              />

              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray="198 264"
                strokeDashoffset="0"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.4, ease: [0.34, 1.2, 0.64, 1] }}
              />

              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeDasharray="37 264"
                strokeDashoffset="-200"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: -200 }}
                transition={{ duration: 1.4, delay: 0.2, ease: [0.34, 1.2, 0.64, 1] }}
              />

              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#f43f5e"
                strokeWidth="10"
                strokeDasharray="14 264"
                strokeDashoffset="-242"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: -242 }}
                transition={{ duration: 1.4, delay: 0.3, ease: [0.34, 1.2, 0.64, 1] }}
              />

              <circle
                cx="50"
                cy="50"
                r="32"
                fill="transparent"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
                className="animate-spin"
                style={{ animationDuration: '40s' }}
              />
            </svg>

            <motion.div 
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
            >
              <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">87</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                Health Index
              </span>
              <span className="text-[10px] text-slate-400 font-medium">12 Registered Assets</span>
            </motion.div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              {healthData.map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.03, x: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.pct}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-3 pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sensor telemetry verified across all 5 sectors</span>
            </div>
          </div>
        </motion.section>

        {/* Right Column: Recent Inspections Table with Photo Thumbnails & Circular Rings */}
        <motion.section 
          variants={itemVariants}
          className="luminous-card lg:col-span-2 flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Recent Inspections</h3>
              <p className="text-xs text-slate-400 font-medium">Completed visual & AI sensor metrology audits</p>
            </div>
            <motion.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Link 
                to="/assets" 
                className="text-primary hover:text-cyan-600 font-bold flex items-center gap-1 text-xs transition-colors cursor-pointer"
              >
                View All Assets <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
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
                  <tr 
                    key={i} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="overflow-hidden rounded-xl w-10 h-10 shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs bg-slate-800">
                          <img 
                            src={row.image} 
                            alt={row.name}
                            width="40"
                            height="40"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%231e293b"/><path d="M10 28L20 12L30 28Z" fill="none" stroke="%2338bdf8" stroke-width="2.5"/><circle cx="20" cy="20" r="3" fill="%2338bdf8"/></svg>';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-white text-sm leading-tight group-hover:text-primary transition-colors">
                            {row.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell font-medium">
                      {row.type}
                    </td>

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
                          <motion.circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="transparent"
                            stroke={row.scoreRing}
                            strokeWidth="3"
                            strokeDasharray="100 100"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 100 - row.health }}
                            transition={{ duration: 1.2, delay: 0.1 * i, ease: "easeOut" }}
                          />
                        </svg>
                        <span className="absolute text-xs font-black text-slate-800 dark:text-white">
                          {row.health}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-400 text-xs hidden md:table-cell font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {row.date}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <motion.div 
                        whileHover={{ scale: 1.08 }} 
                        whileTap={{ scale: 0.92 }} 
                        className="inline-block"
                      >
                        <Link 
                          to="/result" 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </motion.div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>

      {/* ==========================================================
          5. CRITICAL ATTENTION BANNER (Bridge #102 Fracture Alert)
      ========================================================== */}
      <motion.section 
        variants={itemVariants}
        className="luminous-card border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 p-6 md:p-8 animate-pulse-glow"
      >
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

          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}>
            <Link 
              to="/result" 
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 whitespace-nowrap transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Review Inspection Telemetry
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ==========================================================
          6. LARGE BOTTOM FIELD INSPECTION CALL-TO-ACTION
      ========================================================== */}
      <motion.section variants={itemVariants} className="pt-2 flex justify-center">
        <motion.div 
          whileHover={{ scale: 1.025, y: -3 }} 
          whileTap={{ scale: 0.975 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="w-full max-w-2xl"
        >
          <Link 
            to="/inspect" 
            className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white font-black text-base md:text-lg py-4 md:py-5 px-8 md:px-12 rounded-2xl shadow-xl shadow-primary/25 transition-all flex items-center gap-3 w-full justify-center tracking-wide cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[3]" /> START NEW INSPECTION
          </Link>
        </motion.div>
      </motion.section>

    </motion.div>
  );
}
