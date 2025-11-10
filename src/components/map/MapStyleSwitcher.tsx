import React from 'react';
import { Sun, Moon, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type MapStyle = 'light' | 'dark' | 'satellite';

interface MapStyleSwitcherProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
  className?: string;
}

export const MapStyleSwitcher: React.FC<MapStyleSwitcherProps> = ({
  currentStyle,
  onStyleChange,
  className = '',
}) => {
  const styles: { value: MapStyle; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
    { value: 'satellite', icon: <Satellite className="h-4 w-4" />, label: 'Satellite' },
  ];

  return (
    <div className={cn('bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1 flex gap-1', className)}>
      {styles.map((style) => (
        <Button
          key={style.value}
          variant={currentStyle === style.value ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onStyleChange(style.value)}
          className={cn(
            "transition-all",
            currentStyle === style.value && "shadow-sm"
          )}
          title={style.label}
        >
          {style.icon}
        </Button>
      ))}
    </div>
  );
};
