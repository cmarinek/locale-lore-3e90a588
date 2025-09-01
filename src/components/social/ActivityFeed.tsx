import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  FileText, 
  UserPlus,
  RefreshCw,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: 'fact_created' | 'fact_liked' | 'fact_commented' | 'user_followed';
  related_fact_id?: string;
  related_user_id?: string;
  created_at: string;
  user_profile?: {
    username: string;
    avatar_url?: string;
  };
  facts?: {
    title: string;
    description: string;
  };
  related_profile?: {
    username: string;
    avatar_url?: string;
  };
}

export const ActivityFeed: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          id,
          user_id,
          activity_type,
          related_fact_id,
          related_user_id,
          created_at,
          user_profile:profiles!activity_feed_user_id_fkey (
            username,
            avatar_url
          ),
          facts (
            title,
            description
          ),
          related_profile:profiles!activity_feed_related_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setActivities(data as ActivityItem[] || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'fact_created':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'fact_liked':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'fact_commented':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'user_followed':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.activity_type) {
      case 'fact_created':
        return (
          <>
            shared a new story:{' '}
            <Link 
              to={`/fact/${activity.related_fact_id}`}
              className="font-semibold text-primary hover:underline"
            >
              {activity.facts?.title}
            </Link>
          </>
        );
      case 'fact_liked':
        return (
          <>
            liked{' '}
            <Link 
              to={`/fact/${activity.related_fact_id}`}
              className="font-semibold text-primary hover:underline"
            >
              {activity.facts?.title}
            </Link>
          </>
        );
      case 'fact_commented':
        return (
          <>
            commented on{' '}
            <Link 
              to={`/fact/${activity.related_fact_id}`}
              className="font-semibold text-primary hover:underline"
            >
              {activity.facts?.title}
            </Link>
          </>
        );
      case 'user_followed':
        return (
          <>
            started following{' '}
            <Link 
              to={`/profile/${activity.related_user_id}`}
              className="font-semibold text-primary hover:underline"
            >
              {activity.related_profile?.username}
            </Link>
          </>
        );
      default:
        return 'performed an action';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Activity Feed</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No recent activity from people you follow</p>
          <p className="text-sm mt-1">
            Start following users to see their activity here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.user_profile?.avatar_url} />
                  <AvatarFallback>
                    {activity.user_profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(activity.activity_type)}
                    <Link 
                      to={`/profile/${activity.user_id}`}
                      className="font-semibold text-sm hover:underline"
                    >
                      {activity.user_profile?.username || 'Unknown User'}
                    </Link>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {getActivityText(activity)}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};