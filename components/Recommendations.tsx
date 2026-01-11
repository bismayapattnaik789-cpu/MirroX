import React, { useState } from 'react';
import { analyzeStyleAndRecommend } from '../services/geminiService';
import Loader from './Loader';
import { Recommendation } from '../types';

interface RecommendationsProps {
  userFaceImage: string | null;
}

const Recommendations: React.FC<RecommendationsProps> = ({ userFaceImage }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);

  const activeImage = userFaceImage || localImage;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getRecommendations = async () => {
    if (!activeImage) return;
    setLoading(true);
    setError(null);
    try {
      const results = await analyzeStyleAndRecommend(activeImage);
      setRecommendations(results);
    } catch (e) {
      setError("AI Stylist Connection Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-20">
         <h2 className="text-5xl font-serif italic text-white mb-6">
          AI Stylist
        </h2>
        <div className="h-[1px] w-20 bg-luxury-gold mx-auto mb-6"></div>
        <p className="text-slate-400 text-sm uppercase tracking-[0.3em] font-rajdhani">
           Biometric Fashion Analysis & Curation
        </p>
      </div>

      {!activeImage ? (
        <div className="max-w-lg mx-auto border border-white/10 bg-white/5 p-16 text-center hover:border-luxury-gold/50 transition-colors group">
           <div className="w-16 h-16 mx-auto mb-6 border border-white/20 rounded-full flex items-center justify-center group-hover:border-luxury-gold">
              <span className="text-2xl text-slate-400 group-hover:text-luxury-gold">+</span>
           </div>
           <p className="text-white font-orbitron text-sm mb-8 uppercase tracking-[0.2em]">Upload Portrait for Analysis</p>
           <label className="block w-full">
             <input type="file" onChange={handleFileChange} accept="image/*" className="hidden"/>
             <span className="btn-luxury px-8 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer inline-block">Select Image</span>
           </label>
        </div>
      ) : (
        <div className="flex flex-col items-center">
            {/* User Image Preview */}
            <div className="relative w-40 h-40 mb-12 p-1 border border-luxury-gold/30 rounded-full">
                 <img src={activeImage} alt="Profile" className="w-full h-full object-cover rounded-full grayscale opacity-80" />
            </div>
            
            {!loading && recommendations.length === 0 && (
                <button 
                  onClick={getRecommendations}
                  className="btn-primary-gold px-12 py-4 font-orbitron text-xs uppercase tracking-[0.3em]"
                >
                    Initiate Analysis
                </button>
            )}
        </div>
      )}

      {loading && <Loader />}
      {error && <p className="text-red-400 font-rajdhani text-center mt-6 tracking-wide border-b border-red-900 inline-block mx-auto">{error}</p>}

      {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
              {recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-gradient-to-b from-gray-900 to-black p-10 border border-white/5 hover:border-luxury-gold/30 transition-colors group">
                      <div className="flex justify-between items-start mb-8">
                           <span className="font-serif italic text-3xl text-white/20 group-hover:text-luxury-gold transition-colors">{idx + 1}</span>
                           <div className="h-[1px] w-12 bg-luxury-gold/50 mt-4"></div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-4 font-orbitron uppercase tracking-wide">{rec.title}</h3>
                      <p className="text-slate-400 font-rajdhani text-sm mb-10 leading-relaxed">{rec.description}</p>
                      
                      <div className="space-y-4">
                          <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-[0.2em] block mb-2">Color Palette</span>
                          <div className="flex gap-4">
                              {rec.colorPalette.map((color, i) => (
                                  <div key={i} className="flex flex-col items-center gap-2">
                                     <div 
                                        className="w-10 h-10 rounded-full border border-white/10 shadow-lg" 
                                        style={{ backgroundColor: color }}
                                     ></div>
                                     <span className="text-[9px] text-slate-600 uppercase font-mono">{color}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Recommendations;