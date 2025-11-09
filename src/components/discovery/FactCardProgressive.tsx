import React, { useState, useEffect } from 'react';
import { MapPin, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LocationNavigationButton } from '@/components/ui/LocationNavigationButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useSavedFacts } from '@/hooks/useSavedFacts';
import { EnhancedFact } from '@/types/fact';
import { cn } from '@/lib/utils';

interface FactCardProgressiveProps {
  fact: EnhancedFact;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const FactCardProgressive: React.FC<FactCardProgressiveProps> = ({
  fact,
  className,
  viewMode = 'grid'
}) => {
  const { setSelectedFact } = useDiscoveryStore();
  const { savedFacts, toggleSave, isSaving } = useSavedFacts();
  
  // Progressive loading states
  const [titleLoaded, setTitleLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [descriptionLoaded, setDescriptionLoaded] = useState(false);

  const isSaved = savedFacts.includes(fact.id);
  const voteScore = fact.vote_count_up - fact.vote_count_down;
  const categoryName = fact.categories?.category_translations?.find(t => t.language_code === 'en')?.name || fact.categories?.slug || 'Unknown';

  // Simulate progressive loading
  useEffect(() => {
    // Title loads immediately
    setTitleLoaded(true);
    
    // Image preloading
    if (fact.image_url || (fact.media_urls && fact.media_urls.length > 0)) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = fact.image_url || fact.media_urls?.[0] || '';
    } else {
      setImageLoaded(true);
    }

    // Metadata loads after title
    const metadataTimer = setTimeout(() => setMetadataLoaded(true), 100);
    
    // Description loads last
    const descTimer = setTimeout(() => setDescriptionLoaded(true), 200);

    return () => {
      clearTimeout(metadataTimer);
      clearTimeout(descTimer);
    };
  }, [fact]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(fact.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFact(fact);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (viewMode === 'list') {
    return (
      <Card variant="elevated" className={cn("overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group w-full", className)} onClick={handleQuickView}>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3">
            {/* Image */}
            {(fact.image_url || (fact.media_urls && fact.media_urls.length > 0)) && (
              <div className="relative w-full sm:w-24 md:w-32 h-32 sm:h-20 shrink-0 overflow-hidden rounded-lg">
                {!imageLoaded ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <img 
                    src={fact.image_url || fact.media_urls?.[0]} 
                    alt={fact.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 animate-fade-in"
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Title */}
                  {titleLoaded ? (
                    <h3 className="font-semibold text-base sm:text-sm line-clamp-2 group-hover:text-primary transition-colors animate-fade-in">
                      {fact.title}
                    </h3>
                  ) : (
                    <Skeleton className="h-5 w-3/4" />
                  )}
                  
                  {/* Location */}
                  {metadataLoaded ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in animation-delay-100">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate font-medium text-xs">{fact.location_name}</span>
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-32" />
                  )}
                </div>
                
                {/* Save Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSaveToggle} 
                  className="h-8 w-8 p-0 shrink-0"
                  disabled={isSaving}
                >
                  {isSaved ? <BookmarkCheck className="h-4 w-4 text-yellow-600" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </div>

              {/* Description */}
              {descriptionLoaded ? (
                <p className="text-sm sm:text-xs text-muted-foreground line-clamp-2 animate-fade-in animation-delay-200">
                  {fact.description}
                </p>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              )}

              {/* Stats */}
              {metadataLoaded && (
                <div className="flex items-center justify-between animate-fade-in animation-delay-300">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="h-3 w-3" />
                      <span className="text-xs font-medium">{fact.vote_count_up}</span>
                    </div>
                    {fact.status === 'verified' && (
                      <Badge variant="ios" size="sm">Verified</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={cn("overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group w-full max-w-sm mx-auto", className)} onClick={handleQuickView}>
      <CardContent className="p-0">
        {/* Image */}
        {(fact.image_url || (fact.media_urls && fact.media_urls.length > 0)) && (
          <div className="relative h-48 overflow-hidden">
            {!imageLoaded ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                <img 
                  src={fact.image_url || fact.media_urls?.[0]} 
                  alt={fact.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 animate-fade-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                
                {/* Quick Actions */}
                <div className="absolute top-3 right-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSaveToggle} 
                    className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40"
                    disabled={isSaving}
                  >
                    {isSaved ? <BookmarkCheck className="h-4 w-4 text-yellow-400" /> : <Bookmark className="h-4 w-4 text-white" />}
                  </Button>
                </div>

                {/* Category Badge */}
                {metadataLoaded && (
                  <div className="absolute bottom-3 left-3 animate-fade-in animation-delay-100">
                    <Badge variant="glass" className="flex items-center gap-1.5">
                      <span className="text-sm">{fact.categories?.icon}</span>
                      <span className="capitalize text-xs">{categoryName}</span>
                    </Badge>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-3 space-y-2.5">
          {/* Title */}
          {titleLoaded ? (
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors animate-fade-in">
              {fact.title}
            </h3>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          )}

          {/* Location */}
          {metadataLoaded ? (
            <div className="flex items-center justify-between gap-2 animate-fade-in animation-delay-100">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{fact.location_name}</span>
              </div>
              {fact.latitude && fact.longitude && (
                <LocationNavigationButton 
                  latitude={fact.latitude} 
                  longitude={fact.longitude} 
                  locationName={fact.location_name}
                  variant="icon"
                  factId={fact.id}
                  className="h-8 w-8"
                />
              )}
            </div>
          ) : (
            <Skeleton className="h-4 w-2/3" />
          )}

          {/* Description */}
          {descriptionLoaded ? (
            <p className="text-sm text-muted-foreground line-clamp-3 animate-fade-in animation-delay-200">
              {fact.description}
            </p>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          )}

          {/* Stats */}
          {metadataLoaded && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50 animate-fade-in animation-delay-300">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-green-600">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">{fact.vote_count_up}</span>
                </div>
                {voteScore > 0 && (
                  <Badge variant="chip" size="sm">+{voteScore}</Badge>
                )}
              </div>
              
              {fact.profiles && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    <AvatarImage src={fact.profiles.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {fact.profiles.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
