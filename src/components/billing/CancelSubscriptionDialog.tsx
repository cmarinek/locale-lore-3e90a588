import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentPeriodEnd?: string;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
  currentPeriodEnd,
}: CancelSubscriptionDialogProps) {
  const [cancelType, setCancelType] = useState<'period_end' | 'immediately'>('period_end');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'cancel',
          immediate: cancelType === 'immediately',
        },
      });

      if (error) throw error;

      toast.success(
        cancelType === 'immediately'
          ? 'Subscription cancelled successfully'
          : 'Subscription will be cancelled at the end of the billing period'
      );
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Subscription
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>Are you sure you want to cancel your subscription?</p>
            
            <RadioGroup value={cancelType} onValueChange={(value: any) => setCancelType(value)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="period_end" id="period_end" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="period_end" className="font-medium cursor-pointer">
                      Cancel at period end
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your subscription will remain active until{' '}
                      {currentPeriodEnd
                        ? new Date(currentPeriodEnd).toLocaleDateString()
                        : 'the end of your billing period'}
                      . You can reactivate anytime before then.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="immediately" id="immediately" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="immediately" className="font-medium cursor-pointer">
                      Cancel immediately
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your subscription will be cancelled right away and you'll lose access immediately.
                      No refund will be issued for the remaining period.
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You'll receive a confirmation email</li>
                <li>You can reactivate before cancellation takes effect</li>
                <li>Your data will be preserved for 30 days</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
