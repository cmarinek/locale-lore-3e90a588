import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { MapPin, Bell, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LocationTrigger {
  id: string;
  fact_id: string;
  notification_title: string;
  notification_body: string;
  trigger_radius: number;
  is_active: boolean;
  max_triggers_per_user: number | null;
  created_at: string;
  facts?: {
    title: string;
    location_name: string;
  };
}

export const LocationTriggerManager: React.FC = () => {
  const { user } = useAuth();
  const [triggers, setTriggers] = useState<LocationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fact_id: '',
    notification_title: '',
    notification_body: '',
    trigger_radius: '100',
    max_triggers_per_user: '1',
  });

  useEffect(() => {
    if (user) {
      fetchTriggers();
    }
  }, [user]);

  const fetchTriggers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('location_triggers')
        .select(`
          *,
          facts (
            title,
            location_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error('Error fetching location triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTrigger = async () => {
    if (!user) return;

    const { fact_id, notification_title, notification_body, trigger_radius, max_triggers_per_user } = form;

    if (!fact_id || !notification_title || !notification_body) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      // Get fact location for trigger
      const { data: factData, error: factError } = await supabase
        .from('facts')
        .select('latitude, longitude')
        .eq('id', fact_id)
        .single();

      if (factError) throw factError;

      if (!factData.latitude || !factData.longitude) {
        toast({
          title: "Error",
          description: "Selected fact must have a location",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('location_triggers')
        .insert({
          fact_id,
          notification_title,
          notification_body,
          trigger_location: `POINT(${factData.longitude} ${factData.latitude})`,
          trigger_radius: parseInt(trigger_radius),
          max_triggers_per_user: max_triggers_per_user ? parseInt(max_triggers_per_user) : null,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location trigger created successfully",
      });

      setForm({
        fact_id: '',
        notification_title: '',
        notification_body: '',
        trigger_radius: '100',
        max_triggers_per_user: '1',
      });

      setShowForm(false);
      fetchTriggers();
    } catch (error) {
      console.error('Error creating location trigger:', error);
      toast({
        title: "Error",
        description: "Failed to create location trigger",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleTrigger = async (triggerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('location_triggers')
        .update({ is_active: !isActive })
        .eq('id', triggerId);

      if (error) throw error;

      setTriggers(prev =>
        prev.map(trigger =>
          trigger.id === triggerId ? { ...trigger, is_active: !isActive } : trigger
        )
      );

      toast({
        title: "Updated",
        description: `Trigger ${!isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling trigger:', error);
      toast({
        title: "Error",
        description: "Failed to update trigger",
        variant: "destructive",
      });
    }
  };

  const deleteTrigger = async (id: string) => {
    try {
      const { error } = await supabase
        .from('location_triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTriggers(prev => prev.filter(trigger => trigger.id !== id));

      toast({
        title: "Deleted",
        description: "Location trigger deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast({
        title: "Error",
        description: "Failed to delete trigger",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Location Triggers</CardTitle>
              <CardDescription>
                Send notifications when users visit specific locations
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Create Trigger'}
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="space-y-4 border-t pt-6">
            <div className="space-y-2">
              <Label htmlFor="fact_id">Fact ID</Label>
              <Input
                id="fact_id"
                value={form.fact_id}
                onChange={e => setForm({ ...form, fact_id: e.target.value })}
                placeholder="Enter fact ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_title">Notification Title</Label>
              <Input
                id="notification_title"
                value={form.notification_title}
                onChange={e => setForm({ ...form, notification_title: e.target.value })}
                placeholder="Enter notification title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_body">Notification Message</Label>
              <Textarea
                id="notification_body"
                value={form.notification_body}
                onChange={e => setForm({ ...form, notification_body: e.target.value })}
                placeholder="Enter notification message"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trigger_radius">Trigger Radius (meters)</Label>
                <Input
                  id="trigger_radius"
                  type="number"
                  value={form.trigger_radius}
                  onChange={e => setForm({ ...form, trigger_radius: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_triggers_per_user">Max Triggers Per User</Label>
                <Input
                  id="max_triggers_per_user"
                  type="number"
                  value={form.max_triggers_per_user}
                  onChange={e => setForm({ ...form, max_triggers_per_user: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>

            <Button
              onClick={createTrigger}
              disabled={creating}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Create Trigger
                </>
              )}
            </Button>
          </CardContent>
        )}
      </Card>

      {triggers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Triggers</CardTitle>
            <CardDescription>
              {triggers.length} location trigger{triggers.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {triggers.map(trigger => (
              <div
                key={trigger.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4" />
                    <p className="font-medium">{trigger.notification_title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {trigger.notification_body}
                  </p>
                  {trigger.facts && (
                    <p className="text-xs text-muted-foreground">
                      {trigger.facts.title} • {trigger.facts.location_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Radius: {trigger.trigger_radius}m • Max triggers: {trigger.max_triggers_per_user || '∞'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={trigger.is_active}
                    onCheckedChange={() => toggleTrigger(trigger.id, trigger.is_active)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTrigger(trigger.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
