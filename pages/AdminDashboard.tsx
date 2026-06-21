
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Car, FileText, Settings, LogOut, 
  Plus, Trash2, Edit3, CheckCircle, Clock, X, 
  Phone, Mail, User, MessageSquare, AlertTriangle,
  TrendingUp, BarChart3, Eye, EyeOff, Star, ShieldCheck,
  Percent, DollarSign, Type, ClipboardEdit, Save, Loader2,
  Menu, ChevronsLeft, ChevronsRight
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
  details?: Record<string, unknown>;
}

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatDetailLabel = (rawKey: string) =>
  rawKey
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());

const stringifyDetailValue = (value: unknown): string => {
  if (value === null || typeof value === 'undefined') return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyDetailValue(item))
      .filter((item) => item.length > 0)
      .join(', ');
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
};

const getLeadDetailEntries = (details?: Record<string, unknown>) => {
  if (!details || typeof details !== 'object') return [];
  return Object.entries(details)
    .map(([key, value]) => ({
      label: formatDetailLabel(key),
      value: stringifyDetailValue(value)
    }))
    .filter((entry) => entry.value.length > 0);
};

const createInitialVehicleForm = (): Partial<Vehicle> => ({
  make: '',
  model: '',
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  bodyType: 'Sedan',
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  engine: '',
  drivetrain: 'FWD',
  exteriorColor: '',
  interiorColor: '',
  vin: '',
  stockNumber: '',
  images: [],
  features: [],
  description: '',
  condition: 'Used',
  status: 'Available',
  showPrice: true,
  isNewArrival: true
});

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'leads' | 'reviews' | 'config'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('w4u_admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // CRM State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadRemarks, setLeadRemarks] = useState('');
  const [leadStatus, setLeadStatus] = useState<Lead['status']>('open');
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState<string | null>(null);
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Inventory State
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>(createInitialVehicleForm());
  const [uploadingImage, setUploadingImage] = useState(false);
  const [inventoryFeedback, setInventoryFeedback] = useState<string | null>(null);
  const [draggedImgIndex, setDraggedImgIndex] = useState<number | null>(null);

  // Site Configuration State
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const visibleLeads = useMemo(
    () => {
      if (leadStatusFilter === 'all') return leads;
      if (leadStatusFilter === 'completed') return leads.filter((lead) => lead.status === 'done');
      return leads.filter((lead) => lead.status !== 'done');
    },
    [leads, leadStatusFilter]
  );
  const leadDetailEntries = useMemo(
    () => getLeadDetailEntries(selectedLead?.details),
    [selectedLead?.details]
  );

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
        localStorage.removeItem('w4u_admin_token');
      });
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.login({ email, password });
      if (data.token) {
        localStorage.setItem('w4u_admin_token', data.token);
        setIsLoggedIn(true);
      } else {
        alert("Authentication failed.");
      }
    } catch (err) {
      alert("Invalid credentials.");
    }
  };

  const closeLeadModal = () => {
    setSelectedLead(null);
    setLeadFeedback(null);
    setSaveSuccess(false);
  };

  const closeVehicleModal = () => {
    setIsAddingVehicle(false);
    setEditingVehicleId(null);
    setInventoryFeedback(null);
    setNewVehicle(createInitialVehicleForm());
  };

  const handleUpdateLead = async (statusOverride?: Lead['status']) => {
    if (!selectedLead) return;
    const leadId = selectedLead._id || selectedLead.id;
    const statusToSave = statusOverride || leadStatus;
    setIsUpdatingLead(true);
    setLeadFeedback(null);
    try {
      const updated = await api.updateLead(leadId, { status: statusToSave, remarks: leadRemarks });
      setLeads(prev => prev.map(l => (l._id || l.id) === leadId ? { ...l, ...updated } : l));
      const refreshedLeads = await api.getLeads();
      setLeads(refreshedLeads);
      setLeadStatus(statusToSave);
      setSaveSuccess(true);
      setLeadFeedback('Lead status updated.');
      setTimeout(() => {
        setSaveSuccess(false);
        closeLeadModal();
        setLeadFeedback(null);
      }, 900);
    } catch (err: any) {
      const message = err?.message || 'Failed to update lead status.';
      setLeadFeedback(message);
      alert(message);
    } finally {
      setIsUpdatingLead(false);
    }
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setInventoryFeedback(null);

    try {
      // Execute all uploads in parallel for true multiple-upload performance
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const data = await api.uploadImage(file);
          let url = data.url || data.secure_url;
          
          // Accept iPhone HEIF/HEIC photos and convert on-the-fly via Cloudinary to JPG
          if (url && (url.toLowerCase().endsWith('.heic') || url.toLowerCase().endsWith('.heif'))) {
            url = url.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
          }
          return url;
        } catch (err) {
          return null; // Handle failure individually
        }
      });

      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.filter((url): url is string => url !== null);
      const failedCount = files.length - uploadedUrls.length;

      if (uploadedUrls.length > 0) {
        setNewVehicle(prev => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedUrls]
        }));
      }

      const successMsg = uploadedUrls.length > 0 ? `${uploadedUrls.length} image(s) uploaded successfully.` : '';
      const failMsg = failedCount > 0 ? `${failedCount} file(s) failed to upload.` : '';
      setInventoryFeedback(successMsg + (failMsg ? ' ' + failMsg : ''));
    } catch (err: any) {
      const message = err?.message || 'Image upload failed. Check Cloudinary configuration.';
      setInventoryFeedback(message);
      alert(message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleStartEditVehicle = (vehicle: Vehicle) => {
    const vehicleId = vehicle._id || vehicle.id;
    if (!vehicleId) {
      alert('Unable to edit this vehicle because it has no ID.');
      return;
    }

    setInventoryFeedback(null);
    setEditingVehicleId(vehicleId);
    setNewVehicle({
      ...vehicle,
      price: vehicle.price === 'Call For Price' ? 0 : Number(vehicle.price),
      images: vehicle.images || [],
      features: vehicle.features || []
    });
    setIsAddingVehicle(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setInventoryFeedback(null);

    const payload = {
      ...newVehicle,
      year: Number(newVehicle.year),
      mileage: Number(newVehicle.mileage),
      price: newVehicle.price === 'Call For Price' ? 0 : Number(newVehicle.price),
      actualPrice: newVehicle.actualPrice ? Number(newVehicle.actualPrice) : undefined,
      images: newVehicle.images || [],
      features: newVehicle.features || []
    };

    try {
      if (editingVehicleId) {
        const updated = await api.updateVehicle(editingVehicleId, payload);
        setVehicles(prev =>
          prev.map(v => ((v._id || v.id) === editingVehicleId ? updated : v))
        );
      } else {
        const created = await api.createVehicle(payload);
        setVehicles(prev => [created, ...prev]);
      }

      closeVehicleModal();
    } catch (err: any) {
      const message = err?.message || `Failed to ${editingVehicleId ? 'update' : 'create'} vehicle.`;
      setInventoryFeedback(message);
      alert(message);
    }
  };

  useEffect(() => {
    if (!selectedLead && !isAddingVehicle) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscClose = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (selectedLead) closeLeadModal();
      if (isAddingVehicle) closeVehicleModal();
    };

    window.addEventListener('keydown', handleEscClose);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscClose);
    };
  }, [selectedLead, isAddingVehicle]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <form onSubmit={handleLogin} className="bg-white p-8 md:p-12 rounded-[30px] md:rounded-[40px] shadow-2xl w-full max-w-md border border-white/10">
          <div className="gold-gradient w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} className="text-black" />
          </div>
          <h2 className="text-2xl font-bold mb-10 brand-font italic text-center uppercase text-zinc-900">Secure Gateway</h2>
          <input required type="email" placeholder="EMAIL" className="w-full bg-zinc-50 p-5 rounded-2xl mb-4 outline-none border-b border-zinc-200 focus:border-[#D4AF37] transition-all text-black caret-black placeholder:text-zinc-400" value={email} onChange={e => setEmail(e.target.value)} />
          <input required type="password" placeholder="PASSWORD" className="w-full bg-zinc-50 p-5 rounded-2xl mb-8 outline-none border-b border-zinc-200 focus:border-[#D4AF37] transition-all text-black caret-black placeholder:text-zinc-400" value={password} onChange={e => setPassword(e.target.value)} />
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
              className="text-[9px] font-bold uppercase tracking-widest text-zinc-800 hover:text-[#D4AF37] transition-colors"
            >
              First Time? Initialize System
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col lg:flex-row text-zinc-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-black text-white p-6 flex justify-between items-center sticky top-0 z-50 border-b border-white/10">
        <div className="text-xl font-bold brand-font italic tracking-[0.12em] text-white">WHIP4YOU <span className="text-[#D4AF37]">SYSTEMS</span></div>
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

      <aside className={`w-64 ${isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'} bg-black text-white flex flex-col fixed lg:sticky top-0 lg:top-0 left-0 h-screen lg:h-screen z-40 border-r border-white/10 transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-white/10">
          {isSidebarExpanded ? (
            <div className="text-lg font-bold brand-font italic tracking-[0.12em] text-white">WHIP4YOU <span className="text-[#D4AF37]">SYSTEMS</span></div>
          ) : (
            <div className="text-base font-bold brand-font italic text-[#D4AF37]">W4U</div>
          )}
          <button
            onClick={() => setIsSidebarExpanded(prev => !prev)}
            className="p-2 rounded-xl bg-white/5 text-[#D4AF37] hover:bg-white/10 transition-colors"
            title={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarExpanded ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
          </button>
        </div>
        <nav className={`flex-1 ${isSidebarExpanded ? 'px-4' : 'px-2'} space-y-2 mt-8 lg:mt-6`}>
          {['overview', 'inventory', 'leads', 'reviews', 'config'].map(id => (
            <button
              key={id}
              onClick={() => { setActiveTab(id as any); setIsSidebarOpen(false); }}
              className={`w-full flex items-center ${
                isSidebarExpanded ? 'gap-4 px-4 justify-start' : 'justify-center px-0'
              } py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] transition-all duration-300 border-l-4 ${
                activeTab === id
                  ? 'bg-white/5 border-[#D4AF37] text-[#D4AF37] shadow-[inset_4px_0_12px_rgba(212,175,55,0.08)]'
                  : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              {id === 'overview' && <TrendingUp size={16} />}
              {id === 'inventory' && <Car size={16} />}
              {id === 'leads' && <FileText size={16} />}
              {id === 'reviews' && <Star size={16} />}
              {id === 'config' && <Settings size={16} />}
              <span className={isSidebarExpanded ? '' : 'lg:hidden'}>{id.toUpperCase()}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => { localStorage.removeItem('w4u_admin_token'); setIsLoggedIn(false); }} 
            className="w-full text-red-500 hover:text-red-400 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 py-3.5 rounded-xl hover:bg-red-500/5 transition-all"
          >
            <LogOut size={14} />
            <span className={isSidebarExpanded ? '' : 'lg:hidden'}>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 lg:p-16">
        {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={48} /></div> : (
          <>
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-10 md:mb-16 brand-font italic text-zinc-900" style={{ color: '#18181b' }}>Operations Analytics</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
                  <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-zinc-200 border-l-4 border-l-[#D4AF37]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Total Units</p>
                    <h3 className="text-3xl md:text-4xl font-black text-zinc-900">{vehicles.length}</h3>
                  </div>
                  <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-zinc-200 border-l-4 border-l-green-500">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Live Leads</p>
                    <h3 className="text-3xl md:text-4xl font-black text-zinc-900">{leads.filter(l => l.status !== 'done').length}</h3>
                  </div>
                  <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-zinc-200 border-l-4 border-l-blue-500">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Total Inventory Worth</p>
                    <h3 className="text-3xl md:text-4xl font-black text-zinc-900">${vehicles.reduce((sum, v) => sum + (v.actualPrice || 0), 0).toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 md:mb-16">
                  <h1 className="text-3xl md:text-4xl font-bold brand-font italic text-zinc-900" style={{ color: '#18181b' }}>Inventory Control</h1>
                  <button 
                    onClick={() => {
                      setInventoryFeedback(null);
                      setEditingVehicleId(null);
                      setNewVehicle(createInitialVehicleForm());
                      setIsAddingVehicle(true);
                    }}
                    className="w-full sm:w-auto gold-gradient text-black px-8 md:px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                  >
                    <Plus size={18} /> Add New Asset
                  </button>
                </div>
                
                <div className="space-y-10">
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-black brand-font">Available Vehicles</h3>
                    <div className="grid grid-cols-1 gap-6">
                      {vehicles.filter(v => v.status !== 'Sold').map(v => (
                        <div key={v._id || v.id} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between border border-zinc-100 group hover:border-[#D4AF37] transition-all gap-6">
                          <div className="flex items-center gap-6 md:gap-10">
                            <img src={v.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80'} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0" alt="" />
                            <div className="min-w-0">
                              <h4 className="font-bold text-lg md:text-xl text-black truncate">{v.year} {v.make} {v.model}</h4>
                              <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest truncate">{v.vin} | {v.trim}</p>
                              <p className="text-[#D4AF37] font-bold mt-1">${typeof v.price === 'number' ? v.price.toLocaleString() : v.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                            <button
                              onClick={async () => {
                                const updated = await api.updateVehicle(v._id || v.id, { isHidden: !v.isHidden });
                                setVehicles(prev => prev.map(item => (item._id || item.id) === (v._id || v.id) ? { ...item, ...updated } : item));
                              }}
                              className={`p-3 md:p-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-colors ${v.isHidden ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200'}`}
                              title={v.isHidden ? "Show Vehicle" : "Hide Vehicle"}
                            >
                              {v.isHidden ? "Unhide" : "Hide"}
                            </button>
                            <button
                              onClick={async () => {
                                const updated = await api.updateVehicle(v._id || v.id, { status: 'Sold' });
                                setVehicles(prev => prev.map(item => (item._id || item.id) === (v._id || v.id) ? { ...item, ...updated } : item));
                              }}
                              className="p-3 md:p-4 bg-zinc-50 rounded-2xl text-blue-500 hover:bg-blue-50 transition-colors font-bold text-[10px] uppercase tracking-widest"
                              title="Mark as Sold"
                            >
                              Mark Sold
                            </button>
                            <button onClick={() => handleStartEditVehicle(v)} className="p-3 md:p-4 bg-zinc-50 rounded-2xl text-zinc-600 hover:text-black transition-colors" title="Edit vehicle"><Edit3 size={18} /></button>
                            <button onClick={async () => { if(confirm('Authorize permanent deletion of this asset?')) { await api.deleteVehicle(v._id || v.id); setVehicles(prev => prev.filter(item => (item._id || item.id) !== (v._id || v.id))); } }} className="p-3 md:p-4 bg-zinc-50 rounded-2xl text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {vehicles.filter(v => v.status === 'Sold').length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-6 text-zinc-800 brand-font">Sold Vehicles</h3>
                      <div className="grid grid-cols-1 gap-6 opacity-80">
                        {vehicles.filter(v => v.status === 'Sold').map(v => (
                          <div key={v._id || v.id} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between border border-zinc-100 group transition-all gap-6">
                            <div className="flex items-center gap-6 md:gap-10">
                              <img src={v.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80'} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0 grayscale" alt="" />
                              <div className="min-w-0">
                                <h4 className="font-bold text-lg md:text-xl text-zinc-800 line-through truncate">{v.year} {v.make} {v.model}</h4>
                                <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest truncate">{v.vin} | {v.trim}</p>
                                <p className="text-zinc-700 font-bold mt-1">${typeof v.price === 'number' ? v.price.toLocaleString() : v.price}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                              <button
                                onClick={async () => {
                                  const updated = await api.updateVehicle(v._id || v.id, { isHidden: !v.isHidden });
                                  setVehicles(prev => prev.map(item => (item._id || item.id) === (v._id || v.id) ? { ...item, ...updated } : item));
                                }}
                                className={`p-3 md:p-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-colors ${v.isHidden ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200'}`}
                                title={v.isHidden ? "Show Vehicle" : "Hide Vehicle"}
                              >
                                {v.isHidden ? "Unhide" : "Hide"}
                              </button>
                              <button
                                onClick={async () => {
                                  const updated = await api.updateVehicle(v._id || v.id, { status: 'Available' });
                                  setVehicles(prev => prev.map(item => (item._id || item.id) === (v._id || v.id) ? { ...item, ...updated } : item));
                                }}
                                className="p-3 md:p-4 bg-zinc-50 rounded-2xl text-green-500 hover:bg-green-50 transition-colors font-bold text-[10px] uppercase tracking-widest"
                                title="Mark as Available"
                              >
                                Mark Available
                              </button>
                              <button onClick={() => handleStartEditVehicle(v)} className="p-3 md:p-4 bg-zinc-50 rounded-2xl text-zinc-400 hover:text-black transition-colors"><Edit3 size={18} /></button>
                              <button onClick={async () => { if(confirm('Authorize permanent deletion of this asset?')) { await api.deleteVehicle(v._id || v.id); setVehicles(prev => prev.filter(item => (item._id || item.id) !== (v._id || v.id))); } }} className="p-3 md:p-4 bg-zinc-50 rounded-2xl text-red-300 hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold brand-font italic text-zinc-900" style={{ color: '#18181b' }}>Lead Hub</h1>
                  <div className="flex items-center gap-3">
                    <select
                      value={leadStatusFilter}
                      onChange={(e) => setLeadStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
                      className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-zinc-200 bg-white hover:border-[#D4AF37] transition-colors cursor-pointer"
                    >
                      <option value="pending">Pending Tasks</option>
                      <option value="completed">Completed Tasks</option>
                      <option value="all">All Tasks</option>
                    </select>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Showing {visibleLeads.length} / {leads.length}
                    </div>
                  </div>
                </div>

                {visibleLeads.length === 0 ? (
                  <div className="bg-white p-10 rounded-[30px] border border-zinc-100 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                    No leads to display for current filter.
                  </div>
                ) : (
                  visibleLeads.map(lead => (
                    <div key={lead._id || lead.id} className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between border border-zinc-100 gap-6">
                      <div className="flex items-center gap-6 md:gap-10">
                        <div className="bg-zinc-950 p-4 rounded-xl text-[#D4AF37] shrink-0"><User size={24} /></div>
                        <div>
                          <h4 className="font-bold text-lg text-black">{lead.name}</h4>
                          <p className="text-[9px] font-black uppercase text-zinc-600">{lead.type} | {lead.priority}</p>
                          <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            lead.status === 'done'
                              ? 'bg-green-100 text-green-700'
                              : lead.status === 'inProgress'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {lead.status === 'inProgress' ? 'In Progress' : lead.status === 'done' ? 'Completed' : 'Open'}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedLead(lead); setLeadRemarks(lead.remarks || ''); setLeadStatus(lead.status); setLeadFeedback(null); setSaveSuccess(false); }} className="w-full sm:w-auto text-[10px] font-black text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/20 sm:border-none py-3 sm:py-0 rounded-xl">Process</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="max-w-4xl space-y-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-10 md:mb-16 brand-font italic text-zinc-900" style={{ color: '#18181b' }}>Site Config</h1>
                <div className="bg-white p-8 md:p-12 rounded-[30px] md:rounded-[40px] shadow-sm space-y-8">
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-700">HERO HEADLINE</label><input className="w-full bg-white border-2 border-zinc-200 p-5 rounded-2xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-500" value={siteConfig?.heroHeadline} onChange={e => setSiteConfig({...siteConfig, heroHeadline: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-700">PROMO RATE (%)</label><input className="w-full bg-white border-2 border-zinc-200 p-5 rounded-2xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-500" value={siteConfig?.promoRate} onChange={e => setSiteConfig({...siteConfig, promoRate: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-700">INVENTORY GRID SIZE (10-20)</label><input type="number" min="10" max="20" className="w-full bg-white border-2 border-zinc-200 p-5 rounded-2xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-500" value={siteConfig?.inventoryGridSize || 12} onChange={e => setSiteConfig({...siteConfig, inventoryGridSize: parseInt(e.target.value) || 12})} /></div>
                  <button onClick={handleUpdateConfig} className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px]">Update Global Config</button>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-10 md:mb-16 brand-font italic text-zinc-900" style={{ color: '#18181b' }}>Reviews Queue</h1>
                {reviews.map(review => (
                  <div key={review._id || review.id} className={`bg-white p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center transition-opacity gap-6 ${!review.visible ? 'opacity-40' : ''}`}>
                    <div><h4 className="font-bold text-black">{review.name}</h4><p className="text-sm italic text-zinc-600">"{review.text}"</p></div>
                    <button onClick={() => handleReviewToggle(review)} className="w-full sm:w-auto p-3 bg-zinc-50 rounded-xl flex justify-center">{review.visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedLead && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8" onClick={closeLeadModal}>
          <div className="bg-white w-full max-w-2xl rounded-[30px] md:rounded-[50px] overflow-hidden flex flex-col max-h-[90vh] text-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-10 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold brand-font italic text-zinc-900">Lead Analysis</h2>
              <button onClick={closeLeadModal} className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 hover:bg-zinc-200">
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
            <div className="p-6 md:p-12 space-y-8 md:space-y-10 overflow-y-auto">
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Customer</p>
                    <p className="text-sm font-bold text-black">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Type</p>
                    <p className="text-sm font-bold text-black">{selectedLead.type}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Email</p>
                    <a href={`mailto:${selectedLead.email}`} className="text-sm font-bold text-black underline decoration-dotted">{selectedLead.email}</a>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Phone</p>
                    <a href={`tel:${selectedLead.phone}`} className="text-sm font-bold text-black underline decoration-dotted">{selectedLead.phone}</a>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Request</p>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {selectedLead.message?.trim() || 'No direct message provided. Review request profile below.'}
                  </p>
                </div>
                {leadDetailEntries.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Request Profile</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {leadDetailEntries.map((entry, index) => (
                        <div key={`${entry.label}-${index}`} className="rounded-xl border border-zinc-200 bg-white p-3">
                          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">{entry.label}</p>
                          <p className="text-sm font-semibold text-zinc-800 break-words">{entry.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {leadDetailEntries.length === 0 && !selectedLead.message?.trim() && (
                  <p className="text-xs font-semibold text-zinc-500">
                    No structured request profile was attached with this lead.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Created: {formatDateTime(selectedLead.createdAt)}</span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    selectedLead.status === 'done'
                      ? 'bg-green-100 text-green-700'
                      : selectedLead.status === 'inProgress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedLead.status === 'inProgress' ? 'In Progress' : selectedLead.status === 'done' ? 'Completed' : 'Open'}
                  </span>
                </div>
              </div>

              {leadFeedback && (
                <div className="bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-widest p-4 rounded-2xl">
                  {leadFeedback}
                </div>
              )}
              {saveSuccess ? <div className="text-center font-bold text-green-500">Record Synchronized</div> : (
                <>
                  <div className="space-y-2"><label className="text-[9px] font-black text-zinc-700">STATUS</label><select className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl font-bold text-black" value={leadStatus} onChange={e => setLeadStatus(e.target.value as any)}><option value="open">Open</option><option value="inProgress">In Progress</option><option value="done">Completed (Closed)</option></select></div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-zinc-700">REMARKS</label><textarea className="w-full bg-white border-2 border-zinc-200 p-5 rounded-2xl h-32 text-black" value={leadRemarks} onChange={e => setLeadRemarks(e.target.value)} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button onClick={closeLeadModal} type="button" className="w-full bg-zinc-100 text-zinc-800 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200">
                      Close Panel
                    </button>
                    <button onClick={() => handleUpdateLead('done')} type="button" disabled={isUpdatingLead} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      Mark Completed
                    </button>
                    <button onClick={() => handleUpdateLead()} type="button" disabled={isUpdatingLead} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed">
                      {isUpdatingLead ? 'Updating...' : 'Save Update'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddingVehicle && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-8" onClick={closeVehicleModal}>
          <div className="bg-white w-full max-w-4xl rounded-[20px] md:rounded-[50px] overflow-hidden flex flex-col max-h-[95vh] text-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 md:p-10 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg md:text-2xl font-bold brand-font italic text-zinc-900">
                {editingVehicleId ? 'Edit Asset' : 'New Asset Registration'}
              </h2>
              <button onClick={closeVehicleModal} className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 hover:bg-zinc-200 transition-colors">
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle} className="p-4 md:p-12 space-y-5 md:space-y-10 overflow-y-auto">
              {inventoryFeedback && (
                <div className="bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-widest p-3 md:p-4 rounded-xl md:rounded-2xl">
                  {inventoryFeedback}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-8">
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">MAKE</label>
                  <input required className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">MODEL</label>
                  <input required className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">YEAR</label>
                  <input required type="number" className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">PRICE ($)</label>
                  <input required type="number" className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.price} onChange={e => setNewVehicle({...newVehicle, price: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">ACTUAL/REAL PRICE ($) <span className="text-zinc-400 font-normal">(Optional)</span></label>
                  <input type="number" className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.actualPrice || ''} onChange={e => setNewVehicle({...newVehicle, actualPrice: e.target.value ? parseInt(e.target.value) : undefined})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">VIN</label>
                  <input required className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.vin} onChange={e => setNewVehicle({...newVehicle, vin: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">STOCK NUMBER</label>
                  <input required className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.stockNumber} onChange={e => setNewVehicle({...newVehicle, stockNumber: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">MILEAGE</label>
                  <input required type="number" className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.mileage} onChange={e => setNewVehicle({...newVehicle, mileage: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-zinc-700">TRIM</label>
                  <input className="w-full bg-white border-2 border-zinc-200 p-2.5 md:p-4 rounded-lg md:rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400 text-sm" value={newVehicle.trim} onChange={e => setNewVehicle({...newVehicle, trim: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">FUEL TYPE</label>
                  <select className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black" value={newVehicle.fuelType} onChange={e => setNewVehicle({...newVehicle, fuelType: e.target.value})}>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">ENGINE</label>
                  <input className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400" placeholder="2.0L Turbo I4" value={newVehicle.engine} onChange={e => setNewVehicle({...newVehicle, engine: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">DRIVETRAIN</label>
                  <select className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black" value={newVehicle.drivetrain || 'FWD'} onChange={e => setNewVehicle({...newVehicle, drivetrain: e.target.value})}>
                    <option value="FWD">FWD</option>
                    <option value="RWD">RWD</option>
                    <option value="AWD">AWD</option>
                    <option value="4WD">4WD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">CONDITION</label>
                  <select className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black" value={newVehicle.condition || 'Used'} onChange={e => setNewVehicle({...newVehicle, condition: e.target.value as Vehicle['condition']})}>
                    <option value="Used">Used</option>
                    <option value="Certified">Certified</option>
                    <option value="New">New</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">SHOW PRICE</label>
                  <select className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black" value={newVehicle.showPrice === false ? 'false' : 'true'} onChange={e => setNewVehicle({...newVehicle, showPrice: e.target.value === 'true'})}>
                    <option value="true">Yes (Show Price)</option>
                    <option value="false">No (Call for Price)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">NEW ARRIVAL</label>
                  <select 
                    className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black" 
                    value={newVehicle.isNewArrival === false ? 'false' : 'true'} 
                    onChange={e => {
                      const isNew = e.target.value === 'true';
                      if (isNew) {
                        const newExpiry = new Date();
                        newExpiry.setDate(newExpiry.getDate() + 14);
                        setNewVehicle({
                          ...newVehicle,
                          isNewArrival: true,
                          newArrivalExpiryDate: newExpiry.toISOString()
                        });
                      } else {
                        setNewVehicle({
                          ...newVehicle,
                          isNewArrival: false,
                          newArrivalExpiryDate: null as any
                        });
                      }
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {newVehicle.newArrivalExpiryDate && (
                    <p className="text-[9px] font-bold text-[#D4AF37] mt-1">
                      Expiry: {new Date(newVehicle.newArrivalExpiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">STATUS</label>
                  <select className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black" value={newVehicle.status || 'Available'} onChange={e => setNewVehicle({...newVehicle, status: e.target.value as Vehicle['status']})}>
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">BODY TYPE</label>
                  <select className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black" value={newVehicle.bodyType} onChange={e => setNewVehicle({...newVehicle, bodyType: e.target.value as Vehicle['bodyType']})}>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Van">Van</option>
                    <option value="Mini-Van">Mini-Van</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">TRANSMISSION</label>
                  <select className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black" value={newVehicle.transmission} onChange={e => setNewVehicle({...newVehicle, transmission: e.target.value})}>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">EXTERIOR COLOR</label>
                  <input className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400" placeholder="White" value={newVehicle.exteriorColor} onChange={e => setNewVehicle({...newVehicle, exteriorColor: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-700">INTERIOR COLOR</label>
                  <input className="w-full bg-white border-2 border-zinc-200 p-4 rounded-xl outline-none focus:border-[#D4AF37] transition-all font-bold text-black caret-black placeholder:text-zinc-400" placeholder="Black" value={newVehicle.interiorColor} onChange={e => setNewVehicle({...newVehicle, interiorColor: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-zinc-700">ASSET IMAGES (CLOUDINARY) - <span className="text-[#D4AF37]">DRAG TO REORDER</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {newVehicle.images?.map((img, i) => (
                    <div 
                      key={i} 
                      draggable
                      onDragStart={() => setDraggedImgIndex(i)}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedImgIndex === null || draggedImgIndex === i) return;
                        setNewVehicle(prev => {
                          const imgs = [...(prev.images || [])];
                          const draggedImg = imgs[draggedImgIndex];
                          imgs.splice(draggedImgIndex, 1);
                          imgs.splice(i, 0, draggedImg);
                          return { ...prev, images: imgs };
                        });
                        setDraggedImgIndex(null);
                      }}
                      onDragEnd={() => setDraggedImgIndex(null)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-move transition-all ${draggedImgIndex === i ? 'opacity-50 border-[#D4AF37]' : 'border-transparent hover:border-[#D4AF37]'}`}
                    >
                      <img src={img} className="w-full h-full object-cover pointer-events-none" alt="" />
                      <button 
                        type="button"
                        onClick={() => setNewVehicle(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))}
                        className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity z-10"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] hover:bg-zinc-50 transition-all">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="animate-spin text-[#D4AF37] mb-1" size={18} />
                        <span className="text-[7px] font-black uppercase text-zinc-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="text-zinc-600 mb-1" size={18} />
                        <span className="text-[7px] font-black uppercase text-zinc-700">Multi-Upload</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*,.heic,.heif" onChange={handleImageUpload} disabled={uploadingImage} multiple />
                  </label>
                </div>
                <p className="text-[8px] text-zinc-500 font-semibold">Supports: JPG, PNG, WebP, HEIF (iPhone)</p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-700">DESCRIPTION</label>
                <textarea className="w-full bg-white border-2 border-zinc-200 p-5 rounded-2xl h-32 outline-none focus:border-[#D4AF37] transition-all text-black caret-black placeholder:text-zinc-400" value={newVehicle.description} onChange={e => setNewVehicle({...newVehicle, description: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px]">
                {editingVehicleId ? 'Save Asset Changes' : 'Register Asset to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
