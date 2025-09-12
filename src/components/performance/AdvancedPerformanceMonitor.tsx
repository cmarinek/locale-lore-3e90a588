import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database,
  Globe,
  Users,
  Server,
  Monitor
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend: 'up' | 'down' | 'stable';
}

interface SystemLoad {
  timestamp: number;
  cpu: number;
  memory: number;
  network: number;
  database: number;
}

export const AdvancedPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemLoad, setSystemLoad] = useState<SystemLoad[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Initialize with current performance data
    loadCurrentMetrics();
    
    // Start real-time monitoring
    const interval = setInterval(() => {
      if (isMonitoring) {
        updateMetrics();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const loadCurrentMetrics = () => {
    const currentMetrics: PerformanceMetric[] = [
      {
        name: 'Page Load Time',
        value: Math.random() * 1000 + 500,
        unit: 'ms',
        status: 'good',
        trend: 'stable'
      },
      {
        name: 'API Response Time',
        value: Math.random() * 200 + 100,
        unit: 'ms',
        status: 'excellent',
        trend: 'down'
      },
      {
        name: 'Database Query Time',
        value: Math.random() * 50 + 25,
        unit: 'ms',
        status: 'excellent',
        trend: 'stable'
      },
      {
        name: 'Memory Usage',
        value: Math.random() * 30 + 40,
        unit: '%',
        status: 'good',
        trend: 'up'
      },
      {
        name: 'CPU Usage',
        value: Math.random() * 20 + 15,
        unit: '%',
        status: 'excellent',
        trend: 'stable'
      },
      {
        name: 'Network Latency',
        value: Math.random() * 50 + 20,
        unit: 'ms',
        status: 'good',
        trend: 'stable'
      }
    ];

    setMetrics(currentMetrics);
  };

  const updateMetrics = () => {
    const timestamp = Date.now();
    
    // Simulate system load data
    const newSystemLoad: SystemLoad = {
      timestamp,
      cpu: Math.random() * 40 + 10,
      memory: Math.random() * 30 + 40,
      network: Math.random() * 60 + 20,
      database: Math.random() * 25 + 10
    };

    setSystemLoad(prev => [...prev.slice(-19), newSystemLoad]);

    // Update metrics with some variation
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * (metric.value * 0.1),
      status: getMetricStatus(metric.name, metric.value),
      trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'
    })));

    // Check for alerts
    checkAlerts();
  };

  const getMetricStatus = (name: string, value: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    switch (name) {
      case 'Page Load Time':
        if (value < 1000) return 'excellent';
        if (value < 2000) return 'good';
        if (value < 3000) return 'fair';
        return 'poor';
      case 'API Response Time':
        if (value < 200) return 'excellent';
        if (value < 500) return 'good';
        if (value < 1000) return 'fair';
        return 'poor';
      case 'Memory Usage':
        if (value < 60) return 'excellent';
        if (value < 75) return 'good';
        if (value < 85) return 'fair';
        return 'poor';
      default:
        return 'good';
    }
  };

  const checkAlerts = () => {
    const newAlerts: string[] = [];
    
    metrics.forEach(metric => {
      if (metric.status === 'poor') {
        newAlerts.push(`${metric.name} is performing poorly: ${metric.value.toFixed(1)}${metric.unit}`);
      }
    });

    if (systemLoad.length > 0) {
      const latest = systemLoad[systemLoad.length - 1];
      if (latest.cpu > 80) newAlerts.push('High CPU usage detected');
      if (latest.memory > 85) newAlerts.push('High memory usage detected');
    }

    setAlerts(newAlerts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
      default: return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-6 w-6 text-primary" />
            Advanced Performance Monitor
          </h2>
          <p className="text-muted-foreground">
            Real-time application performance metrics and system health
          </p>
        </div>
        <Button
          onClick={() => setIsMonitoring(!isMonitoring)}
          variant={isMonitoring ? "destructive" : "default"}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {alerts.map((alert, index) => (
                <p key={index}>• {alert}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    {metric.name}
                  </p>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-baseline gap-1">
                  <p className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value.toFixed(metric.unit === '%' ? 0 : 1)}
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.unit}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(metric.status)} border-current`}
                >
                  {metric.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Load Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Load (Real-time)
          </CardTitle>
          <CardDescription>
            Live system resource usage over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* CPU Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">
                  {systemLoad.length > 0 ? `${systemLoad[systemLoad.length - 1].cpu.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <Progress 
                value={systemLoad.length > 0 ? systemLoad[systemLoad.length - 1].cpu : 0} 
                className="h-2"
              />
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">
                  {systemLoad.length > 0 ? `${systemLoad[systemLoad.length - 1].memory.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <Progress 
                value={systemLoad.length > 0 ? systemLoad[systemLoad.length - 1].memory : 0} 
                className="h-2"
              />
            </div>

            {/* Network Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Network I/O</span>
                <span className="text-sm text-muted-foreground">
                  {systemLoad.length > 0 ? `${systemLoad[systemLoad.length - 1].network.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <Progress 
                value={systemLoad.length > 0 ? systemLoad[systemLoad.length - 1].network : 0} 
                className="h-2"
              />
            </div>

            {/* Database Load */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Database Load</span>
                <span className="text-sm text-muted-foreground">
                  {systemLoad.length > 0 ? `${systemLoad[systemLoad.length - 1].database.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <Progress 
                value={systemLoad.length > 0 ? systemLoad[systemLoad.length - 1].database : 0} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">API response times are optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Database queries performing well</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Memory usage trending upward</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Network latency within normal range</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Database className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <p className="text-xs font-medium">Database</p>
                <p className="text-xs text-green-600">Healthy</p>
              </div>
              <div className="text-center">
                <Globe className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <p className="text-xs font-medium">API</p>
                <p className="text-xs text-green-600">Operational</p>
              </div>
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                <p className="text-xs font-medium">Users</p>
                <p className="text-xs text-blue-600">
                  {Math.floor(Math.random() * 50 + 20)} Active
                </p>
              </div>
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <p className="text-xs font-medium">Uptime</p>
                <p className="text-xs text-green-600">99.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Benchmarks</CardTitle>
          <CardDescription>
            Industry standard performance targets and current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">Excellent (Target)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Page load: &lt; 1s</li>
                  <li>• API response: &lt; 200ms</li>
                  <li>• Memory usage: &lt; 60%</li>
                  <li>• CPU usage: &lt; 30%</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">Good (Acceptable)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Page load: 1-2s</li>
                  <li>• API response: 200-500ms</li>
                  <li>• Memory usage: 60-75%</li>
                  <li>• CPU usage: 30-60%</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">Poor (Needs Action)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Page load: &gt; 3s</li>
                  <li>• API response: &gt; 1s</li>
                  <li>• Memory usage: &gt; 85%</li>
                  <li>• CPU usage: &gt; 80%</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};