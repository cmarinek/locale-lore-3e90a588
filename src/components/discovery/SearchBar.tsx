
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
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="flex items-center bg-card border border-border rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center flex-1 px-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder={placeholder}
              value={localQuery}
              onChange={handleInputChange}
              onFocus={() => localQuery.length > 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {localQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {showSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full">
          <div className="bg-card/95 backdrop-blur border border-border rounded-lg p-3 shadow-xl">
            <div className="space-y-1">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors duration-200 flex items-center gap-3"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
