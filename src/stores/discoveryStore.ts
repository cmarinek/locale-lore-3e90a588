import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EnhancedFact, EnhancedCategory } from '@/types/fact';
import { supabase } from '@/integrations/supabase/client';

interface DiscoveryState {
  // Facts data ONLY - no UI or other state
  facts: EnhancedFact[];
  selectedFact: EnhancedFact | null;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  currentPage: number;
  factsPerPage: number;
  
  // Categories
  categories: EnhancedCategory[];
  
  // Performance optimization
  lastFetchTime: number;
  factCache: Map<string, EnhancedFact>;
  
  // Actions - ONLY data fetching actions
  setFacts: (facts: EnhancedFact[]) => void;
  addFacts: (facts: EnhancedFact[]) => void;
  setSelectedFact: (fact: EnhancedFact | null) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
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
      // Initial state - SIMPLIFIED, removed duplicate state
      facts: [],
      selectedFact: null,
      isLoading: false,
      hasMore: true,
      error: null,
      currentPage: 0,
      factsPerPage: 50,
      
      categories: [],
      
      // Performance optimization
      lastFetchTime: 0,
      factCache: new Map(),
      
      // Actions - ONLY data actions, removed UI state management
      setFacts: (facts) => {
        set({ facts, currentPage: 0 });
        // Cache facts for performance
        const cache = get().factCache;
        facts.forEach(fact => cache.set(fact.id, fact));
      },
      
      addFacts: (facts) => {
        set(state => ({ 
          facts: [...state.facts, ...facts],
          currentPage: state.currentPage + 1 
        }));
        // Cache new facts
        const cache = get().factCache;
        facts.forEach(fact => cache.set(fact.id, fact));
      },
      
      setSelectedFact: (fact) => set({ selectedFact: fact }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHasMore: (hasMore) => set({ hasMore }),
      setError: (error) => set({ error }),
      
      loadMoreFacts: async () => {
        const state = get();
        if (state.isLoading || !state.hasMore) return;
        
        // Rate limiting
        const now = Date.now();
        if (now - state.lastFetchTime < 1000) return;
        
        set({ isLoading: true, lastFetchTime: now });
        
        try {
          const { data, error } = await supabase
            .from('facts')
            .select(`
              *,
              categories:category_id (
                slug,
                icon,
                color,
                category_translations (
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
            .order('created_at', { ascending: false })
            .range(state.currentPage * state.factsPerPage, (state.currentPage + 1) * state.factsPerPage - 1);

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
          
          if (enhancedFacts.length < state.factsPerPage) {
            set({ hasMore: false });
          }
          
          get().addFacts(enhancedFacts);
        } catch (error) {
          console.error('Error loading facts:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load facts' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadCategories: async () => {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select(`
              *,
              category_translations (
                name,
                language_code,
                description
              )
            `)
            .order('slug');

          if (error) throw error;
          
          const enhancedCategories = (data || []).map(category => ({
            ...category,
            name: category.category_translations?.[0]?.name || 'Unknown'
          })) as EnhancedCategory[];
          
          set({ categories: enhancedCategories });
        } catch (error) {
          console.error('Error loading categories:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load categories' });
        }
      },
      
      searchFacts: async (query: string) => {
        if (!query.trim()) return;
        
        set({ isLoading: true, error: null });
        
        try {
          // Simple text search instead of edge function for now
          const { data, error } = await supabase
            .from('facts')
            .select(`
              *,
              categories:category_id (
                slug,
                icon,
                color,
                category_translations (
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
            .ilike('title', `%${query}%`)
            .order('created_at', { ascending: false })
            .limit(get().factsPerPage);

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
          set({ hasMore: enhancedFacts.length === get().factsPerPage });
        } catch (error) {
          console.error('Error searching facts:', error);
          set({ error: error instanceof Error ? error.message : 'Search failed' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchFactById: async (factId: string) => {
        // Check cache first
        const cached = get().factCache.get(factId);
        if (cached) return cached;
        
        try {
          const { data, error } = await supabase
            .from('facts')
            .select(`
              *,
              categories:category_id (
                slug,
                icon,
                color,
                category_translations (
                  name,
                  language_code
                )
              ),
              profiles:author_id (
                username,
                avatar_url
              )
            `)
            .eq('id', factId)
            .single();

          if (error) throw error;
          
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
          
          // Cache the fact
          get().factCache.set(factId, enhancedFact);
          return enhancedFact;
        } catch (error) {
          console.error('Error fetching fact:', error);
          return null;
        }
      },
      
      initializeData: async () => {
        await Promise.all([
          get().loadCategories(),
          get().loadMoreFacts()
        ]);
      },
      
      clearCache: () => set({ factCache: new Map() }),
    }),
    {
      name: 'discovery-store',
      partialize: (state) => ({
        // Only persist cache and categories for performance
        categories: state.categories,
      }),
    }
  )
);