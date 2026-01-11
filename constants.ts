
import { PricingTier } from './types';

export const APP_NAME = 'MirrorX';

export const B2C_PRICING: PricingTier[] = [
  {
    id: 'b2c-basic',
    name: 'Starter',
    price: '₹0',
    features: ['5 Try-ons per day', 'HD Resolution', 'Standard Support'],
    type: 'B2C',
  },
  {
    id: 'b2c-credits',
    name: 'Power Pack',
    price: '₹99',
    features: ['20 Credits', 'No Expiry', 'Fast Processing', 'Remove Watermark'],
    type: 'B2C',
  },
  {
    id: 'b2c-sub-monthly',
    name: 'MirrorX Pro',
    price: '₹499',
    features: ['Unlimited Try-ons', '4K Ultra-HD', 'Priority Generation', 'Exclusive Styles'],
    isPopular: true,
    type: 'B2C',
  },
  {
    id: 'b2c-sub-yearly',
    name: 'MirrorX Elite',
    price: '₹4,999',
    features: ['All Monthly Benefits', '2 Months Free', 'Early Access to Beta Features'],
    type: 'B2C',
  }
];

export const B2B_PRICING: PricingTier[] = [
  {
    id: 'b2b-free',
    name: 'Shopify Trial',
    price: 'Free',
    features: ['50 Monthly Credits', 'Plugin Integration', 'Email Support'],
    type: 'B2B',
  },
  {
    id: 'b2b-lifetime',
    name: 'Enterprise Hub',
    price: '₹24,999',
    features: ['One-time Payment', 'Unlimited Traffic', 'White-label Plugin', 'Dedicated Account Manager', 'Real-time Analytics'],
    isPopular: true,
    type: 'B2B',
  }
];
