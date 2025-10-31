import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { DirectMessage, MessageThread, UserProfile as SocialUserProfile } from '@/types/social';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Image as ImageIcon,
  MapPin,
  Check,
  CheckCheck,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface DirectMessagingProps {
  recipientId?: string;
  onClose?: () => void;
}

const normalizeProfile = (profile: Partial<SocialUserProfile> & { id: string; username: string }): SocialUserProfile => ({
  id: profile.id,
  username: profile.username,
  avatar_url: profile.avatar_url ?? undefined,
  bio: profile.bio ?? undefined,
  followers_count: profile.followers_count ?? 0,
  following_count: profile.following_count ?? 0,
  reputation_score: profile.reputation_score ?? 0,
  created_at: profile.created_at ?? new Date().toISOString(),
  updated_at: profile.updated_at ?? new Date().toISOString(),
});

const safeNormalizeProfile = (profile: any): SocialUserProfile | undefined => {
  if (!profile || typeof profile !== 'object' || !profile.id || !profile.username) {
    return undefined;
  }
  return normalizeProfile(profile as Partial<SocialUserProfile> & { id: string; username: string });
};

export const DirectMessaging: React.FC<DirectMessagingProps> = ({ recipientId, onClose }) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SocialUserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingRecipientRef = useRef<string | null>(recipientId ?? null);

  const currentThread = useMemo(
    () => (currentThreadId ? threads.find((thread) => thread.thread_id === currentThreadId) ?? null : null),
    [threads, currentThreadId]
  );

  useEffect(() => {
    if (user) {
      loadMessageThreads();
    }
  }, [user]);

  useEffect(() => {
    if (recipientId) {
      pendingRecipientRef.current = recipientId;
      if (threads.length > 0) {
        attemptToOpenRecipientThread(recipientId, threads);
      }
    }
  }, [recipientId, threads.length]);

  useEffect(() => {
    if (threads.length === 0 || !pendingRecipientRef.current || !user) return;
    attemptToOpenRecipientThread(pendingRecipientRef.current, threads);
  }, [threads, user]);

  useEffect(() => {
    if (!currentThreadId) {
      setMessages([]);
      return;
    }
    loadMessages(currentThreadId);
  }, [currentThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const inboxChannel = supabase
      .channel(`dm-inbox-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `recipient_id=eq.${user.id}`,
      }, async (payload) => {
        await loadMessageThreads({ silent: true });
        const threadId = (payload.new as { thread_id: string }).thread_id;
        if (threadId === currentThreadId) {
          await loadMessages(threadId, { forceRefresh: true });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(inboxChannel);
    };
  }, [user, currentThreadId]);

  useEffect(() => {
    if (!currentThreadId) return;

    const threadChannel = supabase
      .channel(`dm-thread-${currentThreadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `thread_id=eq.${currentThreadId}`,
      }, async () => {
        await loadMessageThreads({ silent: true });
        await loadMessages(currentThreadId, { forceRefresh: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(threadChannel);
    };
  }, [currentThreadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const attemptToOpenRecipientThread = async (targetId: string, currentThreads: MessageThread[]) => {
    if (!user) return;

    const existing = currentThreads.find((thread) => thread.participant.id === targetId);
    if (existing) {
      setCurrentThreadId(existing.thread_id);
      pendingRecipientRef.current = null;
      return;
    }

    const newThreadId = await ensureThreadWithUser(targetId);
    if (newThreadId) {
      setCurrentThreadId(newThreadId);
      pendingRecipientRef.current = null;
    }
  };

  const ensureThreadWithUser = async (targetUserId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('get_or_create_direct_message_thread', {
        target_user: targetUserId,
      });

      if (error) throw error;

      const threadId = data as string;
      await loadMessageThreads({ silent: true });
      return threadId;
    } catch (error) {
      console.error('Error creating message thread:', error);
      toast({
        title: 'Unable to start conversation',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const loadMessageThreads = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!user) {
      setThreads([]);
      setLoadingThreads(false);
      return [] as MessageThread[];
    }

    try {
      if (!silent) {
        setLoadingThreads(true);
      }

      const { data, error } = await supabase.rpc('get_direct_message_threads');
      if (error) throw error;

      const mapped = (data ?? []).map((item: any) => {
        const participant = normalizeProfile({
          id: item.participant_id,
          username: item.participant_username,
          avatar_url: item.participant_avatar_url,
          bio: item.participant_bio,
          followers_count: item.participant_followers,
          following_count: item.participant_following,
          reputation_score: item.participant_reputation,
          created_at: item.participant_created_at,
          updated_at: item.participant_updated_at,
        });

        const lastMessage = item.last_message_id
          ? {
              id: item.last_message_id,
              thread_id: item.thread_id,
              sender_id: item.last_message_sender ?? participant.id,
              recipient_id:
                item.last_message_sender && user.id && item.last_message_sender === user.id
                  ? participant.id
                  : user.id,
              content: item.last_message_content ?? '',
              message_type: (item.last_message_type ?? 'text') as DirectMessage['message_type'],
              created_at: item.last_message_at ?? item.updated_at,
              read_at: undefined,
            }
          : undefined;

        return {
          thread_id: item.thread_id,
          participant,
          last_message: lastMessage,
          unread_count: Number(item.unread_count ?? 0),
          updated_at: item.updated_at,
        } satisfies MessageThread;
      });

      setThreads(mapped);
      return mapped;
    } catch (error) {
      console.error('Error loading threads:', error);
      toast({
        title: 'Unable to load messages',
        description: 'Check your connection and try again.',
        variant: 'destructive',
      });
      return [] as MessageThread[];
    } finally {
      if (!silent) {
        setLoadingThreads(false);
      }
    }
  };

  const loadMessages = async (threadId: string, options: { forceRefresh?: boolean } = {}) => {
    if (!user) return;

    try {
      if (!options.forceRefresh) {
        setLoadingMessages(true);
      }

      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          thread_id,
          sender_id,
          recipient_id,
          content,
          message_type,
          created_at,
          read_at,
          sender:profiles!direct_messages_sender_id_fkey (
            id,
            username,
            avatar_url,
            bio,
            followers_count,
            following_count,
            reputation_score,
            created_at,
            updated_at
          ),
          recipient:profiles!direct_messages_recipient_id_fkey (
            id,
            username,
            avatar_url,
            bio,
            followers_count,
            following_count,
            reputation_score,
            created_at,
            updated_at
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const normalized = (data ?? []).map((message) => ({
        id: message.id,
        thread_id: message.thread_id,
        sender_id: message.sender_id,
        recipient_id: message.recipient_id ?? undefined,
        content: message.content,
        message_type: message.message_type as DirectMessage['message_type'],
        created_at: message.created_at,
        read_at: message.read_at ?? undefined,
        sender: safeNormalizeProfile(message.sender),
        recipient: safeNormalizeProfile(message.recipient),
      }));

      setMessages(normalized);
      await markThreadAsRead(threadId);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Unable to load conversation',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('direct_message_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('user_id', user.id);

      setThreads((previous) =>
        previous.map((thread) =>
          thread.thread_id === threadId ? { ...thread, unread_count: 0 } : thread
        )
      );
    } catch (error) {
      console.error('Failed to update read state:', error);
    }
  };

  const handleThreadSelect = (thread: MessageThread) => {
    setCurrentThreadId(thread.thread_id);
  };

  const handleSearchChange = async (value: string) => {
    setSearchTerm(value);

    if (!value.trim() || value.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    if (!user) return;

    try {
      setSearchLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, followers_count, following_count, reputation_score, created_at, updated_at')
        .ilike('username', `%${value.trim()}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;

      const normalized = (data ?? []).map((profile) =>
        normalizeProfile({
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          followers_count: profile.followers_count ?? 0,
          following_count: profile.following_count ?? 0,
          reputation_score: profile.reputation_score ?? 0,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        })
      );

      setSearchResults(normalized);
    } catch (error) {
      console.error('Error searching profiles:', error);
      toast({
        title: 'Search failed',
        description: 'Unable to look up profiles right now.',
        variant: 'destructive',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const startConversation = async (profile: SocialUserProfile) => {
    const existing = threads.find((thread) => thread.participant.id === profile.id);

    if (existing) {
      setCurrentThreadId(existing.thread_id);
      setSearchTerm('');
      setSearchResults([]);
      await markThreadAsRead(existing.thread_id);
      return;
    }

    const threadId = await ensureThreadWithUser(profile.id);
    if (threadId) {
      setCurrentThreadId(threadId);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentThread || !user || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          thread_id: currentThread.thread_id,
          sender_id: user.id,
          recipient_id: currentThread.participant.id,
          content: newMessage.trim(),
          message_type: 'text',
        })
        .select(`
          id,
          thread_id,
          sender_id,
          recipient_id,
          content,
          message_type,
          created_at,
          read_at,
          sender:profiles!direct_messages_sender_id_fkey (
            id,
            username,
            avatar_url,
            bio,
            followers_count,
            following_count,
            reputation_score,
            created_at,
            updated_at
          ),
          recipient:profiles!direct_messages_recipient_id_fkey (
            id,
            username,
            avatar_url,
            bio,
            followers_count,
            following_count,
            reputation_score,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) throw error;

      const message: DirectMessage = {
        id: data.id,
        thread_id: data.thread_id,
        sender_id: data.sender_id,
        recipient_id: data.recipient_id ?? undefined,
        content: data.content,
        message_type: data.message_type as DirectMessage['message_type'],
        created_at: data.created_at,
        read_at: data.read_at ?? undefined,
        sender: safeNormalizeProfile(data.sender),
        recipient: safeNormalizeProfile(data.recipient),
      };

      setMessages((previous) => [...previous, message]);
      setNewMessage('');
      await markThreadAsRead(currentThread.thread_id);
      await loadMessageThreads({ silent: true });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message not sent',
        description: 'We could not deliver that message. Please retry.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <Card className="h-96">
        <CardContent className="flex flex-col items-center justify-center h-full gap-4">
          <CardTitle className="text-center text-lg">Sign in to send messages</CardTitle>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Create an account or sign in to start conversations with fellow explorers.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingThreads && threads.length === 0) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading your conversations…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-96 border rounded-lg overflow-hidden">
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Messages</h3>
            {onClose ? (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" disabled>
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search people…"
              className="pl-9"
            />
          </div>

          {searchTerm && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching…
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No profiles match “{searchTerm}”.
                </p>
              ) : (
                searchResults.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => startConversation(profile)}
                    className="w-full flex items-center gap-3 p-2 rounded-md bg-background hover:bg-muted transition-colors text-left"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{profile.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.followers_count.toLocaleString()} followers · Reputation {profile.reputation_score}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Message
                    </Button>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          {loadingThreads ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Start a conversation to see it appear here.
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {threads.map((thread) => {
                const isActive = currentThreadId === thread.thread_id;

                return (
                  <motion.button
                    key={thread.thread_id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThreadSelect(thread)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={thread.participant.avatar_url} />
                          <AvatarFallback>
                            {thread.participant.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {thread.participant.username}
                          </p>
                          {thread.last_message && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(thread.last_message.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>

                        {thread.last_message ? (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {thread.last_message.content}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            Start the conversation
                          </p>
                        )}
                      </div>

                      {thread.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-[1.25rem] text-xs">
                          {thread.unread_count}
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {currentThread ? (
          <>
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={currentThread.participant.avatar_url} />
                    <AvatarFallback>
                      {currentThread.participant.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{currentThread.participant.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Reputation {currentThread.participant.reputation_score.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" disabled>
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled>
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled>
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading conversation…
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user.id;

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isOwn ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            <div
                              className={`flex items-center justify-end mt-1 space-x-1 ${
                                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}
                            >
                              <span className="text-xs">
                                {formatDistanceToNow(new Date(message.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                              {isOwn && (
                                message.read_at ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" disabled>
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled>
                  <MapPin className="w-4 h-4" />
                </Button>

                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message…"
                    className="pr-12"
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    size="icon"
                    className="absolute right-1 top-1 bottom-1"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Send className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

