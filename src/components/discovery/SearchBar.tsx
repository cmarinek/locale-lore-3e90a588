
import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useDebounce } from '@/hooks/useDebounce';
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
    searchSuggestions, 
    updateSearchSuggestions,
    setFilters 
  } = useDiscoveryStore();
  
  const [localQuery, setLocalQuery] = useState(filters.search || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedQuery = useDebounce(localQuery, 300);

  useEffect(() => {
    if (debouncedQuery !== filters.search) {
      setFilters({ search: debouncedQuery });
      onQueryChange?.(debouncedQuery);
    }
  }, [debouncedQuery, filters.search, setFilters, onQueryChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    if (value.length > 2) {
      // Mock search suggestions - in a real app, this would be an API call
      const mockSuggestions = [
        `${value} history`,
        `${value} facts`,
        `${value} stories`,
      ];
      updateSearchSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [updateSearchSuggestions]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setLocalQuery(suggestion);
    setFilters({ search: suggestion });
    onQueryChange?.(suggestion);
    setShowSuggestions(false);
  }, [setFilters, onQueryChange]);

  const clearSearch = useCallback(() => {
    setLocalQuery('');
    setFilters({ search: '' });
    onQueryChange?.('');
    setShowSuggestions(false);
  }, [setFilters, onQueryChange]);

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleInputChange}
          onFocus={() => localQuery.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="pl-10 pr-10"
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {searchSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
