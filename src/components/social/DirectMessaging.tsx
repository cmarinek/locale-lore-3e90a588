
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DirectMessage, MessageThread } from '@/types/social';
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
  CheckCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DirectMessagingProps {
  recipientId?: string;
  onClose?: () => void;
}

export const DirectMessaging: React.FC<DirectMessagingProps> = ({ 
  recipientId,
  onClose 
}) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [currentThread, setCurrentThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadMessageThreads();
    }
  }, [user]);

  useEffect(() => {
    if (recipientId && user) {
      findOrCreateThread(recipientId);
    }
  }, [recipientId, user]);

  useEffect(() => {
    if (currentThread) {
      loadMessages();
    }
  }, [currentThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessageThreads = () => {
    if (!user) return;

    try {
      // Mock data for now
      const mockThreads: MessageThread[] = [
        {
          id: '1',
          participants: [
            {
              id: 'user1',
              username: 'explorer123',
              avatar_url: '/placeholder.svg',
              bio: 'Love discovering new places!',
              followers_count: 156,
              following_count: 89,
              reputation_score: 850,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          last_message: {
            id: 'msg1',
            sender_id: 'user1',
            recipient_id: user.id,
            content: 'Hey! Found an amazing hidden waterfall today',
            message_type: 'text',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          unread_count: 2,
          updated_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setThreads(mockThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const findOrCreateThread = (otherUserId: string) => {
    // Find existing thread or create new one
    const existingThread = threads.find(t => 
      t.participants.some(p => p.id === otherUserId)
    );

    if (existingThread) {
      setCurrentThread(existingThread);
    } else {
      // Create new thread (mock for now)
      const newThread: MessageThread = {
        id: Date.now().toString(),
        participants: [
          {
            id: otherUserId,
            username: 'newuser',
            avatar_url: '/placeholder.svg',
            bio: '',
            followers_count: 0,
            following_count: 0,
            reputation_score: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        unread_count: 0,
        updated_at: new Date().toISOString()
      };
      
      setCurrentThread(newThread);
    }
  };

  const loadMessages = () => {
    if (!currentThread) return;

    try {
      // Mock messages for now
      const mockMessages: DirectMessage[] = [
        {
          id: '1',
          sender_id: currentThread.participants[0].id,
          recipient_id: user!.id,
          content: 'Hey! Found an amazing hidden waterfall today',
          message_type: 'text',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: currentThread.participants[0]
        },
        {
          id: '2',
          sender_id: user!.id,
          recipient_id: currentThread.participants[0].id,
          content: 'That sounds incredible! Where is it?',
          message_type: 'text',
          created_at: new Date(Date.now() - 3500000).toISOString(),
          read_at: new Date(Date.now() - 3400000).toISOString()
        },
        {
          id: '3',
          sender_id: currentThread.participants[0].id,
          recipient_id: user!.id,
          content: 'It\'s about 20 minutes hike from the main trail. Want me to share the exact location?',
          message_type: 'text',
          created_at: new Date(Date.now() - 3000000).toISOString()
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentThread || !user || sending) return;

    setSending(true);
    try {
      const message: DirectMessage = {
        id: Date.now().toString(),
        sender_id: user.id,
        recipient_id: currentThread.participants[0].id,
        content: newMessage,
        message_type: 'text',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-96 border rounded-lg overflow-hidden">
      {/* Threads List */}
      <div className="w-1/3 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Messages</h3>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search messages..."
              className="pl-9"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {threads.map((thread) => (
              <motion.button
                key={thread.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentThread(thread)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  currentThread?.id === thread.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={thread.participants[0]?.avatar_url} />
                      <AvatarFallback>
                        {thread.participants[0]?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {thread.participants[0]?.username}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {thread.last_message && formatDistanceToNow(
                          new Date(thread.last_message.created_at), 
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                    
                    {thread.last_message && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {thread.last_message.content}
                      </p>
                    )}
                  </div>
                  
                  {thread.unread_count > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                      {thread.unread_count}
                    </Badge>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentThread.participants[0]?.avatar_url} />
                    <AvatarFallback>
                      {currentThread.participants[0]?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {currentThread.participants[0]?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwn 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                            {isOwn && (
                              message.read_at ? 
                                <CheckCheck className="w-3 h-3" /> : 
                                <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MapPin className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="pr-12"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    size="sm"
                    className="absolute right-1 top-1 bottom-1"
                  >
                    <Send className="w-4 h-4" />
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
