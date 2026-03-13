
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, LayoutGrid, List as ListIcon, 
  Car, Fuel, Gauge, Settings, Hash, Palette, Calendar, 
  DollarSign, ArrowRightLeft, X, Check, Info, Plus, Loader2
} from 'lucide-react';
import { api } from '../api.ts';
import { Vehicle, SortOption } from '../types.ts';

const Inventory: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('year_new');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vinSearchTerm, setVinSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comparison State
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filters
  const [makeFilter, setMakeFilter] = useState('');
  const [bodyTypeFilter, setBodyTypeFilter] = useState(searchParams.get('bodyType') || '');
  const [transmissionFilter, setTransmissionFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  
  // Range Filters
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [mileageMin, setMileageMin] = useState('');
  const [mileageMax, setMileageMax] = useState('');

  useEffect(() => {
    api.getVehicles().then(data => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const bt = searchParams.get('bodyType');
    if (bt) setBodyTypeFilter(bt);
  }, [searchParams]);

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    if (searchTerm) {
      result = result.filter(v => 
        `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (vinSearchTerm) {
      result = result.filter(v => 
        v.vin.toLowerCase().includes(vinSearchTerm.toLowerCase())
      );
    }

    if (makeFilter) result = result.filter(v => v.make === makeFilter);
    if (bodyTypeFilter) result = result.filter(v => v.bodyType === bodyTypeFilter);
    if (transmissionFilter) result = result.filter(v => v.transmission === transmissionFilter);
    if (colorFilter) result = result.filter(v => v.exteriorColor === colorFilter);

    if (yearMin) result = result.filter(v => v.year >= parseInt(yearMin));
    if (yearMax) result = result.filter(v => v.year <= parseInt(yearMax));
    
    if (priceMin) result = result.filter(v => {
      const p = typeof v.price === 'number' ? v.price : 0;
      return p >= parseInt(priceMin);
    });
    if (priceMax) result = result.filter(v => {
      const p = typeof v.price === 'number' ? v.price : 9999999;
      return p <= parseInt(priceMax);
    });

    if (mileageMin) result = result.filter(v => v.mileage >= parseInt(mileageMin));
    if (mileageMax) result = result.filter(v => v.mileage <= parseInt(mileageMax));

    result.sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : 999999;
      const priceB = typeof b.price === 'number' ? b.price : 999999;
      
      switch (sortBy) {
        case 'price_asc': return priceA - priceB;
        case 'price_desc': return priceB - priceA;
        case 'year_new': return b.year - a.year;
        case 'year_old': return a.year - b.year;
        case 'mileage_low': return a.mileage - b.mileage;
        default: return 0;
      }
    });

    return result;
  }, [vehicles, searchTerm, vinSearchTerm, makeFilter, bodyTypeFilter, transmissionFilter, colorFilter, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, sortBy]);

  const activeFilters = useMemo(() => {
    const chips: { label: string; key: string; value: any }[] = [];
    if (makeFilter) chips.push({ label: makeFilter, key: 'make', value: setMakeFilter });
    if (bodyTypeFilter) chips.push({ label: bodyTypeFilter, key: 'body', value: setBodyTypeFilter });
    if (transmissionFilter) chips.push({ label: transmissionFilter, key: 'trans', value: setTransmissionFilter });
    if (colorFilter) chips.push({ label: colorFilter, key: 'color', value: setColorFilter });
    if (searchTerm) chips.push({ label: `"${searchTerm}"`, key: 'search', value: setSearchTerm });
    return chips;
  }, [makeFilter, bodyTypeFilter, transmissionFilter, colorFilter, searchTerm]);

  const uniqueMakes = useMemo(() => Array.from(new Set(vehicles.map(v => v.make))).sort(), [vehicles]);
  const uniqueTransmissions = useMemo(() => Array.from(new Set(vehicles.map(v => v.transmission))).sort(), [vehicles]);
  const uniqueColors = useMemo(() => Array.from(new Set(vehicles.map(v => v.exteriorColor))).sort(), [vehicles]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setVinSearchTerm('');
    setMakeFilter('');
    setBodyTypeFilter('');
    setTransmissionFilter('');
    setColorFilter('');
    setYearMin('');
    setYearMax('');
    setPriceMin('');
    setPriceMax('');
    setMileageMin('');
    setMileageMax('');
    setIsMobileFiltersOpen(false);
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center gap-6">
        <Loader2 className="text-[#D4AF37] animate-spin" size={48} />
        <p className="font-bold text-black brand-font uppercase tracking-widest text-xs">Scanning Fleet Registry...</p>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen pb-20 relative text-gray-900">
      <div className="bg-black text-white py-12 md:py-16 mb-8 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 brand-font italic">Browse Inventory</h1>
          <p className="text-gray-400">Discover your perfect match from our premium inspected vehicles.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          <aside className={`w-full lg:w-80 space-y-6 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#D4AF37]" /> Filters
                </h3>
                <div className="flex items-center gap-3">
                  <button onClick={handleClearFilters} className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors">Reset</button>
                  <button type="button" onClick={() => setIsMobileFiltersOpen(false)} className="lg:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Close</button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                  <Info size={16} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">Comparison Tool</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed italic">Select up to 3 whips using the <ArrowRightLeft size={10} className="inline mx-0.5" /> icon on any car to compare specs side-by-side.</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Keyword Search</label>
                  <div className="relative">
                    <input type="text" placeholder="Make, model..." className="w-full bg-gray-50 border border-gray-200 p-2.5 pl-9 rounded-lg outline-none text-sm focus:border-[#D4AF37] text-black" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">VIN Search</label>
                  <div className="relative">
                    <input type="text" placeholder="Enter VIN..." className="w-full bg-gray-50 border border-gray-200 p-2.5 pl-9 rounded-lg outline-none text-sm focus:border-[#D4AF37] text-black" value={vinSearchTerm} onChange={(e) => setVinSearchTerm(e.target.value)} />
                    <Hash className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Make</label>
                    <select className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none text-sm focus:border-[#D4AF37] text-black" value={makeFilter} onChange={(e) => setMakeFilter(e.target.value)}>
                      <option value="">All Makes</option>
                      {uniqueMakes.map(make => <option key={make} value={make}>{make}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Body Type</label>
                    <select className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none text-sm focus:border-[#D4AF37] text-black" value={bodyTypeFilter} onChange={(e) => setBodyTypeFilter(e.target.value)}>
                      <option value="">All Types</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Coupe">Coupe</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Mini-Van">Mini-Van</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 flex items-center gap-1"><DollarSign size={12} /> Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Min" className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm outline-none focus:border-[#D4AF37] text-black" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                      <input type="number" placeholder="Max" className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm outline-none focus:border-[#D4AF37] text-black" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 md:mb-8 flex flex-col gap-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-500">Found <span className="text-black font-bold">{filteredVehicles.length}</span> matching whips</p>
                  <button type="button" onClick={() => setIsMobileFiltersOpen((prev) => !prev)} className="lg:hidden inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-black">
                    <SlidersHorizontal size={14} className="text-[#D4AF37]" /> {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select className="w-full sm:w-auto bg-gray-50 border border-gray-200 p-2 rounded-lg outline-none text-xs font-bold uppercase tracking-widest text-black" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                    <option value="year_new">Newest First</option>
                    <option value="year_old">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="mileage_low">Lowest Mileage</option>
                  </select>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => chip.value('')}
                      className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                    >
                      {chip.label}
                      <X size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8' : 'flex flex-col gap-6'}>
              {filteredVehicles.map(v => (
                <div key={v._id || v.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col">
                  <div className="relative h-56 sm:h-64 overflow-hidden block">
                    <Link to={`/vehicle/${v._id || v.id}`} className="block h-full">
                      <img src={v.images[0]} alt={v.make} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </Link>
                    <button onClick={() => toggleCompare(v._id || v.id)} className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 py-2 px-3 rounded-full shadow-lg transition-all flex items-center gap-2 ${compareIds.includes(v._id || v.id) ? 'bg-[#D4AF37] text-black' : 'bg-black/60 text-white hover:bg-black'}`}>
                      {compareIds.includes(v._id || v.id) ? <Check size={18} /> : <ArrowRightLeft size={18} />}
                    </button>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                      <Link to={`/vehicle/${v._id || v.id}`} className="hover:text-[#D4AF37] transition-colors min-w-0">
                        <h3 className="text-xl font-bold text-black">{v.year} {v.make} {v.model}</h3>
                        <p className="text-sm text-gray-400 font-medium">{v.trim}</p>
                      </Link>
                      <span className="text-xl sm:text-2xl font-bold text-[#D4AF37] brand-font">
                        {typeof v.price === 'number' ? `$${v.price.toLocaleString()}` : v.price}
                      </span>
                    </div>
                    <div className="mt-auto pt-5 sm:pt-6 border-t border-gray-100 flex gap-4">
                      <Link to={`/vehicle/${v._id || v.id}`} className="flex-1 bg-gray-50 text-center py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-black">View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Comparison Floating Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 animate-in slide-in-from-bottom duration-300">
          <div className="container mx-auto">
            <div className="bg-black text-white p-4 rounded-2xl shadow-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 text-[#D4AF37] font-bold uppercase tracking-widest text-xs">
                  <ArrowRightLeft size={16} /> Comparison ({compareIds.length}/3)
                </div>
                <div className="flex -space-x-3">
                  {vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => (
                    <div key={v._id || v.id} className="relative group">
                      <img 
                        src={v.images[0]} 
                        className="w-14 h-14 rounded-xl border-2 border-black object-cover"
                        alt={v.make}
                      />
                      <button 
                        onClick={() => toggleCompare(v._id || v.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {[...Array(3 - compareIds.length)].map((_, i) => (
                    <div key={i} className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900 flex items-center justify-center text-gray-600">
                      <Plus size={16} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setCompareIds([])}
                  className="flex-1 md:flex-none text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white py-2"
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setIsCompareModalOpen(true)}
                  disabled={compareIds.length < 2}
                  className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${compareIds.length >= 2 ? 'bg-[#D4AF37] text-black hover:scale-105' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-200">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold brand-font">Vehicle Comparison</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Side-by-side technical specifications</p>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="bg-black text-white p-3 rounded-full hover:bg-[#D4AF37] transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white sticky top-0 z-10">
                    <th className="p-8 w-1/4 border-r border-gray-100">
                      <div className="flex items-center gap-2 text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                        <Info size={14} /> Spec Comparison
                      </div>
                    </th>
                    {vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => (
                      <th key={v._id || v.id} className="p-8 w-1/4 border-r border-gray-100">
                        <img src={v.images[0]} className="w-full h-32 object-cover rounded-xl mb-4 shadow-sm" alt="" />
                        <h4 className="font-bold text-lg">{v.year} {v.make}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{v.model} {v.trim}</p>
                        <p className="text-[#D4AF37] font-bold text-xl mt-2 brand-font">
                          {typeof v.price === 'number' ? `$${v.price.toLocaleString()}` : v.price}
                        </p>
                      </th>
                    ))}
                    {[...Array(3 - compareIds.length)].map((_, i) => (
                      <th key={i} className="p-8 w-1/4 border-r border-gray-100 bg-gray-50/50">
                        <div className="h-full flex flex-col items-center justify-center text-gray-300">
                          <Plus size={32} className="mb-2 opacity-20" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Add Vehicle</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <ComparisonRow label="Mileage" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => `${v.mileage.toLocaleString()} km`)} />
                  <ComparisonRow label="Body Type" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => v.bodyType)} />
                  <ComparisonRow label="Transmission" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => v.transmission)} />
                  <ComparisonRow label="Engine" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => v.engine)} />
                  <ComparisonRow label="Fuel Type" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => v.fuelType)} />
                  <ComparisonRow label="Exterior" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => v.exteriorColor)} />
                  <ComparisonRow label="Interior" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => v.interiorColor)} />
                  <ComparisonRow label="VIN" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => v.vin)} isMono />
                  <tr className="align-top">
                    <td className="p-6 font-bold text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50/30 border-r border-gray-100">Key Features</td>
                    {vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => (
                      <td key={v._id || v.id} className="p-6 border-r border-gray-100">
                        <ul className="space-y-2">
                          {v.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                              <Check size={12} className="text-green-500" /> {f}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                    {[...Array(3 - compareIds.length)].map((_, i) => <td key={i} className="p-6 border-r border-gray-100 bg-gray-50/20" />)}
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
               <button 
                 onClick={() => setIsCompareModalOpen(false)}
                 className="px-8 py-3 font-bold uppercase tracking-widest text-xs text-gray-400"
               >
                 Close
               </button>
               <Link 
                 to="/apply"
                 className="bg-black text-white px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] hover:text-black transition-all"
               >
                 Finance Application
               </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ComparisonRow: React.FC<{ label: string; values: string[]; isMono?: boolean }> = ({ label, values, isMono }) => (
  <tr>
    <td className="p-6 font-bold text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50/30 border-r border-gray-100">{label}</td>
    {values.map((v, i) => (
      <td key={i} className={`p-6 border-r border-gray-100 font-medium text-sm ${isMono ? 'font-mono text-xs' : ''}`}>
        {v}
      </td>
    ))}
    {[...Array(3 - values.length)].map((_, i) => <td key={i} className="p-6 border-r border-gray-100 bg-gray-50/20" />)}
  </tr>
);

export default Inventory;
