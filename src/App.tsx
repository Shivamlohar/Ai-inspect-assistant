import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Camera, FileText, Bell, Settings, ShieldCheck, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import AiAnalysis from './pages/AiAnalysis';
import InspectionResult from './pages/InspectionResult';
import Report from './pages/Report';
import Assets from './pages/Assets';

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

function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Inspection Settings</h3>
              <p className="text-xs text-slate-500">Preferences and AI sensitivity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div>
              <p className="font-semibold text-slate-800 text-sm">High-Precision AI Vision</p>
              <p className="text-xs text-slate-500">Detect sub-millimeter structural fissures</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Audio Voice Transcribe</p>
              <p className="text-xs text-slate-500">Auto-convert spoken notes into report items</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Offline Field Mode</p>
              <p className="text-xs text-slate-500">Cache inspections locally until reconnected</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition shadow-md shadow-primary/20"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function TopNav({ onOpenAlerts, onOpenSettings }: { onOpenAlerts: () => void; onOpenSettings: () => void }) {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/assets', label: 'Assets' },
    { path: '/inspect', label: 'Inspections' },
    { path: '/report', label: 'Reports' },
  ];

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
      
      {/* Desktop Top Nav Links */}
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`font-semibold text-sm transition-colors ${
              location.pathname === item.path 
                ? 'text-primary' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </Link>
        ))}

        <button 
          onClick={onOpenAlerts}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition"
          title="View Alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-critical rounded-full ring-2 ring-white"></span>
        </button>

        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">
            FI
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Field Inspector</p>
            <p className="text-[10px] text-slate-400">Officer #409</p>
          </div>
        </div>
      </nav>

      {/* Mobile Top Actions */}
      <div className="md:hidden flex items-center gap-2">
        <button 
          onClick={onOpenAlerts}
          className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full"></span>
        </button>
      </div>
    </header>
  );
}

function Sidebar({ onOpenAlerts, onOpenSettings }: { onOpenAlerts: () => void; onOpenSettings: () => void }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
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
    { path: '/assets', icon: Building2, label: 'Assets' },
    { path: '/inspect', icon: Camera, label: 'Inspect' },
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

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background">
        <TopNav 
          onOpenAlerts={() => setIsAlertsOpen(true)} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />
        <div className="flex flex-1">
          <Sidebar 
            onOpenAlerts={() => setIsAlertsOpen(true)} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
          <main className="flex-1 md:ml-64 pb-24 md:pb-12 w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/inspect" element={<NewInspection />} />
              <Route path="/analysis" element={<AiAnalysis />} />
              <Route path="/result" element={<InspectionResult />} />
              <Route path="/report" element={<Report />} />
            </Routes>
          </main>
        </div>
        <MobileNav />

        <AlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </Router>
  );
}

export default App;
