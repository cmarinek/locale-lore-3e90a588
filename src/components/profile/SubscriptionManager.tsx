import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { log } from '@/utils/logger';
import { 
  Crown, 
  Star, 
  Zap, 
  Calendar,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SubscriptionInfo } from '@/hooks/useProfile';

interface SubscriptionManagerProps {
  subscription: SubscriptionInfo | null;
  onRefresh: () => void;
  loading: boolean;
}

export const SubscriptionManager = ({ subscription, onRefresh, loading }: SubscriptionManagerProps) => {
  const [actionLoading, setActionLoading] = useState(false);

  // Move icon references inside component with useMemo - v15
  const subscriptionTiers = useMemo(() => [
    {
      id: 'basic',
      name: 'Basic Contributor',
      price: '$9.99',
      icon: Star,
      features: [
        'Submit up to 50 facts per month',
        'Basic search functionality',
        'Standard support',
        'Mobile app access',
        'Comment on facts',
      ],
    },
    {
      id: 'premium',
      name: 'Premium Contributor',
      price: '$19.99',
      icon: Crown,
      features: [
        'Unlimited fact submissions',
        'Advanced search and filters',
        'Priority support',
        'Early access to new features',
        'Custom profile themes',
        'Enhanced discovery radius',
        'Export data',
      ],
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro Contributor',
      price: '$29.99',
      icon: Zap,
      features: [
        'All Premium features',
        'Advanced analytics dashboard',
        'API access',
        'White-label options',
        'Dedicated account manager',
        'Custom integrations',
        'Unlimited exports',
      ],
    },
  ], []);

  const handleSubscribe = async (tier: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          tier,
          type: 'subscription',
          trialDays: 14
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      log.error('Failed to create Stripe checkout', error, { component: 'SubscriptionManager' });
      toast({
        title: "Checkout failed",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      log.error('Failed to open Stripe customer portal', error, { component: 'SubscriptionManager' });
      toast({
        title: "Portal access failed",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getCurrentTier = () => {
    if (!subscription?.subscribed) return null;
    return subscriptionTiers.find(tier => 
      tier.name.toLowerCase() === subscription.subscription_tier?.toLowerCase()
    );
  };

  const currentTier = getCurrentTier();

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Subscription</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription.subscribed && currentTier ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <currentTier.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {currentTier.name} Plan
                      <Badge variant="secondary">Active</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {subscription.subscription_end && (
                        <>
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Renews on {new Date(subscription.subscription_end).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button
                    onClick={handleManageSubscription}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </Button>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don't have an active subscription. Choose a plan below to unlock premium features.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {subscriptionTiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrentPlan = currentTier?.id === tier.id;
          
          return (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                tier.popular ? 'border-primary shadow-lg' : ''
              } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-3 py-1">Most Popular</Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-primary/10 rounded-full mb-2">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{tier.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {tier.price}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={actionLoading || isCurrentPlan}
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Subscribe to {tier.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subscription Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Subscribe?</CardTitle>
          <CardDescription>
            Unlock the full potential of LocaleLore with premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Enhanced Discovery</h4>
                <p className="text-sm text-muted-foreground">
                  Access advanced search filters and expanded discovery radius
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Premium Support</h4>
                <p className="text-sm text-muted-foreground">
                  Get priority support and early access to new features
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};