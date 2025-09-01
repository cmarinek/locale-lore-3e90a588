import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/ios-card';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    filters, 
    searchSuggestions, 
    setFilters, 
    updateSearchSuggestions 
  } = useDiscoveryStore();

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (inputValue !== filters.query) {
        updateSearchSuggestions(inputValue);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [inputValue, filters.query, updateSearchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setFilters({ query });
    setInputValue(query);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length > 0);
  };

  const handleClear = () => {
    setInputValue('');
    setFilters({ query: '' });
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search locations, facts, or places..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length > 0 && setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(inputValue);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className="pl-10 pr-10 h-12 rounded-full bg-background/80 backdrop-blur-sm border-0 ring-1 ring-border/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (searchSuggestions.length > 0) && (
        <Card
          ref={dropdownRef}
          variant="glass"
          className="absolute top-full mt-2 w-full z-50 p-2 animate-scale-in"
        >
          <div className="space-y-1">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors duration-150 flex items-center gap-3"
              >
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{suggestion}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};