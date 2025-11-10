import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Users, MapPin, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthProvider';

interface LeaderboardEntry {
  user_id: string;
  score: number;
  rank: number;
  leaderboard_type: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

interface LeaderboardCardProps {
  className?: string;
}

type LeaderboardCategory = 'total_xp' | 'facts_submitted' | 'reputation' | 'streak';
type TimePeriod = 'all_time' | 'month' | 'week';

const ITEMS_PER_PAGE = 10;

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ className }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<LeaderboardCategory>('total_xp');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 60000; // 1 minute cache

  const fetchLeaderboards = async (force = false) => {
    try {
      // Check cache
      const now = Date.now();
      if (!force && now - lastFetchTime < CACHE_DURATION) {
        log.info('Using cached leaderboard data');
        return;
      }

      if (!user) return;

      setLoading(true);

      // Fetch from leaderboards table
      const { data: leaderboardData, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('leaderboard_type', category)
        .order('rank', { ascending: true })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (leaderboardData && leaderboardData.length > 0) {
        // Fetch profiles for leaderboard entries
        const userIds = leaderboardData.map(entry => entry.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        const enrichedLeaderboard = leaderboardData.map(entry => {
          const profile = profilesData?.find(p => p.id === entry.user_id);
          return {
            ...entry,
            profiles: profile ? {
              username: profile.username,
              avatar_url: profile.avatar_url
            } : undefined
          };
        });

        setLeaderboard(enrichedLeaderboard);

        // Find user's rank
        const { data: userRankData } = await supabase
          .from('leaderboards')
          .select('rank')
          .eq('leaderboard_type', category)
          .eq('user_id', user.id)
          .single();

        setUserRank(userRankData?.rank || 0);
      }

      setLastFetchTime(now);

    } catch (error) {
      log.error('Failed to fetch leaderboards', error, { component: 'LeaderboardCard' });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and category/page changes
  useEffect(() => {
    fetchLeaderboards(true);
  }, [category, currentPage]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    log.info('Setting up real-time leaderboard subscription');

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'leaderboards',
          filter: `leaderboard_type=eq.${category}`
        },
        (payload) => {
          log.info('Leaderboard updated via realtime', payload);
          // Refresh leaderboard data when changes occur
          fetchLeaderboards(true);
        }
      )
      .subscribe();

    return () => {
      log.info('Cleaning up leaderboard subscription');
      supabase.removeChannel(channel);
    };
  }, [category, user]);

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

  const getScoreLabel = (category: LeaderboardCategory) => {
    switch (category) {
      case 'total_xp': return 'XP';
      case 'facts_submitted': return 'Facts';
      case 'reputation': return 'Rep';
      case 'streak': return 'Days';
      default: return 'Score';
    }
  };

  const totalPages = Math.max(1, Math.ceil(100 / ITEMS_PER_PAGE)); // Assuming max 100 entries

  const LeaderboardList = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const isCurrentUser = user?.id === entry.user_id;
        
        return (
          <motion.div
            key={entry.user_id}
            className={`
              p-3 rounded-lg border bg-gradient-to-r
              ${isCurrentUser ? 'ring-2 ring-primary' : ''}
              ${getRankColor(entry.rank)}
              transition-all duration-200
            `}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
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
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {entry.profiles?.username || 'Anonymous'}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.score.toLocaleString()} {getScoreLabel(category)}
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
        );
      })}
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
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Category
            </label>
            <Select value={category} onValueChange={(value) => {
              setCategory(value as LeaderboardCategory);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_xp">Total XP</SelectItem>
                <SelectItem value="facts_submitted">Submissions</SelectItem>
                <SelectItem value="reputation">Reputation</SelectItem>
                <SelectItem value="streak">Streak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              Time Period
            </label>
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User's Rank Banner */}
        {userRank > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-medium">Your Rank</span>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                #{userRank}
              </Badge>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No leaderboard data yet</p>
            <p className="text-sm">Be the first to contribute!</p>
          </div>
        ) : (
          <LeaderboardList entries={leaderboard} />
        )}

        {/* Pagination */}
        {!loading && leaderboard.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || leaderboard.length < ITEMS_PER_PAGE}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};