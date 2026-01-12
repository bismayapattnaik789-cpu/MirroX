
import React, { useState } from 'react';

type Section = 'PRIVACY' | 'TERMS' | 'REFUND' | 'CONTACT' | 'TECH';

interface LegalDocsProps {
  initialSection?: Section;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ initialSection = 'PRIVACY' }) => {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);

  const renderContent = () => {
    switch (activeSection) {
      case 'PRIVACY':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-2xl font-serif text-white italic">Privacy Policy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Last Updated: October 2024</p>
            
            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">1. Data Collection & Biometrics</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              MirrorX ("we", "our") collects uploaded images solely for the purpose of generating virtual try-on visualizations. 
              We utilize advanced AI (Gemini Nano Pro) to process facial geometry. 
              <strong>We do not permanently store biometric identifiers.</strong> Source images are processed ephemerally and discarded from our processing servers immediately after generation, unless saved to your personal "Wardrobe" which is linked to your user account.
            </p>

            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">2. Third-Party Processing</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              To provide our service, data is processed via Google Cloud Platform and Gemini API. By using MirrorX, you acknowledge that anonymized data vectors may be processed on secure third-party GPU clusters. We ensure all partners adhere to GDPR and SOC2 compliance standards.
            </p>

            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">3. User Rights</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              You retain full ownership of your uploaded content. You may request the deletion of your account and all associated "Wardrobe" data at any time by contacting our Data Protection Officer.
            </p>
          </div>
        );
      case 'TERMS':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-2xl font-serif text-white italic">Terms of Service</h3>
            
            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">1. Service Usage</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              MirrorX provides an AI-based simulation. While we strive for hyper-realism, the generated images are artistic approximations. We do not guarantee that the physical fit of clothing purchased from third-party links will match the digital visualization exactly.
            </p>

            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">2. Prohibited Content</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              You agree not to upload nude, illegal, offensive, or non-consensual images of others. MirrorX employs automated filters to block such content. Repeated violations will result in immediate account termination without refund.
            </p>

            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">3. API Access (B2B)</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enterprise clients using our API plugin must adhere to our Rate Limiting policies. Unauthorized resale of MirrorX API tokens is strictly prohibited.
            </p>
          </div>
        );
      case 'REFUND':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-2xl font-serif text-white italic">Refund & Cancellation Policy</h3>
            
            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">1. Credit Packs</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              "Power Packs" and other one-time credit purchases are non-refundable once any credit from the pack has been utilized. This is due to the significant GPU compute costs incurred during generation.
            </p>

            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">2. Subscriptions</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monthly subscriptions (MirrorX Pro) can be cancelled at any time. If cancelled, your access continues until the end of the billing cycle. We do not offer prorated refunds for partial months.
            </p>

            <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mt-6">3. Technical Failures</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              If a technical error on our end results in a failed generation where credits were deducted but no image was produced, we will automatically refund those specific credits to your account balance.
            </p>
          </div>
        );
      case 'CONTACT':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-2xl font-serif text-white italic">Contact Us</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              For support, partnerships, or legal inquiries, please reach out to our team.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="border border-white/10 p-6 bg-white/5">
                    <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mb-2">General Support</h4>
                    <p className="text-white font-rajdhani">support@mirrorx.co.in</p>
                    <p className="text-slate-500 text-xs mt-1">Response time: Within 24 hours</p>
                </div>
                <div className="border border-white/10 p-6 bg-white/5">
                    <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mb-2">Enterprise / B2B</h4>
                    <p className="text-white font-rajdhani">partners@mirrorx.com</p>
                    <p className="text-slate-500 text-xs mt-1">For Shopify integration inquiries</p>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className="text-luxury-gold font-bold uppercase tracking-widest text-xs mb-4">Corporate Office</h4>
                <p className="text-slate-400 text-sm font-rajdhani">
                    MirrorX Inc.<br/>
                    Prestige Tech Park, Marathahalli<br/>
                    Bangalore, Karnataka 560103<br/>
                    India
                </p>
            </div>
          </div>
        );
      case 'TECH':
         return (
            <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-2xl font-serif text-white italic">Technology Stack</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
                MirrorX is built on the bleeding edge of Generative AI and Computer Vision.
            </p>
            
            <ul className="space-y-4 mt-6">
                <li className="flex items-start">
                    <span className="text-luxury-gold mr-3">►</span>
                    <div>
                        <strong className="text-white font-rajdhani block">Gemini Nano Pro Integration</strong>
                        <span className="text-slate-500 text-sm">We utilize the latest multimodal models for high-fidelity texture mapping and lighting estimation.</span>
                    </div>
                </li>
                <li className="flex items-start">
                    <span className="text-luxury-gold mr-3">►</span>
                    <div>
                        <strong className="text-white font-rajdhani block">Semantic Segmentation</strong>
                        <span className="text-slate-500 text-sm">Proprietary algorithms separate garment layers to ensure the "tuck-in" and "drape" look physically accurate.</span>
                    </div>
                </li>
            </ul>
          </div>
         );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 md:gap-12">
      {/* Sidebar Navigation - Optimized for Mobile Horizontal Scroll */}
      <div className="w-full md:w-64 flex flex-row md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 pr-0 md:pr-6 gap-4 md:gap-2 no-scrollbar">
        <h2 className="hidden md:block text-lg font-orbitron font-bold text-white mb-6 uppercase tracking-widest">Legal & Info</h2>
        {[
          { id: 'PRIVACY', label: 'Privacy Policy' },
          { id: 'TERMS', label: 'Terms of Service' },
          { id: 'REFUND', label: 'Refund Policy' },
          { id: 'TECH', label: 'Technology' },
          { id: 'CONTACT', label: 'Contact Us' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as Section)}
            className={`whitespace-nowrap flex-shrink-0 text-left text-xs uppercase tracking-[0.2em] py-2 px-4 md:py-3 transition-all
              ${activeSection === item.id 
                ? 'border-b-2 md:border-b-0 md:border-l-2 border-luxury-gold text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:border-white/20'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[500px]">
         {renderContent()}
      </div>
    </div>
  );
};

export default LegalDocs;
