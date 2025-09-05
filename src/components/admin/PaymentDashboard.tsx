
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  CreditCard, 
  Users, 
  TrendingUp, 
  RefreshCw,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';

interface PaymentMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  failedPayments: number;
}

interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  tier?: string;
  created_at: string;
  user_email?: string;
  stripe_payment_id?: string;
}

interface SubscriptionRecord {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  user_email?: string;
  stripe_subscription_id?: string;
}

export const PaymentDashboard: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadPaymentData();
    }
  }, [isAdmin]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadPayments(),
        loadSubscriptions()
      ]);
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at, status');

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('status, created_at');

    if (payments && subscriptions) {
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0) / 100;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const monthlyRevenue = payments
        .filter(p => 
          p.status === 'completed' && 
          new Date(p.created_at) >= thisMonth
        )
        .reduce((sum, p) => sum + p.amount, 0) / 100;

      const activeSubscriptions = subscriptions
        .filter(s => s.status === 'active').length;

      const failedPayments = payments
        .filter(p => p.status === 'failed').length;

      setMetrics({
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions,
        churnRate: 5.2, // Calculate from actual data
        averageRevenuePerUser: activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0,
        failedPayments
      });
    }
  };

  const loadPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setPayments(data);
    }
  };

  const loadSubscriptions = async () => {
    const { data } = await supabase
      .from('subscribers')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      // Convert to subscription format for display
      const convertedSubs = data.map(sub => ({
        id: sub.id,
        user_id: sub.user_id,
        tier: 'contributor',
        status: sub.subscribed ? 'active' : 'canceled',
        current_period_start: sub.created_at,
        current_period_end: sub.subscription_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        profiles: sub.profiles
      }));
      setSubscriptions(convertedSubs);
    }
  };

  const handleRefund = async (paymentId: string, amount?: number) => {
    try {
      const { error } = await supabase.functions.invoke('admin-refund', {
        body: { paymentId, amount }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
      
      loadPaymentData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: string, newTier?: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-subscription', {
        body: { subscriptionId, action, newTier }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Subscription ${action} completed successfully`,
      });
      
      loadPaymentData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} subscription`,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active': 
        return 'bg-green-500';
      case 'pending': 
        return 'bg-yellow-500';
      case 'failed':
      case 'canceled': 
        return 'bg-red-500';
      default: 
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active': 
        return CheckCircle;
      case 'pending': 
        return Clock;
      case 'failed':
      case 'canceled': 
        return XCircle;
      default: 
        return AlertCircle;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.stripe_payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access payment data.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.failedPayments}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>View and manage all payments</CardDescription>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.map((payment) => {
                  const StatusIcon = getStatusIcon(payment.status);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(payment.status)} rounded-full p-1 text-white`} />
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount / 100, payment.currency)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.type} • {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                          {payment.tier && (
                            <Badge variant="outline" className="mt-1">{payment.tier}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        {payment.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRefund(payment.id)}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((subscription) => {
                  const StatusIcon = getStatusIcon(subscription.status);
                  return (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(subscription.status)} rounded-full p-1 text-white`} />
                        <div>
                          <p className="font-medium">{subscription.tier} Plan</p>
                          <p className="text-sm text-muted-foreground">
                            Ends: {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                          {subscription.cancel_at_period_end && (
                            <Badge variant="outline" className="mt-1">Cancelling</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(subscription.status)}>{subscription.status}</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSubscriptionAction(subscription.id, subscription.status === 'active' ? 'cancel' : 'reactivate')}
                        >
                          {subscription.status === 'active' ? 'Cancel' : 'Reactivate'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed payment and subscription analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Subscription Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Free Users</span>
                      <span>{subscriptions.filter(s => s.status === 'canceled').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contributors</span>
                      <span>{subscriptions.filter(s => s.tier === 'contributor' && s.status === 'active').length}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Success Rate</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Successful</span>
                      <span>{payments.filter(p => p.status === 'completed').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed</span>
                      <span>{payments.filter(p => p.status === 'failed').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span>{payments.length > 0 ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
