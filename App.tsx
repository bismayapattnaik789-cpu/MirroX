
import React, { useState, useEffect } from 'react';
import TryOnInterface from './components/TryOnInterface';
import Pricing from './components/Pricing';
import Wardrobe from './components/Wardrobe';
import Recommendations from './components/Recommendations';
import AuthModal from './components/AuthModal';
import { AppState, UserCredits, SavedOutfit, User } from './types';
import { dbService } from './services/dbService';

// Realistic 3D Metallic Logo
const MirrorXLogo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Chrome/Silver Gradient */}
      <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E8E8E8" />
        <stop offset="25%" stopColor="#505050" />
        <stop offset="50%" stopColor="#FFFFFF" />
        <stop offset="75%" stopColor="#505050" />
        <stop offset="100%" stopColor="#E8E8E8" />
      </linearGradient>
      
      {/* Deep Royal Velvet Gradient */}
      <linearGradient id="velvetGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0B1535" />
        <stop offset="40%" stopColor="#1E3A8A" />
        <stop offset="60%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0B1535" />
      </linearGradient>

      {/* Gold Mesh Texture */}
      <pattern id="goldNet" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
         <rect width="4" height="4" fill="none"/>
         <line x1="0" y1="0" x2="0" y2="4" stroke="#D4AF37" strokeWidth="0.5" opacity="0.6"/>
         <line x1="0" y1="0" x2="4" y2="0" stroke="#D4AF37" strokeWidth="0.5" opacity="0.6"/>
      </pattern>

      {/* 3D Bevel Filter for Metal */}
      <filter id="metalBevel">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
        <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="20" lightingColor="#white" result="specOut">
          <fePointLight x="-5000" y="-10000" z="20000"/>
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
        <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.5"/>
      </filter>

      {/* Fabric Shadow */}
      <filter id="fabricShadow">
         <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="black" floodOpacity="0.6"/>
      </filter>
    </defs>

    {/* Hanger Hook */}
    <path d="M50 10 C 50 5, 56 5, 56 10 C 56 14, 50 16, 50 20 L 50 23" stroke="url(#chromeGradient)" strokeWidth="3" strokeLinecap="round" filter="url(#metalBevel)"/>
    
    {/* Hanger Shoulders connecting to circle */}
    <path d="M28 32 L 50 23 L 72 32" stroke="url(#chromeGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#metalBevel)"/>

    {/* Main Circle Ring */}
    <circle cx="50" cy="55" r="40" stroke="url(#chromeGradient)" strokeWidth="3" filter="url(#metalBevel)"/>

    {/* Fabric X - Left Leg (Under) */}
    <path d="M35 40 C 40 50, 45 55, 65 80 L 52 80 C 35 55, 30 50, 22 45 Z" fill="url(#velvetGradient)" filter="url(#fabricShadow)"/>
    <path d="M35 40 C 40 50, 45 55, 65 80 L 52 80 C 35 55, 30 50, 22 45 Z" fill="url(#goldNet)"/>
    {/* Gold Trim Left */}
    <path d="M35 40 C 40 50, 45 55, 65 80" stroke="#AA8C2C" strokeWidth="1" fill="none"/>
    <path d="M22 45 C 30 50, 35 55, 52 80" stroke="#AA8C2C" strokeWidth="1" fill="none"/>

    {/* Fabric X - Right Leg (Over) */}
    <path d="M65 40 C 60 50, 55 55, 35 80 L 48 80 C 65 55, 70 50, 78 45 Z" fill="url(#velvetGradient)" filter="url(#fabricShadow)"/>
     <path d="M65 40 C 60 50, 55 55, 35 80 L 48 80 C 65 55, 70 50, 78 45 Z" fill="url(#goldNet)"/>
    {/* Gold Trim Right */}
    <path d="M65 40 C 60 50, 55 55, 35 80" stroke="#AA8C2C" strokeWidth="1" fill="none"/>
    <path d="M78 45 C 70 50, 65 55, 48 80" stroke="#AA8C2C" strokeWidth="1" fill="none"/>

  </svg>
);

// Partner Ticker
const BrandTicker = () => (
  <div className="w-full bg-black border-y border-white/10 overflow-hidden py-6">
    <div className="logo-slider flex items-center gap-20 text-slate-500 font-serif italic text-xl whitespace-nowrap opacity-60">
        {['Vogue', 'Harper\'s Bazaar', 'Gucci', 'Prada', 'Myntra', 'Ajio Luxe', 'Farfetch', 'Burberry', 'Vogue', 'Gucci'].map((brand, i) => (
           <span key={i} className="hover:text-luxury-gold transition-colors cursor-default">
             {brand}
           </span>
        ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppState>(AppState.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<UserCredits>({ daily: 5, purchased: 0 });
  const [wardrobe, setWardrobe] = useState<SavedOutfit[]>([]);
  const [globalFaceImage, setGlobalFaceImage] = useState<string | null>(null);
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize Auth & Data
  useEffect(() => {
    const storedUser = dbService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      loadUserData(storedUser.id);
    }
  }, []);

  const loadUserData = (userId: string) => {
    const data = dbService.getUserData(userId);
    setCredits(data.credits);
    setWardrobe(data.wardrobe);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    loadUserData(loggedInUser.id);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    dbService.logout();
    setUser(null);
    setCredits({ daily: 5, purchased: 0 });
    setWardrobe([]);
    setCurrentView(AppState.HOME);
  };

  const checkAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleNavClick = (view: AppState) => {
    if (view === AppState.TRY_ON || view === AppState.WARDROBE) {
      checkAuth(() => setCurrentView(view));
    } else {
      setCurrentView(view);
    }
  };

  const deductCredit = () => {
    setCredits(prev => {
      let newState = prev;
      if (prev.daily > 0) newState = { ...prev, daily: prev.daily - 1 };
      else if (prev.purchased > 0) newState = { ...prev, purchased: prev.purchased - 1 };
      
      if (user && newState !== prev) {
         dbService.updateCredits(user.id, newState);
      }
      return newState;
    });
  };

  const addToWardrobe = (outfit: SavedOutfit) => {
    setWardrobe(prev => {
        const newWardrobe = [outfit, ...prev];
        if (user) dbService.saveToWardrobe(user.id, outfit);
        return newWardrobe;
    });
  };

  const removeFromWardrobe = (id: string) => {
    setWardrobe(prev => {
        const newWardrobe = prev.filter(item => item.id !== id);
        if (user) dbService.removeFromWardrobe(user.id, id);
        return newWardrobe;
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case AppState.TRY_ON:
        return (
            <TryOnInterface 
                credits={credits} 
                deductCredit={deductCredit} 
                onSaveToWardrobe={addToWardrobe}
                setGlobalFaceImage={setGlobalFaceImage}
            />
        );
      case AppState.WARDROBE:
        return <Wardrobe items={wardrobe} onDeleteItem={removeFromWardrobe} />;
      case AppState.RECOMMENDATIONS:
        return <Recommendations userFaceImage={globalFaceImage} />;
      case AppState.PRICING:
        return <Pricing type="B2C" />;
      case AppState.B2B_INFO:
        return <Pricing type="B2B" />;
      case AppState.HOME:
      default:
        return (
          <div className="flex flex-col relative">
            
            {/* Hero Section */}
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-midnight">
               {/* Ambient Background */}
               <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue-light/5 rounded-full blur-[150px]"></div>
               <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-luxury-gold/5 rounded-full blur-[120px]"></div>
               
               {/* Grid Texture */}
               <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

               <div className="text-center px-4 z-10 max-w-7xl mx-auto flex flex-col items-center">
                  <div className="mb-12 relative group">
                     <div className="absolute inset-0 bg-luxury-gold/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                     <MirrorXLogo className="h-40 w-40 relative z-10 drop-shadow-2xl animate-float" />
                  </div>
                  
                  <h1 className="text-6xl md:text-8xl font-serif italic text-white mb-6 tracking-tight relative leading-none">
                     The Virtual <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-white to-luxury-gold animate-shimmer">Atelier</span>
                  </h1>
                  
                  <p className="text-sm md:text-lg text-slate-400 mb-12 font-rajdhani uppercase tracking-[0.3em] max-w-3xl mx-auto border-y border-white/5 py-8">
                     Experience the future of High Fashion with <span className="text-white font-bold">Gemini Nano Pro</span>. <br/>
                     Instant, Hyper-Realistic Virtual Try-On for the Discerning Individual.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-8">
                     <button 
                       onClick={() => handleNavClick(AppState.TRY_ON)}
                       className="btn-primary-gold px-12 py-5 text-sm font-orbitron uppercase tracking-widest hover:scale-105 transition-transform"
                     >
                       Enter Fitting Room
                     </button>
                     <button 
                       onClick={() => setCurrentView(AppState.B2B_INFO)}
                       className="px-12 py-5 border border-white/20 text-white text-sm font-orbitron uppercase tracking-widest hover:bg-white hover:text-black transition-all bg-black/20 backdrop-blur-sm"
                     >
                       Partner With Us
                     </button>
                  </div>
               </div>
               
               {/* Stats Row */}
               <div className="absolute bottom-0 w-full border-t border-white/10 bg-black/40 backdrop-blur-md">
                   <div className="max-w-7xl mx-auto flex justify-between px-6 py-6 text-center">
                       {[
                           { val: "10K+", label: "Daily Try-ons" },
                           { val: "99.8%", label: "Anatomy Accuracy" },
                           { val: "4K", label: "Render Quality" },
                           { val: "0.2s", label: "Latency" }
                       ].map((stat, i) => (
                           <div key={i} className="flex flex-col md:flex-row items-baseline gap-2">
                               <span className="text-xl md:text-2xl font-serif italic text-white">{stat.val}</span>
                               <span className="text-[10px] uppercase tracking-widest text-slate-500 hidden md:inline">{stat.label}</span>
                           </div>
                       ))}
                   </div>
               </div>
            </div>

            {/* Brand Strip */}
            <BrandTicker />
            
            {/* Additional content removed for brevity, keeps existing blocks */}
            {/* Features Grid - New Section */}
            <div className="py-32 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div>
                             <h3 className="text-4xl font-serif italic text-white mb-8">Precision Engineering <br/> Meets <span className="text-luxury-gold">High Fashion</span></h3>
                             <p className="text-slate-400 font-rajdhani mb-12 text-lg leading-relaxed">
                                Unlike standard filters, MirrorX understands the structural integrity of garments. It calculates drape, tension, and texture reflection to ensure the digital fit mirrors reality.
                             </p>
                             
                             <div className="grid grid-cols-2 gap-8">
                                 {[
                                     { title: "Fabric Physics", desc: "Real-time drape simulation" },
                                     { title: "Light Transport", desc: "Environment map matching" },
                                     { title: "Body Morphing", desc: "Predictive fit analysis" },
                                     { title: "Texture Preservation", desc: "4K micro-detail synthesis" }
                                 ].map((feat, i) => (
                                     <div key={i} className="border-l border-luxury-gold/50 pl-6">
                                         <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2">{feat.title}</h4>
                                         <p className="text-slate-500 text-sm font-rajdhani">{feat.desc}</p>
                                     </div>
                                 ))}
                             </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-luxury-gold/20 to-royal-blue/20 blur-[80px]"></div>
                            <div className="relative border border-white/10 bg-white/5 p-2 rotate-3 hover:rotate-0 transition-transform duration-700">
                                <img src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Gemini_SS.width-1300.jpg" className="w-full h-auto grayscale opacity-80 mix-blend-screen contrast-125" alt="Tech" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative bg-midnight text-white selection:bg-luxury-gold selection:text-black">
      
      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>

      {showAuthModal && (
        <AuthModal onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto h-24 flex items-center justify-between px-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView(AppState.HOME)}
          >
            <MirrorXLogo className="h-10 w-10 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300" />
            <span className="text-2xl font-orbitron font-bold tracking-widest text-white">MIRROR<span className="text-luxury-gold">X</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
             {['TRY_ON', 'WARDROBE', 'RECOMMENDATIONS', 'PRICING'].map((view) => (
                <button 
                  key={view}
                  onClick={() => handleNavClick(AppState[view as keyof typeof AppState])} 
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-luxury-gold ${currentView === AppState[view as keyof typeof AppState] ? 'text-luxury-gold' : 'text-slate-500'}`}
                >
                  {view.replace('_', ' ')}
                </button>
             ))}
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Balance</span>
                <span className="text-luxury-gold font-bold font-mono">{credits.daily} Credits</span>
             </div>
             
             {user ? (
                 <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                     <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-luxury-gold/50" />
                     <button onClick={handleLogout} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white">
                        Logout
                     </button>
                 </div>
             ) : (
                 <button 
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs uppercase font-bold text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all"
                 >
                    Login
                 </button>
             )}

             <button className="md:hidden text-white" onClick={() => setCurrentView(AppState.HOME)}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-24 min-h-screen">
        {renderContent()}
      </main>

      <footer className="relative z-10 py-16 border-t border-white/5 bg-black">
        {/* Footer content preserved */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
             <div className="max-w-xs">
                 <div className="flex items-center gap-2 mb-6">
                    <MirrorXLogo className="h-6 w-6" />
                    <span className="font-orbitron font-bold text-lg">MIRRORX</span>
                 </div>
                 <p className="text-slate-600 text-xs leading-relaxed font-rajdhani">
                    Pioneering the intersection of artificial intelligence and high fashion. 
                    Reimagining self-expression through digital synthesis.
                 </p>
             </div>
             
             <div className="grid grid-cols-2 gap-12 text-xs uppercase tracking-widest">
                 <div>
                     <h4 className="text-white font-bold mb-4">Platform</h4>
                     <ul className="space-y-2 text-slate-500">
                         <li className="hover:text-luxury-gold cursor-pointer">Technology</li>
                         <li className="hover:text-luxury-gold cursor-pointer">Pricing</li>
                         <li className="hover:text-luxury-gold cursor-pointer">API Access</li>
                     </ul>
                 </div>
                 <div>
                     <h4 className="text-white font-bold mb-4">Legal</h4>
                     <ul className="space-y-2 text-slate-500">
                         <li className="hover:text-luxury-gold cursor-pointer">Privacy</li>
                         <li className="hover:text-luxury-gold cursor-pointer">Terms</li>
                         <li className="hover:text-luxury-gold cursor-pointer">Copyright</li>
                     </ul>
                 </div>
             </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-700 uppercase tracking-widest">
            <span>© 2024 MirrorX Inc.</span>
            <span>Bangalore • Tokyo • New York</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
