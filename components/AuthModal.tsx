
import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';

interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await dbService.loginWithGoogle();
      onLogin(user);
    } catch (e) {
      console.error("Login failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-midnight border border-white/10 p-8 shadow-2xl overflow-hidden animate-fade-in-up">
         {/* Decorative Gradients */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/10 rounded-full blur-[50px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-royal-navy/20 rounded-full blur-[50px] pointer-events-none"></div>

         <div className="text-center mb-10 relative z-10">
            <h3 className="text-2xl font-serif italic text-white mb-2">Welcome to MirrorX</h3>
            <p className="text-slate-400 font-rajdhani uppercase tracking-widest text-xs">
               Sign in to sync your wardrobe
            </p>
         </div>

         <div className="space-y-4 relative z-10">
             <button 
               onClick={handleGoogleLogin}
               disabled={loading}
               className="w-full bg-white text-black font-rajdhani font-bold py-4 flex items-center justify-center gap-4 hover:bg-slate-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group"
             >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-black rounded-full animate-spin"></div>
                ) : (
                    <>
                       {/* Google G Logo SVG */}
                       <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                       </svg>
                       <span>Continue with Google</span>
                    </>
                )}
             </button>
         </div>

         <div className="mt-8 text-center">
             <p className="text-[10px] text-slate-500 font-rajdhani">
                 By continuing, you agree to MirrorX's <span className="underline hover:text-white cursor-pointer">Terms of Service</span>.
             </p>
         </div>
         
         <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
      </div>
    </div>
  );
};

export default AuthModal;
