
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story } from '@/types/stories';
import { StoryCard } from './StoryCard';
import { useGestures } from '@/hooks/useGestures';
import { GestureHandler } from '@/components/ui/gesture-handler';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface VerticalFeedProps {
  stories: Story[];
  onLoadMore: () => void;
  onRefresh: () => Promise<void>;
  loading?: boolean;
}

export const VerticalFeed: React.FC<VerticalFeedProps> = ({
  stories,
  onLoadMore,
  onRefresh,
  loading = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSwipeUp = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (currentIndex >= stories.length - 3) {
        onLoadMore();
      }
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
    setCurrentIndex(0);
  };

  const currentStory = stories[currentIndex];

  if (!currentStory && loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading stories...</p>
        </div>
      </div>
    );
  }

  if (!currentStory && !loading) {
    return null; // Will be handled by parent component's empty state
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen bg-black overflow-hidden relative"
    >
      <GestureHandler
        onSwipeUp={handleSwipeUp}
        onSwipeDown={handleSwipeDown}
        onPullToRefresh={handlePullToRefresh}
        className="h-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory.id}
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="h-full"
          >
            <StoryCard 
              story={currentStory}
              isActive={true}
              onNext={handleSwipeUp}
              onPrevious={handleSwipeDown}
            />
          </motion.div>
        </AnimatePresence>

        {/* Pull to refresh indicator */}
        {refreshing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-black/50 rounded-full p-2">
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
        )}

        {/* Story indicators */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
          {stories.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((story, index) => {
            const actualIndex = Math.max(0, currentIndex - 2) + index;
            return (
              <div
                key={story.id}
                className={`w-1 h-8 rounded-full transition-all duration-300 ${
                  actualIndex === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
              />
            );
          })}
        </div>

        {/* Navigation hints */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/70 text-sm text-center z-40">
          <p>Swipe up for next • Swipe down for previous</p>
        </div>
      </GestureHandler>
    </div>
  );
};
