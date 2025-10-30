import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { CreatorAnalytics } from '@/types/contributor';
import {
  Loader2,
  TrendingUp,
  LineChart,
  Eye,
  Heart,
  Share2,
  Coins,
  BarChart3,
  Users,
} from 'lucide-react';

interface FactRecord {
  id: string;
  title: string;
  vote_count_up: number;
  created_at: string;
}

interface TrendingFactRecord {
  fact_id: string;
  view_count: number | null;
  share_count: number | null;
  vote_count: number | null;
  period_start: string;
  period_end: string;
}

export const CreatorAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) {
        setAnalytics(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: factsData, error: factsError } = await supabase
          .from('facts')
          .select('id,title,vote_count_up,created_at')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (factsError) throw factsError;

        const factIds = (factsData ?? []).map((fact) => fact.id);

        const [tipsResult, premiumResult, sharesResult, profileResult, trendingResult] = await Promise.all([
          supabase.from('tips').select('amount,status').eq('recipient_id', user.id),
          supabase.from('premium_content').select('id,title,price,purchase_count').eq('creator_id', user.id),
          factIds.length > 0
            ? supabase.from('fact_shares').select('fact_id').in('fact_id', factIds)
            : Promise.resolve({ data: [], error: null }),
          supabase.from('profiles').select('followers_count').eq('id', user.id).maybeSingle(),
          factIds.length > 0
            ? supabase
                .from('trending_facts')
                .select('fact_id,view_count,share_count,vote_count,period_start,period_end')
                .in('fact_id', factIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (tipsResult.error) throw tipsResult.error;
        if (premiumResult.error) throw premiumResult.error;
        if (sharesResult.error) throw sharesResult.error;
        if (profileResult.error) throw profileResult.error;
        if (trendingResult.error) throw trendingResult.error;

        const facts: FactRecord[] = (factsData ?? []).map((fact) => ({
          id: fact.id,
          title: fact.title,
          vote_count_up: fact.vote_count_up ?? 0,
          created_at: fact.created_at,
        }));

        const completedTips = (tipsResult.data ?? []).filter((tip) => tip.status === 'completed');
        const tipsReceived = completedTips.length;
        const tipsAmount = completedTips.reduce((sum, tip) => sum + Number(tip.amount ?? 0), 0);

        const premiumSales = (premiumResult.data ?? []).reduce(
          (sum, item: any) => sum + Number(item.purchase_count ?? 0),
          0,
        );
        const premiumRevenue = (premiumResult.data ?? []).reduce(
          (sum, item: any) => sum + Number(item.price ?? 0) * Number(item.purchase_count ?? 0),
          0,
        );

        const trendingMap = new Map<string, TrendingFactRecord>();
        (trendingResult.data ?? []).forEach((entry: any) => {
          const existing = trendingMap.get(entry.fact_id);
          if (!existing) {
            trendingMap.set(entry.fact_id, entry as TrendingFactRecord);
            return;
          }

          const existingPeriodEnd = existing.period_end ? new Date(existing.period_end).getTime() : 0;
          const incomingPeriodEnd = entry.period_end ? new Date(entry.period_end).getTime() : 0;
          if (incomingPeriodEnd >= existingPeriodEnd) {
            trendingMap.set(entry.fact_id, entry as TrendingFactRecord);
          }
        });

        const totalViews = Array.from(trendingMap.values()).reduce(
          (sum, item) => sum + Number(item.view_count ?? 0),
          0,
        );

        const totalShares = factIds.length > 0 ? (sharesResult.data ?? []).length : 0;
        const totalLikes = facts.reduce((sum, fact) => sum + Number(fact.vote_count_up ?? 0), 0);

        const followerCount = Number(profileResult.data?.followers_count ?? 0);
        const engagementRateBaseline = totalViews > 0 ? totalViews : Math.max(facts.length, 1);
        const engagementRate = ((totalLikes + totalShares) / engagementRateBaseline) * 100;

        const topPerforming = facts
          .map((fact) => {
            const trending = trendingMap.get(fact.id);
            return {
              id: fact.id,
              title: fact.title,
              views: Number(trending?.view_count ?? 0),
              engagement: Number(trending?.vote_count ?? fact.vote_count_up ?? 0),
            };
          })
          .sort((a, b) => b.views - a.views || b.engagement - a.engagement)
          .slice(0, 5);

        const periodStart = Array.from(trendingMap.values()).reduce<string | null>((earliest, entry) => {
          if (!entry.period_start) return earliest;
          if (!earliest) return entry.period_start;
          return new Date(entry.period_start) < new Date(earliest) ? entry.period_start : earliest;
        }, null);
        const periodEnd = Array.from(trendingMap.values()).reduce<string | null>((latest, entry) => {
          if (!entry.period_end) return latest;
          if (!latest) return entry.period_end;
          return new Date(entry.period_end) > new Date(latest) ? entry.period_end : latest;
        }, null);

        const analyticsPayload: CreatorAnalytics = {
          user_id: user.id,
          period: periodStart && periodEnd ? `${periodStart} – ${periodEnd}` : 'Last 30 days',
          discoveries_created: facts.length,
          total_views: totalViews,
          total_likes: totalLikes,
          total_shares: totalShares,
          tips_received: tipsReceived,
          tips_amount: tipsAmount,
          premium_sales: premiumSales,
          premium_revenue: premiumRevenue,
          follower_growth: followerCount,
          engagement_rate: Number.isFinite(engagementRate) ? engagementRate : 0,
          top_performing_discoveries: topPerforming,
        };

        setAnalytics(analyticsPayload);
      } catch (error) {
        console.error('Error loading creator analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  const metricCards = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        label: 'Discoveries published',
        value: analytics.discoveries_created,
        icon: <TrendingUp className="h-4 w-4 text-primary" />,
      },
      {
        label: 'Total views',
        value: analytics.total_views,
        icon: <Eye className="h-4 w-4 text-primary" />,
      },
      {
        label: 'Likes received',
        value: analytics.total_likes,
        icon: <Heart className="h-4 w-4 text-primary" />,
      },
      {
        label: 'Shares',
        value: analytics.total_shares,
        icon: <Share2 className="h-4 w-4 text-primary" />,
      },
    ];
  }, [analytics]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Analytics</CardTitle>
          <CardDescription>Sign in to view performance metrics for your discoveries.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Analytics</CardTitle>
          <CardDescription>Gathering performance metrics…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Analytics</CardTitle>
          <CardDescription>No analytics available yet. Publish a discovery to see performance insights.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Creator Analytics</CardTitle>
            <CardDescription>Performance for your discoveries {analytics.period ? `(${analytics.period})` : ''}</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <LineChart className="h-3 w-3" /> Engagement rate {analytics.engagement_rate.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <div key={metric.label} className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {metric.label}
                {metric.icon}
              </div>
              <p className="mt-2 text-2xl font-semibold">{metric.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Revenue streams</h3>
              <Coins className="h-4 w-4 text-primary" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Tips received</p>
                <p className="text-xl font-semibold">{analytics.tips_received}</p>
                <p className="text-xs text-muted-foreground">${analytics.tips_amount.toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Premium sales</p>
                <p className="text-xl font-semibold">{analytics.premium_sales}</p>
                <p className="text-xs text-muted-foreground">${analytics.premium_revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Audience growth</h3>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-semibold">{analytics.follower_growth.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              Followers currently tracking your discoveries.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Engagement progress</span>
                <span>{Math.min(analytics.engagement_rate, 100).toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(analytics.engagement_rate, 100)} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top performing discoveries</h3>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>

          {analytics.top_performing_discoveries.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">We need more data to surface your breakout discoveries.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {analytics.top_performing_discoveries.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between rounded-md bg-muted/30 p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {index + 1}. {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.views.toLocaleString()} views • {item.engagement.toLocaleString()} engagement</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {item.views === 0 ? 'Building' : 'Trending'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorAnalyticsDashboard;
