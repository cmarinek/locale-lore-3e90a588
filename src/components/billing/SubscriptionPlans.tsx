
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
import { useAuth } from '@/contexts/AuthProvider';

export const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const subscriptionTiers = React.useMemo(() => [
    {
      id: 'free',
      name: 'Free Explorer',
      price: 'Free',
      priceAmount: 0,
      icon: Star,
      features: [
        'Browse all facts and stories',
        'Explore interactive maps',
        'Search and discover content',
        'Read community contributions',
        'View photos and media',
        'Access mobile app',
      ],
      isFree: true,
    },
    {
      id: 'contributor',
      name: 'Contributor',
      price: '$4.97',
      priceAmount: 497,
      icon: Crown,
      features: [
        'Everything in Free, plus:',
        'Unlimited fact submissions',
        'Comment and discuss',
        'Vote on content',
        'Advanced search and filters',
        'Custom profile themes',
        'Enhanced discovery radius',
        'Priority support',
        'Export your data',
        'Early access to new features',
        'Analytics dashboard',
      ],
      popular: true,
      trial: true,
    },
  ], []);

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
          trialDays: trialDays || 3,
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
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
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
                  {!tier.isFree && (
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  )}
                </div>
                {tier.trial && (
                  <Badge variant="secondary" className="mt-2">
                    3-day free trial
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

                {tier.isFree ? (
                  <Button
                    disabled
                    className="w-full"
                    variant="outline"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(tier.id, tier.trial ? 3 : undefined)}
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
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">What's included in the free plan?</h4>
            <p className="text-sm text-muted-foreground">
              The free plan lets you explore everything - browse all facts, view maps, search content, and enjoy the full LocaleLore experience as a reader.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">What happens after the free trial?</h4>
            <p className="text-sm text-muted-foreground">
              After your 3-day free trial, you'll be automatically charged $4.97/month. You can cancel anytime before the trial ends to avoid charges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Cancel your Contributor subscription at any time. You'll continue to have access until the end of your billing period, then automatically return to the free plan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Why become a Contributor?</h4>
            <p className="text-sm text-muted-foreground">
              Contributors can submit unlimited facts, share their local knowledge, engage with the community, and help build the world's most comprehensive location-based storytelling platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
