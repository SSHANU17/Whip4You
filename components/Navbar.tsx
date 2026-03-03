
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, MapPin, Facebook, Instagram, Heart } from 'lucide-react';
import GarageDrawer from './GarageDrawer.tsx';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const updateFavCount = () => {
    const favorites = JSON.parse(localStorage.getItem('w4y_favorites') || '[]');
    setFavCount(favorites.length);
  };

  useEffect(() => {
    updateFavCount();
    window.addEventListener('storage', updateFavCount);
    window.addEventListener('favoritesUpdated', updateFavCount);
    return () => {
      window.removeEventListener('storage', updateFavCount);
      window.removeEventListener('favoritesUpdated', updateFavCount);
    };
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { 
      name: 'Inventory', 
      path: '/inventory',
      sub: [
        { name: 'Browse Used Inventory', path: '/inventory' },
        { name: 'Car Finder', path: '/car-finder' },
        { name: 'Trade-In Appraisal', path: '/trade-in' }
      ]
    },
    { 
      name: 'Finance', 
      path: '/finance',
      sub: [
        { name: 'Financing Info', path: '/finance' },
        { name: 'Car Loan Calculator', path: '/calculator' },
        { name: 'Apply For Credit', path: '/apply' }
      ]
    },
    { name: 'Trade-In', path: '/trade-in' },
    { 
      name: 'Dealership', 
      path: '/about',
      sub: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Directions', path: '/directions' }
      ]
    }
  ];

  return (
    <>
      <nav className="bg-black text-white sticky top-0 z-[1000] shadow-2xl border-b border-white/5 backdrop-blur-md bg-opacity-95">
        <div className="bg-zinc-950 py-2 hidden md:block border-b border-white/5">
          <div className="container mx-auto px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            <div className="flex gap-10">
              <a href="tel:7789706007" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={12} className="text-[#D4AF37]" /> (778) 970-6007
              </a>
              <a href="/directions" className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin size={12} className="text-[#D4AF37]" /> Langley Bypass, BC
              </a>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#D4AF37] transition-all hover:scale-110"><Facebook size={14} /></a>
              <a href="#" className="hover:text-[#D4AF37] transition-all hover:scale-110"><Instagram size={14} /></a>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="gold-gradient p-1 rounded-full transition-transform duration-500 group-hover:rotate-[360deg]">
              <div className="bg-black p-1.5 rounded-full">
                <span className="text-xl font-black tracking-tighter brand-font italic block w-8 h-8 flex items-center justify-center">W4Y</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-[0.2em] brand-font">WHIP<span className="text-[#D4AF37]">4</span>YOU</span>
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-[#D4AF37] leading-none">Premium Motors</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <Link 
                  to={item.path} 
                  className="flex items-center gap-1.5 font-bold hover:text-[#D4AF37] transition-colors py-2 uppercase text-[11px] tracking-[0.2em]"
                >
                  {item.name} {item.sub && <ChevronDown size={10} className="text-[#D4AF37]" />}
                </Link>
                {item.sub && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-4 hidden group-hover:block w-64 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-zinc-950 border border-white/10 shadow-3xl rounded-2xl overflow-hidden p-2">
                      {item.sub.map((sub) => (
                        <Link 
                          key={sub.name} 
                          to={sub.path} 
                          className="block px-6 py-3.5 hover:bg-[#D4AF37] hover:text-black rounded-xl transition-all text-[10px] font-bold uppercase tracking-[0.2em] mb-1 last:mb-0"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <button 
              onClick={() => setIsGarageOpen(true)}
              className="relative p-2 text-white hover:text-[#D4AF37] transition-colors flex items-center gap-2 group"
            >
              <Heart size={20} className={favCount > 0 ? 'fill-[#D4AF37] text-[#D4AF37]' : ''} />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {favCount}
                </span>
              )}
            </button>

            <Link to="/contact" className="ml-4 bg-[#D4AF37] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.25em] hover:bg-white transition-all transform hover:scale-105 shadow-[0_10px_20px_-5px_rgba(212,175,55,0.4)]">
              Text Us
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setIsGarageOpen(true)}
              className="relative p-2 text-[#D4AF37]"
            >
              <Heart size={24} className={favCount > 0 ? 'fill-[#D4AF37]' : ''} />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </button>
            <button className="text-[#D4AF37] p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-black h-screen fixed inset-0 z-50 top-0 overflow-y-auto animate-in fade-in duration-300">
            <div className="flex flex-col p-10 gap-8">
              <div className="flex justify-between items-center mb-10">
                 <span className="text-2xl font-bold tracking-[0.2em] brand-font">WHIP<span className="text-[#D4AF37]">4</span>YOU</span>
                 <button onClick={() => setIsOpen(false)} className="text-white"><X size={32} /></button>
              </div>
              {navItems.map((item) => (
                <div key={item.name} className="border-b border-white/5 pb-6">
                  <div 
                    className="flex justify-between items-center text-xl font-bold uppercase tracking-[0.3em] brand-font"
                    onClick={() => setActiveSub(activeSub === item.name ? null : item.name)}
                  >
                    <Link to={item.path} onClick={() => !item.sub && setIsOpen(false)} className="hover:text-[#D4AF37] transition-colors">{item.name}</Link>
                    {item.sub && <ChevronDown className={`text-[#D4AF37] transition-transform duration-300 ${activeSub === item.name ? 'rotate-180' : ''}`} />}
                  </div>
                  {item.sub && activeSub === item.name && (
                    <div className="mt-6 flex flex-col gap-4 pl-4 border-l border-[#D4AF37]/30">
                      {item.sub.map((sub) => (
                        <Link 
                          key={sub.name} 
                          to={sub.path} 
                          onClick={() => setIsOpen(false)}
                          className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] hover:text-[#D4AF37] transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link 
                to="/contact" 
                onClick={() => setIsOpen(false)}
                className="bg-[#D4AF37] text-black text-center py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-xs shadow-xl"
              >
                Contact Specialist
              </Link>
            </div>
          </div>
        )}
      </nav>
      <GarageDrawer isOpen={isGarageOpen} onClose={() => setIsGarageOpen(false)} />
    </>
  );
};

export default Navbar;
