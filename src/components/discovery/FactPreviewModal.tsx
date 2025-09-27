
import React from 'react';
import { X, MapPin, ThumbsUp, ThumbsDown, Share2, Bookmark, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LocationNavigationButton } from '@/components/ui/LocationNavigationButton';
import { DiscussionThread } from '@/components/verification/DiscussionThread';
import { SocialSharing } from '@/components/social/SocialSharing';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useUserStore } from '@/stores/userStore';
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
  const { toggleSavedFact, savedFacts } = useUserStore();

  if (!fact) return null;

  const isSaved = savedFacts.includes(fact.id);
  const categoryName = fact.categories?.category_translations?.find(
    t => t.language_code === 'en'
  )?.name || fact.categories?.slug || 'Unknown';

  const handleSave = () => {
    toggleSavedFact(fact.id);
  };

  const shareContent = {
    title: fact.title,
    description: fact.description,
    url: `${window.location.origin}/fact/${fact.id}`,
    image: fact.media_urls?.[0]
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
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{fact.location_name}</span>
                </div>
                {fact.latitude && fact.longitude && (
                  <div className="text-xs text-muted-foreground/70 font-mono">
                    {fact.latitude.toFixed(4)}, {fact.longitude.toFixed(4)}
                  </div>
                )}
              </div>
              {fact.latitude && fact.longitude && (
                <div className="shrink-0 ml-3">
                  <LocationNavigationButton
                    latitude={fact.latitude}
                    longitude={fact.longitude}
                    locationName={fact.location_name}
                    variant="icon"
                  />
                </div>
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
              <SocialSharing
                content={shareContent}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                }
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">Discussion</h3>
            </div>
            <DiscussionThread factId={fact.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
