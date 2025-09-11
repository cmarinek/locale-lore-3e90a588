import React, { useState } from 'react';
import { Filter, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/ios-badge';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { 
    filters, 
    categories, 
    setFilters 
  } = useDiscoveryStore();

  const activeFiltersCount = [
    filters.categories.length > 0 && filters.categories.length,
    filters.radius !== 10 && 1,
    filters.center && 1
  ].filter(Boolean).length;

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    setFilters({ categories: newCategories });
  };

  const handleRadiusChange = (value: number[]) => {
    setFilters({ radius: value[0] });
  };

  const handleSortChange = (sortBy: string) => {
    setFilters({ sortBy: sortBy as any });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFilters({ center: [longitude, latitude] });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  };

  const clearLocation = () => {
    setFilters({ center: null });
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      radius: 10,
      center: null,
      sortBy: 'recency'
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "relative rounded-full px-4 transition-all duration-200",
              activeFiltersCount > 0 && "bg-primary/10 border-primary/30",
              className
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="notification"
                size="sm"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader>
            <SheetTitle>Filter & Sort</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Sort Options */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Sort by</h3>
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recency">Most Recent</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="credibility">Most Credible</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Location</h3>
              <div className="space-y-3">
                {filters.center ? (
                  <Card variant="glass" className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm">Current Location</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearLocation}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Button
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use Current Location
                  </Button>
                )}

                {filters.center && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Radius: {filters.radius} km
                    </label>
                    <Slider
                      value={[filters.radius]}
                      onValueChange={handleRadiusChange}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const isSelected = filters.categories.includes(category.id);
                  const categoryName = category.category_translations?.find(
                    t => t.language_code === 'en'
                  )?.name || category.slug;

                  return (
                    <Button
                      key={category.id}
                      variant={isSelected ? "ios" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryToggle(category.id)}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <span 
                        className="text-lg"
                        style={{ color: isSelected ? 'white' : category.color }}
                      >
                        {category.icon}
                      </span>
                      <span className="text-xs capitalize">{categoryName}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Clear All */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};