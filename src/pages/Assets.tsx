import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, Camera } from 'lucide-react';

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const assets = [
    {
      id: 'BRIDGE-102',
      name: 'Bridge #102',
      type: 'Bridge',
      location: 'Sector 5',
      health: '64/100',
      status: 'At Risk',
      date: '10 Sep 2026',
      badge: 'badge-risk',
      image: 'https://images.unsplash.com/photo-1545464197-09d3b8417c82?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'TRANS-204',
      name: 'Transformer T-204',
      type: 'Transformer',
      location: 'Substation North',
      health: '82/100',
      status: 'Attention',
      date: '10 Sep 2026',
      badge: 'badge-attention',
      image: 'https://images.unsplash.com/photo-1613398774005-728b49911e3b?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'PIPE-201',
      name: 'Pipeline P-201',
      type: 'Pipeline',
      location: 'Sector 2',
      health: '71/100',
      status: 'Attention',
      date: '09 Sep 2026',
      badge: 'badge-attention',
      image: 'https://images.unsplash.com/photo-1579730537021-39655f4625b3?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'TOWER-44',
      name: 'Cell Tower #44',
      type: 'Tower',
      location: 'Ridge Peak',
      health: '95/100',
      status: 'Healthy',
      date: '01 Sep 2026',
      badge: 'badge-healthy',
      image: 'https://images.unsplash.com/photo-1581092334812-78d10b7b13df?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'DAM-01',
      name: 'Main Dam',
      type: 'Dam',
      location: 'River Valley',
      health: '12/100',
      status: 'Critical',
      date: '10 Sep 2026',
      badge: 'badge-critical',
      image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || asset.type.toUpperCase() === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Registered Assets</h2>
          <p className="text-slate-500 font-medium text-base mt-0.5">
            Monitor and inspect critical infrastructure inventory
          </p>
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search bridge, pipeline, sector..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="ALL">All Asset Types</option>
            <option value="BRIDGE">Bridges</option>
            <option value="TRANSFORMER">Transformers</option>
            <option value="PIPELINE">Pipelines</option>
            <option value="TOWER">Towers</option>
            <option value="DAM">Dams</option>
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="card bg-white flex flex-col hover:shadow-lg transition-all group">
            <div className="h-48 bg-slate-800 relative overflow-hidden">
              <img 
                src={asset.image} 
                alt={asset.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-black text-slate-800 shadow-sm uppercase tracking-wider">
                {asset.type}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-3">
                <h3 className="font-extrabold text-lg text-slate-800 leading-snug">{asset.name}</h3>
                <p className="text-slate-400 text-xs font-semibold flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" /> {asset.location}
                </p>
              </div>
              
              <div className="mt-auto space-y-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Health Score</p>
                    <p className="font-black text-2xl text-slate-800">{asset.health}</p>
                  </div>
                  <span className={asset.badge}>
                    {asset.status === 'At Risk' && <span className="w-2 h-2 rounded-full bg-risk"></span>}
                    {asset.status === 'Attention' && <span className="w-2 h-2 rounded-full bg-attention-dark"></span>}
                    {asset.status === 'Healthy' && <span className="w-2 h-2 rounded-full bg-healthy"></span>}
                    {asset.status === 'Critical' && <span className="w-2 h-2 rounded-full bg-critical"></span>}
                    {asset.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Last inspected:</span>
                  <span className="font-bold text-slate-700">{asset.date}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link 
                    to="/result" 
                    className="btn-secondary py-2 px-3 text-xs font-bold text-center justify-center"
                  >
                    View Details
                  </Link>
                  <Link 
                    to="/inspect" 
                    className="btn-primary py-2 px-3 text-xs font-bold text-center justify-center"
                  >
                    <Camera className="w-3.5 h-3.5" /> Inspect
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
