import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserStatistics } from './useProfile';

export interface PublicProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface FollowStats {
  followers: number;
  following: number;
  isFollowing: boolean;
}

export const usePublicProfile = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0, isFollowing: false });
  const [stories, setStories] = useState<any[]>([]);

  const fetchPublicProfile = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, created_at')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Check if profile is public
      const { data: settings } = await supabase
        .from('user_settings')
        .select('profile_visibility')
        .eq('user_id', userId)
        .maybeSingle();

      if (settings?.profile_visibility === 'private') {
        throw new Error('This profile is private');
      }

      setProfile(profileData);

      // Fetch public statistics
      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (statsData) {
        setStatistics(statsData);
      }

      // Fetch user's public stories
      const { data: storiesData } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (storiesData) {
        setStories(storiesData);
      }

      // Fetch follow stats
      await fetchFollowStats();

    } catch (error: any) {
      console.error('Error fetching public profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStats = async () => {
    if (!userId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get follower count
      const { count: followerCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Get following count
      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      // Check if current user is following
      let isFollowing = false;
      if (user) {
        const { data } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();

        isFollowing = !!data;
      }

      setFollowStats({
        followers: followerCount || 0,
        following: followingCount || 0,
        isFollowing,
      });
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const toggleFollow = async () => {
    if (!userId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to follow users",
          variant: "destructive",
        });
        return;
      }

      if (followStats.isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;

        setFollowStats(prev => ({
          ...prev,
          followers: prev.followers - 1,
          isFollowing: false,
        }));

        toast({
          title: "Unfollowed",
          description: `You unfollowed ${profile?.username}`,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;

        setFollowStats(prev => ({
          ...prev,
          followers: prev.followers + 1,
          isFollowing: true,
        }));

        toast({
          title: "Following",
          description: `You are now following ${profile?.username}`,
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  return {
    profile,
    statistics,
    followStats,
    stories,
    loading,
    toggleFollow,
    refreshProfile: fetchPublicProfile,
  };
};
