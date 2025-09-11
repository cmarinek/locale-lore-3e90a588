import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Crown, 
  Target,
  MapPin,
  MessageSquare,
  Calendar,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  badge_color: string;
  earned?: boolean;
  earned_at?: string;
  progress?: number;
}

export const AchievementShowcase = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    if (user) {
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const earnedIds = new Set(data?.map(ua => ua.achievement_id) || []);
      setUserAchievements(earnedIds);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      star: Star,
      crown: Crown,
      target: Target,
      'map-pin': MapPin,
      'message-square': MessageSquare,
      calendar: Calendar,
    };
    return icons[iconName] || Trophy;
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: any } = {
      submission: Target,
      social: MessageSquare,
      exploration: MapPin,
      streak: Calendar,
      special: Crown,
    };
    return categoryIcons[category] || Trophy;
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push({
      ...achievement,
      earned: userAchievements.has(achievement.id),
    });
    return acc;
  }, {} as { [key: string]: Achievement[] });

  const earnedCount = userAchievements.size;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  if (loading) {
    return <div>Loading achievements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievement Progress
          </CardTitle>
          <CardDescription>
            Your collection of earned achievements and badges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{earnedCount} / {totalCount}</p>
              <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {completionPercentage.toFixed(1)}% Complete
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{earnedCount} achievements</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => {
        const CategoryIcon = getCategoryIcon(category);
        const earnedInCategory = categoryAchievements.filter(a => a.earned).length;
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5" />
                  {category.charAt(0).toUpperCase() + category.slice(1)} Achievements
                </div>
                <Badge variant="outline">
                  {earnedInCategory} / {categoryAchievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryAchievements.map((achievement) => {
                  const Icon = getIconComponent(achievement.icon);
                  const isEarned = achievement.earned;
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        isEarned 
                          ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20' 
                          : 'bg-muted/30 border-muted-foreground/20'
                      }`}
                    >
                      {!isEarned && (
                        <div className="absolute top-2 right-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div 
                          className={`p-2 rounded-full ${
                            isEarned ? achievement.badge_color : 'bg-muted'
                          }`}
                        >
                          <Icon 
                            className={`h-5 w-5 ${
                              isEarned ? 'text-white' : 'text-muted-foreground'
                            }`} 
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold truncate ${
                            isEarned ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {achievement.name}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            isEarned ? 'text-muted-foreground' : 'text-muted-foreground/60'
                          }`}>
                            {achievement.description}
                          </p>
                          
                          {isEarned ? (
                            <Badge 
                              variant="secondary" 
                              className="mt-2 text-xs"
                            >
                              <Trophy className="h-3 w-3 mr-1" />
                              Earned
                            </Badge>
                          ) : (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">
                                Requirement: {achievement.requirement_type} {achievement.requirement_value}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Recent Achievements */}
      {earnedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Your latest unlocked achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements
                .filter(a => userAchievements.has(a.id))
                .slice(0, 3)
                .map((achievement) => {
                  const Icon = getIconComponent(achievement.icon);
                  return (
                    <div 
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <div className={`p-2 rounded-full ${achievement.badge_color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Trophy className="h-3 w-3 mr-1" />
                        Earned
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};