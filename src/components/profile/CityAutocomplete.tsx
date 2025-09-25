import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Globe } from 'lucide-react';
import { useCitySearch, CityResult } from '@/hooks/useCitySearch';
import { cn } from '@/lib/utils';

interface CityAutocompleteProps {
  onCitySelect: (city: { name: string; lat: number; lng: number; country: string }) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  onCitySelect,
  placeholder = "Search for a city...",
  className,
  label = "City"
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { cities, loading, error, searchCities, clearResults } = useCitySearch();

  useEffect(() => {
    if (query) {
      searchCities(query);
      setShowDropdown(true);
    } else {
      clearResults();
      setShowDropdown(false);
    }
  }, [query, searchCities, clearResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: CityResult) => {
    const selectedCity = {
      name: city.name,
      lat: parseFloat(city.lat),
      lng: parseFloat(city.lon),
      country: city.country
    };
    
    onCitySelect(selectedCity);
    setQuery(`${city.name}, ${city.country}`);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || cities.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < cities.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : cities.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && cities[selectedIndex]) {
          handleCitySelect(cities[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatCityDisplay = (city: CityResult) => {
    const parts = [city.name];
    if (city.state) parts.push(city.state);
    if (city.country) parts.push(city.country);
    return parts.join(', ');
  };

  return (
    <div className={cn("relative", className)}>
      {label && <Label htmlFor="city-search">{label}</Label>}
      
      <div className="relative">
        <Input
          id="city-search"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowDropdown(true)}
          placeholder={placeholder}
          className="pr-10"
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Globe className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showDropdown && (cities.length > 0 || error || loading) && (
        <Card 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto shadow-lg border bg-background"
        >
          {error ? (
            <div className="p-3 text-sm text-destructive">
              {error}
            </div>
          ) : loading ? (
            <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching cities...
            </div>
          ) : cities.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              No cities found. Try a different search term.
            </div>
          ) : (
            <div className="py-1">
              {cities.map((city, index) => (
                <Button
                  key={city.place_id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-3 rounded-none",
                    "hover:bg-muted focus:bg-muted",
                    selectedIndex === index && "bg-muted"
                  )}
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">
                        {city.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCityDisplay(city)}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};