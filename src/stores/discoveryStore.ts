import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Fact, Category } from '@/types/map';
import type { Database } from '@/integrations/supabase/types';
import { useRealtimeStore, setupFactVoteSubscription } from './realtimeStore';

interface SearchFilters {
  query: string;
  categories: string[];
  radius: number;
  center: [number, number] | null;
  sortBy: 'distance' | 'popularity' | 'recency' | 'credibility';
}

interface DiscoveryState {
  // Data
  facts: Fact[];
  categories: Category[];
  savedFacts: string[];
  
  // Search & Filters
  filters: SearchFilters;
  searchSuggestions: string[];
  
  // UI State
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  selectedFact: Fact | null;
  isModalOpen: boolean;
  
  // Actions
  setFilters: (filters: Partial<SearchFilters>) => void;
  searchFacts: (reset?: boolean) => Promise<void>;
  loadMoreFacts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  toggleSavedFact: (factId: string) => Promise<void>;
  loadSavedFacts: () => Promise<void>;
  setSelectedFact: (fact: Fact | null) => void;
  setModalOpen: (open: boolean) => void;
  updateSearchSuggestions: (query: string) => Promise<void>;
}

const initialFilters: SearchFilters = {
  query: '',
  categories: [],
  radius: 10, // km
  center: null,
  sortBy: 'recency'
};

export const useDiscoveryStore = create<DiscoveryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      facts: [],
      categories: [],
      savedFacts: [],
      filters: initialFilters,
      searchSuggestions: [],
      isLoading: false,
      hasMore: true,
      page: 0,
      selectedFact: null,
      isModalOpen: false,

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
        // Auto-search when filters change
        get().searchFacts(true);
      },

  searchFacts: async (reset = false) => {
        const { filters, page } = get();
        
        if (reset) {
          set({ facts: [], page: 0, hasMore: true });
        }
        
        set({ isLoading: true });
        
        try {
          const currentPage = reset ? 0 : page;
          const limit = 20;
          const offset = currentPage * limit;

          let query = supabase
            .from('facts')
            .select(`
              *,
              categories:category_id!inner (
                id,
                slug,
                icon,
                color,
                category_translations!inner (
                  name,
                  language_code
                )
              ),
              profiles:author_id (
                username,
                avatar_url
              )
            `)
            .eq('status', 'verified')
            .range(offset, offset + limit - 1);

          // Apply text search
          if (filters.query) {
            query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location_name.ilike.%${filters.query}%`);
          }

          // Apply category filter
          if (filters.categories.length > 0) {
            query = query.in('category_id', filters.categories);
          }

          // Apply geospatial filter if center and radius are set
          if (filters.center && filters.radius) {
            const [lng, lat] = filters.center;
            // Simple distance filtering using lat/lng bounds for now
            const kmToDegrees = filters.radius / 111; // Rough conversion
            query = query
              .gte('latitude', lat - kmToDegrees)
              .lte('latitude', lat + kmToDegrees)
              .gte('longitude', lng - kmToDegrees)
              .lte('longitude', lng + kmToDegrees);
          }

          // Apply sorting
          switch (filters.sortBy) {
            case 'popularity':
              query = query.order('vote_count_up', { ascending: false });
              break;
            case 'recency':
              query = query.order('created_at', { ascending: false });
              break;
            case 'credibility':
              query = query.order('vote_count_up', { ascending: false })
                          .order('vote_count_down', { ascending: true });
              break;
            case 'distance':
              if (filters.center) {
                // Order by distance if center is available
                query = query.order('created_at', { ascending: false });
              } else {
                query = query.order('created_at', { ascending: false });
              }
              break;
          }

          const { data, error } = await query;

          if (error) throw error;

          const newFacts = (data || []) as unknown as Fact[];
          
          // Set up real-time subscriptions for new facts
          if (reset) {
            newFacts.forEach(fact => {
              setupFactVoteSubscription(fact.id);
            });
          }
          
          set((state) => ({
            facts: reset ? newFacts : [...state.facts, ...newFacts],
            page: currentPage + 1,
            hasMore: newFacts.length === limit,
            isLoading: false
          }));

        } catch (error) {
          console.error('Error searching facts:', error);
          set({ isLoading: false });
        }
      },

      loadMoreFacts: async () => {
        const { hasMore, isLoading } = get();
        if (!hasMore || isLoading) return;
        
        await get().searchFacts();
      },

      loadCategories: async () => {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select(`
              *,
              category_translations!inner (
                id,
                category_id,
                name,
                language_code,
                description
              )
            `);

          if (error) throw error;
          set({ categories: (data || []) as unknown as Category[] });
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      },

      toggleSavedFact: async (factId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { savedFacts } = get();
        const isSaved = savedFacts.includes(factId);

        try {
          if (isSaved) {
            await supabase
              .from('saved_facts')
              .delete()
              .eq('user_id', user.id)
              .eq('fact_id', factId);
            
            set({ savedFacts: savedFacts.filter(id => id !== factId) });
          } else {
            await supabase
              .from('saved_facts')
              .insert({ user_id: user.id, fact_id: factId });
            
            set({ savedFacts: [...savedFacts, factId] });
          }

          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        } catch (error) {
          console.error('Error toggling saved fact:', error);
        }
      },

      loadSavedFacts: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('saved_facts')
            .select('fact_id')
            .eq('user_id', user.id);

          if (error) throw error;
          
          const savedFactIds = data?.map(item => item.fact_id) || [];
          set({ savedFacts: savedFactIds });
        } catch (error) {
          console.error('Error loading saved facts:', error);
        }
      },

      setSelectedFact: (fact) => set({ selectedFact: fact }),

      setModalOpen: (open) => set({ isModalOpen: open }),

      updateSearchSuggestions: async (query: string) => {
        if (!query.trim()) {
          set({ searchSuggestions: [] });
          return;
        }

        try {
          const { data, error } = await supabase
            .from('facts')
            .select('title, location_name')
            .or(`title.ilike.%${query}%,location_name.ilike.%${query}%`)
            .limit(5);

          if (error) throw error;

          const suggestions = [
            ...new Set([
              ...data?.map(f => f.title) || [],
              ...data?.map(f => f.location_name) || []
            ])
          ].slice(0, 5);

          set({ searchSuggestions: suggestions });
        } catch (error) {
          console.error('Error loading suggestions:', error);
        }
      }
    }),
    { name: 'discovery-store' }
  )
);