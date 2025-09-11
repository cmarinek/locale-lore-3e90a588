import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface UnifiedSearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  showLocationButton?: boolean;
  variant?: 'default' | 'compact';
}

export const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  className,
  onSearch,
  placeholder = "Search for mysteries, legends, or hidden gems...",
  showLocationButton = true,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Mock suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      const mockSuggestions = [
        `${query} history`,
        `${query} facts`, 
        `${query} stories`,
        `${query} mysteries`
      ].slice(0, 4);
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  // Handle debounced search
  useEffect(() => {
    if (debouncedQuery !== query) {
      onSearch?.(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowSuggestions(false);
    }
  }, [query, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch?.(suggestion);
  };

  const clearSearch = useCallback(() => {
    setQuery('');
    onSearch?.('');
    setShowSuggestions(false);
  }, [onSearch]);

  const handleLocationClick = () => {
    // TODO: Implement location-based search
    console.log('Location search clicked');
  };

  if (variant === 'compact') {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          <div className="flex items-center glass rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center flex-1 px-2">
              <Search className="h-4 w-4 text-muted-foreground mr-2 group-focus-within:text-primary transition-colors" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => query.length > 1 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="border-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-1">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              {showLocationButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLocationClick}
                  className="text-muted-foreground hover:text-foreground h-8 px-2"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="text-xs hidden sm:inline">Near me</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2"
            >
              <Card className="p-2 glass shadow-xl">
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="flex items-center glass rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center flex-1 px-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3 group-focus-within:text-primary transition-colors" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => query.length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {showLocationButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLocationClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Near me
              </Button>
            )}
            
            <Button
              onClick={handleSearch}
              disabled={!query.trim()}
              size="lg"
              className="rounded-xl px-8 gradient-logo text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              Explore
            </Button>
          </div>
        </div>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2"
          >
            <Card className="p-3 glass shadow-xl">
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors duration-200 flex items-center gap-3"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};