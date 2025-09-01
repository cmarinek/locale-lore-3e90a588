import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeActivityFeed, formatActivityMessage, getActivityIcon } from '@/hooks/useRealtimeActivityFeed';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RealtimeActivityFeedProps {
  className?: string;
  maxHeight?: string;
  showRefresh?: boolean;
}

export const RealtimeActivityFeed: React.FC<RealtimeActivityFeedProps> = ({
  className = "",
  maxHeight = "400px",
  showRefresh = true
}) => {
  const { activities, isLoading, loadMore, hasMore, refresh } = useRealtimeActivityFeed();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  // Auto-scroll to show new activities
  useEffect(() => {
    if (scrollRef.current && activities.length > 0) {
      const shouldAutoScroll = scrollRef.current.scrollTop < 100;
      if (shouldAutoScroll) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activities]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Load more when near bottom
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
      loadMore();
    }
  };

  if (isLoading && activities.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading activity feed...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Live Activity</h3>
        <div className="flex items-center gap-2">
          <Badge 
            variant={autoRefresh ? "default" : "secondary"}
            className="text-xs cursor-pointer"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Live' : 'Paused'}
          </Badge>
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        <div className="p-2 space-y-2">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="text-lg">{getActivityIcon(activity.activity_type)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={activity.profiles?.avatar_url} />
                      <AvatarFallback className="text-[10px]">
                        {activity.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-xs text-foreground leading-relaxed">
                    {formatActivityMessage(activity)}
                  </p>

                  {activity.facts?.location_name && (
                    <Badge variant="outline" className="text-[10px] mt-1">
                      📍 {activity.facts.location_name}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load more indicator */}
          {hasMore && (
            <div className="text-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                disabled={isLoading}
                className="text-xs"
              >
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <ChevronDown className="w-3 h-3 mr-1" />
                )}
                {isLoading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}

          {activities.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
              <p className="text-xs">Follow users and locations to see updates here</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};