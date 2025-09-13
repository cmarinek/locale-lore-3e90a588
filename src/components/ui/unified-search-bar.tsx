import React from 'react';
import { EnhancedSearchBar } from './enhanced-search-bar';
import { cn } from '@/lib/utils';

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
  return (
    <div className={cn("glass-card rounded-xl border-0 bg-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/20", className)}>
      <div className="p-2">
        <EnhancedSearchBar
          onChange={onQueryChange}
          onSearch={onQueryChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          variant="hero"
          size="md"
          className="border-0 bg-transparent"
        />
      </div>
    </div>
  );
};