import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Bell, BellOff, Smartphone, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PushSubscription {
  id: string;
  endpoint: string;
  device_type: string | null;
  browser: string | null;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export const PushSubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    setPushSupported('Notification' in window && 'serviceWorker' in navigator);
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching push subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!pushSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubscribing(true);
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        await subscribeToPush();
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
  };

  const subscribeToPush = async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID keys would be done on server
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      });

      const subscriptionJSON = subscription.toJSON();

      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: subscriptionJSON.endpoint || '',
          p256dh_key: subscriptionJSON.keys?.p256dh || '',
          auth_key: subscriptionJSON.keys?.auth || '',
          device_type: getDeviceType(),
          browser: getBrowserName(),
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Push notifications enabled successfully",
      });

      fetchSubscriptions();
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: "Error",
        description: "Failed to enable push notifications",
        variant: "destructive",
      });
    }
  };

  const toggleSubscription = async (subscriptionId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: !isActive })
        .eq('id', subscriptionId);

      if (error) throw error;

      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === subscriptionId ? { ...sub, is_active: !isActive } : sub
        )
      );

      toast({
        title: "Updated",
        description: `Push notifications ${!isActive ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));

      toast({
        title: "Deleted",
        description: "Push subscription removed",
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      });
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Manage your push notification subscriptions across devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pushSupported ? (
            <Button
              onClick={requestNotificationPermission}
              disabled={subscribing}
              className="w-full"
            >
              {subscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Push Notifications
                </>
              )}
            </Button>
          ) : (
            <div className="text-center text-muted-foreground p-4 bg-muted rounded-lg">
              Push notifications are not supported in this browser
            </div>
          )}
        </CardContent>
      </Card>

      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>
              {subscriptions.length} device{subscriptions.length !== 1 ? 's' : ''} subscribed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptions.map(sub => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {sub.device_type} - {sub.browser}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Added {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sub.is_active}
                    onCheckedChange={() => toggleSubscription(sub.id, sub.is_active)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteSubscription(sub.id)}
                  >
                    <BellOff className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
