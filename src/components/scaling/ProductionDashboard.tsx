
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  Database, 
  Globe, 
  Shield, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { rateLimiter } from '@/utils/scaling/rate-limiter';
import { autoScaler } from '@/utils/scaling/auto-scaler';
import { cache } from '@/utils/scaling/redis-cache';
import { dbPool } from '@/utils/scaling/database-pool';

interface SystemMetrics {
  cpu: number;
  memory: number;
  requests: number;
  latency: number;
  errors: number;
  activeUsers: number;
}

export const ProductionDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    requests: 0,
    latency: 0,
    errors: 0,
    activeUsers: 0
  });

  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [alerts, setAlerts] = useState<Array<{ id: string; type: string; message: string; timestamp: Date }>>([]);

  useEffect(() => {
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    try {
      // Simulate metrics collection
      const newMetrics: SystemMetrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        requests: Math.floor(Math.random() * 1000),
        latency: Math.random() * 2000,
        errors: Math.random() * 10,
        activeUsers: Math.floor(Math.random() * 10000)
      };

      setMetrics(newMetrics);

      // Update auto-scaler
      autoScaler.updateMetrics({
        cpuUsage: newMetrics.cpu,
        memoryUsage: newMetrics.memory,
        requestRate: newMetrics.requests,
        responseTime: newMetrics.latency,
        errorRate: newMetrics.errors,
        activeUsers: newMetrics.activeUsers
      });

      // Determine system status
      if (newMetrics.cpu > 90 || newMetrics.memory > 95 || newMetrics.errors > 5) {
        setSystemStatus('critical');
      } else if (newMetrics.cpu > 70 || newMetrics.memory > 80 || newMetrics.errors > 2) {
        setSystemStatus('warning');
      } else {
        setSystemStatus('healthy');
      }

    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const cacheStats = cache.getStats();
  const rateLimiterStats = rateLimiter.getStats();
  const scalerStatus = autoScaler.getStatus();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Production Dashboard</h1>
            <p className="text-muted-foreground">Real-time system monitoring and scaling</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`font-semibold ${getStatusColor()}`}>
              System {systemStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {systemStatus !== 'healthy' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              System performance degradation detected. Auto-scaling is active.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">CPU Usage</p>
                <p className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</p>
                <Progress value={metrics.cpu} className="mt-2" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Memory</p>
                <p className="text-2xl font-bold">{metrics.memory.toFixed(1)}%</p>
                <Progress value={metrics.memory} className="mt-2" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Requests/min</p>
                <p className="text-2xl font-bold">{metrics.requests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Latency</p>
                <p className="text-2xl font-bold">{metrics.latency.toFixed(0)}ms</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Error Rate</p>
                <p className="text-2xl font-bold">{metrics.errors.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="scaling" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scaling">Auto Scaling</TabsTrigger>
            <TabsTrigger value="cache">Cache Layer</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="cdn">CDN & Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="scaling" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Auto Scaling Status</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current Instances</span>
                    <Badge variant="secondary">{scalerStatus.currentInstances}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{scalerStatus.metrics.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={scalerStatus.metrics.cpuUsage} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>{scalerStatus.metrics.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={scalerStatus.metrics.memoryUsage} />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Scaling History</h3>
                </div>
                <div className="space-y-3">
                  {scalerStatus.lastScaling.map(([rule, timestamp], index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{rule.replace('_', ' ')}</span>
                      <span className="text-muted-foreground">
                        {new Date(timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Database className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Cache Statistics</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Hit Rate</span>
                    <span className="font-semibold">{(cacheStats.hitRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Items</span>
                    <span>{cacheStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired Items</span>
                    <span>{cacheStats.expired}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cache Usage</span>
                      <span>{((cacheStats.total / cacheStats.maxSize) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(cacheStats.total / cacheStats.maxSize) * 100} />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Hot Keys</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>trending_facts</span>
                    <Badge variant="outline">Hot</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>user_recommendations</span>
                    <Badge variant="outline">Warm</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>search_results</span>
                    <Badge variant="outline">Hot</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cache Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Clear Expired
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Warm Cache
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full">
                    Flush All
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Database className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Connection Pools</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Write Primary</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Main database cluster</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Read Replica</span>
                      <Badge variant="secondary">Healthy</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Read-only operations</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Analytics DB</span>
                      <Badge variant="secondary">Healthy</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Analytics workload</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Avg Query Time</span>
                    <span>45ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Queries</span>
                    <span>2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Connections</span>
                    <span>87/100</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Connection Usage</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold">Rate Limiting</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Keys</span>
                    <span>{rateLimiterStats.totalKeys}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocked Keys</span>
                    <span>{rateLimiterStats.blockedKeys}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Rules</span>
                    <span>{rateLimiterStats.rules.length}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Security Events</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>DDoS Attempts</span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate Limit Hits</span>
                    <Badge variant="secondary">127</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Suspicious IPs</span>
                    <Badge variant="outline">8</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cdn" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Globe className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">CDN Performance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Cache Hit Rate</span>
                    <span>94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bandwidth Saved</span>
                    <span>2.1 TB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time</span>
                    <span>23ms</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Regional Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>US East</span>
                    <Badge variant="default">18ms</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Europe</span>
                    <Badge variant="default">25ms</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Asia Pacific</span>
                    <Badge variant="secondary">31ms</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Image Optimization</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>WebP Conversion</span>
                    <span>87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AVIF Support</span>
                    <span>45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size Reduction</span>
                    <span>68%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
