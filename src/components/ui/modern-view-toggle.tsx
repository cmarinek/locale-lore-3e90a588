import React from 'react';
import { List, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModernViewToggleProps {
  activeView: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
  className?: string;
}

export const ModernViewToggle: React.FC<ModernViewToggleProps> = ({
  activeView,
  onViewChange,
  className
}) => {
  return (
    <div className={cn(
      "flex bg-muted/80 backdrop-blur-sm rounded-full p-1 border border-border/20",
      className
    )}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          "h-8 px-3 rounded-full transition-all",
          activeView === 'list' 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('map')}
        className={cn(
          "h-8 px-3 rounded-full transition-all",
          activeView === 'map' 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Map className="h-4 w-4 mr-1" />
        Map
      </Button>
    </div>
  );
};