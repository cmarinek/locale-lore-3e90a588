import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';

interface RealtimeContextType {
  isConnected: boolean;
  onlineUsers: string[];
  factLikes: Record<string, number>;
  factComments: Record<string, any[]>;
  likeFact: (factId: string) => Promise<void>;
  addComment: (factId: string, comment: string) => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [factLikes, setFactLikes] = useState<Record<string, number>>({});
  const [factComments, setFactComments] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!user) return;

    // Subscribe to presence
    const presenceChannel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.keys(state);
        setOnlineUsers(users);
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        toast.success(`${newPresences[0]?.username || 'Someone'} joined`);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        toast.info(`${leftPresences[0]?.username || 'Someone'} left`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            username: user.user_metadata?.username || 'Anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });

    // Subscribe to fact interactions
    const factsChannel = supabase.channel('fact-interactions')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'votes' },
        (payload) => {
          const { fact_id } = payload.new as any;
          setFactLikes(prev => ({
            ...prev,
            [fact_id]: (prev[fact_id] || 0) + 1
          }));
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const { fact_id } = payload.new as any;
          setFactComments(prev => ({
            ...prev,
            [fact_id]: [...(prev[fact_id] || []), payload.new]
          }));
        }
      )
      .subscribe();

    return () => {
      presenceChannel.unsubscribe();
      factsChannel.unsubscribe();
    };
  }, [user]);

  const likeFact = async (factId: string) => {
    if (!user) return;
    
    try {
      await supabase.from('votes').insert({
        fact_id: factId,
        user_id: user.id,
        is_upvote: true
      });
    } catch (error) {
      console.error('Error liking fact:', error);
    }
  };

  const addComment = async (factId: string, comment: string) => {
    if (!user) return;
    
    try {
      await supabase.from('comments').insert({
        fact_id: factId,
        author_id: user.id,
        content: comment.trim()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        onlineUsers,
        factLikes,
        factComments,
        likeFact,
        addComment
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};