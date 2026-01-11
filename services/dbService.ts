
import { User, UserCredits, SavedOutfit } from '../types';

// Storage Keys
const KEY_USERS = 'mirrorx_users';
const KEY_CURRENT_USER = 'mirrorx_current_user_id';
const KEY_DATA = 'mirrorx_data';

// Initial Data
const DEFAULT_CREDITS: UserCredits = { daily: 5, purchased: 0 };

interface UserData {
  credits: UserCredits;
  wardrobe: SavedOutfit[];
}

interface DbSchema {
  [userId: string]: UserData;
}

// Helper to get DB
const getDb = (): DbSchema => {
  const data = localStorage.getItem(KEY_DATA);
  return data ? JSON.parse(data) : {};
};

// Helper to save DB
const saveDb = (data: DbSchema) => {
  localStorage.setItem(KEY_DATA, JSON.stringify(data));
};

export const dbService = {
  // --- AUTHENTICATION ---
  
  async loginWithGoogle(): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock User from Google
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: 'Ananya Sharma', // Targeted Indian market name for demo
      email: 'ananya.sharma@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
    };

    // Check if we need to initialize data for this user
    const db = getDb();
    if (!db[mockUser.id]) {
      db[mockUser.id] = {
        credits: DEFAULT_CREDITS,
        wardrobe: []
      };
      saveDb(db);
    }

    localStorage.setItem(KEY_CURRENT_USER, mockUser.id);
    // In a real app, we'd store the user object more securely or fetch from backend
    localStorage.setItem(KEY_USERS, JSON.stringify({ [mockUser.id]: mockUser })); 
    
    return mockUser;
  },

  getCurrentUser(): User | null {
    const userId = localStorage.getItem(KEY_CURRENT_USER);
    if (!userId) return null;
    
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '{}');
    return users[userId] || null;
  },

  logout() {
    localStorage.removeItem(KEY_CURRENT_USER);
  },

  // --- DATA ACCESS ---

  getUserData(userId: string): UserData {
    const db = getDb();
    return db[userId] || { credits: DEFAULT_CREDITS, wardrobe: [] };
  },

  updateCredits(userId: string, credits: UserCredits) {
    const db = getDb();
    if (db[userId]) {
      db[userId].credits = credits;
      saveDb(db);
    }
  },

  saveToWardrobe(userId: string, item: SavedOutfit) {
    const db = getDb();
    if (db[userId]) {
      db[userId].wardrobe = [item, ...db[userId].wardrobe];
      saveDb(db);
    }
  },

  removeFromWardrobe(userId: string, itemId: string) {
    const db = getDb();
    if (db[userId]) {
      db[userId].wardrobe = db[userId].wardrobe.filter(i => i.id !== itemId);
      saveDb(db);
    }
  }
};
