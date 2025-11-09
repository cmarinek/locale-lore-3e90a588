import React, { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import mapboxgl from 'mapbox-gl';

interface UserPresence {
  user_id: string;
  username: string;
  color: string;
  lat: number;
  lng: number;
  cursor_x?: number;
  cursor_y?: number;
  online_at: string;
}

interface CollaborativeMarkersProps {
  map: mapboxgl.Map | null;
  channelName?: string;
}

export const CollaborativeMarkers: React.FC<CollaborativeMarkersProps> = ({
  map,
  channelName = 'map_collaboration'
}) => {
  const { user } = useAuth();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [otherUsers, setOtherUsers] = useState<Map<string, UserPresence>>(new Map());
  const markersRef = React.useRef<Map<string, mapboxgl.Marker>>(new Map());
  const cursorElementsRef = React.useRef<Map<string, HTMLDivElement>>(new Map());

  // Generate consistent color for user
  const getUserColor = useCallback((userId: string) => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(142, 76%, 36%)',
      'hsl(221, 83%, 53%)',
      'hsl(262, 83%, 58%)',
      'hsl(340, 82%, 52%)'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);

  // Create cursor element
  const createCursorElement = useCallback((presence: UserPresence) => {
    const el = document.createElement('div');
    el.className = 'collaborative-cursor';
    el.style.cssText = `
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${presence.color};
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: none;
      z-index: 1000;
      transition: all 0.2s ease;
    `;

    const label = document.createElement('div');
    label.textContent = presence.username;
    label.style.cssText = `
      position: absolute;
      top: 20px;
      left: 0;
      white-space: nowrap;
      background: ${presence.color};
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    el.appendChild(label);

    return el;
  }, []);

  // Create marker element
  const createMarkerElement = useCallback((presence: UserPresence) => {
    const el = document.createElement('div');
    el.className = 'collaborative-marker';
    el.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${presence.color};
      border: 3px solid white;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      animation: pulse 2s infinite;
    `;

    const avatar = document.createElement('div');
    avatar.textContent = presence.username.charAt(0).toUpperCase();
    avatar.style.cssText = `
      color: white;
      font-weight: bold;
      font-size: 14px;
    `;
    el.appendChild(avatar);

    return el;
  }, []);

  // Update marker position
  const updateMarker = useCallback((presence: UserPresence) => {
    if (!map) return;

    const existingMarker = markersRef.current.get(presence.user_id);
    
    if (existingMarker) {
      existingMarker.setLngLat([presence.lng, presence.lat]);
    } else {
      const markerEl = createMarkerElement(presence);
      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([presence.lng, presence.lat])
        .addTo(map);
      
      markersRef.current.set(presence.user_id, marker);
    }
  }, [map, createMarkerElement]);

  // Remove marker
  const removeMarker = useCallback((userId: string) => {
    const marker = markersRef.current.get(userId);
    if (marker) {
      marker.remove();
      markersRef.current.delete(userId);
    }

    const cursorEl = cursorElementsRef.current.get(userId);
    if (cursorEl && cursorEl.parentNode) {
      cursorEl.parentNode.removeChild(cursorEl);
      cursorElementsRef.current.delete(userId);
    }
  }, []);

  // Handle mouse move on map
  const handleMouseMove = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!channel || !user) return;

    const { lng, lat } = e.lngLat;
    const point = e.point;

    channel.track({
      user_id: user.id,
      username: user.email?.split('@')[0] || user.id.slice(0, 8),
      color: getUserColor(user.id),
      lat,
      lng,
      cursor_x: point.x,
      cursor_y: point.y,
      online_at: new Date().toISOString()
    });
  }, [channel, user, getUserColor]);

  // Setup realtime channel
  useEffect(() => {
    if (!user || !map) return;

    const newChannel = supabase.channel(channelName);

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        const users = new Map<string, UserPresence>();

        Object.entries(state).forEach(([key, presences]) => {
          const presence = presences[0] as unknown as UserPresence;
          if (presence.user_id !== user.id) {
            users.set(presence.user_id, presence);
            updateMarker(presence);
          }
        });

        // Remove markers for users who left
        markersRef.current.forEach((_, userId) => {
          if (!users.has(userId) && userId !== user.id) {
            removeMarker(userId);
          }
        });

        setOtherUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presence = newPresences[0] as unknown as UserPresence;
        if (presence.user_id !== user.id) {
          updateMarker(presence);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const presence = leftPresences[0] as unknown as UserPresence;
        if (presence.user_id !== user.id) {
          removeMarker(presence.user_id);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await newChannel.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || user.id.slice(0, 8),
            color: getUserColor(user.id),
            lat: map.getCenter().lat,
            lng: map.getCenter().lng,
            online_at: new Date().toISOString()
          });
        }
      });

    setChannel(newChannel);

    // Add mouse move listener
    map.on('mousemove', handleMouseMove);

    return () => {
      map.off('mousemove', handleMouseMove);
      newChannel.unsubscribe();
      
      // Clean up all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      
      cursorElementsRef.current.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      cursorElementsRef.current.clear();
    };
  }, [user, map, channelName, getUserColor, handleMouseMove, updateMarker, removeMarker]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          50% {
            box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 20px currentColor;
          }
        }
      `}</style>
      <div className="absolute top-4 left-4 z-10">
        {otherUsers.size > 0 && (
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Online Users ({otherUsers.size})
            </div>
            <div className="flex flex-col gap-1">
              {Array.from(otherUsers.values()).map(presence => (
                <div key={presence.user_id} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: presence.color }}
                  />
                  <span className="text-xs text-foreground">{presence.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
