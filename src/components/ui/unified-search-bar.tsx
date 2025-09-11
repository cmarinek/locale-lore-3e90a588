import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface UnifiedSearchBarProps {
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showClearButton?: boolean;
}

export const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  onQueryChange,
  placeholder = "Search...",
  className,
  autoFocus = false,
  showClearButton = true
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onQueryChange?.(debouncedQuery);
  }, [debouncedQuery, onQueryChange]);

  const handleClear = () => {
    setQuery('');
    onQueryChange?.('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative flex items-center">
        <div className="glass-card rounded-xl border-0 bg-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/20 w-full">
          <div className="flex items-center gap-3 p-4">
            <Search className="w-5 h-5 text-white/70 flex-shrink-0" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className="border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-white/50 flex-1"
            />
            {showClearButton && query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};