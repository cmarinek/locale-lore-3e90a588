import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Coins, ShoppingCart, Check, Lock } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost_points: number;
  reward_type: string;
  image_url?: string;
  is_one_time: boolean;
  metadata?: any;
}

interface UserReward {
  reward_id: string;
}

export function RewardsShop() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch available rewards
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards_catalog')
        .select('*')
        .eq('is_active', true)
        .order('cost_points', { ascending: true });

      if (error) throw error;
      return data as Reward[];
    },
  });

  // Fetch user's redeemed rewards
  const { data: userRewards = [] } = useQuery({
    queryKey: ['user-rewards', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_rewards')
        .select('reward_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserReward[];
    },
    enabled: !!user?.id,
  });

  // Fetch user's current points
  const { data: userLevel } = useQuery({
    queryKey: ['user-level', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_levels')
        .select('total_xp, available_points')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const currentPoints = userLevel?.available_points ?? userLevel?.total_xp ?? 0;

  // Redeem reward mutation
  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const { data, error } = await supabase.functions.invoke('redeem-reward', {
        body: { rewardId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Reward Redeemed! 🎉',
        description: `You've successfully redeemed ${data.reward}. ${data.remainingPoints} points remaining.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['user-level'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      setShowConfirmDialog(false);
      setSelectedReward(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Redemption Failed',
        description: error.message,
        variant: 'destructive',
      });
      setShowConfirmDialog(false);
    },
  });

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = () => {
    if (selectedReward) {
      redeemMutation.mutate(selectedReward.id);
    }
  };

  const isRewardOwned = (rewardId: string) => {
    return userRewards.some((ur) => ur.reward_id === rewardId);
  };

  const canAfford = (cost: number) => {
    return currentPoints >= cost;
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return '🏅';
      case 'title':
        return '👑';
      case 'avatar_border':
        return '🖼️';
      case 'feature_unlock':
        return '🔓';
      default:
        return '🎁';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Sign in to view and redeem rewards</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Points Balance</p>
                <p className="text-3xl font-bold">{currentPoints.toLocaleString()}</p>
              </div>
            </div>
            <ShoppingCart className="w-12 h-12 text-primary/30" />
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewardsLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Loading rewards...</p>
          </div>
        ) : rewards.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No rewards available at the moment</p>
          </div>
        ) : (
          rewards.map((reward) => {
            const owned = isRewardOwned(reward.id);
            const affordable = canAfford(reward.cost_points);

            return (
              <Card key={reward.id} className={owned ? 'border-primary/50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{getRewardIcon(reward.reward_type)}</div>
                    {owned && (
                      <Badge variant="default" className="gap-1">
                        <Check className="w-3 h-3" />
                        Owned
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Coins className="w-5 h-5" />
                    <span className="text-xl">{reward.cost_points.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleRedeemClick(reward)}
                    disabled={owned || !affordable || redeemMutation.isPending}
                    className="w-full"
                    variant={owned ? 'outline' : 'default'}
                  >
                    {owned ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Already Owned
                      </>
                    ) : !affordable ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Insufficient Points
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Redeem
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redeem <strong>{selectedReward?.name}</strong> for{' '}
              <strong>{selectedReward?.cost_points.toLocaleString()} points</strong>?
              <br />
              <br />
              You will have <strong>{(currentPoints - (selectedReward?.cost_points ?? 0)).toLocaleString()} points</strong> remaining.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={redeemMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRedeem}
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending ? 'Redeeming...' : 'Confirm Redemption'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
