
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-12">
      <div className="relative w-32 h-32">
          {/* Holographic Base Glow */}
          <div className="absolute inset-0 bg-luxury-gold/5 rounded-full blur-xl animate-pulse-slow"></div>
          
          {/* Outer Rotating Ring */}
          <div className="absolute inset-0 border border-white/10 rounded-full animate-spin-slow"></div>
          
          {/* Middle Scanning Ring */}
          <div className="absolute inset-2 border-t border-luxury-gold rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
          
          {/* Inner Counter Ring */}
          <div className="absolute inset-6 border-b border-r border-royal-blue-light/50 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
          
          {/* Core Energy */}
          <div className="absolute inset-10 bg-luxury-gold/10 rounded-full animate-ping-slow blur-sm border border-luxury-gold/30"></div>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-white text-[8px] font-orbitron font-bold animate-pulse tracking-widest">PRO</span>
          </div>
          
          {/* Orbiting Particles */}
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white] animate-spin" style={{transformOrigin: '0 64px', animationDuration: '4s'}}></div>
      </div>
      
      <div className="text-center space-y-2 relative">
         <p className="text-luxury-gold font-bold font-orbitron text-sm uppercase tracking-[0.3em] animate-pulse">
            Stitching Reality
         </p>
         <p className="text-slate-500 font-rajdhani text-xs uppercase tracking-widest">
            Neural Engine Processing...
         </p>
         
         {/* Loading Bar */}
         <div className="w-48 h-[2px] bg-white/10 mt-4 mx-auto overflow-hidden relative">
             <div className="absolute top-0 left-0 h-full w-1/3 bg-luxury-gold shadow-[0_0_10px_#D4AF37] animate-shimmer" style={{animationDuration: '1.5s'}}></div>
         </div>
      </div>
    </div>
  );
};

export default Loader;
