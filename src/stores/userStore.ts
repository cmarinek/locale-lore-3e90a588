import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    locationSharing: boolean;
  };
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface UserState {
  // Authentication state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  // User profile and preferences
  profile: UserProfile | null;
  preferences: UserPreferences;
  
  // User location
  location: [number, number] | null;
  locationPermission: 'granted' | 'denied' | 'prompt' | null;
  
  // User activity
  savedFacts: string[];
  recentlyViewed: string[];
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setLocation: (location: [number, number] | null) => void;
  setLocationPermission: (permission: UserState['locationPermission']) => void;
  toggleSavedFact: (factId: string) => void;
  addToRecentlyViewed: (factId: string) => void;
  clearRecentlyViewed: () => void;
  resetUserState: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
  privacy: {
    profileVisibility: 'public',
    locationSharing: false,
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      authError: null,
      
      profile: null,
      preferences: DEFAULT_PREFERENCES,
      
      location: null,
      locationPermission: null,
      
      savedFacts: [],
      recentlyViewed: [],
      
      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        authError: null 
      }),
      
      setSession: (session) => set({ 
        session,
        user: session?.user || null,
        isAuthenticated: !!session?.user
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setAuthError: (error) => set({ authError: error }),
      setProfile: (profile) => set({ profile }),
      
      updatePreferences: (newPreferences) => set((state) => ({
        preferences: { ...state.preferences, ...newPreferences }
      })),
      
      setLocation: (location) => set({ location }),
      setLocationPermission: (permission) => set({ locationPermission: permission }),
      
      toggleSavedFact: (factId) => set((state) => {
        const savedFacts = state.savedFacts.includes(factId)
          ? state.savedFacts.filter(id => id !== factId)
          : [...state.savedFacts, factId];
        return { savedFacts };
      }),
      
      addToRecentlyViewed: (factId) => set((state) => {
        const recentlyViewed = [factId, ...state.recentlyViewed.filter(id => id !== factId)];
        return { recentlyViewed: recentlyViewed.slice(0, 50) }; // Keep last 50
      }),
      
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
      
      resetUserState: () => set({
        user: null,
        session: null,
        isAuthenticated: false,
        authError: null,
        profile: null,
        location: null,
        savedFacts: [],
        recentlyViewed: [],
      }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        preferences: state.preferences,
        savedFacts: state.savedFacts,
        recentlyViewed: state.recentlyViewed,
        locationPermission: state.locationPermission,
      }),
    }
  )
);