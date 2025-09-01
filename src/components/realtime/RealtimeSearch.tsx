import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface RealtimeSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  showTrending?: boolean;
  className?: string;
}

export const RealtimeSearch: React.FC<RealtimeSearchProps> = ({
  onSearch,
  placeholder = "Search for lore, locations, or topics...",
  showTrending = true,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { trendingSearches, searchSuggestions, setTrendingSearches, updateSearchSuggestions } = useRealtimeStore();
  const debouncedQuery = useDebounce(query, 300);

  // Load trending searches and recent searches
  useEffect(() => {
    loadTrendingSearches();
    loadRecentSearches();
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      loadSuggestions(debouncedQuery);
    }
  }, [debouncedQuery]);

  const loadTrendingSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('query')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const trending = data?.map(item => item.query).filter(Boolean) || [];
      const uniqueTrending = [...new Set(trending)].slice(0, 5);
      setTrendingSearches(uniqueTrending);
    } catch (error) {
      console.error('Error loading trending searches:', error);
    }
  };

  const loadRecentSearches = () => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    const recent = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  const loadSuggestions = async (searchQuery: string) => {
    try {
      const { data, error } = await supabase
        .from('facts')
        .select('title, location_name')
        .or(`title.ilike.%${searchQuery}%,location_name.ilike.%${searchQuery}%`)
        .limit(8);

      if (error) throw error;

      const suggestions = [
        ...new Set([
          ...data?.map(f => f.title) || [],
          ...data?.map(f => f.location_name) || []
        ])
      ].slice(0, 6);

      updateSearchSuggestions(searchQuery, suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      onSearch(searchQuery.trim());
      setIsExpanded(false);
      setQuery(searchQuery);
      
      // Track search analytics
      trackSearch(searchQuery.trim());
    }
  };

  const trackSearch = async (searchQuery: string) => {
    try {
      await supabase
        .from('search_analytics')
        .insert({
          query: searchQuery,
          session_id: crypto.randomUUID(),
          results_count: 0, // Will be updated later
        });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const currentSuggestions = searchSuggestions.get(debouncedQuery) || [];

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            } else if (e.key === 'Escape') {
              setIsExpanded(false);
              inputRef.current?.blur();
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Suggestions dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <Card className="p-4 shadow-lg border">
                {/* Current query suggestions */}
                {debouncedQuery.length >= 2 && currentSuggestions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Suggestions</h4>
                    <div className="space-y-1">
                      {currentSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={suggestion}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm p-2 h-auto"
                            onClick={() => handleSearch(suggestion)}
                          >
                            <Search className="w-3 h-3 mr-2 text-muted-foreground" />
                            {suggestion}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Recent</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs h-6 px-2"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recentSearches.map((recent) => (
                        <Badge
                          key={recent}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80 transition-colors"
                          onClick={() => handleSearch(recent)}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {recent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending searches */}
                {showTrending && trendingSearches.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Trending</h4>
                    <div className="flex flex-wrap gap-1">
                      {trendingSearches.map((trending) => (
                        <Badge
                          key={trending}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
                          onClick={() => handleSearch(trending)}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {trending}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {debouncedQuery.length < 2 && recentSearches.length === 0 && trendingSearches.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Start typing to search for lore</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};