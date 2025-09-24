import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface UnifiedHeroSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showLocationButton?: boolean;
  variant?: 'default' | 'optimized' | 'modern';
  className?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UnifiedHeroSearchBar: React.FC<UnifiedHeroSearchBarProps> = ({
  onSearch,
  placeholder = "Search for stories, places, or topics...",
  showLocationButton = true,
  variant = 'default',
  className = '',
  autoFocus = false,
  size = 'lg'
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Popular search suggestions
  const popularSearches = [
    'Hidden gems near me',
    'Historical landmarks',
    'Local legends',
    'Street art locations',
    'Food history',
    'Ghost stories',
    'Archaeological sites',
    'Cultural sites'
  ];

  const handleSearch = useCallback(async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      // Call parent's onSearch if provided
      if (onSearch) {
        await onSearch(searchQuery.trim());
      } else {
        // Default behavior: navigate to search page
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch, navigate]);

  const handleLocationSearch = useCallback(async () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      const locationQuery = `stories near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      setQuery(locationQuery);
      await handleSearch(locationQuery);
    } catch (error) {
      console.error('Location error:', error);
      // Fallback to general location search
      const fallbackQuery = 'stories near me';
      setQuery(fallbackQuery);
      await handleSearch(fallbackQuery);
    } finally {
      setIsGettingLocation(false);
    }
  }, [handleSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Show suggestions when typing
    if (value.trim() && variant === 'modern') {
      const filtered = popularSearches.filter(search => 
        search.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [variant]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  }, [handleSearch]);

  const handleFocus = useCallback(() => {
    if (variant === 'modern' && !query.trim()) {
      setSuggestions(popularSearches.slice(0, 5));
      setShowSuggestions(true);
    }
  }, [variant, query]);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  // Size-based styling
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  };

  // Variant-based styling
  const variantClasses = {
    default: 'bg-background border-border',
    optimized: 'bg-white/90 backdrop-blur-sm border-white/20 shadow-lg',
    modern: 'bg-card border-border shadow-sm'
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          flex items-center gap-2 rounded-full
          ${variantClasses[variant]}
          ${variant === 'optimized' ? 'border-2' : 'border'}
          ${size === 'lg' ? 'px-6 py-3' : size === 'md' ? 'px-4 py-2' : 'px-3 py-2'}
        `}>
          <Search className={`
            flex-shrink-0 text-muted-foreground
            ${size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'}
          `} />
          
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`
              flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0
              ${sizeClasses[size]}
              ${variant === 'optimized' ? 'placeholder:text-gray-500' : ''}
            `}
            disabled={isSearching}
          />

          {showLocationButton && (
            <Button
              type="button"
              variant="ghost"
              size={size === 'lg' ? 'default' : 'sm'}
              onClick={handleLocationSearch}
              disabled={isGettingLocation || isSearching}
              className="flex-shrink-0 rounded-full"
              title="Search stories near your location"
            >
              {isGettingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            type="submit"
            size={size === 'lg' ? 'default' : 'sm'}
            disabled={!query.trim() || isSearching}
            className="flex-shrink-0 rounded-full"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {/* Suggestions dropdown for modern variant */}
      {showSuggestions && variant === 'modern' && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 text-sm"
            >
              <Search className="w-4 h-4 inline mr-3 text-muted-foreground" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedHeroSearchBar;