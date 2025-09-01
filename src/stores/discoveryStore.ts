
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EnhancedFact, EnhancedCategory, SearchFilters } from '@/types/fact';

interface DiscoveryState {
  // Facts
  facts: EnhancedFact[];
  selectedFact: EnhancedFact | null;
  isLoading: boolean;
  hasMore: boolean;
  
  // Search & Filters
  filters: SearchFilters;
  searchSuggestions: string[];
  
  // Categories
  categories: EnhancedCategory[];
  
  // UI State
  modalOpen: boolean;
  savedFacts: string[];
  
  // Actions
  setFacts: (facts: EnhancedFact[]) => void;
  addFacts: (facts: EnhancedFact[]) => void;
  setSelectedFact: (fact: EnhancedFact | null) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setModalOpen: (open: boolean) => void;
  toggleSavedFact: (factId: string) => void;
  updateSearchSuggestions: (suggestions: string[]) => void;
  loadMoreFacts: () => Promise<void>;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      // Initial state
      facts: [],
      selectedFact: null,
      isLoading: false,
      hasMore: true,
      
      filters: {
        query: '',
        search: '',
        category: '',
        categories: [],
        verified: undefined,
        timeRange: '',
        sortBy: 'relevance',
        location: undefined,
        radius: 10,
        center: null
      },
      
      searchSuggestions: [],
      
      categories: [
        {
          id: '1',
          slug: 'history',
          icon: '🏛️',
          color: '#8B5CF6',
          name: 'History'
        },
        {
          id: '2',
          slug: 'nature',
          icon: '🌿',
          color: '#10B981',
          name: 'Nature'
        },
        {
          id: '3',
          slug: 'culture',
          icon: '🎭',
          color: '#F59E0B',
          name: 'Culture'
        }
      ],
      
      modalOpen: false,
      savedFacts: [],
      
      // Actions
      setFacts: (facts) => set({ facts }),
      addFacts: (newFacts) => set((state) => ({ 
        facts: [...state.facts, ...newFacts] 
      })),
      setSelectedFact: (fact) => set({ selectedFact: fact }),
      setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters } 
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      setHasMore: (hasMore) => set({ hasMore }),
      setModalOpen: (open) => set({ modalOpen: open }),
      toggleSavedFact: (factId) => set((state) => ({
        savedFacts: state.savedFacts.includes(factId)
          ? state.savedFacts.filter(id => id !== factId)
          : [...state.savedFacts, factId]
      })),
      updateSearchSuggestions: (suggestions) => set({ searchSuggestions: suggestions }),
      loadMoreFacts: async () => {
        const state = get();
        if (state.isLoading || !state.hasMore) return;
        
        set({ isLoading: true });
        
        try {
          // Mock API call - replace with actual implementation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockFacts: EnhancedFact[] = Array.from({ length: 10 }, (_, i) => ({
            id: `fact-${state.facts.length + i + 1}`,
            title: `Mock Fact ${state.facts.length + i + 1}`,
            description: 'This is a mock fact for testing purposes.',
            author_id: 'user-1',
            category_id: 'category-1',
            status: 'verified' as const,
            vote_count_up: Math.floor(Math.random() * 100),
            vote_count_down: Math.floor(Math.random() * 20),
            latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
            location_name: 'New York, NY',
            media_urls: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profiles: {
              id: 'user-1',
              username: 'testuser',
              avatar_url: undefined
            },
            categories: {
              slug: 'history',
              icon: '🏛️',
              color: '#8B5CF6'
            }
          }));
          
          set((state) => ({
            facts: [...state.facts, ...mockFacts],
            hasMore: state.facts.length + mockFacts.length < 100,
            isLoading: false
          }));
        } catch (error) {
          console.error('Error loading more facts:', error);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'discovery-store',
      partialize: (state) => ({
        savedFacts: state.savedFacts,
        filters: state.filters
      })
    }
  )
);
