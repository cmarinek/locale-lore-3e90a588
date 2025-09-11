import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRealtime } from './useRealtime';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  metadata: any;
  related_fact_id?: string;
  related_user_id?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
  facts?: {
    title: string;
    location_name: string;
  };
}

interface ActivityFeedReturn {
  activities: ActivityItem[];
  isLoading: boolean;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refresh: () => Promise<void>;
}

export const useRealtimeActivityFeed = (): ActivityFeedReturn => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const realtime = useRealtime({
    enabled: !!user,
    onConnect: () => console.log('📰 Activity feed connected'),
    onDisconnect: () => console.log('📰 Activity feed disconnected'),
  });

  // Load activities from database
  const loadActivities = useCallback(async (reset = false) => {
    if (!user) return;

    try {
      if (reset) {
        setIsLoading(true);
        setPage(0);
      }

      const currentPage = reset ? 0 : page;
      const limit = 20;
      const offset = currentPage * limit;

      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          profiles!activity_feed_user_id_fkey(username, avatar_url),
          facts!activity_feed_related_fact_id_fkey(title, location_name)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const newActivities = (data || []) as unknown as ActivityItem[];
      
      if (reset) {
        setActivities(newActivities);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }

      setHasMore(newActivities.length === limit);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, page]);

  // Handle real-time activity updates
  const handleActivityUpdate = useCallback((payload: any) => {
    const { eventType, new: newActivity } = payload;

    if (eventType === 'INSERT') {
      // Add new activity to the top of the feed
      setActivities(prev => [newActivity, ...prev.slice(0, 99)]); // Keep max 100 items
    }
  }, []);

  // Set up real-time subscription for activity feed
  useEffect(() => {
    if (!user) return;

    loadActivities(true);

    // Subscribe to activity feed updates
    const channel = realtime.subscribe(
      'activity-feed',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_feed'
      },
      handleActivityUpdate
    );

    return () => {
      realtime.unsubscribe('activity-feed');
    };
  }, [user, realtime, loadActivities, handleActivityUpdate]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadActivities(false);
  }, [hasMore, isLoading, loadActivities]);

  const refresh = useCallback(async () => {
    await loadActivities(true);
  }, [loadActivities]);

  return {
    activities,
    isLoading,
    loadMore,
    hasMore,
    refresh
  };
};

// Activity type formatters
export const formatActivityMessage = (activity: ActivityItem): string => {
  const username = activity.profiles?.username || 'Someone';
  
  switch (activity.activity_type) {
    case 'fact_created':
      return `${username} discovered new lore: "${activity.facts?.title}"`;
    case 'fact_voted':
      const voteType = activity.metadata?.is_upvote ? 'verified' : 'disputed';
      return `${username} ${voteType} lore: "${activity.facts?.title}"`;
    case 'comment_created':
      return `${username} commented on lore: "${activity.facts?.title}"`;
    case 'fact_saved':
      return `${username} saved lore: "${activity.facts?.title}"`;
    case 'user_followed':
      return `${username} started following someone`;
    case 'achievement_earned':
      return `${username} earned achievement: "${activity.metadata?.achievement_name}"`;
    case 'challenge_completed':
      return `${username} completed challenge: "${activity.metadata?.challenge_name}"`;
    default:
      return `${username} performed an action`;
  }
};

export const getActivityIcon = (activityType: string): string => {
  switch (activityType) {
    case 'fact_created': return '📍';
    case 'fact_voted': return '✅';
    case 'comment_created': return '💬';
    case 'fact_saved': return '🔖';
    case 'user_followed': return '👥';
    case 'achievement_earned': return '🏆';
    case 'challenge_completed': return '🎯';
    default: return '📰';
  }
};