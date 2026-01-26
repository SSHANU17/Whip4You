
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Car, FileText, Settings, LogOut, 
  Plus, Trash2, Edit3, CheckCircle, Clock, X, 
  Phone, Mail, User, MessageSquare, AlertTriangle,
  TrendingUp, BarChart3, Eye, EyeOff, Star, ShieldCheck,
  Percent, DollarSign, Type, ClipboardEdit, Save, Loader2
} from 'lucide-react';
import { api } from '../api';
import { Vehicle } from '../types';

interface Lead {
  _id: string;
  type: 'Finance' | 'Trade-In' | 'General' | 'Car Finder';
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: 'open' | 'inProgress' | 'done';
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  remarks?: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'leads' | 'reviews' | 'config'>('overview');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('w4y_admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // CRM State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadRemarks, setLeadRemarks] = useState('');
  const [leadStatus, setLeadStatus] = useState<Lead['status']>('open');

  // Site Configuration State
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      Promise.all([
        api.getVehicles(),
        api.getLeads(),
        api.getAdminReviews(),
        api.getConfig()
      ]).then(([v, l, r, c]) => {
        setVehicles(v);
        setLeads(l);
        setReviews(r);
        setSiteConfig(c);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoggedIn(false);
        localStorage.removeItem('w4y_admin_token');
      });
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.login({ email, password });
      if (data.token) {
        localStorage.setItem('w4y_admin_token', data.token);
        setIsLoggedIn(true);
      } else {
        alert("Authentication failed.");
      }
    } catch (err) {
      alert("Invalid credentials.");
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    const updated = await api.updateLead(selectedLead._id, { status: leadStatus, remarks: leadRemarks });
    setLeads(prev => prev.map(l => l._id === selectedLead._id ? updated : l));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSelectedLead(null);
    }, 800);
  };

  const handleUpdateConfig = async () => {
    const updated = await api.updateConfig(siteConfig);
    setSiteConfig(updated);
    alert("Configuration Deployed Successfully.");
  };

  const handleReviewToggle = async (review: any) => {
    const updated = await api.updateReview(review._id, { visible: !review.visible });
    setReviews(prev => prev.map(r => r._id === review._id ? updated : r));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <form onSubmit={handleLogin} className="bg-white p-12 rounded-[40px] shadow-2xl w-full max-w-md border border-white/10">
          <div className="gold-gradient w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} className="text-black" />
          </div>
          <h2 className="text-2xl font-bold mb-10 brand-font italic text-center uppercase">Secure Gateway</h2>
          <input required type="email" placeholder="EMAIL" className="w-full bg-zinc-50 p-5 rounded-2xl mb-4 outline-none border-b border-zinc-200" value={email} onChange={e => setEmail(e.target.value)} />
          <input required type="password" placeholder="PASSWORD" className="w-full bg-zinc-50 p-5 rounded-2xl mb-8 outline-none border-b border-zinc-200" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px]">Authorize Entry</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex">
      <aside className="w-80 bg-black text-white flex flex-col fixed h-full z-40 border-r border-white/5">
        <div className="p-12 text-2xl font-bold brand-font italic">W4Y <span className="text-[#D4AF37]">SYSTEMS</span></div>
        <nav className="flex-1 px-8 space-y-4">
          {['overview', 'inventory', 'leads', 'reviews', 'config'].map(id => (
            <button key={id} onClick={() => setActiveTab(id as any)} className={`w-full flex items-center gap-6 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] ${activeTab === id ? 'bg-[#D4AF37] text-black' : 'text-zinc-500 hover:bg-white/5'}`}>
              {id === 'overview' && <TrendingUp size={18} />}
              {id === 'inventory' && <Car size={18} />}
              {id === 'leads' && <FileText size={18} />}
              {id === 'reviews' && <Star size={18} />}
              {id === 'config' && <Settings size={18} />}
              {id.toUpperCase()}
            </button>
          ))}
        </nav>
        <div className="p-12"><button onClick={() => { localStorage.removeItem('w4y_admin_token'); setIsLoggedIn(false); }} className="text-red-500 font-bold uppercase tracking-widest text-[9px]">Log Out</button></div>
      </aside>

      <main className="flex-1 ml-80 p-16">
        {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={48} /></div> : (
          <>
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-4xl font-bold mb-16 brand-font italic text-black">Operations Analytics</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="bg-white p-10 rounded-3xl shadow-sm border-l-4 border-[#D4AF37]"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Units</p><h3 className="text-4xl font-bold">{vehicles.length}</h3></div>
                  <div className="bg-white p-10 rounded-3xl shadow-sm border-l-4 border-green-500"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Leads</p><h3 className="text-4xl font-bold">{leads.filter(l => l.status !== 'done').length}</h3></div>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold mb-16 brand-font italic">Lead Hub</h1>
                {leads.map(lead => (
                  <div key={lead._id} className="bg-white p-10 rounded-[40px] shadow-sm flex items-center justify-between border border-zinc-100">
                    <div className="flex items-center gap-10">
                      <div className="bg-zinc-950 p-4 rounded-xl text-[#D4AF37]"><User size={24} /></div>
                      <div><h4 className="font-bold text-lg text-black">{lead.name}</h4><p className="text-[9px] font-black uppercase text-zinc-400">{lead.type} • {lead.priority}</p></div>
                    </div>
                    <button onClick={() => { setSelectedLead(lead); setLeadRemarks(lead.remarks || ''); setLeadStatus(lead.status); }} className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Process</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="max-w-4xl space-y-10">
                <h1 className="text-4xl font-bold mb-16 brand-font italic">Site Config</h1>
                <div className="bg-white p-12 rounded-[40px] shadow-sm space-y-8">
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-400">HERO HEADLINE</label><input className="w-full bg-zinc-50 p-5 rounded-2xl font-bold" value={siteConfig?.heroHeadline} onChange={e => setSiteConfig({...siteConfig, heroHeadline: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-400">PROMO RATE (%)</label><input className="w-full bg-zinc-50 p-5 rounded-2xl font-bold" value={siteConfig?.promoRate} onChange={e => setSiteConfig({...siteConfig, promoRate: e.target.value})} /></div>
                  <button onClick={handleUpdateConfig} className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px]">Update Global Config</button>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold mb-16 brand-font italic">Reviews Queue</h1>
                {reviews.map(review => (
                  <div key={review._id} className={`bg-white p-8 rounded-3xl flex justify-between items-center transition-opacity ${!review.visible ? 'opacity-40' : ''}`}>
                    <div><h4 className="font-bold">{review.name}</h4><p className="text-sm italic">"{review.text}"</p></div>
                    <button onClick={() => handleReviewToggle(review)} className="p-3 bg-zinc-50 rounded-xl">{review.visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedLead && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-2xl rounded-[50px] overflow-hidden flex flex-col">
            <div className="p-10 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold brand-font italic">Lead Analysis</h2>
              <button onClick={() => setSelectedLead(null)}><X size={32} /></button>
            </div>
            <div className="p-12 space-y-10">
              {saveSuccess ? <div className="text-center font-bold text-green-500">Record Synchronized</div> : (
                <>
                  <div className="space-y-2"><label className="text-[9px] font-black text-zinc-400">STATUS</label><select className="w-full bg-zinc-50 p-4 rounded-xl font-bold" value={leadStatus} onChange={e => setLeadStatus(e.target.value as any)}><option value="open">Open</option><option value="inProgress">In Progress</option><option value="done">Done</option></select></div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-zinc-400">REMARKS</label><textarea className="w-full bg-zinc-50 p-5 rounded-2xl h-32" value={leadRemarks} onChange={e => setLeadRemarks(e.target.value)} /></div>
                  <button onClick={handleUpdateLead} className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px]">Authorize CRM Update</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
