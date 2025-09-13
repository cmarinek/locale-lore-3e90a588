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
      
      {/* Mobile Action Buttons - Full Width with better touch targets */}
      <div className="grid grid-cols-2 gap-4">
        {showLocationButton && (
          <Button
            variant="outline"
            size="lg"
            onClick={onLocationSearch}
            className="h-14 rounded-2xl border-2 touch-manipulation text-base font-medium"
          >
            <MapPin className="h-5 w-5 mr-2" />
            Near Me
          </Button>
        )}
        
        <Button
          onClick={() => onSearch?.(value || '')}
          disabled={!value?.trim()}
          size="lg"
          className={cn(
            "h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md touch-manipulation text-base font-medium",
            !showLocationButton && "col-span-2"
          )}
        >
          Explore
        </Button>
      </div>
    </motion.div>
  );
};

export default MobileSearchBar;