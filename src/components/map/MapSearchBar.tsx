import React, { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MapSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const MapSearchBar: React.FC<MapSearchBarProps> = ({
  onSearch,
  placeholder = "Search locations, stories...",
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="fixed top-20 right-4 z-20 w-80">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin flex-shrink-0" />
          ) : query ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
