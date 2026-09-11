import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Camera, 
  FileText, 
  Bell, 
  Settings, 
  ShieldCheck, 
  X, 
  Eye, 
  EyeOff, 
  Key, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Laptop,
  Activity,
  Search
} from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, clearGeminiApiKey, testGeminiApiKey } from './services/aiApi';
import type { ThemeMode } from './utils/theme';
import { getStoredTheme, applyTheme } from './utils/theme';
import { ErrorBoundary } from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewInspection = lazy(() => import('./pages/NewInspection'));
const AiAnalysis = lazy(() => import('./pages/AiAnalysis'));
const InspectionResult = lazy(() => import('./pages/InspectionResult'));
const Report = lazy(() => import('./pages/Report'));
const Assets = lazy(() => import('./pages/Assets'));
const SystemCheck = lazy(() => import('./pages/SystemCheck'));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
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
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition">
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
      </div>
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
  const [apiKey, setApiKey] = useState<string>(() => getGeminiApiKey());
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      clearGeminiApiKey();
      setTestResult({ success: true, message: 'API Key removed. Using built-in precision metrology engine.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiKey(apiKey.trim());
      setTestResult(res);
      if (res.success) {
        setGeminiApiKey(apiKey.trim());
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Verification failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveKey = () => {
    clearGeminiApiKey();
    setApiKey('');
    setTestResult({ success: true, message: 'Reverted to built-in offline precision engine.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Inspection & AI Settings</h3>
              <p className="text-xs text-slate-500">Configure real-time Gemini Vision API & preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini Vision API Key Configuration Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-ai/5 to-primary/5 border border-ai/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Key className="w-4 h-4 text-ai" />
              <span>Google Gemini API Key</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
              apiKey.trim() ? 'bg-healthy/10 text-healthy border border-healthy/20' : 'bg-slate-100 text-slate-500'
            }`}>
              {apiKey.trim() ? '⚡ Live Vision Active' : '⚙ Built-in Engine'}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Enter your free Gemini API key to enable live multimodal vision diagnostics with sub-millimeter defect detection and accurate answers.
          </p>

          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="Paste AIzaSy... API key here"
              className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl py-2.5 pl-3 pr-20 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Test feedback */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testResult.success ? 'bg-healthy/10 text-healthy border border-healthy/20' : 'bg-critical/10 text-critical border border-critical/20'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 gap-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              Get Free Key from Google AI Studio ↗
            </a>

            <div className="flex items-center gap-2">
              {apiKey.trim() && (
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="text-xs font-bold text-slate-500 hover:text-critical transition px-2 py-1 cursor-pointer"
                >
                  Clear Key
                </button>
              )}
              <button
                type="button"
                onClick={handleTestAndSave}
                disabled={isTesting}
                className="btn-primary py-2 px-3 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" /> Test & Save Key
                  </>
                )}
              </button>
            </div>
          </div>
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
      </div>
    </div>
  );
}

function TopNav({ 
  onOpenAlerts, 
  onOpenSettings,
  currentTheme,
  onToggleTheme
}: { 
  onOpenAlerts: () => void; 
  onOpenSettings: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
}) {
  return (
    <header className="bg-surface border-b border-slate-100 flex items-center justify-between px-6 py-4 sticky top-0 z-20 shadow-xs">
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
          className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 w-full"
        />
        <kbd className="text-[10px] font-mono bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-400 shadow-xs shrink-0">Ctrl+K</kbd>
      </div>

      {/* Top Nav Right Action Cluster */}
      <div className="hidden md:flex items-center gap-3">
        {/* Live AI Engine Telemetry Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{getGeminiApiKey() ? 'Gemini Vision Active' : 'Precision Metrology'}</span>
          <span className="text-[10px] opacity-75 font-mono bg-emerald-500/15 px-1.5 py-0.5 rounded">42ms</span>
        </div>

        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            getGeminiApiKey() 
              ? 'bg-ai/10 text-ai border border-ai/25 hover:bg-ai/15' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Configure Gemini API Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{getGeminiApiKey() ? 'Gemini 1.5' : 'Connect Key'}</span>
        </button>

        {/* 1-Click Dark/Light Theme Quick Toggle */}
        <button
          onClick={onToggleTheme}
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
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="View Alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-critical rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-cyan-400 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            FI
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Field Inspector</p>
            <p className="text-[10px] text-slate-400">Officer #409</p>
          </div>
        </div>
      </div>

      {/* Mobile Top Actions */}
      <div className="md:hidden flex items-center gap-1.5">
        <button
          onClick={onToggleTheme}
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
          className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full"></span>
        </button>
      </div>
    </header>
  );
}

function Sidebar({ 
  onOpenAlerts, 
  onOpenSettings,
  currentTheme,
  onToggleTheme
}: { 
  onOpenAlerts: () => void; 
  onOpenSettings: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
}) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/system-check', icon: Activity, label: 'System Check' },
    { path: '/assets', icon: Building2, label: 'Assets' },
    { path: '/inspect', icon: Camera, label: 'Inspections' },
    { path: '/report', icon: FileText, label: 'Reports' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-slate-100 flex flex-col fixed left-0 top-[73px] bottom-0 hidden md:flex z-10">
      <nav className="flex-1 p-4 space-y-1.5 mt-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-semibold text-sm ${
                isActive 
                  ? 'bg-primary/10 text-primary shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
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

      {/* Field Inspector Badge */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
          FI
        </div>
        <div className="text-xs">
          <p className="font-bold text-slate-800">Gov. Inspector</p>
          <p className="text-slate-400">Sector 5 Region</p>
        </div>
      </div>
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-slate-200 flex justify-around p-2 z-30 shadow-lg">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-colors ${isActive ? 'text-primary font-bold' : 'text-slate-500'}`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">{item.label}</span>
          </Link>
        );
      })}
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

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-background text-slate-800">
          <TopNav 
            onOpenAlerts={() => setIsAlertsOpen(true)} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
            currentTheme={currentTheme}
            onToggleTheme={handleToggleTheme}
          />
          <div className="flex flex-1">
            <Sidebar 
              onOpenAlerts={() => setIsAlertsOpen(true)} 
              onOpenSettings={() => setIsSettingsOpen(true)} 
              currentTheme={currentTheme}
              onToggleTheme={handleToggleTheme}
            />
            <main className="flex-1 md:ml-64 pb-24 md:pb-12 w-full">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/system-check" element={<SystemCheck />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/inspect" element={<NewInspection />} />
                  <Route path="/analysis" element={<AiAnalysis />} />
                  <Route path="/result" element={<InspectionResult />} />
                  <Route path="/report" element={<Report />} />
                </Routes>
              </Suspense>
            </main>
          </div>
          <MobileNav />

          <AlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            currentTheme={currentTheme}
            onSetTheme={handleSetTheme}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
