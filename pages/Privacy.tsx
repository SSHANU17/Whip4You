
import React from 'react';
import { Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pb-20">
      <section className="bg-black text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 gold-gradient opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="container mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-8 hover:text-white transition-colors">
            <ChevronLeft size={14} /> Return to Showroom
          </Link>
          <h1 className="text-5xl md:text-7xl font-bold brand-font italic mb-6">Privacy Policy</h1>
          <p className="text-gray-400 max-w-2xl font-light tracking-wide uppercase text-xs">Last Updated: February 2024 • Whip4You Digital Security</p>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-12">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-8 md:p-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 border-b border-gray-100 pb-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#D4AF37] mb-4">
                <Shield size={24} />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-[10px]">Data Protection</h4>
              <p className="text-[10px] text-gray-400 mt-2">256-bit SSL encrypted credit applications.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#D4AF37] mb-4">
                <Lock size={24} />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-[10px]">Zero Third Party</h4>
              <p className="text-[10px] text-gray-400 mt-2">We never sell your contact info to marketers.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#D4AF37] mb-4">
                <Eye size={24} />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-[10px]">Transparency</h4>
              <p className="text-[10px] text-gray-400 mt-2">Full control over your data footprint.</p>
            </div>
          </div>

          <article className="prose prose-zinc max-w-none text-gray-600 space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-black brand-font mb-4">1. Information Collection</h2>
              <p className="leading-relaxed">When you visit Whip4You, we collect information you provide directly to us via credit applications, trade-in requests, and contact forms. This may include your name, email, phone number, financial history, and vehicle preferences.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black brand-font mb-4">2. Usage of Data</h2>
              <p className="leading-relaxed">Your data is primarily used to process vehicle inquiries and secure financing through our network of premium lenders. We do not sell, rent, or trade your personal information to outside marketers.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black brand-font mb-4">3. Security Standards</h2>
              <p className="leading-relaxed">We implement industry-standard security measures to protect the confidentiality of your information. Our financial portal uses Bank-Level encryption for all credit applications.</p>
            </section>

            <section className="bg-zinc-50 p-10 rounded-3xl border border-zinc-100 mt-10">
              <h4 className="text-black font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <FileText size={16} className="text-[#D4AF37]" /> Contact Data Officer
              </h4>
              <p className="text-sm">For questions regarding your data or to request deletion, please contact our privacy hub at <a href="mailto:privacy@whip4you.ca" className="text-black font-bold underline">privacy@whip4you.ca</a></p>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
