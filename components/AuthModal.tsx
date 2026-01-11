
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Handle Google Response via window global
  useEffect(() => {
    /* Initialize Google Sign-In */
    const initGoogle = () => {
        if ((window as any).google) {
            (window as any).google.accounts.id.initialize({
                client_id: "YOUR_GOOGLE_CLIENT_ID_HERE", // Replace with real ID or logic to handle simulated
                callback: handleGoogleResponse
            });
            (window as any).google.accounts.id.renderButton(
                document.getElementById("googleBtn"),
                { theme: "outline", size: "large", width: "100%" }
            );
        }
    };
    
    // Check if script is loaded, if not add it
    if (!document.getElementById('gsi-script')) {
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.id = 'gsi-script';
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
    } else {
        initGoogle();
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
      setLoading(true);
      try {
          const user = await api.loginGoogle(response.credential);
          onLogin(user);
      } catch (e) {
          setError("Google Authentication Failed");
      } finally {
          setLoading(false);
      }
  };

  // Mock Google Login for development if real client ID isn't set
  const handleSimulatedGoogle = async () => {
      // Create a dummy JWT structure to pass validation in dev mode
      const dummyPayload = {
          sub: "google_mock_" + Date.now(),
          email: "mock_google_user@gmail.com",
          name: "Mock Google User",
          picture: "https://via.placeholder.com/150"
      };
      // Simple base64 encoding to look like a token
      const dummyToken = btoa(JSON.stringify(dummyPayload)); 
      
      setLoading(true);
      try {
          const user = await api.loginGoogle(dummyToken);
          onLogin(user);
      } catch (e) {
          setError("Google Auth Failed");
      } finally {
          setLoading(false);
      }
  };

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

             <button 
                type="submit"
                disabled={loading}
                className="w-full btn-primary-gold py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
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
             {/* Real Google Button Container */}
             <div id="googleBtn"></div>
             
             {/* Fallback/Dev Button if API keys missing */}
             <button 
                type="button"
                onClick={handleSimulatedGoogle}
                className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200"
             >
                 <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                 Continue with Google
             </button>
         </div>
         
         <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
      </div>
    </div>
  );
};

export default AuthModal;
