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
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground z-10" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 sm:pl-12 h-10 sm:h-12 rounded-full",
            "bg-background/95 backdrop-blur-lg border border-border/50",
            "text-sm sm:text-base",
            "focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20",
            "transition-all duration-200",
            "shadow-sm hover:shadow-md",
            showLocationButton ? "pr-12 sm:pr-14" : "pr-4"
          )}
        />
        {showLocationButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 z-10"
          >
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>
    </form>
  );
};