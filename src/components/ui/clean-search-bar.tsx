import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CleanSearchBarProps {
  className?: string;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  showLocationButton?: boolean;
}

const mockSuggestions = ["Hidden waterfalls", "Local ghost stories", "Secret speakeasies", "Underground tunnels", "Historic landmarks"];

export const CleanSearchBar: React.FC<CleanSearchBarProps> = ({
  className,
  onQueryChange,
  placeholder = "Search for mysteries, legends, or hidden gems...",
  showLocationButton = true
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      const filteredSuggestions = mockSuggestions.filter(search => 
        search.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onQueryChange?.(query.trim());
      setShowSuggestions(false);
    }
  }, [query, onQueryChange]);

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
    onQueryChange?.(suggestion);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onQueryChange?.(value);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="flex items-center bg-card/95 backdrop-blur border border-border rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center flex-1 px-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3 group-focus-within:text-primary transition-colors" />
            <Input 
              ref={inputRef}
              type="text" 
              placeholder={placeholder}
              value={query} 
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => query.length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0" 
            />
          </div>
          
          {showLocationButton && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                Near me
              </Button>
            </div>
          )}
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
            <Card className="p-3 bg-card/95 backdrop-blur border-border shadow-xl">
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors duration-200 flex items-center gap-3"
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