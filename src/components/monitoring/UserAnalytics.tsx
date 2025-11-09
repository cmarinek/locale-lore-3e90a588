import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, MousePointer, Clock } from 'lucide-react';
import { logger } from '@/utils/logger';

interface UserAnalyticsProps {
  compact?: boolean;
}

export function UserAnalytics({ compact }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState({
    activeUsers: 1234,
    pageViews: 45678,
    avgSessionDuration: '4m 32s',
    bounceRate: '32.5%',
    topPages: [
      { path: '/map', views: 12456, percentage: 27 },
      { path: '/', views: 8923, percentage: 20 },
      { path: '/stories', views: 7234, percentage: 16 },
      { path: '/submit', views: 5678, percentage: 12 },
      { path: '/profile', views: 4321, percentage: 9 },
    ],
  });

  if (compact) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="text-2xl font-bold">{analytics.activeUsers.toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Page Views</p>
          <p className="text-2xl font-bold">{analytics.pageViews.toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Avg Session</p>
          <p className="text-2xl font-bold">{analytics.avgSessionDuration}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Bounce Rate</p>
          <p className="text-2xl font-bold">{analytics.bounceRate}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgSessionDuration}</div>
            <p className="text-xs text-muted-foreground">Average time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bounceRate}</div>
            <p className="text-xs text-muted-foreground">Exit on first page</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most visited pages in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPages.map((page) => (
              <div key={page.path} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{page.path}</span>
                  <span className="text-sm text-muted-foreground">
                    {page.views.toLocaleString()} views
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${page.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
