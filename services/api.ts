
import { User, UserCredits, SavedOutfit } from '../types';

// CONFIGURATION
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : '/api'; // Relative path for deployed version if served together, or full URL

// Helper to handle Token
const getToken = () => localStorage.getItem('mx_token');
const setToken = (t: string) => localStorage.setItem('mx_token', t);
const clearToken = () => localStorage.removeItem('mx_token');

const getHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const api = {
  
  // --- AUTH ---
  
  signupEmail: async (data: any): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Signup failed');
    }
    const result = await res.json();
    setToken(result.token);
    return result.user;
  },

  loginEmail: async (data: any): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
    }
    const result = await res.json();
    setToken(result.token);
    return result.user;
  },

  loginGoogle: async (credential: string): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
    });
    if (!res.ok) throw new Error('Google Login Failed');
    const result = await res.json();
    setToken(result.token);
    return result.user;
  },

  logout: () => {
      clearToken();
  },

  // --- DATA ---
  
  getWardrobe: async (userId: string): Promise<SavedOutfit[]> => {
    const res = await fetch(`${API_BASE_URL}/wardrobe`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  saveToWardrobe: async (userId: string, item: SavedOutfit): Promise<SavedOutfit> => {
    const res = await fetch(`${API_BASE_URL}/wardrobe`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ image: item.image })
    });
    return res.json();
  },

  deleteFromWardrobe: async (userId: string, itemId: string): Promise<void> => {
     // Implement if needed on backend
  },

  // --- CREDITS ---
  deductCredit: async (userId: string): Promise<UserCredits> => {
    const res = await fetch(`${API_BASE_URL}/credits/deduct`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({})
    });
    const data = await res.json();
    return data; // { daily: x, purchased: y }
  },

  // --- PAYMENTS ---
  createOrder: async (amount: number, credits: number) => {
    const res = await fetch(`${API_BASE_URL}/payment/order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, credits })
    });
    return res.json();
  },

  verifyPayment: async (paymentData: any) => {
    const res = await fetch(`${API_BASE_URL}/payment/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    return res.json();
  }
};
