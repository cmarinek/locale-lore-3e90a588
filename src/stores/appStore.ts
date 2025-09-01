import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  profile?: {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  };
}

interface SearchState {
  query: string;
  location?: { lat: number; lng: number; name?: string };
  category?: string;
  verified?: boolean;
  timeRange?: string;
  sortBy: 'relevance' | 'date' | 'popularity';
  searchHistory: string[];
  savedSearches: Array<{
    id: string;
    name: string;
    query: string;
    filters: any;
    createdAt: string;
  }>;
}

interface AppState {
  // User data
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Search state
  search: SearchState;
  setSearchQuery: (query: string) => void;
  setSearchLocation: (location: { lat: number; lng: number; name?: string } | undefined) => void;
  setSearchCategory: (category: string | undefined) => void;
  setSearchVerified: (verified: boolean | undefined) => void;
  setSearchTimeRange: (timeRange: string | undefined) => void;
  setSearchSortBy: (sortBy: 'relevance' | 'date' | 'popularity') => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  addSavedSearch: (name: string, query: string, filters: any) => void;
  removeSavedSearch: (id: string) => void;
  clearSearchFilters: () => void;
  
  // UI state
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeTab: 'explore' | 'search' | 'submit' | 'profile';
  setActiveTab: (tab: 'explore' | 'search' | 'submit' | 'profile') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      search: {
        query: '',
        location: undefined,
        category: undefined,
        verified: undefined,
        timeRange: undefined,
        sortBy: 'relevance',
        searchHistory: [],
        savedSearches: [],
      },
      isMobileMenuOpen: false,
      activeTab: 'explore',

      // User actions
      setUser: (user) => set({ user }),

      // Search actions
      setSearchQuery: (query) =>
        set((state) => ({
          search: { ...state.search, query },
        })),

      setSearchLocation: (location) =>
        set((state) => ({
          search: { ...state.search, location },
        })),

      setSearchCategory: (category) =>
        set((state) => ({
          search: { ...state.search, category },
        })),

      setSearchVerified: (verified) =>
        set((state) => ({
          search: { ...state.search, verified },
        })),

      setSearchTimeRange: (timeRange) =>
        set((state) => ({
          search: { ...state.search, timeRange },
        })),

      setSearchSortBy: (sortBy) =>
        set((state) => ({
          search: { ...state.search, sortBy },
        })),

      addToSearchHistory: (query) =>
        set((state) => {
          const history = [
            query,
            ...state.search.searchHistory.filter((item) => item !== query),
          ].slice(0, 10);
          return {
            search: { ...state.search, searchHistory: history },
          };
        }),

      clearSearchHistory: () =>
        set((state) => ({
          search: { ...state.search, searchHistory: [] },
        })),

      addSavedSearch: (name, query, filters) =>
        set((state) => {
          const savedSearch = {
            id: Date.now().toString(),
            name,
            query,
            filters,
            createdAt: new Date().toISOString(),
          };
          return {
            search: {
              ...state.search,
              savedSearches: [...state.search.savedSearches, savedSearch],
            },
          };
        }),

      removeSavedSearch: (id) =>
        set((state) => ({
          search: {
            ...state.search,
            savedSearches: state.search.savedSearches.filter((s) => s.id !== id),
          },
        })),

      clearSearchFilters: () =>
        set((state) => ({
          search: {
            ...state.search,
            location: undefined,
            category: undefined,
            verified: undefined,
            timeRange: undefined,
            sortBy: 'relevance',
          },
        })),

      // UI actions
      setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        search: {
          searchHistory: state.search.searchHistory,
          savedSearches: state.search.savedSearches,
        },
      }),
    }
  )
);