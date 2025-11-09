import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calendar, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { format, subYears, addYears } from 'date-fns';

interface TimelineSliderProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  onDateRangeChange,
  minDate = subYears(new Date(), 10),
  maxDate = new Date(),
  className
}) => {
  const [selectedYear, setSelectedYear] = useState(maxDate.getFullYear());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); // ms per step

  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const yearRange = maxYear - minYear;

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

  return (
    <Card className={`p-4 bg-background/95 backdrop-blur-sm border-border shadow-lg ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Timeline</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {selectedYear}
          </div>
        </div>

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
