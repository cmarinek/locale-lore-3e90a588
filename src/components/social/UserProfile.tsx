
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowButton } from '@/components/social/FollowButton';
import { TipSystem } from '@/components/contributor/TipSystem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
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
  Share2,
  Activity,
  ShieldCheck,
  LogIn,
  LogOut,
  MessageSquare,
  ThumbsUp,
  Gift,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityLogEntry {
  id: string;
  activity_type: string;
  activity_data: Record<string, any> | null;
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

interface UserAchievementRecord {
  id: string;
  earned_at: string;
  achievements?: {
    id: string;
    name: string;
    description: string;
    icon?: string | null;
    badge_color?: string | null;
    category?: string | null;
    requirement_type?: string | null;
    requirement_value?: number | null;
  } | null;
}

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
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [achievements, setAchievements] = useState<UserAchievementRecord[]>([]);

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

      const [factsResult, activityResult, achievementResult] = await Promise.all([
        supabase
          .from('facts')
          .select(`
            *,
            profiles!facts_author_id_fkey(username, avatar_url)
          `)
          .eq('author_id', userId)
          .eq('status', 'verified')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('user_activity_log')
          .select('id, activity_type, activity_data, created_at, ip_address, user_agent')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(25),
        supabase
          .from('user_achievements')
          .select(`
            id,
            earned_at,
            achievements:achievements (
              id,
              name,
              description,
              icon,
              badge_color,
              category,
              requirement_type,
              requirement_value
            )
          `)
          .eq('user_id', userId)
          .order('earned_at', { ascending: false })
      ]);

      if (factsResult.data) {
        setUserFacts(factsResult.data);
      }

      if (activityResult.data) {
        setActivityLog(activityResult.data as ActivityLogEntry[]);
      }

      if (achievementResult.data) {
        setAchievements(achievementResult.data as UserAchievementRecord[]);
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

  const activityIconMap = useMemo(
    () => ({
      login: LogIn,
      logout: LogOut,
      fact_submitted: MapPin,
      fact_verified: ShieldCheck,
      comment_created: MessageSquare,
      vote_cast: ThumbsUp,
      tip_sent: Gift,
      profile_view: Eye,
      system_table_access: ShieldCheck,
    }),
    []
  );

  const getActivityIcon = (activityType: string) => {
    const Icon = activityIconMap[activityType as keyof typeof activityIconMap] ?? Activity;
    return <Icon className="h-4 w-4 text-primary" />;
  };

  const describeActivity = (activity: ActivityLogEntry) => {
    const metadata = activity.activity_data || {};
    const factTitle = metadata.fact_title || metadata.factName;
    const locationName = metadata.location_name || metadata.locationName;

    switch (activity.activity_type) {
      case 'login':
        return `Signed in${metadata.ip_address ? ` from ${metadata.ip_address}` : ''}`;
      case 'logout':
        return 'Signed out';
      case 'fact_submitted':
        return factTitle ? `Submitted "${factTitle}"` : 'Submitted a new discovery';
      case 'fact_verified':
        return factTitle ? `Verified "${factTitle}"` : 'Verified a discovery';
      case 'comment_created':
        return metadata.comment_excerpt
          ? `Commented: "${metadata.comment_excerpt}"`
          : 'Added a comment';
      case 'vote_cast':
        return factTitle ? `Voted on "${factTitle}"` : 'Cast a vote';
      case 'tip_sent':
        return metadata.amount
          ? `Sent a tip of ${metadata.amount / 100} ${metadata.currency || 'credits'}`
          : 'Sent a tip';
      case 'profile_view':
        return metadata.viewer
          ? `Profile viewed by ${metadata.viewer}`
          : 'Profile viewed';
      case 'system_table_access':
        return metadata.warning || 'System table access logged';
      default:
        if (metadata.description) {
          return metadata.description;
        }
        if (locationName) {
          return `Activity at ${locationName}`;
        }
        return 'Activity recorded';
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
          {activityLog.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No activity recorded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activityLog.map((entry) => (
                <Card key={entry.id} className="border-border/60">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {getActivityIcon(entry.activity_type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium break-words">{describeActivity(entry)}</p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {(entry.activity_data?.location ||
                          entry.activity_data?.city ||
                          entry.activity_data?.coordinates ||
                          entry.activity_data?.location_name) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {entry.activity_data?.location_name ||
                                entry.activity_data?.city ||
                                entry.activity_data?.location ||
                                (Array.isArray(entry.activity_data?.coordinates)
                                  ? entry.activity_data?.coordinates.join(', ')
                                  : null)}
                            </span>
                          </div>
                        )}
                        {entry.activity_data?.device && (
                          <p className="text-xs text-muted-foreground">
                            Device: {entry.activity_data.device}
                          </p>
                        )}
                        {entry.activity_data?.ip_address && (
                          <p className="text-xs text-muted-foreground">
                            IP: {entry.activity_data.ip_address}
                          </p>
                        )}
                        {entry.user_agent && (
                          <p className="text-xs text-muted-foreground truncate">UA: {entry.user_agent}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {achievements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No achievements earned yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((record) => {
                const badgeColor = record.achievements?.badge_color || '#6366F1';
                const icon = record.achievements?.icon || '✨';
                return (
                  <Card key={record.id} className="border-border/60">
                    <CardContent className="py-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl bg-background',
                          )}
                          style={{ borderColor: badgeColor }}
                          aria-hidden
                        >
                          {icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold leading-none">
                              {record.achievements?.name || 'Achievement'}
                            </h3>
                            {record.achievements?.category && (
                              <Badge variant="outline" className="capitalize">
                                {record.achievements.category}
                              </Badge>
                            )}
                          </div>
                          {record.achievements?.description && (
                            <p className="text-sm text-muted-foreground">
                              {record.achievements.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Earned {formatDistanceToNow(new Date(record.earned_at), { addSuffix: true })}
                            </span>
                            {record.achievements?.requirement_type && (
                              <span>
                                Requirement: {record.achievements.requirement_value || 0}{' '}
                                {record.achievements.requirement_type.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
