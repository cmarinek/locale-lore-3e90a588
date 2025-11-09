import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Filter, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface MapFilterPanelProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  dateRange: { start: Date; end: Date } | null;
  onDateRangeChange: (range: { start: Date; end: Date } | null) => void;
  popularityFilter: number;
  onPopularityFilterChange: (value: number) => void;
  onClearFilters: () => void;
}

export const MapFilterPanel: React.FC<MapFilterPanelProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  dateRange,
  onDateRangeChange,
  popularityFilter,
  onPopularityFilterChange,
  onClearFilters,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const hasActiveFilters = selectedCategories.length > 0 || dateRange !== null || popularityFilter > 0;

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        variant="outline"
        size="sm"
        className={`absolute top-20 z-20 backdrop-blur-sm bg-background/90 hover:bg-background shadow-md transition-all duration-300 ${
          isCollapsed ? 'left-4' : 'left-80'
        }`}
      >
        {isCollapsed ? (
          <>
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
                !
              </Badge>
            )}
          </>
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>

      {/* Filter Panel */}
      <Card
        className={`absolute top-20 left-4 z-20 w-72 bg-background/95 backdrop-blur-md border-border/50 shadow-xl transition-transform duration-300 ${
          isCollapsed ? '-translate-x-80' : 'translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Filter Stories</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] max-h-[600px]">
          <div className="p-4 space-y-6">
            {/* Categories Filter */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                Categories
              </Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => onCategoryToggle(category.id)}
                    />
                    <Label
                      htmlFor={category.id}
                      className="flex items-center gap-2 flex-1 cursor-pointer text-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.icon}</span>
                      <span className="text-foreground">{category.name}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {category.count}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Date Range
              </Label>
              <div className="space-y-2">
                <Button
                  variant={dateRange ? "secondary" : "outline"}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setMonth(start.getMonth() - 1);
                    onDateRangeChange({ start, end });
                  }}
                >
                  Last Month
                </Button>
                <Button
                  variant={dateRange ? "secondary" : "outline"}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setFullYear(start.getFullYear() - 1);
                    onDateRangeChange({ start, end });
                  }}
                >
                  Last Year
                </Button>
                {dateRange && (
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>

            {/* Popularity Filter */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Min. Popularity Score
              </Label>
              <div className="space-y-2">
                <Slider
                  value={[popularityFilter]}
                  onValueChange={([value]) => onPopularityFilterChange(value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Any</span>
                  <span className="font-semibold text-primary">{popularityFilter}+</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </>
  );
};
