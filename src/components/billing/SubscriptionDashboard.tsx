
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Settings, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';

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
  type: string;
  created_at: string;
  tier?: string;
}

export const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Convert subscribers data to subscription format
      if (data && data.subscribed) {
        setSubscription({
          id: data.id,
          tier: 'contributor',
          status: 'active',
          current_period_start: data.created_at,
          current_period_end: data.subscription_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else {
        setSubscription(null);
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async (action: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        toast({
          title: "Success",
          description: `Subscription ${action} completed successfully.`,
        });
        fetchSubscriptionData();
      }
    } catch (error: any) {
      console.error('Subscription management error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to manage subscription",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trialing': return 'bg-blue-500';
      case 'past_due': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'trialing': return Clock;
      case 'past_due': 
      case 'canceled': return AlertCircle;
      default: return Clock;
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {subscription ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
                <CardDescription>Manage your active subscription</CardDescription>
              </div>
              <Badge className={`${getStatusColor(subscription.status)} text-white`}>
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-2xl font-bold capitalize">{subscription.tier}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                <p className="text-lg font-semibold">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>

            {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Trial ends on {new Date(subscription.trial_end).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}

            {subscription.cancel_at_period_end && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your subscription will be canceled at the end of the current billing period.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex gap-2 flex-wrap">
                 <Button
                onClick={() => handleManageSubscription('portal')}
                disabled={actionLoading}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're currently on the free plan. Become a contributor to submit content and join discussions.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Facts Submitted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Comments Posted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {payment.type === 'recurring' ? 'Subscription Payment' : 'One-time Purchase'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                        {payment.tier && ` • ${payment.tier}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No payment history found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
