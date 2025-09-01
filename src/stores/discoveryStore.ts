import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { usePerformanceStore } from './performanceStore';

interface SearchFilters {
  categories: string[];
  radius: number;
  center: [number, number] | null;
  sortBy: 'recency' | 'popularity' | 'credibility' | 'distance';
  query: string;
}

interface DiscoveryState {
  // Data
  facts: any[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  
  // Search
  searchQuery: string;
  searchFilters: SearchFilters;
  searchSuggestions: string[];
  searchDebounceTimer?: NodeJS.Timeout;
  
  // UI State
  selectedFact: any | null;
  isModalOpen: boolean;
  savedFacts: string[];
  
  // Filter data
  filters: SearchFilters;
  categories: any[];
  
  // Actions
  loadFacts: () => Promise<void>;
  loadMoreFacts: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearSearch: () => void;
  performSearch: () => Promise<void>;
  refreshFacts: () => Promise<void>;
  updateSearchSuggestions: (query: string) => void;
  
  // UI Actions
  setSelectedFact: (fact: any) => void;
  setModalOpen: (open: boolean) => void;
  toggleSavedFact: (factId: string) => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      // Initial state
      facts: [],
      isLoading: false,
      error: null,
      hasMore: true,
      currentPage: 1,
      searchQuery: '',
      searchFilters: {
        categories: [],
        radius: 10,
        center: null,
        sortBy: 'recency',
        query: ''
      },
      searchSuggestions: [],
      selectedFact: null,
      isModalOpen: false,
      savedFacts: [],
      filters: {
        categories: [],
        radius: 10,
        center: null,
        sortBy: 'recency',
        query: ''
      },
      categories: [],

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        // Debounce search to improve performance
        if (get().searchDebounceTimer) {
          clearTimeout(get().searchDebounceTimer);
        }
        
        const timer = setTimeout(() => {
          get().performSearch();
        }, 300);
        
        set({ searchDebounceTimer: timer });
      },

      updateSearchSuggestions: (query) => {
        // Mock suggestions for now
        const mockSuggestions = [
          'New York, NY',
          'London, UK', 
          'Tokyo, Japan',
          'Paris, France'
        ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
        
        set({ searchSuggestions: mockSuggestions });
      },

      setSelectedFact: (fact) => set({ selectedFact: fact }),
      
      setModalOpen: (open) => set({ isModalOpen: open }),
      
      toggleSavedFact: (factId) => {
        const { savedFacts } = get();
        const newSavedFacts = savedFacts.includes(factId)
          ? savedFacts.filter(id => id !== factId)
          : [...savedFacts, factId];
        set({ savedFacts: newSavedFacts });
      },

      setFilters: (newFilters) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters, searchFilters: updatedFilters });
        get().performSearch();
      },

      loadFacts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('facts')
            .select(`
              *,
              profiles!inner(username, avatar_url),
              categories!inner(slug, icon, color)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(0, 19);

          if (error) throw error;

          set({
            facts: data || [],
            hasMore: (data?.length || 0) === 20,
            isLoading: false,
            error: null,
            currentPage: 1
          });
        } catch (error: any) {
          console.error('Error loading facts:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to load facts'
          });
        }
      },

      loadMoreFacts: async () => {
        const { currentPage, facts } = get();
        const nextPage = currentPage + 1;
        set({ isLoading: true });

        try {
          const { data, error } = await supabase
            .from('facts')
            .select(`
              *,
              profiles!inner(username, avatar_url),
              categories!inner(slug, icon, color)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(currentPage * 20, nextPage * 20 - 1);

          if (error) throw error;

          const newFacts = data || [];
          set({
            facts: [...facts, ...newFacts],
            hasMore: newFacts.length === 20,
            isLoading: false,
            currentPage: nextPage
          });
        } catch (error: any) {
          console.error('Error loading more facts:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to load more facts'
          });
        }
      },

      setSearchFilters: (filters) => {
        const currentFilters = get().searchFilters;
        set({ searchFilters: { ...currentFilters, ...filters } });
        get().performSearch();
      },

      clearSearch: () => {
        set({
          searchQuery: '',
          searchFilters: {
            categories: [],
            radius: 10,
            center: null,
            sortBy: 'recency',
            query: ''
          },
          facts: [],
          hasMore: true,
          currentPage: 1
        });
        get().loadFacts();
      },

      performSearch: async () => {
        const state = get();
        const { searchQuery, searchFilters } = state;
        
        set({ isLoading: true, error: null });

        try {
          let query = supabase
            .from('facts')
            .select(`
              *,
              profiles!inner(username, avatar_url),
              categories!inner(slug, icon, color)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(0, 19);

          if (searchQuery || searchFilters.query) {
            const searchTerm = searchQuery || searchFilters.query;
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_name.ilike.%${searchTerm}%`);
          }

          if (searchFilters.categories.length > 0) {
            query = query.in('categories.slug', searchFilters.categories);
          }

          const { data, error } = await query;

          if (error) throw error;

          set({
            facts: data || [],
            hasMore: (data?.length || 0) === 20,
            isLoading: false,
            error: null,
            currentPage: 1
          });

        } catch (error: any) {
          console.error('Search error:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to search facts'
          });
        }
      },

      refreshFacts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('facts')
            .select(`
              *,
              profiles!inner(username, avatar_url),
              categories!inner(slug, icon, color)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(0, 19);

          if (error) throw error;

          set({
            facts: data || [],
            hasMore: (data?.length || 0) === 20,
            isLoading: false,
            error: null,
            currentPage: 1
          });
        } catch (error: any) {
          console.error('Error refreshing facts:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to refresh facts'
          });
        }
      }
    }),
    {
      name: 'discovery-store',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        searchFilters: state.searchFilters,
        currentPage: state.currentPage,
        savedFacts: state.savedFacts
      }),
    }
  )
);
