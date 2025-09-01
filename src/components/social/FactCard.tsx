import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  ThumbsUp,
  Laugh,
  Frown,
  Angry,
  Zap,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Fact {
  id: string;
  title: string;
  description: string;
  location_name: string;
  created_at: string;
  media_urls?: string[];
  author_id: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
  vote_count_up: number;
  vote_count_down: number;
  category_id: string;
}

interface FactCardProps {
  fact: Fact;
  onFactClick?: (fact: Fact) => void;
  showFullContent?: boolean;
}

const reactionTypes = [
  { type: 'love', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50 hover:bg-red-100' },
  { type: 'laugh', icon: Laugh, color: 'text-yellow-500', bgColor: 'bg-yellow-50 hover:bg-yellow-100' },
  { type: 'wow', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  { type: 'sad', icon: Frown, color: 'text-gray-500', bgColor: 'bg-gray-50 hover:bg-gray-100' },
  { type: 'angry', icon: Angry, color: 'text-orange-500', bgColor: 'bg-orange-50 hover:bg-orange-100' },
];

export const FactCard: React.FC<FactCardProps> = ({ 
  fact, 
  onFactClick, 
  showFullContent = false 
}) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(fact.vote_count_up);
  const [showReactions, setShowReactions] = useState(false);

  const handleVote = async (isUpvote: boolean) => {
    if (!user) {
      toast({ title: "Please sign in to vote", variant: "destructive" });
      return;
    }

    try {
      if (userVote === isUpvote) {
        // Remove vote
        await supabase.from('votes').delete().eq('fact_id', fact.id).eq('user_id', user.id);
        setUserVote(null);
        setLocalVoteCount(prev => isUpvote ? prev - 1 : prev);
      } else {
        // Add or update vote
        await supabase.from('votes').upsert({
          fact_id: fact.id,
          user_id: user.id,
          is_upvote: isUpvote
        });
        
        const prevVote = userVote;
        setUserVote(isUpvote);
        
        if (isUpvote) {
          setLocalVoteCount(prev => prevVote === false ? prev + 2 : prev + 1);
        } else {
          setLocalVoteCount(prev => prevVote === true ? prev - 1 : prev);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({ title: "Failed to vote", variant: "destructive" });
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast({ title: "Please sign in to react", variant: "destructive" });
      return;
    }

    try {
      await supabase.from('fact_reactions').upsert({
        fact_id: fact.id,
        user_id: user.id,
        reaction_type: reactionType
      });
      
      toast({ title: "Reaction added!" });
      setShowReactions(false);
    } catch (error) {
      console.error('Error reacting:', error);
      toast({ title: "Failed to react", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Please sign in to save", variant: "destructive" });
      return;
    }

    try {
      if (saved) {
        await supabase.from('saved_facts').delete().eq('fact_id', fact.id).eq('user_id', user.id);
        setSaved(false);
        toast({ title: "Removed from saved" });
      } else {
        await supabase.from('saved_facts').insert({
          fact_id: fact.id,
          user_id: user.id
        });
        setSaved(true);
        toast({ title: "Saved to your collection!" });
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fact.title,
          text: fact.description,
          url: `${window.location.origin}/fact/${fact.id}`
        });
        
        // Track share
        if (user) {
          await supabase.from('fact_shares').insert({
            fact_id: fact.id,
            user_id: user.id,
            platform: 'native'
          });
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/fact/${fact.id}`);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const truncatedDescription = showFullContent 
    ? fact.description 
    : fact.description.length > 150 
      ? fact.description.slice(0, 150) + '...' 
      : fact.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        {/* Author Header */}
        <div className="p-4 pb-0">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={fact.profiles?.avatar_url} />
              <AvatarFallback>
                {fact.profiles?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold text-sm">{fact.profiles?.username || 'Anonymous'}</div>
              <div className="flex items-center text-xs text-muted-foreground space-x-2">
                <MapPin className="h-3 w-3" />
                <span>{fact.location_name}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(fact.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="text-muted-foreground hover:text-foreground"
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="p-4 cursor-pointer" 
          onClick={() => onFactClick?.(fact)}
        >
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{fact.title}</h3>
          <p className="text-muted-foreground mb-3 line-clamp-3">{truncatedDescription}</p>
          
          {/* Media Preview */}
          {fact.media_urls && fact.media_urls.length > 0 && (
            <div className="relative rounded-lg overflow-hidden mb-3">
              <img 
                src={fact.media_urls[0]} 
                alt={fact.title}
                className="w-full h-48 object-cover"
              />
              {fact.media_urls.length > 1 && (
                <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                  +{fact.media_urls.length - 1}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(true);
                }}
                className={`transition-colors ${userVote === true ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{localVoteCount}</span>
              </Button>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReactions(!showReactions);
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  <span>React</span>
                </Button>
                
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-full left-0 mb-2 bg-background border rounded-lg shadow-lg p-2 flex space-x-1 z-10"
                  >
                    {reactionTypes.map(({ type, icon: Icon, color, bgColor }) => (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(type);
                        }}
                        className={`${bgColor} hover:scale-110 transition-transform`}
                      >
                        <Icon className={`h-4 w-4 ${color}`} />
                      </Button>
                    ))}
                  </motion.div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFactClick?.(fact);
                }}
                className="text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>Comment</span>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="text-muted-foreground hover:text-primary"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};