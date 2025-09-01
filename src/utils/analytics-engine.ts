
// Privacy-compliant analytics engine
export class AnalyticsEngine {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private consentGiven = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadConsentState();
    this.startBatchProcessing();
  }

  // Privacy compliance
  setUserConsent(consent: boolean) {
    this.consentGiven = consent;
    localStorage.setItem('analytics-consent', consent.toString());
    
    if (!consent) {
      this.clearStoredData();
    }
  }

  // Track user engagement events
  trackEngagement(action: string, properties: Record<string, any> = {}) {
    if (!this.consentGiven) return;

    const event: AnalyticsEvent = {
      type: 'engagement',
      action,
      properties: this.sanitizeProperties(properties),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.pathname,
    };

    this.addEvent(event);
  }

  // Track content performance
  trackContentPerformance(contentId: string, metrics: ContentMetrics) {
    if (!this.consentGiven) return;

    const event: AnalyticsEvent = {
      type: 'content_performance',
      action: 'view',
      properties: {
        contentId,
        ...metrics,
        dwellTime: metrics.dwellTime,
        scrollDepth: metrics.scrollDepth,
        engagement: metrics.engagement,
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.addEvent(event);
  }

  // Track geographic usage
  trackGeographicUsage(location: GeographicData) {
    if (!this.consentGiven) return;

    const event: AnalyticsEvent = {
      type: 'geographic',
      action: 'location_interaction',
      properties: {
        latitude: this.fuzzyLocation(location.latitude),
        longitude: this.fuzzyLocation(location.longitude),
        region: location.region,
        country: location.country,
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.addEvent(event);
  }

  // Track A/B test variants
  trackABTest(testName: string, variant: string, converted: boolean = false) {
    if (!this.consentGiven) return;

    const event: AnalyticsEvent = {
      type: 'ab_test',
      action: converted ? 'conversion' : 'exposure',
      properties: {
        testName,
        variant,
        converted,
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.addEvent(event);
  }

  // Track revenue events
  trackRevenue(amount: number, currency: string, type: string, properties: Record<string, any> = {}) {
    if (!this.consentGiven) return;

    const event: AnalyticsEvent = {
      type: 'revenue',
      action: type,
      properties: {
        amount,
        currency,
        ...properties,
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.addEvent(event);
  }

  // Track retention milestones
  trackRetention(milestone: string, daysActive: number) {
    if (!this.consentGiven) return;

    const event: AnalyticsEvent = {
      type: 'retention',
      action: milestone,
      properties: {
        daysActive,
        cohort: this.getCohortWeek(),
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.addEvent(event);
  }

  private addEvent(event: AnalyticsEvent) {
    this.events.push(event);
    
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  private async flushEvents() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId: this.sessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events to retry later
      this.events.unshift(...eventsToSend);
    }
  }

  private startBatchProcessing() {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadConsentState() {
    const stored = localStorage.getItem('analytics-consent');
    this.consentGiven = stored === 'true';
  }

  private clearStoredData() {
    this.events = [];
    localStorage.removeItem('analytics-session');
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Remove PII and sensitive data
      if (this.isSensitiveField(key)) {
        continue;
      }
      
      sanitized[key] = value;
    }
    
    return sanitized;
  }

  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = ['email', 'phone', 'password', 'ssn', 'creditCard'];
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  private fuzzyLocation(coordinate: number): number {
    // Add noise to coordinates for privacy (±0.01 degrees ≈ ±1km)
    return parseFloat((coordinate + (Math.random() - 0.5) * 0.02).toFixed(4));
  }

  private getCohortWeek(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${now.getFullYear()}-W${weekNumber}`;
  }
}

export interface AnalyticsEvent {
  type: 'engagement' | 'content_performance' | 'geographic' | 'ab_test' | 'revenue' | 'retention';
  action: string;
  properties: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
  url?: string;
}

export interface ContentMetrics {
  dwellTime: number;
  scrollDepth: number;
  engagement: 'low' | 'medium' | 'high';
  interactions: number;
}

export interface GeographicData {
  latitude: number;
  longitude: number;
  region: string;
  country: string;
}

export const analytics = new AnalyticsEngine();
