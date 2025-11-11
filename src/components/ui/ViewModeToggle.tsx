import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Map as MapIcon, Layers } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

type ViewMode = 'explore' | 'hybrid' | 'map';

interface ViewModeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  className,
  compact = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getCurrentMode = (): ViewMode => {
    if (location.pathname === '/explore') return 'explore';
    if (location.pathname === '/hybrid') return 'hybrid';
    if (location.pathname === '/map') return 'map';
    return 'explore';
  };

  const handleModeClick = (mode: ViewMode) => {
    navigate(`/${mode === 'explore' ? 'explore' : mode}`);
  };

  const getModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'explore': return List;
      case 'hybrid': return Layers;
      case 'map': return MapIcon;
    }
  };

  const getModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'explore': return 'List';
      case 'hybrid': return 'Hybrid';
      case 'map': return 'Map';
    }
  };

  const currentMode = getCurrentMode();
  const allModes: ViewMode[] = ['explore', 'hybrid', 'map'];

  return (
    <div className={cn(
      "flex bg-muted/50 backdrop-blur-sm rounded-full p-1 border border-border/20",
      className
    )}>
      {allModes.map((mode) => {
        const Icon = getModeIcon(mode);
        const isActive = mode === currentMode;
        
        return (
          <Button
            key={mode}
            variant="ghost"
            size="sm"
            onClick={() => handleModeClick(mode)}
            className={cn(
              "h-8 rounded-full transition-all touch-manipulation",
              compact ? "px-2 min-w-[44px]" : "px-3 min-w-[44px]",
              isActive 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={`Switch to ${getModeLabel(mode)}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={cn("h-4 w-4", !compact && "md:mr-1.5")} />
            {!compact && (
              <span className="hidden md:inline text-xs font-medium">
                {getModeLabel(mode)}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};