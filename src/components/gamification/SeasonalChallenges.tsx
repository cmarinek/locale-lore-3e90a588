import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { log } from '@/utils/logger';
import {
  Calendar,
  Clock,
  Gift,
  Star,
  Trophy,
  Sun,
  Target,
  Users,
  MapPin,
  ShieldCheck,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ChallengeWithStats {
  id: string;
  title: string;
  description: string;
  challengeType: string;
  targetAction: string;
  targetValue: number;
  rewardPoints: number;
  rewardBadge?: {
    id?: string;
    name?: string;
    icon?: string | null;
    badge_color?: string | null;
  } | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  communityProgress: number;
  participantCount: number;
  userProgress: number;
  userCompleted: boolean;
  completedAt: string | null;
}

interface SeasonalChallengesProps {
  className?: string;
}

export const SeasonalChallenges: React.FC<SeasonalChallengesProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithStats[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CHALLENGE_THEMES = useMemo(
    () => ({
      daily: {
        icon: Sun,
        color: '#F59E0B',
        gradient: 'from-yellow-400/20 to-orange-500/20'
      },
      weekly: {
        icon: Calendar,
        color: '#6366F1',
        gradient: 'from-indigo-400/20 to-blue-500/20'
      },
      monthly: {
        icon: Clock,
        color: '#EC4899',
        gradient: 'from-pink-400/20 to-rose-500/20'
      },
      special: {
        icon: Trophy,
        color: '#10B981',
        gradient: 'from-emerald-400/20 to-green-500/20'
      },
      default: {
        icon: Target,
        color: '#6366F1',
        gradient: 'from-slate-400/20 to-slate-600/20'
      }
    }),
    []
  );

  const ACTION_TYPES = useMemo(
    () => ({
      discover_facts: { icon: MapPin, label: 'Discoveries' },
      verify_facts: { icon: ShieldCheck, label: 'Verifications' },
      comment: { icon: MessageCircle, label: 'Comments' },
      share: { icon: Share2, label: 'Shares' },
      participate: { icon: Users, label: 'Participation' }
    }),
    []
  );

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);

      const [{ data: challengeData, error: challengeError }, { data: progressData, error: progressError }] = await Promise.all([
        supabase
          .from('challenges')
          .select(`
            *,
            reward_badge:achievements!challenges_reward_badge_id_fkey (
              id,
              name,
              icon,
              badge_color
            )
          `)
          .order('start_date', { ascending: false }),
        supabase
          .from('user_challenge_progress')
          .select('challenge_id, user_id, current_progress, is_completed, completed_at')
      ]);

      if (challengeError) throw challengeError;
      if (progressError) throw progressError;

      type ProgressSummary = {
        total: number;
        participants: Set<string>;
        userProgress: number;
        userCompleted: boolean;
        completedAt: string | null;
      };

      const progressSummary = new Map<string, ProgressSummary>();

      (progressData ?? []).forEach((entry) => {
        if (!progressSummary.has(entry.challenge_id)) {
          progressSummary.set(entry.challenge_id, {
            total: 0,
            participants: new Set<string>(),
            userProgress: 0,
            userCompleted: false,
            completedAt: null,
          });
        }

        const summary = progressSummary.get(entry.challenge_id)!;
        summary.total += entry.current_progress || 0;
        summary.participants.add(entry.user_id);

        if (entry.user_id === user?.id) {
          summary.userProgress = entry.current_progress || 0;
          summary.userCompleted = entry.is_completed ?? false;
          summary.completedAt = entry.completed_at ?? null;
        }
      });

      const formatted = (challengeData ?? []).map((challenge) => {
        const summary = progressSummary.get(challenge.id) ?? {
          total: 0,
          participants: new Set<string>(),
          userProgress: 0,
          userCompleted: false,
          completedAt: null,
        };

        const endDate = challenge.end_date ? new Date(challenge.end_date) : null;
        const now = new Date();

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          challengeType: challenge.challenge_type,
          targetAction: challenge.target_action,
          targetValue: challenge.target_value,
          rewardPoints: challenge.reward_points,
          rewardBadge: challenge.reward_badge,
          startDate: challenge.start_date,
          endDate: challenge.end_date,
          isActive: challenge.is_active && (!endDate || endDate >= now),
          communityProgress: summary.total,
          participantCount: summary.participants.size,
          userProgress: summary.userProgress,
          userCompleted: summary.userCompleted,
          completedAt: summary.completedAt,
        } as ChallengeWithStats;
      });

      setChallenges(formatted);
    } catch (err) {
      log.error('Failed to load seasonal challenges', err, { component: 'SeasonalChallenges' });
      setError('Failed to load challenge data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [user?.id]);

  const getTimeRemaining = (endDate: string | null) => {
    if (!endDate) return 'Ongoing';
    const diff = new Date(endDate).getTime() - Date.now();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`;

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${hours} hour${hours === 1 ? '' : 's'} left`;
  };

  const filterOptions = useMemo(() => {
    const uniqueTypes = Array.from(new Set(challenges.map((challenge) => challenge.challengeType)));
    return ['all', ...uniqueTypes];
  }, [challenges]);

  const filteredChallenges = useMemo(() => {
    if (selectedType === 'all') return challenges;
    return challenges.filter((challenge) => challenge.challengeType === selectedType);
  }, [challenges, selectedType]);

  const categorizedChallenges = useMemo(() => {
    const now = new Date();

    return filteredChallenges.reduce(
      (
        acc,
        challenge
      ) => {
        const start = new Date(challenge.startDate);
        const end = challenge.endDate ? new Date(challenge.endDate) : null;
        const isCompleted = challenge.userCompleted || (!!end && end < now && !challenge.isActive);
        const isUpcoming = start > now && !challenge.isActive && !isCompleted;

        if (challenge.isActive) {
          acc.active.push(challenge);
        } else if (isCompleted) {
          acc.completed.push(challenge);
        } else if (isUpcoming) {
          acc.upcoming.push(challenge);
        } else {
          // A challenge that is not active, completed, or upcoming falls here.
          // It might be better to filter these out or assign to a different category.
          acc.upcoming.push(challenge);
        }

        return acc;
      },
      {
        active: [] as ChallengeWithStats[],
        upcoming: [] as ChallengeWithStats[],
        completed: [] as ChallengeWithStats[],
      }
    );
  }, [filteredChallenges]);

  const ChallengeCard = ({
    challenge,
    status,
  }: {
    challenge: ChallengeWithStats;
    status: 'active' | 'upcoming' | 'completed';
  }) => {
    const theme =
      CHALLENGE_THEMES[challenge.challengeType as keyof typeof CHALLENGE_THEMES] ?? CHALLENGE_THEMES.default;
    const ThemeIcon = theme.icon;
    const actionInfo =
      ACTION_TYPES[challenge.targetAction as keyof typeof ACTION_TYPES] ?? {
        icon: Target,
        label: challenge.targetAction.replace(/_/g, ' '),
      };
    const ActionIcon = actionInfo.icon;
    const targetValue = Math.max(challenge.targetValue, 1);
    const userProgressPercent = Math.min(100, (challenge.userProgress / targetValue) * 100);
    const communityProgressPercent = Math.min(100, (challenge.communityProgress / targetValue) * 100);
    const statusClass =
      status === 'active'
        ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
        : status === 'upcoming'
        ? 'bg-amber-500/20 text-amber-600 border-amber-500/40'
        : 'bg-slate-500/20 text-slate-600 border-slate-500/40';
    const statusLabel = status === 'active' ? 'Active' : status === 'upcoming' ? 'Upcoming' : 'Completed';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        className="w-full"
      >
        <Card className={`bg-gradient-to-br ${theme.gradient} border-border/50`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-full border-2"
                  style={{ borderColor: theme.color, backgroundColor: `${theme.color}20` }}
                >
                  <ThemeIcon className="w-5 h-5" style={{ color: theme.color }} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" className="capitalize">
                      {challenge.challengeType}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {challenge.participantCount.toLocaleString()} participants
                    </Badge>
                    <Badge variant="secondary" className={`flex items-center gap-1 ${statusClass}`}>
                      {statusLabel}
                    </Badge>
                    {challenge.userCompleted && (
                      <Badge className="flex items-center gap-1 bg-primary/20 text-primary border-primary/40">
                        <Star className="w-3 h-3" /> Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{getTimeRemaining(challenge.endDate)}</p>
                <p>
                  Ends{' '}
                  {challenge.endDate
                    ? new Date(challenge.endDate).toLocaleDateString()
                    : 'No end date'}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{challenge.description}</p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Your progress</span>
                  <span>
                    {challenge.userProgress}/{targetValue}
                  </span>
                </div>
                <Progress value={userProgressPercent} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Community progress</span>
                  <span>
                    {Math.round(challenge.communityProgress)}/{targetValue}
                  </span>
                </div>
                <Progress value={communityProgressPercent} className="h-2" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 capitalize">
                <ActionIcon className="w-3 h-3" />
                {actionInfo.label}
              </span>
              <span className="flex items-center gap-1">
                <Gift className="w-3 h-3" style={{ color: theme.color }} />
                {challenge.rewardPoints} pts
              </span>
              {challenge.rewardBadge?.name && (
                <span className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1"
                    style={{ borderColor: theme.color, color: theme.color }}
                  >
                    {challenge.rewardBadge.icon || '🏅'} {challenge.rewardBadge.name}
                  </Badge>
                </span>
              )}
              <span>
                Starts {new Date(challenge.startDate).toLocaleDateString()}
              </span>
            </div>

            {status === 'active' ? (
              <Button className="w-full" variant="outline">
                Continue challenge
              </Button>
            ) : status === 'upcoming' ? (
              <p className="text-xs text-muted-foreground text-center">
                Begins {new Date(challenge.startDate).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Completed{' '}
                {challenge.completedAt
                  ? new Date(challenge.completedAt).toLocaleDateString()
                  : challenge.endDate
                  ? new Date(challenge.endDate).toLocaleDateString()
                  : new Date(challenge.startDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderChallengeGrid = (
    items: ChallengeWithStats[],
    status: 'active' | 'upcoming' | 'completed'
  ) => (
    <motion.div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2" layout>
      <AnimatePresence>
        {items.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} status={status} />
        ))}
      </AnimatePresence>
    </motion.div>
  );

  const renderEmptyState = (status: 'active' | 'upcoming' | 'completed') => {
    const iconClass = 'w-12 h-12 mx-auto mb-4 opacity-50';

    if (status === 'active') {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className={iconClass} />
          <p>No active challenges match this filter.</p>
          <p className="text-sm">Try selecting a different challenge type.</p>
        </div>
      );
    }

    if (status === 'upcoming') {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className={iconClass} />
          <p>No upcoming challenges scheduled yet.</p>
          <p className="text-sm">Check back soon for new programs.</p>
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className={iconClass} />
        <p>No completed challenges to display.</p>
        <p className="text-sm">Finish an active challenge to see it here.</p>
      </div>
    );
  };

  const totalParticipants = challenges.reduce((acc, challenge) => acc + challenge.participantCount, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>Seasonal Challenges</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Track live Supabase-backed programs, see your real progress, and earn rewards for participating.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>
              Active: <strong>{categorizedChallenges.active.length}</strong>
            </span>
            <span>
              Upcoming: <strong>{categorizedChallenges.upcoming.length}</strong>
            </span>
            <span>
              Completed: <strong>{categorizedChallenges.completed.length}</strong>
            </span>
            <span>
              Participants engaged: <strong>{totalParticipants.toLocaleString()}</strong>
            </span>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardHeader>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((type) => (
          <Button
            key={type}
            size="sm"
            variant={selectedType === type ? 'default' : 'outline'}
            onClick={() => setSelectedType(type)}
          >
            {type === 'all' ? 'All types' : type.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="border-border/60">
              <CardContent className="space-y-4 py-6">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {categorizedChallenges.active.length > 0
              ? renderChallengeGrid(categorizedChallenges.active, 'active')
              : renderEmptyState('active')}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {categorizedChallenges.upcoming.length > 0
              ? renderChallengeGrid(categorizedChallenges.upcoming, 'upcoming')
              : renderEmptyState('upcoming')}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {categorizedChallenges.completed.length > 0
              ? renderChallengeGrid(categorizedChallenges.completed, 'completed')
              : renderEmptyState('completed')}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
