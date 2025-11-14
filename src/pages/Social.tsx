
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SocialActivityFeed } from '@/components/social/SocialActivityFeed';
// DirectMessaging temporarily disabled - missing database tables
import { UserProfile } from '@/components/social/UserProfile';
import { FollowButton } from '@/components/social/FollowButton';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  MessageCircle,
  Search,
  MapPin,
  Bell,
  Settings,
  UserPlus,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { UserProfile as SocialUserProfile } from '@/types/social';

export const Social: React.FC = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SocialUserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [quickStats, setQuickStats] = useState({ following: 0, followers: 0 });
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [suggestedPeople, setSuggestedPeople] = useState<SocialUserProfile[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<Array<{ title: string; posts: number }>>([]);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const normalizeProfile = (profile: any): SocialUserProfile => ({
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

  const loadSidebarData = async () => {
    try {
      setSidebarLoading(true);

      const [
        followingResult,
        followersResult,
        suggestedResult,
        trendingResult,
        messageThreadsResult,
      ] = await Promise.all([
        user
          ? supabase
              .from('user_follows')
              .select('following_id', { count: 'exact' })
              .eq('follower_id', user.id)
          : Promise.resolve({ data: [], count: 0, error: null }),
        user
          ? supabase
              .from('user_follows')
              .select('follower_id', { count: 'exact' })
              .eq('following_id', user.id)
          : Promise.resolve({ data: [], count: 0, error: null }),
        supabase
          .from('profiles')
          .select(
            'id, username, avatar_url, bio, followers_count, following_count, reputation_score, created_at, updated_at'
          )
          .neq('id', user?.id ?? '')
          .order('reputation_score', { ascending: false })
          .limit(12),
        supabase
          .from('trending_facts')
          .select(
            `score, view_count, facts:facts!inner (id, title)`
          )
          .order('score', { ascending: false })
          .limit(5),
        user ? Promise.resolve({ data: [], error: null }) : Promise.resolve({ data: [], error: null }),
        // Direct messaging temporarily disabled - database functions not yet created
      ]);

      if (followingResult.error) console.error('Failed to load following list', followingResult.error);
      if (followersResult.error) console.error('Failed to load followers', followersResult.error);
      if (suggestedResult.error) console.error('Failed to load suggested profiles', suggestedResult.error);
      if (trendingResult.error) console.error('Failed to load trending topics', trendingResult.error);
      if (messageThreadsResult.error) console.error('Failed to load message threads', messageThreadsResult.error);

      const followingIds = (followingResult.data ?? []).map((row: any) => row.following_id);
      const followingCount = followingResult.count ?? followingIds.length;
      const followersCount = followersResult.count ?? (followersResult.data ?? []).length;

      const suggestedProfiles = (suggestedResult.data ?? [])
        .map((profile: any) => normalizeProfile(profile))
        .filter((profile) => !followingIds.includes(profile.id))
        .slice(0, 5);

      const trending = (trendingResult.data ?? []).map((entry: any) => ({
        title: entry.facts?.title ?? 'Featured discovery',
        posts: entry.view_count ?? 0,
      }));

      setQuickStats({
        following: followingCount,
        followers: followersCount,
      });
      setSuggestedPeople(suggestedProfiles);
      setTrendingTopics(trending);
    } catch (error) {
      console.error('Error loading social sidebar data:', error);
    } finally {
      setSidebarLoading(false);
    }
  };

  const handleSearchChange = async (value: string) => {
    setSearchTerm(value);

    if (!value.trim() || value.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, username, avatar_url, bio, followers_count, following_count, reputation_score, created_at, updated_at'
        )
        .ilike('username', `%${value.trim()}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults((data ?? []).map((profile: any) => normalizeProfile(profile)));
    } catch (error) {
      console.error('Error searching social profiles:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    loadSidebarData();
  }, [user?.id]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Social Hub</h1>
                <p className="text-muted-foreground">
                  Connect with fellow explorers and discover together
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" aria-label="View notifications">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm" aria-label="Open privacy settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Privacy
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search users, locations, or discoveries..."
                    className="pl-10"
                    aria-label="Search for users and content"
                    aria-autocomplete="list"
                    aria-controls={searchTerm ? "search-results" : undefined}
                    aria-expanded={searchTerm && searchResults.length > 0}
                  />
                </div>

                {searchTerm && (
                  <div id="search-results" role="listbox" aria-label="Search results" className="mt-4 space-y-2">
                    {searchLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                        <Loader2 className="w-4 h-4 animate-spin" /> Searching…
                      </div>
                    ) : searchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground" role="status">No matching people yet.</p>
                    ) : (
                      searchResults.slice(0, 5).map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => handleUserClick(profile.id)}
                          className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/60 transition-colors text-left"
                          role="option"
                          aria-label={`View profile of ${profile.username}, ${profile.followers_count} followers, reputation ${profile.reputation_score}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={profile.avatar_url} />
                              <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold">{profile.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {profile.followers_count.toLocaleString()} followers · Reputation {profile.reputation_score}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {selectedUserId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUserId(null)}
                  aria-label="Return to social feed"
                >
                  Back to Feed
                </Button>
              </div>

              <UserProfile
                userId={selectedUserId}
              />
            </motion.div>
          ) : (
            <Tabs defaultValue="following" className="space-y-6">
              <TabsList className="w-full overflow-x-auto">
                <TabsTrigger value="following" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Following
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="nearby" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Nearby
                </TabsTrigger>
                <TabsTrigger value="discover" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Discover People
                </TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <TabsContent value="following" className="m-0">
                    <SocialActivityFeed feedType="following" />
                  </TabsContent>

                  <TabsContent value="trending" className="m-0">
                    <SocialActivityFeed feedType="trending" />
                  </TabsContent>

                  <TabsContent value="nearby" className="m-0">
                    <SocialActivityFeed feedType="nearby" />
                  </TabsContent>

                  <TabsContent value="discover" className="m-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Suggested People</CardTitle>
                        <CardDescription>Follow local experts you might enjoy.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {sidebarLoading ? (
                          <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <div key={index} className="h-16 bg-muted animate-pulse rounded-md" />
                            ))}
                          </div>
                        ) : suggestedPeople.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">
                            We’ll surface suggestions once you start following contributors.
                          </p>
                        ) : (
                          suggestedPeople.map((profile) => (
                            <div key={profile.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={profile.avatar_url} />
                                  <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{profile.username}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {profile.followers_count.toLocaleString()} followers · Reputation {profile.reputation_score}
                                  </p>
                                </div>
                              </div>
                              <FollowButton userId={profile.id} />
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Your Network</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sidebarLoading ? (
                        <div className="space-y-2">
                          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Following</span>
                            <span className="font-semibold">{quickStats.following.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Followers</span>
                            <span className="font-semibold">{quickStats.followers.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={loadSidebarData}
                        aria-label="Discover and find new friends"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Find Friends
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        aria-label="Manage privacy and security settings"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Privacy Settings
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Trending Topics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Trending Now</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sidebarLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-4 bg-muted animate-pulse rounded" />
                          ))}
                        </div>
                      ) : trendingTopics.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Trending topics will appear here soon.</p>
                      ) : (
                        trendingTopics.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm truncate">{topic.title}</span>
                            <span className="text-xs text-muted-foreground">{topic.posts.toLocaleString()} views</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Tabs>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
