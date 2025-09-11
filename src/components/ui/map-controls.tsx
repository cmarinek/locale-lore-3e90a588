import React from 'react';
import { Button } from '@/components/ui/button';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { List, Map as MapIcon, Layers, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MapControlsProps {
  className?: string;
  onFilterToggle?: () => void;
  showFilters?: boolean;
  variant?: 'horizontal' | 'vertical';
  currentView?: 'map' | 'hybrid' | 'list';
}

export const MapControls: React.FC<MapControlsProps> = ({
  className,
  onFilterToggle,
  showFilters = false,
  variant = 'horizontal',
  currentView = 'map'
}) => {
  const navigate = useNavigate();

  const controls = [
    {
      icon: <List className="w-4 h-4" />,
      label: 'List View',
      action: () => navigate('/explore'),
      active: currentView === 'list'
    },
    {
      icon: <Layers className="w-4 h-4" />,
      label: 'Hybrid View', 
      action: () => navigate('/hybrid'),
      active: currentView === 'hybrid'
    },
    {
      icon: <MapIcon className="w-4 h-4" />,
      label: 'Map View',
      action: () => navigate('/map'),
      active: currentView === 'map'
    }
  ];

  if (variant === 'vertical') {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {controls.map((control, index) => (
          <Button
            key={index}
            variant={control.active ? "default" : "secondary"}
            size="sm"
            onClick={control.action}
            className="glass border-0 shadow-lg justify-start"
            title={control.label}
          >
            {control.icon}
            <span className="ml-2 hidden lg:inline">{control.label}</span>
          </Button>
        ))}
        
        {onFilterToggle && (
          <Button
            variant={showFilters ? "default" : "secondary"}
            size="sm"
            onClick={onFilterToggle}
            className="glass border-0 shadow-lg justify-start"
            title="Toggle Filters"
          >
            <Filter className="w-4 h-4" />
            <span className="ml-2 hidden lg:inline">Filters</span>
          </Button>
        )}
        
        <ViewModeToggle variant="glass" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {controls.map((control, index) => (
        <Button
          key={index}
          variant={control.active ? "default" : "secondary"}
          size="sm"
          onClick={control.action}
          className="glass border-0 shadow-lg h-9 px-3"
          title={control.label}
        >
          {control.icon}
          <span className="ml-1 hidden sm:inline text-xs">{control.label.split(' ')[0]}</span>
        </Button>
      ))}
      
      {onFilterToggle && (
        <Button
          variant={showFilters ? "default" : "secondary"}
          size="sm"
          onClick={onFilterToggle}
          className="glass border-0 shadow-lg h-9 px-3"
          title="Toggle Filters"
        >
          <Filter className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline text-xs">Filter</span>
        </Button>
      )}
    </div>
  );
};