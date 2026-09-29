
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, CircleDollarSign, Clock, Users,
  ChevronRight, Instagram, Send, Search, ArrowRightLeft, 
  CheckCircle2, MessageSquare
} from 'lucide-react';
import { api } from '../api.ts';
import { imageSrcSet } from '../utils/images.ts';
import InstagramCard from '../components/InstagramCard.tsx';

const HOME_BODY_TYPES = [
  { name: 'Sedan', size: 'md', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=400' },
  { name: 'Coupe', size: 'md', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=400' },
  { name: 'SUV', size: 'lg', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Hatchback', size: 'sm', image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400' },
  { name: 'Mini-Van', size: 'lg', image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=400' },
  { name: 'Truck', size: 'lg', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=400' }
];

// ─── Infinite Auto-Scrolling Marquee ─────────────────────────────────────────
const InstagramMarquee: React.FC<{ track: string[] }> = ({ track }) => {
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = scrollRef.current?.scrollLeft ?? 0;
    setPaused(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !scrollRef.current) return;
    scrollRef.current.scrollLeft = dragStartScroll.current - (e.clientX - dragStartX.current);
  };
  const onPointerUp = () => { dragging.current = false; };

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none ig-scroll-host"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { if (!dragging.current) setPaused(false); }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 1200)}
      aria-label="Instagram post carousel"
      role="region"
    >
      <div className={`ig-track flex gap-5 py-5 px-3 w-max${paused ? ' paused' : ''}`}>
        {track.map((url, i) => (
          <InstagramCard key={`${url}-${i}`} postUrl={url} />
        ))}
      </div>
    </div>
  );
};

const Home: React.FC = () => {

  const navigate = useNavigate();
  const [formType, setFormType] = useState<'General' | 'Car Finder' | 'Trade-In'>('General');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('w4u_config_cache') || 'null')?.data ?? null;
    } catch {
      return null;
    }
  });
  const [configLoaded, setConfigLoaded] = useState(() => config !== null);

  const instagramPosts: string[] = Array.isArray(config?.instagramPosts)
    ? config.instagramPosts.filter((url: unknown): url is string => typeof url === 'string' && url.trim().length > 0)
    : [];

  useEffect(() => {
    api.getConfig()
      .then((siteConfig) => setConfig(siteConfig))
      .catch((error) => console.error('Failed to load site configuration', error))
      .finally(() => setConfigLoaded(true));
  }, []);

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
        message: data.message as string,
        details: formType !== 'General' ? data : {}
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to transmit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[78svh] md:min-h-[90vh] bg-black overflow-hidden py-24 md:py-0">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=70&w=1280" srcSet="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=65&w=640 640w, https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=70&w=1280 1280w, https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=70&w=1800 1800w" sizes="100vw" fetchPriority="high" className="w-full h-full object-cover opacity-50 scale-105" alt="Premium pre-owned sports car available at Whip4You in Surrey, BC" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 h-full flex flex-col justify-center relative z-10">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 sm:mb-8 max-w-4xl leading-[0.9] brand-font italic reveal-text">
            {config?.heroHeadline || 'DRIVING DREAMS'}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-12 max-w-xl leading-relaxed font-light tracking-wide">
            Wholesale prices direct to the public. Premium pre-owned vehicles starting with interest rates from <span className="text-white font-bold">{config?.promoRate || '5.99'}%</span>.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link to="/inventory" className="bg-[#D4AF37] text-black px-8 sm:px-12 py-4 sm:py-5 rounded-full font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[11px] sm:text-xs hover:bg-white transition-all transform hover:scale-105 shadow-2xl">Explore Fleet</Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-10 md:mb-20 brand-font italic">Select Body Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {HOME_BODY_TYPES.map((type) => (
              <div key={type.name} onClick={() => navigate(`/inventory?bodyType=${type.name}`)} className="bg-black p-5 sm:p-8 md:p-10 rounded-[28px] sm:rounded-[40px] border border-white/5 hover:border-[#D4AF37]/50 cursor-pointer group transition-all overflow-hidden flex flex-col items-center justify-center">
                <div className={`relative mb-4 sm:mb-6 overflow-hidden rounded-2xl group-hover:scale-110 transition-transform duration-300 ${
                  type.size === 'lg' ? 'w-20 h-16 sm:w-28 sm:h-20' : 
                  type.size === 'sm' ? 'w-16 h-14 sm:w-20 sm:h-16' : 
                  'w-18 h-14 sm:w-24 sm:h-18'
                }`}>
                  <img 
                    src={type.image} 
                    loading="lazy"
                    alt={type.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <h3 className="font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] text-zinc-500 group-hover:text-white text-center">{type.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-14 md:mb-24">
             <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full mb-10 border border-white/10">
                <div className={`w-2.5 h-2.5 rounded-full ${config?.specialistStatus === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/70">Specialists {config?.specialistStatus || 'Offline'}</span>
             </div>
             <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 brand-font italic">Inquiry Center</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {submitted ? (
              <div className="bg-white p-8 sm:p-12 md:p-32 rounded-[36px] md:rounded-[60px] text-center shadow-3xl">
                <CheckCircle2 size={48} className="mx-auto mb-10 text-[#D4AF37]" />
                <h3 className="text-4xl md:text-5xl font-black text-black mb-6 brand-font italic uppercase">Acknowledge</h3>
                <p className="text-zinc-500 text-base md:text-lg mb-10 md:mb-16 font-light">Your request has reached the hub. Our team will mobilize shortly.</p>
                <button onClick={() => setSubmitted(false)} className="bg-black text-white px-10 sm:px-16 py-4 sm:py-5 rounded-full font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] hover:bg-[#D4AF37]">New Request</button>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 md:p-20 rounded-[36px] md:rounded-[60px] shadow-3xl">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                    <input name="name" required placeholder="John Doe" className="w-full bg-zinc-100 border border-zinc-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-sm font-medium text-black caret-black placeholder:text-zinc-500" />
                    <input name="email" required type="email" placeholder="john@example.com" className="w-full bg-zinc-100 border border-zinc-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-sm font-medium text-black caret-black placeholder:text-zinc-500" />
                    <input name="phone" required type="tel" placeholder="(778) 000-0000" className="w-full bg-zinc-100 border border-zinc-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-sm font-medium text-black caret-black placeholder:text-zinc-500" />
                  </div>
                  <textarea name="message" rows={4} className="w-full bg-zinc-100 border border-zinc-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-sm font-medium resize-none text-black caret-black placeholder:text-zinc-500" placeholder="Request specifics..."></textarea>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-black text-white py-5 sm:py-7 rounded-[24px] sm:rounded-[30px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-[11px] sm:text-xs hover:bg-[#D4AF37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'TRANSMITTING...' : 'TRANSMIT INQUIRY'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-zinc-950 text-white overflow-hidden">
        <div className="w-full">
          {instagramPosts.length > 0 ? (() => {
            const minCopies = Math.max(3, Math.ceil(1600 / (270 * instagramPosts.length)) + 1);
            const track = Array.from({ length: minCopies * 2 }, (_, i) => instagramPosts[i % instagramPosts.length]);
            return <InstagramMarquee track={track} />;
          })() : configLoaded ? (
            <p className="text-center text-zinc-500 text-sm tracking-wide py-8">Follow us on Instagram for the latest member experiences.</p>
          ) : (
            <div className="flex gap-5 px-4 overflow-hidden">
              {[1,2,3,4].map(i => (
                <div key={i} className="shrink-0 w-[250px] h-[370px] animate-pulse rounded-[22px] border-2 border-[rgba(212,175,55,0.3)] bg-zinc-900" />
              ))}
            </div>
          )}
        </div>
        <style>{`
          @keyframes ig-scroll {
            from { transform: translate3d(0,0,0); }
            to   { transform: translate3d(-50%,0,0); }
          }
          .ig-track {
            animation: ig-scroll 36s linear infinite;
            will-change: transform;
            backface-visibility: hidden;
          }
          .ig-track.paused { animation-play-state: paused !important; }
          .ig-scroll-host::-webkit-scrollbar { display: none !important; }
          @media (prefers-reduced-motion: reduce) { .ig-track { animation: none; } }
        `}</style>
      </section>
    </div>
  );
};

export default Home;
