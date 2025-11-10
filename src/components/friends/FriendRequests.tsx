import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useFriendship } from '@/hooks/useFriendship';
import { Link } from 'react-router-dom';

export function FriendRequests() {
  const { user } = useAuth();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          requested_at,
          profiles!friendships_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending friend requests
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request: any) => (
        <FriendRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}

function FriendRequestCard({ request }: { request: any }) {
  const profile = request.profiles;
  const { acceptRequest, rejectRequest, isActioning } = useFriendship(profile.id);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${profile.id}`}>
              <Avatar>
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link to={`/profile/${profile.id}`}>
                <p className="font-semibold hover:underline">{profile.username}</p>
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={acceptRequest}
              disabled={isActioning}
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={rejectRequest}
              disabled={isActioning}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
