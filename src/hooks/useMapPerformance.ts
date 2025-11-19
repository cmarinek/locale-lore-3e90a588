import { useState, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  markerUpdateTime: number;
  dataFetchTime: number;
  renderTime: number;
  totalMemoryUsage: number;
  markerCount: number;
  factCount: number;
}

interface PerformanceEntry {
  timestamp: number;
  operation: string;
  duration: number;
  details?: any;
}

export const useMapPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    markerUpdateTime: 0,
    dataFetchTime: 0,
    renderTime: 0,
    totalMemoryUsage: 0,
    markerCount: 0,
    factCount: 0
  });
  
  const [performanceLog, setPerformanceLog] = useState<PerformanceEntry[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((operation: string) => {
    timers.current.set(operation, performance.now());
  }, []);

  const endTimer = useCallback((operation: string, details?: any) => {
    const startTime = timers.current.get(operation);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    timers.current.delete(operation);

    // Log performance entry
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operation,
      duration,
      details
    };

    setPerformanceLog(prev => [...prev.slice(-19), entry]); // Keep last 20 entries

    // Update metrics based on operation type
    setMetrics(prev => ({
      ...prev,
      [`${operation  }Time`]: duration,
      ...(details?.markerCount && { markerCount: details.markerCount }),
      ...(details?.factCount && { factCount: details.factCount })
    }));

    return duration;
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      
      setMetrics(prev => ({
        ...prev,
        totalMemoryUsage: memoryUsage
      }));
      
      return memoryUsage;
    }
    return 0;
  }, []);

  const logMapOperation = useCallback((operation: string, details?: any) => {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operation,
      duration: 0,
      details
    };
    setPerformanceLog(prev => [...prev.slice(-19), entry]);
  }, []);

  const getAverageTime = useCallback((operation: string) => {
    const entries = performanceLog.filter(entry => entry.operation === operation);
    if (entries.length === 0) return 0;
    
    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / entries.length;
  }, [performanceLog]);

  const getPerformanceReport = useCallback(() => {
    return {
      current: metrics,
      averages: {
        markerUpdate: getAverageTime('markerUpdate'),
        dataFetch: getAverageTime('dataFetch'),
        render: getAverageTime('render')
      },
      recentOperations: performanceLog.slice(-10),
      recommendations: generateRecommendations(metrics, performanceLog)
    };
  }, [metrics, performanceLog, getAverageTime]);

  const clearLog = useCallback(() => {
    setPerformanceLog([]);
  }, []);

  return {
    metrics,
    performanceLog,
    startTimer,
    endTimer,
    measureMemoryUsage,
    logMapOperation,
    getAverageTime,
    getPerformanceReport,
    clearLog
  };
};

function generateRecommendations(metrics: PerformanceMetrics, log: PerformanceEntry[]): string[] {
  const recommendations: string[] = [];

  // Check for slow marker updates
  if (metrics.markerUpdateTime > 100) {
    recommendations.push('Consider reducing marker count or implementing marker pooling');
  }

  // Check for slow data fetching
  if (metrics.dataFetchTime > 2000) {
    recommendations.push('Data fetching is slow - consider implementing better caching');
  }

  // Check for high memory usage
  if (metrics.totalMemoryUsage > 100) {
    recommendations.push('High memory usage detected - consider cleaning up unused markers');
  }

  // Check for too many markers
  if (metrics.markerCount > 500) {
    recommendations.push('High marker count - consider increasing clustering threshold');
  }

  // Check for frequent operations
  const recentUpdates = log.filter(entry => 
    entry.operation === 'markerUpdate' && 
    Date.now() - entry.timestamp < 5000
  );
  
  if (recentUpdates.length > 5) {
    recommendations.push('Frequent marker updates detected - consider debouncing map events');
  }

  return recommendations;
}