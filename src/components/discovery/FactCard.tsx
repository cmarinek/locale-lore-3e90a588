
import React from 'react';
import { MapPin, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, Eye, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LocationNavigationButton } from '@/components/ui/LocationNavigationButton';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { EnhancedFact } from '@/types/fact';
import { cn } from '@/lib/utils';

interface FactCardProps {
  fact: EnhancedFact;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const FactCard: React.FC<FactCardProps> = ({ fact, className, viewMode = 'grid' }) => {
  const { 
    savedFacts, 
    toggleSavedFact, 
    setSelectedFact, 
    setModalOpen,
    highlightedFactId
  } = useDiscoveryStore();

  const isSaved = savedFacts.includes(fact.id);
  const voteScore = fact.vote_count_up - fact.vote_count_down;
  const isHighlighted = highlightedFactId === fact.id;
  
  const categoryName = fact.categories?.category_translations?.find(
    t => t.language_code === 'en'
  )?.name || fact.categories?.slug || 'Unknown';

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavedFact(fact.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFact(fact);
    setModalOpen(true);
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
      <Card 
        variant="elevated" 
        className={cn(
          "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group",
          isHighlighted && "ring-2 ring-primary bg-primary/5 shadow-xl",
          className
        )}
        onClick={handleQuickView}
      >
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Media Preview - Compact */}
            {fact.media_urls && fact.media_urls.length > 0 && (
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={fact.media_urls[0]}
                  alt={fact.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                    {fact.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{fact.location_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground/70 font-mono">
                        {Number(fact.latitude).toFixed(4)}, {Number(fact.longitude).toFixed(4)}
                      </div>
                    </div>
                    {fact.latitude && fact.longitude && (
                      <div className="shrink-0 ml-2">
                  <LocationNavigationButton
                    latitude={fact.latitude}
                    longitude={fact.longitude}
                    locationName={fact.location_name}
                    variant="icon"
                    factId={fact.id}
                  />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToggle}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {fact.description}
              </p>

              {/* Stats & Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Category Badge */}
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {categoryName}
                  </Badge>

                  {/* Votes */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="h-3 w-3" />
                      <span className="text-xs">{fact.vote_count_up}</span>
                    </div>
                    {fact.vote_count_down > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <ThumbsDown className="h-3 w-3" />
                        <span className="text-xs">{fact.vote_count_down}</span>
                      </div>
                    )}
                  </div>

                  {/* Verified Badge */}
                  {fact.status === 'verified' && (
                    <Badge variant="ios" size="sm">
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Author & Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {fact.profiles && (
                    <>
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={fact.profiles.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {fact.profiles.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{fact.profiles.username}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatDate(fact.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      variant="elevated" 
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group",
        isHighlighted && "ring-2 ring-primary bg-primary/5 shadow-xl shadow-primary/30",
        className
      )}
      onClick={handleQuickView}
    >
      <CardContent className="p-0">
        {/* Media Preview */}
        {fact.media_urls && fact.media_urls.length > 0 && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={fact.media_urls[0]}
              alt={fact.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            
            {/* Quick Actions Overlay */}
            <div className="absolute top-3 right-3 flex gap-2">
              {/* Category Badge */}
              <Badge 
                variant="glass" 
                className="flex items-center gap-1 bg-black/20 backdrop-blur-sm text-white border-white/20"
                style={{ borderColor: fact.categories?.color }}
              >
                <span style={{ color: fact.categories?.color }}>
                  {fact.categories?.icon}
                </span>
                <span className="capitalize text-xs">{categoryName}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40"
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Bookmark className="h-4 w-4 text-white" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40"
              >
                <MoreHorizontal className="h-4 w-4 text-white" />
              </Button>
            </div>

          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
              {fact.title}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{fact.location_name}</span>
                </div>
                <div className="text-xs text-muted-foreground/70 font-mono">
                  {Number(fact.latitude).toFixed(4)}, {Number(fact.longitude).toFixed(4)}
                </div>
              </div>
              {fact.latitude && fact.longitude && (
                <div className="shrink-0 ml-2">
                  <LocationNavigationButton
                    latitude={fact.latitude}
                    longitude={fact.longitude}
                    locationName={fact.location_name}
                    variant="icon"
                    factId={fact.id}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {fact.description}
          </p>

          {/* Stats & Author */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              {/* Votes */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-green-600">
                  <ThumbsUp className="h-3 w-3" />
                  <span className="text-xs">{fact.vote_count_up}</span>
                </div>
                {fact.vote_count_down > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <ThumbsDown className="h-3 w-3" />
                    <span className="text-xs">{fact.vote_count_down}</span>
                  </div>
                )}
              </div>

              {/* Credibility Score */}
              {voteScore > 0 && (
                <Badge variant="chip" size="sm" className="bg-green-500/10 text-green-700">
                  +{voteScore}
                </Badge>
              )}

              {/* Verified Badge */}
              {fact.status === 'verified' && (
                <Badge variant="ios" size="sm">
                  Verified
                </Badge>
              )}
            </div>

            {/* Author */}
            {fact.profiles && (
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={fact.profiles.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {fact.profiles.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {fact.profiles.username}
                </span>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground">
            {formatDate(fact.created_at)}
          </div>
        </div>

        {/* Quick View Button */}
        <div className="px-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuickView}
            className="w-full h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Eye className="h-3 w-3 mr-1" />
            Quick View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
