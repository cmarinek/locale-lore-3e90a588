import React from 'react';
import { LoreSubmissionWizard } from '@/components/lore/LoreSubmissionWizard';
import { MainLayout } from '@/components/templates/MainLayout';
import { PaywallModal } from '@/components/lore/PaywallModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Star, Shield, Zap, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  subscribed: boolean;
  tier: 'free' | 'premium' | 'pro';
  canSubmit: boolean;
}

export const Submit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: 'free',
    canSubmit: true
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkSubscription();
  }, [user, navigate]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { user_id: user?.id }
      });

      if (error) throw error;

      const status: SubscriptionStatus = {
        subscribed: data.subscribed || false,
        tier: data.tier || 'free',
        canSubmit: data.can_submit !== false
      };

      setSubscriptionStatus(status);

      if (!status.canSubmit) {
        setShowPaywall(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Default to allowing submission on error
      setSubscriptionStatus({
        subscribed: false,
        tier: 'free',
        canSubmit: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          user_id: user?.id,
          price_id: 'price_premium' 
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking your submission privileges...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (showPaywall) {
    return (
      <MainLayout>
        <PaywallModal 
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          onUpgrade={handleUpgrade}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/explore')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Explore
              </Button>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Share Your Story
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Contribute to our global collection of local lore. Share historical facts, 
              legends, ghost stories, or interesting trivia about places you know.
            </p>

            {/* Subscription Tier Badge */}
            <div className="flex justify-center mb-8">
              <Badge 
                variant={subscriptionStatus.tier === 'free' ? 'secondary' : 'default'}
                className="px-4 py-2 text-sm"
              >
                {subscriptionStatus.tier === 'free' && <Star className="w-4 h-4 mr-2" />}
                {subscriptionStatus.tier === 'premium' && <Shield className="w-4 h-4 mr-2" />}
                {subscriptionStatus.tier === 'pro' && <Zap className="w-4 h-4 mr-2" />}
                {subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)} Member
              </Badge>
            </div>
          </motion.div>

          {/* Submission Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="p-6 text-center bg-card/50 backdrop-blur">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Preserve History</h3>
              <p className="text-sm text-muted-foreground">
                Help preserve local stories and cultural heritage for future generations
              </p>
            </Card>

            <Card className="p-6 text-center bg-card/50 backdrop-blur">
              <Star className="w-8 h-8 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Build Reputation</h3>
              <p className="text-sm text-muted-foreground">
                Gain recognition in the community and build your contributor reputation
              </p>
            </Card>

            <Card className="p-6 text-center bg-card/50 backdrop-blur">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Verified Content</h3>
              <p className="text-sm text-muted-foreground">
                Your submissions will be reviewed and verified by our community
              </p>
            </Card>
          </motion.div>

          {/* Submission Wizard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LoreSubmissionWizard subscriptionTier={subscriptionStatus.tier} />
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};