import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users,
  CheckCircle2,
  Loader2,
  Gift,
  Heart,
  MessageSquare,
  Trophy,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export const ContributorPlans: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const handleSubscribe = async (trialDays?: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to become a contributor.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          type: 'subscription',
          trialDays: trialDays || 7,
          promoCode: promoCode || undefined
        }
      });

      if (error) throw error;

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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Become a Contributor
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join our community of knowledge sharers. Browse for free, contribute for just <span className="font-bold text-primary">$1.97/month</span>.
        </p>
      </div>

      {/* Free vs Contributor Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-muted rounded-full mb-2">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Free Access</CardTitle>
            <div className="text-3xl font-bold">
              $0
              <span className="text-sm font-normal text-muted-foreground">/forever</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Browse all facts and discoveries</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Search and filter content</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Vote and react to facts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Read all content</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Contributor Plan */}
        <Card className="relative border-primary shadow-lg">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="px-3 py-1 bg-primary">Recommended</Badge>
          </div>
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-primary/10 rounded-full mb-2">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Contributor</CardTitle>
            <div className="text-3xl font-bold">
              $1.97
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              7-day free trial
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xs text-muted-foreground mb-3">Everything in Free, plus:</div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Submit facts and discoveries</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Comment and interact with others</span>
              </li>
              <li className="flex items-start gap-2">
                <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Participate in gamification</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Help maintain quality content</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Join the contributor community</span>
              </li>
            </ul>
            <Button
              onClick={() => handleSubscribe(7)}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Start Free Trial
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

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

      {/* Why Contribute Section */}
      <Card>
        <CardHeader>
          <CardTitle>Why Become a Contributor?</CardTitle>
          <CardDescription>
            Help us maintain quality content and build a thriving community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Quality Control
              </h4>
              <p className="text-sm text-muted-foreground">
                By requiring a small subscription for contributions, we reduce spam and ensure high-quality content from dedicated community members.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Community Building
              </h4>
              <p className="text-sm text-muted-foreground">
                Contributors get access to exclusive features that help build connections and foster meaningful discussions around historical discoveries.
              </p>
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
            <h4 className="font-semibold">Why do you charge for contributions?</h4>
            <p className="text-sm text-muted-foreground">
              The small fee helps us prevent spam and maintain high-quality content. It ensures that contributors are genuinely interested in sharing valuable knowledge.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have contributor access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">What happens after the free trial?</h4>
            <p className="text-sm text-muted-foreground">
              After your 7-day free trial, you'll be automatically charged $1.97/month. You can cancel before the trial ends to avoid charges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Is all content free to read?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! All content remains free to browse, search, and read. The subscription only enables you to contribute your own discoveries and interact with the community.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};