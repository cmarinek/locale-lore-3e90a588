import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const { enabled = true, onConnect, onDisconnect, onError } = options;
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleConnect = () => {
      if (!isConnectedRef.current) {
        isConnectedRef.current = true;
        onConnect?.();
      }
    };

    const handleDisconnect = () => {
      if (isConnectedRef.current) {
        isConnectedRef.current = false;
        onDisconnect?.();
      }
    };

    // Monitor connection status
    const connectionMonitor = setInterval(() => {
      try {
        const status = (supabase.realtime as any)?.connection?.readyState;
        if (status === WebSocket.OPEN) {
          handleConnect();
        } else if (status === WebSocket.CLOSED || status === WebSocket.CLOSING) {
          handleDisconnect();
        }
      } catch (error) {
        // Ignore connection monitoring errors
      }
    }, 1000);

    return () => {
      clearInterval(connectionMonitor);
      // Clean up all channels
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, [enabled, onConnect, onDisconnect]);

  const subscribe = (
    channelName: string,
    config: {
      event: string;
      schema?: string;
      table?: string;
      filter?: string;
    },
    callback: (payload: any) => void
  ): RealtimeChannel | null => {
    if (!enabled) return null;

    // Remove existing channel if it exists
    const existingChannel = channelsRef.current.get(channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', config as any, callback)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to ${channelName}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Error subscribing to ${channelName}`);
            onError?.(`Failed to subscribe to ${channelName}`);
          }
        });

      channelsRef.current.set(channelName, channel);
      return channel;
    } catch (error) {
      console.error(`Error creating channel ${channelName}:`, error);
      onError?.(error);
      return null;
    }
  };

  const unsubscribe = (channelName: string) => {
    const channel = channelsRef.current.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      channelsRef.current.delete(channelName);
    }
  };

  const subscribeToPresence = (
    channelName: string,
    onSync: (presences: any) => void,
    onJoin: (key: string, newPresences: any) => void,
    onLeave: (key: string, leftPresences: any) => void
  ): RealtimeChannel | null => {
    if (!enabled) return null;

    try {
      const channel = supabase
        .channel(channelName)
        .on('presence', { event: 'sync' }, () => {
          const presences = channel.presenceState();
          onSync(presences);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          onJoin(key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          onLeave(key, leftPresences);
        })
        .subscribe();

      channelsRef.current.set(channelName, channel);
      return channel;
    } catch (error) {
      console.error(`Error creating presence channel ${channelName}:`, error);
      onError?.(error);
      return null;
    }
  };

  const trackPresence = (channelName: string, data: any) => {
    const channel = channelsRef.current.get(channelName);
    if (channel) {
      return channel.track(data);
    }
    return Promise.reject(new Error('Channel not found'));
  };

  const untrackPresence = (channelName: string) => {
    const channel = channelsRef.current.get(channelName);
    if (channel) {
      return channel.untrack();
    }
    return Promise.reject(new Error('Channel not found'));
  };

  return {
    subscribe,
    unsubscribe,
    subscribeToPresence,
    trackPresence,
    untrackPresence,
    isConnected: isConnectedRef.current
  };
};