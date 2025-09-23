import { create } from 'zustand';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';

interface DiscoveryFilters {
  search: string;
  category: string;
  sortBy: 'relevance' | 'date' | 'distance' | 'popularity';
  dateRange: string;
  verified: boolean;
}
import { persist } from 'zustand/middleware';
import { EnhancedFact, EnhancedCategory, SearchFilters } from '@/types/fact';
import { supabase } from '@/integrations/supabase/client';

interface DiscoveryState {
  // Facts
  facts: EnhancedFact[];
  selectedFact: EnhancedFact | null;
  isLoading: boolean;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  
  // Search & Filters
  filters: SearchFilters;
  searchSuggestions: string[];
  
  // Categories
  categories: EnhancedCategory[];
  
  // UI State
  modalOpen: boolean;
  savedFacts: string[];
  
  // Location & View State
  userLocation: [number, number] | null;
  viewMode: 'explore' | 'hybrid' | 'map';
  syncSelectedFact: string | null; // For syncing between map and list
  mapCenter: [number, number] | null; // For centering map on location
  
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
  setUserLocation: (location: [number, number] | null) => void;
  setViewMode: (mode: 'explore' | 'hybrid' | 'map') => void;
  setSyncSelectedFact: (factId: string | null) => void;
  setMapCenter: (center: [number, number] | null) => void;
  loadMoreFacts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadSavedFacts: () => Promise<void>;
  searchFacts: (query: string) => Promise<void>;
  searchFactsWithLocation: (query: string, location?: [number, number]) => Promise<void>;
  fetchFactById: (factId: string) => Promise<EnhancedFact | null>;
  initializeData: () => Promise<void>;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      // Initial state
      facts: [],
      selectedFact: null,
      isLoading: false,
      hasMore: true,
      loading: false,
      error: null,
      
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
      categories: [],
      modalOpen: false,
      savedFacts: [],
      
      // Location & View State
      userLocation: null,
      viewMode: 'explore',
      syncSelectedFact: null,
      mapCenter: null,
      
      // Actions
      setFacts: (facts) => set({ facts }),
      addFacts: (newFacts) => set((state) => ({ 
        facts: [...state.facts, ...newFacts] 
      })),
      setSelectedFact: (fact) => set({ selectedFact: fact }),
      setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters } 
      })),
      setLoading: (loading) => set({ isLoading: loading, loading }),
      setHasMore: (hasMore) => set({ hasMore }),
      setModalOpen: (open) => set({ modalOpen: open }),
      toggleSavedFact: (factId) => set((state) => ({
        savedFacts: state.savedFacts.includes(factId)
          ? state.savedFacts.filter(id => id !== factId)
          : [...state.savedFacts, factId]
      })),
      updateSearchSuggestions: (suggestions) => set({ searchSuggestions: suggestions }),
      setUserLocation: (location) => set({ userLocation: location }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSyncSelectedFact: (factId) => set({ syncSelectedFact: factId }),
      setMapCenter: (center) => set((state) => {
        // Prevent unnecessary updates if center hasn't changed significantly
        if (state.mapCenter && center) {
          const distance = Math.sqrt(
            Math.pow(state.mapCenter[0] - center[0], 2) + 
            Math.pow(state.mapCenter[1] - center[1], 2)
          );
          if (distance < 0.001) return state; // Less than ~100m difference
        }
        return { mapCenter: center };
      }),
      
      loadMoreFacts: async () => {
        const state = get();
        if (state.isLoading) return;
        
        set({ isLoading: true });
        
        try {
          const limit = 50; // Load more facts for better map coverage
          const offset = state.facts.length;
          
          const { data: facts, error } = await supabase
            .from('facts')
            .select(`
              id,
              title,
              description,
              location_name,
              latitude,
              longitude,
              status,
              vote_count_up,
              vote_count_down,
              category_id,
              author_id,
              created_at,
              updated_at,
              media_urls,
              categories!facts_category_id_fkey(
                slug,
                icon,
                color,
                category_translations!inner(
                  name,
                  language_code
                )
              ),
              profiles!facts_author_id_fkey(
                id,
                username,
                avatar_url
              )
            `)
            .eq('categories.category_translations.language_code', 'en')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          const enhancedFacts: EnhancedFact[] = (facts || []).map(fact => ({
            ...fact,
            category: fact.categories?.slug || 'unknown',
            verified: fact.status === 'verified',
            categories: fact.categories ? {
              ...fact.categories,
              category_translations: fact.categories.category_translations || []
            } : {
              slug: 'unknown',
              icon: '📍',
              color: '#3B82F6',
              category_translations: [{ name: 'Unknown', language_code: 'en' }]
            },
            profiles: fact.profiles || { id: '', username: 'Anonymous', avatar_url: null }
          }));
          
          set((state) => {
            console.log(`📊 Loaded ${enhancedFacts.length} facts with coordinates, total now: ${state.facts.length + enhancedFacts.length}`);
            return {
              facts: [...state.facts, ...enhancedFacts],
              hasMore: enhancedFacts.length === limit,
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error loading more facts:', error);
          set({ isLoading: false });
        }
      },

      loadCategories: async () => {
        try {
          const { data: categories, error } = await supabase
            .from('categories')
            .select(`
              id,
              slug,
              icon,
              color,
              category_translations!inner(
                name,
                language_code
              )
            `)
            .eq('category_translations.language_code', 'en');

          if (error) throw error;

          const enhancedCategories: EnhancedCategory[] = (categories || []).map(cat => ({
            ...cat,
            name: cat.category_translations?.[0]?.name || cat.slug,
            category_translations: cat.category_translations || []
          }));

          set({ categories: enhancedCategories });
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      },

      loadSavedFacts: async () => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ loading: false });
            return;
          }

          const { data: savedFacts, error } = await supabase
            .from('saved_facts')
            .select('fact_id')
            .eq('user_id', user.id);

          if (error) throw error;

          const savedFactIds = (savedFacts || []).map(sf => sf.fact_id);
          set({ savedFacts: savedFactIds, loading: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to load saved facts' 
          });
        }
      },

      searchFactsWithLocation: async (query: string, location?: [number, number]) => {
        set({ loading: true, error: null });
        try {
          let queryBuilder = supabase
            .from('facts')
            .select(`
              id,
              title,
              description,
              location_name,
              latitude,
              longitude,
              status,
              vote_count_up,
              vote_count_down,
              category_id,
              author_id,
              created_at,
              updated_at,
              media_urls,
              categories!facts_category_id_fkey(
                slug,
                icon,
                color,
                category_translations!inner(
                  name,
                  language_code
                )
              ),
              profiles!facts_author_id_fkey(
                id,
                username,
                avatar_url
              )
            `)
            .eq('categories.category_translations.language_code', 'en');

          if (query.trim()) {
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,location_name.ilike.%${query}%`);
          }

          const { data: facts, error } = await queryBuilder
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          const enhancedFacts: EnhancedFact[] = (facts || []).map(fact => ({
            ...fact,
            categories: fact.categories ? {
              ...fact.categories,
              category_translations: fact.categories.category_translations || []
            } : {
              slug: 'unknown',
              icon: '📍',
              color: '#3B82F6',
              category_translations: [{ name: 'Unknown', language_code: 'en' }]
            },
            profiles: fact.profiles || { id: '', username: 'Anonymous', avatar_url: null }
          }));
          
          set({ facts: enhancedFacts, loading: false, hasMore: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to search facts' 
          });
        }
      },

      searchFacts: async (query: string) => {
        set({ loading: true, error: null });
        try {
          let queryBuilder = supabase
            .from('facts')
            .select(`
              id,
              title,
              description,
              location_name,
              latitude,
              longitude,
              status,
              vote_count_up,
              vote_count_down,
              category_id,
              author_id,
              created_at,
              updated_at,
              media_urls,
              categories!facts_category_id_fkey(
                slug,
                icon,
                color,
                category_translations!inner(
                  name,
                  language_code
                )
              ),
              profiles!facts_author_id_fkey(
                id,
                username,
                avatar_url
              )
            `)
            .eq('categories.category_translations.language_code', 'en');

          if (query.trim()) {
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,location_name.ilike.%${query}%`);
          }

          const { data: facts, error } = await queryBuilder
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          const enhancedFacts: EnhancedFact[] = (facts || []).map(fact => ({
            ...fact,
            category: fact.categories?.slug || 'unknown',
            verified: fact.status === 'verified',
            categories: fact.categories ? {
              ...fact.categories,
              category_translations: fact.categories.category_translations || []
            } : {
              slug: 'unknown',
              icon: '📍',
              color: '#3B82F6',
              category_translations: [{ name: 'Unknown', language_code: 'en' }]
            },
            profiles: fact.profiles || { id: '', username: 'Anonymous', avatar_url: null }
          }));
          
          set({ facts: enhancedFacts, loading: false, hasMore: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to search facts' 
          });
        }
      },

      fetchFactById: async (factId: string) => {
        try {
          const { data: fact, error } = await supabase
            .from('facts')
            .select(`
              id,
              title,
              description,
              location_name,
              latitude,
              longitude,
              status,
              vote_count_up,
              vote_count_down,
              category_id,
              author_id,
              created_at,
              updated_at,
              media_urls,
              categories!facts_category_id_fkey(
                slug,
                icon,
                color,
                category_translations!inner(
                  name,
                  language_code
                )
              ),
              profiles!facts_author_id_fkey(
                id,
                username,
                avatar_url
              )
            `)
            .eq('id', factId)
            .eq('categories.category_translations.language_code', 'en')
            .single();

          if (error) throw error;
          if (!fact) return null;

          const enhancedFact: EnhancedFact = {
            ...fact,
            categories: fact.categories ? {
              ...fact.categories,
              category_translations: fact.categories.category_translations || []
            } : {
              slug: 'unknown',
              icon: '📍',
              color: '#3B82F6',
              category_translations: [{ name: 'Unknown', language_code: 'en' }]
            },
            profiles: fact.profiles || { id: '', username: 'Anonymous', avatar_url: null }
          };

          return enhancedFact;
        } catch (error) {
          console.error('Error fetching fact by ID:', error);
          return null;
        }
      },

      initializeData: async () => {
        const state = get();
        if (state.facts.length === 0) {
          console.log('🚀 Initializing data...');
          set({ loading: true });
          try {
            await Promise.all([
              state.loadMoreFacts(),
              state.loadCategories(), 
              state.loadSavedFacts()
            ]);
            console.log('✅ Data initialization complete');
          } finally {
            set({ loading: false });
          }
        } else {
          console.log(`📊 Data already loaded: ${state.facts.length} facts`);
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