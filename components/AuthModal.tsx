
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "1006878217030-lr0053lovhenvbj7l2g5u4jftm4gt0d2.apps.googleusercontent.com";

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOrigin, setCurrentOrigin] = useState<string>('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Capture current origin for debugging
    setCurrentOrigin(window.location.origin);

    const handleGoogleResponse = async (response: any) => {
      console.log("Google Response:", response);
      setLoading(true);
      try {
          const user = await api.loginGoogle(response.credential);
          onLogin(user);
      } catch (e: any) {
          console.error("Google Login Error", e);
          setError("Authentication failed. Please check console.");
      } finally {
          setLoading(false);
      }
    };

    const initializeGSI = () => {
        if (!(window as any).google) return;
        
        try {
            // Initialize with minimal config to avoid conflict
            (window as any).google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            if (googleBtnRef.current) {
                (window as any).google.accounts.id.renderButton(
                    googleBtnRef.current,
                    { 
                        theme: "outline", 
                        size: "large", 
                        width: "100%",
                        text: "continue_with",
                        logo_alignment: "center"
                    }
                );
            }
        } catch (err) {
            console.error("GSI Init Error:", err);
        }
    };

    // Script Loading Logic
    const scriptId = 'gsi-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
        script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.id = scriptId;
        script.async = true;
        script.defer = true;
        script.onload = initializeGSI;
        document.body.appendChild(script);
    } else if ((window as any).google) {
        initializeGSI();
    } else {
        script.addEventListener('load', initializeGSI);
    }

    return () => {
        if(script) script.removeEventListener('load', initializeGSI);
    };
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
          let user;
          if (mode === 'SIGNUP') {
              user = await api.signupEmail({ email, password, name, phone });
          } else {
              user = await api.loginEmail({ email, password });
          }
          onLogin(user);
      } catch (err: any) {
          setError(err.message || "Authentication failed");
      } finally {
          setLoading(false);
      }
  };

  const handleGuestLogin = () => {
    setLoading(true);
    setTimeout(() => {
        const guestUser: User = {
            id: 'guest_' + Date.now(),
            name: 'Guest User',
            email: 'guest@mirrorx.com',
            avatar: `https://ui-avatars.com/api/?name=Guest+User&background=D4AF37&color=000`
        };
        // Mock credits for guest
        (guestUser as any).credits = { daily: 5, purchased: 0 };
        onLogin(guestUser);
        setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-midnight border border-white/10 p-8 shadow-2xl overflow-hidden animate-fade-in-up">
         {/* Gradients */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/10 rounded-full blur-[50px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-royal-blue-light/20 rounded-full blur-[50px] pointer-events-none"></div>

         <div className="text-center mb-8 relative z-10">
            <h3 className="text-2xl font-serif italic text-white mb-2">MirrorX Access</h3>
            <p className="text-slate-400 font-rajdhani uppercase tracking-widest text-xs">
               {mode === 'LOGIN' ? 'Enter your credentials' : 'Create your digital identity'}
            </p>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-white/10 mb-6 relative z-10">
             <button 
                onClick={() => setMode('LOGIN')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${mode === 'LOGIN' ? 'text-luxury-gold border-b border-luxury-gold' : 'text-slate-500'}`}
             >
                 Sign In
             </button>
             <button 
                onClick={() => setMode('SIGNUP')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${mode === 'SIGNUP' ? 'text-luxury-gold border-b border-luxury-gold' : 'text-slate-500'}`}
             >
                 Sign Up
             </button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
             {mode === 'SIGNUP' && (
                 <>
                    <input 
                        type="text" 
                        placeholder="Full Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-luxury-gold focus:outline-none font-rajdhani"
                        required
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone Number"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-luxury-gold focus:outline-none font-rajdhani"
                        required
                    />
                 </>
             )}
             
             <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-luxury-gold focus:outline-none font-rajdhani"
                required
             />
             
             <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-luxury-gold focus:outline-none font-rajdhani"
                required
             />

             {error && <p className="text-red-400 text-xs text-center">{error}</p>}
             
             {/* Origin Debug Info - Helpful for fixing mismatch errors */}
             <div className="bg-white/5 border border-white/10 p-3 rounded mt-4">
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                     <span className="text-red-400 font-bold">Having Google Login Issues?</span>
                 </p>
                 <p className="text-[10px] text-slate-500 mb-2">
                     If you see "origin_mismatch", add this URL to <strong>Authorized JavaScript origins</strong> in Google Cloud Console:
                 </p>
                 <code className="block bg-black p-2 text-luxury-gold text-xs font-mono break-all border border-luxury-gold/30 mb-3 select-all">
                     {currentOrigin}
                 </code>
                 
                 <button 
                    type="button" 
                    onClick={handleGuestLogin}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 text-xs uppercase tracking-widest font-bold border border-white/20"
                 >
                    Skip & Continue as Guest
                 </button>
             </div>

             <button 
                type="submit"
                disabled={loading}
                className="w-full btn-primary-gold py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-50 mt-4"
             >
                 {loading ? 'Processing...' : (mode === 'LOGIN' ? 'Enter' : 'Register')}
             </button>
         </form>

         <div className="my-6 flex items-center gap-4 relative z-10">
             <div className="h-[1px] bg-white/10 flex-1"></div>
             <span className="text-[10px] text-slate-500 uppercase">Or</span>
             <div className="h-[1px] bg-white/10 flex-1"></div>
         </div>

         <div className="relative z-10 space-y-3">
             <div ref={googleBtnRef} className="w-full flex justify-center h-[40px]"></div>
         </div>
         
         <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
      </div>
    </div>
  );
};

export default AuthModal;