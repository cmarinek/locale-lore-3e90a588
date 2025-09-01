
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, HeatMapGrid } from 'recharts';
import { TrendingUp, Users, DollarSign, Eye, MapPin, TestTube, Calendar, Download } from 'lucide-react';

interface DashboardMetrics {
  engagement: EngagementMetrics;
  content: ContentMetrics;
  geographic: GeographicMetrics;
  abTesting: ABTestMetrics;
  revenue: RevenueMetrics;
  retention: RetentionMetrics;
}

interface EngagementMetrics {
  activeUsers: number;
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  dailyActiveUsers: Array<{ date: string; users: number }>;
  engagementByHour: Array<{ hour: number; engagement: number }>;
}

interface ContentMetrics {
  topContent: Array<{ id: string; title: string; views: number; engagement: number }>;
  contentPerformance: Array<{ date: string; views: number; shares: number; comments: number }>;
  categoryBreakdown: Array<{ name: string; value: number; color: string }>;
}

interface GeographicMetrics {
  topRegions: Array<{ region: string; users: number; engagement: number }>;
  heatmapData: Array<{ lat: number; lng: number; intensity: number }>;
  countryBreakdown: Array<{ country: string; users: number; percentage: number }>;
}

interface ABTestMetrics {
  activeTests: Array<{ name: string; variants: string[]; conversions: Record<string, number> }>;
  testResults: Array<{ test: string; winner: string; improvement: number; confidence: number }>;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  revenueByPlan: Array<{ plan: string; revenue: number; subscribers: number }>;
  revenueGrowth: Array<{ date: string; revenue: number; growth: number }>;
}

interface RetentionMetrics {
  overallRetention: number;
  cohortAnalysis: Array<{ cohort: string; day1: number; day7: number; day30: number }>;
  churnPrediction: Array<{ segment: string; riskLevel: 'low' | 'medium' | 'high'; users: number }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchDashboardMetrics();
  }, [timeRange]);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      // Fetch comprehensive analytics data
      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/analytics/export?timeRange=${timeRange}&format=pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${timeRange}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load analytics data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagement.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagement.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.retention.overallRetention}%</div>
            <p className="text-xs text-muted-foreground">
              +3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.engagement.dailyActiveUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.revenue.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                    <Bar dataKey="growth" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.engagement.engagementByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Session Duration</span>
                  <Badge variant="secondary">{metrics.engagement.sessionDuration}m</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Bounce Rate</span>
                  <Badge variant={metrics.engagement.bounceRate < 40 ? "default" : "destructive"}>
                    {metrics.engagement.bounceRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.content.topContent.slice(0, 5).map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium truncate">{content.title}</p>
                        <p className="text-sm text-muted-foreground">{content.views} views</p>
                      </div>
                      <Badge variant={content.engagement > 0.7 ? "default" : "secondary"}>
                        {Math.round(content.engagement * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.content.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {metrics.content.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.geographic.topRegions.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{region.region}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{region.users} users</p>
                        <p className="text-sm text-muted-foreground">{region.engagement}% engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Interactive heatmap would be rendered here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.abTesting.activeTests.map((test, index) => (
                    <div key={test.name} className="border rounded-lg p-4">
                      <h4 className="font-medium">{test.name}</h4>
                      <div className="mt-2 space-y-2">
                        {test.variants.map((variant) => (
                          <div key={variant} className="flex justify-between">
                            <span className="capitalize">{variant}</span>
                            <Badge variant="outline">
                              {test.conversions[variant] || 0}% CVR
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.abTesting.testResults.map((result, index) => (
                    <div key={result.test} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{result.test}</p>
                        <p className="text-sm text-muted-foreground">Winner: {result.winner}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.confidence > 95 ? "default" : "secondary"}>
                          +{result.improvement}%
                        </Badge>
                        <p className="text-xs text-muted-foreground">{result.confidence}% confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>MRR</span>
                  <Badge variant="default">${metrics.revenue.monthlyRecurringRevenue}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>ARPU</span>
                  <Badge variant="secondary">${metrics.revenue.averageRevenuePerUser}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Churn Rate</span>
                  <Badge variant={metrics.revenue.churnRate < 5 ? "default" : "destructive"}>
                    {metrics.revenue.churnRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics.revenue.revenueByPlan}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Churn Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {metrics.retention.churnPrediction.map((segment) => (
                  <div key={segment.segment} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{segment.segment}</h4>
                      <Badge variant={
                        segment.riskLevel === 'high' ? 'destructive' :
                        segment.riskLevel === 'medium' ? 'secondary' : 'default'
                      }>
                        {segment.riskLevel} risk
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">{segment.users}</p>
                    <p className="text-sm text-muted-foreground">users at risk</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
