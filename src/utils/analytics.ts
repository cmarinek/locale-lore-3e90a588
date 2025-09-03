
import { config } from '@/config/environments';

// Privacy-focused analytics
export class PrivacyAnalytics {
  private initialized = false;
  private consentGiven = false;

  constructor() {
    this.loadConsentState();
  }

  // Initialize analytics with user consent
  public initialize() {
    if (this.initialized || !config.enableAnalytics) return;

    // Load Google Analytics or alternative privacy-focused solution
    if (this.consentGiven && config.analyticsId) {
      this.loadGoogleAnalytics();
    } else {
      // Use privacy-focused alternative (e.g., Plausible, Fathom)
      this.loadPrivacyAnalytics();
    }

    this.initialized = true;
  }

  // Request user consent for analytics
  public requestConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      // Show consent dialog
      const consent = window.confirm(
        'We use privacy-focused analytics to improve our service. No personal data is collected. Allow analytics?'
      );
      
      this.setConsent(consent);
      resolve(consent);
    });
  }

  // Set user consent
  public setConsent(consent: boolean) {
    this.consentGiven = consent;
    localStorage.setItem('analytics-consent', consent.toString());
    
    if (consent && !this.initialized) {
      this.initialize();
    }
  }

  // Track page views
  public trackPageView(path: string, title?: string) {
    if (!this.initialized) return;

    if (this.consentGiven && (window as any).gtag) {
      (window as any).gtag('config', config.analyticsId, {
        page_path: path,
        page_title: title,
      });
    } else {
      // Privacy-focused alternative
      this.trackPrivacyEvent('pageview', { path, title });
    }
  }

  // Track custom events
  public trackEvent(name: string, parameters?: Record<string, any>) {
    if (!this.initialized) return;

    if (this.consentGiven && (window as any).gtag) {
      (window as any).gtag('event', name, parameters);
    } else {
      this.trackPrivacyEvent(name, parameters);
    }
  }

  private loadConsentState() {
    const stored = localStorage.getItem('analytics-consent');
    this.consentGiven = stored === 'true';
  }

  private loadGoogleAnalytics() {
    if (!config.analyticsId) return;

    // Load GA4
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.analyticsId}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function(...args: any[]) {
        (window as any).dataLayer.push(args);
      };
      
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', config.analyticsId, {
        anonymize_ip: true,
        respect_dnt: true,
      });
    };
  }

  private loadPrivacyAnalytics() {
    // Example: Load Plausible or similar privacy-focused analytics
    const script = document.createElement('script');
    script.src = 'https://plausible.io/js/plausible.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-domain', window.location.hostname);
    document.head.appendChild(script);
  }

  private trackPrivacyEvent(name: string, data?: Record<string, any>) {
    // Send to privacy-focused analytics service
    if ((window as any).plausible) {
      (window as any).plausible(name, { props: data });
    }
  }
}

export const analytics = new PrivacyAnalytics();
