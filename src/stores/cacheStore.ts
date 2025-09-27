import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

interface CacheState {
  // Cache data
  entries: Record<string, CacheEntry>;
  
  // Cache settings
  maxSize: number;
  defaultTTL: number;
  
  // Actions
  set: <T>(key: string, data: T, ttl?: number) => void;
  get: <T>(key: string) => T | null;
  remove: (key: string) => void;
  clear: () => void;
  clearExpired: () => void;
  has: (key: string) => boolean;
  getSize: () => number;
  setMaxSize: (size: number) => void;
  setDefaultTTL: (ttl: number) => void;
  
  // Specific cache namespaces
  getSearchCache: (query: string) => any[];
  setSearchCache: (query: string, results: any[]) => void;
  getMapCache: (viewport: string) => any;
  setMapCache: (viewport: string, data: any) => void;
  getFactCache: (factId: string) => any;
  setFactCache: (factId: string, fact: any) => void;
}

export const useCacheStore = create<CacheState>()(
  persist(
    (set, get) => ({
      entries: {},
      maxSize: 100, // Maximum number of cache entries
      defaultTTL: 30 * 60 * 1000, // 30 minutes default TTL

      set: (key, data, ttl) => {
        const state = get();
        const now = Date.now();
        const timeToLive = ttl || state.defaultTTL;
        
        set((state) => {
          const newEntries = { ...state.entries };
          
          // Add new entry
          newEntries[key] = {
            data,
            timestamp: now,
            ttl: timeToLive,
            key,
          };
          
          // Clean up expired entries
          Object.keys(newEntries).forEach(entryKey => {
            const entry = newEntries[entryKey];
            if (now - entry.timestamp > entry.ttl) {
              delete newEntries[entryKey];
            }
          });
          
          // Enforce max size (LRU eviction)
          const entryList = Object.values(newEntries).sort((a, b) => b.timestamp - a.timestamp);
          if (entryList.length > state.maxSize) {
            const toRemove = entryList.slice(state.maxSize);
            toRemove.forEach(entry => delete newEntries[entry.key]);
          }
          
          return { entries: newEntries };
        });
      },

      get: (key) => {
        const state = get();
        const entry = state.entries[key];
        
        if (!entry) return null;
        
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
          // Entry expired, remove it
          get().remove(key);
          return null;
        }
        
        // Update timestamp for LRU
        set((state) => ({
          entries: {
            ...state.entries,
            [key]: { ...entry, timestamp: now }
          }
        }));
        
        return entry.data;
      },

      remove: (key) => {
        set((state) => {
          const newEntries = { ...state.entries };
          delete newEntries[key];
          return { entries: newEntries };
        });
      },

      clear: () => {
        set({ entries: {} });
      },

      clearExpired: () => {
        const now = Date.now();
        set((state) => {
          const newEntries = { ...state.entries };
          Object.keys(newEntries).forEach(key => {
            const entry = newEntries[key];
            if (now - entry.timestamp > entry.ttl) {
              delete newEntries[key];
            }
          });
          return { entries: newEntries };
        });
      },

      has: (key) => {
        const entry = get().entries[key];
        if (!entry) return false;
        
        const now = Date.now();
        return now - entry.timestamp <= entry.ttl;
      },

      getSize: () => {
        return Object.keys(get().entries).length;
      },

      setMaxSize: (size) => {
        set({ maxSize: size });
      },

      setDefaultTTL: (ttl) => {
        set({ defaultTTL: ttl });
      },

      // Specialized cache methods
      getSearchCache: (query) => {
        return get().get(`search:${query}`) || [];
      },

      setSearchCache: (query, results) => {
        get().set(`search:${query}`, results, 10 * 60 * 1000); // 10 minutes
      },

      getMapCache: (viewport) => {
        return get().get(`map:${viewport}`);
      },

      setMapCache: (viewport, data) => {
        get().set(`map:${viewport}`, data, 5 * 60 * 1000); // 5 minutes
      },

      getFactCache: (factId) => {
        return get().get(`fact:${factId}`);
      },

      setFactCache: (factId, fact) => {
        get().set(`fact:${factId}`, fact, 60 * 60 * 1000); // 1 hour
      },
    }),
    {
      name: 'app-cache',
      partialize: (state) => ({
        entries: state.entries,
        maxSize: state.maxSize,
        defaultTTL: state.defaultTTL,
      }),
    }
  )
);