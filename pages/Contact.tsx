
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, 
  Send, Car, ArrowRightLeft, Search,
  CheckCircle2, MessageSquare, ExternalLink,
  Facebook, Instagram, Youtube, Navigation,
  Info, Sparkles, TrendingUp
} from 'lucide-react';
import { api } from '../api.ts';
import { Vehicle } from '../types.ts';

interface ContactProps {
  type?: 'General' | 'Car Finder' | 'Trade-In';
}

const Contact: React.FC<ContactProps> = ({ type = 'General' }) => {
  const [searchParams] = useSearchParams();
  const [formType, setFormType] = useState(type);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [vehicleContext, setVehicleContext] = useState<Vehicle | null>(null);
  
  // Trade-In Simulation State
  const [tradeModel, setTradeModel] = useState('');
  const [tradeYear, setTradeYear] = useState('');
  const [appraisalRange, setAppraisalRange] = useState<{min: number, max: number} | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 11 && hour < 20) {
      setIsLive(true);
    }
    
    // Check for vehicle ID in URL
    const vId = searchParams.get('vehicleId');
    if (vId) {
      api.getVehicleById(vId).then(v => {
        if (v) setVehicleContext(v);
      }).catch(err => console.error(err));
    }

    setFormType(type);
  }, [type, searchParams]);

  // Appraisal Simulation Logic
  useEffect(() => {
    if (formType === 'Trade-In' && tradeModel.length > 3 && tradeYear.length === 4) {
      const baseValue = Math.random() * (45000 - 8000) + 8000;
      setAppraisalRange({
        min: Math.floor(baseValue * 0.9),
        max: Math.floor(baseValue * 1.1)
      });
    } else {
      setAppraisalRange(null);
    }
  }, [tradeModel, tradeYear, formType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      await api.createLead({
        type: formType,
        name: data.name as string,
        email: data.email as string,
        phone: data.phone as string,
        message: (data.message as string) || (vehicleContext ? `Interested in ${vehicleContext.year} ${vehicleContext.make}` : ''),
        details: {
          ...data,
          vehicleId: vehicleContext?._id || vehicleContext?.id,
          appraisalRange: appraisalRange
        }
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Lead submission failed', err);
      alert(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 md:p-24 rounded-[40px] md:rounded-[60px] shadow-[0_0_100px_rgba(212,175,55,0.1)] max-w-2xl border border-gray-100">
          <div className="w-24 h-24 md:w-32 md:h-32 gold-gradient text-black rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-2xl animate-bounce">
            <CheckCircle2 size={48} className="md:w-16 md:h-16" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 brand-font italic text-black">Engines Started!</h2>
          <p className="text-gray-500 mb-8 md:mb-12 text-base md:text-xl leading-relaxed">
            Your inquiry {vehicleContext ? `for the ${vehicleContext.year} ${vehicleContext.make}` : ''} has been prioritized. Expect a response within <span className="text-black font-bold">15 minutes</span>.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="group relative bg-black text-white px-10 md:px-16 py-4 md:py-5 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs hover:bg-[#D4AF37] hover:text-black transition-all overflow-hidden"
          >
            <span className="relative z-10">New Inquiry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen pb-24">
      {/* Immersive Hero */}
      <section className="relative min-h-[400px] md:min-h-[450px] py-24 md:py-32 bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1562141982-c1a7459e4261?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-30 grayscale"
            alt="Contact Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-off-white via-transparent to-black/90"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full mb-8 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
              {isLive ? 'Sales Team Live Now' : 'Concierge Offline'}
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-6 brand-font italic tracking-tighter leading-none">Connect.</h1>
          <p className="text-[#D4AF37] font-bold uppercase tracking-[0.6em] text-[10px] md:text-sm">Experience Whip4You Premium</p>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-12 md:-mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 space-y-6">
            <a href="tel:7789706007" className="block group">
              <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-xl hover:shadow-2xl transition-all border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors shrink-0">
                    <Phone size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Call Hub</h4>
                    <p className="text-lg md:text-xl font-bold group-hover:text-[#D4AF37] transition-colors truncate font-display text-black">(778) 970-6007</p>
                  </div>
                </div>
              </div>
            </a>

            <div className="bg-black text-white p-8 md:p-10 rounded-[30px] md:rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 gold-gradient opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <h3 className="text-2xl font-bold mb-8 brand-font italic text-[#D4AF37]">The Showroom</h3>
               <div className="space-y-6 md:space-y-8">
                  <div className="flex gap-4">
                    <MapPin className="text-[#D4AF37] flex-shrink-0" size={24} />
                    <p className="text-gray-300 leading-relaxed text-sm">
                      102-20771 Langley Bypass,<br />
                      Langley, BC V3A 5E8
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Clock className="text-[#D4AF37] flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-sm">7 Days A Week</p>
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest">11:00 AM - 8:00 PM</p>
                    </div>
                  </div>
               </div>
               <a 
                 href="https://www.google.com/maps/dir//102-20771+Langley+Bypass,+Langley,+BC+V3A+5E8" 
                 target="_blank" 
                 className="mt-10 md:mt-12 flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] transition-all shadow-lg"
               >
                 <Navigation size={16} /> Get Directions
               </a>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-6 md:p-16 rounded-[40px] md:rounded-[60px] shadow-2xl border border-gray-100">
              {vehicleContext && (
                <div className="bg-zinc-50 p-6 rounded-[28px] border border-zinc-200 mb-10 flex items-center gap-6 animate-in slide-in-from-left duration-500">
                   <img src={vehicleContext.images[0]} className="w-24 h-24 object-cover rounded-2xl shadow-md border-2 border-white" alt="" />
                   <div>
                     <span className="text-[#D4AF37] font-black uppercase tracking-[0.3em] text-[8px] mb-1 block">Active Interest</span>
                     <h3 className="text-xl font-bold brand-font text-black">{vehicleContext.year} {vehicleContext.make} {vehicleContext.model}</h3>
                     <p className="text-[10px] text-gray-400 uppercase tracking-widest">Stock: {vehicleContext.stockNumber}</p>
                   </div>
                </div>
              )}

              <div className="mb-10 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 brand-font italic text-black">Inquiry Center</h2>
                <p className="text-sm md:text-base text-gray-400">Our concierge team will respond within minutes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-10 md:mb-12 bg-gray-50 p-2 rounded-[24px] md:rounded-[32px]">
                {[
                  { id: 'General', label: 'General', icon: <Send size={14} /> },
                  { id: 'Car Finder', label: 'Finder', icon: <Search size={14} /> },
                  { id: 'Trade-In', label: 'Trade-In', icon: <ArrowRightLeft size={14} /> }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setFormType(tab.id as any)}
                    className={`flex items-center justify-center gap-3 px-4 py-4 rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-widest text-[9px] transition-all ${formType === tab.id ? 'bg-black text-[#D4AF37] shadow-xl' : 'text-gray-400 hover:text-black'}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Identity</label>
                    <input name="name" required type="text" placeholder="Your Name" className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm text-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Email Address</label>
                    <input name="email" required type="email" placeholder="john@example.com" className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm text-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Mobile</label>
                    <input name="phone" required type="tel" placeholder="(778) 000-0000" className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm text-black" />
                  </div>
                </div>

                {formType === 'Trade-In' && (
                  <div className="bg-zinc-50 p-8 rounded-[35px] border border-zinc-200 animate-in slide-in-from-top-6 duration-500">
                     <h4 className="font-bold mb-8 uppercase tracking-[0.4em] text-[10px] flex items-center gap-4 text-black">
                        <TrendingUp size={14} className="text-[#D4AF37]" /> Live Appraisal Simulator
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <input 
                          placeholder="Vehicle Year" 
                          value={tradeYear}
                          onChange={(e) => setTradeYear(e.target.value)}
                          className="bg-white p-5 rounded-2xl border border-zinc-100 text-sm outline-none text-black" 
                        />
                        <input 
                          placeholder="Make/Model" 
                          value={tradeModel}
                          onChange={(e) => setTradeModel(e.target.value)}
                          className="bg-white p-5 rounded-2xl border border-zinc-100 text-sm outline-none text-black" 
                        />
                     </div>

                     {appraisalRange ? (
                       <div className="bg-black text-white p-8 rounded-[25px] shadow-2xl animate-in zoom-in duration-300">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Instant Market Est.</span>
                            <Sparkles size={14} className="text-[#D4AF37] animate-pulse" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-bold brand-font italic gold-text">
                              ${appraisalRange.min.toLocaleString()} - ${appraisalRange.max.toLocaleString()}
                            </h3>
                          </div>
                          <p className="text-[9px] text-zinc-500 mt-4 uppercase tracking-[0.2em]">Based on current BC Wholesale auction data (OAC)</p>
                       </div>
                     ) : (
                       <div className="border-2 border-dashed border-zinc-200 p-8 rounded-[25px] flex flex-col items-center justify-center text-zinc-300">
                          <p className="text-[10px] font-bold uppercase tracking-widest">Enter details to generate estimate</p>
                       </div>
                     )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Details</label>
                  <textarea rows={4} className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm resize-none text-black" 
                    placeholder={vehicleContext ? `I'm interested in the ${vehicleContext.year} ${vehicleContext.make}. Is it still available for a test drive?` : "How can we help?"}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-black text-white py-6 rounded-3xl font-bold uppercase tracking-[0.5em] text-[10px] hover:bg-[#D4AF37] hover:text-black transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'TRANSMITTING...' : 'Send Transmission'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
