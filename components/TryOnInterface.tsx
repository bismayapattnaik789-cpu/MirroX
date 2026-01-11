
import React, { useState, useRef, useEffect } from 'react';
import { generateTryOnImage, suggestMatchingItems, extractProductImageFromUrl } from '../services/geminiService';
import Loader from './Loader';
import ProductModal from './ProductModal';
import { UserCredits, SavedOutfit, ProductLink } from '../types';

interface TryOnInterfaceProps {
  credits: UserCredits;
  deductCredit: () => void;
  onSaveToWardrobe: (outfit: SavedOutfit) => void;
  setGlobalFaceImage: (img: string) => void;
}

const TryOnInterface: React.FC<TryOnInterfaceProps> = ({ credits, deductCredit, onSaveToWardrobe, setGlobalFaceImage }) => {
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [dressImage, setDressImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [suggestedLinks, setSuggestedLinks] = useState<ProductLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [linksLoading, setLinksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyBtn, setShowKeyBtn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // New: Selected product for Modal
  const [selectedProduct, setSelectedProduct] = useState<ProductLink | null>(null);
  
  // Apparel Input Mode State
  const [apparelMode, setApparelMode] = useState<'upload' | 'link'>('upload');
  // Outfit Composition Mode: 'part' (Single Item) vs 'full' (Entire Outfit)
  const [outfitMode, setOutfitMode] = useState<'part' | 'full'>('part');
  
  const [productUrl, setProductUrl] = useState('');
  const [isUrlScanning, setIsUrlScanning] = useState(false);

  const faceInputRef = useRef<HTMLInputElement>(null);
  const dressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
        const aistudio = (window as any).aistudio;
        if(aistudio && await aistudio.hasSelectedApiKey() === false) {
             setShowKeyBtn(true);
        }
    }
    checkKey();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'face' | 'dress') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'face') {
            setFaceImage(result);
            setGlobalFaceImage(result);
        } else {
            setDressImage(result);
            setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl) return;

    setIsUrlScanning(true);
    setError(null);
    try {
        const imageData = await extractProductImageFromUrl(productUrl);
        setDressImage(imageData);
    } catch (err: any) {
        setError(err.message || "Failed to fetch image from URL");
    } finally {
        setIsUrlScanning(false);
    }
  };

  const addWatermark = async (imgSrc: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(imgSrc); return; }
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const fontSize = Math.max(20, img.width * 0.04);
            ctx.font = `900 ${fontSize}px 'Playfair Display'`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#D4AF37'; 
            ctx.fillText('MirrorX Atelier', canvas.width - 30, canvas.height - 30);

            resolve(canvas.toDataURL('image/png'));
        };
        img.src = imgSrc;
    });
  };

  const handleGenerate = async () => {
    if (!faceImage || !dressImage) {
      setError("Please provide both a face reference and a clothing item.");
      return;
    }

    if (credits.daily <= 0 && credits.purchased <= 0) {
        setError("Insufficient credits. Please upgrade your plan.");
        return;
    }

    setLoading(true);
    setLinksLoading(true);
    setGeneratedImage(null);
    setSuggestedLinks([]);
    setIsSaved(false);
    setError(null);

    try {
      const isFullOutfit = outfitMode === 'full';
      const rawResult = await generateTryOnImage(faceImage, dressImage, () => setShowKeyBtn(true), isFullOutfit);
      const watermarked = await addWatermark(rawResult);
      setGeneratedImage(watermarked);
      deductCredit();

      suggestMatchingItems(dressImage)
        .then(links => setSuggestedLinks(links))
        .catch(console.error)
        .finally(() => setLinksLoading(false));

    } catch (err: any) {
      console.error(err);
      if(!showKeyBtn) {
          setError("The Neural Engine encountered resistance. Try a clearer image.");
      }
      setLinksLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToWardrobe = () => {
    if (generatedImage && !isSaved) {
        onSaveToWardrobe({
            id: Date.now().toString(),
            image: generatedImage,
            timestamp: Date.now()
        });
        setIsSaved(true);
    }
  };

  const handleShare = async (platform: 'whatsapp' | 'download') => {
      if (!generatedImage) return;
      if (platform === 'whatsapp') {
          const text = encodeURIComponent("Designed with MirrorX Atelier.");
          window.open(`https://wa.me/?text=${text}`, '_blank');
      } else {
         const link = document.createElement('a');
         link.href = generatedImage;
         link.download = 'MirrorX-Couture.png';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      }
  };

  const handleSelectKey = async () => {
      try {
        await (window as any).aistudio.openSelectKey();
        setShowKeyBtn(false);
        setError(null);
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      
      {/* Product Modal Overlay */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      {showKeyBtn && (
          <div className="mb-10 p-6 border border-luxury-gold bg-luxury-gold/5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-luxury-gold">
                  <p className="font-bold font-serif tracking-wide text-xl">Access Required</p>
                  <p className="text-sm opacity-80 font-rajdhani">Billing enablement required for Pro Neural Engine usage.</p>
              </div>
              <button onClick={handleSelectKey} className="btn-primary-gold px-8 py-3 uppercase tracking-widest text-xs">
                  Authorize Access
              </button>
          </div>
      )}

      {/* Inputs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        
        {/* Frame 1: Identity */}
        <div 
            className="group relative h-[550px] cursor-pointer transition-all duration-700"
            onClick={() => faceInputRef.current?.click()}
        >
           {/* Elegant Frame Border */}
           <div className="absolute inset-0 border border-white/10 group-hover:border-luxury-gold/50 transition-colors duration-500"></div>
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           
           <div className="absolute inset-2 bg-midnight/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 overflow-hidden">
               
               <div className="absolute top-6 left-6 z-20">
                   <span className="font-serif text-3xl italic text-white/10 group-hover:text-luxury-gold transition-colors">I.</span>
                   <span className="block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mt-1">Identity</span>
               </div>

               {faceImage ? (
                   <div className="w-full h-full relative">
                        <img src={faceImage} alt="Face" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0 duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   </div>
               ) : (
                   <div className="flex flex-col items-center justify-center text-center p-8 group-hover:-translate-y-2 transition-transform duration-500">
                       <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-6 group-hover:border-luxury-gold transition-colors">
                           <svg className="w-8 h-8 text-white/30 group-hover:text-luxury-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       </div>
                       <p className="font-serif text-2xl text-white mb-2">The Subject</p>
                       <p className="font-rajdhani text-sm text-slate-500 uppercase tracking-widest">Upload Portrait</p>
                   </div>
               )}
           </div>
           <input type="file" ref={faceInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'face')} />
        </div>

        {/* Frame 2: Outfit */}
        <div 
            className="group relative h-[550px] transition-all duration-700"
        >
           {/* Elegant Frame Border */}
           <div className="absolute inset-0 border border-white/10 group-hover:border-luxury-gold/50 transition-colors duration-500"></div>
           
           <div className="absolute inset-2 bg-midnight/50 backdrop-blur-sm flex flex-col items-center z-10 overflow-hidden">
               
               {/* Header & Controls */}
               <div className="w-full flex justify-between items-start p-6 z-20">
                   <div>
                        <span className="font-serif text-3xl italic text-white/10 group-hover:text-luxury-gold transition-colors">II.</span>
                        <span className="block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mt-1">Outfit</span>
                   </div>
                   
                   <div className="flex flex-col items-end gap-2">
                       {/* Source Toggle */}
                       <div className="flex bg-white/5 border border-white/10 rounded-sm p-1">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setApparelMode('upload'); }}
                             className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${apparelMode === 'upload' ? 'bg-luxury-gold text-black' : 'text-slate-500 hover:text-white'}`}
                           >
                             Upload
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setApparelMode('link'); }}
                             className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${apparelMode === 'link' ? 'bg-luxury-gold text-black' : 'text-slate-500 hover:text-white'}`}
                           >
                             Link
                           </button>
                       </div>

                       {/* Composition Mode Toggle */}
                       <div className="flex bg-white/5 border border-white/10 rounded-sm p-1">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setOutfitMode('part'); }}
                             className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${outfitMode === 'part' ? 'bg-luxury-gold-dim text-white' : 'text-slate-500 hover:text-white'}`}
                             title="AI will generate matching items for single pieces"
                           >
                             Part
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setOutfitMode('full'); }}
                             className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${outfitMode === 'full' ? 'bg-luxury-gold-dim text-white' : 'text-slate-500 hover:text-white'}`}
                             title="AI will preserve the entire look (Top & Bottom)"
                           >
                             Full Fit
                           </button>
                       </div>
                   </div>
               </div>

               {/* Content */}
               {dressImage ? (
                   <div className="relative w-full h-full flex-1">
                        <img src={dressImage} alt="Outfit" className="w-full h-full object-contain p-8 opacity-100" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); setDressImage(null); }}
                            className="absolute top-4 right-4 text-white/50 hover:text-red-400 transition-colors text-xs uppercase tracking-widest font-bold"
                        >
                            Remove
                        </button>
                        <div className="absolute bottom-4 left-0 w-full text-center">
                            <span className="text-[10px] text-luxury-gold bg-black/50 px-3 py-1 border border-luxury-gold/30 uppercase tracking-widest">
                                {outfitMode === 'full' ? 'Full Outfit Preservation' : 'Single Item + AI Match'}
                            </span>
                        </div>
                   </div>
               ) : (
                   <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
                       {apparelMode === 'upload' ? (
                           <div 
                                className="w-full h-full flex flex-col items-center justify-center cursor-pointer group-inner"
                                onClick={() => dressInputRef.current?.click()}
                           >
                               <div className="w-24 h-24 border border-dashed border-white/20 flex items-center justify-center mb-6 group-hover:border-luxury-gold transition-all">
                                    <svg className="w-8 h-8 text-white/30 group-hover:text-luxury-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                               </div>
                               <p className="font-serif text-2xl text-white mb-2">The Look</p>
                               <p className="font-rajdhani text-sm text-slate-500 uppercase tracking-widest">
                                   {outfitMode === 'full' ? 'Select Full Outfit Image' : 'Select Top or Bottom'}
                               </p>
                           </div>
                       ) : (
                           <div className="w-full max-w-sm text-center">
                               <p className="font-serif text-2xl text-white mb-6">Import via URL</p>
                               <div className="relative">
                                   <input 
                                      type="text" 
                                      value={productUrl}
                                      onChange={(e) => setProductUrl(e.target.value)}
                                      placeholder="Paste product link here..." 
                                      className="w-full bg-transparent border-b border-white/30 py-3 text-center text-white placeholder-white/20 focus:outline-none focus:border-luxury-gold font-rajdhani transition-colors"
                                   />
                                   <button 
                                      onClick={handleUrlScan}
                                      disabled={isUrlScanning || !productUrl}
                                      className="mt-6 btn-luxury px-8 py-2 text-xs uppercase tracking-widest font-bold"
                                   >
                                       {isUrlScanning ? 'Analyzing...' : 'Extract'}
                                   </button>
                               </div>
                               <p className="text-[10px] text-slate-600 mt-6 font-rajdhani">
                                   Compatible with major luxury & retail platforms.
                               </p>
                           </div>
                       )}
                   </div>
               )}
           </div>
           <input type="file" ref={dressInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'dress')} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-20 relative z-20">
        {error && (
            <div className="border-l-2 border-red-500 bg-red-900/10 text-red-200 font-rajdhani px-8 py-4 mb-8 text-sm tracking-wide">
                ERROR: {error}
            </div>
        )}
        
        {!loading && !generatedImage && (
          <button
            onClick={handleGenerate}
            disabled={!faceImage || !dressImage}
            className={`
              btn-primary-gold px-24 py-5 text-sm uppercase tracking-[0.3em] font-orbitron clip-polygon
              transition-all duration-300
              ${faceImage && dressImage 
                ? 'opacity-100 hover:scale-105' 
                : 'opacity-50 cursor-not-allowed grayscale'}
            `}
          >
             {showKeyBtn ? "Unlock Pro Engine" : "Generate Look"}
          </button>
        )}

        {loading && <Loader />}
      </div>

      {generatedImage && (
        <div className="animate-fade-in-up space-y-16">
            <div className="flex items-center justify-center gap-6 text-luxury-gold mb-10">
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-luxury-gold"></div>
                <div className="font-serif italic text-2xl">Result</div>
                <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-luxury-gold"></div>
            </div>
          
          <div className="flex flex-col lg:flex-row gap-16 items-start justify-center">
              {/* Image Result */}
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute -inset-4 border border-luxury-gold/20 transform rotate-2"></div>
                <div className="relative bg-midnight border border-white/10 p-2 shadow-2xl shadow-black">
                    <img src={generatedImage} alt="Generated Fit" className="w-full h-auto" />
                    
                    <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
                         <button onClick={handleSaveToWardrobe} className={`text-xs font-bold uppercase tracking-widest hover:text-luxury-gold transition-colors ${isSaved ? 'text-luxury-gold' : 'text-slate-400'}`}>
                           {isSaved ? 'Saved to Wardrobe' : 'Save to Wardrobe'}
                        </button>
                        <div className="flex gap-6">
                            <button onClick={() => handleShare('whatsapp')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                            Share
                            </button>
                            <button onClick={() => handleShare('download')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                            Download
                            </button>
                        </div>
                    </div>
                </div>
              </div>

              {/* Suggestions Panel */}
              <div className="w-full lg:w-96 glass-panel p-8 border-t border-luxury-gold/50">
                  <h4 className="text-xl font-serif text-white mb-8 italic">
                     Curated Matches
                  </h4>
                  
                  {suggestedLinks.length > 0 ? (
                      <div className="space-y-6">
                          {suggestedLinks.map((link, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setSelectedProduct(link)}
                                className="block group border-b border-white/5 pb-4 last:border-0 cursor-pointer"
                              >
                                  <div className="font-bold text-white text-sm mb-1 group-hover:text-luxury-gold transition-colors font-rajdhani uppercase tracking-wide">{link.title}</div>
                                  
                                  <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-slate-500 font-serif italic">{link.brand || 'Designer'}</span>
                                      <span className="text-[10px] bg-white/5 px-2 py-1 text-slate-400 uppercase tracking-widest group-hover:bg-luxury-gold group-hover:text-black transition-colors">Buy Now</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                       !linksLoading && (
                           <div className="text-center py-12 text-slate-600 font-rajdhani uppercase tracking-widest text-xs">
                               Market Analysis in progress...
                           </div>
                       )
                  )}
                  {linksLoading && (
                     <div className="text-center py-12">
                        <div className="w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Searching Boutiques...</span>
                     </div>
                  )}
              </div>
          </div>

           <div className="text-center mt-20">
            <button 
              onClick={() => { setGeneratedImage(null); setDressImage(null); setIsSaved(false); setSuggestedLinks([]); }}
              className="px-8 py-3 text-slate-500 font-bold font-rajdhani text-xs uppercase tracking-[0.2em] hover:text-white transition-colors border-b border-transparent hover:border-white"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryOnInterface;
