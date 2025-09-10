
import React from 'react';
import { X, MapPin, ThumbsUp, ThumbsDown, Share2, Bookmark } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LocationNavigationButton } from '@/components/ui/LocationNavigationButton';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { EnhancedFact } from '@/types/fact';

interface FactPreviewModalProps {
  fact: EnhancedFact | null;
  open: boolean;
  onClose: () => void;
}

export const FactPreviewModal: React.FC<FactPreviewModalProps> = ({
  fact,
  open,
  onClose
}) => {
  const { toggleSavedFact, savedFacts } = useDiscoveryStore();

  if (!fact) return null;

  const isSaved = savedFacts.includes(fact.id);
  const categoryName = fact.categories?.category_translations?.find(
    t => t.language_code === 'en'
  )?.name || fact.categories?.slug || 'Unknown';

  const handleSave = () => {
    toggleSavedFact(fact.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fact.title,
          text: fact.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Fact Details</DialogTitle>
        </DialogHeader>

        {/* Media */}
        {fact.media_urls && fact.media_urls.length > 0 && (
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={fact.media_urls[0]}
              alt={fact.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold leading-tight">{fact.title}</h2>
              <div className="flex items-center gap-2">
                <Badge variant={fact.status === 'verified' ? 'default' : 'secondary'}>
                  {fact.status}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <span style={{ color: fact.categories?.color }}>
                    {fact.categories?.icon}
                  </span>
                  {categoryName}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{fact.location_name}</span>
                {fact.latitude && fact.longitude && (
                  <span className="text-xs ml-2">
                    ({fact.latitude.toFixed(4)}, {fact.longitude.toFixed(4)})
                  </span>
                )}
              </div>
              {fact.latitude && fact.longitude && (
                <LocationNavigationButton
                  latitude={fact.latitude}
                  longitude={fact.longitude}
                  locationName={fact.location_name}
                  variant="button"
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {fact.description}
          </p>

          {/* Author */}
          {fact.profiles && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={fact.profiles.avatar_url} />
                <AvatarFallback>
                  {fact.profiles.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{fact.profiles.username}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(fact.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {fact.vote_count_up}
                </Button>
                <Button variant="ghost" size="sm">
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {fact.vote_count_down}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={isSaved ? 'text-yellow-600' : ''}
              >
                <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
