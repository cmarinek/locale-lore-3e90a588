import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Check, Trash2, ExternalLink, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return '❤️';
    case 'comment':
      return '💬';
    case 'achievement':
      return '🏆';
    case 'level_up':
      return '⬆️';
    case 'reward_redeemed':
      return '🎁';
    case 'friend_request':
      return '👋';
    case 'fact_featured':
      return '⭐';
    default:
      return '🔔';
  }
};

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto py-1 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {recentNotifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b',
                  !notification.read_at && 'bg-primary/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-tight">
                        {notification.title}
                      </p>
                      {!notification.read_at && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.body}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {notification.action_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        {!notification.read_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center cursor-pointer"
          onClick={() => {
            navigate('/notifications');
            setOpen(false);
          }}
        >
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
