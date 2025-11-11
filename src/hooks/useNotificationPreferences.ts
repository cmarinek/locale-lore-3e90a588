import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  marketing_emails: boolean;
  new_facts_nearby: boolean;
  comments_replies: boolean;
  achievements: boolean;
  leaderboard_updates: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  push_notifications: true,
  in_app_notifications: true,
  marketing_emails: false,
  new_facts_nearby: true,
  comments_replies: true,
  achievements: true,
  leaderboard_updates: false,
  frequency: 'instant',
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPreferences(data as unknown as NotificationPreferences);
        } else {
          // Create default preferences if none exist
          const { data: newData, error: insertError } = await supabase
            .from('notification_preferences')
            .insert({ user_id: user.id, ...defaultPreferences })
            .select()
            .single();

          if (insertError) throw insertError;
          if (newData) setPreferences(newData as unknown as NotificationPreferences);
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, toast]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, ...updates }));
      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
  };
}
