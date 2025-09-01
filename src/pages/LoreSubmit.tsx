import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { LoreSubmissionWizard } from '@/components/lore/LoreSubmissionWizard';
import { PaywallModal } from '@/components/lore/PaywallModal';
import { Card } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/templates/MainLayout';
import { Crown, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  tier: 'free' | 'premium' | 'pro';
  canSubmit: boolean;
}

const LoreSubmit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: 'free',
    canSubmit: false
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
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      setSubscriptionStatus(data);
      
      // Show paywall if user can't submit
      if (!data.canSubmit) {
        setShowPaywall(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'premium' | 'pro') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading submission form...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!subscriptionStatus.canSubmit) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <PaywallModal 
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            onUpgrade={handleUpgrade}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Header */}
        <div className="bg-background/80 backdrop-blur border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Submit New Lore</h1>
                <p className="text-muted-foreground">Share your historical discoveries with the world</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="flex items-center gap-1">
                  {subscriptionStatus.tier === 'pro' ? (
                    <Zap className="w-3 h-3" />
                  ) : (
                    <Crown className="w-3 h-3" />
                  )}
                  {subscriptionStatus.tier} contributor
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoreSubmissionWizard subscriptionTier={subscriptionStatus.tier} />
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoreSubmit;