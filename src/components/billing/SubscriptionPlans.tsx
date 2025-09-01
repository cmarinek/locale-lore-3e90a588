
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Star, 
  Zap, 
  Check, 
  Calendar,
  CreditCard,
  Gift,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface SubscriptionPlansProps {
  currentTier?: string;
  onSubscriptionChange?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentTier,
  onSubscriptionChange
}) => {
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showTrial, setShowTrial] = useState(true);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Contributor',
      price: 9.99,
      icon: Star,
      description: 'Perfect for casual contributors',
      features: [
        'Submit up to 50 facts per month',
        'Basic search functionality',
        'Mobile app access',
        'Community support',
        'Basic analytics',
      ],
      limitations: ['Limited submissions', 'No priority support'],
    },
    {
      id: 'premium',
      name: 'Premium Contributor',
      price: 19.99,
      icon: Crown,
      description: 'Most popular for active contributors',
      popular: true,
      features: [
        'Unlimited fact submissions',
        'Advanced search and filters',
        'Priority support',
        'Early access to new features',
        'Custom profile themes',
        'Enhanced discovery radius',
        'Detailed analytics dashboard',
        'Export data capabilities',
      ],
      limitations: [],
    },
    {
      id: 'pro',
      name: 'Pro Contributor',
      price: 29.99,
      icon: Zap,
      description: 'For professional users and organizations',
      features: [
        'All Premium features',
        'Advanced analytics dashboard',
        'API access (1000 calls/month)',
        'White-label options',
        'Dedicated account manager',
        'Custom integrations',
        'Bulk import/export tools',
        'Advanced collaboration tools',
        'Priority review queue',
      ],
      limitations: [],
    },
  ];

  const oneTimeFeatures = [
    {
      id: 'premium_feature',
      name: 'Premium Feature Pack',
      price: 4.99,
      description: 'Unlock advanced features for lifetime',
      features: ['Advanced search filters', 'Custom themes', 'Enhanced maps'],
    },
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      price: 9.99,
      description: 'Detailed insights and reporting',
      features: ['Detailed statistics', 'Export reports', 'Usage insights'],
    },
  ];

  const handleSubscribe = async (planId: string, type: 'subscription' | 'one_time' = 'subscription') => {
    setLoading(true);
    try {
      const payload: any = { tier: planId, type };
      
      if (type === 'subscription' && showTrial) {
        payload.trialDays = 14;
      }
      
      if (promoCode) {
        payload.promoCode = promoCode;
      }

      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: payload
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to checkout",
        description: `Opening ${type === 'subscription' ? 'subscription' : 'payment'} checkout...`,
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Trial and Promo Code Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Special Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="trial"
              checked={showTrial}
              onChange={(e) => setShowTrial(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="trial">Start with 14-day free trial</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="promo">Promotional Code</Label>
            <Input
              id="promo"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">Select the perfect plan for your contribution needs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentTier === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`relative transition-all duration-200 hover:shadow-lg ${
                    plan.popular ? 'border-primary shadow-lg scale-105' : ''
                  } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="px-3 py-1">Most Popular</Badge>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary">Current Plan</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 bg-primary/10 rounded-full mb-2">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                    {showTrial && !isCurrentPlan && (
                      <Badge variant="outline" className="w-fit mx-auto">
                        <Calendar className="h-3 w-3 mr-1" />
                        14-day free trial
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Limitations:</p>
                          <ul className="space-y-1">
                            {plan.limitations.map((limitation, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                • {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading || isCurrentPlan}
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscribe to {plan.name}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* One-time Features */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">One-time Features</h3>
          <p className="text-muted-foreground">Unlock premium features with a single purchase</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          {oneTimeFeatures.map((feature) => (
            <Card key={feature.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
                <div className="text-2xl font-bold text-primary">
                  ${feature.price}
                  <span className="text-sm font-normal text-muted-foreground"> one-time</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(feature.id, 'one_time')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Purchase Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
