
import React, { useCallback, useEffect } from 'react';
import { EnhancedSearchBar } from '@/components/ui/enhanced-search-bar';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onQueryChange?: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onQueryChange,
  className,
  placeholder = "Search for facts, stories, or topics..."
}) => {
  const { filters, setFilters } = useDiscoveryStore();

  const handleSearch = useCallback((query: string) => {
    setFilters({ search: query });
    onQueryChange?.(query);
  }, [setFilters, onQueryChange]);

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <EnhancedSearchBar
        value={filters.search || ''}
        onChange={(value) => setFilters({ search: value })}
        onSearch={handleSearch}
        placeholder={placeholder}
        size="md"
        variant="default"
        showHistory={true}
        showVoice={true}
        className="w-full"
      />
    </div>
  );
};
