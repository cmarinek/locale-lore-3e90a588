
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowButton } from '@/components/social/FollowButton';
import { TipSystem } from '@/components/contributor/TipSystem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { UserProfile as UserProfileType } from '@/types/social';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  MessageCircle,
  Shield,
  MoreHorizontal,
  Settings,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileProps {
  userId: string;
  onMessageClick?: (userId: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onMessageClick }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [userFacts, setUserFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    loadUserProfile();
    if (user && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId, user]);

  const loadUserProfile = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(profileData);

      // Load user's facts
      const { data: factsData } = await supabase
        .from('facts')
        .select(`
          *,
          profiles!facts_author_id_fkey(username, avatar_url)
        `)
        .eq('author_id', userId)
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(10);

      if (factsData) {
        setUserFacts(factsData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // Not following if no record found
      setIsFollowing(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.username}'s Profile - LocaleLore`,
      text: `Check out ${profile?.username}'s discoveries on LocaleLore!`,
      url: `${window.location.origin}/profile/${userId}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Profile link copied!",
        description: "Share this link with others",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-1">{profile.bio}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{profile.followers_count} followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{profile.following_count} following</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{profile.reputation_score} reputation</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isOwnProfile && (
                <>
                  <FollowButton userId={userId} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMessageClick?.(userId)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <TipSystem
                    recipientId={userId}
                    recipientName={profile.username}
                    recipientAvatar={profile.avatar_url}
                    showTipJar={true}
                  />
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              {isOwnProfile && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="facts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="facts">Discoveries</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="privacy">Privacy</TabsTrigger>}
        </TabsList>

        <TabsContent value="facts" className="space-y-4">
          <div className="grid gap-4">
            {userFacts.map((fact: any) => (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{fact.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {fact.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{fact.location_name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(fact.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                      
                      <Badge variant="outline">
                        {fact.vote_count_up} votes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {userFacts.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {isOwnProfile ? "You haven't shared any discoveries yet" : "No discoveries shared yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Activity feed coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center">
              <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Achievements coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Settings
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile and activity
                </p>
                {/* Privacy controls would go here */}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
