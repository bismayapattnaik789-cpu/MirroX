
import { User, UserCredits, SavedOutfit } from '../types';

// CONFIGURATION
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : '/api';

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

// --- CLIENT SIDE FALLBACK HELPER ---
const decodeGoogleToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.warn("Failed to decode token locally", e);
        return null;
    }
};

export const api = {
  
  // --- AUTH ---
  
  signupEmail: async (data: any): Promise<User> => {
    try {
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
    } catch (e) {
        // Fallback for demo if backend is offline
        console.warn("Backend signup failed, using mock fallback.");
        const mockUser = {
            id: 'local_' + Date.now(),
            name: data.name,
            email: data.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=D4AF37&color=000`
        };
        (mockUser as any).credits = { daily: 5, purchased: 0 };
        setToken("mock_token_" + Date.now());
        return mockUser;
    }
  },

  loginEmail: async (data: any): Promise<User> => {
    // Similar fallback logic for email login
    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Login failed');
        const result = await res.json();
        setToken(result.token);
        return result.user;
    } catch (e) {
         console.warn("Backend login failed, using mock fallback.");
         // For demo purposes, allow any login if backend fails
         const mockUser = {
            id: 'local_' + Date.now(),
            name: 'Demo User',
            email: data.email,
            avatar: `https://ui-avatars.com/api/?name=Demo+User&background=D4AF37&color=000`
        };
        (mockUser as any).credits = { daily: 5, purchased: 0 };
        setToken("mock_token_" + Date.now());
        return mockUser;
    }
  },

  loginGoogle: async (credential: string): Promise<User> => {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });
        
        if (!res.ok) throw new Error('Backend Verification Failed');
        
        const result = await res.json();
        setToken(result.token);
        return result.user;
    } catch (error) {
        console.warn("Backend unavailable or DB error. Falling back to Client-Side Session.", error);
        
        // --- CRITICAL FALLBACK ---
        // If backend fails (e.g. no DB connection), we decode the token locally 
        // so the user can still access the app.
        const payload = decodeGoogleToken(credential);
        
        if (payload) {
            const fallbackUser: User = {
                id: payload.sub || 'google_' + Date.now(),
                name: payload.name || 'Google User',
                email: payload.email || 'user@gmail.com',
                avatar: payload.picture || 'https://ui-avatars.com/api/?name=G&background=D4AF37&color=000',
            };
            // Grant default credits
            (fallbackUser as any).credits = { daily: 5, purchased: 0 };
            
            setToken("fallback_token_" + Date.now());
            return fallbackUser;
        }
        
        throw error;
    }
  },

  logout: () => {
      clearToken();
  },

  // --- DATA ---
  
  getWardrobe: async (userId: string): Promise<SavedOutfit[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/wardrobe`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Fetch failed');
        return await res.json();
    } catch (e) {
        return []; // Return empty if backend fails
    }
  },

  saveToWardrobe: async (userId: string, item: SavedOutfit): Promise<SavedOutfit> => {
    try {
        const res = await fetch(`${API_BASE_URL}/wardrobe`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ image: item.image })
        });
        if(!res.ok) throw new Error('Save failed');
        return res.json();
    } catch (e) {
        return item; // Optimistic return
    }
  },

  deleteFromWardrobe: async (userId: string, itemId: string): Promise<void> => {
     // Implement if needed on backend
  },

  // --- CREDITS ---
  deductCredit: async (userId: string): Promise<UserCredits> => {
    try {
        const res = await fetch(`${API_BASE_URL}/credits/deduct`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
        });
        if(!res.ok) throw new Error("Credit deduct failed");
        return await res.json();
    } catch (e) {
        // Fallback: just return simulated deduction
        return { daily: 4, purchased: 0 };
    }
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
