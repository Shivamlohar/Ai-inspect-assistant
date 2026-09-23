import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle
} from 'lucide-react';
import type { PlanTier } from '../utils/planConfig';
import { EnterpriseLeadModal } from '../components/EnterpriseLeadModal';
import { FREE_PILOT_NOTICE } from '../utils/organizationStore';

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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
      duration: 0.25,
      ease: 'easeOut',
    },
  },
};

export default function Pricing() {
  const navigate = useNavigate();
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('ENTERPRISE');

  const handleTierCta = (tier: PlanTier) => {
    if (tier === 'FREE_PILOT' || tier === 'STARTER') {
      navigate('/inspect');
    } else if (tier === 'PROFESSIONAL') {
      setSelectedTier('PROFESSIONAL');
      setLeadModalOpen(true);
    } else {
      setSelectedTier('ENTERPRISE');
      setLeadModalOpen(true);
    }
  };

  const faqs = [
    {
      q: 'Is Inspectra really 100% free during the pilot phase?',
      a: 'Yes. Inspectra is currently operating under our Free Pilot program. You can perform computer vision inspections, log optical evidence, generate statutory 2-to-3 page reports, and invite team members with zero payment information or credit card required.'
    },
    {
      q: 'How will commercial pricing work after the pilot?',
      a: 'Commercial pricing will be transparent and tailored based on inspection volume, active team members, and enterprise integration needs. All pilot participants will receive guaranteed preferred pricing with no unexpected or automatic charges.'
    },
    {
      q: 'Can we test Inspectra with our own machinery and bridge photos?',
      a: 'Absolutely. You can upload any industrial machinery or civil infrastructure photos and videos immediately. Our built-in Optical Precision Metrology Engine works in real time right in your browser and on our local gateway without requiring external cloud accounts.'
    },
    {
      q: 'What is included in the Professional and Enterprise tiers?',
      a: 'Professional is designed for multi-site organizations needing advanced NDT validation protocols and historical degradation analytics. Enterprise includes dedicated on-premise air-gapped deployments, custom model training, and integration with your existing ERP or CMMS.'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 md:space-y-12"
    >
      {/* ==========================================================
          1. HEADER & FREE PILOT BANNER
      ========================================================== */}
      <motion.div variants={itemVariants} className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Free Pilot Program Active • Prototype Phase</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Transparent, Defensible Inspection Tiers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Inspectra is currently <strong className="text-slate-800 dark:text-slate-200">100% free to evaluate</strong> for engineering, maintenance, and infrastructure teams. Commercial licensing is established through collaborative pilot discussions — no credit cards or recurring billing.
        </p>

        {/* Highlight Banner */}
        <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 max-w-xl mx-auto">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>{FREE_PILOT_NOTICE}</span>
        </div>
      </motion.div>

      {/* ==========================================================
          2. THREE CORE BUSINESS TIERS
      ========================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        
        {/* TIER 1: STARTER */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
        >
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Starter Tier
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                Starter
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For small inspection teams starting out.
              </p>
            </div>

            <div className="py-2 border-y border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  Free Pilot
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero commercial billing during prototype phase
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Included Capabilities:
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Single-site asset registry & inspection logging</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Optical surface fracture & wear metrology</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Standard 2-page statutory audit report generator</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Up to 5 field inspector logins</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Full cryptographic SHA-256 audit digest</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={() => handleTierCta('STARTER')}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Start Free Pilot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Instant access • No payment info needed
            </p>
          </div>
        </motion.div>

        {/* TIER 2: PROFESSIONAL */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 border-2 border-primary/40 shadow-xl flex flex-col justify-between relative"
        >
          {/* Most Popular Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-primary/30">
            Recommended for Engineering Teams
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                Multi-Site Organizations
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                Professional
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For growing and multi-site organizations.
              </p>
            </div>

            <div className="py-2 border-y border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  Pilot / Custom
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dedicated pilot onboarding & custom fleet scoping
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Everything in Starter, plus:
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Multi-site asset hierarchies</strong> & fleet analytics</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>3-Page Technical Dossier</strong> with NDT Secondary Protocols</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>PAUT Ultrasonic & Eddy Current array recommendations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Defensible 4-factor scoring with historical degradation tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Priority solutions support & custom calibration targets</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={() => handleTierCta('PROFESSIONAL')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-primary/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Request Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Live technical walkthrough with an engineer
            </p>
          </div>
        </motion.div>

        {/* TIER 3: ENTERPRISE */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
        >
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Enterprise Solutions
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                Enterprise
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For large-scale operations & corporate networks.
              </p>
            </div>

            <div className="py-2 border-y border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  Custom
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tailored SLA, volume pricing & infrastructure deployment
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Enterprise Capabilities:
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>Unlimited inspection volume</strong> & video telemetry</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>Air-gapped on-premise</strong> or Private Cloud (VPC) install</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>Enterprise REST & WebSocket API integration (Coming Soon)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>Integration with SAP PM, IBM Maximo, or Oracle CMMS</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>Dedicated Solutions Engineer & custom SLA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={() => handleTierCta('ENTERPRISE')}
              className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Contact Sales</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Custom terms & non-disclosure agreements
            </p>
          </div>
        </motion.div>
      </div>

      {/* ==========================================================
          3. COMPREHENSIVE CAPABILITIES COMPARISON TABLE
      ========================================================== */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Feature Comparison Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare capabilities across our current Free Pilot and upcoming enterprise offerings.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="p-4 font-black text-slate-700 dark:text-slate-200">Feature / Capability</th>
                <th className="p-4 font-black text-sky-600 dark:text-sky-400 text-center">Starter (Free Pilot)</th>
                <th className="p-4 font-black text-primary text-center">Professional</th>
                <th className="p-4 font-black text-purple-600 dark:text-purple-400 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">Commercial Cost</td>
                <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400">Free Pilot ($0)</td>
                <td className="p-4 text-center text-slate-600 dark:text-slate-400">Custom Pilot / Demo</td>
                <td className="p-4 text-center text-slate-600 dark:text-slate-400">Custom Contract</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Voice & Video Evidence Upload</td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">AI Visual Defect Detection</td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Statutory 2-to-3 Page Report Generator</td>
                <td className="p-4 text-center">2 Pages</td>
                <td className="p-4 text-center font-bold text-primary">2 or 3 Pages Dynamic</td>
                <td className="p-4 text-center font-bold text-purple-500">Custom Dossiers</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">NDT Secondary Validation Protocol</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Multi-Site Asset Hierarchies</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Air-Gapped / On-Premise Deployment</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">Enterprise API Integration</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center text-slate-400">—</td>
                <td className="p-4 text-center font-bold text-purple-500">Coming Soon (Custom)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ==========================================================
          4. FREQUENTLY ASKED QUESTIONS
      ========================================================== */}
      <motion.div variants={itemVariants} className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <HelpCircle className="w-4 h-4" /> FAQ
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Common Questions About the Free Pilot
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5"
            >
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {faq.q}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Enterprise Contact Modal */}
      <EnterpriseLeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        tierPreselect={selectedTier}
        title={selectedTier === 'PROFESSIONAL' ? 'Request Professional Pilot Demo' : 'Contact Enterprise Solutions'}
        subtitle="Speak directly with an Inspectra Solutions Architect regarding multi-site deployment or custom SLAs."
      />
    </motion.div>
  );
}
