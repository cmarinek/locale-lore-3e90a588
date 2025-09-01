import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Bell, Clock, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationNotification {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  data: {
    trigger_id?: string;
    fact_id?: string;
    distance?: number;
    location?: { latitude: number; longitude: number };
  };
  is_read: boolean;
  delivered_at: string;
  action_taken?: string;
}

interface LocationBasedNotificationsProps {
  userLocation?: { latitude: number; longitude: number };
  onFactSelect?: (factId: string) => void;
}

export const LocationBasedNotifications: React.FC<LocationBasedNotificationsProps> = ({
  userLocation,
  onFactSelect
}) => {
  const [notifications, setNotifications] = useState<LocationNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('notification_type', 'location_trigger')
        .eq('is_read', false)
        .order('delivered_at', { ascending: false })
        .limit(5);

      setNotifications((data || []) as LocationNotification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const checkLocationTriggers = async () => {
    if (!userLocation) return;

    try {
      setCheckingLocation(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Checking location triggers for:', userLocation);

      const { data: response, error } = await supabase.functions.invoke('location-triggers', {
        body: {
          user_id: user.id,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 1000 // 1km radius
        }
      });

      if (error) throw error;

      if (response?.notifications_sent > 0) {
        toast({
          title: "📍 Discovery Nearby!",
          description: response.sent_notification?.title || "New location-based discovery available",
        });
        
        // Refresh notifications
        await fetchNotifications();
      }

      console.log('Location triggers result:', response);
    } catch (error) {
      console.error('Error checking location triggers:', error);
    } finally {
      setCheckingLocation(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString(),
          action_taken: 'read'
        })
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleExplore = async (notification: LocationNotification) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString(),
          action_taken: 'opened'
        })
        .eq('id', notification.id);

      setNotifications(prev => prev.filter(n => n.id !== notification.id));

      if (notification.data.fact_id && onFactSelect) {
        onFactSelect(notification.data.fact_id);
      }

      toast({
        title: "Exploring Discovery",
        description: "Opening location-based discovery",
      });
    } catch (error) {
      console.error('Error handling explore action:', error);
    }
  };

  const getDistanceText = (distance?: number) => {
    if (!distance) return '';
    if (distance < 100) return 'right here';
    if (distance < 1000) return `${Math.round(distance)}m away`;
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  // Check location triggers when location changes
  useEffect(() => {
    if (userLocation) {
      checkLocationTriggers();
    }
  }, [userLocation]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time subscription for new notifications
  useEffect(() => {
    const getUserAndSetupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const channel = supabase
        .channel('location-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new.notification_type === 'location_trigger') {
            setNotifications(prev => [payload.new as LocationNotification, ...prev]);
            toast({
              title: payload.new.title,
              description: payload.new.body,
            });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    getUserAndSetupChannel();
  }, []);

  if (notifications.length === 0 && !checkingLocation) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Location Discoveries
            {checkingLocation && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Bell className="h-4 w-4 text-blue-500" />
              </motion.div>
            )}
          </div>
          {notifications.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {notifications.length} nearby
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checkingLocation && notifications.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            </motion.div>
            <p>Checking for nearby discoveries...</p>
          </div>
        )}

        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4 last:mb-0 p-4 bg-card rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.body}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-4">
                  {notification.data.distance && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {getDistanceText(notification.data.distance)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(notification.delivered_at)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleExplore(notification)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Explore
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => markAsRead(notification.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {userLocation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={checkLocationTriggers}
            disabled={checkingLocation}
            className="w-full mt-2"
          >
            {checkingLocation ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Bell className="h-4 w-4" />
                </motion.div>
                Checking nearby...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Check for nearby discoveries
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};