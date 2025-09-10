import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  CheckCircle, 
  Image, 
  Heart, 
  Clock, 
  TrendingUp,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchFilters } from '@/types/fact';

interface QuickFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  className?: string;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  onFiltersChange,
  className
}) => {
  const quickFilterOptions = [
    {
      id: 'nearby',
      label: 'Nearby',
      icon: <MapPin className="w-4 h-4" />,
      active: !!filters.location,
      onClick: () => {
        // Toggle location-based filtering
        if (filters.location) {
          onFiltersChange({ location: undefined });
        } else {
          // This would be handled by the parent component to get location
          onFiltersChange({ location: { lat: 0, lng: 0 } });
        }
      }
    },
    {
      id: 'verified',
      label: 'Verified',
      icon: <CheckCircle className="w-4 h-4" />,
      active: filters.verified === true,
      onClick: () => {
        onFiltersChange({ 
          verified: filters.verified === true ? undefined : true 
        });
      }
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: <TrendingUp className="w-4 h-4" />,
      active: filters.sortBy === 'popularity',
      onClick: () => {
        onFiltersChange({ 
          sortBy: filters.sortBy === 'popularity' ? 'relevance' : 'popularity' 
        });
      }
    },
    {
      id: 'recent',
      label: 'Recent',
      icon: <Clock className="w-4 h-4" />,
      active: filters.sortBy === 'recency',
      onClick: () => {
        onFiltersChange({ 
          sortBy: filters.sortBy === 'recency' ? 'relevance' : 'recency' 
        });
      }
    },
    {
      id: 'with-media',
      label: 'Has Media',
      icon: <Image className="w-4 h-4" />,
      active: filters.timeRange === 'has_media', // Using timeRange as a hack for now
      onClick: () => {
        onFiltersChange({ 
          timeRange: filters.timeRange === 'has_media' ? '' : 'has_media'
        });
      }
    }
  ];

  const activeFiltersCount = quickFilterOptions.filter(option => option.active).length;

  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {quickFilterOptions.map((option) => (
            <Button
              key={option.id}
              variant={option.active ? 'default' : 'outline'}
              size="sm"
              onClick={option.onClick}
              className={cn(
                "shrink-0 h-8 px-3 transition-all duration-200",
                option.active && "shadow-md",
                "hover:scale-105 active:scale-95"
              )}
            >
              {option.icon}
              <span className="ml-1.5 text-sm">{option.label}</span>
            </Button>
          ))}
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onFiltersChange({
                  verified: undefined,
                  location: undefined,
                  sortBy: 'relevance',
                  timeRange: ''
                });
              }}
              className="shrink-0 h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </ScrollArea>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filters:</span>
          <div className="flex gap-1">
            {quickFilterOptions
              .filter(option => option.active)
              .map(option => (
                <Badge 
                  key={option.id} 
                  variant="secondary" 
                  className="text-xs h-5 px-2"
                >
                  {option.label}
                </Badge>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};