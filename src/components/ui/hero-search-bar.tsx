import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EnhancedSearchBar } from '@/components/ui/enhanced-search-bar';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface HeroSearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
  showTrending?: boolean;
}

const trendingSearches = ["Hidden waterfalls", "Local ghost stories", "Secret speakeasies", "Underground tunnels", "Historic landmarks"];
const popularCategories = [
  { name: "Mystery", icon: "🔍" },
  { name: "History", icon: "🏛️" },
  { name: "Nature", icon: "🌲" },
  { name: "Urban", icon: "🏙️" }
];

export const HeroSearchBar: React.FC<HeroSearchBarProps> = ({
  className,
  onSearch,
  onQueryChange,
  showTrending = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      const mockSuggestions = trendingSearches
        .filter(search => search.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 4);
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch?.(query.trim());
      onQueryChange?.(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  }, [query, onSearch, onQueryChange, navigate]);

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
    onQueryChange?.(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleTrendingClick = (trending: string) => {
    setQuery(trending);
    onSearch?.(trending);
    onQueryChange?.(trending);
    navigate(`/search?q=${encodeURIComponent(trending)}`);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto px-4", className)}>
      {/* Simplified Mobile-First Hero */}
      <div className="text-center mb-6">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Discover Local Stories
          </span>
        </motion.h1>
        
        <motion.p
          className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Find hidden legends and stories in your area
        </motion.p>
      </div>

  {/* Mobile-First Search Bar */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="space-y-4">
          {/* Search Input */}
          <EnhancedSearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            placeholder="Search stories & legends..."
            size="md"
            variant="hero"
            showVoice={true}
            showHistory={true}
            className="w-full"
          />
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-2xl border border-border bg-background/80 hover:bg-accent touch-manipulation text-sm font-medium"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Near Me
            </Button>
            
            <Button
              onClick={handleSearch}
              disabled={!query.trim()}
              size="lg"
              className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md touch-manipulation text-sm font-medium disabled:opacity-50"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
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
                      className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors duration-200 flex items-center gap-3 touch-manipulation"
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
      </motion.div>

      {/* Popular Categories */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="grid grid-cols-2 gap-3">
          {popularCategories.map((category, index) => (
            <Button
              key={index}
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 touch-manipulation"
              onClick={() => handleTrendingClick(category.name.toLowerCase())}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Trending Searches */}
      {showTrending && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Popular searches</span>
          </div>
          
          <div className="space-y-2">
            {trendingSearches.slice(0, 3).map((trending, index) => (
              <button
                key={index}
                onClick={() => handleTrendingClick(trending)}
                className="block w-full text-center py-3 px-4 rounded-xl bg-muted/50 text-sm text-foreground hover:bg-muted/70 transition-colors duration-200 touch-manipulation"
              >
                {trending}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HeroSearchBar;