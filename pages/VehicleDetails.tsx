
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Share2, Printer, Heart, 
  Gauge, Settings, Fuel, Palette, 
  CheckCircle2, ArrowRight, Phone, MessageSquare,
  Info, X, ShieldCheck, Search, FileCheck
} from 'lucide-react';
import { mockVehicles } from '../data/mockVehicles.ts';

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicle = mockVehicles.find(v => v.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFeeInfoOpen, setIsFeeInfoOpen] = useState(false);

  useEffect(() => {
    // Check local storage for favorites
    const favorites = JSON.parse(localStorage.getItem('w4y_favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('w4y_favorites') || '[]');
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((favId: string) => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    localStorage.setItem('w4y_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    
    // Dispatch custom event to notify Navbar
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Whip4You: ${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`,
          text: `Check out this ${vehicle?.trim} at Whip4You!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 brand-font text-black">Vehicle Not Found</h2>
          <Link to="/inventory" className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs">Return to Inventory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen pb-20">
      {/* Top Navigation Bar - Hidden during print */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 print:hidden">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/inventory" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            <ChevronLeft size={18} /> Back To Inventory
          </Link>
          <div className="flex gap-4">
            <button onClick={handleShare} className="p-2 text-zinc-400 hover:text-[#D4AF37] transition-colors" title="Share Listing"><Share2 size={18} /></button>
            <button onClick={() => window.print()} className="p-2 text-zinc-400 hover:text-[#D4AF37] transition-colors" title="Print Specs"><Printer size={18} /></button>
            <button 
              onClick={toggleFavorite} 
              className={`p-2 transition-all ${isFavorite ? 'text-red-500 scale-125' : 'text-zinc-400 hover:text-red-500'}`}
              title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Gallery & Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery */}
            <div className="space-y-4 print:mb-10">
              <div className="aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl">
                <img 
                  src={vehicle.images[activeImage]} 
                  alt={vehicle.make} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4 print:hidden">
                {vehicle.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#D4AF37] scale-95 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-10 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 brand-font italic text-black">Dealer's Description</h2>
              <p className="text-gray-600 leading-relaxed mb-10 text-lg font-light">
                {vehicle.description} This {vehicle.year} {vehicle.make} {vehicle.model} is a prime example of quality engineering. 
                Full 150-point inspection completed by our certified technicians. 
                Wholesale pricing available to the public. Don't miss out on this pristine {vehicle.bodyType.toLowerCase()}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-[#D4AF37]/30 transition-colors">
                    <CheckCircle2 className="text-green-500 group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-sm font-bold uppercase tracking-widest text-zinc-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specs */}
            <div className="bg-white p-10 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-10 brand-font italic text-black">Technical Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-12">
                {[
                  { label: 'Transmission', value: vehicle.transmission, icon: <Settings size={14} /> },
                  { label: 'Engine', value: vehicle.engine, icon: <Gauge size={14} /> },
                  { label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} KM`, icon: <Gauge size={14} /> },
                  { label: 'Fuel Type', value: vehicle.fuelType, icon: <Fuel size={14} /> },
                  { label: 'Exterior', value: vehicle.exteriorColor, icon: <Palette size={14} /> },
                  { label: 'Interior', value: vehicle.interiorColor, icon: <Palette size={14} /> },
                  { label: 'VIN Identity', value: vehicle.vin, isMono: true },
                  { label: 'Stock Reference', value: vehicle.stockNumber },
                  { label: 'Body Category', value: vehicle.bodyType }
                ].map((spec, idx) => (
                  <div key={idx} className="group">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2 flex items-center gap-2 group-hover:text-[#D4AF37] transition-colors">
                      {spec.icon} {spec.label}
                    </p>
                    <p className={`font-bold text-black ${spec.isMono ? 'font-mono text-xs' : 'text-sm font-display'}`}>{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 print:hidden">
            <div className="sticky top-40 space-y-6">
              <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 gold-gradient opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h1 className="text-3xl font-bold mb-2 brand-font text-black">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
                <p className="text-[#D4AF37] font-black mb-10 uppercase tracking-[0.4em] text-[10px]">{vehicle.trim}</p>
                
                <div className="mb-10">
                  <span className="text-5xl font-black gold-text display-font">
                    {typeof vehicle.price === 'number' ? `$${vehicle.price.toLocaleString()}` : vehicle.price}
                  </span>
                  <div className="flex items-center gap-2 mt-4 cursor-pointer group" onClick={() => setIsFeeInfoOpen(true)}>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] group-hover:text-black transition-colors underline decoration-dotted">Wholesale Access Fee: $799</p>
                    <Info size={12} className="text-[#D4AF37]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Link 
                    to={`/apply?vehicleId=${vehicle.id}`} 
                    className="block w-full text-center bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#D4AF37] hover:text-black transition-all shadow-xl"
                  >
                    Initiate Approval
                  </Link>
                  <Link 
                    to={`/contact?vehicleId=${vehicle.id}`} 
                    className="block w-full text-center bg-white text-black py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] border-2 border-black hover:bg-black hover:text-white transition-all shadow-md"
                  >
                    Direct Inquiry
                  </Link>
                </div>

                <div className="mt-12 pt-10 border-t border-zinc-100 space-y-6">
                   <a href="tel:6047121994" className="flex items-center gap-5 text-sm font-bold text-black hover:text-[#D4AF37] transition-colors group">
                     <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors"><Phone size={20} /></div>
                     (604) 712-1994
                   </a>
                   <div className="flex items-center gap-5 text-sm font-bold text-black group">
                     <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors"><MessageSquare size={20} /></div>
                     24/7 Digital Concierge
                   </div>
                </div>
              </div>

              <div className="bg-black text-white p-12 rounded-[40px] shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 gold-gradient opacity-10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>
                <h3 className="text-xl font-bold mb-6 brand-font italic text-[#D4AF37]">Budget Analysis</h3>
                <p className="text-4xl font-black text-white mb-2 display-font">${(typeof vehicle.price === 'number' ? (vehicle.price * 0.02) : 0).toFixed(0)}<span className="text-sm font-medium text-white/40"> /mo</span></p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] mb-10 font-bold">Subject to 5.99% APR & OAC</p>
                <Link to={`/calculator?price=${vehicle.price}`} className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.5em] group/link text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2">
                  CALCULATE TERMS <ArrowRight className="group-hover/link:translate-x-3 transition-transform" size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Transparency Modal */}
      {isFeeInfoOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-white max-w-lg w-full rounded-[40px] overflow-hidden shadow-3xl relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setIsFeeInfoOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-black"
              >
                <X size={28} />
              </button>
              
              <div className="bg-zinc-950 p-12 text-center relative overflow-hidden">
                 <div className="absolute inset-0 gold-gradient opacity-10"></div>
                 <h2 className="text-3xl font-black brand-font italic text-white relative z-10 mb-2">Transparency Hub</h2>
                 <p className="text-[#D4AF37] font-black uppercase tracking-[0.5em] text-[10px] relative z-10">Wholesale Access Fee Disclosure</p>
              </div>
              
              <div className="p-12 space-y-8">
                 <p className="text-zinc-500 text-sm leading-relaxed text-center">Our fixed $799 Wholesale Access & Documentation fee ensures the highest safety standards in BC. This is not profit; it covers:</p>
                 
                 <div className="space-y-4">
                    {[
                      { icon: <ShieldCheck size={18} />, label: "150-Point Safety Certification" },
                      { icon: <Search size={18} />, label: "Comprehensive Lien & History Audit" },
                      { icon: <FileCheck size={18} />, label: "MVA Title & Transfer Processing" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-5 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                         <div className="text-[#D4AF37]">{item.icon}</div>
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">{item.label}</span>
                      </div>
                    ))}
                 </div>

                 <button 
                    onClick={() => setIsFeeInfoOpen(false)}
                    className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-xl hover:bg-[#D4AF37] hover:text-black transition-all"
                 >
                   Acknowledge & Close
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;
