/**
 * Map Filters Component
 * Distance, category, and sort filters for map view
 */

import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type DistanceFilter = 0.5 | 1 | 5 | 10 | 25 | 50 | 100 | 999999;
export type SortOption = 'distance' | 'recent' | 'popular' | 'verified';

export interface MapFiltersProps {
  distanceFilter: DistanceFilter;
  onDistanceChange: (distance: DistanceFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  categoryFilter?: string;
  onCategoryChange?: (category: string) => void;
  categories?: Array<{ id: string; name: string; icon?: string }>;
  className?: string;
  compact?: boolean;
}

const DISTANCE_OPTIONS: Array<{ value: DistanceFilter; label: string }> = [
  { value: 0.5, label: 'Within 0.5 miles' },
  { value: 1, label: 'Within 1 mile' },
  { value: 5, label: 'Within 5 miles' },
  { value: 10, label: 'Within 10 miles' },
  { value: 25, label: 'Within 25 miles' },
  { value: 50, label: 'Within 50 miles' },
  { value: 100, label: 'Within 100 miles' },
  { value: 999999, label: 'Anywhere' },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'distance', label: 'Closest first' },
  { value: 'recent', label: 'Most recent' },
  { value: 'popular', label: 'Most popular' },
  { value: 'verified', label: 'Verified first' },
];

export const MapFilters: React.FC<MapFiltersProps> = ({
  distanceFilter,
  onDistanceChange,
  sortBy,
  onSortChange,
  categoryFilter,
  onCategoryChange,
  categories,
  className,
  compact = false,
}) => {
  const activeFiltersCount =
    (distanceFilter !== 999999 ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (sortBy !== 'distance' ? 1 : 0);

  if (compact) {
    return (
      <Card className={cn('p-2', className)}>
        <div className="flex items-center gap-2">
          <Select
            value={distanceFilter.toString()}
            onValueChange={(value) => onDistanceChange(parseFloat(value) as DistanceFilter)}
          >
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISTANCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4 shadow-lg backdrop-blur-sm bg-background/95', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <h3 className="font-semibold text-sm">Filters</h3>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>

        {/* Distance Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Distance</label>
          <Select
            value={distanceFilter.toString()}
            onValueChange={(value) => onDistanceChange(parseFloat(value) as DistanceFilter)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISTANCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Sort by</label>
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        {categories && categories.length > 0 && onCategoryChange && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={categoryFilter || 'all'} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onDistanceChange(999999);
              onSortChange('distance');
              onCategoryChange?.('all');
            }}
            className="w-full"
          >
            Clear filters
          </Button>
        )}
      </div>
    </Card>
  );
};
