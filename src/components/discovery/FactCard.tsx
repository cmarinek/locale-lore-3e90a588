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
export const FactCard: React.FC<FactCardProps> = ({
  fact,
  className,
  viewMode = 'grid'
}) => {
  const {
    savedFacts,
    toggleSavedFact,
    setSelectedFact,
    setModalOpen,
    syncSelectedFact
  } = useDiscoveryStore();
  const isSaved = savedFacts.includes(fact.id);
  const isHighlighted = syncSelectedFact === fact.id;
  const voteScore = fact.vote_count_up - fact.vote_count_down;
  const categoryName = fact.categories?.category_translations?.find(t => t.language_code === 'en')?.name || fact.categories?.slug || 'Unknown';
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
    return <Card variant="elevated" className={cn("overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group", "w-full max-w-none",
    // Ensure full width responsiveness
    isHighlighted && "ring-2 ring-primary shadow-lg shadow-primary/20 bg-primary/5 dark:bg-primary/10", className)} onClick={handleQuickView}>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-2 sm:p-3 py-0 px-0">
            {/* Media Preview - Show if image_url or media_urls exists */}
            {(fact.image_url || (fact.media_urls && fact.media_urls.length > 0)) && <div className="relative w-full sm:w-24 md:w-32 h-32 sm:h-16 md:h-20 shrink-0 overflow-hidden rounded-lg">
                <img src={fact.image_url || fact.media_urls?.[0]} alt={fact.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={e => {
              e.currentTarget.style.display = 'none';
            }} />
                {/* Mobile overlay for category */}
                <div className="absolute bottom-2 left-2 sm:hidden">
                  <Badge variant="glass" className="flex items-center gap-1 text-xs" style={{
                borderColor: fact.categories?.color
              }}>
                    <span style={{
                  color: fact.categories?.color
                }}>
                      {fact.categories?.icon}
                    </span>
                    <span className="capitalize">{categoryName}</span>
                  </Badge>
                </div>
              </div>}

            {/* Content */}
            <div className="flex-1 space-y-3 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base sm:text-sm line-clamp-4 group-hover:text-primary transition-colors leading-tight lg:text-sm flex-1">
                      {fact.title}
                    </h3>
                    {/* Category Badge - Top Right */}
                    <Badge variant="secondary" className="text-xs shrink-0">
                      <span className="sm:hidden">{fact.categories?.icon}</span>
                      <span>{categoryName}</span>
                    </Badge>
                  </div>
                  
                  {/* Location Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate font-medium text-xs">{fact.location_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground/70 font-mono hidden sm:block">
                        {Number(fact.latitude).toFixed(4)}, {Number(fact.longitude).toFixed(4)}
                      </div>
                    </div>
                    
                    {/* Navigation Button */}
                    {fact.latitude && fact.longitude && <div className="shrink-0 self-start sm:self-center">
                        <LocationNavigationButton latitude={fact.latitude} longitude={fact.longitude} locationName={fact.location_name} variant="icon" factId={fact.id} className="h-8 w-8 sm:h-7 sm:w-7" />
                      </div>}
                  </div>
                </div>
                
                {/* Save Button */}
                <Button variant="ghost" size="sm" onClick={handleSaveToggle} className="h-8 w-8 p-0 shrink-0 self-start">
                  {isSaved ? <BookmarkCheck className="h-4 w-4 text-yellow-600" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-xs text-muted-foreground line-clamp-4 leading-relaxed lg:text-xs">
                {fact.description}
              </p>

              {/* Stats & Meta - Responsive Layout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pt-1">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

                  {/* Votes */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="h-3 w-3" />
                      <span className="text-xs font-medium">{fact.vote_count_up}</span>
                    </div>
                    {fact.vote_count_down > 0 && <div className="flex items-center gap-1 text-red-600">
                        <ThumbsDown className="h-3 w-3" />
                        <span className="text-xs font-medium">{fact.vote_count_down}</span>
                      </div>}
                  </div>

                  {/* Verified Badge */}
                  {fact.status === 'verified' && <Badge variant="ios" size="sm" className="hidden sm:inline-flex">
                      Verified
                    </Badge>}
                </div>

                {/* Author & Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {fact.profiles && <>
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={fact.profiles.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {fact.profiles.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-20 sm:max-w-none">{fact.profiles.username}</span>
                      <span className="hidden sm:inline">•</span>
                    </>}
                  <span className="hidden sm:inline">{formatDate(fact.created_at)}</span>
                  
                  {/* Mobile: Show verified status here */}
                  {fact.status === 'verified' && <Badge variant="ios" size="sm" className="sm:hidden">
                      ✓
                    </Badge>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card variant="elevated" className={cn("overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group", "w-full max-w-sm mx-auto",
  // Responsive max width with auto centering
  isHighlighted && "ring-2 ring-primary shadow-lg shadow-primary/20 bg-primary/5 dark:bg-primary/10 scale-[1.02]", className)} onClick={handleQuickView}>
      <CardContent className="p-0">
        {/* Media Preview - Show if image_url or media_urls exists */}
        {(fact.image_url || (fact.media_urls && fact.media_urls.length > 0)) && <div className="relative h-44 sm:h-48 md:h-52 overflow-hidden">
            <img src={fact.image_url || fact.media_urls?.[0]} alt={fact.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={e => {
          e.currentTarget.style.display = 'none';
        }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
            
            {/* Quick Actions Overlay */}
            <div className="absolute top-3 right-3 flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSaveToggle} className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-200">
                {isSaved ? <BookmarkCheck className="h-4 w-4 text-yellow-400" /> : <Bookmark className="h-4 w-4 text-white" />}
              </Button>
            </div>

            {/* Category Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="glass" className="flex items-center gap-1.5 px-2 py-1" style={{
            borderColor: fact.categories?.color
          }}>
                <span style={{
              color: fact.categories?.color
            }} className="text-sm">
                  {fact.categories?.icon}
                </span>
                <span className="capitalize text-xs font-medium text-white">
                  {categoryName}
                </span>
              </Badge>
            </div>

            {/* Verified Badge - Top Left */}
            {fact.status === 'verified' && <div className="absolute top-3 left-3">
                <Badge variant="ios" size="sm" className="bg-green-500/90 text-white border-0">
                  <span className="text-xs">✓ Verified</span>
                </Badge>
              </div>}
          </div>}

        {/* Content */}
        <div className="p-3 space-y-2.5">
          {/* Save Button - Show when no image */}
          {(!fact.image_url && (!fact.media_urls || fact.media_urls.length === 0)) && <div className="flex justify-end mb-2">
              <Button variant="ghost" size="sm" onClick={handleSaveToggle} className="h-8 w-8 p-0">
                {isSaved ? <BookmarkCheck className="h-4 w-4 text-yellow-600" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            </div>}
          {/* Header */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {fact.title}
            </h3>
            
            {/* Location Section */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="truncate font-medium">{fact.location_name}</span>
                </div>
                <div className="text-xs text-muted-foreground/70 font-mono pl-5">
                  {Number(fact.latitude).toFixed(3)}, {Number(fact.longitude).toFixed(3)}
                </div>
              </div>
              
              {/* Navigation Button */}
              {fact.latitude && fact.longitude && <div className="shrink-0">
                  <LocationNavigationButton latitude={fact.latitude} longitude={fact.longitude} locationName={fact.location_name} variant="icon" factId={fact.id} className="h-8 w-8" />
                </div>}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {fact.description}
          </p>

          {/* Stats & Engagement */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              {/* Vote Score */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-green-600">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">{fact.vote_count_up}</span>
                </div>
                {fact.vote_count_down > 0 && <div className="flex items-center gap-1 text-red-600">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{fact.vote_count_down}</span>
                  </div>}
              </div>

              {/* Credibility Score */}
              {voteScore > 0 && <Badge variant="chip" size="sm" className="bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300">
                  +{voteScore}
                </Badge>}
            </div>

            {/* Author Info */}
            {fact.profiles && <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-2 ring-background">
                  <AvatarImage src={fact.profiles.avatar_url || ''} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {fact.profiles.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground font-medium truncate max-w-20">
                  {fact.profiles.username}
                </span>
              </div>}
          </div>

          {/* Footer with Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>{formatDate(fact.created_at)}</span>
            
            {/* Quick View Hint */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-primary font-medium">
              Tap to view
            </span>
          </div>
        </div>
      </CardContent>
    </Card>;
};