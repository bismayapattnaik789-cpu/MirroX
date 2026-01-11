
import React from 'react';
import { PricingTier, User } from '../types';
import { B2C_PRICING, B2B_PRICING } from '../constants';
import { api } from '../services/api';

interface PricingProps {
  type: 'B2C' | 'B2B';
  user?: User | null;
  onCreditsUpdate?: (credits: any) => void;
}

// Helper to parse price string to number
const parsePrice = (priceStr: string) => {
  if (priceStr === 'Free') return 0;
  return parseInt(priceStr.replace(/[^\d]/g, ''));
};

const PricingCard: React.FC<{ tier: PricingTier; index: number; user?: User | null; onCreditsUpdate?: (c:any)=>void }> = ({ tier, index, user, onCreditsUpdate }) => {
    const isGold = tier.isPopular;
    const priceAmount = parsePrice(tier.price);

    const handlePurchase = async () => {
      if (tier.price === 'Free') return; // Handle Free logic
      if (!user) {
        alert("Please login to purchase credits.");
        return;
      }

      try {
        // 1. Create Order
        // Assuming Power Pack = 20 credits, others = 0 or custom logic
        const creditsToAdd = tier.id === 'b2c-credits' ? 20 : 0; 
        
        const order = await api.createOrder(priceAmount, creditsToAdd);

        // 2. Open Razorpay
        const options = {
          key: "rzp_test_1234567890", // Public Key (In real app, move to env)
          amount: order.amount,
          currency: "INR",
          name: "MirrorX Atelier",
          description: `Purchase: ${tier.name}`,
          order_id: order.id,
          handler: async function (response: any) {
             // 3. Verify Payment
             const verifyRes = await api.verifyPayment({
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature || "mock_sig", // Mock backend ignores signature if needed
               userId: user.id,
               creditsToAdd: creditsToAdd,
               amount: priceAmount
             });

             if (verifyRes.success) {
               alert("Payment Successful! Credits added.");
               if (onCreditsUpdate) onCreditsUpdate(verifyRes.credits);
             } else {
               alert("Payment verification failed.");
             }
          },
          theme: { color: "#D4AF37" }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();

      } catch (e) {
        console.error("Payment Error", e);
        alert("Payment initialization failed. Ensure backend is running.");
      }
    };
    
    return (
      <div className={`relative flex flex-col p-8 md:p-10 border transition-all duration-500 group 
        ${isGold ? 'bg-gradient-to-b from-gray-900 to-black border-luxury-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
      >
        {isGold && (
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <span className="bg-luxury-gold text-black text-[10px] font-bold px-4 py-1 uppercase tracking-[0.2em]">Premium Choice</span>
          </div>
        )}
        
        <h3 className={`text-lg font-bold mb-4 font-orbitron uppercase tracking-[0.2em] ${isGold ? 'text-luxury-gold' : 'text-slate-400'}`}>
            {tier.name}
        </h3>
        
        <div className="text-5xl font-serif italic text-white mb-8">
          {tier.price}
          {tier.price !== 'Free' && tier.type === 'B2C' && tier.id.includes('sub') && <span className="text-xs text-slate-500 font-sans normal-case ml-2 not-italic">/ month</span>}
        </div>
        
        <ul className="flex-1 space-y-6 mb-12">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-slate-300 font-rajdhani text-sm tracking-wide">
              <span className={`mr-4 h-[1px] w-3 mt-3 ${isGold ? 'bg-luxury-gold' : 'bg-slate-600'}`}></span>
              {feature}
            </li>
          ))}
        </ul>
        
        <button 
          onClick={handlePurchase}
          className={`w-full py-4 uppercase tracking-[0.2em] text-xs font-bold transition-all
            ${isGold ? 'bg-luxury-gold text-black hover:bg-white' : 'border border-white/20 text-white hover:bg-white hover:text-black'}`}
        >
          {tier.price === 'Free' ? 'Current Plan' : 'Purchase'}
        </button>
      </div>
    );
};

const Pricing: React.FC<PricingProps> = ({ type, user, onCreditsUpdate }) => {
  const tiers = type === 'B2C' ? B2C_PRICING : B2B_PRICING;

  return (
    <div className="w-full max-w-7xl mx-auto py-20 px-6">
      <div className="text-center mb-24">
        <h2 className="text-5xl md:text-6xl font-serif italic text-white mb-6">
          {type === 'B2C' ? 'Private Access' : 'Enterprise Integration'}
        </h2>
        <div className="h-[1px] w-24 bg-luxury-gold mx-auto mb-6"></div>
        <p className="text-slate-400 text-sm tracking-[0.3em] uppercase max-w-2xl mx-auto font-rajdhani">
          {type === 'B2C' 
            ? 'Select a tier to unlock the full capabilities of the MirrorX Engine.' 
            : 'Bring the future of retail to your digital storefront.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {tiers.map((tier, idx) => (
          <PricingCard key={tier.id} tier={tier} index={idx} user={user} onCreditsUpdate={onCreditsUpdate} />
        ))}
      </div>
    </div>
  );
};

export default Pricing;