
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  search: string;
  category?: string;
  categories: string[];
  location?: { lat: number; lng: number; radius: number };
  dateRange?: { start: Date; end: Date };
  sortBy: 'relevance' | 'date' | 'popularity' | 'recency' | 'credibility' | 'distance';
  verified?: boolean;
  query: string;
  radius: number;
  center: [number, number] | null;
}

export interface DiscoveryState {
  // Data
  facts: any[];
  categories: any[];
  savedFacts: string[];
  searchSuggestions: string[];
  
  // UI State
  loading: boolean;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  selectedFact: any | null;
  isModalOpen: boolean;
  filters: SearchFilters;

  // Actions
  loadCategories: () => Promise<void>;
  loadSavedFacts: () => Promise<void>;
  searchFacts: (query: string) => Promise<void>;
  loadMoreFacts: () => Promise<void>;
  setFilters: (filters: Partial<SearchFilters>) => void;
  updateSearchSuggestions: (suggestions: string[]) => void;
  toggleSavedFact: (factId: string) => void;
  setSelectedFact: (fact: any) => void;
  setModalOpen: (open: boolean) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  // Initial state
  facts: [],
  categories: [],
  savedFacts: [],
  searchSuggestions: [],
  loading: false,
  isLoading: false,
  hasMore: true,
  error: null,
  selectedFact: null,
  isModalOpen: false,
  filters: {
    search: '',
    categories: [],
    sortBy: 'relevance',
    query: '',
    radius: 10,
    center: null,
  },

  // Actions
  loadCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'verified');

      if (error) throw error;
      set({ categories: data || [], loading: false });
    } catch (error) {
      console.error('Error loading categories:', error);
      set({ error: 'Failed to load categories', loading: false });
    }
  },

  loadSavedFacts: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_facts')
        .select('fact_id')
        .eq('user_id', user.id);

      if (error) throw error;
      set({ savedFacts: data?.map(item => item.fact_id) || [] });
    } catch (error) {
      console.error('Error loading saved facts:', error);
    }
  },

  searchFacts: async (query: string) => {
    set({ loading: true, isLoading: true, error: null });
    try {
      const { filters } = get();
      let queryBuilder = supabase
        .from('facts')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          fact_votes (
            vote_type
          )
        `)
        .eq('status', 'verified');

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }

      if (filters.category) {
        queryBuilder = queryBuilder.eq('categories.slug', filters.category);
      }

      if (filters.verified !== undefined) {
        queryBuilder = queryBuilder.eq('is_verified', filters.verified);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'date':
        case 'recency':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        case 'popularity':
          queryBuilder = queryBuilder.order('upvotes', { ascending: false });
          break;
        default:
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error } = await queryBuilder.limit(20);

      if (error) throw error;
      set({ facts: data || [], loading: false, isLoading: false });
    } catch (error) {
      console.error('Error searching facts:', error);
      set({ error: 'Failed to search facts', loading: false, isLoading: false });
    }
  },

  loadMoreFacts: async () => {
    const { facts, isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;

    set({ isLoading: true });
    try {
      const { filters } = get();
      let queryBuilder = supabase
        .from('facts')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          fact_votes (
            vote_type
          )
        `)
        .eq('status', 'verified')
        .range(facts.length, facts.length + 19);

      if (filters.search) {
        queryBuilder = queryBuilder.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      
      set({ 
        facts: [...facts, ...(data || [])],
        isLoading: false,
        hasMore: (data?.length || 0) === 20
      });
    } catch (error) {
      console.error('Error loading more facts:', error);
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters: Partial<SearchFilters>) => {
    const { filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    set({ filters: updatedFilters });
    
    // Auto-search when filters change
    if (newFilters.search !== undefined || newFilters.query !== undefined) {
      const searchQuery = newFilters.search || newFilters.query || '';
      get().searchFacts(searchQuery);
    }
  },

  updateSearchSuggestions: (suggestions: string[]) => {
    set({ searchSuggestions: suggestions });
  },

  toggleSavedFact: async (factId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { savedFacts } = get();
      const isSaved = savedFacts.includes(factId);

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
    } catch (error) {
      console.error('Error toggling saved fact:', error);
    }
  },

  setSelectedFact: (fact: any) => {
    set({ selectedFact: fact });
  },

  setModalOpen: (open: boolean) => {
    set({ isModalOpen: open });
  },
}));
