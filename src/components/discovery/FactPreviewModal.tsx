
import React from 'react';
import { X, MapPin, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, ExternalLink, Share } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/ios-card';
import { useDiscoveryStore } from '@/stores/discoveryStore';

export const FactPreviewModal: React.FC = () => {
  const { 
    selectedFact, 
    isModalOpen, 
    savedFacts,
    setModalOpen, 
    toggleSavedFact 
  } = useDiscoveryStore();

  if (!selectedFact) return null;

  const isSaved = savedFacts.includes(selectedFact.id);
  const voteScore = selectedFact.vote_count_up - selectedFact.vote_count_down;
  
  const categoryName = selectedFact.categories?.category_translations?.find(
    t => t.language_code === 'en'
  )?.name || selectedFact.categories?.name || 'Unknown';

  const handleSaveToggle = () => {
    toggleSavedFact(selectedFact.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedFact.title,
          text: selectedFact.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  variant="glass" 
                  className="flex items-center gap-1"
                  style={{ borderColor: selectedFact.categories?.color }}
                >
                  <span style={{ color: selectedFact.categories?.color }}>
                    {selectedFact.categories?.icon}
                  </span>
                  <span className="capitalize">{categoryName}</span>
                </Badge>
                
                {selectedFact.status === 'verified' && (
                  <Badge variant="ios" size="sm">
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToggle}
                  className="h-8 w-8 p-0"
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 w-8 p-0"
                >
                  <Share className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Media */}
            {selectedFact.media_urls && selectedFact.media_urls.length > 0 && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={selectedFact.media_urls[0]}
                  alt={selectedFact.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Title & Location */}
              <div className="space-y-3">
                <h1 className="text-2xl font-bold">{selectedFact.title}</h1>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedFact.location_name}</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground">{selectedFact.description}</p>
              </div>

              {/* Stats */}
              <Card variant="glass">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-semibold">{selectedFact.vote_count_up}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Upvotes</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                        <ThumbsDown className="h-4 w-4" />
                        <span className="font-semibold">{selectedFact.vote_count_down}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Downvotes</p>
                    </div>
                    
                    <div>
                      <div className="mb-1">
                        <span className={`font-semibold ${voteScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {voteScore >= 0 ? '+' : ''}{voteScore}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Author & Meta */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-3">
                  {selectedFact.profiles && (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedFact.profiles.avatar_url || ''} />
                        <AvatarFallback>
                          {selectedFact.profiles.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{selectedFact.profiles.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(selectedFact.created_at)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Full
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
