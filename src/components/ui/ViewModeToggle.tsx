import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Map as MapIcon, Layers } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

type ViewMode = 'explore' | 'hybrid' | 'map';

interface ViewModeToggleProps {
  className?: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline' | 'glass';
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  className,
  size = 'sm',
  variant = 'outline'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getCurrentMode = (): ViewMode => {
    if (location.pathname === '/explore') return 'explore';
    if (location.pathname === '/hybrid') return 'hybrid';
    if (location.pathname === '/map') return 'map';
    return 'explore';
  };

  const getOtherModes = (): ViewMode[] => {
    const current = getCurrentMode();
    switch (current) {
      case 'explore': return ['hybrid', 'map'];
      case 'hybrid': return ['explore', 'map'];
      case 'map': return ['explore', 'hybrid'];
      default: return ['hybrid', 'map'];
    }
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
      case 'explore': return 'List View';
      case 'hybrid': return 'Hybrid View';
      case 'map': return 'Map View';
    }
  };

  const getModeShortLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'explore': return 'List';
      case 'hybrid': return 'Hybrid';
      case 'map': return 'Map';
    }
  };

  const otherModes = getOtherModes();

  return (
    <div className={cn("flex gap-2", className)}>
      {otherModes.map((mode) => {
        const Icon = getModeIcon(mode);
        return (
          <Button
            key={mode}
            variant={variant === 'glass' ? 'secondary' : variant}
            size={size}
            onClick={() => handleModeClick(mode)}
            className={cn(
              variant === 'glass' && "glass border-0 shadow-lg bg-background/80 backdrop-blur-sm"
            )}
          >
            <Icon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{getModeLabel(mode)}</span>
            <span className="sm:hidden">{getModeShortLabel(mode)}</span>
          </Button>
        );
      })}
    </div>
  );
};