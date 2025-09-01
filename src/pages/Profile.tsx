import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/templates/MainLayout';
import { ReputationDisplay } from '@/components/verification/ReputationDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Star,
  Trophy,
  BookOpen,
  MessageCircle,
  ThumbsUp,
  Settings,
  Camera,
  Save,
  Edit3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  facts_count: number;
  votes_received: number;
  comments_made: number;
  achievements_count: number;
}

export const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    facts_count: 0,
    votes_received: 0,
    comments_made: 0,
    achievements_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: ''
  });

  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  useEffect(() => {
    if (profileId) {
      loadProfile();
      loadUserStats();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setEditForm({
        username: data.username || '',
        bio: data.bio || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        variant: "destructive"
      });
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Get facts count
      const { count: factsCount } = await supabase
        .from('facts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', profileId);

      // Get votes received
      const { data: votes } = await supabase
        .from('votes')
        .select('is_upvote, facts!inner(author_id)')
        .eq('facts.author_id', profileId);

      // Get comments made
      const { count: commentsCount } = await supabase
        .from('fact_comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', profileId);

      // Get achievements count
      const { count: achievementsCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      const votesReceived = votes?.filter(v => v.is_upvote).length || 0;

      setUserStats({
        facts_count: factsCount || 0,
        votes_received: votesReceived,
        comments_made: commentsCount || 0,
        achievements_count: achievementsCount || 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !isOwnProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          bio: editForm.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        username: editForm.username,
        bio: editForm.bio,
        updated_at: new Date().toISOString()
      } : null);

      setEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
            <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/explore')}>
              Return to Explore
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur sticky top-6">
                  <div className="text-center">
                    {/* Avatar */}
                    <div className="relative mb-4">
                      <Avatar className="w-24 h-24 mx-auto">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="text-2xl">
                          {profile.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isOwnProfile && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Username */}
                    <h1 className="text-2xl font-bold mb-2">{profile.username}</h1>
                    
                    {/* Reputation */}
                    <div className="mb-4">
                      <ReputationDisplay userId={profile.id} />
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                      {profile.bio ? (
                        <p className="text-muted-foreground text-sm">{profile.bio}</p>
                      ) : isOwnProfile ? (
                        <p className="text-muted-foreground text-sm italic">
                          Add a bio to tell others about yourself
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">
                          No bio available
                        </p>
                      )}
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                      <Calendar className="w-4 h-4" />
                      Member since {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                    </div>

                    {/* Actions */}
                    {isOwnProfile && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(true)}
                          className="w-full"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="facts">Facts</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4 text-center bg-card/50 backdrop-blur">
                        <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold">{userStats.facts_count}</div>
                        <div className="text-sm text-muted-foreground">Facts Shared</div>
                      </Card>
                      
                      <Card className="p-4 text-center bg-card/50 backdrop-blur">
                        <ThumbsUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{userStats.votes_received}</div>
                        <div className="text-sm text-muted-foreground">Upvotes</div>
                      </Card>
                      
                      <Card className="p-4 text-center bg-card/50 backdrop-blur">
                        <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{userStats.comments_made}</div>
                        <div className="text-sm text-muted-foreground">Comments</div>
                      </Card>
                      
                      <Card className="p-4 text-center bg-card/50 backdrop-blur">
                        <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{userStats.achievements_count}</div>
                        <div className="text-sm text-muted-foreground">Achievements</div>
                      </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card className="p-6 bg-card/50 backdrop-blur">
                      <h3 className="font-semibold mb-4">Recent Activity</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Facts Tab */}
                  <TabsContent value="facts">
                    <Card className="p-6 bg-card/50 backdrop-blur">
                      <h3 className="font-semibold mb-4">Shared Facts</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No facts shared yet</p>
                        {isOwnProfile && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => navigate('/submit')}
                          >
                            Share Your First Story
                          </Button>
                        )}
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Achievements Tab */}
                  <TabsContent value="achievements">
                    <Card className="p-6 bg-card/50 backdrop-blur">
                      <h3 className="font-semibold mb-4">Achievements</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No achievements yet</p>
                        <p className="text-sm mt-2">Start sharing stories to earn achievements!</p>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity">
                    <Card className="p-6 bg-card/50 backdrop-blur">
                      <h3 className="font-semibold mb-4">Activity Timeline</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No activity to show</p>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSaveProfile} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};