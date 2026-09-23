import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { getActiveOrganization } from '../utils/organizationStore';

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const org = getActiveOrganization();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/analytics?orgId=${encodeURIComponent(org.id)}`);
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        console.warn('Failed to load analytics telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [org.id]);

  const hasData = Boolean(analyticsData?.hasData && analyticsData?.totalInspections > 0);

  // Parse severity data
  const severityColors: Record<string, string> = {
    HIGH: '#f43f5e',
    MEDIUM: '#f59e0b',
    LOW: '#10b981',
    Critical: '#f43f5e',
    Attention: '#f59e0b',
    Healthy: '#10b981'
  };

  const severityPieData = (analyticsData?.severityBreakdown || []).map((s: any) => ({
    name: s.severity || 'Medium',
    value: s.count || 1,
    color: severityColors[s.severity] || '#0ea5e9'
  }));

  const timelineData = (analyticsData?.inspectionTimeline || []).map((t: any) => ({
    date: t.day ? t.day.slice(5) : 'Day 1',
    inspections: t.count || 1
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8"
    >
      {/* ==========================================================
          1. HEADER
      ========================================================== */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-primary" /> Fleet & Infrastructure Analytics
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Real DB Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Defensible metrology telemetry and degradation trends for <span className="font-semibold text-slate-700 dark:text-slate-200">{org.name}</span>.
          </p>
        </div>

        <Link
          to="/inspect"
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md shadow-primary/25 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection Audit</span>
        </Link>
      </motion.div>

      {/* ==========================================================
          2. EMPTY STATE FALLBACK (STRICT REQUIREMENT)
      ========================================================== */}
      {!loading && !hasData && (
        <motion.div
          variants={itemVariants}
          className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-sm"
        >
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Activity className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              No Inspection Telemetry Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Analytics will appear as your organization completes more inspections.
            </p>
          </div>
          <Link
            to="/inspect"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-primary text-white font-extrabold text-xs shadow-md shadow-primary/25 hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" /> Perform First Inspection
          </Link>
        </motion.div>
      )}

      {/* ==========================================================
          3. REAL CHARTS & ANALYTICS GRIDS
      ========================================================== */}
      {hasData && (
        <>
          {/* Top 4 Summary Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Inspections</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{analyticsData.completedInspections}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Optical metrology verified
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reports Generated</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{analyticsData.reportsGenerated}</p>
              <p className="text-[11px] text-slate-400">Statutory 2-to-3 page digests</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Evidence Uploads</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{analyticsData.evidenceUploads}</p>
              <p className="text-[11px] text-slate-400">Voice, video & calibrated images</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Team Members</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{analyticsData.activeMembers}</p>
              <p className="text-[11px] text-slate-400">Certified field inspectors</p>
            </div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timeline AreaChart (2 Cols) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Inspection Activity Over Time
                </h3>
                <p className="text-xs text-slate-400">
                  Daily frequency of completed optical inspection audits.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData.length > 0 ? timelineData : [{ date: 'Today', inspections: 1 }]}>
                    <defs>
                      <linearGradient id="colorInsp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="inspections" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInsp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Severity Distribution PieChart (1 Col) */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-primary" /> Anomaly Severity Distribution
                </h3>
                <p className="text-xs text-slate-400">
                  Proportion of High vs Medium vs Low severity defects.
                </p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                {severityPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityPieData}
                        innerRadius={48}
                        outerRadius={76}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {severityPieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-xs text-slate-400">
                    <p>No critical defects recorded.</p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Severity
                </span>
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
                </span>
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low
                </span>
              </div>
            </motion.div>

          </div>
        </>
      )}
    </motion.div>
  );
}
