import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalFacts: number;
  verifiedFacts: number;
  pendingFacts: number;
  totalPayments: number;
  monthlyRevenue: number;
  totalContributors: number;
  totalStories: number;
  userGrowth: Array<{ date: string; users: number; }>;
  factsByStatus: Array<{ status: string; count: number; color: string; }>;
  revenueData: Array<{ month: string; revenue: number; contributors: number; }>;
  userActivity: Array<{ hour: string; active: number; }>;
  topLocations: Array<{ location: string; facts: number; }>;
  engagementMetrics: Array<{ metric: string; value: number; change: number; }>;
}

export const useAdminAnalytics = (timeRange: string = '30d') => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const getTimeRangeFilter = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch(timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    return startDate.toISOString();
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = getTimeRangeFilter();
      const currentRangeStart = new Date(startDate);
      const currentRangeEnd = new Date();
      const rangeDurationMs = Math.max(currentRangeEnd.getTime() - currentRangeStart.getTime(), 1);
      const previousRangeStart = new Date(currentRangeStart.getTime() - rangeDurationMs);
      const previousStartISO = previousRangeStart.toISOString();
      const previousEndISO = currentRangeStart.toISOString();

      const [
        usersResult,
        factsResult,
        paymentsResult,
        storiesResult,
        userGrowthResult,
        revenueDataResult,
        activityLogResult,
        commentCountResult,
        voteCountResult
      ] = await Promise.all([
        Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', startDate)
        ]),
        Promise.all([
          supabase.from('facts').select('id', { count: 'exact', head: true }),
          supabase.from('facts').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
          supabase.from('facts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('facts').select('status').gte('created_at', startDate)
        ]),
        Promise.all([
          supabase.from('payments').select('amount', { count: 'exact' }),
          supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('subscribed', true)
        ]),
        supabase.from('stories').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', startDate)
          .order('created_at', { ascending: true }),
        supabase
          .from('payments')
          .select('amount, created_at, currency')
          .gte('created_at', startDate)
          .order('created_at', { ascending: true }),
        supabase
          .from('user_activity_log')
          .select('created_at, user_id, activity_type')
          .gte('created_at', startDate)
          .order('created_at', { ascending: true }),
        supabase.from('fact_comments').select('id', { count: 'exact', head: true }).gte('created_at', startDate),
        supabase.from('votes').select('id', { count: 'exact', head: true }).gte('created_at', startDate)
      ]);

      const [
        previousFactsResult,
        previousCommentCountResult,
        previousVoteCountResult,
        previousActivityResult
      ] = await Promise.all([
        supabase
          .from('facts')
          .select('status')
          .gte('created_at', previousStartISO)
          .lt('created_at', previousEndISO),
        supabase
          .from('fact_comments')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', previousStartISO)
          .lt('created_at', previousEndISO),
        supabase
          .from('votes')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', previousStartISO)
          .lt('created_at', previousEndISO),
        supabase
          .from('user_activity_log')
          .select('created_at, user_id')
          .gte('created_at', previousStartISO)
          .lt('created_at', previousEndISO)
      ]);

      // Process total users
      const totalUsers = usersResult[0].count || 0;
      const activeUsers = usersResult[1].count || 0;
      
      // Process facts data
      const totalFacts = factsResult[0].count || 0;
      const verifiedFacts = factsResult[1].count || 0;
      const pendingFacts = factsResult[2].count || 0;
      
      // Process facts by status for pie chart
      const factsByStatusData = factsResult[3].data || [];
      const statusCounts = factsByStatusData.reduce((acc: any, fact: any) => {
        acc[fact.status] = (acc[fact.status] || 0) + 1;
        return acc;
      }, {});

      const factsByStatus = [
        { status: 'Verified', count: statusCounts.verified || 0, color: '#22c55e' },
        { status: 'Pending', count: statusCounts.pending || 0, color: '#f59e0b' },
        { status: 'Disputed', count: statusCounts.disputed || 0, color: '#ef4444' },
        { status: 'Rejected', count: statusCounts.rejected || 0, color: '#64748b' }
      ];
      
      // Process payments data
      const paymentsData = paymentsResult[0].data || [];
      const totalPayments = paymentsData.length;
      const monthlyRevenue = paymentsData.reduce((sum: number, payment: any) => {
        return sum + (payment.amount || 0);
      }, 0) / 100; // Convert from cents
      const totalContributors = paymentsResult[1].count || 0;
      
      // Process stories
      const totalStories = storiesResult.count || 0;
      
      // Process user growth
      const userGrowthData = userGrowthResult.data || [];
      const userGrowth = processUserGrowthData(userGrowthData, timeRange);
      
      // Process revenue data
      const revenueDataRaw = revenueDataResult.data || [];
      const revenueData = processRevenueData(revenueDataRaw, timeRange);

      const activityLogData = activityLogResult.data || [];
      const previousActivityData = previousActivityResult.data || [];
      const userActivity = processUserActivityData(activityLogData, timeRange);

      const commentsCount = commentCountResult.count || 0;
      const votesCount = voteCountResult.count || 0;
      const previousCommentsCount = previousCommentCountResult.count || 0;
      const previousVotesCount = previousVoteCountResult.count || 0;

      const factsCreatedDuringPeriod = factsByStatusData.length;
      const previousFactsData = previousFactsResult.data || [];
      const previousStatusCounts = previousFactsData.reduce((acc: Record<string, number>, fact: { status: string }) => {
        acc[fact.status] = (acc[fact.status] || 0) + 1;
        return acc;
      }, {});

      const verificationRate = factsCreatedDuringPeriod
        ? (statusCounts.verified || 0) / factsCreatedDuringPeriod
        : 0;
      const previousVerificationRate = previousFactsData.length
        ? (previousStatusCounts.verified || 0) / previousFactsData.length
        : 0;

      const commentsPerFact = factsCreatedDuringPeriod
        ? commentsCount / factsCreatedDuringPeriod
        : 0;
      const previousCommentsPerFact = previousFactsData.length
        ? previousCommentsCount / previousFactsData.length
        : 0;

      const votesPerFact = factsCreatedDuringPeriod
        ? votesCount / factsCreatedDuringPeriod
        : 0;
      const previousVotesPerFact = previousFactsData.length
        ? previousVotesCount / previousFactsData.length
        : 0;

      const uniqueActiveUsers = new Set((activityLogData || []).map((entry: any) => entry.user_id)).size;
      const previousUniqueActiveUsers = new Set(
        (previousActivityData || []).map((entry: any) => entry.user_id)
      ).size;
      const activeContributorRate = totalUsers ? (uniqueActiveUsers / totalUsers) * 100 : 0;
      const previousActiveContributorRate = totalUsers
        ? (previousUniqueActiveUsers / totalUsers) * 100
        : 0;

      const topLocations = await getTopLocations();

      const engagementMetrics = [
        {
          metric: 'Verification Rate',
          value: Number((verificationRate * 100).toFixed(1)),
          change: Number(((verificationRate - previousVerificationRate) * 100).toFixed(1)),
        },
        {
          metric: 'Avg Comments per Fact',
          value: Number(commentsPerFact.toFixed(2)),
          change: Number((commentsPerFact - previousCommentsPerFact).toFixed(2)),
        },
        {
          metric: 'Avg Votes per Fact',
          value: Number(votesPerFact.toFixed(2)),
          change: Number((votesPerFact - previousVotesPerFact).toFixed(2)),
        },
        {
          metric: 'Active Contributor Rate',
          value: Number(activeContributorRate.toFixed(1)),
          change: Number((activeContributorRate - previousActiveContributorRate).toFixed(1)),
        },
      ];

      setData({
        totalUsers,
        activeUsers,
        totalFacts,
        verifiedFacts,
        pendingFacts,
        totalPayments,
        monthlyRevenue,
        totalContributors,
        totalStories,
        userGrowth,
        factsByStatus,
        revenueData,
        userActivity,
        topLocations,
        engagementMetrics
      });
      
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processUserGrowthData = (data: any[], range: string) => {
    const groupedData: { [key: string]: number } = {};
    
    data.forEach((user: any) => {
      const date = new Date(user.created_at);
      let key: string;
      
      if (range === '24h') {
        key = `${date.toISOString().slice(0, 13)  }:00`; // Group by hour
      } else if (range === '7d') {
        key = date.toISOString().slice(0, 10); // Group by day
      } else {
        // Group by week for 30d+ ranges
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
      }
      
      groupedData[key] = (groupedData[key] || 0) + 1;
    });
    
    return Object.entries(groupedData).map(([date, users]) => ({
      date: range === '24h' ? new Date(date).toLocaleTimeString([], { hour: '2-digit' }) : 
            new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      users
    })).slice(-20); // Last 20 data points
  };

  const processRevenueData = (data: any[], range: string) => {
    const groupedData: { [key: string]: { revenue: number; contributors: number } } = {};
    
    data.forEach((payment: any) => {
      const date = new Date(payment.created_at);
      const key = date.toISOString().slice(0, 7); // Group by month
      
      if (!groupedData[key]) {
        groupedData[key] = { revenue: 0, contributors: 0 };
      }
      
      groupedData[key].revenue += (payment.amount || 0) / 100;
      groupedData[key].contributors += 1;
    });
    
    return Object.entries(groupedData).map(([month, data]) => ({
      month: new Date(`${month  }-01`).toLocaleDateString([], { month: 'short', year: 'numeric' }),
      revenue: data.revenue,
      contributors: data.contributors
    })).slice(-12); // Last 12 months
  };

  const processUserActivityData = (data: any[], range: string) => {
    const grouped: Record<string, number> = {};

    data.forEach((entry: any) => {
      const date = new Date(entry.created_at);
      let key: string;

      if (range === '24h') {
        key = `${date.toISOString().slice(0, 13)  }:00`;
      } else if (range === '7d') {
        key = date.toISOString().slice(0, 10);
      } else {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, active]) => ({
        hour:
          range === '24h'
            ? new Date(date).toLocaleTimeString([], { hour: '2-digit' })
            : new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        active,
      }))
      .slice(-24);
  };

  const getTopLocations = async () => {
    try {
      const { data } = await supabase
        .from('facts')
        .select('location_name')
        .not('location_name', 'is', null)
        .limit(1000);
      
      if (!data) return [];
      
      const locationCounts: { [key: string]: number } = {};
      data.forEach((fact: any) => {
        if (fact.location_name) {
          locationCounts[fact.location_name] = (locationCounts[fact.location_name] || 0) + 1;
        }
      });
      
      return Object.entries(locationCounts)
        .map(([location, facts]) => ({ location, facts }))
        .sort((a, b) => b.facts - a.facts)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching top locations:', error);
      return [];
    }
  };

  return {
    data,
    loading,
    error,
    refetch: loadAnalytics
  };
};