
import React from 'react';
import { ShieldCheck, Award, Heart, TrendingDown, Users, Globe } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center text-center bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-50"
            alt="About Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <span className="text-[#D4AF37] font-bold uppercase tracking-[0.4em] mb-4 block">The W4Y Story</span>
          <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 brand-font italic">Luxury & Value</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Revolutionizing the pre-owned market in British Columbia since 2018.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Wholesale Pricing, <br/><span className="gold-text italic">Redefined.</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                For years, the "wholesale" advantage was locked behind dealer licenses. We founded Whip4You with a simple mission: break those walls down. 
              </p>
              <div className="space-y-6">
                <div className="flex gap-4 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <TrendingDown className="text-[#D4AF37] flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-lg">No Middleman Markup</h4>
                    <p className="text-sm text-gray-500">We source directly from premium partners and pass the savings straight to your driveway.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <ShieldCheck className="text-[#D4AF37] flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-lg">Inspected Excellence</h4>
                    <p className="text-sm text-gray-500">Every whip undergoes a rigorous 150-point safety and performance inspection.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl">
                 <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-[#D4AF37] text-black p-10 rounded-3xl shadow-xl hidden md:block">
                <Award size={48} className="mb-4" />
                <h4 className="font-black text-2xl brand-font">5,000+</h4>
                <p className="text-xs font-bold uppercase tracking-widest">Happy Drivers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-950 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Heart size={40} />, title: 'Customer First', desc: 'No-pressure sales environment. We are here to consult, not to close.' },
              { icon: <Globe size={40} />, title: 'Transparency', desc: 'Full Carfax reports and inspection sheets provided for every vehicle.' },
              { icon: <Users size={40} />, title: 'Community', desc: 'Locally owned and operated in Langley, supporting BC drivers since day one.' }
            ].map((v, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-800 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                  {v.icon}
                </div>
                <h4 className="text-2xl font-bold mb-4">{v.title}</h4>
                <p className="text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
