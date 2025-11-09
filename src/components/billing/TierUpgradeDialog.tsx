import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface TierUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: string;
  onSuccess?: () => void;
}

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$19.99',
    features: ['Basic features', 'Email support', 'Up to 10 users'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$29.99',
    features: ['All Basic features', 'Priority support', 'Up to 50 users', 'Advanced analytics'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49.99',
    features: ['All Premium features', '24/7 support', 'Unlimited users', 'Custom integrations'],
  },
];

export function TierUpgradeDialog({
  open,
  onOpenChange,
  currentTier,
  onSuccess,
}: TierUpgradeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(currentTier);

  const handleUpgrade = async () => {
    if (selectedTier === currentTier) {
      toast.error('Please select a different tier');
      return;
    }

    setLoading(true);

    try {
      const action = getTierLevel(selectedTier) > getTierLevel(currentTier) ? 'upgrade' : 'downgrade';
      
      const { error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action,
          tier: selectedTier,
        },
      });

      if (error) throw error;

      toast.success(`Successfully ${action}d to ${selectedTier} tier!`, {
        description: 'Your subscription has been updated with prorated billing.',
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error changing tier:', error);
      toast.error(error.message || 'Failed to change tier');
    } finally {
      setLoading(false);
    }
  };

  const getTierLevel = (tier: string) => {
    const levels = { basic: 1, premium: 2, pro: 3 };
    return levels[tier as keyof typeof levels] || 0;
  };

  const isUpgrade = getTierLevel(selectedTier) > getTierLevel(currentTier);
  const isDowngrade = getTierLevel(selectedTier) < getTierLevel(currentTier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Change Subscription Tier
          </DialogTitle>
          <DialogDescription>
            Select a new tier for your subscription. Changes will be prorated automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex items-start space-x-3 rounded-lg border p-4 ${
                  selectedTier === tier.id ? 'border-primary bg-primary/5' : 'border-border'
                } ${currentTier === tier.id ? 'opacity-60' : ''}`}
              >
                <RadioGroupItem value={tier.id} id={tier.id} disabled={currentTier === tier.id} />
                <div className="flex-1">
                  <Label htmlFor={tier.id} className="flex items-center gap-2 cursor-pointer">
                    <span className="font-semibold">{tier.name}</span>
                    <span className="text-muted-foreground">{tier.price}/month</span>
                    {currentTier === tier.id && (
                      <Badge variant="secondary" className="ml-2">
                        Current
                      </Badge>
                    )}
                  </Label>
                  <ul className="mt-2 space-y-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </RadioGroup>

          {isUpgrade && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-800 dark:text-green-200">
              <strong>Upgrade:</strong> You'll be charged the prorated difference immediately.
            </div>
          )}

          {isDowngrade && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-800 dark:text-blue-200">
              <strong>Downgrade:</strong> The change will take effect at your next billing date, and you'll receive a prorated credit.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={loading || selectedTier === currentTier}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm ${isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Change'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
