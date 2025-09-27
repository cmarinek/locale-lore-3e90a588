import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EnhancedFact, EnhancedCategory, SearchFilters } from '@/types/fact';
import { supabase } from '@/integrations/supabase/client';

interface DiscoveryState {
  // Facts with pagination
  facts: EnhancedFact[];
  selectedFact: EnhancedFact | null;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  currentPage: number;
  factsPerPage: number;
  
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
  syncSelectedFact: string | null;
  mapCenter: [number, number] | null;
  
  // Performance optimization
  lastFetchTime: number;
  factCache: Map<string, EnhancedFact>;
  
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
  searchFacts: (query: string) => Promise<void>;
  fetchFactById: (factId: string) => Promise<EnhancedFact | null>;
  initializeData: () => Promise<void>;
  clearCache: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      // Initial state
      facts: [],
      selectedFact: null,
      isLoading: false,
      hasMore: true,
      error: null,
      currentPage: 0,
      factsPerPage: 50, // Reduced from potential larger number
      
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
      
      // Performance optimization
      lastFetchTime: 0,
      factCache: new Map(),
      
      // Actions
      setFacts: (facts) => {
        // Cache facts for performance
        const { factCache } = get();
        facts.forEach(fact => factCache.set(fact.id, fact));
        set({ facts, factCache });
      },
      
      addFacts: (newFacts) => {
        const { facts, factCache } = get();
        // Prevent duplicates and cache new facts
        const existingIds = new Set(facts.map(f => f.id));
        const uniqueNewFacts = newFacts.filter(f => !existingIds.has(f.id));
        
        uniqueNewFacts.forEach(fact => factCache.set(fact.id, fact));
        set({ 
          facts: [...facts, ...uniqueNewFacts], 
          factCache 
        });
      },
      
      setSelectedFact: (fact) => set({ selectedFact: fact }),
      setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters } 
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setHasMore: (hasMore) => set({ hasMore }),
      setModalOpen: (modalOpen) => set({ modalOpen }),
      
      toggleSavedFact: (factId) => set((state) => ({
        savedFacts: state.savedFacts.includes(factId)
          ? state.savedFacts.filter(id => id !== factId)
          : [...state.savedFacts, factId]
      })),
      
      updateSearchSuggestions: (searchSuggestions) => set({ searchSuggestions }),
      setUserLocation: (userLocation) => set({ userLocation }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSyncSelectedFact: (syncSelectedFact) => set({ syncSelectedFact }),
      setMapCenter: (mapCenter) => set({ mapCenter }),

      // Optimized data loading with caching and rate limiting
      loadMoreFacts: async () => {
        const { isLoading, hasMore, facts, currentPage, factsPerPage, lastFetchTime } = get();
        
        if (isLoading || !hasMore) return;
        
        // Rate limiting - prevent too frequent requests
        const now = Date.now();
        if (now - lastFetchTime < 1000) return; // Minimum 1 second between requests
        
        set({ isLoading: true, lastFetchTime: now });
        
        try {
          const from = currentPage * factsPerPage;
          const to = from + factsPerPage - 1;
          
          console.log(`📊 Loading facts ${from}-${to}`);
          
          const { data, error, count } = await supabase
            .from('facts')
            .select(`
              *,
              profiles (id, username, avatar_url),
              categories (
                slug,
                icon,
                color,
                category_translations (name, language_code)
              )
            `, { count: 'exact' })
            .eq('status', 'verified')
            .order('created_at', { ascending: false })
            .range(from, to);

          if (error) throw error;

          const enhancedFacts = (data || []).map(fact => ({
            ...fact,
            vote_count_up: fact.vote_count_up || 0,
            vote_count_down: fact.vote_count_down || 0,
            profiles: fact.profiles || { id: '', username: 'Anonymous', avatar_url: null },
            categories: fact.categories || { 
              slug: 'unknown', 
              icon: '📍', 
              color: '#666666',
              category_translations: [{ name: 'Unknown', language_code: 'en' }] 
            }
          })) as EnhancedFact[];

          // Update state efficiently
          const totalFacts = count || 0;
          const newCurrentPage = currentPage + 1;
          const newHasMore = (newCurrentPage * factsPerPage) < totalFacts;

          if (currentPage === 0) {
            get().setFacts(enhancedFacts);
          } else {
            get().addFacts(enhancedFacts);
          }
          
          set({ 
            currentPage: newCurrentPage,
            hasMore: newHasMore,
            isLoading: false,
            error: null
          });
          
          console.log(`📊 Loaded ${enhancedFacts.length} facts, total: ${facts.length + enhancedFacts.length}`);
          
        } catch (error) {
          console.error('Error loading facts:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load facts',
            isLoading: false 
          });
        }
      },

      loadCategories: async () => {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select(`
              *,
              category_translations (name, language_code)
            `)
            .order('slug');

          const categoriesWithNames = (data || []).map(cat => ({
            ...cat,
            name: cat.category_translations?.[0]?.name || cat.slug
          })) as EnhancedCategory[];

          set({ categories: categoriesWithNames });
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      },

      // Optimized search with debouncing and caching
      searchFacts: async (query: string) => {
        const { lastFetchTime } = get();
        const now = Date.now();
        
        // Debounce search requests
        if (now - lastFetchTime < 500) return;
        
        set({ isLoading: true, lastFetchTime: now, currentPage: 0 });
        
        try {
          if (!query.trim()) {
            // If empty query, reload initial facts
            set({ facts: [], currentPage: 0, hasMore: true });
            await get().loadMoreFacts();
            return;
          }
          
          console.log(`🔍 Searching for: "${query}"`);
          
          const { data, error } = await supabase
            .from('facts')
            .select(`
              *,
              profiles (id, username, avatar_url),
              categories (
                slug,
                icon,
                color,
                category_translations (name, language_code)
              )
            `)
            .or(`title.ilike.%${query}%, description.ilike.%${query}%, location_name.ilike.%${query}%`)
            .eq('status', 'verified')
            .order('created_at', { ascending: false })
            .limit(100); // Limit search results for performance

          if (error) throw error;

          const enhancedFacts = (data || []).map(fact => ({
            ...fact,
            vote_count_up: fact.vote_count_up || 0,
            vote_count_down: fact.vote_count_down || 0,
            profiles: fact.profiles || { id: '', username: 'Anonymous', avatar_url: null },
            categories: fact.categories || { 
              slug: 'unknown', 
              icon: '📍', 
              color: '#666666',
              category_translations: [{ name: 'Unknown', language_code: 'en' }] 
            }
          })) as EnhancedFact[];

          get().setFacts(enhancedFacts);
          set({ 
            hasMore: false, // Search results don't have pagination
            isLoading: false,
            error: null
          });
          
          console.log(`🔍 Found ${enhancedFacts.length} search results`);
          
        } catch (error) {
          console.error('Search error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Search failed',
            isLoading: false 
          });
        }
      },

      // Optimized fact fetching with cache
      fetchFactById: async (factId: string): Promise<EnhancedFact | null> => {
        const { factCache } = get();
        
        // Check cache first
        const cached = factCache.get(factId);
        if (cached) {
          console.log(`📊 Fact ${factId} served from cache`);
          return cached;
        }
        
        try {
          const { data, error } = await supabase
            .from('facts')
            .select(`
              *,
              profiles (id, username, avatar_url),
              categories (
                slug,
                icon,
                color,
                category_translations (name, language_code)
              )
            `)
            .eq('id', factId)
            .single();

          if (error) throw error;
          if (!data) return null;

          const enhancedFact = {
            ...data,
            vote_count_up: data.vote_count_up || 0,
            vote_count_down: data.vote_count_down || 0,
            profiles: data.profiles || { id: '', username: 'Anonymous', avatar_url: null },
            categories: data.categories || { 
              slug: 'unknown', 
              icon: '📍', 
              color: '#666666',
              category_translations: [{ name: 'Unknown', language_code: 'en' }] 
            }
          } as EnhancedFact;

          // Cache the result
          factCache.set(factId, enhancedFact);
          set({ factCache });
          
          return enhancedFact;
        } catch (error) {
          console.error('Error fetching fact:', error);
          return null;
        }
      },

      // Initialize with optimized loading
      initializeData: async () => {
        console.log('📊 Initializing discovery data...');
        
        // Load categories in parallel with facts
        const [categoriesPromise] = [get().loadCategories()];
        
        // Load initial facts
        await get().loadMoreFacts();
        
        // Wait for categories
        await categoriesPromise;
        
        console.log('📊 Discovery data initialized');
      },

      // Clear cache for memory management
      clearCache: () => {
        set({ factCache: new Map() });
        console.log('📊 Cache cleared');
      }
    }),
    {
      name: 'discovery-store',
      // Only persist essential data to reduce load time
      partialize: (state) => ({
        savedFacts: state.savedFacts,
        userLocation: state.userLocation,
        viewMode: state.viewMode,
        filters: state.filters
      })
    }
  )
);