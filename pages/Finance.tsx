
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  CircleDollarSign, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  BarChart3,
  Users,
  Send,
  Search,
  ArrowRightLeft
} from 'lucide-react';

const Finance: React.FC = () => {
  const location = useLocation();
  const formRef = useRef<HTMLDivElement>(null);
  const [formType, setFormType] = useState<'General' | 'CarFinder' | 'TradeIn'>('General');
  const [submitted, setSubmitted] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Auto-scroll to form if URL is /apply
  useEffect(() => {
    if (location.pathname === '/apply' && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    const hour = new Date().getHours();
    if (hour >= 11 && hour < 20) {
      setIsLive(true);
    }
  }, [location.pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const steps = [
    { title: 'Apply Online', desc: 'Fill out our secure, 2-minute application from any device.' },
    { title: 'Get Approved', desc: 'Our team works with major lenders to secure your best rate.' },
    { title: 'Drive Away', desc: 'Sign your paperwork and take home your new whip.' }
  ];

  const creditTiers = [
    {
      tier: 'Good Credit',
      icon: <CheckCircle2 className="text-green-500" />,
      benefit: 'Rates from 5.99%',
      details: 'Prime bank rates, flexible terms, and zero down payment options.'
    },
    {
      tier: 'New To Canada',
      icon: <ShieldCheck className="text-blue-500" />,
      benefit: 'Quick Approvals',
      details: 'No Canadian credit history? No problem. We have specialized programs for you.'
    },
    {
      tier: 'Rebuilding Credit',
      icon: <BarChart3 className="text-[#D4AF37]" />,
      benefit: '99% Approval Rate',
      details: 'Bankruptcy, consumer proposal, or late payments - we help you get back on track.'
    }
  ];

  return (
    <div className="bg-off-white min-h-screen flex flex-col">
      {/* Hero */}
      <section className="bg-black text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 gold-gradient opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="container mx-auto px-6 text-center">
          <span className="text-[#D4AF37] font-bold uppercase tracking-[0.4em] mb-4 block">Stress-Free Funding</span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 brand-font italic">Easy Financing</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Starting from <span className="text-[#D4AF37] font-bold">5.99% APR</span>. We work with all credit situations to get you behind the wheel today.
          </p>
        </div>
      </section>

      {/* Credit Tiers */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creditTiers.map((tier, idx) => (
              <div key={idx} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 transform hover:-translate-y-2 transition-all duration-300">
                <div className="mb-6">{tier.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{tier.tier}</h3>
                <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mb-4">{tier.benefit}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{tier.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 leading-tight">Why Finance With <br/><span className="gold-text italic">Whip4You?</span></h2>
              <div className="space-y-6">
                {[
                  { icon: <CircleDollarSign />, title: 'Transparent Pricing', desc: 'No hidden fees or surprise markups. Everything is clearly outlined.' },
                  { icon: <Clock />, title: 'Fast & Secure', desc: 'Our encrypted application takes minutes and gives you instant results.' },
                  { icon: <Users />, title: 'Expert Consultants', desc: 'Personalized service to ensure your monthly payments fit your budget.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="text-[#D4AF37] mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black p-12 rounded-[40px] text-white shadow-2xl relative">
              <div className="absolute inset-0 gold-gradient opacity-5 rounded-[40px]"></div>
              <h3 className="text-3xl font-bold mb-6 brand-font italic">Ready to drive?</h3>
              <p className="text-gray-400 mb-10 leading-relaxed">Join thousands of happy drivers in BC who secured their dream car through our simple financing process.</p>
              
              <div className="space-y-4">
                <Link to="/calculator" className="flex items-center justify-between bg-white text-black p-6 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-[#D4AF37] transition-all group">
                  Calculate Payments <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <button 
                  onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center justify-between border-2 border-white text-white p-6 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all group"
                >
                  Apply For Credit <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Hub Section */}
      <section ref={formRef} className="py-24 bg-off-white" id="application-form">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
             <div className="inline-flex items-center gap-2 bg-black/5 px-4 py-2 rounded-full mb-6 border border-black/10">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  {isLive ? 'Finance Team Online' : 'Secure 24/7 Portal'}
                </span>
             </div>
             <h2 className="text-4xl md:text-5xl font-bold mb-4 brand-font italic text-black">Start Your Application</h2>
             <p className="text-gray-500 max-w-xl mx-auto">Get pre-approved in minutes with our encrypted finance portal.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            {submitted ? (
              <div className="bg-white p-12 md:p-24 rounded-[40px] md:rounded-[60px] text-center animate-in zoom-in duration-500 shadow-xl border border-gray-100">
                <div className="w-24 h-24 gold-gradient text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl md:text-5xl font-bold mb-4 brand-font italic">Application Submitted!</h3>
                <p className="text-gray-500 text-lg mb-12">One of our finance specialists will be in touch shortly to discuss your options.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-black text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                  Return to Top
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 md:p-16 rounded-[40px] md:rounded-[60px] shadow-2xl border border-gray-100">
                {/* Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-12 bg-gray-50 p-2 rounded-[24px] md:rounded-[32px]">
                  {[
                    { id: 'General', label: 'Finance Request', icon: <Send size={16} /> },
                    { id: 'CarFinder', label: 'Vehicle Search', icon: <Search size={16} /> },
                    { id: 'TradeIn', label: 'Trade-In Appraisal', icon: <ArrowRightLeft size={16} /> }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setFormType(tab.id as any)}
                      className={`flex items-center justify-center gap-3 px-4 py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all ${formType === tab.id ? 'bg-black text-[#D4AF37] shadow-lg' : 'text-gray-400 hover:text-black'}`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                      <input required type="text" placeholder="John Doe" className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm text-black placeholder:text-zinc-400" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                      <input required type="tel" placeholder="(604) 000-0000" className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm text-black placeholder:text-zinc-400" />
                    </div>
                  </div>

                  {formType === 'TradeIn' && (
                    <div className="bg-off-white p-8 rounded-[32px] border border-gray-100 animate-in slide-in-from-top-4 duration-500">
                      <h4 className="font-bold mb-6 uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center gap-3 text-black">
                        <ArrowRightLeft size={14} className="text-[#D4AF37]" /> Current Vehicle Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input placeholder="Year/Make/Model" className="bg-white p-4 rounded-xl border border-gray-100 text-sm outline-none text-black placeholder:text-zinc-400" />
                        <input placeholder="Mileage (KM)" className="bg-white p-4 rounded-xl border border-gray-100 text-sm outline-none text-black placeholder:text-zinc-400" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Additional Information</label>
                    <textarea rows={3} className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm resize-none text-black placeholder:text-zinc-400" placeholder="Employment, preferred monthly budget, or questions..."></textarea>
                  </div>

                  <button type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-bold uppercase tracking-[0.4em] text-xs hover:bg-[#D4AF37] hover:text-black transition-all shadow-xl active:scale-95">
                    Submit Secure Application
                  </button>
                  <p className="text-center text-[9px] text-gray-400 uppercase tracking-widest">Your data is protected with 256-bit SSL encryption</p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-16 uppercase tracking-[0.2em]">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gray-200 z-0"></div>
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-[#D4AF37] mb-6 border-4 border-gray-50">
                  {i + 1}
                </div>
                <h4 className="font-bold text-xl mb-2">{step.title}</h4>
                <p className="text-gray-500 text-sm max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Finance;
