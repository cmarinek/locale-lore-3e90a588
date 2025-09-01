
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (search: string) => void;
  onClear: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelect,
  onClear
}) => {
  if (searches.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-muted-foreground">Recent</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs h-6 px-2"
        >
          Clear
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {searches.map((recent) => (
          <Badge
            key={recent}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => onSelect(recent)}
          >
            <Clock className="w-3 h-3 mr-1" />
            {recent}
          </Badge>
        ))}
      </div>
    </div>
  );
};
