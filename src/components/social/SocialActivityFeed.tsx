
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ActivityFeedItem } from '@/types/social';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  UserPlus, 
  Trophy,
  Clock,
  RefreshCw,
  Users,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface SocialActivityFeedProps {
  feedType?: 'following' | 'trending' | 'nearby';
  className?: string;
}

export const SocialActivityFeed: React.FC<SocialActivityFeedProps> = ({ 
  feedType = 'following',
  className = ""
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadActivityFeed();
    }
  }, [user, feedType]);

  const loadActivityFeed = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          profiles!activity_feed_user_id_fkey(username, avatar_url),
          facts!activity_feed_related_fact_id_fkey(title, location_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setActivities(data as ActivityFeedItem[] || []);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivityFeed();
    setRefreshing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'fact_created':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'fact_voted':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment_created':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'user_followed':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'achievement_earned':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityFeedItem) => {
    const username = activity.profiles?.username || 'Someone';
    
    switch (activity.activity_type) {
      case 'fact_created':
        return (
          <>
            <strong>{username}</strong> shared a new discovery:{' '}
            <Link 
              to={`/fact/${activity.related_fact_id}`}
              className="text-primary hover:underline font-medium"
            >
              {activity.facts?.title}
            </Link>
          </>
        );
      case 'fact_voted':
        const voteType = activity.metadata?.is_upvote ? 'verified' : 'disputed';
        return (
          <>
            <strong>{username}</strong> {voteType}:{' '}
            <Link 
              to={`/fact/${activity.related_fact_id}`}
              className="text-primary hover:underline font-medium"
            >
              {activity.facts?.title}
            </Link>
          </>
        );
      case 'comment_created':
        return (
          <>
            <strong>{username}</strong> commented on:{' '}
            <Link 
              to={`/fact/${activity.related_fact_id}`}
              className="text-primary hover:underline font-medium"
            >
              {activity.facts?.title}
            </Link>
          </>
        );
      case 'user_followed':
        return (
          <>
            <strong>{username}</strong> started following someone new
          </>
        );
      case 'achievement_earned':
        return (
          <>
            <strong>{username}</strong> earned a new achievement:{' '}
            <span className="font-medium">{activity.metadata?.achievement_name}</span>
          </>
        );
      default:
        return `${username} performed an action`;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {feedType === 'following' && <Users className="w-5 h-5" />}
            {feedType === 'trending' && <TrendingUp className="w-5 h-5" />}
            {feedType === 'nearby' && <MapPin className="w-5 h-5" />}
            
            {feedType === 'following' && 'Following'}
            {feedType === 'trending' && 'Trending'}
            {feedType === 'nearby' && 'Nearby Activity'}
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">
              Follow users to see their activity here!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activity.profiles?.avatar_url} />
                    <AvatarFallback>
                      {activity.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(activity.activity_type)}
                    <div className="text-sm text-muted-foreground">
                      {getActivityText(activity)}
                    </div>
                  </div>
                  
                  {activity.facts?.location_name && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.facts.location_name}</span>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};
