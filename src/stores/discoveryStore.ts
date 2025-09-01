import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { usePerformanceStore } from './performanceStore';

interface SearchFilters {
  category?: string;
  location?: string;
  verified?: boolean;
  timeRange?: string;
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
  searchDebounceTimer?: NodeJS.Timeout;
  
  // Actions
  loadFacts: () => Promise<void>;
  loadMoreFacts: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;
  performSearch: () => Promise<void>;
  refreshFacts: () => Promise<void>;
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
      searchFilters: {},

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
        set({ searchFilters: filters });
        get().performSearch();
      },

      clearSearch: () => {
        set({
          searchQuery: '',
          searchFilters: {},
          facts: [],
          hasMore: true,
          currentPage: 1
        });
        get().loadFacts();
      },

      performSearch: async () => {
        const state = get();
        const { searchQuery, searchFilters } = state;
        
        // Use memoized selectors for better performance
        const cacheKey = `search_${searchQuery}_${JSON.stringify(searchFilters)}`;
        const cachedResults = usePerformanceStore.getState().getCachedResult(cacheKey);
        
        if (cachedResults && Date.now() - cachedResults.timestamp < 300000) { // 5 minutes
          set({ 
            facts: cachedResults.facts,
            isLoading: false,
            hasMore: cachedResults.hasMore
          });
          return;
        }

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

          if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location_name.ilike.%${searchQuery}%`);
          }

          if (searchFilters.category) {
            query = query.eq('categories.slug', searchFilters.category);
          }

          if (searchFilters.verified) {
            query = query.eq('status', 'verified');
          }

          const { data, error } = await query;

          if (error) throw error;

          const results = {
            facts: data || [],
            hasMore: (data?.length || 0) === 20,
            timestamp: Date.now()
          };

          // Cache results
          usePerformanceStore.getState().setCachedResult(cacheKey, results);

          set({
            facts: results.facts,
            hasMore: results.hasMore,
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
        currentPage: state.currentPage
      }),
    }
  )
);
