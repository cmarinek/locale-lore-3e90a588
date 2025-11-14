import React, { useState, useRef, useEffect } from 'react';
import { Story } from '@/types/stories';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MapPin, 
  MoreHorizontal,
  Play,
  Pause,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useStories } from '@/hooks/useStories';

interface StoryCardProps {
  story: Story;
  isActive: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isActive,
  onNext,
  onPrevious
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const lastTapTimeRef = useRef<number>(0);
  const { likeStory, unlikeStory, checkIfLiked, trackView, shareStory, addComment, fetchComments } = useStories();

  useEffect(() => {
    if (story.media_type === 'video' && videoRef.current) {
      if (isActive && isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isPlaying]);

  // Check if story is liked and track view when it becomes active
  useEffect(() => {
    if (isActive) {
      checkIfLiked(story.id).then(setIsLiked);
      trackView(story.id);
    }
  }, [isActive, story.id, checkIfLiked, trackView]);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    const fetchedComments = await fetchComments(story.id);
    setComments(fetchedComments);
  };

  const handleLike = async () => {
    // Optimistic UI update - update immediately for instant feedback
    const previousLiked = isLiked;
    const previousCount = story.like_count || 0;

    setIsLiked(!isLiked);

    // Trigger haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    try {
      if (previousLiked) {
        await unlikeStory(story.id);
      } else {
        await likeStory(story.id);
      }
    } catch (error) {
      // Revert optimistic update on failure
      setIsLiked(previousLiked);
      console.error('Failed to toggle like:', error);
      // TODO: Show toast notification
    }
  };

  const handleShare = () => {
    shareStory(story);
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(story.id, newComment);
    setNewComment('');
    loadComments();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextMedia = () => {
    if (story.media_type === 'carousel' && story.media_urls.length > 1) {
      setCurrentMediaIndex((prev) => 
        prev < story.media_urls.length - 1 ? prev + 1 : 0
      );
    }
  };

  const previousMedia = () => {
    if (story.media_type === 'carousel' && story.media_urls.length > 1) {
      setCurrentMediaIndex((prev) =>
        prev > 0 ? prev - 1 : story.media_urls.length - 1
      );
    }
  };

  // Double-tap to like (TikTok/Instagram pattern)
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const currentTime = Date.now();
    const tapGap = currentTime - lastTapTimeRef.current;

    if (tapGap < 300 && tapGap > 0) {
      // It's a double tap!
      if (!isLiked) {
        handleLike();
      }

      // Show heart animation
      setShowDoubleTapHeart(true);
      setTimeout(() => setShowDoubleTapHeart(false), 1000);
    }

    lastTapTimeRef.current = currentTime;
  };

  const renderMedia = () => {
    const mediaUrl = story.media_urls[currentMediaIndex] || story.media_urls[0];

    if (story.media_type === 'video') {
      return (
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            src={mediaUrl}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            onClick={togglePlayPause}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                className="bg-black/50 rounded-full p-4"
                onClick={togglePlayPause}
              >
                <Play className="w-8 h-8 text-white" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        className="relative h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${mediaUrl})` }}
        onClick={story.media_type === 'carousel' ? nextMedia : undefined}
      >
        {story.media_type === 'carousel' && story.media_urls.length > 1 && (
          <>
            {/* Carousel indicators */}
            <div className="absolute top-4 left-4 right-4 flex gap-1">
              {story.media_urls.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full ${
                    index === currentMediaIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            
            {/* Navigation areas */}
            <div className="absolute left-0 top-0 w-1/3 h-full" onClick={previousMedia} />
            <div className="absolute right-0 top-0 w-1/3 h-full" onClick={nextMedia} />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative h-full w-full bg-black">
      <div onClick={handleDoubleTap} onTouchEnd={handleDoubleTap}>
        {renderMedia()}
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Double-tap heart animation */}
      <AnimatePresence>
        {showDoubleTapHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <Heart className="w-32 h-32 fill-red-500 text-red-500 drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* User info */}
      <div className="absolute top-4 left-4 flex items-center gap-3 z-30">
        <Avatar className="w-10 h-10 border-2 border-white">
          <AvatarImage src={story.author?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {story.author?.username?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="text-white">
          <p className="font-semibold text-sm">@{story.author?.username}</p>
          <p className="text-xs opacity-80">
            {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Actions sidebar */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 text-white hover:bg-white/10"
          onClick={handleLike}
          aria-label={isLiked ? "Unlike this story" : "Like this story"}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="text-xs" aria-hidden="true">{story.like_count}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 text-white hover:bg-white/10"
          onClick={handleComment}
          aria-label={`View and add comments. ${story.comment_count} comments`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs" aria-hidden="true">{story.comment_count}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 text-white hover:bg-white/10"
          onClick={handleShare}
          aria-label="Share this story"
        >
          <Share className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          aria-label="More options"
        >
          <MoreHorizontal className="w-6 h-6" />
        </Button>
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-4 left-4 right-20 z-30">
        <div className="text-white">
          <h3 className="font-semibold mb-2">{story.title}</h3>
          <p className="text-sm mb-3 line-clamp-3">{story.content}</p>
          
          {/* Location */}
          {story.location_name && (
            <div className="flex items-center gap-1 mb-2 text-sm opacity-80">
              <MapPin className="w-4 h-4" />
              <span>{story.location_name}</span>
            </div>
          )}

          {/* Hashtags */}
          {story.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {story.hashtags.map((tag, index) => (
                <span 
                  key={index} 
                  className="text-sm text-blue-300 hover:text-blue-200 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trending badge */}
      {story.is_trending && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-30">
          🔥 Trending
        </div>
      )}

      {/* Comments Panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-sm z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">Comments</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(false)}
                className="text-white hover:bg-white/10"
                aria-label="Close comments"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Comments list */}
            <ScrollArea className="flex-1 p-4">
              {comments.length === 0 ? (
                <p className="text-white/50 text-center py-8">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {comment.profiles?.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">@{comment.profiles?.username}</p>
                        <p className="text-white/80 text-sm mt-1">{comment.content}</p>
                        <p className="text-white/50 text-xs mt-1">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Comment input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  aria-label="Comment text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-primary hover:bg-primary/90"
                  aria-label="Send comment"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
