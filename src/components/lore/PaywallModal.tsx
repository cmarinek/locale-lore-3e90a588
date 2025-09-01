import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/ios-badge';
import { Crown, Zap, Check, X } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'premium' | 'pro') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onUpgrade
}) => {
  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      icon: Crown,
      features: [
        'Unlimited lore submissions',
        'Rich text editor with markdown',
        'High-quality media uploads',
        'Interactive map selection',
        'Auto-save functionality',
        'Basic AI suggestions'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      icon: Zap,
      features: [
        'Everything in Premium',
        'Advanced AI-powered suggestions',
        'Priority review and verification',
        'Collaboration tools',
        'Analytics and insights',
        'Custom categories'
      ],
      popular: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6">
          <DialogHeader className="text-center space-y-4">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Unlock Premium Lore Submission
            </DialogTitle>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join our community of contributors and share your historical discoveries with advanced tools and features.
            </p>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`relative p-6 ${plan.popular ? 'ring-2 ring-primary ring-opacity-50 bg-card/50 backdrop-blur' : 'bg-card/30 backdrop-blur'}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="text-center space-y-4 mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <plan.icon className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1 mt-2">
                        <span className="text-3xl font-bold text-primary">{plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => onUpgrade(plan.id as 'premium' | 'pro')}
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'variant-outline'}`}
                    size="lg"
                  >
                    Choose {plan.name}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Free users can browse and vote on lore, but submissions require a subscription.
            </p>
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};