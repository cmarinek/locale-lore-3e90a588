import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionStatusCardProps {
  isContributor: boolean;
  subscriptionStatus?: string;
  className?: string;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  isContributor,
  subscriptionStatus,
  className = ""
}) => {
  const navigate = useNavigate();

  if (isContributor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">Contributor</h3>
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share stories, create comments, and help build the community
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/billing')}
              className="shrink-0"
            >
              Manage
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="p-6 bg-gradient-to-br from-background to-accent/5 border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">Free Explorer</h3>
                <Badge variant="secondary">Free</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore stories, vote, and interact with the community
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/billing')}
            className="shrink-0 bg-primary hover:bg-primary/90"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            Unlock Contributor Benefits
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Submit your own local stories and legends</li>
            <li>• Create comments and engage in discussions</li>
            <li>• Build your contributor reputation</li>
            <li>• Access exclusive contributor features</li>
          </ul>
        </div>
      </Card>
    </motion.div>
  );
};