
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  HardDrive, 
  Upload, 
  Image, 
  Video, 
  FileAudio, 
  FileText,
  TrendingUp,
  Calendar,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MediaAnalytics as MediaAnalyticsType } from '@/types/media';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const MediaAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<MediaAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('media-analytics', {
        body: { timeRange }
      });

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-media-report', {
        body: { timeRange, format: 'csv' }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data.content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `media-analytics-${timeRange}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const fileTypeData = [
    { name: 'Images', value: analytics.fileTypes.images, color: COLORS[0] },
    { name: 'Videos', value: analytics.fileTypes.videos, color: COLORS[1] },
    { name: 'Audio', value: analytics.fileTypes.audio, color: COLORS[2] },
    { name: 'Documents', value: analytics.fileTypes.documents, color: COLORS[3] },
  ];

  const moderationData = [
    { name: 'Approved', value: analytics.moderationStats.approved, color: '#22C55E' },
    { name: 'Pending', value: analytics.moderationStats.pending, color: '#F59E0B' },
    { name: 'Rejected', value: analytics.moderationStats.rejected, color: '#EF4444' },
    { name: 'Flagged', value: analytics.moderationStats.flagged, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Media Analytics</h2>
          <p className="text-muted-foreground">Overview of media usage and performance</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Total Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUploads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Files uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.storageUsage / (1024 * 1024 * 1024)).toFixed(1)} GB</div>
            <Progress value={(analytics.storageUsage / (10 * 1024 * 1024 * 1024)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Bandwidth Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.bandwidthUsage / (1024 * 1024)).toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Avg Daily Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.totalUploads / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Files per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>File Types Distribution</CardTitle>
            <CardDescription>Breakdown by file type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Moderation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Moderation Status</CardTitle>
            <CardDescription>Content moderation overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moderationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moderationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upload Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Trends</CardTitle>
          <CardDescription>Daily upload activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.uploadTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="uploads" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Type Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-500" />
                <span>Images</span>
              </div>
              <Badge variant="secondary">{analytics.fileTypes.images}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-green-500" />
                <span>Videos</span>
              </div>
              <Badge variant="secondary">{analytics.fileTypes.videos}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-yellow-500" />
                <span>Audio Files</span>
              </div>
              <Badge variant="secondary">{analytics.fileTypes.audio}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <span>Documents</span>
              </div>
              <Badge variant="secondary">{analytics.fileTypes.documents}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Approved Content</span>
              <Badge className="bg-green-100 text-green-800">
                {analytics.moderationStats.approved}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending Review</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {analytics.moderationStats.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Rejected Content</span>
              <Badge className="bg-red-100 text-red-800">
                {analytics.moderationStats.rejected}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Flagged Content</span>
              <Badge className="bg-purple-100 text-purple-800">
                {analytics.moderationStats.flagged}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
