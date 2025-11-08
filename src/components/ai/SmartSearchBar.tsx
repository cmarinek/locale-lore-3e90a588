import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';
import { log } from '@/utils/logger';

interface SmartSearchResult {
  id: string;
  title: string;
  description: string;
  location_name: string;
  categories?: {
    category_translations: { name: string }[];
  };
}

interface SmartSearchBarProps {
  onResults?: (results: SmartSearchResult[]) => void;
  onSuggestionClick?: (suggestion: string) => void;
  userLocation?: { latitude: number; longitude: number };
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onResults,
  onSuggestionClick,
  userLocation
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  // Load recent searches from storage
  useEffect(() => {
    const stored = localStorage.getItem('smart_search_history');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch (e) {
        log.warn('Failed to parse search history', { component: 'SmartSearchBar' });
      }
    }
  }, []);

  const performSmartSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onResults?.([]);
      return;
    }

    try {
      setIsSearching(true);
      const { data: { user } } = await supabase.auth.getUser();

      log.debug('Performing smart search', { component: 'SmartSearchBar', query: searchQuery });

      const { data: response, error } = await supabase.functions.invoke('smart-search', {
        body: {
          query: searchQuery,
          user_id: user?.id,
          location: userLocation,
          filters: {}
        }
      });

      if (error) throw error;

      if (response?.results) {
        onResults?.(response.results);
        setSuggestions(response.suggestions || []);
        
        // Update search history
        const newHistory = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(newHistory);
        localStorage.setItem('smart_search_history', JSON.stringify(newHistory));

        toast({
          title: "Smart Search Complete",
          description: `Found ${response.results.length} personalized results`,
        });
      }
    } catch (error) {
      log.error('Smart search error', error, { component: 'SmartSearchBar', query: searchQuery });
      
      // Fallback to regular search
      try {
        const { data: fallbackResults } = await supabase
          .from('facts')
          .select(`
            *,
            categories (
              category_translations (name)
            )
          `)
          .textSearch('title,description', searchQuery, { type: 'websearch' })
          .eq('status', 'verified')
          .limit(20);

        onResults?.(fallbackResults || []);
        
        toast({
          title: "Search Complete",
          description: `Found ${fallbackResults?.length || 0} results (basic search)`,
        });
      } catch (fallbackError) {
        log.error('Fallback search failed', fallbackError, { component: 'SmartSearchBar', query: searchQuery });
        toast({
          title: "Search Failed",
          description: "Unable to perform search. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length >= 2) {
        performSmartSearch(searchQuery);
      }
    }, 500),
    [userLocation, onResults]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      debouncedSearch(value);
    } else {
      onResults?.([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSmartSearch(suggestion);
    onSuggestionClick?.(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    onResults?.([]);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search with AI assistance..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-12 h-12 text-base"
          />
          {isSearching && (
            <motion.div
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
          )}
          {query && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
            >
              ×
            </Button>
          )}
        </div>

        {/* AI Enhancement Indicator */}
        {query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-3 -bottom-6 flex items-center gap-1 text-xs text-primary"
          >
            <Sparkles className="h-3 w-3" />
            AI-powered search active
          </motion.div>
        )}
      </div>

      {/* Suggestions and Recent Searches */}
      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                AI Suggestions
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-md transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Recent Searches
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-md transition-colors text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Popular Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {['Hidden gems', 'Historical sites', 'Local legends', 'Street art', 'Food history'].map((popular) => (
                <Badge
                  key={popular}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleSuggestionClick(popular)}
                >
                  {popular}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};