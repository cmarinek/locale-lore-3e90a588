import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  renderTime: number;
}

interface PerformanceThresholds {
  minFps: number;
  maxFrameTime: number;
  maxRenderTime: number;
}

export const usePerformanceMonitor = (
  enabled = true,
  thresholds: PerformanceThresholds = {
    minFps: 50,
    maxFrameTime: 20,
    maxRenderTime: 16
  }
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16,
    renderTime: 0
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number>();
  const renderStartTime = useRef<number>();
  const [isWarningShown, setIsWarningShown] = useState(false);

  const measureFrame = useCallback(() => {
    if (!enabled) return;

    const now = performance.now();
    frameCount.current++;
    
    const deltaTime = now - lastTime.current;
    
    // Calculate FPS every 60 frames
    if (frameCount.current >= 60) {
      const fps = Math.round(60000 / deltaTime);
      const frameTime = deltaTime / 60;
      
      const newMetrics: PerformanceMetrics = {
        fps,
        frameTime,
        renderTime: renderStartTime.current ? now - renderStartTime.current : 0
      };

      // Add memory usage if available
      if ('memory' in performance) {
        newMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      }

      setMetrics(newMetrics);
      
      // Performance warnings
      if (fps < thresholds.minFps && !isWarningShown) {
        console.warn(`⚠️ Performance warning: FPS dropped to ${fps}`);
        if (fps < 30) {
          toast({
            title: "Performance Warning",
            description: `Frame rate dropped to ${fps} FPS. Consider reducing map complexity.`,
            variant: "destructive"
          });
          setIsWarningShown(true);
          setTimeout(() => setIsWarningShown(false), 5000);
        }
      }
      
      frameCount.current = 0;
      lastTime.current = now;
    }
    
    animationId.current = requestAnimationFrame(measureFrame);
  }, [enabled, thresholds, isWarningShown]);

  const startRenderMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRenderMeasurement = useCallback(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
      renderStartTime.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      lastTime.current = performance.now();
      animationId.current = requestAnimationFrame(measureFrame);
    }

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [enabled, measureFrame]);

  return {
    metrics,
    startRenderMeasurement,
    endRenderMeasurement,
    isPerformanceGood: metrics.fps >= thresholds.minFps
  };
};