
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calculator, DollarSign, Percent, Calendar, Info } from 'lucide-react';

const LoanCalculator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPrice = Number(searchParams.get('price')) || 30000;
  
  const [vehiclePrice, setVehiclePrice] = useState(String(initialPrice));
  const [downPayment, setDownPayment] = useState(String(Math.floor(initialPrice * 0.1)));
  const [tradeValue, setTradeValue] = useState('');
  const [interestRate, setInterestRate] = useState('5.99');
  const [term, setTerm] = useState<number>(60);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    price?: string;
    downPayment?: string;
    tradeValue?: string;
    interestRate?: string;
    financing?: string;
  }>({});

  const [isPaidInFull, setIsPaidInFull] = useState(false);

  const [results, setResults] = useState({
    amountFinanced: 0,
    monthly: 0,
    biWeekly: 0,
    weekly: 0,
    totalInterest: 0
  });

  useEffect(() => {
    const errs: {
      price?: string;
      downPayment?: string;
      tradeValue?: string;
      interestRate?: string;
      financing?: string;
    } = {};

    const numPrice = Number(vehiclePrice);
    const numDown = Number(downPayment || 0);
    const numTrade = Number(tradeValue || 0);
    const numRate = Number(interestRate);

    // Validate Price
    if (vehiclePrice.trim() === '' || isNaN(numPrice)) {
      errs.price = 'Please enter a valid price.';
    } else if (numPrice < 0) {
      errs.price = 'Vehicle price cannot be negative.';
    } else if (numPrice === 0) {
      errs.price = 'Vehicle price must be greater than $0.';
    }

    // Validate Down Payment
    if (downPayment.trim() !== '' && (isNaN(numDown) || numDown < 0)) {
      errs.downPayment = 'Down payment cannot be negative.';
    }

    // Validate Trade Value
    if (tradeValue.trim() !== '' && (isNaN(numTrade) || numTrade < 0)) {
      errs.tradeValue = 'Trade appraisal cannot be negative.';
    }

    // Validate Interest Rate
    if (interestRate.trim() === '' || isNaN(numRate) || numRate < 0) {
      errs.interestRate = 'Interest rate cannot be negative.';
    } else if (numRate > 35) {
      errs.interestRate = 'Interest rate exceeds standard lending limits (35%).';
    }

    // If basic field errors exist, reject calculation
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setIsPaidInFull(false);
      setResults({ amountFinanced: 0, monthly: 0, biWeekly: 0, weekly: 0, totalInterest: 0 });
      return;
    }

    const safePrice = numPrice;
    const safeDown = numDown;
    const safeTrade = numTrade;
    const tax = safePrice * 0.12;
    const totalWithTax = safePrice + tax;
    const totalCredits = safeDown + safeTrade;
    const principal = totalWithTax - totalCredits;

    // Check if down payment + trade value exceeds total purchase price
    if (principal <= 0) {
      setIsPaidInFull(true);
      if (totalCredits > totalWithTax) {
        errs.financing = `Down payment + trade-in exceeds total vehicle price with tax ($${Math.round(totalWithTax).toLocaleString()}). No financing needed.`;
      }
      setErrors(errs);
      setResults({ amountFinanced: 0, monthly: 0, biWeekly: 0, weekly: 0, totalInterest: 0 });
      return;
    }

    setIsPaidInFull(false);
    setErrors({});

    const r = (numRate / 100) / 12;
    const n = term;

    const monthly = r === 0 ? principal / n : principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - principal;

    setResults({
      amountFinanced: principal,
      monthly: isFinite(monthly) && monthly > 0 ? monthly : 0,
      biWeekly: isFinite(monthly) && monthly > 0 ? (monthly * 12) / 26 : 0,
      weekly: isFinite(monthly) && monthly > 0 ? (monthly * 12) / 52 : 0,
      totalInterest: isFinite(totalInterest) && totalInterest >= 0 ? totalInterest : 0
    });
  }, [vehiclePrice, downPayment, tradeValue, interestRate, term]);

  return (
    <div className="bg-off-white min-h-screen pb-20">
      <div className="bg-black text-white py-12 sm:py-16 mb-6 sm:mb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 gold-gradient opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 brand-font italic text-white">Loan Architect</h1>
          <p className="text-zinc-300 font-light tracking-widest text-xs uppercase">Structure your premium financing</p>
        </div>
      </div>

        <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Inputs */}
          <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-3xl sm:rounded-[40px] shadow-sm space-y-6 sm:space-y-8 border border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-3 brand-font italic uppercase">
              <Calculator className="text-[#D4AF37]" size={24} /> Configuration
            </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Vehicle Price</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={vehiclePrice} 
                    min="0"
                    onChange={(e) => setVehiclePrice(e.target.value)}
                    className={`w-full bg-zinc-50 border-b ${errors.price ? 'border-red-500 bg-red-50/20' : 'border-zinc-200'} p-4 pl-10 rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-black font-bold`} 
                  />
                  <DollarSign className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
                {errors.price && (
                  <p className="text-xs text-red-600 font-semibold">{errors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Down Payment</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={downPayment} 
                    min="0"
                    onChange={(e) => setDownPayment(e.target.value)}
                    className={`w-full bg-zinc-50 border-b ${errors.downPayment ? 'border-red-500 bg-red-50/20' : 'border-zinc-200'} p-4 pl-10 rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-black font-bold`} 
                  />
                  <DollarSign className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
                {errors.downPayment && (
                  <p className="text-xs text-red-600 font-semibold">{errors.downPayment}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Trade-In Appraisal</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={tradeValue}
                    min="0"
                    onChange={(e) => setTradeValue(e.target.value)}
                    className={`w-full bg-zinc-50 border-b ${errors.tradeValue ? 'border-red-500 bg-red-50/20' : 'border-zinc-200'} p-4 pl-10 rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-black font-bold`} 
                  />
                  <DollarSign className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
                {errors.tradeValue && (
                  <p className="text-xs text-red-600 font-semibold">{errors.tradeValue}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Tax (12%)</label>
                <div className="relative">
                  <div className="w-full bg-zinc-100 border-b border-zinc-200 p-4 pl-10 rounded-xl text-zinc-500 font-bold" aria-live="polite">
                    {Number(vehiclePrice) > 0 ? (Number(vehiclePrice) * 0.12).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : '$0.00'}
                  </div>
                  <DollarSign className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Interest Rate (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={interestRate} 
                    onChange={(e) => setInterestRate(e.target.value)}
                    className={`w-full bg-zinc-50 border-b ${errors.interestRate ? 'border-red-500 bg-red-50/20' : 'border-zinc-200'} p-4 pl-10 rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all text-black font-bold`} 
                  />
                  <Percent className="absolute left-3 top-4 text-gray-400" size={18} />
                </div>
                {errors.interestRate && (
                  <p className="text-xs text-red-600 font-semibold">{errors.interestRate}</p>
                )}
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

            {errors.financing && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-amber-800 text-xs font-medium leading-relaxed">
                {errors.financing}
              </div>
            )}
            
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex gap-4 items-start">
              <Info size={20} className="text-[#D4AF37] shrink-0 mt-1" />
              <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider">Payments are estimates only. Final figures will be calculated based on credit score, current market rates, and lender approval (OAC).</p>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-8">
            <div className="bg-black text-white p-6 sm:p-8 lg:p-12 rounded-3xl sm:rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 gold-gradient opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               
               <p className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px] mb-6">Estimated Monthly Payment</p>
               
               {Object.keys(errors).length > 0 && !isPaidInFull ? (
                 <div className="my-6">
                   <h3 className="text-3xl sm:text-4xl font-bold brand-font italic text-zinc-500">Invalid Input</h3>
                   <p className="text-xs text-zinc-400 mt-2">Correct the highlighted field errors above to view payment estimates.</p>
                 </div>
               ) : isPaidInFull ? (
                 <div className="my-6">
                   <h3 className="text-4xl sm:text-5xl font-bold brand-font italic text-white">$0.00 /mo</h3>
                   <p className="text-xs text-[#D4AF37] mt-3 font-medium">Fully covered by down payment and trade-in. No monthly financing required.</p>
                 </div>
               ) : (
                 <h3 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-8 sm:mb-12 brand-font italic gold-text break-words">
                   ${results.monthly.toFixed(2)}
                 </h3>
               )}
               
               <div className="grid grid-cols-2 gap-4 sm:gap-10 border-t border-white/10 pt-6 sm:pt-10">
                 <div>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Financed (incl. 12% tax)</p>
                   <p className="text-2xl font-bold">
                     {Object.keys(errors).length > 0 && !isPaidInFull ? '—' : `$${results.amountFinanced.toLocaleString()}`}
                   </p>
                 </div>
                 <div>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Interest</p>
                   <p className="text-2xl font-bold text-[#D4AF37]">
                     {Object.keys(errors).length > 0 && !isPaidInFull ? '—' : `$${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                   </p>
                 </div>
               </div>
               <p className="mt-6 text-xs text-zinc-400">The financed amount includes a flat 12% tax on the vehicle price, less your down payment and trade-in.</p>
            </div>

            <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-3xl sm:rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-[10px] font-black mb-8 uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-4">Frequency breakdown</h3>
              <div className="space-y-8">
                <div className="flex justify-between items-center group">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[11px] group-hover:text-black transition-colors">Monthly</span>
                  <span className="text-2xl font-bold brand-font text-zinc-600 group-hover:text-[#D4AF37] transition-colors">
                    {Object.keys(errors).length > 0 && !isPaidInFull ? '—' : `$${results.monthly.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[11px] group-hover:text-black transition-colors">Bi-Weekly</span>
                  <span className="text-2xl font-bold brand-font text-zinc-600 group-hover:text-[#D4AF37] transition-colors">
                    {Object.keys(errors).length > 0 && !isPaidInFull ? '—' : `$${results.biWeekly.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[11px] group-hover:text-black transition-colors">Weekly</span>
                  <span className="text-2xl font-bold brand-font text-zinc-600 group-hover:text-[#D4AF37] transition-colors">
                    {Object.keys(errors).length > 0 && !isPaidInFull ? '—' : `$${results.weekly.toFixed(2)}`}
                  </span>
                </div>
              </div>
              <Link 
                to="/apply" 
                className="block w-full text-center bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] mt-12 hover:bg-[#D4AF37] hover:text-black transition-all shadow-xl active:scale-95"
              >
                Request financing details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
