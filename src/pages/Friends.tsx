import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FriendRequests } from '@/components/friends/FriendRequests';
import { useFriendship } from '@/hooks/useFriendship';

export function Friends() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Get all friends
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          profiles!friendships_friend_id_fkey (
            id,
            username,
            avatar_url,
            reputation_score
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get pending requests count
  const { data: requestCount = 0 } = useQuery({
    queryKey: ['friend-requests-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const filteredFriends = friends.filter((friend: any) =>
    friend.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8" />
              Friends
            </h1>
            <p className="text-muted-foreground mt-1">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="friends">
          <TabsList className="w-full">
            <TabsTrigger value="friends" className="flex-1">
              Friends
              <Badge variant="secondary" className="ml-2">
                {friends.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">
              Requests
              {requestCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {requestCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Friends List */}
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : filteredFriends.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No friends found matching your search' : 'No friends yet. Start adding friends!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredFriends.map((friend: any) => (
                  <FriendCard key={friend.id} friend={friend} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <FriendRequests />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function FriendCard({ friend }: { friend: any }) {
  const profile = friend.profiles;
  const { removeFriend, isActioning } = useFriendship(profile.id);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/profile/${profile.id}`}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link to={`/profile/${profile.id}`}>
                <p className="font-semibold hover:underline">{profile.username}</p>
              </Link>
              <p className="text-sm text-muted-foreground">
                Reputation: {profile.reputation_score || 0}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/profile/${profile.id}`}>
                View Profile
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFriend()}
              disabled={isActioning}
            >
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Friends;
