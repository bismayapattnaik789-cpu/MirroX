export interface PricingTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  type: 'B2C' | 'B2B';
}

export enum AppState {
  HOME = 'HOME',
  TRY_ON = 'TRY_ON',
  WARDROBE = 'WARDROBE',
  RECOMMENDATIONS = 'RECOMMENDATIONS',
  PRICING = 'PRICING',
  B2B_INFO = 'B2B_INFO',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface UserCredits {
  daily: number;
  purchased: number;
}

export interface SavedOutfit {
  id: string;
  image: string; // Base64
  timestamp: number;
  productUrl?: string;
}

export interface Recommendation {
  title: string;
  description: string;
  colorPalette: string[];
  styleType: string;
}

export interface ProductLink {
  title: string;
  url: string;
  source: string;
  brand?: string;
  material?: string;
  care?: string;
}