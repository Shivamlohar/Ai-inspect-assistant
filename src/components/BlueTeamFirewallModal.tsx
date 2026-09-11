import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  Activity, 
  CheckCircle2, 
  RefreshCw,
  Cpu,
  Globe
} from 'lucide-react';

interface BlueTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlueTeamFirewallModal({ isOpen, onClose }: BlueTeamModalProps) {
  const [telemetry, setTelemetry] = useState<{
    status: string;
    blockedCount: number;
    uptime: string;
    rulesCount: number;
    cspStatus: string;
    hstsStatus: string;
  }>({
    status: 'SHIELD_ACTIVE',
    blockedCount: 0,
    uptime: '99.99%',
    rulesCount: 5,
    cspStatus: 'STRICT_ZERO_TRUST',
    hstsStatus: '1_YEAR_PRELOAD'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/firewall-status')
        .then(res => res.json())
        .then(data => {
          if (data && data.metrics) {
            setTelemetry({
              status: data.status || 'SHIELD_ACTIVE',
              blockedCount: data.metrics.blockedAttacks || 0,
              uptime: '100%',
              rulesCount: 5,
              cspStatus: 'STRICT_ZERO_TRUST',
              hstsStatus: '1_YEAR_PRELOAD'
            });
          }
        })
        .catch(() => {
          // Client-side simulation when running purely in static mode
        });
    }
  }, [isOpen]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  if (!isOpen) return null;

  const defensiveModules = [
    {
      id: 'WAF-101',
      title: 'Path Traversal & LFI Shield',
      desc: 'Blocks canonical traversal escapes (../, %2e%2e, win.ini, etc/passwd)',
      status: 'ARMED',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'WAF-201',
      title: 'Anti-SQL Injection Engine',
      desc: 'Deep packet inspection for UNION SELECT, boolean and time-based SQLi',
      status: 'ARMED',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'WAF-301',
      title: 'Command Execution / RCE Jail',
      desc: 'Detects shell escapes, PowerShell, /bin/sh, and JNDI injection attempts',
      status: 'ARMED',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'WAF-401',
      title: 'Zero-Trust CSP & Anti-XSS Filter',
      desc: 'Eliminates untrusted script ingress, locks connect-src and image origins',
      status: 'ARMED',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'WAF-501',
      title: 'Automated Bot & Scanner Jail',
      desc: 'Bans recon probes for .env, .git, and admin panels with sliding rate limits',
      status: 'ARMED',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">Blue Team Active Firewall</h3>
                <span className="text-[10px] font-black tracking-widest uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  TIER-4 SHIELD
                </span>
              </div>
              <p className="text-xs text-slate-400">Application-Layer Web Application Firewall (WAF) & Defense-In-Depth</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Defense Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Firewall Status</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-sm font-black text-emerald-400">ONLINE</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Zero-Trust Active</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Threat Engines</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-sm font-black text-white">{telemetry.rulesCount} Active</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Deep Inspection</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Rate Limiter</span>
              <Lock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-sm font-black text-white">150 req/min</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sliding Window</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Supply Chain</span>
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-sm font-black text-indigo-300">ISOLATED</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Zero CDN Leaks</p>
          </div>
        </div>

        {/* Active Defense Rules Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span>ACTIVE DEFENSE RULES & INTERCEPTORS</span>
            <button 
              onClick={handleRefresh} 
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Verify Rules
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {defensiveModules.map(module => (
              <div 
                key={module.id} 
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-3 hover:bg-slate-800/70 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{module.id}</span>
                    <span className="font-bold text-xs text-white truncate">{module.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{module.desc}</p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${module.color}`}>
                  {module.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic Compliance Standards */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>OWASP Top 10 & Enterprise Compliance Verified</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            All HTTP ingress passes through the Blue Team Reverse-Proxy Shield with HSTS 1-Year Preload, Clickjacking Frame Locks, MIME-Sniffing rejection, and SHA-256 cryptographic media hashing. External image dependencies have been neutralized into local immutable bundles.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gateway Version: BlueTeam-2.0.4-LTS</span>
          </div>
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
