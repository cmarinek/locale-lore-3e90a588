import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useRealtime } from './useRealtime';
import { log } from '@/utils/logger';

interface UserPresence {
  user_id: string;
  username?: string;
  avatar_url?: string;
  status: 'online' | 'away' | 'busy';
  location?: {
    fact_id?: string;
    page?: string;
    lat?: number;
    lng?: number;
  };
  last_seen: string;
}

interface PresenceHookReturn {
  presences: Map<string, UserPresence[]>;
  isOnline: boolean;
  setStatus: (status: 'online' | 'away' | 'busy') => void;
  setLocation: (location: UserPresence['location']) => void;
  getUsersInLocation: (factId: string) => UserPresence[];
  getTotalOnlineUsers: () => number;
}

export const useRealtimePresence = (
  channelName: string = 'global-presence'
): PresenceHookReturn => {
  const { user } = useAuth();
  const [presences, setPresences] = useState<Map<string, UserPresence[]>>(new Map());
  const [currentStatus, setCurrentStatus] = useState<'online' | 'away' | 'busy'>('online');
  const [currentLocation, setCurrentLocation] = useState<UserPresence['location']>();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const realtime = useRealtime({
    enabled: !!user,
    onConnect: () => log.info('Presence realtime connected', { component: 'useRealtimePresence' }),
    onDisconnect: () => log.info('Presence realtime disconnected', { component: 'useRealtimePresence' }),
  });

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle presence sync
  const handlePresenceSync = useCallback((presenceData: any) => {
    const presenceMap = new Map<string, UserPresence[]>();
    
    Object.entries(presenceData).forEach(([key, presenceArray]: [string, any]) => {
      if (Array.isArray(presenceArray)) {
        presenceMap.set(key, presenceArray);
      }
    });
    
    setPresences(presenceMap);
  }, []);

  // Handle user join
  const handlePresenceJoin = useCallback((key: string, newPresences: any[]) => {
    log.debug('User joined presence', { component: 'useRealtimePresence', key, count: newPresences.length });
    setPresences(prev => {
      const next = new Map(prev);
      next.set(key, newPresences);
      return next;
    });
  }, []);

  // Handle user leave
  const handlePresenceLeave = useCallback((key: string, leftPresences: any[]) => {
    log.debug('User left presence', { component: 'useRealtimePresence', key, count: leftPresences.length });
    setPresences(prev => {
      const next = new Map(prev);
      if (leftPresences.length === 0) {
        next.delete(key);
      } else {
        next.set(key, leftPresences);
      }
      return next;
    });
  }, []);

  // Set up presence tracking
  useEffect(() => {
    if (!user || !realtime) return;

    const channel = realtime.subscribeToPresence(
      channelName,
      handlePresenceSync,
      handlePresenceJoin,
      handlePresenceLeave
    );

    if (channel) {
      // Track current user presence
      const trackUserPresence = async () => {
        const presenceData: UserPresence = {
          user_id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          status: currentStatus,
          location: currentLocation,
          last_seen: new Date().toISOString()
        };

        try {
          await realtime.trackPresence(channelName, presenceData);
        } catch (error) {
          log.error('Error tracking presence', error, { component: 'useRealtimePresence', channel: channelName });
        }
      };

      trackUserPresence();

      // Update presence every 30 seconds to maintain heartbeat
      const heartbeat = setInterval(trackUserPresence, 30000);

      // Handle page visibility changes
      const handleVisibilityChange = () => {
        const newStatus = document.hidden ? 'away' : 'online';
        setCurrentStatus(newStatus);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(heartbeat);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        realtime.untrackPresence(channelName);
      };
    }
  }, [user, realtime, channelName, currentStatus, currentLocation, handlePresenceSync, handlePresenceJoin, handlePresenceLeave]);

  // Update presence when status or location changes
  useEffect(() => {
    if (!user || !realtime) return;

    const presenceData: UserPresence = {
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      status: currentStatus,
      location: currentLocation,
      last_seen: new Date().toISOString()
    };

    realtime.trackPresence(channelName, presenceData).catch((error) => 
      log.error('Error updating presence', error, { component: 'useRealtimePresence', channel: channelName })
    );
  }, [user, realtime, channelName, currentStatus, currentLocation]);

  const setStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    setCurrentStatus(status);
  }, []);

  const setLocation = useCallback((location: UserPresence['location']) => {
    setCurrentLocation(location);
  }, []);

  const getUsersInLocation = useCallback((factId: string): UserPresence[] => {
    const users: UserPresence[] = [];
    
    presences.forEach((presenceArray) => {
      presenceArray.forEach((presence) => {
        if (presence.location?.fact_id === factId) {
          users.push(presence);
        }
      });
    });
    
    return users;
  }, [presences]);

  const getTotalOnlineUsers = useCallback((): number => {
    let count = 0;
    presences.forEach((presenceArray) => {
      count += presenceArray.filter(p => p.status === 'online').length;
    });
    return count;
  }, [presences]);

  return {
    presences,
    isOnline,
    setStatus,
    setLocation,
    getUsersInLocation,
    getTotalOnlineUsers
  };
};