import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Camera, 
  FileText, 
  Cpu, 
  UploadCloud, 
  Plus, 
  Clock, 
  UserPlus, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Activity
} from 'lucide-react';
import { 
  getActiveOrganization, 
  fetchCurrentOrganizationData, 
  type OrganizationInfo, 
  type OrgMember, 
  type OrgUsageMetrics,
  FREE_PILOT_NOTICE
} from '../utils/organizationStore';
import { EnterpriseLeadModal } from '../components/EnterpriseLeadModal';
import { getActiveOfficer } from '../utils/officerStore';

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

export default function Organization() {
  const [org, setOrg] = useState<OrganizationInfo>(() => getActiveOrganization());
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [usage, setUsage] = useState<OrgUsageMetrics | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Inspector' as const });
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const officer = getActiveOfficer();

  const loadOrgData = async () => {
    const data = await fetchCurrentOrganizationData(org.id);
    if (data) {
      setOrg(data.organization);
      setMembers(data.members);
      setUsage(data.usage);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    try {
      const res = await fetch('/api/organization/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: org.id,
          name: newMember.name.trim(),
          email: newMember.email?.trim() || null,
          role: newMember.role,
          invitedBy: officer.name
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInviteSuccess(`Invited ${newMember.name} to the team.`);
        setNewMember({ name: '', email: '', role: 'Inspector' });
        setInviteModalOpen(false);
        loadOrgData();
        setTimeout(() => setInviteSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to add team member:', err);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8"
    >
      {/* Toast Notification */}
      {inviteSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {inviteSuccess}
        </div>
      )}

      {/* ==========================================================
          1. ORGANIZATION HEADER & PILOT STATUS BADGE
      ========================================================== */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/60 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white shadow-md shadow-primary/25 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {org.name}
                  </h1>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    FREE PILOT
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sector: {org.industry} • Pilot ID: <span className="font-mono text-slate-300">{org.id}</span>
                </p>
              </div>
            </div>

            {/* Contextual Notice Requirement */}
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl font-medium inline-block">
              {FREE_PILOT_NOTICE}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setInviteModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-primary" />
              <span>Add Member</span>
            </button>
            <Link
              to="/inspect"
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              <span>New Inspection</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ==========================================================
          2. USAGE METRICS (AUTHENTIC DATABASE DATA)
      ========================================================== */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Organization Usage Tracking
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live operational telemetry tallied from your organization's inspection audits.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            Plan: Free Pilot (0/100 cap)
          </span>
        </div>

        {usage && usage.totalInspections === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No inspection activity yet.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start your first inspection to begin tracking automated metrology, reports, and team telemetry.
            </p>
            <Link
              to="/inspect"
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-primary text-white font-bold text-xs"
            >
              <Plus className="w-4 h-4" /> Start First Inspection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* Total Inspections */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Inspections</span>
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {usage?.totalInspections ?? 0}
              </p>
              <p className="text-[10px] text-slate-400">Total audits initiated</p>
            </div>

            {/* Completed */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {usage?.completedInspections ?? 0}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Verified condition</p>
            </div>

            {/* Reports Generated */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Reports</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {usage?.reportsGenerated ?? 0}
              </p>
              <p className="text-[10px] text-slate-400">2-to-3 page dossiers</p>
            </div>

            {/* AI Analyses */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">AI Analyses</span>
                <Cpu className="w-4 h-4 text-cyan-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {usage?.aiAnalyses ?? 0}
              </p>
              <p className="text-[10px] text-slate-400">Optical metrology passes</p>
            </div>

            {/* Evidence Uploads */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Evidence</span>
                <UploadCloud className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {usage?.evidenceUploads ?? 0}
              </p>
              <p className="text-[10px] text-slate-400">Photos & video logs</p>
            </div>

            {/* Team Members */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Members</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {usage?.activeMembers ?? 1}
              </p>
              <p className="text-[10px] text-slate-400">Active inspectors</p>
            </div>

          </div>
        )}
      </motion.div>

      {/* ==========================================================
          3. TEAM MEMBERS & ACTIVITY TIMELINE
      ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team Members List (2 Cols) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Authorized Organization Inspectors
              </h3>
              <p className="text-xs text-slate-400">
                Collaborative team members sharing the organization work vault.
              </p>
            </div>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {members.map(m => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{m.name}</p>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {m.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {m.email || m.user_id}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Timeline (1 Col) */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Recent Audit Activity
            </h3>
            <p className="text-xs text-slate-400">
              Chronological log of pilot events and reports.
            </p>
          </div>

          <div className="space-y-3">
            {usage?.recentActivity && usage.recentActivity.length > 0 ? (
              usage.recentActivity.map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                      {log.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    By {log.performed_by}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No activity recorded yet.
              </p>
            )}
          </div>
        </motion.div>

      </div>

      {/* ==========================================================
          4. ENTERPRISE API INTEGRATION TEASER
      ========================================================== */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900/10 via-slate-900/5 to-purple-900/10 dark:from-purple-950/40 dark:to-slate-900/40 border border-purple-500/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Enterprise API Integration
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Connect Inspectra's optical metrology and AI diagnostic pipeline directly into your SAP PM, IBM Maximo, or custom CMMS infrastructure via REST & WebSockets.
            </p>
          </div>
        </div>

        <button
          onClick={() => setLeadModalOpen(true)}
          className="py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span>Contact Sales</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">Add Team Member</h4>
              </div>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Er. Rahul Mehta"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="rahul.mehta@organization.org"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Role
                </label>
                <select
                  value={newMember.role}
                  onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Inspector">Inspector</option>
                  <option value="Lead Inspector">Lead Inspector</option>
                  <option value="Field Engineer">Field Engineer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/25"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enterprise Lead Modal */}
      <EnterpriseLeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        tierPreselect="ENTERPRISE"
        title="Enterprise API & CMMS Integration"
        subtitle="Request access to Inspectra's high-speed REST & WebSocket API gateway for SAP PM and custom telemetry."
      />
    </motion.div>
  );
}
