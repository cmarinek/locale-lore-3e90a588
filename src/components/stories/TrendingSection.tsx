
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Story } from '@/types/stories';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  MapPin, 
  Heart, 
  MessageCircle,
  Hash,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TrendingSectionProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  stories,
  onStoryClick
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: '🔥' },
    { id: 'locations', name: 'Places', icon: '📍' },
    { id: 'discoveries', name: 'Facts', icon: '💡' },
    { id: 'moments', name: 'Moments', icon: '✨' }
  ];

  const trendingStories = stories.filter(story => story.is_trending);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold">Trending Now</h2>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Trending grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingStories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 group overflow-hidden"
              onClick={() => onStoryClick(story)}
            >
              <div className="relative aspect-[9/16] sm:aspect-video">
                {/* Media preview */}
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{ 
                    backgroundImage: `url(${story.media_urls[0]})` 
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Trending badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  🔥 #{index + 1}
                </div>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={story.author?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {story.author?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      @{story.author?.username}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold mb-1 line-clamp-1">
                    {story.title}
                  </h3>

                  {/* Location */}
                  {story.location_name && (
                    <div className="flex items-center gap-1 mb-2 text-xs opacity-80">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{story.location_name}</span>
                    </div>
                  )}

                  {/* Hashtags */}
                  {story.hashtags.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {story.hashtags.slice(0, 2).map((tag) => (
                        <span 
                          key={tag}
                          className="text-xs bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {story.hashtags.length > 2 && (
                        <span className="text-xs opacity-70">
                          +{story.hashtags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{story.like_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{story.comment_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor(Math.random() * 12 + 1)}h left</span>
                    </div>
                  </div>
                </div>

                {/* Media type indicator */}
                <div className="absolute top-2 left-2">
                  {story.media_type === 'video' && (
                    <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                      VIDEO
                    </Badge>
                  )}
                  {story.media_type === 'carousel' && (
                    <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                      {story.media_urls.length} PHOTOS
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {trendingStories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No trending stories right now</p>
          <p className="text-sm">Be the first to create something amazing!</p>
        </div>
      )}
    </div>
  );
};
