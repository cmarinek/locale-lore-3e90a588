// Filter state management - SSOT for all filtering across the app
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MapFilters {
  // Category filters
  selectedCategories: string[];
  
  // Date range filters
  dateRange: {
    start: Date | null;
    end: Date | null;
    preset: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
  };
  
  // Popularity/voting filters
  minPopularity: number;
  maxPopularity: number;
  
  // Verification filter
  verifiedOnly: boolean;
  
  // Location-based filters
  radiusKm: number | null;
  centerPoint: { lat: number; lng: number } | null;
  
  // Content filters
  hasMedia: boolean | null;
  hasComments: boolean | null;
  
  // Author filters
  authorIds: string[];
}

export interface SearchFilters {
  categories: string[];
  status: string;
  verified: boolean;
  dateFrom: Date | null;
  dateTo: Date | null;
  minVotes: number | null;
  hasMedia: boolean | null;
}

interface FilterState {
  // Map filters
  mapFilters: MapFilters;
  setMapFilters: (filters: Partial<MapFilters>) => void;
  resetMapFilters: () => void;
  
  // Search filters
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;
  
  // Quick filter presets
  activePreset: string | null;
  setActivePreset: (presetId: string | null) => void;
  
  // Filter history for undo/redo
  filterHistory: MapFilters[];
  addToHistory: () => void;
  undo: () => void;
  canUndo: boolean;
}

const DEFAULT_MAP_FILTERS: MapFilters = {
  selectedCategories: [],
  dateRange: {
    start: null,
    end: null,
    preset: 'all',
  },
  minPopularity: 0,
  maxPopularity: 1000,
  verifiedOnly: false,
  radiusKm: null,
  centerPoint: null,
  hasMedia: null,
  hasComments: null,
  authorIds: [],
};

const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  categories: [],
  status: '',
  verified: false,
  dateFrom: null,
  dateTo: null,
  minVotes: null,
  hasMedia: null,
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Map filters
      mapFilters: DEFAULT_MAP_FILTERS,
      setMapFilters: (filters: Partial<MapFilters>) => {
        set((state) => ({
          mapFilters: { ...state.mapFilters, ...filters },
        }));
      },
      resetMapFilters: () => {
        set({ mapFilters: DEFAULT_MAP_FILTERS });
      },
      
      // Search filters
      searchFilters: DEFAULT_SEARCH_FILTERS,
      setSearchFilters: (filters: Partial<SearchFilters>) => {
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        }));
      },
      resetSearchFilters: () => {
        set({ searchFilters: DEFAULT_SEARCH_FILTERS });
      },
      
      // Presets
      activePreset: null,
      setActivePreset: (presetId: string | null) => {
        set({ activePreset: presetId });
        
        // Apply preset filters
        if (presetId === 'verified') {
          set({ mapFilters: { ...DEFAULT_MAP_FILTERS, verifiedOnly: true } });
        } else if (presetId === 'recent') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          set({
            mapFilters: {
              ...DEFAULT_MAP_FILTERS,
              dateRange: {
                start: weekAgo,
                end: new Date(),
                preset: 'week',
              },
            },
          });
        } else if (presetId === 'popular') {
          set({
            mapFilters: {
              ...DEFAULT_MAP_FILTERS,
              minPopularity: 10,
            },
          });
        }
      },
      
      // History for undo
      filterHistory: [],
      addToHistory: () => {
        const currentFilters = get().mapFilters;
        set((state) => ({
          filterHistory: [...state.filterHistory.slice(-9), currentFilters], // Keep last 10
        }));
      },
      undo: () => {
        const history = get().filterHistory;
        if (history.length > 0) {
          const previousFilters = history[history.length - 1];
          set({
            mapFilters: previousFilters,
            filterHistory: history.slice(0, -1),
          });
        }
      },
      canUndo: false,
    }),
    {
      name: 'filter-store',
      // Persist filter preferences
      partialize: (state) => ({
        mapFilters: state.mapFilters,
        searchFilters: state.searchFilters,
        activePreset: state.activePreset,
      }),
    }
  )
);

// Computed selectors
export const useActiveFilterCount = () => {
  const { mapFilters } = useFilterStore();
  
  let count = 0;
  if (mapFilters.selectedCategories.length > 0) count++;
  if (mapFilters.dateRange.preset !== 'all') count++;
  if (mapFilters.minPopularity > 0) count++;
  if (mapFilters.verifiedOnly) count++;
  if (mapFilters.hasMedia !== null) count++;
  if (mapFilters.hasComments !== null) count++;
  if (mapFilters.authorIds.length > 0) count++;
  
  return count;
};
