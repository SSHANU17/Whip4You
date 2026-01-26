
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, CircleDollarSign, Clock, Users, Star, 
  ChevronRight, Instagram, Send, Search, ArrowRightLeft, 
  CheckCircle2, MessageSquare
} from 'lucide-react';
import { BODY_TYPES } from '../constants.tsx';
import { api } from '../api.ts';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState<'General' | 'CarFinder' | 'TradeIn'>('General');
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    api.getReviews().then(setReviews);
    api.getConfig().then(setConfig);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await api.createLead({
        type: formType,
        name: data.name,
        phone: data.phone,
        message: data.message,
        details: formType !== 'General' ? data : {}
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="relative h-[90vh] bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-50 scale-105" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 h-full flex flex-col justify-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 max-w-4xl leading-[0.9] brand-font italic reveal-text">
            {config?.heroHeadline || 'DRIVING DREAMS'}
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-xl leading-relaxed font-light tracking-wide">
            Wholesale prices direct to the public. Premium pre-owned vehicles starting with interest rates from <span className="text-white font-bold">{config?.promoRate || '5.99'}%</span>.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link to="/inventory" className="bg-[#D4AF37] text-black px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all transform hover:scale-105 shadow-2xl">Explore Fleet</Link>
          </div>
        </div>
      </section>

      <section className="py-32 bg-zinc-950">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-20 brand-font italic">Select Body Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BODY_TYPES.map((type) => (
              <div key={type.name} onClick={() => navigate(`/inventory?bodyType=${type.name}`)} className="bg-black p-10 rounded-[40px] border border-white/5 hover:border-[#D4AF37]/50 cursor-pointer group transition-all">
                <div className="bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#D4AF37] transition-all text-[#D4AF37] group-hover:text-black group-hover:scale-110">
                  {type.icon}
                </div>
                <h3 className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-500 group-hover:text-white">{type.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-black relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
             <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full mb-10 border border-white/10">
                <div className={`w-2.5 h-2.5 rounded-full ${config?.specialistStatus === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/70">Specialists {config?.specialistStatus || 'Offline'}</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black text-white mb-6 brand-font italic">Inquiry Center</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {submitted ? (
              <div className="bg-white p-20 md:p-32 rounded-[60px] text-center shadow-3xl">
                <CheckCircle2 size={48} className="mx-auto mb-10 text-[#D4AF37]" />
                <h3 className="text-4xl md:text-5xl font-black text-black mb-6 brand-font italic uppercase">Acknowledge</h3>
                <p className="text-zinc-500 text-lg mb-16 font-light">Your request has reached the hub. Our team will mobilize shortly.</p>
                <button onClick={() => setSubmitted(false)} className="bg-black text-white px-16 py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#D4AF37]">New Request</button>
              </div>
            ) : (
              <div className="bg-white p-8 md:p-20 rounded-[60px] shadow-3xl">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <input name="name" required placeholder="John Doe" className="w-full bg-zinc-50 p-6 rounded-3xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium text-black placeholder:text-zinc-400" />
                    <input name="phone" required type="tel" placeholder="(604) 000-0000" className="w-full bg-zinc-50 p-6 rounded-3xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium text-black placeholder:text-zinc-400" />
                  </div>
                  <textarea name="message" rows={4} className="w-full bg-zinc-50 p-6 rounded-3xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium resize-none text-black placeholder:text-zinc-400" placeholder="Request specifics..."></textarea>
                  <button type="submit" className="w-full bg-black text-white py-7 rounded-[30px] font-black uppercase tracking-[0.5em] text-xs hover:bg-[#D4AF37] transition-all">TRANSMIT INQUIRY</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-32 bg-zinc-950 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-24 brand-font italic uppercase">Member Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {reviews.map((review, i) => (
              <div key={i} className="bg-black p-12 rounded-[50px] border border-white/5 text-left group relative overflow-hidden">
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? '#D4AF37' : 'none'} className={i < review.rating ? 'text-[#D4AF37]' : 'text-zinc-800'} />)}
                </div>
                <p className="text-zinc-400 mb-10 text-lg font-light italic">"{review.text}"</p>
                <h4 className="font-black uppercase tracking-[0.2em] text-sm">{review.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
