import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, Pause, SkipBack, SkipForward, Filter, X } from 'lucide-react';
import { format, subYears, addYears } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  slug: string;
  icon: string;
  color: string;
  category_translations: {
    name: string;
    language_code: string;
  }[];
}

interface TimelineSliderProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onCategoriesChange?: (categories: string[]) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  onDateRangeChange,
  onCategoriesChange,
  minDate = subYears(new Date(), 10),
  maxDate = new Date(),
  className
}) => {
  const [selectedYear, setSelectedYear] = useState(maxDate.getFullYear());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); // ms per step
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const yearRange = maxYear - minYear;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, slug, icon, color, category_translations(name, language_code)')
        .order('slug');

      if (data && !error) {
        setCategories(data as Category[]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);
    onDateRangeChange(startOfYear, endOfYear);
  }, [selectedYear, onDateRangeChange]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSelectedYear(prev => {
        if (prev >= maxYear) {
          setIsPlaying(false);
          return maxYear;
        }
        return prev + 1;
      });
    }, playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, maxYear]);

  const handleSliderChange = (value: number[]) => {
    setSelectedYear(value[0]);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setSelectedYear(maxYear);
    setIsPlaying(false);
  };

  const handleStepBack = () => {
    setSelectedYear(prev => Math.max(minYear, prev - 1));
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    setSelectedYear(prev => Math.min(maxYear, prev + 1));
    setIsPlaying(false);
  };

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categorySlug)
        ? prev.filter(c => c !== categorySlug)
        : [...prev, categorySlug];
      
      onCategoriesChange?.(newSelection);
      return newSelection;
    });
  };

  const clearCategoryFilters = () => {
    setSelectedCategories([]);
    onCategoriesChange?.([]);
  };

  return (
    <Card className={`p-4 bg-background/95 backdrop-blur-sm border-border shadow-lg ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Timeline</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className="h-6 px-2"
            >
              <Filter className="w-3 h-3 mr-1" />
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </div>
          <div className="text-2xl font-bold text-primary">
            {selectedYear}
          </div>
        </div>

        {/* Category Filters */}
        {showCategoryFilter && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Filter by Category</span>
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCategoryFilters}
                  className="h-6 px-2 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const name = category.category_translations.find(t => t.language_code === 'en')?.name || category.slug;
                const isSelected = selectedCategories.includes(category.slug);
                
                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCategory(category.slug)}
                    className="h-7 px-2 text-xs"
                    style={isSelected ? { backgroundColor: category.color, borderColor: category.color } : {}}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Slider */}
        <div className="px-2">
          <Slider
            value={[selectedYear]}
            onValueChange={handleSliderChange}
            min={minYear}
            max={maxYear}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleStepBack}
            disabled={selectedYear <= minYear}
            className="h-8 w-8"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="h-8 w-8"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleStepForward}
            disabled={selectedYear >= maxYear}
            className="h-8 w-8"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 px-3 text-xs ml-2"
          >
            Reset
          </Button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Speed:</span>
          <div className="flex gap-1">
            {[
              { label: '0.5x', value: 2000 },
              { label: '1x', value: 1000 },
              { label: '2x', value: 500 },
              { label: '5x', value: 200 }
            ].map(({ label, value }) => (
              <Button
                key={label}
                variant={playSpeed === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlaySpeed(value)}
                className="h-6 px-2 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
