import { Link } from 'react-router-dom';
import { Plus, Building2, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const healthData = [
    { name: 'Healthy', value: 186, color: '#22c55e', pct: '75%' },
    { name: 'Attention', value: 34, color: '#eab308', pct: '14%' },
    { name: 'At Risk', value: 16, color: '#f97316', pct: '6%' },
    { name: 'Critical', value: 12, color: '#ef4444', pct: '5%' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome Section */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Good Morning 👋</h2>
          </div>
          <p className="text-slate-500 text-base md:text-lg">
            Monitor the health of your infrastructure with AI-powered inspections.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link 
            to="/inspect" 
            className="btn-primary w-full sm:w-auto text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" /> Start New Inspection
          </Link>
          <Link 
            to="/assets" 
            className="btn-secondary w-full sm:w-auto text-base font-semibold"
          >
            View Assets
          </Link>
        </div>
      </section>

      {/* 4 Summary Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { 
            title: 'Total Assets', 
            count: '248', 
            sub: 'Monitored across 5 sectors', 
            icon: Building2, 
            color: 'text-primary', 
            bg: 'bg-primary/10',
            status: 'All Registered',
            statusColor: 'text-slate-500 bg-slate-100'
          },
          { 
            title: 'Inspected', 
            count: '186', 
            sub: 'Verified within last 30 days', 
            icon: CheckCircle2, 
            color: 'text-healthy', 
            bg: 'bg-healthy/10',
            status: '75% Complete',
            statusColor: 'text-healthy bg-healthy/10'
          },
          { 
            title: 'Need Attention', 
            count: '34', 
            sub: 'Minor defects identified', 
            icon: AlertTriangle, 
            color: 'text-attention-dark', 
            bg: 'bg-attention/10',
            status: 'Action Scheduled',
            statusColor: 'text-attention-dark bg-attention/10'
          },
          { 
            title: 'Critical', 
            count: '12', 
            sub: 'Immediate action required', 
            icon: AlertOctagon, 
            color: 'text-critical', 
            bg: 'bg-critical/10',
            status: 'High Alert',
            statusColor: 'text-critical bg-critical/10'
          },
        ].map((card, i) => (
          <div key={i} className="card p-5 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${card.statusColor}`}>
                {card.status}
              </span>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-1">{card.count}</h3>
              <p className="text-slate-700 font-bold text-sm">{card.title}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">{card.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Asset Health Chart & Recent Inspections Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Overall Asset Health */}
        <section className="card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Overall Asset Health</h3>
            <p className="text-xs text-slate-400 font-medium">Real-time condition breakdown</p>
          </div>

          <div className="min-h-[220px] relative my-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-3xl font-black text-slate-800">248</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Assets</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
            {healthData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-700 font-semibold text-xs">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Inspections */}
        <section className="card lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Recent Inspections</h3>
              <p className="text-xs text-slate-400 font-medium">Completed visual & sensor AI checks</p>
            </div>
            <Link to="/assets" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm">
              View Assets <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 pl-6">Asset</th>
                  <th className="p-4 hidden sm:table-cell">Type</th>
                  <th className="p-4">Health</th>
                  <th className="p-4 hidden md:table-cell">Last Inspection</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {[
                  { name: 'Bridge #102', type: 'Bridge', health: '64/100', date: '10 Sep 2026', status: 'At Risk', badge: 'badge-risk' },
                  { name: 'Transformer T-204', type: 'Transformer', health: '82/100', date: '10 Sep 2026', status: 'Attention', badge: 'badge-attention' },
                  { name: 'Pipeline P-201', type: 'Pipeline', health: '71/100', date: '09 Sep 2026', status: 'Attention', badge: 'badge-attention' },
                  { name: 'Cell Tower #44', type: 'Tower', health: '95/100', date: '01 Sep 2026', status: 'Healthy', badge: 'badge-healthy' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800">{row.name}</td>
                    <td className="p-4 text-slate-500 hidden sm:table-cell">{row.type}</td>
                    <td className="p-4 font-bold text-slate-700">{row.health}</td>
                    <td className="p-4 text-slate-400 text-xs hidden md:table-cell">{row.date}</td>
                    <td className="p-4">
                      <span className={row.badge}>
                        {row.status === 'At Risk' && <span className="w-2 h-2 rounded-full bg-risk"></span>}
                        {row.status === 'Attention' && <span className="w-2 h-2 rounded-full bg-attention-dark"></span>}
                        {row.status === 'Healthy' && <span className="w-2 h-2 rounded-full bg-healthy"></span>}
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        to="/result" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Critical Alerts Section */}
      <section className="card border-critical/30 bg-critical/5 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-critical/15 p-3 rounded-2xl text-critical shrink-0">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-critical text-white text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  ⚠ Critical Attention
                </span>
                <span className="text-xs text-slate-400 font-medium">Detected 2 hrs ago</span>
              </div>
              <h4 className="text-xl font-extrabold text-slate-800 mb-1">Bridge #102</h4>
              <p className="text-slate-700 font-semibold mb-1">High severity crack detected on primary support beam</p>
              <p className="text-slate-500 text-sm">Maintenance recommended within 30 days to prevent structural compromise.</p>
            </div>
          </div>
          <Link 
            to="/result" 
            className="btn-primary bg-critical hover:bg-red-600 shadow-critical/20 whitespace-nowrap w-full sm:w-auto"
          >
            View Inspection
          </Link>
        </div>
      </section>

      {/* Large Bottom Action Banner */}
      <section className="pt-4 flex justify-center">
        <Link 
          to="/inspect" 
          className="bg-primary hover:bg-primary/90 text-white font-extrabold text-lg py-5 px-10 rounded-2xl shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 flex items-center gap-3 w-full max-w-2xl justify-center tracking-wide"
        >
          <Plus className="w-6 h-6 stroke-[3]" /> START NEW INSPECTION
        </Link>
      </section>

    </div>
  );
}
