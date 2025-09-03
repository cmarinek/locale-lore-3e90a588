
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MapPin, 
  DollarSign, 
  Target,
  Calendar,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  engagement: any[];
  performance: any[];
  geographic: any[];
  revenue: any[];
  retention: any[];
  demographics: any[];
}

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockData: AnalyticsData = {
        engagement: [
          { date: '2024-01-01', views: 1200, interactions: 450, shares: 89 },
          { date: '2024-01-02', views: 1350, interactions: 520, shares: 95 },
          { date: '2024-01-03', views: 1180, interactions: 480, shares: 78 },
          { date: '2024-01-04', views: 1420, interactions: 580, shares: 112 },
          { date: '2024-01-05', views: 1600, interactions: 650, shares: 128 },
        ],
        performance: [
          { category: 'History', facts: 245, engagement: 85 },
          { category: 'Nature', facts: 189, engagement: 72 },
          { category: 'Culture', facts: 156, engagement: 68 },
          { category: 'Science', facts: 123, engagement: 91 },
        ],
        geographic: [
          { region: 'North America', users: 2500, percentage: 45 },
          { region: 'Europe', users: 1800, percentage: 32 },
          { region: 'Asia', users: 980, percentage: 18 },
          { region: 'Other', users: 280, percentage: 5 },
        ],
        revenue: [
          { month: 'Jan', revenue: 12500, subscriptions: 125 },
          { month: 'Feb', revenue: 14200, subscriptions: 142 },
          { month: 'Mar', revenue: 16800, subscriptions: 168 },
          { month: 'Apr', revenue: 18900, subscriptions: 189 },
        ],
        retention: [
          { cohort: 'Week 1', day1: 100, day7: 65, day30: 42 },
          { cohort: 'Week 2', day1: 100, day7: 68, day30: 45 },
          { cohort: 'Week 3', day1: 100, day7: 71, day30: 48 },
          { cohort: 'Week 4', day1: 100, day7: 73, day30: 51 },
        ],
        demographics: [
          { ageGroup: '18-24', users: 850, color: '#8B5CF6' },
          { ageGroup: '25-34', users: 1240, color: '#10B981' },
          { ageGroup: '35-44', users: 980, color: '#F59E0B' },
          { ageGroup: '45+', users: 620, color: '#EF4444' },
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-64 animate-pulse bg-muted/30" />
        ))}
      </div>
    );
  }

  const MetricCard = ({ title, value, change, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <Badge variant={change > 0 ? "default" : "destructive"} className="mt-2">
              {change > 0 ? '+' : ''}{change}%
            </Badge>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value="5,628"
            change={12.5}
            icon={Users}
            color="bg-blue-500"
          />
          <MetricCard
            title="Page Views"
            value="24,891"
            change={8.2}
            icon={Eye}
            color="bg-green-500"
          />
          <MetricCard
            title="Engagement Rate"
            value="4.2%"
            change={-2.1}
            icon={Activity}
            color="bg-purple-500"
          />
          <MetricCard
            title="Revenue"
            value="$18,900"
            change={15.8}
            icon={DollarSign}
            color="bg-orange-500"
          />
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="engagement" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Engagement Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data.engagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stackId="1" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interactions" 
                      stackId="2" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="facts" fill="#8B5CF6" />
                    <Bar yAxisId="right" dataKey="engagement" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.geographic}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="users"
                        label={({ region, percentage }) => `${region}: ${percentage}%`}
                      >
                        {data.geographic.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.geographic.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: `hsl(${index * 90}, 70%, 50%)` }}
                        />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{region.users.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{region.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue & Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={3}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="subscriptions" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  User Retention Cohorts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.retention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="day1" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="day7" stroke="#F59E0B" strokeWidth={2} />
                    <Line type="monotone" dataKey="day30" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
