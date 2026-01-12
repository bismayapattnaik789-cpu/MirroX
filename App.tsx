
import React, { useState, useEffect } from 'react';
import TryOnInterface from './components/TryOnInterface';
import Pricing from './components/Pricing';
import Wardrobe from './components/Wardrobe';
import Recommendations from './components/Recommendations';
import AuthModal from './components/AuthModal';
import LegalDocs from './components/LegalDocs';
import { AppState, UserCredits, SavedOutfit, User } from './types';
import { api } from './services/api'; 

// Realistic 3D Metallic Logo for MirrorX
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

// Partner Ticker with Seamless Loop Animation
const BrandTicker = () => {
  const brands = ['Vogue', 'Harper\'s Bazaar', 'Gucci', 'Prada', 'Myntra', 'Ajio Luxe', 'Farfetch', 'Burberry'];
  
  return (
    <div className="w-full bg-black border-y border-white/10 overflow-hidden py-6 md:py-8 relative z-20 group">
      {/* Premium Gradient Masks - Significantly reduced width for mobile */}
      <div className="absolute top-0 left-0 w-8 md:w-32 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-8 md:w-32 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

      <div className="flex w-max animate-scroll group-hover:[animation-play-state:paused]">
        {/* Set 1 */}
        <div className="flex items-center gap-12 md:gap-32 px-4 md:px-16 text-slate-500 font-serif italic text-lg md:text-2xl whitespace-nowrap opacity-80 md:opacity-60">
            {brands.map((brand, i) => (
              <span key={`a-${i}`} className="hover:text-luxury-gold transition-colors duration-300 cursor-default hover:scale-110 transform inline-block">
                {brand}
              </span>
            ))}
        </div>
        {/* Set 2 (Duplicate for Loop) */}
        <div className="flex items-center gap-12 md:gap-32 px-4 md:px-16 text-slate-500 font-serif italic text-lg md:text-2xl whitespace-nowrap opacity-80 md:opacity-60">
            {brands.map((brand, i) => (
              <span key={`b-${i}`} className="hover:text-luxury-gold transition-colors duration-300 cursor-default hover:scale-110 transform inline-block">
                {brand}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppState>(AppState.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<UserCredits>({ daily: 5, purchased: 0 });
  const [wardrobe, setWardrobe] = useState<SavedOutfit[]>([]);
  const [globalFaceImage, setGlobalFaceImage] = useState<string | null>(null);
  
  // State for Legal Section navigation
  const [legalSection, setLegalSection] = useState<'PRIVACY' | 'TERMS' | 'REFUND' | 'CONTACT' | 'TECH'>('PRIVACY');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize Auth & Data via API
  useEffect(() => {
    // Check if mock mode is on (by checking if api returns an immediate response from storage)
  }, []);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowAuthModal(false);
    
    // Fetch data from backend
    try {
        const [w, c] = await Promise.all([
            api.getWardrobe(loggedInUser.id),
            (loggedInUser as any).credits || { daily: 5, purchased: 0 }
        ]);
        setWardrobe(w);
        setCredits(c);
    } catch (e) {
        console.error("Data sync failed", e);
    }
  };

  const handleLogout = () => {
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
    setMobileMenuOpen(false); // Close mobile menu if open
    if (view === AppState.TRY_ON || view === AppState.WARDROBE) {
      checkAuth(() => setCurrentView(view));
    } else {
      setCurrentView(view);
    }
  };

  const openLegal = (section: 'PRIVACY' | 'TERMS' | 'REFUND' | 'CONTACT' | 'TECH') => {
      setLegalSection(section);
      setCurrentView(AppState.LEGAL);
      window.scrollTo(0,0);
  };

  const deductCredit = async () => {
    if (!user) return;
    try {
        const newCredits = await api.deductCredit(user.id);
        setCredits(newCredits);
    } catch (e) {
        console.error(e);
    }
  };

  const addToWardrobe = async (outfit: SavedOutfit) => {
    if (!user) return;
    setWardrobe(prev => [outfit, ...prev]); // Optimistic update
    await api.saveToWardrobe(user.id, outfit);
  };

  const removeFromWardrobe = async (id: string) => {
    if (!user) return;
    setWardrobe(prev => prev.filter(item => item.id !== id));
    await api.deleteFromWardrobe(user.id, id);
  };
  
  const handleCreditsUpdate = (newCredits: UserCredits) => {
    setCredits(newCredits);
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
        return <Pricing type="B2C" user={user} onCreditsUpdate={handleCreditsUpdate} />;
      case AppState.B2B_INFO:
        return <Pricing type="B2B" />;
      case AppState.LEGAL:
        return <LegalDocs initialSection={legalSection} />;
      case AppState.HOME:
      default:
        return (
          <div className="flex flex-col relative">
            
            {/* Hero Section */}
            <div className="min-h-[100dvh] flex flex-col justify-start md:justify-center relative overflow-hidden bg-midnight pt-32 pb-24 md:pt-24 md:pb-0">
               {/* Ambient Background */}
               <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue-light/5 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
               <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{animationDelay: '1s'}}></div>
               
               {/* Grid Texture */}
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

               <div className="text-center px-4 z-10 max-w-7xl mx-auto flex flex-col items-center">
                  <div className="mb-6 md:mb-12 relative group animate-reveal-up">
                     <div className="absolute inset-0 bg-luxury-gold/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
                     <MirrorXLogo className="h-20 w-20 md:h-40 md:w-40 relative z-10 drop-shadow-2xl animate-float" />
                  </div>
                  
                  <h1 className="animate-reveal-up animate-delay-100 text-4xl md:text-8xl font-serif italic text-white mb-6 tracking-tight relative leading-none">
                     The Virtual <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-white to-luxury-gold animate-shimmer">Atelier</span>
                  </h1>
                  
                  <p className="animate-reveal-up animate-delay-200 text-xs md:text-lg text-slate-400 mb-8 md:mb-12 font-rajdhani uppercase tracking-[0.2em] md:tracking-[0.3em] max-w-3xl mx-auto border-y border-white/5 py-6 md:py-8 leading-relaxed">
                     Experience the future of High Fashion with <span className="text-white font-bold">Gemini Nano Pro</span>. <br className="hidden md:block"/>
                     Instant, Hyper-Realistic Virtual Try-On for the Discerning Individual.
                  </p>

                  <div className="animate-reveal-up animate-delay-300 flex flex-col sm:flex-row gap-4 md:gap-8 w-full sm:w-auto px-6 sm:px-0">
                     <button 
                       onClick={() => handleNavClick(AppState.TRY_ON)}
                       className="btn-primary-gold px-8 py-4 md:px-12 md:py-5 text-xs md:text-sm font-orbitron uppercase tracking-widest hover:scale-105 transition-transform w-full sm:w-auto"
                     >
                       Enter Fitting Room
                     </button>
                     <button 
                       onClick={() => setCurrentView(AppState.B2B_INFO)}
                       className="px-8 py-4 md:px-12 md:py-5 border border-white/20 text-white text-xs md:text-sm font-orbitron uppercase tracking-widest hover:bg-white hover:text-black transition-all bg-black/20 backdrop-blur-sm w-full sm:w-auto"
                     >
                       Partner With Us
                     </button>
                  </div>
               </div>
               
               {/* Stats Row */}
               <div className="animate-reveal-up animate-delay-500 w-full border-t border-white/10 bg-black/40 backdrop-blur-md relative mt-12 md:mt-0 md:absolute md:bottom-0">
                   <div className="max-w-7xl mx-auto flex flex-wrap justify-between px-6 py-6 text-center gap-4">
                       {[
                           { val: "10K+", label: "Daily Try-ons" },
                           { val: "99.8%", label: "Anatomy Accuracy" },
                           { val: "4K", label: "Render Quality" },
                           { val: "0.2s", label: "Latency" }
                       ].map((stat, i) => (
                           <div key={i} className="flex flex-col md:flex-row items-center md:items-baseline gap-2 flex-1 md:flex-none">
                               <span className="text-xl md:text-2xl font-serif italic text-white">{stat.val}</span>
                               <span className="text-[10px] uppercase tracking-widest text-slate-500">{stat.label}</span>
                           </div>
                       ))}
                   </div>
               </div>
            </div>

            {/* Brand Strip */}
            <BrandTicker />
            
            {/* How It Works Section */}
            <div className="py-20 md:py-32 bg-midnight relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20 animate-reveal-up">
                        <h3 className="text-3xl md:text-5xl font-serif italic text-white mb-6">The Process</h3>
                        <div className="h-[1px] w-24 bg-luxury-gold mx-auto"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                        {[
                            { 
                                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", 
                                title: "Identity", 
                                desc: "Upload a single portrait. Our AI maps 100+ facial landmarks for precision identity retention." 
                            },
                            { 
                                icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", 
                                title: "Selection", 
                                desc: "Choose a garment from your gallery or paste a product link from any major retailer." 
                            },
                            { 
                                icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", 
                                title: "Synthesis", 
                                desc: "Gemini Nano Pro calculates fabric physics, drape, lighting, and texture in real-time." 
                            },
                            { 
                                icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", 
                                title: "Visualisation", 
                                desc: "Receive a hyper-realistic studio quality image of you wearing the ensemble." 
                            }
                        ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group animate-reveal-up" style={{animationDelay: `${idx * 200}ms`}}>
                                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-white/5 group-hover:border-luxury-gold group-hover:bg-luxury-gold/10 transition-all duration-500 group-hover:scale-110">
                                    <svg className="w-6 h-6 text-slate-400 group-hover:text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={step.icon} />
                                    </svg>
                                </div>
                                <h4 className="text-white font-orbitron uppercase tracking-widest text-sm mb-4">{step.title}</h4>
                                <p className="text-slate-400 font-rajdhani text-sm leading-relaxed max-w-xs">{step.desc}</p>
                                {idx !== 3 && (
                                    <div className="hidden md:block absolute right-0 top-8 w-full h-[1px] bg-white/10 -z-10 translate-x-1/2 max-w-[100px]"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-20 md:py-32 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="animate-reveal-up">
                             <h3 className="text-3xl md:text-4xl font-serif italic text-white mb-8">Precision Engineering <br/> Meets <span className="text-luxury-gold">High Fashion</span></h3>
                             <p className="text-slate-400 font-rajdhani mb-12 text-lg leading-relaxed">
                                Unlike standard filters, MirrorX understands the structural integrity of garments. It calculates drape, tension, and texture reflection to ensure the digital fit mirrors reality.
                             </p>
                             
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                 {[
                                     { title: "Fabric Physics", desc: "Real-time drape simulation" },
                                     { title: "Light Transport", desc: "Environment map matching" },
                                     { title: "Body Morphing", desc: "Predictive fit analysis" },
                                     { title: "Texture Preservation", desc: "4K micro-detail synthesis" }
                                 ].map((feat, i) => (
                                     <div key={i} className="border-l border-luxury-gold/50 pl-6 group hover:border-luxury-gold transition-colors duration-300">
                                         <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 group-hover:text-luxury-gold transition-colors">{feat.title}</h4>
                                         <p className="text-slate-500 text-sm font-rajdhani">{feat.desc}</p>
                                     </div>
                                 ))}
                             </div>
                        </div>
                        <div className="relative hidden md:block animate-reveal-up animate-delay-200">
                            <div className="absolute inset-0 bg-gradient-to-tr from-luxury-gold/20 to-royal-blue/20 blur-[80px]"></div>
                            <div className="relative border border-white/10 bg-white/5 p-2 rotate-3 hover:rotate-0 transition-transform duration-700 hover:scale-105 hover:shadow-2xl">
                                <img src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Gemini_SS.width-1300.jpg" className="w-full h-auto grayscale opacity-80 mix-blend-screen contrast-125" alt="Tech" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-20 md:py-32 bg-gradient-to-b from-black to-midnight relative">
                 <div className="max-w-7xl mx-auto px-6">
                     <div className="text-center mb-20 animate-reveal-up">
                        <h3 className="text-3xl md:text-5xl font-serif italic text-white mb-6">Voices of the Vanguard</h3>
                        <p className="text-slate-500 uppercase tracking-widest text-xs">Trusted by Industry Leaders & Fashion Enthusiasts</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {[
                             {
                                 quote: "The drape simulation is indistinguishable from reality. It has completely transformed how I visualize my catalogue.",
                                 author: "Aarav Patel",
                                 role: "Fashion Blogger, Mumbai"
                             },
                             {
                                 quote: "Integrating MirrorX into our Shopify store reduced return rates by 40%. The API is incredibly robust.",
                                 author: "Sanya M.",
                                 role: "Founder, The Loom Collective"
                             },
                             {
                                 quote: "Finally, I can see how a lehenga actually looks on me before buying. This is the future of shopping.",
                                 author: "Priya Kapoor",
                                 role: "Early Access Member"
                             }
                         ].map((review, i) => (
                             <div key={i} className="bg-white/5 border border-white/10 p-10 hover:border-luxury-gold/30 transition-all duration-300 group animate-reveal-up" style={{animationDelay: `${i * 150}ms`}}>
                                 <div className="mb-6">
                                     {[1,2,3,4,5].map(star => (
                                         <span key={star} className="text-luxury-gold text-sm animate-pulse-slow" style={{animationDelay: `${star * 200}ms`}}>★</span>
                                     ))}
                                 </div>
                                 <p className="text-slate-300 font-rajdhani text-lg leading-relaxed mb-8 italic">"{review.quote}"</p>
                                 <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-gold to-black flex items-center justify-center font-bold text-white text-xs ring-2 ring-white/10 group-hover:ring-luxury-gold/50 transition-all">
                                         {review.author[0]}
                                     </div>
                                     <div>
                                         <p className="text-white font-bold uppercase tracking-widest text-xs">{review.author}</p>
                                         <p className="text-slate-500 text-[10px] uppercase tracking-wider">{review.role}</p>
                                     </div>
                                 </div>
                             </div>
                         ))}
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

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl transition-transform duration-500 ease-in-out md:hidden flex flex-col items-center justify-center gap-8 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
            <button 
                className="absolute top-8 right-8 text-slate-500 hover:text-white p-2" 
                onClick={() => setMobileMenuOpen(false)}
            >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="flex flex-col items-center gap-10">
                {['TRY_ON', 'WARDROBE', 'RECOMMENDATIONS', 'PRICING'].map((view) => (
                    <button 
                        key={view}
                        onClick={() => handleNavClick(AppState[view as keyof typeof AppState])} 
                        className={`text-2xl font-serif italic tracking-widest transition-all hover:scale-105 ${currentView === AppState[view as keyof typeof AppState] ? 'text-luxury-gold' : 'text-slate-500'}`}
                    >
                        {view.replace('_', ' ')}
                    </button>
                ))}
                
                {/* Mobile: Added Partner/B2B Link to fix visibility issue */}
                 <button 
                    onClick={() => handleNavClick(AppState.B2B_INFO)}
                    className={`text-2xl font-serif italic tracking-widest transition-all hover:scale-105 ${currentView === AppState.B2B_INFO ? 'text-luxury-gold' : 'text-slate-500'}`}
                >
                    PARTNER (B2B)
                </button>

                {/* Mobile User Actions */}
                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col items-center gap-4 w-64">
                    {user ? (
                        <>
                            <div className="flex items-center gap-4">
                                <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full border border-luxury-gold/50" />
                                <span className="text-white font-rajdhani">{user.name}</span>
                            </div>
                            <div className="text-luxury-gold font-mono text-sm">{credits.daily + credits.purchased} Credits</div>
                            <button onClick={handleLogout} className="text-xs uppercase font-bold text-slate-500 hover:text-white mt-4">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => { setMobileMenuOpen(false); setShowAuthModal(true); }}
                            className="text-sm uppercase font-bold text-white border border-white/20 px-8 py-3 hover:bg-white hover:text-black transition-all duration-300 hover:scale-105"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-20 md:h-24 flex items-center justify-between px-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView(AppState.HOME)}
          >
            <MirrorXLogo className="h-8 w-8 md:h-10 md:w-10 group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-500 group-hover:rotate-180" />
            <span className="text-xl md:text-2xl font-orbitron font-bold tracking-widest text-white">MIRROR<span className="text-luxury-gold">X</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
             {['TRY_ON', 'WARDROBE', 'RECOMMENDATIONS', 'PRICING'].map((view) => (
                <button 
                  key={view}
                  onClick={() => handleNavClick(AppState[view as keyof typeof AppState])} 
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-luxury-gold relative group ${currentView === AppState[view as keyof typeof AppState] ? 'text-luxury-gold' : 'text-slate-500'}`}
                >
                  {view.replace('_', ' ')}
                  <span className={`absolute -bottom-2 left-0 w-full h-[1px] bg-luxury-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${currentView === AppState[view as keyof typeof AppState] ? 'scale-x-100' : ''}`}></span>
                </button>
             ))}
             {/* Desktop: Added Partner/B2B Link for consistency */}
             <button 
                onClick={() => handleNavClick(AppState.B2B_INFO)}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-luxury-gold relative group ${currentView === AppState.B2B_INFO ? 'text-luxury-gold' : 'text-slate-500'}`}
             >
                PARTNER
                <span className={`absolute -bottom-2 left-0 w-full h-[1px] bg-luxury-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${currentView === AppState.B2B_INFO ? 'scale-x-100' : ''}`}></span>
             </button>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Balance</span>
                <span className="text-luxury-gold font-bold font-mono">{credits.daily + credits.purchased} Credits</span>
             </div>
             
             {user ? (
                 <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                     <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-luxury-gold/50 hover:border-luxury-gold transition-colors duration-300" />
                     <button onClick={handleLogout} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors">
                        Logout
                     </button>
                 </div>
             ) : (
                 <button 
                    onClick={() => setShowAuthModal(true)}
                    className="hidden md:block text-xs uppercase font-bold text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all duration-300 hover:scale-105"
                 >
                    Login
                 </button>
             )}

             {/* Hamburger Menu Button */}
             <button 
                className="md:hidden text-white p-2 focus:outline-none" 
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Menu"
             >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-20 md:pt-24 min-h-screen">
        {renderContent()}
      </main>

      <footer className="relative z-10 py-16 border-t border-white/5 bg-black">
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
                         <li onClick={() => openLegal('TECH')} className="hover:text-luxury-gold cursor-pointer transition-colors">Technology</li>
                         <li onClick={() => handleNavClick(AppState.PRICING)} className="hover:text-luxury-gold cursor-pointer transition-colors">Pricing</li>
                         <li onClick={() => openLegal('TERMS')} className="hover:text-luxury-gold cursor-pointer transition-colors">API Access</li>
                     </ul>
                 </div>
                 <div>
                     <h4 className="text-white font-bold mb-4">Legal</h4>
                     <ul className="space-y-2 text-slate-500">
                         <li onClick={() => openLegal('PRIVACY')} className="hover:text-luxury-gold cursor-pointer transition-colors">Privacy</li>
                         <li onClick={() => openLegal('TERMS')} className="hover:text-luxury-gold cursor-pointer transition-colors">Terms</li>
                         <li onClick={() => openLegal('CONTACT')} className="hover:text-luxury-gold cursor-pointer transition-colors">Contact</li>
                         <li onClick={() => openLegal('REFUND')} className="hover:text-luxury-gold cursor-pointer transition-colors">Refund Policy</li>
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
