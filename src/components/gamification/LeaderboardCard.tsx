import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  score: number;
  rank: number;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

interface LeaderboardCardProps {
  className?: string;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ className }) => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [localLeaderboard, setLocalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ global: number; local: number }>({ global: 0, local: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch global leaderboard
      const { data: globalData } = await supabase
        .from('user_levels')
        .select(`
          user_id,
          total_xp
        `)
        .order('total_xp', { ascending: false })
        .limit(10);

      if (globalData) {
        // Fetch profiles separately
        const userIds = globalData.map(entry => entry.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        const globalLeaderboard = globalData.map((entry, index) => {
          const profile = profilesData?.find(p => p.id === entry.user_id);
          return {
            user_id: entry.user_id,
            score: entry.total_xp,
            rank: index + 1,
            profiles: profile ? {
              username: profile.username,
              avatar_url: profile.avatar_url
            } : undefined
          };
        });
        setGlobalLeaderboard(globalLeaderboard);

        // Find user's rank
        const userGlobalRank = globalData.findIndex(entry => entry.user_id === user.id) + 1;
        setUserRank(prev => ({ ...prev, global: userGlobalRank }));
      }

      // Fetch local leaderboard (mock data for now)
      setLocalLeaderboard(globalLeaderboard.slice(0, 5));

    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default: return 'from-muted/20 to-muted/30 border-border';
    }
  };

  const LeaderboardList = ({ entries, type }: { entries: LeaderboardEntry[]; type: string }) => (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.user_id}
          className={`
            p-3 rounded-lg border bg-gradient-to-r
            ${getRankColor(entry.rank)}
            transition-all duration-200 hover:scale-102
          `}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(entry.rank)}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.profiles?.avatar_url} />
                <AvatarFallback>
                  {entry.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-foreground">
                  {entry.profiles?.username || 'Anonymous'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {entry.score.toLocaleString()} XP
                </div>
              </div>
            </div>
            
            {entry.rank <= 3 && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Trophy className="h-5 w-5 text-primary" />
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Local
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="global" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Top Discoverers</h3>
              {userRank.global > 0 && (
                <Badge variant="outline">
                  Your rank: #{userRank.global}
                </Badge>
              )}
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <LeaderboardList entries={globalLeaderboard} type="global" />
            )}
          </TabsContent>
          
          <TabsContent value="local" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Local Heroes</h3>
              {userRank.local > 0 && (
                <Badge variant="outline">
                  Your rank: #{userRank.local}
                </Badge>
              )}
            </div>
            <LeaderboardList entries={localLeaderboard} type="local" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};