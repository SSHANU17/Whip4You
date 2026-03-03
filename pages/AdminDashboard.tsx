
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Car, FileText, Settings, LogOut, 
  Plus, Trash2, Edit3, CheckCircle, Clock, X, 
  Phone, Mail, User, MessageSquare, AlertTriangle,
  TrendingUp, BarChart3, Eye, EyeOff, Star, ShieldCheck,
  Percent, DollarSign, Type, ClipboardEdit, Save, Loader2,
  Menu
} from 'lucide-react';
import { api } from '../api';
import { Vehicle } from '../types';

interface Lead {
  _id?: string;
  id: string;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Inventory State
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    make: '', model: '', year: new Date().getFullYear(), price: 0,
    mileage: 0, bodyType: 'Sedan', transmission: 'Automatic',
    fuelType: 'Gasoline', engine: '', drivetrain: 'FWD',
    exteriorColor: '', interiorColor: '', vin: '',
    stockNumber: '', images: [], features: [],
    description: '', condition: 'Used', status: 'Available'
  });
  const [uploadingImage, setUploadingImage] = useState(false);

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
    const leadId = selectedLead._id || selectedLead.id;
    const updated = await api.updateLead(leadId, { status: leadStatus, remarks: leadRemarks });
    setLeads(prev => prev.map(l => (l._id || l.id) === leadId ? updated : l));
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
    const reviewId = review._id || review.id;
    const updated = await api.updateReview(reviewId, { visible: !review.visible });
    setReviews(prev => prev.map(r => (r._id || r.id) === reviewId ? updated : r));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = await api.uploadImage(file);
      setNewVehicle(prev => ({
        ...prev,
        images: [...(prev.images || []), data.url]
      }));
    } catch (err) {
      alert("Image upload failed. Check Cloudinary credentials.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createVehicle(newVehicle);
      setVehicles(prev => [created, ...prev]);
      setIsAddingVehicle(false);
      setNewVehicle({
        make: '', model: '', year: new Date().getFullYear(), price: 0,
        mileage: 0, bodyType: 'Sedan', transmission: 'Automatic',
        fuelType: 'Gasoline', engine: '', drivetrain: 'FWD',
        exteriorColor: '', interiorColor: '', vin: '',
        stockNumber: '', images: [], features: [],
        description: '', condition: 'Used', status: 'Available'
      });
    } catch (err) {
      alert("Failed to create vehicle.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <form onSubmit={handleLogin} className="bg-white p-8 md:p-12 rounded-[30px] md:rounded-[40px] shadow-2xl w-full max-w-md border border-white/10">
          <div className="gold-gradient w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} className="text-black" />
          </div>
          <h2 className="text-2xl font-bold mb-10 brand-font italic text-center uppercase">Secure Gateway</h2>
          <input required type="email" placeholder="EMAIL" className="w-full bg-zinc-50 p-5 rounded-2xl mb-4 outline-none border-b border-zinc-200 text-black" value={email} onChange={e => setEmail(e.target.value)} />
          <input required type="password" placeholder="PASSWORD" className="w-full bg-zinc-50 p-5 rounded-2xl mb-8 outline-none border-b border-zinc-200 text-black" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px]">Authorize Entry</button>
          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={async () => {
                const name = prompt("Enter Admin Name:");
                const email = prompt("Enter Admin Email:");
                const password = prompt("Enter Admin Password:");
                if (name && email && password) {
                  try {
                    const base = import.meta.env.VITE_API_BASE || '/api';
                    const res = await fetch(`${base}/auth/setup`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, email, password })
                    });
                    if (res.ok) alert("Admin successfully registered. You can now login.");
                    else alert("Setup failed. Admin might already exist.");
                  } catch (e) {
                    alert("Network error during setup.");
                  }
                }
              }}
              className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-[#D4AF37] transition-colors"
            >
              First Time? Initialize System
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-black text-white p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="text-xl font-bold brand-font italic">W4Y <span className="text-[#D4AF37]">SYSTEMS</span></div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-[#D4AF37]">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`w-80 bg-black text-white flex flex-col fixed lg:sticky inset-y-0 left-0 h-full z-40 border-r border-white/5 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-12 text-2xl font-bold brand-font italic hidden lg:block">W4Y <span className="text-[#D4AF37]">SYSTEMS</span></div>
        <nav className="flex-1 px-8 space-y-4 mt-8 lg:mt-0">
          {['overview', 'inventory', 'leads', 'reviews', 'config'].map(id => (
            <button key={id} onClick={() => { setActiveTab(id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-6 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] ${activeTab === id ? 'bg-[#D4AF37] text-black' : 'text-zinc-500 hover:bg-white/5'}`}>
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

      <main className="flex-1 p-6 md:p-10 lg:p-16">
        {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={48} /></div> : (
          <>
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-10 md:mb-16 brand-font italic text-black">Operations Analytics</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
                  <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border-l-4 border-[#D4AF37]"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Units</p><h3 className="text-3xl md:text-4xl font-bold">{vehicles.length}</h3></div>
                  <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border-l-4 border-green-500"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Leads</p><h3 className="text-3xl md:text-4xl font-bold">{leads.filter(l => l.status !== 'done').length}</h3></div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 md:mb-16">
                  <h1 className="text-3xl md:text-4xl font-bold brand-font italic">Inventory Control</h1>
                  <button 
                    onClick={() => setIsAddingVehicle(true)}
                    className="w-full sm:w-auto gold-gradient text-black px-8 md:px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                  >
                    <Plus size={18} /> Add New Asset
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {vehicles.map(v => (
                    <div key={v._id || v.id} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between border border-zinc-100 group hover:border-[#D4AF37] transition-all gap-6">
                      <div className="flex items-center gap-6 md:gap-10">
                        <img 
                          src={v.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80'} 
                          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0" 
                          alt="" 
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-lg md:text-xl text-black truncate">{v.year} {v.make} {v.model}</h4>
                          <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest truncate">{v.vin} • {v.trim}</p>
                          <p className="text-[#D4AF37] font-bold mt-1">${v.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <button className="p-3 md:p-4 bg-zinc-50 rounded-2xl text-zinc-400 hover:text-black transition-colors"><Edit3 size={18} /></button>
                        <button 
                          onClick={async () => {
                            if(confirm('Authorize permanent deletion of this asset?')) {
                              await api.deleteVehicle(v._id || v.id);
                              setVehicles(prev => prev.filter(item => (item._id || item.id) !== (v._id || v.id)));
                            }
                          }}
                          className="p-3 md:p-4 bg-zinc-50 rounded-2xl text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-10 md:mb-16 brand-font italic">Lead Hub</h1>
                {leads.map(lead => (
                  <div key={lead._id || lead.id} className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between border border-zinc-100 gap-6">
                    <div className="flex items-center gap-6 md:gap-10">
                      <div className="bg-zinc-950 p-4 rounded-xl text-[#D4AF37] shrink-0"><User size={24} /></div>
                      <div>
                        <h4 className="font-bold text-lg text-black">{lead.name}</h4>
                        <p className="text-[9px] font-black uppercase text-zinc-400">{lead.type} • {lead.priority}</p>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedLead(lead); setLeadRemarks(lead.remarks || ''); setLeadStatus(lead.status); }} className="w-full sm:w-auto text-[10px] font-black text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/20 sm:border-none py-3 sm:py-0 rounded-xl">Process</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="max-w-4xl space-y-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-10 md:mb-16 brand-font italic">Site Config</h1>
                <div className="bg-white p-8 md:p-12 rounded-[30px] md:rounded-[40px] shadow-sm space-y-8">
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-400">HERO HEADLINE</label><input className="w-full bg-zinc-50 p-5 rounded-2xl font-bold text-black" value={siteConfig?.heroHeadline} onChange={e => setSiteConfig({...siteConfig, heroHeadline: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-400">PROMO RATE (%)</label><input className="w-full bg-zinc-50 p-5 rounded-2xl font-bold text-black" value={siteConfig?.promoRate} onChange={e => setSiteConfig({...siteConfig, promoRate: e.target.value})} /></div>
                  <button onClick={handleUpdateConfig} className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px]">Update Global Config</button>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-10 md:mb-16 brand-font italic">Reviews Queue</h1>
                {reviews.map(review => (
                  <div key={review._id || review.id} className={`bg-white p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center transition-opacity gap-6 ${!review.visible ? 'opacity-40' : ''}`}>
                    <div><h4 className="font-bold">{review.name}</h4><p className="text-sm italic">"{review.text}"</p></div>
                    <button onClick={() => handleReviewToggle(review)} className="w-full sm:w-auto p-3 bg-zinc-50 rounded-xl flex justify-center">{review.visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedLead && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-full max-w-2xl rounded-[30px] md:rounded-[50px] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-10 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold brand-font italic">Lead Analysis</h2>
              <button onClick={() => setSelectedLead(null)}><X size={24} className="md:w-8 md:h-8" /></button>
            </div>
            <div className="p-6 md:p-12 space-y-8 md:y-10 overflow-y-auto">
              {saveSuccess ? <div className="text-center font-bold text-green-500">Record Synchronized</div> : (
                <>
                  <div className="space-y-2"><label className="text-[9px] font-black text-zinc-400">STATUS</label><select className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={leadStatus} onChange={e => setLeadStatus(e.target.value as any)}><option value="open">Open</option><option value="inProgress">In Progress</option><option value="done">Done</option></select></div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-zinc-400">REMARKS</label><textarea className="w-full bg-zinc-50 p-5 rounded-2xl h-32 text-black" value={leadRemarks} onChange={e => setLeadRemarks(e.target.value)} /></div>
                  <button onClick={handleUpdateLead} className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px]">Authorize CRM Update</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddingVehicle && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-full max-w-4xl rounded-[30px] md:rounded-[50px] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-10 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl md:text-2xl font-bold brand-font italic">New Asset Registration</h2>
              <button onClick={() => setIsAddingVehicle(false)}><X size={24} className="md:w-8 md:h-8" /></button>
            </div>
            <form onSubmit={handleCreateVehicle} className="p-6 md:p-12 space-y-8 md:space-y-10 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">MAKE</label>
                  <input required className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">MODEL</label>
                  <input required className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">YEAR</label>
                  <input required type="number" className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">PRICE ($)</label>
                  <input required type="number" className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.price} onChange={e => setNewVehicle({...newVehicle, price: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">VIN</label>
                  <input required className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.vin} onChange={e => setNewVehicle({...newVehicle, vin: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">STOCK NUMBER</label>
                  <input required className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.stockNumber} onChange={e => setNewVehicle({...newVehicle, stockNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">MILEAGE</label>
                  <input required type="number" className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.mileage} onChange={e => setNewVehicle({...newVehicle, mileage: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">TRIM</label>
                  <input className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.trim} onChange={e => setNewVehicle({...newVehicle, trim: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">BODY TYPE</label>
                  <select className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.bodyType} onChange={e => setNewVehicle({...newVehicle, bodyType: e.target.value})}>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400">TRANSMISSION</label>
                  <select className="w-full bg-zinc-50 p-4 rounded-xl font-bold text-black" value={newVehicle.transmission} onChange={e => setNewVehicle({...newVehicle, transmission: e.target.value})}>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-zinc-400">ASSET IMAGES (CLOUDINARY)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {newVehicle.images?.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-100">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button"
                        onClick={() => setNewVehicle(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                    {uploadingImage ? <Loader2 className="animate-spin text-[#D4AF37]" /> : <Plus className="text-zinc-400" />}
                    <span className="text-[8px] font-black uppercase mt-2 text-zinc-400">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-400">DESCRIPTION</label>
                <textarea className="w-full bg-zinc-50 p-5 rounded-2xl h-32 text-black" value={newVehicle.description} onChange={e => setNewVehicle({...newVehicle, description: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px]">Register Asset to Inventory</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
