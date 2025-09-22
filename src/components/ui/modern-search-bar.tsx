import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModernSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showLocationButton?: boolean;
}

export const ModernSearchBar: React.FC<ModernSearchBarProps> = ({
  onSearch,
  placeholder = "Search stories...",
  className,
  showLocationButton = false
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20 h-12 rounded-full bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {showLocationButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
};