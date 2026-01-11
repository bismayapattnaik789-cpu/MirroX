import React from 'react';
import { SavedOutfit } from '../types';

interface WardrobeProps {
  items: SavedOutfit[];
  onDeleteItem: (id: string) => void;
}

const Wardrobe: React.FC<WardrobeProps> = ({ items, onDeleteItem }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-600">
        <div className="text-8xl mb-4 font-serif italic text-white/5">Null</div>
        <p className="text-lg font-orbitron text-luxury-gold/50 uppercase tracking-[0.2em]">Collection Empty</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-16 border-b border-white/10 pb-6">
          <h2 className="text-4xl font-serif italic text-white">
            Digital Archive
          </h2>
          <p className="text-slate-500 font-rajdhani uppercase tracking-widest text-xs">
              {items.length} Asset{items.length !== 1 ? 's' : ''} Stored
          </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-midnight border border-white/5 hover:border-luxury-gold/30 transition-all duration-500">
            <div className="aspect-[3/4] overflow-hidden relative">
               <img src={item.image} alt="Saved Outfit" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
               
               {/* Overlay Info */}
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <p className="text-luxury-gold text-[10px] font-bold uppercase tracking-widest mb-1">MirrorX Collection</p>
                  <p className="text-white text-xs font-rajdhani uppercase">ID: {item.id.slice(-8)}</p>
                  <p className="text-slate-400 text-[10px] mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
               </div>
            </div>
            
            <div className="flex border-t border-white/10">
                 <button className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-white hover:text-black hover:bg-luxury-gold transition-colors">
                    Acquire
                 </button>
                 <button 
                   onClick={() => onDeleteItem(item.id)}
                   className="px-6 py-4 text-slate-500 hover:text-red-400 hover:bg-red-900/10 transition-colors border-l border-white/10"
                 >
                   Delete
                 </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wardrobe;