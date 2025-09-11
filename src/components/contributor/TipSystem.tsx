
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart,
  Coffee,
  Star,
  DollarSign,
  Gift,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

interface TipSystemProps {
  discoveryId?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  showTipJar?: boolean;
}

export const TipSystem: React.FC<TipSystemProps> = ({
  discoveryId,
  recipientId,
  recipientName,
  recipientAvatar,
  showTipJar = false,
}) => {
  const { user } = useAuth();
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const suggestedAmounts = [1, 3, 5, 10, 25];

  const sendTip = async () => {
    if (!user || !tipAmount || parseFloat(tipAmount) <= 0) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-tip', {
        body: {
          recipient_id: recipientId,
          discovery_id: discoveryId,
          amount: parseFloat(tipAmount),
          currency: 'USD',
          message: tipMessage,
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data.checkout_url) {
        window.open(data.checkout_url, '_blank');
      }

      toast({
        title: "Tip initiated",
        description: "You'll be redirected to complete the payment.",
      });

      setShowTipDialog(false);
      setTipAmount('');
      setTipMessage('');
    } catch (error: any) {
      toast({
        title: "Tip failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || user.id === recipientId) return null;

  return (
    <>
      {showTipJar ? (
        <TipJarWidget recipientId={recipientId} recipientName={recipientName} />
      ) : (
        <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="w-4 h-4" />
              Tip
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={recipientAvatar} />
                  <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
                </Avatar>
                Tip {recipientName}
              </DialogTitle>
              <DialogDescription>
                Show appreciation for their great discovery with a tip
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Suggested Amounts */}
              <div className="space-y-2">
                <Label>Quick amounts</Label>
                <div className="grid grid-cols-5 gap-2">
                  {suggestedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={tipAmount === amount.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipAmount(amount.toString())}
                      className="h-12 flex flex-col gap-1"
                    >
                      <DollarSign className="w-3 h-3" />
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="0.00"
                    min="1"
                    max="100"
                    step="0.01"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Optional Message */}
              <div className="space-y-2">
                <Label htmlFor="tip-message">Message (optional)</Label>
                <Textarea
                  id="tip-message"
                  placeholder="Say something nice..."
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Tip Impact */}
              {tipAmount && parseFloat(tipAmount) > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Coffee className="w-4 h-4 text-orange-500" />
                    <span>Your ${tipAmount} tip is like buying {recipientName} {Math.ceil(parseFloat(tipAmount) / 5)} coffee{Math.ceil(parseFloat(tipAmount) / 5) > 1 ? 's' : ''}!</span>
                  </div>
                </motion.div>
              )}

              <Button 
                onClick={sendTip}
                disabled={!tipAmount || parseFloat(tipAmount) <= 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Send ${tipAmount || '0'} Tip
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const TipJarWidget: React.FC<{ recipientId: string; recipientName: string }> = ({
  recipientId,
  recipientName,
}) => {
  const [tipJarData, setTipJarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchTipJarData();
  }, [recipientId]);

  const fetchTipJarData = async () => {
    try {
      // Mock data for now until types are updated
      setTipJarData({
        id: 'mock',
        user_id: recipientId,
        display_name: 'Mock Tip Jar',
        description: 'Support this creator',
        suggested_amounts: [1, 3, 5, 10, 25],
        total_received: 0,
        tip_count: 0,
        is_enabled: true,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching tip jar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !tipJarData) return null;

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-600" />
          {tipJarData.display_name}
        </CardTitle>
        {tipJarData.description && (
          <CardDescription className="text-sm">
            {tipJarData.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Suggested amounts */}
          <div className="grid grid-cols-3 gap-2">
            {tipJarData.suggested_amounts?.map((amount: number) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="h-10 bg-white hover:bg-yellow-100"
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              ${tipJarData.total_received}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {tipJarData.tip_count} tips
            </span>
          </div>

          {tipJarData.custom_message && (
            <p className="text-xs text-muted-foreground italic">
              "{tipJarData.custom_message}"
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
