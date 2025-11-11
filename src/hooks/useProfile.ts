
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from '@/hooks/use-toast';

export interface UserSettings {
  id?: string;
  user_id: string;
  theme: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  location_sharing: boolean;
  profile_visibility: string;
  discovery_radius: number;
  activity_tracking: boolean;
  data_processing_consent: boolean;
  marketing_emails: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserStatistics {
  facts_submitted: number;
  facts_verified: number;
  comments_made: number;
  votes_cast: number;
  achievements_earned: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  locations_discovered: number;
  profile_views: number;
  last_activity?: string;
}

export interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  const fetchUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const defaultSettings: Omit<UserSettings, 'id'> = {
          user_id: user.id,
          theme: 'auto',
          language: 'en',
          email_notifications: true,
          push_notifications: true,
          in_app_notifications: true,
          location_sharing: false,
          profile_visibility: 'public',
          discovery_radius: 10,
          activity_tracking: true,
          data_processing_consent: false,
          marketing_emails: false,
        };

        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error: any) {
      console.error('Error fetching user settings:', error);
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive",
      });
    }
  };

  const fetchUserStatistics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setStatistics(data);
      } else {
        // Create default statistics
        const defaultStats: Omit<UserStatistics, 'id'> = {
          facts_submitted: 0,
          facts_verified: 0,
          comments_made: 0,
          votes_cast: 0,
          achievements_earned: 0,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          locations_discovered: 0,
          profile_views: 0,
        };

        const { data: newStats, error: createError } = await supabase
          .from('user_statistics')
          .insert({ user_id: user.id, ...defaultStats })
          .select()
          .single();

        if (createError) throw createError;
        setStatistics(newStats);
      }
    } catch (error: any) {
      console.error('Error fetching user statistics:', error);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user || !settings) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error", 
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to export your data.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) {
        console.error('Export error:', error);
        throw error;
      }

      if (!data?.download_url) {
        throw new Error('No download URL received from export');
      }

      // Create download link with proper filename
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = `localelore-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Data export completed",
        description: `Your data has been downloaded successfully. ${data.expires_at ? 'Download link expires in 7 days.' : ''}`,
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export your data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestAccountDeletion = async (reason?: string, feedback?: string) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to request account deletion.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if there's already a pending deletion request
      const { data: existing, error: checkError } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        toast({
          title: "Deletion already requested",
          description: `Your account is scheduled for deletion on ${new Date(existing.scheduled_deletion).toLocaleDateString()}. You can cancel this request from your profile.`,
          variant: "default",
        });
        return;
      }

      // Create new deletion request with 30-day grace period
      const scheduledDeletion = new Date();
      scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user.id,
          reason: reason || null,
          feedback: feedback || null,
          status: 'pending',
          scheduled_deletion: scheduledDeletion.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Account deletion requested",
        description: `Your account will be permanently deleted on ${scheduledDeletion.toLocaleDateString()}. You can cancel this request anytime before then.`,
        duration: 7000,
      });
    } catch (error: any) {
      console.error('Error requesting account deletion:', error);
      toast({
        title: "Request failed",
        description: error.message || "Failed to process deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserSettings();
      fetchUserStatistics();
      checkSubscription();
    }
  }, [user]);

  return {
    settings,
    statistics,
    subscription,
    loading,
    updateSettings,
    exportUserData,
    requestAccountDeletion,
    refreshSubscription: checkSubscription,
  };
};
