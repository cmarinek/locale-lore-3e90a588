// Auto-scaling configuration for traffic spikes
export interface ScalingMetrics {
  cpuUsage: number;
  memoryUsage: number;
  requestRate: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
}

export interface ScalingRule {
  metric: keyof ScalingMetrics;
  threshold: number;
  operator: 'gt' | 'lt' | 'gte' | 'lte';
  action: 'scale_up' | 'scale_down';
  cooldown: number; // milliseconds
}

export class AutoScaler {
  private metrics: ScalingMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    requestRate: 0,
    responseTime: 0,
    errorRate: 0,
    activeUsers: 0
  };

  private rules: ScalingRule[] = [
    // Scale up rules
    { metric: 'cpuUsage', threshold: 70, operator: 'gt', action: 'scale_up', cooldown: 300000 }, // 5 min
    { metric: 'memoryUsage', threshold: 80, operator: 'gt', action: 'scale_up', cooldown: 300000 },
    { metric: 'requestRate', threshold: 1000, operator: 'gt', action: 'scale_up', cooldown: 180000 }, // 3 min
    { metric: 'responseTime', threshold: 2000, operator: 'gt', action: 'scale_up', cooldown: 300000 },
    { metric: 'errorRate', threshold: 5, operator: 'gt', action: 'scale_up', cooldown: 120000 }, // 2 min

    // Scale down rules
    { metric: 'cpuUsage', threshold: 20, operator: 'lt', action: 'scale_down', cooldown: 600000 }, // 10 min
    { metric: 'memoryUsage', threshold: 30, operator: 'lt', action: 'scale_down', cooldown: 600000 },
    { metric: 'requestRate', threshold: 100, operator: 'lt', action: 'scale_down', cooldown: 900000 }, // 15 min
  ];

  private lastScalingAction: Map<string, number> = new Map();
  private currentInstances = 1;
  private minInstances = 1;
  private maxInstances = 50;

  constructor(minInstances = 1, maxInstances = 50) {
    this.minInstances = minInstances;
    this.maxInstances = maxInstances;
    
    // Start metrics collection
    this.startMetricsCollection();
  }

  updateMetrics(newMetrics: Partial<ScalingMetrics>): void {
    this.metrics = { ...this.metrics, ...newMetrics };
    this.evaluateScaling();
  }

  private evaluateScaling(): void {
    const now = Date.now();
    
    for (const rule of this.rules) {
      const ruleKey = `${rule.metric}_${rule.action}`;
      const lastAction = this.lastScalingAction.get(ruleKey) || 0;
      
      // Check cooldown
      if (now - lastAction < rule.cooldown) {
        continue;
      }

      const metricValue = this.metrics[rule.metric];
      const shouldTrigger = this.checkThreshold(metricValue, rule.threshold, rule.operator);

      if (shouldTrigger) {
        this.executeScalingAction(rule.action, ruleKey, now);
        break; // Only execute one scaling action at a time
      }
    }
  }

  private checkThreshold(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  private executeScalingAction(action: string, ruleKey: string, timestamp: number): void {
    let newInstanceCount = this.currentInstances;

    if (action === 'scale_up' && this.currentInstances < this.maxInstances) {
      // Calculate scale up amount based on urgency
      const urgencyFactor = this.calculateUrgencyFactor();
      const scaleAmount = Math.ceil(this.currentInstances * urgencyFactor);
      newInstanceCount = Math.min(this.currentInstances + scaleAmount, this.maxInstances);
      
      console.log(`🚀 Scaling UP: ${this.currentInstances} → ${newInstanceCount} instances`);
      
    } else if (action === 'scale_down' && this.currentInstances > this.minInstances) {
      // Scale down more conservatively
      newInstanceCount = Math.max(
        Math.ceil(this.currentInstances * 0.8),
        this.minInstances
      );
      
      console.log(`📉 Scaling DOWN: ${this.currentInstances} → ${newInstanceCount} instances`);
    }

    if (newInstanceCount !== this.currentInstances) {
      this.currentInstances = newInstanceCount;
      this.lastScalingAction.set(ruleKey, timestamp);
      
      // Trigger actual scaling (would integrate with cloud provider)
      this.triggerInstanceScaling(newInstanceCount);
    }
  }

  private calculateUrgencyFactor(): number {
    // Calculate urgency based on multiple factors
    let urgency = 0.2; // Base 20% increase

    // CPU urgency
    if (this.metrics.cpuUsage > 90) urgency += 0.3;
    else if (this.metrics.cpuUsage > 80) urgency += 0.2;

    // Memory urgency
    if (this.metrics.memoryUsage > 90) urgency += 0.3;
    else if (this.metrics.memoryUsage > 85) urgency += 0.2;

    // Error rate urgency
    if (this.metrics.errorRate > 10) urgency += 0.4;
    else if (this.metrics.errorRate > 5) urgency += 0.2;

    // Response time urgency
    if (this.metrics.responseTime > 5000) urgency += 0.3;
    else if (this.metrics.responseTime > 3000) urgency += 0.2;

    return Math.min(urgency, 1.0); // Cap at 100%
  }

  private triggerInstanceScaling(targetInstances: number): void {
    // This would integrate with cloud provider APIs
    // For now, we'll simulate the scaling operation
    
    const scalingEvent = {
      timestamp: new Date().toISOString(),
      action: targetInstances > this.currentInstances ? 'scale_up' : 'scale_down',
      from: this.currentInstances,
      to: targetInstances,
      metrics: { ...this.metrics },
      reason: this.getScalingReason()
    };

    // Log scaling event
    console.log('Scaling Event:', scalingEvent);

    // Store scaling history for analysis
    this.storeScalingEvent(scalingEvent);

    // Notify monitoring systems
    this.notifyScalingEvent(scalingEvent);
  }

  private getScalingReason(): string {
    const reasons = [];
    
    if (this.metrics.cpuUsage > 70) reasons.push(`High CPU: ${this.metrics.cpuUsage}%`);
    if (this.metrics.memoryUsage > 80) reasons.push(`High Memory: ${this.metrics.memoryUsage}%`);
    if (this.metrics.requestRate > 1000) reasons.push(`High Request Rate: ${this.metrics.requestRate}/min`);
    if (this.metrics.responseTime > 2000) reasons.push(`Slow Response: ${this.metrics.responseTime}ms`);
    if (this.metrics.errorRate > 5) reasons.push(`High Error Rate: ${this.metrics.errorRate}%`);

    return reasons.join(', ') || 'Preventive scaling';
  }

  private storeScalingEvent(event: any): void {
    // Store in local storage or send to analytics
    const events = JSON.parse(localStorage.getItem('scaling_events') || '[]');
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('scaling_events', JSON.stringify(events));
  }

  private notifyScalingEvent(event: any): void {
    // Send to monitoring/alerting systems
    if ('customEvents' in window) {
      (window as any).customEvents.dispatchEvent(
        new CustomEvent('scaling-event', { detail: event })
      );
    }
  }

  private startMetricsCollection(): void {
    // Collect basic browser metrics
    setInterval(() => {
      this.collectBrowserMetrics();
    }, 30000); // Every 30 seconds

    // Listen to performance observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        this.processPerformanceEntries(list.getEntries());
      });
      
      observer.observe({ entryTypes: ['navigation', 'measure'] });
    }
  }

  private collectBrowserMetrics(): void {
    // Estimate metrics from browser APIs
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.updateMetrics({
        memoryUsage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      });
    }

    // Estimate CPU usage from timing
    const start = performance.now();
    // Simple CPU-intensive task
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.random();
    }
    const cpuTime = performance.now() - start;
    
    // Rough CPU usage estimation
    const estimatedCpuUsage = Math.min((cpuTime / 10) * 100, 100);
    
    this.updateMetrics({
      cpuUsage: estimatedCpuUsage
    });
  }

  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    for (const entry of entries) {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        this.updateMetrics({
          responseTime: navEntry.responseEnd - navEntry.requestStart
        });
      }
    }
  }

  getStatus() {
    return {
      currentInstances: this.currentInstances,
      metrics: this.metrics,
      lastScaling: Array.from(this.lastScalingAction.entries()),
      rules: this.rules.length
    };
  }
}

export const autoScaler = new AutoScaler();
