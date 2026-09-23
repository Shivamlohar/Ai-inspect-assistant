import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  X, 
  Send, 
  CheckCircle2, 
  Users, 
  Mail, 
  User, 
  Activity, 
  ShieldCheck
} from 'lucide-react';

interface EnterpriseLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierPreselect?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  title?: string;
  subtitle?: string;
}

export function EnterpriseLeadModal({
  isOpen,
  onClose,
  tierPreselect = 'ENTERPRISE',
  title = 'Enterprise & Custom Pilot Discussion',
  subtitle = 'Connect with our solutions engineering team to tailor Inspectra for your operational workflows.'
}: EnterpriseLeadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    workEmail: '',
    company: '',
    industry: 'Infrastructure & Heavy Machinery',
    companySize: '50-200',
    inspectorsCount: '5-15',
    expectedVolume: '100-500 audits/month',
    requirements: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.workEmail.trim() || !formData.company.trim()) {
      setError('Please fill in your name, work email, and company.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/enterprise/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements || `Inquired via tier: ${tierPreselect}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit enterprise inquiry.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white shadow-md shadow-primary/25 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                  {title}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {tierPreselect}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-slate-800 dark:text-white">
                Inquiry Received
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Thank you, <strong>{formData.name}</strong>. An Inspectra Technical Solutions Architect will reach out to <strong>{formData.workEmail}</strong> within 24 business hours with custom pilot credentials and technical documentation.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left text-xs space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Company:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{formData.company}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Expected Volume:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{formData.expectedVolume}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Pilot Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Priority Evaluation Queue</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition shadow-md cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Er. Priya Sharma"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="priya.sharma@infrastructure.org"
                  value={formData.workEmail}
                  onChange={e => setFormData({ ...formData, workEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="National Highway Infrastructure Corp."
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Industry Domain
                </label>
                <select
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Infrastructure & Heavy Machinery">Infrastructure & Heavy Machinery</option>
                  <option value="Highway & Bridge Authorities">Highway & Bridge Authorities</option>
                  <option value="Energy & Power Generation">Energy & Power Generation</option>
                  <option value="Oil, Gas & Chemical Pipelines">Oil, Gas & Chemical Pipelines</option>
                  <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                  <option value="Insurance & Risk Assessment">Insurance & Risk Assessment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Company Size
                </label>
                <select
                  value={formData.companySize}
                  onChange={e => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium outline-none focus:border-primary cursor-pointer"
                >
                  <option value="1-20">1 - 20 employees</option>
                  <option value="20-50">20 - 50 employees</option>
                  <option value="50-200">50 - 200 employees</option>
                  <option value="200-1000">200 - 1,000 employees</option>
                  <option value="1000+">1,000+ Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Users className="w-3 h-3 text-primary" /> Active Inspectors
                </label>
                <select
                  value={formData.inspectorsCount}
                  onChange={e => setFormData({ ...formData, inspectorsCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium outline-none focus:border-primary cursor-pointer"
                >
                  <option value="1-5">1 - 5 Field Inspectors</option>
                  <option value="5-15">5 - 15 Field Inspectors</option>
                  <option value="15-50">15 - 50 Field Inspectors</option>
                  <option value="50+">50+ Nationwide Force</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Expected Volume
                </label>
                <select
                  value={formData.expectedVolume}
                  onChange={e => setFormData({ ...formData, expectedVolume: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium outline-none focus:border-primary cursor-pointer"
                >
                  <option value="<50 audits/mo">&lt; 50 audits/mo</option>
                  <option value="100-500 audits/mo">100 - 500 audits/mo</option>
                  <option value="500-2,000 audits/mo">500 - 2,000 audits/mo</option>
                  <option value="2,000+ audits/mo">2,000+ audits/mo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Technical Requirements & Integration Needs
              </label>
              <textarea
                rows={2}
                placeholder="e.g. On-premise air-gapped deployment, SAP PM integration, custom thermal defect models..."
                value={formData.requirements}
                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Message / Pilot Objectives
              </label>
              <textarea
                rows={2}
                placeholder="Share any specific dates, target assets, or trial parameters..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Reassurance Notice */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Zero billing commitments. All pilot evaluations include dedicated architectural support and non-disclosure guarantees.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md shadow-primary/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Contact Sales & Request Demo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
