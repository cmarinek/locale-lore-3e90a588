import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useSafeTranslation';
import { cn } from '@/lib/utils';
interface HeroSearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
  showTrending?: boolean;
}
const trendingSearches = ["Hidden waterfalls", "Local ghost stories", "Secret speakeasies", "Underground tunnels", "Historic landmarks"];
const popularCategories = [{
  name: "Mystery",
  icon: "🔍"
}, {
  name: "History",
  icon: "🏛️"
}, {
  name: "Nature",
  icon: "🌲"
}, {
  name: "Urban",
  icon: "🏙️"
}];
export const HeroSearchBar: React.FC<HeroSearchBarProps> = ({
  className,
  onSearch,
  showTrending = true
}) => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      const mockSuggestions = trendingSearches.filter(search => search.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
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
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  }, [query, onSearch, navigate]);
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
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };
  const handleTrendingClick = (trending: string) => {
    setQuery(trending);
    onSearch?.(trending);
    navigate(`/search?q=${encodeURIComponent(trending)}`);
  };
  return <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Main Search Section */}
      <div className="text-center mb-8">
        <motion.h1 className="text-4xl md:text-6xl font-bold mb-4" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }}>
          <span className="text-primary">Find</span>{" "}
          <span className="text-secondary">Local Lore</span>
        </motion.h1>
        
        <motion.p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }}>Share and uncover hidden stories, legends, and secrets in your neighborhood</motion.p>
      </div>

      {/* Search Bar */}
      <motion.div className="relative mb-8" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      delay: 0.4
    }}>
        <div className="relative">
          <div className="flex items-center bg-card border border-border rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center flex-1 px-4">
              <Search className="h-5 w-5 text-muted-foreground mr-3 group-focus-within:text-primary transition-colors" />
              <Input ref={inputRef} type="text" placeholder="Search for mysteries, legends, or hidden gems..." value={query} onChange={e => setQuery(e.target.value)} onKeyPress={handleKeyPress} onFocus={() => query.length > 1 && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                Near me
              </Button>
              
              <Button onClick={handleSearch} disabled={!query.trim()} size="lg" className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300">
                Explore
              </Button>
            </div>
          </div>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && <motion.div initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }} className="absolute z-50 w-full mt-2">
              <Card className="p-3 bg-card/95 backdrop-blur border-border shadow-xl">
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => <button key={index} className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors duration-200 flex items-center gap-3" onClick={() => handleSuggestionClick(suggestion)}>
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{suggestion}</span>
                    </button>)}
                </div>
              </Card>
            </motion.div>}
        </AnimatePresence>
      </motion.div>

      {/* Popular Categories */}
      <motion.div className="mb-8" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      delay: 0.6
    }}>
        <div className="flex flex-wrap justify-center gap-3">
          {popularCategories.map((category, index) => <Button key={index} variant="outline" size="sm" className="rounded-full px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-all duration-300 border-border" onClick={() => handleTrendingClick(category.name.toLowerCase())}>
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>)}
        </div>
      </motion.div>

      {/* Trending Searches */}
      {showTrending && <motion.div className="text-center" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      delay: 0.8
    }}>
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Trending searches</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {trendingSearches.map((trending, index) => <button key={index} onClick={() => handleTrendingClick(trending)} className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
                {trending}
              </button>)}
          </div>
        </motion.div>}

    </div>;
};
export default HeroSearchBar;