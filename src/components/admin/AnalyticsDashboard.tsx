import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/hooks/useAdmin';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Users, MessageSquare, TrendingUp, Eye, ThumbsUp, Flag, CheckCircle } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { getSystemMetrics } = useAdmin();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getSystemMetrics(timeRange);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration - in real app, process actual metrics
  const userGrowthData = [
    { date: '2024-01-01', users: 120, activeUsers: 89 },
    { date: '2024-01-02', users: 135, activeUsers: 97 },
    { date: '2024-01-03', users: 149, activeUsers: 102 },
    { date: '2024-01-04', users: 168, activeUsers: 115 },
    { date: '2024-01-05', users: 189, activeUsers: 128 },
    { date: '2024-01-06', users: 203, activeUsers: 142 },
    { date: '2024-01-07', users: 221, activeUsers: 156 }
  ];

  const contentMetrics = [
    { name: 'Facts Created', value: 847, change: '+12%', icon: MessageSquare, color: 'hsl(var(--primary))' },
    { name: 'Total Views', value: 24589, change: '+8%', icon: Eye, color: 'hsl(var(--secondary))' },
    { name: 'Votes Cast', value: 5632, change: '+15%', icon: ThumbsUp, color: 'hsl(var(--accent))' },
    { name: 'Reports Filed', value: 23, change: '-5%', icon: Flag, color: 'hsl(var(--destructive))' }
  ];

  const factStatusData = [
    { name: 'Verified', value: 634, color: 'hsl(142, 76%, 36%)' },
    { name: 'Pending', value: 156, color: 'hsl(47, 96%, 53%)' },
    { name: 'Flagged', value: 34, color: 'hsl(0, 84%, 60%)' },
    { name: 'Rejected', value: 23, color: 'hsl(0, 0%, 45%)' }
  ];

  const engagementData = [
    { time: '00:00', views: 234, votes: 45, comments: 12 },
    { time: '04:00', views: 189, votes: 32, comments: 8 },
    { time: '08:00', views: 567, votes: 89, comments: 23 },
    { time: '12:00', views: 892, votes: 156, comments: 45 },
    { time: '16:00', views: 734, votes: 123, comments: 34 },
    { time: '20:00', views: 456, votes: 78, comments: 19 }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {contentMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${metric.color}15` }}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: metric.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{metric.name}</p>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                        {metric.value.toLocaleString()}
                      </span>
                      <span className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                <Area type="monotone" dataKey="activeUsers" stackId="2" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fact Status Distribution */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Fact Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={factStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {factStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
              {factStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">{item.name}</span>
                  <span className="text-xs sm:text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Timeline */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Daily Engagement</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="votes" stroke="hsl(var(--secondary))" strokeWidth={2} />
              <Line type="monotone" dataKey="comments" stroke="hsl(var(--accent))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};