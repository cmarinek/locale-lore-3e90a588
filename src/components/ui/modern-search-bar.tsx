import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mapboxClient } from '@/utils/mapbox-client';
import { toast } from '@/hooks/use-toast';

interface LocationSuggestion {
  place_name: string;
  center: [number, number];
}

interface ModernSearchBarProps {
  onSearch?: (query: string) => void;
  onLocationSelect?: (location: { latitude: number; longitude: number; name: string }) => void;
  placeholder?: string;
  className?: string;
  showLocationButton?: boolean;
}

export const ModernSearchBar: React.FC<ModernSearchBarProps> = ({
  onSearch,
  onLocationSelect,
  placeholder = "Search stories...",
  className,
  showLocationButton = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch location suggestions as user types
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const results = await mapboxClient.searchPlaces(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch location suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setQuery(suggestion.place_name);
    setShowSuggestions(false);
    onLocationSelect?.({
      latitude: suggestion.center[1],
      longitude: suggestion.center[0],
      name: suggestion.place_name
    });
  };

  const handleGetCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect?.({
          latitude,
          longitude,
          name: 'Your location'
        });
        toast({
          title: "Location found",
          description: "Centered map on your location"
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Location access denied:', error);
        toast({
          title: "Location access denied",
          description: "Please enable location access in your browser settings",
          variant: "destructive"
        });
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <div ref={suggestionsRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground z-10" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-4/5 pl-10 sm:pl-12 h-11 rounded-full",
              "bg-background/90 backdrop-blur-lg border border-border/30",
              "text-sm sm:text-base",
              "focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
              "transition-all duration-200",
              "shadow-lg hover:shadow-xl",
              showLocationButton ? "pr-14 sm:pr-16" : "pr-4"
            )}
          />
          {showLocationButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-primary/10 z-10 min-h-[44px] min-w-[44px]"
              aria-label="Use current location"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto">
          {isLoadingSuggestions ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Searching locations...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-accent/50 transition-colors flex items-center gap-3 border-b border-border/20 last:border-0"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{suggestion.place_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
};