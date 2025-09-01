
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
  radius: number;
  center: [number, number] | null;
}

interface Fact {
  id: string;
  title: string;
  content: string;
  status: string;
  upvotes: number;
  is_verified: boolean;
  created_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
  fact_votes?: Array<{
    vote_type: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface DiscoveryState {
  // Data
  facts: Fact[];
  categories: Category[];
  savedFacts: string[];
  searchSuggestions: string[];
  
  // UI State
  loading: boolean;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  selectedFact: Fact | null;
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
  setSelectedFact: (fact: Fact | null) => void;
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
        .eq('status', 'active');

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
      const state = get();
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

      if (state.filters.category) {
        queryBuilder = queryBuilder.eq('categories.slug', state.filters.category);
      }

      if (state.filters.verified !== undefined) {
        queryBuilder = queryBuilder.eq('is_verified', state.filters.verified);
      }

      // Apply sorting
      switch (state.filters.sortBy) {
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
    const state = get();
    if (state.isLoading || !state.hasMore) return;

    set({ isLoading: true });
    try {
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
        .range(state.facts.length, state.facts.length + 19);

      if (state.filters.search) {
        queryBuilder = queryBuilder.or(`title.ilike.%${state.filters.search}%,content.ilike.%${state.filters.search}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      
      set({ 
        facts: [...state.facts, ...(data || [])],
        isLoading: false,
        hasMore: (data?.length || 0) === 20
      });
    } catch (error) {
      console.error('Error loading more facts:', error);
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters: Partial<SearchFilters>) => {
    const state = get();
    const updatedFilters = { ...state.filters, ...newFilters };
    set({ filters: updatedFilters });
    
    // Auto-search when filters change
    if (newFilters.search !== undefined) {
      get().searchFacts(newFilters.search);
    }
  },

  updateSearchSuggestions: (suggestions: string[]) => {
    set({ searchSuggestions: suggestions });
  },

  toggleSavedFact: async (factId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const state = get();
      const isSaved = state.savedFacts.includes(factId);

      if (isSaved) {
        await supabase
          .from('saved_facts')
          .delete()
          .eq('user_id', user.id)
          .eq('fact_id', factId);
        
        set({ savedFacts: state.savedFacts.filter(id => id !== factId) });
      } else {
        await supabase
          .from('saved_facts')
          .insert({ user_id: user.id, fact_id: factId });
        
        set({ savedFacts: [...state.savedFacts, factId] });
      }
    } catch (error) {
      console.error('Error toggling saved fact:', error);
    }
  },

  setSelectedFact: (fact: Fact | null) => {
    set({ selectedFact: fact });
  },

  setModalOpen: (open: boolean) => {
    set({ isModalOpen: open });
  },
}));
