
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calculator, DollarSign, Percent, Calendar, Info } from 'lucide-react';

const LoanCalculator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPrice = Number(searchParams.get('price')) || 30000;
  
  const [vehiclePrice, setVehiclePrice] = useState<number>(initialPrice);
  const [downPayment, setDownPayment] = useState<number>(Math.floor(initialPrice * 0.1));
  const [tradeValue, setTradeValue] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(5.99);
  const [term, setTerm] = useState<number>(60);
  
  const [results, setResults] = useState({
    amountFinanced: 0,
    monthly: 0,
    biWeekly: 0,
    weekly: 0,
    totalInterest: 0
  });

  useEffect(() => {
    // Safety constraints
    const safePrice = Math.max(0, vehiclePrice);
    const safeDown = Math.max(0, downPayment);
    const safeTrade = Math.max(0, tradeValue);
    
    const principal = safePrice - safeDown - safeTrade;
    const r = (interestRate / 100) / 12;
    const n = term;

    if (principal <= 0) {
      setResults({ amountFinanced: 0, monthly: 0, biWeekly: 0, weekly: 0, totalInterest: 0 });
      return;
    }

    const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - principal;

    setResults({
      amountFinanced: principal,
      monthly: isFinite(monthly) ? monthly : 0,
      biWeekly: isFinite(monthly) ? (monthly * 12) / 26 : 0,
      weekly: isFinite(monthly) ? (monthly * 12) / 52 : 0,
      totalInterest: isFinite(totalInterest) ? totalInterest : 0
    });
  }, [vehiclePrice, downPayment, tradeValue, interestRate, term]);

  return (
    <div className="bg-off-white min-h-screen pb-20">
      <div className="bg-black text-white py-16 mb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 gold-gradient opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 brand-font italic">Loan Architect</h1>
          <p className="text-gray-400 font-light tracking-widest text-xs uppercase">Structure your premium financing</p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Inputs */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm space-y-8 border border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-3 brand-font italic uppercase">
              <Calculator className="text-[#D4AF37]" size={24} /> Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Vehicle Price</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={vehiclePrice} 
                    onChange={(e) => setVehiclePrice(Number(e.target.value))}
                    className="w-full bg-zinc-50 border-b border-zinc-200 p-4 pl-10 rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-black font-bold" 
                  />
                  <DollarSign className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Down Payment</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={downPayment} 
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full bg-zinc-50 border-b border-zinc-200 p-4 pl-10 rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-black font-bold" 
                  />
                  <DollarSign className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Trade-In Appraisal</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={tradeValue} 
                    onChange={(e) => setTradeValue(Number(e.target.value))}
                    className="w-full bg-zinc-50 border-b border-zinc-200 p-4 pl-10 rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-black font-bold" 
                  />
                  <DollarSign className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Interest Rate (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    value={interestRate} 
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-zinc-50 border-b border-zinc-200 p-4 pl-10 rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-black font-bold" 
                  />
                  <Percent className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
              </div>
              <div className="md:col-span-2 space-y-4 pt-4">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Loan Term</label>
                   <span className="bg-black text-[#D4AF37] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{term} Months</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="96" 
                  step="12"
                  value={term} 
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[8px] text-zinc-400 font-bold uppercase tracking-widest">
                  <span>12m</span><span>24m</span><span>36m</span><span>48m</span><span>60m</span><span>72m</span><span>84m</span><span>96m</span>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex gap-4 items-start">
              <Info size={20} className="text-[#D4AF37] shrink-0 mt-1" />
              <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider">Payments are estimates only. Final figures will be calculated based on credit score, current market rates, and lender approval (OAC).</p>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-8">
            <div className="bg-black text-white p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 gold-gradient opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               
               <p className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px] mb-6">Estimated Monthly Payment</p>
               <h3 className="text-6xl md:text-8xl font-bold mb-12 brand-font italic gold-text">${results.monthly.toFixed(2)}</h3>
               
               <div className="grid grid-cols-2 gap-10 border-t border-white/5 pt-10">
                 <div>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Financed</p>
                   <p className="text-2xl font-bold">${results.amountFinanced.toLocaleString()}</p>
                 </div>
                 <div>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Interest</p>
                   <p className="text-2xl font-bold text-[#D4AF37]">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                 </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-[10px] font-black mb-8 uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-4">Frequency breakdown</h3>
              <div className="space-y-8">
                <div className="flex justify-between items-center group">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[11px] group-hover:text-black transition-colors">Monthly</span>
                  <span className="text-2xl font-bold brand-font group-hover:text-[#D4AF37] transition-colors">${results.monthly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[11px] group-hover:text-black transition-colors">Bi-Weekly</span>
                  <span className="text-2xl font-bold brand-font group-hover:text-[#D4AF37] transition-colors">${results.biWeekly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[11px] group-hover:text-black transition-colors">Weekly</span>
                  <span className="text-2xl font-bold brand-font group-hover:text-[#D4AF37] transition-colors">${results.weekly.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/apply" className="block w-full text-center bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] mt-12 hover:bg-[#D4AF37] hover:text-black transition-all shadow-xl active:scale-95">
                Lock in this rate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
