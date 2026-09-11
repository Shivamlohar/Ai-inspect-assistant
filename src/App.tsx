import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from './components/AnimatedBackground';
import { PageTransition } from './components/PageTransition';
import { 
  LayoutDashboard, 
  Building2, 
  Camera, 
  FileText, 
  Bell, 
  Settings, 
  ShieldCheck, 
  X, 
  Sun, 
  Moon, 
  Laptop,
  Activity,
  Search,
  LogIn,
  LogOut,
  User,
  History,
  Phone,
  Check,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { getGeminiApiKey } from './services/aiApi';
import type { ThemeMode } from './utils/theme';
import { getStoredTheme, applyTheme } from './utils/theme';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getActiveOfficer, setActiveOfficer, logoutOfficer, getOfficerInspections, type OfficerProfile } from './utils/officerStore';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewInspection = lazy(() => import('./pages/NewInspection'));
const AiAnalysis = lazy(() => import('./pages/AiAnalysis'));
const InspectionResult = lazy(() => import('./pages/InspectionResult'));
const Report = lazy(() => import('./pages/Report'));
const Assets = lazy(() => import('./pages/Assets'));
const SystemCheck = lazy(() => import('./pages/SystemCheck'));
const AssetHistory = lazy(() => import('./pages/AssetHistory'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Optimizing Diagnostics...</p>
    </div>
  );
}

function AlertsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.35, bounce: 0.18 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-risk/10 text-risk">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">System Alerts</h3>
              <p className="text-xs text-slate-500">Real-time infrastructure notifications</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close alerts dialog"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          <div className="p-4 rounded-2xl bg-critical/5 border border-critical/15 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-critical">Critical Severity</span>
              <span className="text-[11px] text-slate-400">10 mins ago</span>
            </div>
            <p className="font-bold text-slate-800 text-sm">Bridge #102 Structural Crack</p>
            <p className="text-xs text-slate-600">High severity crack detected on Pier 4. Immediate review advised.</p>
          </div>

          <div className="p-4 rounded-2xl bg-attention/10 border border-attention/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-attention-dark">Maintenance Warning</span>
              <span className="text-[11px] text-slate-400">2 hours ago</span>
            </div>
            <p className="font-bold text-slate-800 text-sm">Transformer T-204 Thermal Peak</p>
            <p className="text-xs text-slate-600">Temperature reading +12°C higher than monthly baseline.</p>
          </div>

          <div className="p-4 rounded-2xl bg-healthy/10 border border-healthy/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-healthy">Routine Passed</span>
              <span className="text-[11px] text-slate-400">Yesterday</span>
            </div>
            <p className="font-bold text-slate-800 text-sm">Cell Tower #44 Verified</p>
            <p className="text-xs text-slate-600">AI inspection completed with 95/100 health score.</p>
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition"
          >
            Close Alerts
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SettingsModal({ 
  isOpen, 
  onClose,
  currentTheme,
  onSetTheme
}: { 
  isOpen: boolean; 
  onClose: () => void;
  currentTheme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.35, bounce: 0.18 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Inspection & UI Settings</h3>
              <p className="text-xs text-slate-500">Configure visual themes, metrology diagnostics & preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close settings dialog"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Appearance Setting Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Theme Appearance</span>
            </div>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-200/80 text-slate-700">
              {currentTheme === 'dark' ? '🌙 Dark Active' : currentTheme === 'light' ? '☀️ Light Active' : '💻 System Match'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSetTheme('light')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                currentTheme === 'light'
                  ? 'bg-white border-primary shadow-sm text-primary font-black ring-2 ring-primary/20'
                  : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold">Light</span>
            </button>

            <button
              type="button"
              onClick={() => onSetTheme('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                currentTheme === 'dark'
                  ? 'bg-slate-900 border-primary shadow-sm text-white font-black ring-2 ring-primary/20'
                  : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Moon className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold">Dark</span>
            </button>

            <button
              type="button"
              onClick={() => onSetTheme('system')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                currentTheme === 'system'
                  ? 'bg-primary/10 border-primary shadow-sm text-primary font-black ring-2 ring-primary/20'
                  : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Laptop className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-bold">System</span>
            </button>
          </div>
        </div>

        {/* Other Inspection Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div>
              <p className="font-semibold text-slate-800 text-sm">High-Precision Vision Metrology</p>
              <p className="text-xs text-slate-500">Calculate sub-millimeter fracture dimensions & area %</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Voice Dictation Speech-to-Text</p>
              <p className="text-xs text-slate-500">Auto-transcribe inspector notes during field audits</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-healthy/5 border border-healthy/20">
            <div>
              <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-healthy animate-pulse"></span>
                Anti-Malware & Sandbox Guard
              </p>
              <p className="text-xs text-slate-500">MIME verification, payload blocking & memory isolation active</p>
            </div>
            <span className="text-[11px] font-bold text-healthy bg-healthy/10 px-2 py-0.5 rounded-md">ENFORCED</span>
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-md shadow-slate-900/10 cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleLogoSvg({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function OfficerModal({
  isOpen,
  onClose,
  officer,
  onOfficerUpdated
}: {
  isOpen: boolean;
  onClose: () => void;
  officer: OfficerProfile;
  onOfficerUpdated: (profile: OfficerProfile) => void;
}) {
  const [isEditing, setIsEditing] = useState(!officer.isLoggedIn);
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | 'badge'>('google');

  // Google Login State
  const [googleName, setGoogleName] = useState('Shivam Lohar');
  const [googleEmail, setGoogleEmail] = useState('shivam.lohar@gmail.com');
  const [isCustomGoogle, setIsCustomGoogle] = useState(false);

  // Phone OTP Login State
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('4092');
  const [phoneError, setPhoneError] = useState('');

  // Badge Login State
  const [name, setName] = useState(officer.name);
  const [badgeId, setBadgeId] = useState(officer.id);
  const [department, setDepartment] = useState(officer.department);
  const [role, setRole] = useState(officer.role);

  useEffect(() => {
    if (isOpen) {
      setName(officer.name);
      setBadgeId(officer.id);
      setDepartment(officer.department);
      setRole(officer.role);
      setIsEditing(!officer.isLoggedIn);
      setOtpSent(false);
      setPhoneError('');
    }
  }, [isOpen, officer]);

  if (!isOpen) return null;

  const savedInspections = getOfficerInspections();

  // Handle Google Sign-in
  const handleGoogleSignIn = () => {
    const cleanName = googleName.trim() || 'Shivam Lohar';
    const initials = cleanName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
    const profile: OfficerProfile = {
      id: `GOOG-${cleanName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`,
      name: cleanName,
      email: googleEmail.trim() || 'shivam.lohar@gmail.com',
      authProvider: 'google',
      role: 'Certified Senior Inspector',
      department: 'Infrastructure & Safety Engineering',
      avatarInitials: initials,
      isLoggedIn: true,
      loginTime: Date.now()
    };
    setActiveOfficer(profile);
    onOfficerUpdated(profile);
    setIsEditing(false);
    onClose();
  };

  // Handle Phone OTP Dispatch
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setOtpSent(true);
    setOtpCode(newOtp); // Auto-fill for convenience
    setPhoneError('');
  };

  // Handle Phone OTP Verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== generatedOtp.trim()) {
      setPhoneError('Invalid verification code. Please check the SMS code.');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    const profile: OfficerProfile = {
      id: `PH-${cleanDigits.slice(-4)}`,
      name: `Inspector (+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)})`,
      phone: `+91 ${cleanDigits}`,
      authProvider: 'phone',
      role: 'Field Mobile Inspector',
      department: 'Mobile Telemetry Unit',
      avatarInitials: 'IN',
      isLoggedIn: true,
      loginTime: Date.now()
    };
    setActiveOfficer(profile);
    onOfficerUpdated(profile);
    setIsEditing(false);
    onClose();
  };

  // Handle Badge ID Form Submit
  const handleBadgeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const initials = name
      .trim()
      .split(' ')
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'FI';

    const profile: OfficerProfile = {
      id: badgeId.trim() || 'OFF-409',
      name: name.trim(),
      role: role || 'Field Inspector',
      department: department || 'Civil & Structural Infrastructure',
      avatarInitials: initials,
      authProvider: 'badge',
      isLoggedIn: true,
      loginTime: Date.now()
    };
    setActiveOfficer(profile);
    onOfficerUpdated(profile);
    setIsEditing(false);
    onClose();
  };

  const handleQuickLogin409 = () => {
    const profile: OfficerProfile = {
      id: 'OFF-409',
      name: 'Officer #409',
      role: 'Lead Field Inspector',
      department: 'Civil & Structural Infrastructure',
      avatarInitials: 'FI',
      authProvider: 'badge',
      isLoggedIn: true,
      loginTime: Date.now()
    };
    setActiveOfficer(profile);
    onOfficerUpdated(profile);
    setIsEditing(false);
    onClose();
  };

  const handleLogout = () => {
    logoutOfficer();
    onOfficerUpdated({ ...officer, isLoggedIn: false });
    setIsEditing(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.35, bounce: 0.18 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Inspector Authentication' : 'Inspector Profile & Vault'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? 'Sign in via Google, Mobile OTP, or Service Badge' : 'Active verified credentials & persistent work audits'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close officer modal"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-5">
            {/* Auth Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMethod('google'); setPhoneError(''); }}
                className={`py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'google' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <GoogleLogoSvg className="w-3.5 h-3.5" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setPhoneError(''); }}
                className={`py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'phone' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Phone OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('badge'); setPhoneError(''); }}
                className={`py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'badge' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <span>Badge ID</span>
              </button>
            </div>

            {/* TAB 1: GOOGLE SIGN-IN */}
            {authMethod === 'google' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <GoogleLogoSvg className="w-4 h-4" /> Google Identity Services
                  </p>
                  
                  {!isCustomGoogle ? (
                    <div 
                      onClick={handleGoogleSignIn}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-primary/50 hover:shadow-sm transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-cyan-400 text-white font-black text-xs flex items-center justify-center">
                          SL
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition">
                            Shivam Lohar
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">shivam.lohar@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Default
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                          Google Account Name
                        </label>
                        <input
                          type="text"
                          value={googleName}
                          onChange={e => setGoogleName(e.target.value)}
                          placeholder="e.g. Shivam Lohar"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                          Google Email Address
                        </label>
                        <input
                          type="email"
                          value={googleEmail}
                          onChange={e => setGoogleEmail(e.target.value)}
                          placeholder="e.g. shivam.lohar@gmail.com"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCustomGoogle(!isCustomGoogle)}
                      className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      {isCustomGoogle ? '← Use default account' : 'Sign in with another Google account'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 font-bold text-xs shadow-sm transition flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <GoogleLogoSvg className="w-4 h-4" />
                  <span>Continue with Google Account</span>
                </button>
              </div>
            )}

            {/* TAB 2: PHONE OTP LOGIN */}
            {authMethod === 'phone' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                        Mobile / Contact Number
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-primary overflow-hidden">
                        <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold text-xs border-r border-slate-200 dark:border-slate-700 select-none">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          maxLength={12}
                          className="w-full px-3.5 py-2.5 bg-transparent text-slate-800 dark:text-slate-100 text-sm font-semibold outline-none font-mono"
                        />
                      </div>
                      {phoneError && (
                        <p className="text-xs text-rose-500 font-bold mt-1.5">{phoneError}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        We will send a 4-digit verification code to this number.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Send 4-Digit Verification OTP</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500 text-white shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          OTP Sent to +91 {phone}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                          Simulated SMS: Your OTP code is <strong>{generatedOtp}</strong>
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                        Enter 4-Digit Code
                      </label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        placeholder="4092"
                        maxLength={4}
                        className="w-full text-center tracking-[1em] text-lg font-black px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 font-mono"
                      />
                      {phoneError && (
                        <p className="text-xs text-rose-500 font-bold mt-1.5">{phoneError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Verify OTP & Unlock Vault</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setPhoneError(''); }}
                        className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Change Phone Number
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: SERVICE BADGE LOGIN */}
            {authMethod === 'badge' && (
              <form onSubmit={handleBadgeLogin} className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Officer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Er. Shivam Lohar"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Service Badge / ID #
                  </label>
                  <input
                    type="text"
                    required
                    value={badgeId}
                    onChange={e => setBadgeId(e.target.value)}
                    placeholder="e.g. OFF-409"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Assigned Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Civil & Structural Infrastructure">Civil & Structural Infrastructure</option>
                    <option value="Electrical Substation & Power Grid">Electrical Substation & Power Grid</option>
                    <option value="Mechanical & Turbomachinery">Mechanical & Turbomachinery</option>
                    <option value="Telecom & Tower Facilities">Telecom & Tower Facilities</option>
                    <option value="Oil, Gas & Energy Pipelines">Oil, Gas & Energy Pipelines</option>
                  </select>
                </div>

                <div className="pt-1 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-primary/25 transition cursor-pointer"
                  >
                    Sign In with Badge ID
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickLogin409}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    ⚡ Quick Sign In as Lead Officer #409
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Logged in Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                {officer.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight truncate">
                    {officer.name}
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                  {officer.authProvider === 'google' 
                    ? `🔵 Google • ${officer.email}` 
                    : officer.authProvider === 'phone' 
                    ? `🟢 Phone • ${officer.phone}` 
                    : `🟣 Badge • ${officer.id}`}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{officer.department}</p>
              </div>
            </div>

            {/* Persistent Work Vault Summary */}
            <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Personal Work Vault</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Inspections & audits automatically preserved</p>
                </div>
                <span className="text-sm font-black text-primary px-3 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-xs">
                  {savedInspections.length} Saved
                </span>
              </div>

              {/* Recent Saved Audits List */}
              {savedInspections.length > 0 && (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {savedInspections.slice(0, 4).map(audit => (
                    <Link
                      key={audit.id}
                      to="/report"
                      onClick={onClose}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-primary/50 transition block"
                    >
                      <div className="truncate mr-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{audit.assetName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{audit.formattedDate}</p>
                      </div>
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                        audit.healthScore >= 80 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : audit.healthScore >= 60 
                          ? 'bg-amber-500/10 text-amber-600' 
                          : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {audit.healthScore}/100
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Switch Account / Login
              </button>
              <button
                onClick={handleLogout}
                className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TopNav({ 
  onOpenAlerts, 
  onOpenSettings,
  currentTheme,
  onToggleTheme,
  officer,
  onOpenOfficerModal
}: { 
  onOpenAlerts: () => void; 
  onOpenSettings: () => void; 
  currentTheme: ThemeMode; 
  onToggleTheme: () => void;
  officer: OfficerProfile;
  onOpenOfficerModal: () => void;
}) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="glass-nav border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 py-3.5 sticky top-0 z-20 shadow-xs transition-colors">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-800 text-lg tracking-tight">AI Inspection</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">Assistance</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Inspect Smarter. Detect Earlier. Maintain Better.</p>
          </div>
        </Link>
      </div>
      
      {/* Center Command Search Bar (Desktop) */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-400 text-xs w-64 lg:w-80 focus-within:w-96 focus-within:border-primary/50 transition-all">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Search assets, telemetry, reports..." 
          aria-label="Search assets, telemetry, and reports"
          className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 w-full"
        />
        <kbd className="text-[10px] font-mono bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-400 shadow-xs shrink-0">Ctrl+K</kbd>
      </div>

      {/* Top Nav Right Action Cluster */}
      <div className="hidden md:flex items-center gap-3">
        {/* Live AI Engine Telemetry & Connectivity Badge */}
        <div className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
          !isOnline 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
            : getGeminiApiKey() 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400'
        }`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              !isOnline ? 'bg-amber-400' : getGeminiApiKey() ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              !isOnline ? 'bg-amber-500' : getGeminiApiKey() ? 'bg-emerald-500' : 'bg-cyan-500'
            }`}></span>
          </span>
          <span>
            {!isOnline 
              ? 'Vault Offline Safe' 
              : getGeminiApiKey() 
              ? 'Gemini 1.5 Flash Vision' 
              : 'Precision Metrology'}
          </span>
          <span className={`text-[10px] opacity-75 font-mono px-1.5 py-0.5 rounded ${
            !isOnline 
              ? 'bg-amber-500/15' 
              : getGeminiApiKey() 
              ? 'bg-emerald-500/15' 
              : 'bg-cyan-500/15'
          }`}>
            {!isOnline ? 'Air-Gapped' : '42ms'}
          </span>
        </div>

        {/* 1-Click Dark/Light Theme Quick Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <button 
          onClick={onOpenAlerts}
          aria-label="View system alerts and notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="View Alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-critical rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        <button 
          onClick={onOpenSettings}
          aria-label="Open application settings"
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Officer Profile Pill or Login Button */}
        {officer.isLoggedIn ? (
          <button
            onClick={onOpenOfficerModal}
            aria-label={`Officer profile for ${officer.name}`}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition cursor-pointer text-left group"
            title="Officer Profile & Work Vault"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-cyan-400 text-white font-bold flex items-center justify-center text-xs shadow-sm group-hover:scale-105 transition-transform">
              {officer.avatarInitials}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight flex items-center gap-1">
                {officer.name}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">{officer.id}</p>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenOfficerModal}
            aria-label="Officer sign in"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-primary/25 transition cursor-pointer ml-1"
            title="Sign In Officer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Officer Login</span>
          </button>
        )}
      </div>

      {/* Mobile Top Actions */}
      <div className="md:hidden flex items-center gap-1.5">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme appearance"
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Toggle Theme"
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <button 
          onClick={onOpenAlerts}
          aria-label="View system alerts"
          className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full"></span>
        </button>

        {/* Mobile Officer Button */}
        <button
          onClick={onOpenOfficerModal}
          className="p-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Officer Account"
        >
          {officer.isLoggedIn ? (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-cyan-400 text-white font-bold flex items-center justify-center text-[10px]">
              {officer.avatarInitials}
            </div>
          ) : (
            <div className="p-1 rounded-lg bg-primary/10 text-primary">
              <LogIn className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
}

function Sidebar({ 
  onOpenAlerts, 
  onOpenSettings,
  currentTheme,
  onToggleTheme,
  officer,
  onOpenOfficerModal
}: { 
  onOpenAlerts: () => void; 
  onOpenSettings: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
  officer: OfficerProfile;
  onOpenOfficerModal: () => void;
}) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/system-check', icon: Activity, label: 'System Check' },
    { path: '/assets', icon: Building2, label: 'Assets' },
    { path: '/history', icon: History, label: 'Asset History' },
    { path: '/inspect', icon: Camera, label: 'Inspections' },
    { path: '/report', icon: FileText, label: 'Reports' },
  ];

  return (
    <aside className="w-64 glass-nav border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col fixed left-0 top-[69px] bottom-0 hidden md:flex z-10 transition-colors">
      <nav className="flex-1 p-4 space-y-1.5 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 ease-out font-semibold text-sm ${
                isActive 
                  ? 'bg-primary/15 text-primary shadow-xs font-bold border border-primary/25 translate-x-1' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_1px_rgba(14,165,233,0.8)] animate-pulse" />
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100 space-y-1.5">
          {/* Theme Mode Toggle in Sidebar */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-semibold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              {currentTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-500" />
              )}
              <span>{currentTheme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
              {currentTheme}
            </span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-semibold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
            </div>
            <span className="bg-critical text-white text-[11px] font-bold px-2 py-0.5 rounded-full">3</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-semibold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Officer Profile Badge in Sidebar */}
      <button 
        onClick={onOpenOfficerModal}
        className="p-3.5 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
        title="Officer Profile & Work Vault"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
          {officer.isLoggedIn ? officer.avatarInitials : <User className="w-4 h-4" />}
        </div>
        <div className="text-xs flex-1 truncate">
          <p className="font-bold text-slate-800 dark:text-white truncate">
            {officer.isLoggedIn ? officer.name : 'Officer Login'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono truncate">
            {officer.isLoggedIn ? `${officer.id} • ${officer.role}` : 'Click to sign in'}
          </p>
        </div>
      </button>
    </aside>
  );
}

function MobileNav() {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/system-check', icon: Activity, label: 'Diagnostics' },
    { path: '/inspect', icon: Camera, label: 'Inspect' },
    { path: '/assets', icon: Building2, label: 'Assets' },
    { path: '/report', icon: FileText, label: 'Reports' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-200/60 dark:border-slate-800/60 flex justify-around p-2 z-30 shadow-lg transition-colors">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'text-primary font-bold scale-105' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

const getBasename = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/Ai-inspect-assistant')) {
    return '/Ai-inspect-assistant';
  }
  return '';
};

function HashCleaner() {
  const location = useLocation();

  useEffect(() => {
    // Strip legacy /#/ or /# from URL to maintain clean HTML5 routes
    if (window.location.hash && (window.location.hash === '#/' || window.location.hash === '#')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else if (window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.replace(/^#\/?/, '/');
      const basename = window.location.pathname.startsWith('/Ai-inspect-assistant') ? '/Ai-inspect-assistant' : '';
      const fullPath = (basename + cleanPath).replace(/\/+/g, '/');
      window.history.replaceState(null, '', fullPath + window.location.search);
    }
  }, [location]);

  return null;
}

function AppShell({
  isAlertsOpen,
  setIsAlertsOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  currentTheme,
  handleToggleTheme,
  handleSetTheme,
  isOfficerModalOpen,
  setIsOfficerModalOpen,
  officer,
  setOfficer
}: {
  isAlertsOpen: boolean;
  setIsAlertsOpen: (v: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  currentTheme: ThemeMode;
  handleToggleTheme: () => void;
  handleSetTheme: (t: ThemeMode) => void;
  isOfficerModalOpen: boolean;
  setIsOfficerModalOpen: (v: boolean) => void;
  officer: OfficerProfile;
  setOfficer: (p: OfficerProfile) => void;
}) {
  const location = useLocation();

  return (
    <div className="relative flex flex-col min-h-screen bg-background/80 text-slate-800 transition-colors duration-300">
      {/* Continuous Fluid Animated Industrial Cyber-Grid Background */}
      <AnimatedBackground />

      <TopNav 
        onOpenAlerts={() => setIsAlertsOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        officer={officer}
        onOpenOfficerModal={() => setIsOfficerModalOpen(true)}
      />
      <div className="flex flex-1">
        <Sidebar 
          onOpenAlerts={() => setIsAlertsOpen(true)} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          currentTheme={currentTheme}
          onToggleTheme={handleToggleTheme}
          officer={officer}
          onOpenOfficerModal={() => setIsOfficerModalOpen(true)}
        />
        <main className="flex-1 md:ml-64 pb-24 md:pb-12 w-full">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/system-check" element={<PageTransition><SystemCheck /></PageTransition>} />
                <Route path="/assets" element={<PageTransition><Assets /></PageTransition>} />
                <Route path="/history" element={<PageTransition><AssetHistory /></PageTransition>} />
                <Route path="/inspect" element={<PageTransition><NewInspection /></PageTransition>} />
                <Route path="/analysis" element={<PageTransition><AiAnalysis /></PageTransition>} />
                <Route path="/result" element={<PageTransition><InspectionResult /></PageTransition>} />
                <Route path="/report" element={<PageTransition><Report /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
      <MobileNav />

      <OfficerModal
        isOpen={isOfficerModalOpen}
        onClose={() => setIsOfficerModalOpen(false)}
        officer={officer}
        onOfficerUpdated={setOfficer}
      />
      <AlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentTheme={currentTheme}
        onSetTheme={handleSetTheme}
      />
    </div>
  );
}

function App() {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleToggleTheme = () => {
    const next: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    applyTheme(next);
  };

  const handleSetTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [officer, setOfficer] = useState<OfficerProfile>(() => getActiveOfficer());

  useEffect(() => {
    const handleOfficerChange = (e: any) => {
      setOfficer(e.detail || getActiveOfficer());
    };
    window.addEventListener('officer_state_changed', handleOfficerChange);
    return () => window.removeEventListener('officer_state_changed', handleOfficerChange);
  }, []);

  return (
    <ErrorBoundary>
      <Router basename={getBasename()}>
        <HashCleaner />
        <AppShell
          isAlertsOpen={isAlertsOpen}
          setIsAlertsOpen={setIsAlertsOpen}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          currentTheme={currentTheme}
          handleToggleTheme={handleToggleTheme}
          handleSetTheme={handleSetTheme}
          isOfficerModalOpen={isOfficerModalOpen}
          setIsOfficerModalOpen={setIsOfficerModalOpen}
          officer={officer}
          setOfficer={setOfficer}
        />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
