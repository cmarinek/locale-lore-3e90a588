import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface PrivacySettings {
  id?: string;
  user_id?: string;
  profile_visibility: 'public' | 'friends' | 'private';
  show_location: boolean;
  show_activity: boolean;
  show_achievements: boolean;
  show_stats: boolean;
  allow_friend_requests: boolean;
  allow_direct_messages: boolean;
  discoverable: boolean;
}

const defaultSettings: PrivacySettings = {
  profile_visibility: 'public',
  show_location: true,
  show_activity: true,
  show_achievements: true,
  show_stats: true,
  allow_friend_requests: true,
  allow_direct_messages: true,
  discoverable: true,
};

export function usePrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('privacy_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(data as PrivacySettings);
        } else {
          // Create default settings if none exist
          const { data: newData, error: insertError } = await supabase
            .from('privacy_settings')
            .insert({ user_id: user.id, ...defaultSettings })
            .select()
            .single();

          if (insertError) throw insertError;
          if (newData) setSettings(newData as PrivacySettings);
        }
      } catch (error) {
        console.error('Error loading privacy settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load privacy settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, toast]);

  const updateSettings = async (updates: Partial<PrivacySettings>) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings((prev) => ({ ...prev, ...updates }));
      toast({
        title: 'Success',
        description: 'Privacy settings updated',
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
  };
}
