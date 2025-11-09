// Custom performance measurement utilities - SSOT for performance marks and measures

// Performance measurement with marks
export const measurePerformance = (name: string, fn: () => void): void => {
  if ('performance' in window && performance.mark) {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } else {
    fn();
  }
};

// Simple performance timing class
export class PerformanceTiming {
  private static measurements = new Map<string, number>();
  
  static start(label: string) {
    this.measurements.set(label, performance.now());
  }
  
  static end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.measurements.delete(label);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
}
