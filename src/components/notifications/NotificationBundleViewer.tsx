import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Bell, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NotificationBundle {
  id: string;
  category: string;
  notification_count: number;
  is_collapsed: boolean;
  is_read: boolean;
  last_activity_at: string;
  created_at: string;
}

export const NotificationBundleViewer: React.FC = () => {
  const { user } = useAuth();
  const [bundles, setBundles] = useState<NotificationBundle[]>([]);
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBundles();
      subscribeToUpdates();
    }
  }, [user]);

  const fetchBundles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_bundles')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      setBundles(data || []);
    } catch (error) {
      console.error('Error fetching notification bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!user) return;

    const channel = supabase
      .channel('notification_bundles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_bundles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBundles();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const toggleBundle = (bundleId: string) => {
    setExpandedBundles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bundleId)) {
        newSet.delete(bundleId);
      } else {
        newSet.add(bundleId);
      }
      return newSet;
    });
  };

  const markBundleAsRead = async (bundleId: string) => {
    try {
      const { error } = await supabase
        .from('notification_bundles')
        .update({ is_read: true })
        .eq('id', bundleId);

      if (error) throw error;

      setBundles(prev =>
        prev.map(bundle =>
          bundle.id === bundleId ? { ...bundle, is_read: true } : bundle
        )
      );

      toast({
        title: "Marked as read",
        description: "Bundle notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking bundle as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark bundle as read",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    return <Bell className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading bundles...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notification Bundles</h2>
      
      {bundles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No notification bundles
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {bundles.map(bundle => (
              <Card key={bundle.id} className={bundle.is_read ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(bundle.category)}
                      <div>
                        <CardTitle className="text-lg">{bundle.category}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {bundle.notification_count} notifications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!bundle.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markBundleAsRead(bundle.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleBundle(bundle.id)}
                      >
                        {expandedBundles.has(bundle.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {expandedBundles.has(bundle.id) && (
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Last activity: {new Date(bundle.last_activity_at).toLocaleString()}
                      </p>
                      <Badge variant={bundle.is_collapsed ? "secondary" : "default"}>
                        {bundle.is_collapsed ? "Collapsed" : "Expanded"}
                      </Badge>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
