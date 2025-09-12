import { useState, useEffect, useCallback } from 'react';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  results?: number;
}

interface UseSearchHistoryOptions {
  maxItems?: number;
  storageKey?: string;
  debounceMs?: number;
}

export const useSearchHistory = (options: UseSearchHistoryOptions = {}) => {
  const {
    maxItems = 10,
    storageKey = 'search-history',
    debounceMs = 500
  } = options;

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as SearchHistoryItem[];
        setHistory(parsed);
        setRecentSearches(parsed.map(item => item.query).slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, [storageKey]);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [storageKey]);

  // Add search to history
  const addSearch = useCallback((query: string, resultCount?: number) => {
    if (!query.trim()) return;

    setHistory(current => {
      // Remove existing entry for this query
      const filtered = current.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      
      // Add new entry at the beginning
      const newHistory = [
        {
          query: query.trim(),
          timestamp: Date.now(),
          results: resultCount
        },
        ...filtered
      ].slice(0, maxItems); // Keep only maxItems

      saveHistory(newHistory);
      setRecentSearches(newHistory.map(item => item.query).slice(0, 5));
      
      return newHistory;
    });
  }, [maxItems, saveHistory]);

  // Remove specific search from history
  const removeSearch = useCallback((query: string) => {
    setHistory(current => {
      const newHistory = current.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      saveHistory(newHistory);
      setRecentSearches(newHistory.map(item => item.query).slice(0, 5));
      return newHistory;
    });
  }, [saveHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setRecentSearches([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Get search suggestions based on current query
  const getSuggestions = useCallback((query: string, limit = 5) => {
    if (!query.trim()) return recentSearches.slice(0, limit);

    const queryLower = query.toLowerCase();
    return history
      .filter(item => 
        item.query.toLowerCase().includes(queryLower) && 
        item.query.toLowerCase() !== queryLower
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(item => item.query)
      .slice(0, limit);
  }, [history, recentSearches]);

  // Get popular searches (most frequent)
  const getPopularSearches = useCallback((limit = 5) => {
    const searchCounts = new Map<string, number>();
    
    history.forEach(item => {
      const query = item.query.toLowerCase();
      searchCounts.set(query, (searchCounts.get(query) || 0) + 1);
    });

    return Array.from(searchCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query);
  }, [history]);

  return {
    history,
    recentSearches,
    addSearch,
    removeSearch,
    clearHistory,
    getSuggestions,
    getPopularSearches
  };
};