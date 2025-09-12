import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  X, 
  History,
  ChevronRight,
  MapPin
} from 'lucide-react';

interface SearchSuggestion {
  query: string;
  type: 'history' | 'trending' | 'location' | 'category';
  count?: number;
  timestamp?: number;
  icon?: React.ReactNode;
}

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  isVisible: boolean;
  onSelect: (query: string) => void;
  onRemove?: (query: string) => void;
  onClear?: () => void;
  currentQuery?: string;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isVisible,
  onSelect,
  onRemove,
  onClear,
  currentQuery = '',
  className
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  const getTypeIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'history':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'category':
        return <Search className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'history':
        return 'Recent';
      case 'trending':
        return 'Trending';
      case 'location':
        return 'Location';
      case 'category':
        return 'Category';
      default:
        return '';
    }
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary font-medium">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "absolute top-full left-0 right-0 z-50 mt-2",
          className
        )}
      >
        <Card className="p-2 shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
          {/* Header with clear option */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <History className="w-4 h-4" />
              <span>Search suggestions</span>
            </div>
            {onClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Suggestions list */}
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={`${suggestion.type}-${suggestion.query}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors group",
                  "hover:bg-muted/50 active:bg-muted",
                  hoveredIndex === index && "bg-muted/50"
                )}
                onClick={() => onSelect(suggestion.query)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
              >
                {/* Type icon */}
                <div className="flex-shrink-0">
                  {suggestion.icon || getTypeIcon(suggestion.type)}
                </div>

                {/* Query text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {highlightQuery(suggestion.query, currentQuery)}
                  </div>
                  {suggestion.count !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.count} results
                    </div>
                  )}
                </div>

                {/* Type badge */}
                <Badge 
                  variant="secondary" 
                  className="text-xs px-2 py-1 opacity-70 group-hover:opacity-100"
                >
                  {getTypeLabel(suggestion.type)}
                </Badge>

                {/* Action buttons */}
                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onRemove && suggestion.type === 'history' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(suggestion.query);
                      }}
                      className="h-auto p-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                      <span className="sr-only">Remove from history</span>
                    </Button>
                  )}
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced search input with integrated suggestions
interface EnhancedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  suggestions: SearchSuggestion[];
  onRemoveFromHistory?: (query: string) => void;
  onClearHistory?: () => void;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export const EnhancedSearchInput: React.FC<EnhancedSearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  suggestions,
  onRemoveFromHistory,
  onClearHistory,
  className,
  showSuggestions = true,
  autoFocus = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionSelect = (query: string) => {
    onChange(query);
    onSubmit(query);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const shouldShowSuggestions = showSuggestions && isFocused && suggestions.length > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              "w-full pl-10 pr-4 py-3 text-sm",
              "bg-background border border-border rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              shouldShowSuggestions && "rounded-b-none"
            )}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </form>

      <SearchSuggestions
        suggestions={suggestions}
        isVisible={shouldShowSuggestions}
        onSelect={handleSuggestionSelect}
        onRemove={onRemoveFromHistory}
        onClear={onClearHistory}
        currentQuery={value}
      />
    </div>
  );
};