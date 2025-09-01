import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  MapPin, 
  MessageSquare, 
  ThumbsUp, 
  Trophy, 
  Star,
  Calendar,
  Eye,
  Target,
  Flame
} from 'lucide-react';
import { UserStatistics } from '@/hooks/useProfile';

interface StatisticsCardProps {
  statistics: UserStatistics | null;
}

export const StatisticsCard = ({ statistics }: StatisticsCardProps) => {
  if (!statistics) {
    return <div>Loading statistics...</div>;
  }

  const statItems = [
    {
      label: 'Facts Submitted',
      value: statistics.facts_submitted,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Facts Verified',
      value: statistics.facts_verified,
      icon: Star,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Comments Made',
      value: statistics.comments_made,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Votes Cast',
      value: statistics.votes_cast,
      icon: ThumbsUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Achievements',
      value: statistics.achievements_earned,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Locations Discovered',
      value: statistics.locations_discovered,
      icon: MapPin,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const level = Math.floor(statistics.total_points / 1000) + 1;
  const pointsToNextLevel = 1000 - (statistics.total_points % 1000);
  const progressToNextLevel = ((statistics.total_points % 1000) / 1000) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Level & Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Level & Progress
          </CardTitle>
          <CardDescription>
            Your current level and progress towards the next one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Level {level}
              </Badge>
              <div>
                <p className="font-semibold">{statistics.total_points.toLocaleString()} Points</p>
                <p className="text-sm text-muted-foreground">
                  {pointsToNextLevel.toLocaleString()} points to Level {level + 1}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{progressToNextLevel.toFixed(1)}%</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Streaks & Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Activity Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Current Streak</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Flame className="h-3 w-3" />
                {statistics.current_streak} days
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Longest Streak</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {statistics.longest_streak} days
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Profile Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Profile Views</span>
              <Badge variant="secondary">
                {statistics.profile_views.toLocaleString()}
              </Badge>
            </div>
            {statistics.last_activity && (
              <div className="flex items-center justify-between">
                <span>Last Activity</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(statistics.last_activity).toLocaleDateString()}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            How you're doing compared to other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Fact Accuracy Rate</span>
                <span className="text-sm font-semibold">
                  {statistics.facts_submitted > 0 
                    ? ((statistics.facts_verified / statistics.facts_submitted) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <Progress 
                value={statistics.facts_submitted > 0 
                  ? (statistics.facts_verified / statistics.facts_submitted) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Engagement Score</span>
                <span className="text-sm font-semibold">
                  {statistics.total_points > 0 ? Math.min(100, (statistics.total_points / 100)).toFixed(1) : 0}%
                </span>
              </div>
              <Progress 
                value={statistics.total_points > 0 ? Math.min(100, statistics.total_points / 100) : 0} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};