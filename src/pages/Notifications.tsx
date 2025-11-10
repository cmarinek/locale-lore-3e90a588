import { useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Trash2, Check, CheckCheck, Filter } from 'lucide-react';
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

export function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read_at) return false;
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    return true;
  });

  const categories = ['all', ...Array.from(new Set(notifications.map((n) => n.category)))];

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-md px-3 py-1 text-sm bg-background"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">No notifications to display</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    'hover:shadow-md transition-shadow cursor-pointer',
                    !notification.read_at && 'border-primary/50 bg-primary/5'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.body}
                            </p>
                          </div>
                          {!notification.read_at && (
                            <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3">
            {filteredNotifications.filter(n => !n.read_at).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">All caught up! No unread notifications.</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.filter(n => !n.read_at).map((notification) => (
                <Card
                  key={notification.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border-primary/50 bg-primary/5"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.body}
                            </p>
                          </div>
                          <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0 mt-1" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default Notifications;
