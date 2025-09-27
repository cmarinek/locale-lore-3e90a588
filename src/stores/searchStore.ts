import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchFilters } from '@/types/fact';

export interface SearchState {
  // Current search
  query: string;
  filters: SearchFilters;
  isSearching: boolean;
  searchError: string | null;
  
  // Search history and suggestions
  searchHistory: string[];
  searchSuggestions: string[];
  savedSearches: Array<{
    id: string;
    name: string;
    query: string;
    filters: SearchFilters;
    createdAt: string;
  }>;
  
  // Voice search
  isVoiceSearching: boolean;
  voiceSearchSupported: boolean;
  
  // Advanced search UI
  showAdvancedFilters: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSearching: (searching: boolean) => void;
  setSearchError: (error: string | null) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  setSuggestions: (suggestions: string[]) => void;
  clearSuggestions: () => void;
  saveSearch: (name: string, query: string, filters: SearchFilters) => void;
  removeSavedSearch: (id: string) => void;
  setVoiceSearching: (searching: boolean) => void;
  setVoiceSearchSupported: (supported: boolean) => void;
  setShowAdvancedFilters: (show: boolean) => void;
  resetSearch: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  search: '',
  category: '',
  categories: [],
  verified: undefined,
  timeRange: '',
  sortBy: 'relevance',
  location: undefined,
  radius: 10,
  center: null,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Initial state
      query: '',
      filters: DEFAULT_FILTERS,
      isSearching: false,
      searchError: null,
      
      searchHistory: [],
      searchSuggestions: [],
      savedSearches: [],
      
      isVoiceSearching: false,
      voiceSearchSupported: false,
      
      showAdvancedFilters: false,
      
      // Actions
      setQuery: (query) => set((state) => ({ 
        query,
        filters: { ...state.filters, query, search: query }
      })),
      
      setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters }
      })),
      
      setSearching: (searching) => set({ isSearching: searching }),
      setSearchError: (error) => set({ searchError: error }),
      
      addToSearchHistory: (query) => {
        if (!query.trim()) return;
        set((state) => {
          const newHistory = [query, ...state.searchHistory.filter(q => q !== query)];
          return { searchHistory: newHistory.slice(0, 20) }; // Keep last 20 searches
        });
      },
      
      clearSearchHistory: () => set({ searchHistory: [] }),
      
      setSuggestions: (suggestions) => set({ searchSuggestions: suggestions }),
      clearSuggestions: () => set({ searchSuggestions: [] }),
      
      saveSearch: (name, query, filters) => {
        const savedSearch = {
          id: Date.now().toString(),
          name,
          query,
          filters,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ 
          savedSearches: [savedSearch, ...state.savedSearches] 
        }));
      },
      
      removeSavedSearch: (id) => set((state) => ({ 
        savedSearches: state.savedSearches.filter(s => s.id !== id) 
      })),
      
      setVoiceSearching: (searching) => set({ isVoiceSearching: searching }),
      setVoiceSearchSupported: (supported) => set({ voiceSearchSupported: supported }),
      setShowAdvancedFilters: (show) => set({ showAdvancedFilters: show }),
      
      resetSearch: () => set({
        query: '',
        filters: DEFAULT_FILTERS,
        isSearching: false,
        searchError: null,
        searchSuggestions: [],
        showAdvancedFilters: false,
      }),
    }),
    {
      name: 'search-store',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        savedSearches: state.savedSearches,
        voiceSearchSupported: state.voiceSearchSupported,
      }),
    }
  )
);