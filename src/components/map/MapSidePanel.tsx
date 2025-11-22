/**
 * Map Side Panel - Google Maps-style results panel
 */

import React, { useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EnhancedFact } from '@/types/fact';
import { FactResultCard } from './FactResultCard';

export interface MapSidePanelProps {
  facts: Array<EnhancedFact & { distance?: number; distanceFormatted?: string }>;
  selectedFactId?: string | null;
  isOpen?: boolean;
  onToggle?: () => void;
  onFactClick?: (fact: EnhancedFact) => void;
  onNavigateToFact?: (fact: EnhancedFact) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const MapSidePanel: React.FC<MapSidePanelProps> = ({
  facts,
  selectedFactId,
  isOpen = true,
  onToggle,
  onFactClick,
  onNavigateToFact,
  title = 'Results',
  subtitle,
  className,
}) => {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected card
  useEffect(() => {
    if (selectedFactId && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedFactId]);

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggle}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-30 shadow-lg"
      >
        <ChevronRight className="h-4 w-4 mr-1" />
        Show results
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'fixed left-0 top-16 bottom-0 w-96 bg-background border-r shadow-xl z-30 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">{title}</h2>
              {facts.length > 0 && (
                <Badge variant="secondary" className="shrink-0">
                  {facts.length}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="shrink-0 h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results List */}
      <ScrollArea className="flex-1">
        {facts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="font-semibold text-lg mb-2">No stories found</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Try adjusting your filters or searching for a different location.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {facts.map((fact) => (
              <div
                key={fact.id}
                ref={fact.id === selectedFactId ? selectedRef : null}
              >
                <FactResultCard
                  fact={fact}
                  distance={fact.distanceFormatted}
                  isSelected={fact.id === selectedFactId}
                  onClick={() => onFactClick?.(fact)}
                  onNavigate={() => onNavigateToFact?.(fact)}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer - Summary */}
      {facts.length > 0 && (
        <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground text-center">
          Showing {facts.length} {facts.length === 1 ? 'story' : 'stories'}
        </div>
      )}
    </div>
  );
};
