
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import Inventory from './pages/Inventory.tsx';
import LoanCalculator from './pages/LoanCalculator.tsx';
import Finance from './pages/Finance.tsx';
import VehicleDetails from './pages/VehicleDetails.tsx';
import Contact from './pages/Contact.tsx';
import About from './pages/About.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import Privacy from './pages/Privacy.tsx';
import { ENGINE_SOUND_URL } from './constants.tsx';
import { Play, Loader2 } from 'lucide-react';
import BrandLogo from './components/BrandLogo.tsx';

const ENTRY_GATE_STORAGE_KEY = 'w4u_has_entered_site';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/apply') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

const ENTRY_SLIDES = [
  // Black & White Luxury Car
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=2000",
  // Majestic Horse (Symbolizing Horsepower/Luxury)
  "https://images.unsplash.com/photo-1598974357851-98166a939711?auto=format&fit=crop&q=80&w=2000",
  // Modern Supercar B&W
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000",
  // Golden/Black Abstract Horse
  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=2000",
  // Classic Porsche B&W
  "https://images.unsplash.com/photo-1542362567-b052cb1301c6?auto=format&fit=crop&q=80&w=2000"
];

interface AppFrameProps {
  hasInteracted: boolean;
  isStarting: boolean;
  currentSlide: number;
  startEngine: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPrevSlide: () => void;
  onNextSlide: () => void;
}

const AppFrame: React.FC<AppFrameProps> = ({
  hasInteracted,
  isStarting,
  currentSlide,
  startEngine,
  audioRef,
  onPrevSlide,
  onNextSlide
}) => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname === '/admin';
  const showEntryGate = !hasInteracted && !isAdminRoute;

  return (
    <>
      <ScrollToTop />
      {showEntryGate && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-1000 overflow-hidden min-h-[100dvh]">
          {/* Background Carousel */}
          <div className="absolute inset-0 z-0">
            {ENTRY_SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                  currentSlide === index ? 'opacity-40' : 'opacity-0'
                }`}
              >
                <img
                  src={slide}
                  className={`w-full h-full object-cover grayscale brightness-50 transition-transform duration-[10000ms] ease-linear ${
                    currentSlide === index ? 'scale-110' : 'scale-100'
                  }`}
                  alt={`Slide ${index}`}
                />
                {(index === 1 || index === 3) && (
                  <div className="absolute inset-0 bg-[#D4AF37]/10 mix-blend-color"></div>
                )}
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black"></div>
            <div className="absolute inset-0 bg-radial-gradient(circle, transparent 20%, black 100%) opacity-60"></div>
          </div>

          {/* carousel arrows for manual control */}
          <button
            onClick={onPrevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 rounded-full p-2"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onNextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 rounded-full p-2"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-1000">
            <BrandLogo className="h-28 w-28 sm:h-40 sm:w-40 md:h-52 md:w-52 mb-6 sm:mb-8 animate-pulse drop-shadow-[0_0_40px_rgba(212,175,55,0.28)]" />
            <p className="text-[#D4AF37] font-black uppercase tracking-[0.35em] sm:tracking-[0.5em] text-[9px] md:text-sm mb-6 text-center">WHIP4YOU PREMIUM</p>

            <div className="h-24 flex flex-col items-center justify-center gap-6">
              {!isStarting ? (
                <button
                  onClick={startEngine}
                  className="group relative flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                     <Play size={36} fill="currentColor" className="ml-1" />
                  </div>
                  <span className="text-white font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-[9px] md:text-[11px] drop-shadow-lg text-center">Ignite Engine & Enter</span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="text-[#D4AF37] animate-spin" size={32} />
                  <span className="text-[#D4AF37] font-black uppercase tracking-widest text-[10px] animate-pulse">Synchronizing Gears...</span>
                </div>
              )}
            </div>
          </div>
          <audio ref={audioRef} src={ENGINE_SOUND_URL} preload="auto" />
        </div>
      )}

      <div className={`flex flex-col min-h-screen ${showEntryGate ? 'hidden' : 'animate-in fade-in duration-1000'}`}>
        {!isAdminRoute && <Navbar />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/calculator" element={<LoanCalculator />} />
            <Route path="/apply" element={<Finance />} />
            <Route path="/car-finder" element={<Contact type="Car Finder" />} />
            <Route path="/trade-in" element={<Contact type="Trade-In" />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/directions" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [hasInteracted, setHasInteracted] = useState(
    () => localStorage.getItem(ENTRY_GATE_STORAGE_KEY) === 'true'
  );
  const [isStarting, setIsStarting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // manual navigation helpers for carousel arrows
  const goNext = () => {
    setCurrentSlide((prev) => (prev + 1) % ENTRY_SLIDES.length);
  };
  const goPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + ENTRY_SLIDES.length) % ENTRY_SLIDES.length);
  };

  useEffect(() => {
    if (!hasInteracted) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % ENTRY_SLIDES.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [hasInteracted]);

  const startEngine = () => {
    if (isStarting) return;
    setIsStarting(true);

    const enterSite = () => {
      localStorage.setItem(ENTRY_GATE_STORAGE_KEY, 'true');
      setHasInteracted(true);
    };

    if (audioRef.current) {
      audioRef.current.volume = 0.6;
      audioRef.current.play()
        .then(() => {
          setTimeout(enterSite, 800);
        })
        .catch(err => {
          console.error("Playback failed", err);
          enterSite();
        });
    } else {
      enterSite();
    }
  };

  return (
    <Router>
      <AppFrame
        hasInteracted={hasInteracted}
        isStarting={isStarting}
        currentSlide={currentSlide}
        startEngine={startEngine}
        audioRef={audioRef}
        onPrevSlide={goPrev}
        onNextSlide={goNext}
      />
    </Router>
  );
};

export default App;
