import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SubscriptionDashboard } from '@/components/billing/SubscriptionDashboard';
import { ContributorPlans } from '@/components/billing/ContributorPlans';
import { Loader2, User, CreditCard, Bell, Shield } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const { preferences, loading: notifLoading, saving: notifSaving, updatePreferences } = useNotificationPreferences();
  const { settings, loading: privacyLoading, saving: privacySaving, updateSettings } = usePrivacySettings();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        setHasSubscription(!!data);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          {hasSubscription ? (
            <SubscriptionDashboard />
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                  <CardDescription>
                    You currently don't have an active subscription
                  </CardDescription>
                </CardHeader>
              </Card>
              <ContributorPlans />
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Notification Channels</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notif" className="text-sm font-normal cursor-pointer">
                          Email Notifications
                        </Label>
                        <Switch
                          id="email-notif"
                          checked={preferences.email_notifications}
                          onCheckedChange={(checked) => updatePreferences({ email_notifications: checked })}
                          disabled={notifSaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notif" className="text-sm font-normal cursor-pointer">
                          Push Notifications
                        </Label>
                        <Switch
                          id="push-notif"
                          checked={preferences.push_notifications}
                          onCheckedChange={(checked) => updatePreferences({ push_notifications: checked })}
                          disabled={notifSaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="inapp-notif" className="text-sm font-normal cursor-pointer">
                          In-App Notifications
                        </Label>
                        <Switch
                          id="inapp-notif"
                          checked={preferences.in_app_notifications}
                          onCheckedChange={(checked) => updatePreferences({ in_app_notifications: checked })}
                          disabled={notifSaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                          Marketing Emails
                        </Label>
                        <Switch
                          id="marketing"
                          checked={preferences.marketing_emails}
                          onCheckedChange={(checked) => updatePreferences({ marketing_emails: checked })}
                          disabled={notifSaving}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Notification Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="nearby" className="text-sm font-normal cursor-pointer">
                          New Facts Nearby
                        </Label>
                        <Switch
                          id="nearby"
                          checked={preferences.new_facts_nearby}
                          onCheckedChange={(checked) => updatePreferences({ new_facts_nearby: checked })}
                          disabled={notifSaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="comments" className="text-sm font-normal cursor-pointer">
                          Comments & Replies
                        </Label>
                        <Switch
                          id="comments"
                          checked={preferences.comments_replies}
                          onCheckedChange={(checked) => updatePreferences({ comments_replies: checked })}
                          disabled={notifSaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="achievements" className="text-sm font-normal cursor-pointer">
                          Achievements
                        </Label>
                        <Switch
                          id="achievements"
                          checked={preferences.achievements}
                          onCheckedChange={(checked) => updatePreferences({ achievements: checked })}
                          disabled={notifSaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="leaderboard" className="text-sm font-normal cursor-pointer">
                          Leaderboard Updates
                        </Label>
                        <Switch
                          id="leaderboard"
                          checked={preferences.leaderboard_updates}
                          onCheckedChange={(checked) => updatePreferences({ leaderboard_updates: checked })}
                          disabled={notifSaving}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Notification Frequency</h3>
                    <Select
                      value={preferences.frequency}
                      onValueChange={(value: any) => updatePreferences({ frequency: value })}
                      disabled={notifSaving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Manage your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {privacyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Profile Visibility</h3>
                    <Select
                      value={settings.profile_visibility}
                      onValueChange={(value: any) => updateSettings({ profile_visibility: value })}
                      disabled={privacySaving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Everyone can see your profile</SelectItem>
                        <SelectItem value="friends">Friends Only - Only friends can see your profile</SelectItem>
                        <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">What Others Can See</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-location" className="text-sm font-normal cursor-pointer">
                          Show My Location
                        </Label>
                        <Switch
                          id="show-location"
                          checked={settings.show_location}
                          onCheckedChange={(checked) => updateSettings({ show_location: checked })}
                          disabled={privacySaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-activity" className="text-sm font-normal cursor-pointer">
                          Show My Activity
                        </Label>
                        <Switch
                          id="show-activity"
                          checked={settings.show_activity}
                          onCheckedChange={(checked) => updateSettings({ show_activity: checked })}
                          disabled={privacySaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-achievements" className="text-sm font-normal cursor-pointer">
                          Show My Achievements
                        </Label>
                        <Switch
                          id="show-achievements"
                          checked={settings.show_achievements}
                          onCheckedChange={(checked) => updateSettings({ show_achievements: checked })}
                          disabled={privacySaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-stats" className="text-sm font-normal cursor-pointer">
                          Show My Statistics
                        </Label>
                        <Switch
                          id="show-stats"
                          checked={settings.show_stats}
                          onCheckedChange={(checked) => updateSettings({ show_stats: checked })}
                          disabled={privacySaving}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Interactions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="friend-requests" className="text-sm font-normal cursor-pointer">
                          Allow Friend Requests
                        </Label>
                        <Switch
                          id="friend-requests"
                          checked={settings.allow_friend_requests}
                          onCheckedChange={(checked) => updateSettings({ allow_friend_requests: checked })}
                          disabled={privacySaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="direct-messages" className="text-sm font-normal cursor-pointer">
                          Allow Direct Messages
                        </Label>
                        <Switch
                          id="direct-messages"
                          checked={settings.allow_direct_messages}
                          onCheckedChange={(checked) => updateSettings({ allow_direct_messages: checked })}
                          disabled={privacySaving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="discoverable" className="text-sm font-normal cursor-pointer">
                          Discoverable in Search
                        </Label>
                        <Switch
                          id="discoverable"
                          checked={settings.discoverable}
                          onCheckedChange={(checked) => updateSettings({ discoverable: checked })}
                          disabled={privacySaving}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
