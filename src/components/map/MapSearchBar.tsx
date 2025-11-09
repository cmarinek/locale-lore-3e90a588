import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  category?: {
    slug: string;
    icon: string;
    color: string;
    category_translations: { name: string }[];
  };
}

interface MapSearchBarProps {
  facts: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  className?: string;
}

export const MapSearchBar: React.FC<MapSearchBarProps> = ({
  facts,
  onResultSelect,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Filter and sort results
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lowercaseQuery = query.toLowerCase();
    return facts
      .filter(
        (fact) =>
          fact.title.toLowerCase().includes(lowercaseQuery) ||
          fact.location_name.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => {
        // Prioritize title matches over location matches
        const aTitleMatch = a.title.toLowerCase().includes(lowercaseQuery);
        const bTitleMatch = b.title.toLowerCase().includes(lowercaseQuery);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return 0;
      })
      .slice(0, 8);
  }, [query, facts]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Show dropdown when there are results
  useEffect(() => {
    setIsOpen(results.length > 0 && query.trim().length > 0);
  }, [results, query]);

  const handleSelect = (result: SearchResult) => {
    onResultSelect(result);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Card className="bg-background/95 backdrop-blur-md border-border/50 shadow-lg">
        <div className="flex items-center gap-2 p-2">
          <Search className="w-4 h-4 text-muted-foreground ml-2" />
          <Input
            type="text"
            placeholder="Search stories or locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 mr-1"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </Card>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full z-50 bg-background/98 backdrop-blur-md border-border/50 shadow-xl animate-fade-in">
          <ScrollArea className="max-h-80">
            <div className="p-2 space-y-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    index === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.category && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${result.category.color}20` }}
                      >
                        <span className="text-sm">{result.category.icon}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {result.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {result.location_name}
                        </span>
                      </div>
                      {result.category && (
                        <Badge
                          variant="secondary"
                          className="mt-1.5 text-xs"
                          style={{
                            backgroundColor: `${result.category.color}15`,
                            color: result.category.color,
                          }}
                        >
                          {result.category.category_translations[0]?.name || result.category.slug}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="px-3 py-2 border-t border-border/50 text-xs text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
        </Card>
      )}
    </div>
  );
};
