
import React, { useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialActivityFeed } from '@/components/social/SocialActivityFeed';
import { DirectMessaging } from '@/components/social/DirectMessaging';
import { UserProfile } from '@/components/social/UserProfile';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  MessageCircle, 
  Search,
  MapPin,
  Bell,
  Settings,
  UserPlus
} from 'lucide-react';

export const Social: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleMessageClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowMessaging(true);
  };

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
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm">
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
                    placeholder="Search users, locations, or discoveries..."
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {showMessaging ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Messages</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowMessaging(false)}
                >
                  Back to Social
                </Button>
              </div>
              
              <DirectMessaging 
                recipientId={selectedUserId || undefined}
                onClose={() => setShowMessaging(false)}
              />
            </motion.div>
          ) : selectedUserId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUserId(null)}
                >
                  Back to Feed
                </Button>
                <Button
                  onClick={() => handleMessageClick(selectedUserId)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
              
              <UserProfile 
                userId={selectedUserId}
                onMessageClick={handleMessageClick}
              />
            </motion.div>
          ) : (
            <Tabs defaultValue="following" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
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
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center py-8">
                          People suggestions coming soon!
                        </p>
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Following</span>
                        <span className="font-semibold">89</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Followers</span>
                        <span className="font-semibold">156</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Messages</span>
                        <span className="font-semibold">3</span>
                      </div>
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
                        onClick={() => setShowMessaging(true)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Messages
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Find Friends
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
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
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">#HiddenGems</span>
                          <span className="text-xs text-muted-foreground">245 posts</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">#UrbanExploration</span>
                          <span className="text-xs text-muted-foreground">189 posts</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">#NaturalWonders</span>
                          <span className="text-xs text-muted-foreground">156 posts</span>
                        </div>
                      </div>
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
