import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/utils/logger';

/**
 * Deletion Cancellation Component
 * 
 * Displays pending account deletion request and allows user to cancel it
 * during the 30-day grace period.
 */
export const DeletionCancellation: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deletionRequest, setDeletionRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    checkDeletionRequest();
  }, [user]);

  const checkDeletionRequest = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setDeletionRequest(data);
    } catch (error: any) {
      log.error('Failed to check deletion request', error, { component: 'DeletionCancellation' });
    } finally {
      setLoading(false);
    }
  };

  const cancelDeletion = async () => {
    if (!deletionRequest) return;

    setCanceling(true);
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('id', deletionRequest.id);

      if (error) throw error;

      toast({
        title: "Deletion cancelled",
        description: "Your account will not be deleted. You can continue using the service.",
      });

      setDeletionRequest(null);
    } catch (error: any) {
      log.error('Failed to cancel deletion', error, { component: 'DeletionCancellation' });
      toast({
        title: "Cancellation failed",
        description: "Failed to cancel deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  if (loading || !deletionRequest) return null;

  const scheduledDate = new Date(deletionRequest.scheduled_deletion);
  const daysRemaining = Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Account Deletion Scheduled
        </CardTitle>
        <CardDescription>
          Your account is scheduled to be permanently deleted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">
                Your account will be permanently deleted on {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString()}
              </p>
              <p className="text-sm">
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining to cancel this request
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span className="font-semibold">Grace Period Information</span>
          </div>
          <p className="text-sm text-muted-foreground">
            During the grace period, you can still use your account normally. 
            If you change your mind, you can cancel the deletion request at any time before the scheduled date.
          </p>
          {deletionRequest.reason && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-semibold">Deletion reason:</span> {deletionRequest.reason}
            </p>
          )}
        </div>

        <Button
          onClick={cancelDeletion}
          disabled={canceling}
          variant="outline"
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          {canceling ? 'Cancelling...' : 'Cancel Deletion Request'}
        </Button>
      </CardContent>
    </Card>
  );
};
