
import React, { useState, useEffect } from 'react';
import { X, Heart, Trash2, ArrowRight, Wallet, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api.ts';
import { Vehicle } from '../types.ts';

interface GarageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GarageDrawer: React.FC<GarageDrawerProps> = ({ isOpen, onClose }) => {
  const [savedCars, setSavedCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favorites = JSON.parse(localStorage.getItem('w4y_favorites') || '[]');
      if (favorites.length === 0) {
        setSavedCars([]);
        setLoading(false);
        return;
      }
      const allVehicles = await api.getVehicles();
      const filtered = allVehicles.filter((v: Vehicle) => favorites.includes(v._id || v.id));
      setSavedCars(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadFavorites();
  }, [isOpen]);

  const removeFavorite = (id: string) => {
    const favorites = JSON.parse(localStorage.getItem('w4y_favorites') || '[]');
    const newFavorites = favorites.filter((favId: string) => favId !== id);
    localStorage.setItem('w4y_favorites', JSON.stringify(newFavorites));
    loadFavorites();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-[1500] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[1600] shadow-4xl transition-transform duration-700 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-zinc-50">
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-[#D4AF37]" fill="#D4AF37" />
            <h2 className="text-2xl font-bold brand-font italic text-black uppercase">Your Garage</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="text-[#D4AF37] animate-spin" size={32} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Syncing Collection...</p>
            </div>
          ) : savedCars.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200">
                <Heart size={40} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-black">Empty Collection</h3>
                <p className="text-zinc-400 text-sm mt-2">Explore the fleet to add whips to your garage.</p>
              </div>
              <Link to="/inventory" onClick={onClose} className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] hover:text-black transition-all">
                Browse Whips
              </Link>
            </div>
          ) : (
            savedCars.map(car => (
              <div key={car._id || car.id} className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                <img src={car.images[0]} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-black">{car.year} {car.make}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{car.model} {car.trim}</p>
                    </div>
                    <span className="font-bold text-[#D4AF37] brand-font italic">${typeof car.price === 'number' ? car.price.toLocaleString() : car.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/vehicle/${car._id || car.id}`} onClick={onClose} className="flex-1 bg-zinc-50 text-center py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all">
                      View Asset
                    </Link>
                    <button onClick={() => removeFavorite(car._id || car.id)} className="p-3 bg-zinc-50 rounded-xl text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {savedCars.length > 0 && (
          <div className="p-8 bg-zinc-950 text-white border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Collection Value</span>
              <span className="text-xl font-bold gold-text brand-font">
                ${savedCars.reduce((acc, car) => acc + (typeof car.price === 'number' ? car.price : 0), 0).toLocaleString()}
              </span>
            </div>
            <Link to="/apply" onClick={onClose} className="flex items-center justify-between w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all">
              <span className="flex items-center gap-2 pl-6"><Wallet size={16} /> Mass Financing Request</span>
              <ArrowRight size={18} className="mr-6" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default GarageDrawer;
