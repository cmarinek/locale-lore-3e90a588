import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/ios-badge';
import { Users, Check, Heart, MessageSquare, Trophy, Shield } from 'lucide-react';

interface ContributorPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const ContributorPaywall: React.FC<ContributorPaywallProps> = ({
  isOpen,
  onClose,
  onUpgrade
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6">
          <DialogHeader className="text-center space-y-4">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Join Our Community of Contributors
            </DialogTitle>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Help us maintain quality content and foster meaningful discussions. All for just <span className="font-bold text-primary">$1.97/month</span>.
            </p>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <Card className="relative p-6 border-primary shadow-lg bg-card/50 backdrop-blur">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                Contributor Access
              </Badge>
              
              <div className="text-center space-y-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-foreground">Contributor</h3>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-3xl font-bold text-primary">$1.97</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    7-day free trial
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  Everything free users get, plus:
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Submit facts and discoveries</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">Comment and interact with others</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">Participate in gamification</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">Help maintain quality content</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">Join the contributor community</span>
                </div>
              </div>

              <Button
                onClick={onUpgrade}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Users className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
            </Card>
          </motion.div>

          <div className="mt-8 space-y-4">
            <div className="bg-card/30 backdrop-blur rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                Keep Everything Free to Read
              </h4>
              <p className="text-sm text-muted-foreground">
                All content remains completely free to browse, search, and read. We believe knowledge should be accessible to everyone.
              </p>
            </div>
            
            <div className="bg-card/30 backdrop-blur rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Quality Over Quantity
              </h4>
              <p className="text-sm text-muted-foreground">
                The small contribution fee helps us prevent spam and ensures our community is filled with genuine knowledge sharers.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              You can browse and vote on all content for free. Contributors can submit and interact.
            </p>
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
              Continue browsing for free
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};