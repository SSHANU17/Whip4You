
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Send, CheckCircle2 } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const isSubscribed = localStorage.getItem('w4y_subscribed') === 'true';
    if (isSubscribed) setSubscribed(true);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      localStorage.setItem('w4y_subscribed', 'true');
      setTimeout(() => {
        // Reset local visual state to show success but stay subscribed in storage
        setEmail('');
      }, 5000);
    }
  };

  return (
    <footer className="bg-black text-white pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          
          <div className="lg:col-span-4">
            <Link to="/" className="text-3xl font-black brand-font mb-8 block tracking-[0.2em]">WHIP<span className="text-[#D4AF37]">4</span>YOU</Link>
            <p className="text-zinc-500 leading-relaxed mb-10 font-light text-sm max-w-sm">
              The benchmark for premium pre-owned luxury. Direct wholesale access, uncompromised quality, and transparent BC-wide service since 2018.
            </p>
            <div className="flex gap-5">
              <a href="#" className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition-all group">
                <Facebook size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition-all group">
                <Instagram size={20} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px] mb-8">Navigation</h4>
            <ul className="flex flex-col gap-4 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <li><Link to="/inventory" className="hover:text-white transition-colors">Fleet Hub</Link></li>
              <li><Link to="/finance" className="hover:text-white transition-colors">Financing</Link></li>
              <li><Link to="/trade-in" className="hover:text-white transition-colors">Trade Appraisal</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Our Legacy</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Data Privacy</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px] mb-8">Contact Hub</h4>
            <div className="flex flex-col gap-6 text-zinc-400">
              <a href="tel:6047121994" className="flex items-center gap-4 hover:text-white group">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors"><Phone size={16} /></div>
                <span className="text-xs font-bold">(604) 712-1994</span>
              </a>
              <a href="mailto:info@whip4you.ca" className="flex items-center gap-4 hover:text-white group">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors"><Mail size={16} /></div>
                <span className="text-xs font-bold">info@whip4you.ca</span>
              </a>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0"><MapPin size={16} /></div>
                <span className="text-xs font-bold leading-relaxed">102-20771 Langley Bypass,<br />Langley, BC V3A 5E8</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px] mb-8">Newsletter</h4>
            <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-light">Join our elite list for wholesale inventory drops before they hit the public market.</p>
            {subscribed ? (
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-5 rounded-2xl flex items-center gap-4 text-[#D4AF37] animate-in zoom-in duration-300">
                <CheckCircle2 size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Digital Asset Access Active</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative group">
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER DIGITAL IDENTITY" 
                  className="w-full bg-zinc-900 border border-white/5 p-5 pr-14 rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-[10px] font-black uppercase tracking-widest placeholder:text-zinc-700"
                />
                <button type="submit" className="absolute right-3 top-3 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-[#D4AF37] transition-all group-focus-within:bg-[#D4AF37]">
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">
              © 2026 WHIP4YOU MOTOR GROUP. ALL RIGHTS RESERVED.
            </p>
            <p className="text-zinc-800 text-[8px] font-bold uppercase tracking-widest">
              DEALER DOCUMENTATION FEE ($799) • BC DEALER LICENSE #40321
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Privacy Hub</Link>
            <div className="flex items-center gap-3">
              <span className="text-zinc-800 text-[8px] font-black uppercase tracking-widest">Engine by</span>
              <div className="bg-white px-2 py-0.5 rounded shadow-lg">
                <span className="text-black font-black italic tracking-tighter text-[10px] display-font">Pranav.dev</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
