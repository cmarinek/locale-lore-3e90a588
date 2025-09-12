import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';

interface TicketMessage {
  id: string;
  message: string;
  is_staff_reply: boolean;
  created_at: string;
  user_id: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  user_name: string;
}

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  onClose,
  ticket
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  React.useEffect(() => {
    if (ticket?.id && isOpen) {
      loadMessages();
    }
  }, [ticket?.id, isOpen]);

  const loadMessages = async () => {
    if (!ticket) return;
    
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load ticket messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !user || !newMessage.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('support_ticket_messages')
        .insert([{
          ticket_id: ticket.id,
          user_id: user.id,
          message: newMessage.trim(),
          is_staff_reply: false
        }]);

      if (error) throw error;

      setNewMessage('');
      loadMessages();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {ticket.subject}
          </DialogTitle>
          <DialogDescription>
            Ticket #{ticket.id.slice(0, 8)} • Created {new Date(ticket.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {/* Ticket Info */}
        <div className="flex items-center gap-2 mb-4">
          <Badge className={`${getStatusColor(ticket.status)} text-white`}>
            {ticket.status}
          </Badge>
          <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
            {ticket.priority} priority
          </Badge>
          <Badge variant="outline">
            {ticket.category}
          </Badge>
        </div>

        {/* Original Description */}
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{ticket.user_name}</span>
            <span className="text-sm text-muted-foreground">
              • {new Date(ticket.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm">{ticket.description}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[200px] max-h-[400px]">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.is_staff_reply
                    ? 'bg-primary/10 border-l-4 border-l-primary ml-4'
                    : 'bg-muted/50 mr-4'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.is_staff_reply ? (
                    <>
                      <Badge variant="default" className="text-xs">Staff</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3" />
                      <span className="text-xs font-medium">{ticket.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm">{message.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation below.</p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="space-y-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Typical response time: 24-48 hours</span>
            </div>
            <Button type="submit" disabled={!newMessage.trim() || loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};