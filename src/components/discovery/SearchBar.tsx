
import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { EnhancedSearchInput } from '@/components/search/search-suggestions';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useEnhancedDebounce } from '@/hooks/useEnhancedDebounce';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onQueryChange?: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onQueryChange,
  className,
  placeholder = "Search for facts, stories, or topics..."
}) => {
  const { 
    filters, 
    setFilters 
  } = useDiscoveryStore();
  
  const [localQuery, setLocalQuery] = useState(filters.search || '');
  
  const [debouncedQuery, cancelDebounce, isDebouncing] = useEnhancedDebounce(localQuery, {
    delay: 300,
    maxWait: 1000
  });

  // Search history management
  const {
    getSuggestions,
    addSearch,
    removeSearch,
    clearHistory,
    getPopularSearches
  } = useSearchHistory({
    maxItems: 20,
    storageKey: 'fact-search-history'
  });

  useEffect(() => {
    if (debouncedQuery !== filters.search) {
      setFilters({ search: debouncedQuery });
      onQueryChange?.(debouncedQuery);
      
      // Add to search history if it's a meaningful search
      if (debouncedQuery.trim().length > 2) {
        addSearch(debouncedQuery.trim());
      }
    }
  }, [debouncedQuery, filters.search, setFilters, onQueryChange, addSearch]);

  // Generate suggestions based on current query
  const suggestions = React.useMemo(() => {
    const historySuggestions = getSuggestions(localQuery, 3).map(query => ({
      query,
      type: 'history' as const,
      timestamp: Date.now()
    }));

    const popularSuggestions = getPopularSearches(2).map(query => ({
      query,
      type: 'trending' as const,
      count: 0
    }));

    // Mock category suggestions based on query
    const categorySuggestions = [];
    if (localQuery.length > 1) {
      const categories = ['history', 'nature', 'architecture', 'culture', 'legend'];
      const matchingCategories = categories.filter(cat => 
        cat.toLowerCase().includes(localQuery.toLowerCase())
      );
      categorySuggestions.push(...matchingCategories.map(cat => ({
        query: cat,
        type: 'category' as const
      })));
    }

    return [...historySuggestions, ...categorySuggestions, ...popularSuggestions]
      .slice(0, 8); // Limit total suggestions
  }, [localQuery, getSuggestions, getPopularSearches]);

  const handleQueryChange = useCallback((value: string) => {
    setLocalQuery(value);
  }, []);

  const handleSubmit = useCallback((query: string) => {
    setLocalQuery(query);
    setFilters({ search: query });
    onQueryChange?.(query);
    
    if (query.trim().length > 2) {
      addSearch(query.trim());
    }
  }, [setFilters, onQueryChange, addSearch]);

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <EnhancedSearchInput
        value={localQuery}
        onChange={handleQueryChange}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        suggestions={suggestions}
        onRemoveFromHistory={removeSearch}
        onClearHistory={clearHistory}
        showSuggestions={true}
        className="w-full"
      />
    </div>
  );
};
