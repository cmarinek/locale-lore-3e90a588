import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Users, MessageSquare, TrendingUp, Eye, ThumbsUp, Flag, CheckCircle } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading] = useState(false);

  // Temporary mock data for stable rendering - will replace with real data later
  const userGrowthData = [
    { date: 'Jan 1', users: 120 },
    { date: 'Jan 2', users: 135 },
    { date: 'Jan 3', users: 149 },
    { date: 'Jan 4', users: 168 },
    { date: 'Jan 5', users: 189 },
    { date: 'Jan 6', users: 203 },
    { date: 'Jan 7', users: 221 }
  ];

  const contentMetrics = [
    { name: 'Total Facts', value: 847, change: '+12%', icon: MessageSquare, color: 'hsl(var(--primary))' },
    { name: 'Active Users', value: 234, change: '+8%', icon: Users, color: 'hsl(var(--secondary))' },
    { name: 'Monthly Revenue', value: '$2,450', change: '+15%', icon: TrendingUp, color: 'hsl(var(--accent))' },
    { name: 'Contributors', value: 56, change: '+5%', icon: CheckCircle, color: 'hsl(142, 76%, 36%)' }
  ];

  const factsByStatus = [
    { status: 'Verified', count: 634, color: '#22c55e' },
    { status: 'Pending', count: 156, color: '#f59e0b' },
    { status: 'Disputed', count: 34, color: '#ef4444' },
    { status: 'Rejected', count: 23, color: '#64748b' }
  ];

  const userActivity = [
    { hour: '00:00', active: 234 },
    { hour: '04:00', active: 189 },
    { hour: '08:00', active: 567 },
    { hour: '12:00', active: 892 },
    { hour: '16:00', active: 734 },
    { hour: '20:00', active: 456 }
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
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
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
                        {typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString()}
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
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
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
                  data={factsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {factsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
              {factsByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">{item.status}</span>
                  <span className="text-xs sm:text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Timeline */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">User Activity (24h)</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="active" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};