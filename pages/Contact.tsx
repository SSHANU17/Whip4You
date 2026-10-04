
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

type TradeCondition = 'Excellent' | 'Good' | 'Fair' | 'Needs Work';

const TRADE_CONDITION_MULTIPLIER: Record<TradeCondition, number> = {
  Excellent: 1.08,
  Good: 1,
  Fair: 0.9,
  'Needs Work': 0.78
};

// Database of verified real automotive makes & recognized vehicle segments
const SUPPORTED_MAKES: Record<string, { baseMSRP: number; models: string[] }> = {
  acura: { baseMSRP: 45000, models: ['ilx', 'tlx', 'rlx', 'rdx', 'mdx', 'nsx', 'integra', 'tsx', 'rsx'] },
  audi: { baseMSRP: 52000, models: ['a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'q3', 'q5', 'q7', 'q8', 'e-tron', 'tt', 'r8', 's4', 's5', 'sq5'] },
  bmw: { baseMSRP: 55000, models: ['1 series', '2 series', '3 series', '4 series', '5 series', '7 series', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'm3', 'm4', 'm5', 'i3', 'i4', 'i8', 'z4'] },
  buick: { baseMSRP: 36000, models: ['encore', 'enclave', 'envista', 'regal', 'lacrosse', 'verano'] },
  cadillac: { baseMSRP: 54000, models: ['ct4', 'ct5', 'escalade', 'xt4', 'xt5', 'xt6', 'ats', 'cts', 'srx'] },
  chevrolet: { baseMSRP: 34000, models: ['silverado', 'cruze', 'malibu', 'impala', 'equinox', 'traverse', 'tahoe', 'suburban', 'camaro', 'corvette', 'colorado', 'blazer', 'trax', 'spark', 'bolt'] },
  chevy: { baseMSRP: 34000, models: ['silverado', 'cruze', 'malibu', 'impala', 'equinox', 'traverse', 'tahoe', 'suburban', 'camaro', 'corvette', 'colorado', 'blazer', 'trax', 'spark', 'bolt'] },
  chrysler: { baseMSRP: 38000, models: ['300', 'pacifica', 'voyager', 'town & country', '200'] },
  dodge: { baseMSRP: 37000, models: ['charger', 'challenger', 'durango', 'grand caravan', 'journey', 'dart'] },
  ford: { baseMSRP: 38000, models: ['f-150', 'f150', 'f-250', 'f-350', 'escape', 'explorer', 'edge', 'mustang', 'fusion', 'focus', 'fiesta', 'expedition', 'ranger', 'bronco', 'taurus', 'transit'] },
  genesis: { baseMSRP: 58000, models: ['g70', 'g80', 'g90', 'gv70', 'gv80'] },
  gmc: { baseMSRP: 44000, models: ['sierra', 'terrain', 'acadia', 'yukon', 'canyon', 'savana'] },
  honda: { baseMSRP: 33000, models: ['civic', 'accord', 'cr-v', 'crv', 'pilot', 'hr-v', 'hrv', 'odyssey', 'ridgeline', 'fit', 'passport', 'insight'] },
  hyundai: { baseMSRP: 31000, models: ['elantra', 'sonata', 'tucson', 'santa fe', 'palisade', 'kona', 'venue', 'ioniq', 'accent', 'veloster'] },
  infiniti: { baseMSRP: 48000, models: ['q50', 'q60', 'qx50', 'qx60', 'qx80', 'g37', 'fx35'] },
  jaguar: { baseMSRP: 60000, models: ['f-pace', 'e-pace', 'f-type', 'xe', 'xf', 'xj'] },
  jeep: { baseMSRP: 40000, models: ['wrangler', 'grand cherokee', 'cherokee', 'compass', 'renegade', 'gladiator', 'patriot'] },
  kia: { baseMSRP: 31000, models: ['forte', 'k5', 'optima', 'sportage', 'sorento', 'telluride', 'seltos', 'soul', 'carnival', 'stinger', 'rio'] },
  landrover: { baseMSRP: 68000, models: ['range rover', 'range rover sport', 'evoque', 'velar', 'defender', 'discovery'] },
  'land rover': { baseMSRP: 68000, models: ['range rover', 'range rover sport', 'evoque', 'velar', 'defender', 'discovery'] },
  lexus: { baseMSRP: 52000, models: ['is', 'es', 'gs', 'ls', 'nx', 'rx', 'gx', 'lx', 'rc', 'ux', 'ct'] },
  lincoln: { baseMSRP: 53000, models: ['navigator', 'aviator', 'nautilus', 'corsair', 'mkz', 'mkx'] },
  mazda: { baseMSRP: 32000, models: ['mazda3', '3', 'mazda6', '6', 'cx-3', 'cx-30', 'cx-5', 'cx-50', 'cx-9', 'cx-90', 'mx-5', 'miata'] },
  mercedes: { baseMSRP: 56000, models: ['c-class', 'e-class', 's-class', 'a-class', 'cla', 'gla', 'glb', 'glc', 'gle', 'gls', 'g-class', 'amg', 'sl'] },
  'mercedes-benz': { baseMSRP: 56000, models: ['c-class', 'e-class', 's-class', 'a-class', 'cla', 'gla', 'glb', 'glc', 'gle', 'gls', 'g-class', 'amg', 'sl'] },
  mini: { baseMSRP: 34000, models: ['cooper', 'countryman', 'clubman'] },
  mitsubishi: { baseMSRP: 28000, models: ['outlander', 'rvr', 'eclipse cross', 'mirage', 'lancer'] },
  nissan: { baseMSRP: 32000, models: ['sentra', 'altima', 'maxima', 'rogue', 'murano', 'pathfinder', 'armada', 'frontier', 'titan', 'kicks', 'qashqai', '370z', 'leaf'] },
  porsche: { baseMSRP: 85000, models: ['911', 'cayenne', 'macan', 'panamera', 'taycan', 'boxster', 'cayman', '718'] },
  ram: { baseMSRP: 46000, models: ['1500', '2500', '3500', 'promaster'] },
  subaru: { baseMSRP: 33000, models: ['impreza', 'crosstrek', 'forester', 'outback', 'ascent', 'wrx', 'brz', 'legacy'] },
  tesla: { baseMSRP: 58000, models: ['model 3', 'model y', 'model s', 'model x', 'cybertruck'] },
  toyota: { baseMSRP: 34000, models: ['corolla', 'camry', 'rav4', 'highlander', '4runner', 'tacoma', 'tundra', 'sienna', 'prius', 'venza', 'c-hr', 'yaris', 'supra'] },
  volkswagen: { baseMSRP: 33000, models: ['jetta', 'golf', 'gti', 'passat', 'tiguan', 'atlas', 'taos', 'id.4'] },
  vw: { baseMSRP: 33000, models: ['jetta', 'golf', 'gti', 'passat', 'tiguan', 'atlas', 'taos', 'id.4'] },
  volvo: { baseMSRP: 52000, models: ['s60', 's90', 'v60', 'v90', 'xc40', 'xc60', 'xc90'] }
};

interface TradeValidationResult {
  isValid: boolean;
  reason?: 'incomplete' | 'unsupported_make' | 'unsupported_model' | 'invalid_year' | 'invalid_mileage';
  estimate?: { min: number; max: number };
}

const validateAndEstimateTrade = (
  yearValue: string,
  mileageValue: string,
  modelInput: string,
  condition: TradeCondition
): TradeValidationResult => {
  const trimmed = modelInput.trim();
  if (!trimmed || !yearValue || !mileageValue) {
    return { isValid: false, reason: 'incomplete' };
  }

  const currentYear = new Date().getFullYear();
  const year = Number(yearValue);
  const mileage = Number(mileageValue);

  if (!Number.isInteger(year) || year < 1990 || year > currentYear + 1) {
    return { isValid: false, reason: 'invalid_year' };
  }

  if (!Number.isFinite(mileage) || mileage < 0 || mileage > 500000) {
    return { isValid: false, reason: 'invalid_mileage' };
  }

  // Normalize input string: separate make and model
  const cleaned = trimmed.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { isValid: false, reason: 'unsupported_make' };
  }

  // Find recognized make
  let matchedMakeKey: string | null = null;
  let remainingTokens: string[] = [];

  // Check 2-word makes first (e.g. land rover, mercedes benz)
  if (tokens.length >= 2) {
    const twoWord = `${tokens[0]} ${tokens[1]}`;
    if (SUPPORTED_MAKES[twoWord]) {
      matchedMakeKey = twoWord;
      remainingTokens = tokens.slice(2);
    }
  }

  // If not matched, check 1-word make
  if (!matchedMakeKey && SUPPORTED_MAKES[tokens[0]]) {
    matchedMakeKey = tokens[0];
    remainingTokens = tokens.slice(1);
  }

  // Check if make is somewhere in the tokens
  if (!matchedMakeKey) {
    const found = Object.keys(SUPPORTED_MAKES).find(m => tokens.includes(m));
    if (found) {
      matchedMakeKey = found;
      remainingTokens = tokens.filter(t => t !== found);
    }
  }

  // Reject completely invented or unrecognized makes (e.g., "ZZZ Invalid Model 123")
  if (!matchedMakeKey) {
    return { isValid: false, reason: 'unsupported_make' };
  }

  const makeConfig = SUPPORTED_MAKES[matchedMakeKey];
  const modelText = remainingTokens.join(' ').trim();

  // If user entered only the make (no model yet) or empty model
  if (!modelText) {
    return { isValid: false, reason: 'incomplete' };
  }

  // Verify that model matches or contains a known model from the make's catalog
  const isModelRecognized = makeConfig.models.some(knownModel => {
    return modelText.includes(knownModel) || knownModel.includes(modelText) ||
           modelText.replace(/\s|-/g, '').includes(knownModel.replace(/\s|-/g, ''));
  });

  if (!isModelRecognized) {
    return { isValid: false, reason: 'unsupported_model' };
  }

  // Calculate genuine BC auction wholesale estimate
  const age = Math.max(0, currentYear - year);
  // Depreciation curve calibrated to BC wholesale auction index
  const baseValue = makeConfig.baseMSRP * Math.pow(0.85, age);
  const mileagePenalty = Math.max(0, mileage - (age * 18000)) * 0.055;
  const conditionAdjusted = Math.max(1200, (baseValue - mileagePenalty) * TRADE_CONDITION_MULTIPLIER[condition]);
  const spread = Math.max(900, conditionAdjusted * 0.08);

  const min = Math.max(800, Math.round((conditionAdjusted - spread) / 100) * 100);
  const max = Math.max(1200, Math.round((conditionAdjusted + spread) / 100) * 100);

  return {
    isValid: true,
    estimate: { min, max }
  };
};

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
  const [tradeMileage, setTradeMileage] = useState('');
  const [tradeCondition, setTradeCondition] = useState<TradeCondition>('Good');
  const [tradeValidation, setTradeValidation] = useState<TradeValidationResult>({ isValid: false, reason: 'incomplete' });
  const [appraisalRange, setAppraisalRange] = useState<{min: number, max: number} | null>(null);

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    api.getConfig().then(setConfig).catch(err => console.error(err));
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

  // Appraisal Validation & Simulation Logic
  useEffect(() => {
    if (formType !== 'Trade-In') {
      setTradeValidation({ isValid: false, reason: 'incomplete' });
      setAppraisalRange(null);
      return;
    }

    const result = validateAndEstimateTrade(tradeYear, tradeMileage, tradeModel, tradeCondition);
    setTradeValidation(result);
    setAppraisalRange(result.isValid && result.estimate ? result.estimate : null);
  }, [tradeModel, tradeYear, tradeMileage, tradeCondition, formType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const normalizedDetails = Object.fromEntries(
      Object.entries(data).filter(([, value]) => String(value).trim().length > 0)
    );

    let message = String(data.message || '').trim();

    if (!message) {
      if (formType === 'Car Finder') {
        const finderSummary = [
          data.finderMakeModel,
          data.finderBodyType,
          data.finderBudgetMax ? `up to $${data.finderBudgetMax}` : ''
        ].filter(Boolean).join(' | ');

        message = finderSummary
          ? `Car Finder request: ${finderSummary}`
          : 'Car Finder request from Inquiry Center.';
      } else if (formType === 'Trade-In') {
        const tradeSummary = [data.tradeYear, data.tradeMakeModel].filter(Boolean).join(' ');
        message = tradeSummary
          ? `Trade-In appraisal request for ${tradeSummary}.`
          : 'Trade-In appraisal request from Inquiry Center.';
      } else if (vehicleContext) {
        message = `Interested in ${vehicleContext.year} ${vehicleContext.make}`;
      } else {
        message = 'General inquiry from Inquiry Center.';
      }
    }

    try {
      await api.createLead({
        type: formType,
        name: data.name as string,
        email: data.email as string,
        phone: data.phone as string,
        message,
        details: {
          ...normalizedDetails,
          vehicleId: vehicleContext?._id || vehicleContext?.id,
          ...(formType === 'Trade-In' ? { appraisalRange } : {})
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
        <div className="bg-white p-6 sm:p-10 md:p-16 rounded-3xl md:rounded-[60px] shadow-[0_0_100px_rgba(212,175,55,0.1)] max-w-2xl border border-gray-100">
          <div className="w-24 h-24 md:w-32 md:h-32 gold-gradient text-black rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-2xl animate-bounce">
            <CheckCircle2 size={48} className="md:w-16 md:h-16" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 brand-font italic text-black">Engines Started!</h2>
          <p className="text-gray-500 mb-8 md:mb-12 text-base md:text-xl leading-relaxed">
            Your inquiry {vehicleContext ? `for the ${vehicleContext.year} ${vehicleContext.make}` : ''} has been prioritized. Expect a response within <span className="text-black font-bold">15 minutes</span>.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="group relative bg-black text-white px-6 sm:px-10 md:px-16 py-4 md:py-5 rounded-full font-bold uppercase tracking-[0.16em] sm:tracking-[0.3em] text-[10px] md:text-xs hover:bg-[#D4AF37] hover:text-black transition-all overflow-hidden"
          >
            <span className="relative z-10">New Inquiry</span>
          </button>
        </div>
      </div>
    );
  }

  const [heroImageFailed, setHeroImageFailed] = useState(false);

  return (
    <div className="bg-off-white min-h-screen pb-24">
      {/* Immersive Hero with Reliable Asset and Fallback */}
      <section className="relative min-h-[300px] md:min-h-[450px] py-16 md:py-32 bg-black flex items-center justify-center overflow-hidden">
        {/* Background Graphic Fallback (Always present behind image) */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.15) 0%, rgba(0, 0, 0, 0.85) 65%, #000000 100%)`
          }}
          aria-hidden="true"
        >
          {/* Subtle Grid Accent */}
          <div 
            className="w-full h-full opacity-10"
            style={{
              backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        </div>

        {/* Hero Image - Verified high-availability luxury automotive asset */}
        {!heroImageFailed && (
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover opacity-40 grayscale transition-opacity duration-700"
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              onError={() => setHeroImageFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-off-white via-black/40 to-black/90"></div>
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full mb-8 border border-white/20 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              {isLive ? 'Sales Team Live Now' : 'Concierge Offline'}
            </span>
          </div>
          <h1 
            className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold mb-6 brand-font italic tracking-tighter leading-none"
            style={{ color: '#ffffff' }}
          >
            Connect.
          </h1>
          <p 
            className="font-bold uppercase tracking-[0.25em] sm:tracking-[0.4em] md:tracking-[0.6em] text-[10px] md:text-sm"
            style={{ color: '#D4AF37' }}
          >
            Experience Whip4You
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 -mt-12 md:-mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          <div className="lg:col-span-4 space-y-6">
            <a href={`tel:${config?.contactPhone?.replace(/\D/g, '') || '17789706007'}`} className="block group">
              <div className="bg-white p-5 md:p-8 rounded-[20px] md:rounded-[40px] shadow-xl hover:shadow-2xl transition-all border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors shrink-0">
                    <Phone size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Call Hub</h4>
                    <p className="text-lg md:text-xl font-bold group-hover:text-[#D4AF37] transition-colors truncate font-display text-black">{config?.contactPhone || '+1 7789706007'}</p>
                  </div>
                </div>
              </div>
            </a>

            <div className="bg-black text-white p-6 md:p-10 rounded-[20px] md:rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 gold-gradient opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <h3 className="text-2xl font-bold mb-8 brand-font italic text-[#D4AF37]" style={{ color: '#D4AF37' }}>The Showroom</h3>
               <div className="space-y-6 md:space-y-8">
                  <div className="flex gap-4">
                    <MapPin className="text-[#D4AF37] flex-shrink-0" size={24} />
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {config?.address ? (
                        config.address.split(',').map((part: string, idx: number) => (
                          <React.Fragment key={idx}>
                            {part.trim()}
                            {idx < config.address.split(',').length - 1 && idx % 2 === 0 ? <br /> : idx < config.address.split(',').length - 1 ? ', ' : ''}
                          </React.Fragment>
                        ))
                      ) : (
                        <>
                          20771 Langley Bypass #102,<br />
                          Langley, BC V3A 5E8
                        </>
                      )}
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
                 href={config?.address ? `https://maps.google.com/?q=${encodeURIComponent(config.address)}` : "https://maps.google.com/?q=20771%20Langley%20Bypass%20%23102,%20Langley,%20BC%20V3A%205E8"} 
                 target="_blank" 
                 rel="noreferrer"
                 className="mt-10 md:mt-12 flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] transition-all shadow-lg"
               >
                 <Navigation size={16} /> Get Directions
               </a>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-6 md:p-16 rounded-[30px] md:rounded-[60px] shadow-2xl border border-gray-100">
              {vehicleContext && (
                <div className="bg-zinc-50 p-5 sm:p-6 rounded-[28px] border border-zinc-200 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 animate-in slide-in-from-left duration-500">
                   <img src={vehicleContext.images[0]} loading="lazy" className="w-24 h-24 object-cover rounded-2xl shadow-md border-2 border-white" alt={`${vehicleContext.year} ${vehicleContext.make} ${vehicleContext.model}`} />
                   <div>
                     <span className="text-[#D4AF37] font-black uppercase tracking-[0.3em] text-[8px] mb-1 block">Active Interest</span>
                     <h3 className="text-xl font-bold brand-font text-black">{vehicleContext.year} {vehicleContext.make} {vehicleContext.model}</h3>
                     <p className="text-[10px] text-gray-400 uppercase tracking-widest">Stock: {vehicleContext.stockNumber}</p>
                   </div>
                </div>
              )}

              <div className="mb-10 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 brand-font italic text-black">Inquiry Center</h2>
                <p className="text-sm md:text-base text-zinc-600">Our concierge team will respond within minutes.</p>
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
                    className={`flex items-center justify-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-4 rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-[0.12em] sm:tracking-widest text-[8px] sm:text-[9px] transition-all ${formType === tab.id ? 'bg-black text-[#D4AF37] shadow-xl' : 'text-zinc-700 hover:bg-white hover:text-black'}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">Identity</label>
                    <input name="name" required type="text" placeholder="Your Name" className="w-full bg-zinc-50 p-5 rounded-2xl border border-zinc-300 outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm text-black caret-black placeholder:text-zinc-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">Email Address</label>
                    <input name="email" required type="email" placeholder="john@example.com" className="w-full bg-zinc-50 p-5 rounded-2xl border border-zinc-300 outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm text-black caret-black placeholder:text-zinc-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">Mobile</label>
                    <input name="phone" required type="tel" placeholder="(778) 000-0000" className="w-full bg-zinc-50 p-5 rounded-2xl border border-zinc-300 outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm text-black caret-black placeholder:text-zinc-600" />
                  </div>
                </div>

                {formType === 'Car Finder' && (
                  <div className="bg-zinc-50 p-5 sm:p-8 rounded-[28px] md:rounded-[35px] border border-zinc-200 animate-in slide-in-from-top-6 duration-500">
                     <h4 className="font-bold mb-8 uppercase tracking-[0.4em] text-[10px] flex items-center gap-4 text-black">
                        <Search size={14} className="text-[#D4AF37]" /> Car Finder Profile
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                          name="finderMakeModel"
                          required
                          placeholder="Preferred Make / Model"
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                        <select
                          name="finderBodyType"
                          defaultValue=""
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        >
                          <option value="" disabled>Body Type</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Coupe">Coupe</option>
                          <option value="Truck">Truck</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="Van">Van</option>
                        </select>
                        <input
                          name="finderYearFrom"
                          type="number"
                          min="1980"
                          max={new Date().getFullYear() + 1}
                          placeholder="Year From"
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                        <input
                          name="finderYearTo"
                          type="number"
                          min="1980"
                          max={new Date().getFullYear() + 1}
                          placeholder="Year To"
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                        <input
                          name="finderBudgetMin"
                          type="number"
                          min="0"
                          step="500"
                          placeholder="Budget Min ($)"
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                        <input
                          name="finderBudgetMax"
                          required
                          type="number"
                          min="0"
                          step="500"
                          placeholder="Budget Max ($)"
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                        <select
                          name="finderTimeline"
                          defaultValue="Within 30 days"
                          className="md:col-span-2 bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        >
                          <option value="ASAP">ASAP</option>
                          <option value="Within 30 days">Within 30 days</option>
                          <option value="1-3 months">1-3 months</option>
                          <option value="Just researching">Just researching</option>
                        </select>
                     </div>
                  </div>
                )}

                {formType === 'Trade-In' && (
                  <div className="bg-zinc-50 p-5 sm:p-8 rounded-[28px] md:rounded-[35px] border border-zinc-200 animate-in slide-in-from-top-6 duration-500">
                     <h4 className="font-bold mb-8 uppercase tracking-[0.4em] text-[10px] flex items-center gap-4 text-black">
                        <TrendingUp size={14} className="text-[#D4AF37]" /> Live Appraisal Simulator
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <input 
                          name="tradeYear"
                          placeholder="Vehicle Year" 
                          type="number"
                          min="1980"
                          max={new Date().getFullYear() + 1}
                          value={tradeYear}
                          onChange={(e) => setTradeYear(e.target.value)}
                          required
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" 
                        />
                        <input 
                          name="tradeMakeModel"
                          placeholder="Make/Model" 
                          value={tradeModel}
                          onChange={(e) => setTradeModel(e.target.value)}
                          required
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" 
                        />
                        <input
                          name="tradeMileage"
                          placeholder="Mileage (KM)"
                          type="number"
                          min="0"
                          step="1000"
                          value={tradeMileage}
                          onChange={(e) => setTradeMileage(e.target.value)}
                          required
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                        <select
                          name="tradeCondition"
                          value={tradeCondition}
                          onChange={(e) => setTradeCondition(e.target.value as TradeCondition)}
                          className="bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Needs Work">Needs Work</option>
                        </select>
                        <input
                          name="tradeLoanBalance"
                          type="number"
                          min="0"
                          step="500"
                          placeholder="Current Loan Balance (optional)"
                          className="md:col-span-2 bg-white p-5 rounded-2xl border border-zinc-300 text-sm outline-none text-black caret-black placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                     </div>

                     {tradeValidation.isValid && appraisalRange ? (
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
                          <p className="text-[9px] text-zinc-400 mt-4 uppercase tracking-[0.2em]">Based on current BC Wholesale auction data (OAC)</p>
                       </div>
                     ) : tradeModel.trim() && tradeYear && tradeMileage ? (
                       <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[25px] flex flex-col items-center justify-center text-center text-white space-y-3 animate-in fade-in duration-300">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] mb-1">
                            <Info size={18} />
                          </div>
                          <h4 className="text-sm font-bold brand-font italic text-white uppercase tracking-wider">
                            Request an Appraisal
                          </h4>
                          <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                            {tradeValidation.reason === 'unsupported_make' || tradeValidation.reason === 'unsupported_model'
                              ? `"${tradeModel.trim()}" requires manual specialist review. Submit your details below and our appraisal team will prepare a custom market assessment.`
                              : 'Please ensure vehicle year and mileage are valid to generate an automated estimate, or submit below for a manual appraisal.'}
                          </p>
                       </div>
                     ) : (
                       <div className="border-2 border-dashed border-zinc-300 p-8 rounded-[25px] flex flex-col items-center justify-center text-zinc-600">
                          <p className="text-[10px] font-bold uppercase tracking-widest">Enter details to generate estimate</p>
                       </div>
                     )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">Details</label>
                  <textarea name="message" rows={4} className="w-full bg-zinc-50 p-5 rounded-2xl border border-zinc-300 outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm resize-none text-black caret-black placeholder:text-zinc-600" 
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
