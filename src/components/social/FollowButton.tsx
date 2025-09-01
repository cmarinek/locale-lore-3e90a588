import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const FollowButton: React.FC<FollowButtonProps> = ({ 
  userId, 
  className = "",
  variant = "outline",
  size = "sm"
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userId !== user.id) {
      checkFollowStatus();
    }
  }, [user, userId]);

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // Not following if no record found
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({ title: "Please sign in to follow users", variant: "destructive" });
      return;
    }

    if (userId === user.id) {
      toast({ title: "You can't follow yourself", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        setIsFollowing(false);
        toast({ title: "Unfollowed successfully" });
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        setIsFollowing(true);
        toast({ title: "Following!" });
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast({ 
        title: "Failed to update follow status", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for own profile or if not logged in
  if (!user || userId === user.id) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleFollow}
      disabled={loading}
      className={className}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};