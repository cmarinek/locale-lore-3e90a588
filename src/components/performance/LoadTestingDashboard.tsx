import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePerformanceMonitor } from '@/utils/performance';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';

interface LoadTestResult {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  requests: number;
  errors: number;
  avgResponseTime: number;
  throughput: number;
  status: 'running' | 'completed' | 'failed';
}

export const LoadTestingDashboard: React.FC = () => {
  const { monitor, markStart, markEnd } = usePerformanceMonitor();
  const [tests, setTests] = useState<LoadTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runLoadTest = async (testName: string, requests: number = 100) => {
    const testId = `load-test-${Date.now()}`;
    const newTest: LoadTestResult = {
      id: testId,
      name: testName,
      startTime: Date.now(),
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      throughput: 0,
      status: 'running'
    };

    setTests(prev => [...prev, newTest]);
    setIsRunning(true);
    markStart(testId);

    try {
      const responses: number[] = [];
      let errors = 0;

      // Simulate concurrent requests
      const batchSize = 10;
      const batches = Math.ceil(requests / batchSize);

      for (let i = 0; i < batches; i++) {
        const batchPromises = [];
        const currentBatchSize = Math.min(batchSize, requests - i * batchSize);

        for (let j = 0; j < currentBatchSize; j++) {
          batchPromises.push(
            fetch('/api/health-check', { 
              method: 'GET',
              cache: 'no-cache'
            })
            .then(response => {
              const responseTime = performance.now();
              responses.push(responseTime);
              return response.ok;
            })
            .catch(() => {
              errors++;
              return false;
            })
          );
        }

        await Promise.all(batchPromises);

        // Update progress
        setTests(prev => prev.map(test => 
          test.id === testId 
            ? { 
                ...test, 
                requests: (i + 1) * batchSize,
                errors,
                avgResponseTime: responses.length > 0 ? responses.reduce((a, b) => a + b, 0) / responses.length : 0
              }
            : test
        ));
      }

      const endTime = Date.now();
      const duration = endTime - newTest.startTime;
      const throughput = requests / (duration / 1000);

      markEnd(testId);

      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              endTime,
              requests,
              errors,
              avgResponseTime: responses.length > 0 ? responses.reduce((a, b) => a + b, 0) / responses.length : 0,
              throughput,
              status: errors > requests * 0.1 ? 'failed' : 'completed'
            }
          : test
      ));

    } catch (error) {
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'failed' as const }
          : test
      ));
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (status: LoadTestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="animate-pulse">Running</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getPerformanceScore = (test: LoadTestResult) => {
    if (test.status !== 'completed') return 0;
    
    const errorRate = test.errors / test.requests;
    const responseTimeScore = Math.max(0, 100 - (test.avgResponseTime / 10));
    const throughputScore = Math.min(100, test.throughput * 2);
    const errorScore = Math.max(0, 100 - (errorRate * 200));
    
    return Math.round((responseTimeScore + throughputScore + errorScore) / 3);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Load Testing Dashboard</h2>
          <p className="text-muted-foreground">Monitor application performance under load</p>
        </div>
        <div className="space-x-2">
          <Button 
            onClick={() => runLoadTest('API Endpoints', 50)}
            disabled={isRunning}
            variant="outline"
          >
            <Activity className="w-4 h-4 mr-2" />
            Light Load Test
          </Button>
          <Button 
            onClick={() => runLoadTest('Heavy Load', 200)}
            disabled={isRunning}
          >
            <Zap className="w-4 h-4 mr-2" />
            Heavy Load Test
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.filter(test => test.status === 'running').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.length > 0 
                ? Math.round((tests.filter(test => test.status === 'completed').length / tests.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.length > 0 
                ? Math.round(tests.reduce((acc, test) => acc + test.avgResponseTime, 0) / tests.length)
                : 0}ms
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Test Results</h3>
        {tests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No load tests run yet. Click a button above to start testing.
            </CardContent>
          </Card>
        ) : (
          tests.map(test => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Started {new Date(test.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Requests</p>
                    <p className="font-medium">{test.requests}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Errors</p>
                    <p className="font-medium text-destructive">{test.errors}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="font-medium">{Math.round(test.avgResponseTime)}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Throughput</p>
                    <p className="font-medium">{test.throughput.toFixed(1)} req/s</p>
                  </div>
                </div>
                
                {test.status === 'completed' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Performance Score</span>
                      <span className="text-sm font-medium">{getPerformanceScore(test)}/100</span>
                    </div>
                    <Progress value={getPerformanceScore(test)} className="h-2" />
                  </div>
                )}

                {test.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-medium">{test.requests}/200</span>
                    </div>
                    <Progress value={(test.requests / 200) * 100} className="h-2" />
                  </div>
                )}

                {test.errors > 0 && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Error rate: {((test.errors / test.requests) * 100).toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};