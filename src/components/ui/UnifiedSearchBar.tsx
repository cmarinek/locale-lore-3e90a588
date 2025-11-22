import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, Loader2, MapPin, Tag, Clock, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { geocodingService } from '@/services/geocodingService';
import { Place } from '@/types/location';
import { debounce } from 'lodash';

interface SearchSuggestion {
  type: 'place' | 'fact' | 'category' | 'location' | 'recent';
  value: string;
  label: string;
  subtitle?: string;
  icon?: string;
  count?: number;
  place?: Place;
}

interface UnifiedSearchBarProps {
  onSearch: (query: string) => void;
  onPlaceSelect?: (place: Place) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'minimal';
  autoFocus?: boolean;
}

export const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  onSearch,
  onPlaceSelect,
  placeholder = 'Search stories, locations, categories...',
  className,
  variant = 'default',
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { facts, categories } = useDiscoveryStore();

  // Debounced place search
  const searchPlaces = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setPlaces([]);
        return;
      }

      setIsSearchingPlaces(true);
      try {
        const results = await geocodingService.searchPlaces(searchQuery, {
          limit: 5,
        });
        setPlaces(results);
        console.log('[UnifiedSearchBar] Found', results.length, 'places for:', searchQuery);
      } catch (error) {
        console.error('[UnifiedSearchBar] Place search error:', error);
        setPlaces([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 400),
    []
  );

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  // Generate autocomplete suggestions based on query
  const suggestions = useMemo((): SearchSuggestion[] => {
    if (!query.trim()) {
      // Show recent searches when no query
      return recentSearches.slice(0, 5).map(search => ({
        type: 'recent',
        value: search,
        label: search
      }));
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchSuggestion[] = [];

    // PRIORITY 1: Places from geocoding (Google Maps style)
    places.forEach(place => {
      // Build subtitle from context (e.g., "New York, USA")
      const contextParts: string[] = [];
      if (place.context) {
        place.context.forEach(ctx => {
          if (ctx.text && !place.name.includes(ctx.text)) {
            contextParts.push(ctx.text);
          }
        });
      }

      results.push({
        type: 'place',
        value: place.full_name,
        label: place.name,
        subtitle: contextParts.join(', ') || place.place_type[0],
        place: place,
      });
    });

    // PRIORITY 2: Facts in our database
    const matchingFacts = facts
      .filter(fact =>
        fact.title.toLowerCase().includes(lowerQuery) ||
        fact.description?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3);

    matchingFacts.forEach(fact => {
      results.push({
        type: 'fact',
        value: fact.title,
        label: fact.title,
        subtitle: fact.location_name,
        icon: fact.categories?.icon
      });
    });

    // PRIORITY 3: Categories
    categories
      .filter(cat => {
        const name = cat.category_translations?.[0]?.name?.toLowerCase() || '';
        return name.includes(lowerQuery) || cat.slug.toLowerCase().includes(lowerQuery);
      })
      .slice(0, 2)
      .forEach(cat => {
        const name = cat.category_translations?.[0]?.name || cat.slug;
        const count = facts.filter(f => f.category_id === cat.id).length;
        results.push({
          type: 'category',
          value: name,
          label: name,
          icon: cat.icon,
          count
        });
      });

    return results.slice(0, 10);
  }, [query, facts, categories, recentSearches, places]);

  // Debounced search callback
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        onSearch(searchQuery);
      }, 300),
    [onSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);

    // Trigger geocoding place search
    searchPlaces(newQuery);

    // Trigger debounced search for real-time filtering
    debouncedSearch(newQuery);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;

    if (!finalQuery.trim()) return;

    // Save to recent searches
    const updated = [
      finalQuery,
      ...recentSearches.filter(s => s !== finalQuery)
    ].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Execute search
    onSearch(finalQuery);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'place' && suggestion.place && onPlaceSelect) {
      // Handle place selection - navigate to location on map
      console.log('[UnifiedSearchBar] Place selected:', suggestion.place);
      onPlaceSelect(suggestion.place);
      setQuery(suggestion.label);
      setShowSuggestions(false);
      inputRef.current?.blur();

      // Save to recent searches
      const updated = [
        suggestion.value,
        ...recentSearches.filter(s => s !== suggestion.value)
      ].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } else {
      // Handle regular text search (facts, categories)
      setQuery(suggestion.value);
      handleSearch(suggestion.value);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'place':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'fact':
        return suggestion.icon || '📖';
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'category':
        return suggestion.icon || <Tag className="h-4 w-4" />;
      case 'recent':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Card
        className={cn(
          'flex items-center gap-2 px-3 py-2 shadow-lg backdrop-blur-sm bg-background/95',
          variant === 'minimal' && 'border-0 shadow-none'
        )}
      >
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-0"
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </Card>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto shadow-xl backdrop-blur-sm bg-background/95"
        >
          <div className="p-2 space-y-1">
            {query && (
              <div className="px-3 py-1 text-xs text-muted-foreground">
                {suggestions.length} suggestions
              </div>
            )}
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
              >
                <span className="shrink-0 text-lg">
                  {getSuggestionIcon(suggestion)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.label}
                  </div>
                  {suggestion.type === 'place' && suggestion.subtitle && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.subtitle}
                    </div>
                  )}
                  {suggestion.type === 'fact' && suggestion.subtitle && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.subtitle}
                    </div>
                  )}
                  {suggestion.type !== 'recent' && suggestion.type !== 'place' && suggestion.type !== 'fact' && (
                    <div className="text-xs text-muted-foreground capitalize">
                      {suggestion.type}
                      {suggestion.count && ` • ${suggestion.count} stories`}
                    </div>
                  )}
                </div>
                {suggestion.type === 'recent' && (
                  <Badge variant="secondary" className="text-xs">
                    Recent
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
