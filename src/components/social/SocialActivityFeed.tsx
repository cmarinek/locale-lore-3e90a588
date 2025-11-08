
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ActivityFeedItem } from '@/types/social';
import { motion, AnimatePresence } from 'framer-motion';
import { log } from '@/utils/logger';
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

  const mapProfile = (profile: any) => ({
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url ?? undefined,
    bio: profile.bio ?? undefined,
    followers_count: profile.followers_count ?? 0,
    following_count: profile.following_count ?? 0,
    reputation_score: profile.reputation_score ?? 0,
    created_at: profile.created_at ?? new Date().toISOString(),
    updated_at: profile.updated_at ?? new Date().toISOString(),
  });

  useEffect(() => {
    if (user) {
      loadActivityFeed();
    }
  }, [user, feedType]);

  const loadActivityFeed = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let items: ActivityFeedItem[] = [];

      if (feedType === 'following') {
        const { data: followingData, error: followingError } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (followingError) throw followingError;

        const followingIds = (followingData ?? []).map((row) => row.following_id);
        if (followingIds.length === 0) {
          setActivities([]);
          return;
        }

        const { data, error } = await supabase
          .from('activity_feed')
          .select(`
            *,
            profiles:profiles!activity_feed_user_id_fkey(
              id,
              username,
              avatar_url,
              bio,
              followers_count,
              following_count,
              reputation_score,
              created_at,
              updated_at
            ),
            facts:facts!activity_feed_related_fact_id_fkey(
              id,
              title,
              location_name
            )
          `)
          .in('user_id', followingIds)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        items = (data ?? []).map((activity: any) => ({
          id: activity.id,
          user_id: activity.user_id,
          activity_type: activity.activity_type,
          related_fact_id: activity.related_fact_id,
          related_user_id: activity.related_user_id,
          metadata: activity.metadata ?? {},
          created_at: activity.created_at,
          profiles: activity.profiles ? mapProfile(activity.profiles) : undefined,
          facts: activity.facts
            ? {
                title: activity.facts.title,
                location_name: activity.facts.location_name,
              }
            : undefined,
        }));
      } else if (feedType === 'trending') {
        const { data, error } = await supabase
          .from('trending_facts')
          .select(`
            fact_id,
            score,
            comment_count,
            view_count,
            period_end,
            facts:facts!inner (
              id,
              title,
              location_name,
              author_id,
              created_at,
              profiles:profiles!facts_author_id_fkey(
                id,
                username,
                avatar_url,
                bio,
                followers_count,
                following_count,
                reputation_score,
                created_at,
                updated_at
              )
            )
          `)
          .order('score', { ascending: false })
          .limit(20);

        if (error) throw error;

        items = (data ?? []).map((entry: any) => {
          const fact = entry.facts;
          const profile = fact?.profiles ? mapProfile(fact.profiles) : undefined;

          return {
            id: `${entry.fact_id}-trending`,
            user_id: fact?.author_id ?? '',
            activity_type: 'fact_created',
            related_fact_id: fact?.id,
            metadata: {
              context: 'trending',
              trend_score: entry.score,
              view_count: entry.view_count,
              comment_count: entry.comment_count,
            },
            created_at: fact?.created_at ?? entry.period_end,
            profiles: profile,
            facts: fact
              ? {
                  title: fact.title,
                  location_name: fact.location_name,
                }
              : undefined,
          } satisfies ActivityFeedItem;
        });
      } else if (feedType === 'nearby') {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('favorite_cities')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        const favoriteCities = Array.isArray(profileData?.favorite_cities)
          ? profileData.favorite_cities.filter((city: any) => typeof city === 'string')
          : [];

        let factsQuery = supabase
          .from('facts')
          .select(`
            id,
            title,
            location_name,
            author_id,
            created_at,
            profiles:profiles!facts_author_id_fkey(
              id,
              username,
              avatar_url,
              bio,
              followers_count,
              following_count,
              reputation_score,
              created_at,
              updated_at
            )
          `)
          .eq('status', 'verified')
          .order('created_at', { ascending: false })
          .limit(20);

        if (favoriteCities.length > 0) {
          factsQuery = factsQuery.in('location_name', favoriteCities);
        }

        const { data, error } = await factsQuery;
        if (error) throw error;

        items = (data ?? []).map((fact: any) => ({
          id: `${fact.id}-nearby`,
          user_id: fact.author_id ?? '',
          activity_type: 'fact_created',
          related_fact_id: fact.id,
          metadata: {
            context: favoriteCities.length > 0 ? 'nearby' : 'featured',
            favorite_cities: favoriteCities,
          },
          created_at: fact.created_at,
          profiles: fact.profiles ? mapProfile(fact.profiles) : undefined,
          facts: {
            title: fact.title,
            location_name: fact.location_name,
          },
        }));
      }

      setActivities(items);
    } catch (error) {
      log.error('Failed to load social activity feed', error, { component: 'SocialActivityFeed' });
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

                  {activity.metadata?.context === 'trending' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </Badge>
                      {typeof activity.metadata?.trend_score === 'number' && (
                        <span>Score {Math.round(activity.metadata.trend_score)}</span>
                      )}
                      {typeof activity.metadata?.view_count === 'number' && (
                        <span>{activity.metadata.view_count} views</span>
                      )}
                    </div>
                  )}

                  {activity.metadata?.context === 'nearby' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Nearby
                      </Badge>
                      {Array.isArray(activity.metadata?.favorite_cities) &&
                        activity.metadata.favorite_cities.length > 0 && (
                          <span>
                            {activity.metadata.favorite_cities
                              .slice(0, 2)
                              .join(', ')}
                            {activity.metadata.favorite_cities.length > 2 ? '…' : ''}
                          </span>
                        )}
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
