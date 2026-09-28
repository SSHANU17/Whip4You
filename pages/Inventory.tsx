import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, LayoutGrid, List as ListIcon, 
  Car, Fuel, Gauge, Settings, Hash, Palette, Calendar, 
  DollarSign, ArrowRightLeft, X, Check, Info, Plus, Loader2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { api } from '../api.ts';
import { Vehicle, SortOption } from '../types.ts';

const capitalizeWords = (str?: string) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Inventory: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('admin_order');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vinSearchTerm, setVinSearchTerm] = useState('');
  const mainGridRef = useRef<HTMLDivElement>(null);
  const preloadedImageUrls = useRef(new Set<string>());

  // Synchronous cache-first state initialization for Eager Loading & instant rendering
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const val = sessionStorage.getItem('w4u_vehicles_cache');
      if (val) {
        const parsed = JSON.parse(val);
        if (parsed && (Date.now() - parsed.timestamp < 2 * 60 * 1000) && Array.isArray(parsed.data)) {
          return parsed.data;
        }
      }
    } catch {}
    return [];
  });

  const [config, setConfig] = useState<any>(() => {
    try {
      const val = sessionStorage.getItem('w4u_config_cache');
      if (val) {
        const parsed = JSON.parse(val);
        if (parsed && (Date.now() - parsed.timestamp < 2 * 60 * 1000)) {
          return parsed.data;
        }
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => vehicles.length === 0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Sync config grid size when available
  useEffect(() => {
    if (config?.inventoryGridSize) {
      setItemsPerPage(config.inventoryGridSize);
    }
  }, [config]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getVehicles(), api.getConfig()])
      .then(([data, cfg]) => {
        if (!isMounted) return;
        setVehicles(data);
        setConfig(cfg);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to scan fleet registry', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const bt = searchParams.get('bodyType');
    if (bt) setBodyTypeFilter(bt);
  }, [searchParams]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter(v => !v.isHidden);

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
      if (a.status === 'Sold' && b.status !== 'Sold') return 1;
      if (a.status !== 'Sold' && b.status === 'Sold') return -1;

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

  useEffect(() => { setCurrentPage(1); }, [searchTerm, vinSearchTerm, makeFilter, bodyTypeFilter, transmissionFilter, colorFilter, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, sortBy]);

  // Start fetching every lead vehicle photo as soon as the Inventory route has
  // vehicle data. This also works for cache-first navigation back to this page.
  // The inventory only renders each vehicle's lead photo; gallery photos remain
  // deferred until a visitor opens that vehicle's detail page.
  useEffect(() => {
    if (loading || !vehicles.length) return;

    vehicles.forEach((vehicle, index) => {
      const url = vehicle.images?.[0];
      if (!url || preloadedImageUrls.current.has(url)) return;
      preloadedImageUrls.current.add(url);

      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'image';
      preload.href = url;
      // Prioritize the initially visible inventory cards, while still starting
      // every remaining car image immediately.
      preload.setAttribute('fetchpriority', index < 12 ? 'high' : 'low');
      document.head.appendChild(preload);

      const image = new Image();
      image.src = url;
    });
  }, [vehicles, loading]);

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

  const effectivePerPage = itemsPerPage === -1 ? (filteredVehicles.length || 1) : itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / effectivePerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startItem = filteredVehicles.length === 0 ? 0 : (validCurrentPage - 1) * effectivePerPage + 1;
  const endItem = Math.min(validCurrentPage * effectivePerPage, filteredVehicles.length);

  const paginatedVehicles = useMemo(() => {
    if (itemsPerPage === -1) return filteredVehicles;
    return filteredVehicles.slice((validCurrentPage - 1) * effectivePerPage, validCurrentPage * effectivePerPage);
  }, [filteredVehicles, validCurrentPage, effectivePerPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    const target = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(target);
    if (mainGridRef.current) {
      mainGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, validCurrentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [validCurrentPage, totalPages]);

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

  const PaginationBar = ({ position }: { position: 'top' | 'bottom' }) => (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm ${position === 'top' ? 'mb-6' : 'mt-10'}`}>
      <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-4 text-xs font-bold text-gray-500">
        <span>
          Showing <span className="text-black font-extrabold">{startItem}</span>–<span className="text-black font-extrabold">{endItem}</span> of <span className="text-black font-extrabold">{filteredVehicles.length}</span> vehicles
        </span>
        <div className="h-4 w-px bg-gray-200 hidden md:block" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Per Page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-black outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={-1}>All ({filteredVehicles.length})</option>
          </select>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={validCurrentPage === 1}
            title="First Page"
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handlePageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            title="Previous Page"
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                className="w-8 h-8 rounded-lg text-xs font-bold transition-all border border-gray-200 text-gray-600 hover:border-black"
              >
                1
              </button>
              {pageNumbers[0] > 2 && <span className="text-gray-400 text-xs px-1">...</span>}
            </>
          )}

          {pageNumbers.map(page => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                validCurrentPage === page
                  ? 'bg-[#D4AF37] text-black shadow-md scale-105'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-black'
              }`}
            >
              {page}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="text-gray-400 text-xs px-1">...</span>}
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                className="w-8 h-8 rounded-lg text-xs font-bold transition-all border border-gray-200 text-gray-600 hover:border-black"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages}
            title="Next Page"
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            disabled={validCurrentPage === totalPages}
            title="Last Page"
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-off-white min-h-screen pb-20 relative text-gray-900">
      <div className="bg-black text-white py-10 md:py-16 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 brand-font italic text-white">Browse Inventory</h1>
          <p className="text-gray-400">Discover your perfect match from our premium inspected vehicles.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6" ref={mainGridRef}>
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
                    <p className="text-[10px] text-gray-500 leading-relaxed italic">Select up to 3 vehicles using the <ArrowRightLeft size={10} className="inline mx-0.5" /> icon on any car to compare specs side-by-side.</p>
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

          <main className="flex-1 min-w-0">
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col gap-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-500">Found <span className="text-black font-bold">{filteredVehicles.length}</span> matching vehicles</p>
                  <button type="button" onClick={() => setIsMobileFiltersOpen((prev) => !prev)} className="lg:hidden inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-black">
                    <SlidersHorizontal size={14} className="text-[#D4AF37]" /> {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select className="w-full sm:w-auto bg-gray-50 border border-gray-200 p-2 rounded-lg outline-none text-xs font-bold uppercase tracking-widest text-black cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                    <option value="admin_order">Featured</option>
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
                      className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors"
                    >
                      {chip.label}
                      <X size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <PaginationBar position="top" />

            {loading ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-black text-white p-5 rounded-2xl border border-[#D4AF37]/30 shadow-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <Loader2 className="text-[#D4AF37] animate-spin" size={22} />
                    <span className="font-extrabold brand-font uppercase tracking-[0.25em] text-xs text-[#D4AF37]">Scanning Fleet Registry...</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono hidden sm:inline">Eager Loading Active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-5 space-y-4 animate-pulse">
                      <div className="h-56 bg-zinc-200 rounded-xl" />
                      <div className="h-6 bg-zinc-200 rounded w-3/4" />
                      <div className="h-4 bg-zinc-100 rounded w-1/2" />
                      <div className="h-10 bg-zinc-200 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            ) : paginatedVehicles.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <Car size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-black brand-font mb-2">No Matching Vehicles Found</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Try adjusting your filters or search terms to explore available vehicles in our fleet registry.</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8' : 'flex flex-col gap-6'}>
                {paginatedVehicles.map(v => (
                  <div key={v._id || v.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col ${v.status === 'Sold' ? 'opacity-70 grayscale-[20%]' : ''}`}>
                    <div className="relative h-56 sm:h-64 overflow-hidden block">
                      {v.isNewArrival !== false && v.newArrivalExpiryDate && new Date(v.newArrivalExpiryDate) > new Date() && (
                        <div className="absolute top-3 left-3 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full z-10">New Arrival</div>
                      )}
                      <Link to={`/vehicle/${v._id || v.id}`} className="block h-full relative">
                        <img src={v.images[0]} alt={v.make} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="eager" />
                        {v.status === 'Sold' && (
                          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full shadow-2xl border border-red-500/20">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </Link>
                      {v.status !== 'Sold' && (
                        <button onClick={() => toggleCompare(v._id || v.id)} className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 py-2 px-3 rounded-full shadow-lg transition-all flex items-center gap-2 ${compareIds.includes(v._id || v.id) ? 'bg-[#D4AF37] text-black' : 'bg-black/60 text-white hover:bg-black'}`}>
                          {compareIds.includes(v._id || v.id) ? <Check size={18} /> : <ArrowRightLeft size={18} />}
                        </button>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                        <Link to={`/vehicle/${v._id || v.id}`} className="hover:text-[#D4AF37] transition-colors min-w-0">
                          <h3 className="text-xl font-bold text-black">{v.year} {v.make} {v.model}</h3>
                          <p className="text-sm text-gray-400 font-medium">{v.trim}</p>
                        </Link>
                        <span className="text-xl sm:text-2xl font-bold text-[#D4AF37] brand-font">
                          {v.showPrice === false ? <a href={`tel:${config?.contactPhone?.replace(/\D/g, '') || '17789706007'}`} className="underline hover:text-[#D4AF37]" onClick={(e)=>e.stopPropagation()}>Call for Price</a> : (typeof v.price === 'number' ? `$${v.price.toLocaleString()}` : v.price)}
                        </span>
                      </div>
                      <div className="mt-auto pt-5 sm:pt-6 border-t border-gray-100 flex gap-4">
                        <Link to={`/vehicle/${v._id || v.id}`} className="flex-1 bg-gray-50 text-center py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all">View Details</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <PaginationBar position="bottom" />
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
          <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-200 text-zinc-900">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold brand-font text-zinc-900">Vehicle Comparison</h2>
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
                        <h4 className="font-bold text-lg text-zinc-900">{v.year} {v.make}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{v.model} {v.trim}</p>
                        <p className="text-[#D4AF37] font-bold text-xl mt-2 brand-font">
                          {v.showPrice === false ? <a href={`tel:${config?.contactPhone?.replace(/\D/g, '') || '17789706007'}`} className="underline hover:text-[#D4AF37]" onClick={(e)=>e.stopPropagation()}>Call for Price</a> : (typeof v.price === 'number' ? `$${v.price.toLocaleString()}` : v.price)}
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
                  <ComparisonRow label="Body Type" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => capitalizeWords(v.bodyType))} />
                  <ComparisonRow label="Transmission" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => capitalizeWords(v.transmission))} />
                  <ComparisonRow label="Engine" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => capitalizeWords(v.engine))} />
                  <ComparisonRow label="Fuel Type" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => capitalizeWords(v.fuelType))} />
                  <ComparisonRow label="Exterior" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => capitalizeWords(v.exteriorColor))} />
                  <ComparisonRow label="Interior" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => capitalizeWords(v.interiorColor))} />
                  <ComparisonRow label="VIN" values={vehicles.filter(v => compareIds.includes(v._id || v.id)).map(v => v.vin.toUpperCase())} isMono />
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
      <td key={i} className={`p-6 border-r border-gray-100 font-medium text-sm text-zinc-900 ${isMono ? 'font-mono text-xs' : ''}`}>
        {v}
      </td>
    ))}
    {[...Array(3 - values.length)].map((_, i) => <td key={i} className="p-6 border-r border-gray-100 bg-gray-50/20" />)}
  </tr>
);

export default Inventory;
