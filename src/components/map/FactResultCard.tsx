/**
 * Fact Result Card - Google Maps-style result card for facts
 */

import React from 'react';
import { MapPin, ThumbsUp, Star, Navigation2, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { EnhancedFact } from '@/types/fact';

export interface FactResultCardProps {
  fact: EnhancedFact;
  distance?: string;
  isSelected?: boolean;
  onClick?: () => void;
  onNavigate?: () => void;
  className?: string;
}

export const FactResultCard: React.FC<FactResultCardProps> = ({
  fact,
  distance,
  isSelected,
  onClick,
  onNavigate,
  className,
}) => {
  const categoryName =
    fact.categories?.category_translations?.find((t) => t.language_code === 'en')?.name ||
    fact.categories?.slug ||
    'Unknown';

  const netVotes = (fact.vote_count_up || 0) - (fact.vote_count_down || 0);
  const rating = fact.vote_count_up && fact.vote_count_up > 0
    ? (fact.vote_count_up / (fact.vote_count_up + (fact.vote_count_down || 0))) * 5
    : 0;

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50',
        isSelected && 'border-primary shadow-lg bg-accent/10',
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate">
              {fact.title}
            </h3>
            {distance && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Navigation2 className="h-3 w-3" />
                <span>{distance}</span>
                {fact.status === 'verified' && (
                  <>
                    <span className="mx-1">•</span>
                    <Badge variant="default" className="text-xs px-1.5 py-0">
                      Verified
                    </Badge>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Category Badge */}
          <Badge variant="outline" className="shrink-0">
            <span className="mr-1">{fact.categories?.icon || '📍'}</span>
            {categoryName}
          </Badge>
        </div>

        {/* Rating & Votes */}
        {rating > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              ({fact.vote_count_up + (fact.vote_count_down || 0)} votes)
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {fact.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{fact.location_name}</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          {/* Author */}
          {fact.profiles && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={fact.profiles.avatar_url} />
                <AvatarFallback className="text-xs">
                  {fact.profiles.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {fact.profiles.username}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.();
              }}
            >
              <MapPin className="h-3 w-3 mr-1" />
              View on map
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
