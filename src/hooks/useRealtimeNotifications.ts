import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useRealtime } from './useRealtime';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/utils/logger';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'vote' | 'comment' | 'fact_verified' | 'fact_disputed' | 'mention';
  created_at: string;
  is_read: boolean;
  related_fact_id?: string;
  related_comment_id?: string;
}

interface NotificationHookReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const useRealtimeNotifications = (): NotificationHookReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const realtime = useRealtime({
    enabled: !!user,
    onConnect: () => log.info('Notifications realtime connected', { component: 'useRealtimeNotifications' }),
    onDisconnect: () => log.info('Notifications realtime disconnected', { component: 'useRealtimeNotifications' }),
    onError: (error) => log.error('Notifications realtime error', error, { component: 'useRealtimeNotifications' })
  });

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      log.error('Error loading notifications', error, { component: 'useRealtimeNotifications' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Handle real-time notification updates
  const handleNotificationUpdate = useCallback((payload: any) => {
    const { eventType, new: newNotification, old: oldNotification } = payload;

    switch (eventType) {
      case 'INSERT':
        setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
        
        // Show toast for new notifications
        if (!document.hidden) {
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico',
            tag: newNotification.id
          });
        }
        break;

      case 'UPDATE':
        setNotifications(prev => 
          prev.map(n => n.id === newNotification.id ? newNotification : n)
        );
        break;

      case 'DELETE':
        setNotifications(prev => 
          prev.filter(n => n.id !== oldNotification.id)
        );
        break;
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = realtime.subscribe(
      `notifications-${user.id}`,
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      },
      handleNotificationUpdate
    );

    return () => {
      realtime.unsubscribe(`notifications-${user.id}`);
    };
  }, [user, realtime, loadNotifications, handleNotificationUpdate]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      log.error('Error marking notification as read', error, { component: 'useRealtimeNotifications', notificationId: id });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      log.error('Error marking all notifications as read', error, { component: 'useRealtimeNotifications' });
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      log.error('Error deleting notification', error, { component: 'useRealtimeNotifications', notificationId: id });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading
  };
};