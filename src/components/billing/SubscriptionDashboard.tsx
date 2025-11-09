import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';
import {
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
  Settings,
  X,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { PaymentMethodForm } from './PaymentMethodForm';
import { PaymentMethodDisplay } from './PaymentMethodDisplay';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';
import { TierUpgradeDialog } from './TierUpgradeDialog';
import { InvoiceList } from './InvoiceList';

interface Subscription {
  id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancel_at_period_end?: boolean;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export function SubscriptionDashboard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [managingPayment, setManagingPayment] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      setSubscription(data);
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'create_portal_session' },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error managing subscription:', error);
      toast.error(error.message || 'Failed to open billing portal');
    }
  };

  const handleReactivate = async () => {
    try {
      const { error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'reactivate' },
      });

      if (error) throw error;

      toast.success('Subscription reactivated successfully!');
      fetchSubscriptionData();
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast.error(error.message || 'Failed to reactivate subscription');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <DollarSign className="h-4 w-4" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No Active Subscription</p>
          <p className="text-sm text-muted-foreground">Subscribe to unlock all features</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </div>
            <Badge className={getStatusColor(subscription.status)}>
              {getStatusIcon(subscription.status)}
              <span className="ml-1 capitalize">{subscription.status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="text-2xl font-bold capitalize">{subscription.tier}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Period Start</p>
              <p className="text-lg">{format(new Date(subscription.current_period_start), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
              <p className="text-lg">{format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Subscription Cancelling</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Your subscription will end on {format(new Date(subscription.current_period_end), 'MMMM dd, yyyy')}. You can reactivate anytime before this date.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleManageSubscription} variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
            <Button onClick={() => setShowUpgradeDialog(true)} variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Change Tier
            </Button>
            {subscription?.status === 'active' && !subscription?.cancel_at_period_end ? (
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                <X className="mr-2 h-4 w-4" />
                Cancel Subscription
              </Button>
            ) : subscription?.cancel_at_period_end ? (
              <Button onClick={handleReactivate} className="bg-green-600 hover:bg-green-700">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reactivate Subscription
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentMethodDisplay />
          
          {!managingPayment ? (
            <Button variant="outline" onClick={() => setManagingPayment(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Update Payment Method
            </Button>
          ) : (
            <div className="space-y-4">
              <Elements stripe={getStripe()}>
                <PaymentMethodForm
                  onSuccess={() => {
                    setManagingPayment(false);
                    toast.success('Payment method updated successfully');
                  }}
                />
              </Elements>
              <Button variant="ghost" onClick={() => setManagingPayment(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Overview
          </CardTitle>
          <CardDescription>Your activity this billing period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">API Requests</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <InvoiceList />

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Your payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant={payment.status === 'succeeded' ? 'default' : 'destructive'}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
          )}
        </CardContent>
      </Card>

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onSuccess={fetchSubscriptionData}
        currentPeriodEnd={subscription?.current_period_end}
      />
      
      <TierUpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentTier={subscription?.tier || 'basic'}
        onSuccess={fetchSubscriptionData}
      />
    </div>
  );
}
