import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  networkLatency: number;
  errorRate: number;
  userSessions: number;
  mapLoadTime: number;
}

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertRule {
  metric: keyof PerformanceMetrics;
  threshold: number;
  operator: 'gt' | 'lt';
  severity: 'warning' | 'critical';
}

export function useProductionMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    networkLatency: 0,
    errorRate: 0,
    userSessions: 0,
    mapLoadTime: 0
  });

  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const alertRules: AlertRule[] = [
    { metric: 'fps', threshold: 30, operator: 'lt', severity: 'warning' },
    { metric: 'fps', threshold: 15, operator: 'lt', severity: 'critical' },
    { metric: 'memoryUsage', threshold: 100, operator: 'gt', severity: 'warning' },
    { metric: 'memoryUsage', threshold: 200, operator: 'gt', severity: 'critical' },
    { metric: 'networkLatency', threshold: 1000, operator: 'gt', severity: 'warning' },
    { metric: 'errorRate', threshold: 0.05, operator: 'gt', severity: 'critical' }
  ];

  // Real-time FPS monitoring
  const measureFPS = useCallback(() => {
    let fps = 0;
    let lastTime = performance.now();
    let frameCount = 0;

    const frame = (currentTime: number) => {
      frameCount++;
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      if (isMonitoring) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [isMonitoring]);

  // Memory usage monitoring
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      setMetrics(prev => ({ ...prev, memoryUsage: usage }));
    }
  }, []);

  // Network latency measurement
  const measureLatency = useCallback(async () => {
    const start = performance.now();
    try {
      await fetch('/api/ping', { method: 'HEAD' });
      const latency = performance.now() - start;
      setMetrics(prev => ({ ...prev, networkLatency: latency }));
    } catch (error) {
      console.warn('Latency measurement failed:', error);
    }
  }, []);

  // Error reporting
  const reportError = useCallback(async (error: Error, severity: ErrorReport['severity'] = 'medium') => {
    const errorReport: ErrorReport = {
      id: `error-${Date.now()}`,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity
    };

    try {
      // Store locally for now - you can extend with external error reporting
      setErrors(prev => [...prev, errorReport].slice(-50)); // Keep last 50 errors
      
      // Optional: Send to analytics
      console.error('Error reported:', errorReport);
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }, []);

  // Alert system
  const checkAlerts = useCallback(() => {
    const newAlerts: string[] = [];

    alertRules.forEach(rule => {
      const value = metrics[rule.metric];
      const threshold = rule.threshold;
      
      const triggered = rule.operator === 'gt' ? value > threshold : value < threshold;
      
      if (triggered) {
        const alertMessage = `${rule.severity.toUpperCase()}: ${rule.metric} is ${value} (threshold: ${rule.operator} ${threshold})`;
        newAlerts.push(alertMessage);
      }
    });

    setAlerts(newAlerts);
  }, [metrics]);

  // Map performance tracking
  const trackMapLoad = useCallback((loadTime: number) => {
    setMetrics(prev => ({ ...prev, mapLoadTime: loadTime }));
  }, []);

  // Analytics reporting
  const reportAnalytics = useCallback(async () => {
    try {
      await supabase.functions.invoke('collect-metrics', {
        body: {
          metrics,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      });
    } catch (error) {
      console.warn('Analytics reporting failed:', error);
    }
  }, [metrics]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    measureFPS();
    
    // Set up intervals
    const memoryInterval = setInterval(measureMemory, 5000);
    const latencyInterval = setInterval(measureLatency, 30000);
    const analyticsInterval = setInterval(reportAnalytics, 60000);

    return () => {
      setIsMonitoring(false);
      clearInterval(memoryInterval);
      clearInterval(latencyInterval);
      clearInterval(analyticsInterval);
    };
  }, [measureFPS, measureMemory, measureLatency, reportAnalytics]);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError(new Error(event.message), 'high');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(new Error(String(event.reason)), 'high');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError]);

  // Check alerts when metrics change
  useEffect(() => {
    checkAlerts();
  }, [metrics, checkAlerts]);

  return {
    metrics,
    errors,
    alerts,
    isMonitoring,
    startMonitoring,
    reportError,
    trackMapLoad
  };
}