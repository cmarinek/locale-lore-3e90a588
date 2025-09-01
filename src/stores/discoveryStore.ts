
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { EnhancedFact, EnhancedCategory } from '@/types/fact';

export interface SearchFilters {
  query: string;
  category: string[];
  sortBy: 'relevance' | 'date' | 'popularity';
  dateRange?: {
    from: Date;
    to: Date;
  };
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  status?: string[];
}

export interface DiscoveryState {
  // Core data
  facts: EnhancedFact[];
  categories: EnhancedCategory[];
  
  // UI state
  selectedFact: EnhancedFact | null;
  isModalOpen: boolean;
  savedFacts: string[];
  
  // Loading states
  isLoading: boolean;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  
  // Search and filters
  searchFilters: SearchFilters;
  filters: SearchFilters;
  searchSuggestions: string[];
  
  // Actions
  setFacts: (facts: EnhancedFact[]) => void;
  addFacts: (facts: EnhancedFact[]) => void;
  setCategories: (categories: EnhancedCategory[]) => void;
  setSelectedFact: (fact: EnhancedFact | null) => void;
  setModalOpen: (open: boolean) => void;
  toggleSavedFact: (factId: string) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  loadMoreFacts: () => Promise<void>;
  searchFacts: (query: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadSavedFacts: () => Promise<void>;
  updateSearchSuggestions: (suggestions: string[]) => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  category: [],
  sortBy: 'relevance',
};

export const useDiscoveryStore = create<DiscoveryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      facts: [],
      categories: [],
      selectedFact: null,
      isModalOpen: false,
      savedFacts: [],
      isLoading: false,
      hasMore: true,
      loading: false,
      error: null,
      searchFilters: defaultFilters,
      filters: defaultFilters,
      searchSuggestions: [],

      // Actions
      setFacts: (facts) => set({ facts }),
      
      addFacts: (newFacts) => set((state) => ({ 
        facts: [...state.facts, ...newFacts] 
      })),
      
      setCategories: (categories) => set({ categories }),
      
      setSelectedFact: (fact) => set({ 
        selectedFact: fact,
        isModalOpen: !!fact 
      }),
      
      setModalOpen: (open) => set({ 
        isModalOpen: open,
        selectedFact: open ? get().selectedFact : null
      }),
      
      toggleSavedFact: (factId) => set((state) => ({
        savedFacts: state.savedFacts.includes(factId)
          ? state.savedFacts.filter(id => id !== factId)
          : [...state.savedFacts, factId]
      })),
      
      setSearchFilters: (filters) => set((state) => ({
        searchFilters: { ...state.searchFilters, ...filters }
      })),

      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      clearFilters: () => set({ 
        searchFilters: defaultFilters,
        filters: defaultFilters
      }),

      updateSearchSuggestions: (suggestions) => set({ searchSuggestions: suggestions }),

      loadCategories: async () => {
        set({ loading: true, error: null });
        try {
          // Mock categories
          const mockCategories: EnhancedCategory[] = [
            { id: '1', name: 'History', slug: 'history', color: '#3B82F6', icon: '🏛️' },
            { id: '2', name: 'Culture', slug: 'culture', color: '#10B981', icon: '🎭' },
            { id: '3', name: 'Nature', slug: 'nature', color: '#059669', icon: '🌿' },
          ];
          set({ categories: mockCategories, loading: false });
        } catch (error) {
          console.error('Failed to load categories:', error);
          set({ loading: false, error: 'Failed to load categories' });
        }
      },

      loadSavedFacts: async () => {
        // Mock implementation
        set({ savedFacts: [] });
      },
      
      loadMoreFacts: async () => {
        const state = get();
        if (state.isLoading || !state.hasMore) return;
        
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock data
          const mockFacts: EnhancedFact[] = Array.from({ length: 10 }, (_, i) => ({
            id: `fact-${state.facts.length + i}`,
            title: `Fact ${state.facts.length + i + 1}`,
            content: `This is the content for fact ${state.facts.length + i + 1}`,
            description: `This is a description for fact ${state.facts.length + i + 1}`,
            location_name: `Location ${state.facts.length + i + 1}`,
            latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
            status: 'verified' as const,
            vote_count_up: Math.floor(Math.random() * 100),
            vote_count_down: Math.floor(Math.random() * 20),
            upvotes: Math.floor(Math.random() * 100),
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author_id: 'user-1',
            user_id: 'user-1',
            category_id: 'category-1',
            categories: {
              id: 'category-1',
              name: 'History',
              slug: 'history',
              color: '#3B82F6',
              icon: '🏛️'
            },
            profiles: {
              id: 'user-1',
              username: 'testuser',
              avatar_url: null
            }
          }));
          
          set((state) => ({
            facts: [...state.facts, ...mockFacts],
            isLoading: false,
            hasMore: state.facts.length + mockFacts.length < 100
          }));
        } catch (error) {
          console.error('Failed to load more facts:', error);
          set({ isLoading: false });
        }
      },
      
      searchFacts: async (query) => {
        set({ isLoading: true, facts: [] });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock search results
          const mockFacts: EnhancedFact[] = Array.from({ length: 20 }, (_, i) => ({
            id: `search-fact-${i}`,
            title: `Search Result ${i + 1} for "${query}"`,
            content: `This fact matches your search for "${query}"`,
            description: `Search result description for "${query}"`,
            location_name: `Search Location ${i + 1}`,
            latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
            status: 'verified' as const,
            vote_count_up: Math.floor(Math.random() * 100),
            vote_count_down: Math.floor(Math.random() * 20),
            upvotes: Math.floor(Math.random() * 100),
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author_id: 'user-1',
            user_id: 'user-1',
            category_id: 'category-1',
            categories: {
              id: 'category-1',
              name: 'History',
              slug: 'history',
              color: '#3B82F6',
              icon: '🏛️'
            },
            profiles: {
              id: 'user-1',
              username: 'testuser',
              avatar_url: null
            }
          }));
          
          set({ facts: mockFacts, isLoading: false, hasMore: true });
        } catch (error) {
          console.error('Search failed:', error);
          set({ isLoading: false });
        }
      }
    }),
    { name: 'discovery-store' }
  )
);
