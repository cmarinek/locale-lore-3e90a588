
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Crown, 
  Star, 
  Zap, 
  CheckCircle2,
  Loader2,
  Gift
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const subscriptionTiers = [
    {
      id: 'basic',
      name: 'Basic Contributor',
      price: '$9.99',
      priceAmount: 999,
      icon: Star,
      features: [
        'Submit up to 50 facts per month',
        'Basic search functionality',
        'Standard support',
        'Mobile app access',
        'Comment on facts',
      ],
      trial: true,
    },
    {
      id: 'premium',
      name: 'Premium Contributor',
      price: '$19.99',
      priceAmount: 1999,
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
      trial: true,
    },
    {
      id: 'pro',
      name: 'Pro Contributor',
      price: '$29.99',
      priceAmount: 2999,
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
      trial: true,
    },
  ];

  const handleSubscribe = async (tier: string, trialDays?: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          tier,
          type: 'subscription',
          trialDays: trialDays || 14,
          promoCode: promoCode || undefined
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOneTimePayment = async (feature: string, amount: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a purchase.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          tier: feature,
          type: 'payment'
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Promo Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Have a promo code?
          </CardTitle>
          <CardDescription>
            Enter your promotional code to get a discount on your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-sm">
            <div className="flex-1">
              <Label htmlFor="promo">Promo Code</Label>
              <Input
                id="promo"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {subscriptionTiers.map((tier) => {
          const Icon = tier.icon;
          
          return (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                tier.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-3 py-1">Most Popular</Badge>
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
                {tier.trial && (
                  <Badge variant="secondary" className="mt-2">
                    14-day free trial
                  </Badge>
                )}
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
                  onClick={() => handleSubscribe(tier.id, tier.trial ? 14 : undefined)}
                  disabled={loading}
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Start {tier.trial ? 'Free Trial' : 'Subscription'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* One-time Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>One-time Purchases</CardTitle>
          <CardDescription>
            Unlock specific features without a subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Premium Feature Pack</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Unlock advanced search, custom themes, and priority support for lifetime
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">$49.99</span>
                <Button
                  onClick={() => handleOneTimePayment('premium_feature', 4999)}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get detailed insights and reporting on your contributions
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">$99.99</span>
                <Button
                  onClick={() => handleOneTimePayment('advanced_analytics', 9999)}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">What happens after the free trial?</h4>
            <p className="text-sm text-muted-foreground">
              After your 14-day free trial, you'll be automatically charged for your selected plan. You can cancel before the trial ends to avoid charges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Can I upgrade or downgrade my plan?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can change your plan at any time from your billing dashboard. Changes take effect immediately with prorated billing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
