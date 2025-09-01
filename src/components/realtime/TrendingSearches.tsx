
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrendingSearchesProps {
  searches: string[];
  onSelect: (search: string) => void;
}

export const TrendingSearches: React.FC<TrendingSearchesProps> = ({
  searches,
  onSelect
}) => {
  if (searches.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Trending</h4>
      <div className="flex flex-wrap gap-1">
        {searches.map((trending) => (
          <Badge
            key={trending}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
            onClick={() => onSelect(trending)}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {trending}
          </Badge>
        ))}
      </div>
    </div>
  );
};
