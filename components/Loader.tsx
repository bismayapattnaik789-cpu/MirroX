
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="relative w-24 h-24">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-t-2 border-luxury-gold rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.3)]"></div>
          {/* Middle Ring */}
          <div className="absolute inset-3 border-r-2 border-royal-blue-light rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          {/* Inner Core */}
          <div className="absolute inset-8 bg-luxury-gold/20 rounded-full animate-pulse blur-sm"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-luxury-gold text-[10px] font-orbitron font-bold animate-pulse">AI</span>
          </div>
      </div>
      
      <div className="text-center space-y-2">
         <p className="text-luxury-gold font-bold font-orbitron text-sm uppercase tracking-[0.3em]">
            Stitching Reality
         </p>
         <p className="text-slate-500 font-rajdhani text-xs uppercase tracking-widest">
            MirrorX Engine Processing...
         </p>
      </div>
    </div>
  );
};

export default Loader;
