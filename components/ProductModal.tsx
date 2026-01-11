
import React, { useState, useEffect } from 'react';
import { ProductLink } from '../types';

interface ProductModalProps {
  product: ProductLink | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (product) setIsAnimating(true);
  }, [product]);

  if (!product) return null;

  // Mock Price Generation based on brand tier for demo realism
  const getEstimatedPrice = (brand: string) => {
      const normalized = brand.toLowerCase();
      if (normalized.includes('gucci') || normalized.includes('prada')) return '₹125,000';
      if (normalized.includes('zara')) return '₹4,990';
      if (normalized.includes('h&m')) return '₹2,499';
      return '₹3,500';
  };

  const handleBuyNow = () => {
    window.open(product.url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className={`relative w-full max-w-2xl bg-midnight border border-luxury-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden flex flex-col md:flex-row transition-all duration-500 transform ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Visual Side */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 to-black p-8 flex items-center justify-center border-r border-white/10 relative overflow-hidden">
               {/* Abstract Pattern */}
               <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212,175,55,0.15) 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
               
               <div className="text-center relative z-10">
                   <div className="w-32 h-32 mx-auto border border-luxury-gold/20 rounded-full flex items-center justify-center mb-6 bg-white/5">
                        <span className="font-serif text-5xl italic text-luxury-gold">M</span>
                   </div>
                   <p className="text-white font-orbitron text-xs uppercase tracking-[0.3em] mb-2">Verified Partner</p>
                   <p className="text-slate-500 font-rajdhani text-xs">{product.source}</p>
               </div>
          </div>

          {/* Details Side */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
               <div>
                   <div className="flex justify-between items-start mb-2">
                       <span className="bg-luxury-gold text-black text-[9px] font-bold px-2 py-1 uppercase tracking-widest">In Stock</span>
                       <button onClick={onClose} className="text-slate-500 hover:text-white">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                   </div>
                   
                   <h2 className="text-2xl font-serif text-white italic mb-2 leading-tight">{product.title}</h2>
                   <p className="text-luxury-gold font-orbitron text-lg mb-6">{getEstimatedPrice(product.brand || '')}</p>

                   <div className="space-y-4 mb-8">
                       <div className="flex justify-between border-b border-white/10 pb-2">
                           <span className="text-slate-500 text-xs uppercase tracking-widest">Brand</span>
                           <span className="text-white text-sm font-rajdhani">{product.brand || 'Unknown'}</span>
                       </div>
                       <div className="flex justify-between border-b border-white/10 pb-2">
                           <span className="text-slate-500 text-xs uppercase tracking-widest">Material</span>
                           <span className="text-white text-sm font-rajdhani">{product.material || 'N/A'}</span>
                       </div>
                       <div className="flex justify-between border-b border-white/10 pb-2">
                           <span className="text-slate-500 text-xs uppercase tracking-widest">Care</span>
                           <span className="text-white text-sm font-rajdhani">{product.care || 'Standard'}</span>
                       </div>
                   </div>
               </div>

               <div className="space-y-3">
                   <button 
                       onClick={handleBuyNow}
                       className="w-full bg-luxury-gold text-black py-4 font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors text-xs"
                   >
                       Buy Now
                   </button>
                   <div className="text-center">
                       <span className="text-[9px] text-slate-600 uppercase tracking-widest">Secure Checkout via {product.source}</span>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default ProductModal;
