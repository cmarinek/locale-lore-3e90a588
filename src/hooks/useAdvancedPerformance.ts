import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceMonitor2025, PERFORMANCE_BUDGETS } from '@/utils/performance-core-2025';

interface AdvancedPerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  budgetCompliance: {
    lcp: boolean;
    fid: boolean;
    cls: boolean;
    ttfb: boolean;
    fcp: boolean;
  };
  performanceScore: number;
}

export const useAdvancedPerformance = (enabled = true) => {
  const [metrics, setMetrics] = useState<AdvancedPerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    budgetCompliance: {
      lcp: true,
      fid: true,
      cls: true,
      ttfb: true,
      fcp: true,
    },
    performanceScore: 100,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number>();
  const renderStart = useRef<number>();

  // Ultra-precise FPS monitoring
  const measureFrame = useCallback(() => {
    if (!enabled) return;

    const now = performance.now();
    frameCount.current++;
    
    // Measure every 60 frames for precision
    if (frameCount.current >= 60) {
      const deltaTime = now - lastTime.current;
      const fps = Math.round(60000 / deltaTime);
      const frameTime = deltaTime / 60;
      
      setMetrics(prev => ({ 
        ...prev, 
        fps,
        frameTime,
        renderTime: renderStart.current ? now - renderStart.current : prev.renderTime
      }));
      
      frameCount.current = 0;
      lastTime.current = now;
    }
    
    animationId.current = requestAnimationFrame(measureFrame);
  }, [enabled]);

  // Memory monitoring
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Network latency monitoring
  const monitorNetwork = useCallback(() => {
    const startTime = performance.now();
    
    // Use a lightweight ping to measure network latency
    fetch('/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-cache'
    }).then(() => {
      const latency = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, networkLatency: latency }));
    }).catch(() => {
      // Silent fail - network monitoring is optional
    });
  }, []);

  // Budget compliance monitoring
  const monitorBudgets = useCallback(() => {
    const budgetCompliance = performanceMonitor2025.getBudgetStatus();
    
    // Calculate overall performance score
    const scores = Object.values(budgetCompliance);
    const performanceScore = (scores.filter(Boolean).length / scores.length) * 100;
    
    setMetrics(prev => ({ 
      ...prev, 
      budgetCompliance,
      performanceScore 
    }));
  }, []);

  // Start render measurement
  const startRender = useCallback(() => {
    renderStart.current = performance.now();
    performanceMonitor2025.mark('render-start');
  }, []);

  // End render measurement
  const endRender = useCallback(() => {
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current;
      performanceMonitor2025.mark('render-end');
      performanceMonitor2025.measure('render-time', 'render-start', 'render-end');
      
      setMetrics(prev => ({ ...prev, renderTime }));
      renderStart.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Start FPS monitoring
    lastTime.current = performance.now();
    animationId.current = requestAnimationFrame(measureFrame);

    // Monitor memory every 5 seconds
    const memoryInterval = setInterval(monitorMemory, 5000);
    
    // Monitor network every 30 seconds
    const networkInterval = setInterval(monitorNetwork, 30000);
    
    // Monitor budgets every 10 seconds
    const budgetInterval = setInterval(monitorBudgets, 10000);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      clearInterval(memoryInterval);
      clearInterval(networkInterval);
      clearInterval(budgetInterval);
    };
  }, [enabled, measureFrame, monitorMemory, monitorNetwork, monitorBudgets]);

  return {
    metrics,
    startRender,
    endRender,
    isPerformanceExcellent: metrics.performanceScore >= 95,
    isPerformanceGood: metrics.performanceScore >= 80,
    getOptimizationSuggestions: () => {
      const suggestions = [];
      
      if (metrics.fps < 55) {
        suggestions.push('Consider reducing animation complexity or frequency');
      }
      
      if (metrics.memoryUsage > 100) {
        suggestions.push('Memory usage is high - consider optimizing data structures');
      }
      
      if (metrics.networkLatency > 200) {
        suggestions.push('Network latency is high - consider CDN or caching improvements');
      }
      
      if (!metrics.budgetCompliance.lcp) {
        suggestions.push('Largest Contentful Paint exceeds budget - optimize critical rendering path');
      }
      
      return suggestions;
    }
  };
};