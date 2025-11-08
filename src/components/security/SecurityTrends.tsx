import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Target, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface ScanData {
  scan_date: string;
  security_score: number;
  critical_count: number;
  medium_count: number;
  total_findings: number;
}

export function SecurityTrends() {
  const [scanHistory, setScanHistory] = useState<ScanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgScore: 0,
    trend: 0,
    totalScans: 0,
    lastScan: null as Date | null,
  });

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('security_scan_history')
        .select('scan_date, security_score, critical_count, medium_count, total_findings')
        .gte('scan_date', thirtyDaysAgo.toISOString())
        .order('scan_date', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setScanHistory(data);

        const avgScore = Math.round(
          data.reduce((sum, s) => sum + s.security_score, 0) / data.length
        );

        const trend =
          data.length > 1
            ? data[data.length - 1].security_score - data[data.length - 2].security_score
            : 0;

        setStats({
          avgScore,
          trend,
          totalScans: data.length,
          lastScan: new Date(data[data.length - 1].scan_date),
        });
      }
    } catch (error) {
      console.error('Error fetching scan history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (scanHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Security Trends
          </CardTitle>
          <CardDescription>30-day security score trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No scan history available yet</p>
            <p className="text-xs mt-2">Daily automated scans will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = scanHistory.map((scan) => ({
    date: format(new Date(scan.scan_date), 'MMM dd'),
    score: scan.security_score,
    critical: scan.critical_count,
    warnings: scan.medium_count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {stats.trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trend > 0 ? '+' : ''}
              {stats.trend}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Since last scan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Total Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Last Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastScan ? format(stats.lastScan, 'MMM dd') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lastScan ? format(stats.lastScan, 'HH:mm') : 'No scans yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Security Score Trend
          </CardTitle>
          <CardDescription>
            Daily security score and issue count over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Security Score"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke="#EF4444"
                strokeWidth={2}
                name="Critical Issues"
                dot={{ fill: '#EF4444' }}
              />
              <Line
                type="monotone"
                dataKey="warnings"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Warnings"
                dot={{ fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <Badge variant={stats.trend >= 0 ? 'default' : 'destructive'}>
              {stats.trend >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Improving
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Declining
                </>
              )}
            </Badge>
            <span className="text-muted-foreground">
              {stats.avgScore >= 80
                ? 'Excellent security posture'
                : stats.avgScore >= 60
                ? 'Good security posture with room for improvement'
                : 'Action required to improve security'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
