import React from 'react';
import { EnhancedSearchBar } from './enhanced-search-bar';
import { Button } from './button';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MobileSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onVoiceSearch?: (transcript: string) => void;
  onLocationSearch?: () => void;
  placeholder?: string;
  className?: string;
  showLocationButton?: boolean;
}

export const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onVoiceSearch,
  onLocationSearch,
  placeholder = "Search mysteries & legends...",
  className,
  showLocationButton = true
}) => {
  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Enhanced Search Input */}
      <EnhancedSearchBar
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        onVoiceSearch={onVoiceSearch}
        placeholder={placeholder}
        size="lg"
        variant="hero"
        showVoice={!!onVoiceSearch}
        showHistory={true}
        className="w-full"
      />
      
      {/* Mobile Action Buttons - Proper spacing and touch targets */}
      <div className="grid grid-cols-2 gap-3">
        {showLocationButton && (
          <Button
            variant="outline"
            size="lg"
            onClick={onLocationSearch}
            className="h-12 rounded-2xl border border-border bg-card hover:bg-accent touch-manipulation text-sm font-medium shadow-sm"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Near Me
          </Button>
        )}
        
        <Button
          onClick={() => onSearch?.(value || '')}
          disabled={!value?.trim()}
          size="lg"
          className={cn(
            "h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md touch-manipulation text-sm font-medium disabled:opacity-50",
            !showLocationButton && "col-span-2"
          )}
        >
          Search
        </Button>
      </div>
    </motion.div>
  );
};

export default MobileSearchBar;