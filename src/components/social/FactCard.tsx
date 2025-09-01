
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TipSystem } from '@/components/contributor/TipSystem';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  ThumbsUp, 
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Eye,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface FactCardProps {
  fact: {
    id: string;
    title: string;
    description: string;
    location_name: string;
    author_id: string;
    vote_count_up: number;
    vote_count_down: number;
    created_at: string;
    media_urls?: string[];
    profiles?: {
      username: string;
      avatar_url?: string;
    };
    categories?: {
      slug: string;
      category_translations?: Array<{
        name: string;
      }>;
    };
  };
  showAuthor?: boolean;
  compact?: boolean;
}

export const FactCard: React.FC<FactCardProps> = ({ 
  fact, 
  showAuthor = true, 
  compact = false 
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      setUserVote(null);
    } else {
      setUserVote(voteType);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    const shareData = {
      title: fact.title,
      text: fact.description,
      url: `${window.location.origin}/fact/${fact.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  if (compact) {
    return (
      <motion.div whileHover={{ y: -2 }}>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              {fact.media_urls && fact.media_urls.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={fact.media_urls[0]}
                    alt={fact.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h3 className="font-semibold line-clamp-2 mb-1">{fact.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {fact.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{fact.location_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{fact.vote_count_up}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>1.2k</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {fact.media_urls && fact.media_urls.length > 0 && (
          <div className="aspect-video overflow-hidden">
            <img
              src={fact.media_urls[0]}
              alt={fact.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader className="pb-3">
          {showAuthor && fact.profiles && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={fact.profiles.avatar_url} />
                  <AvatarFallback>
                    {fact.profiles.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{fact.profiles.username}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(fact.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <TipSystem
                discoveryId={fact.id}
                recipientId={fact.author_id}
                recipientName={fact.profiles.username}
                recipientAvatar={fact.profiles.avatar_url}
              />
            </div>
          )}

          <div className="space-y-2">
            <CardTitle className="text-lg leading-tight">{fact.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-3">
              {fact.description}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{fact.location_name}</span>
            </div>
            
            {fact.categories?.category_translations?.[0] && (
              <Badge variant="secondary" className="text-xs">
                {fact.categories.category_translations[0].name}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {/* Voting */}
            <div className="flex items-center gap-1">
              <Button
                variant={userVote === 'up' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleVote('up')}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {fact.vote_count_up + (userVote === 'up' ? 1 : 0)}
              </Button>
              <Button
                variant={userVote === 'down' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleVote('down')}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                {fact.vote_count_down + (userVote === 'down' ? 1 : 0)}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                Reply
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBookmark}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
