
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/utils/analytics-engine';

interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
  trackClicks?: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const location = useLocation();
  const {
    trackPageViews = true,
    trackScrollDepth = true,
    trackTimeOnPage = true,
    trackClicks = true,
  } = options;

  // Track page views
  useEffect(() => {
    if (trackPageViews) {
      analytics.trackEngagement('page_view', {
        path: location.pathname,
        search: location.search,
        title: document.title,
      });
    }
  }, [location, trackPageViews]);

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth) return;

    let maxScroll = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        analytics.trackEngagement('scroll', {
          maxDepth: maxScroll,
          currentDepth: scrollPercent,
          path: location.pathname,
        });
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [location.pathname, trackScrollDepth]);

  // Track time on page
  useEffect(() => {
    if (!trackTimeOnPage) return;

    const startTime = Date.now();
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    const trackTimeSpent = () => {
      if (isVisible) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        analytics.trackEngagement('time_on_page', {
          duration: timeSpent,
          path: location.pathname,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', trackTimeSpent);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', trackTimeSpent);
      trackTimeSpent();
    };
  }, [location.pathname, trackTimeOnPage]);

  // Track clicks
  useEffect(() => {
    if (!trackClicks) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      if (['a', 'button', 'input'].includes(tagName)) {
        analytics.trackEngagement('click', {
          element: tagName,
          text: target.textContent?.substring(0, 100) || '',
          href: target.getAttribute('href') || '',
          path: location.pathname,
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [location.pathname, trackClicks]);

  // Manual tracking functions
  const trackCustomEvent = useCallback((action: string, properties: Record<string, any> = {}) => {
    analytics.trackEngagement(action, {
      ...properties,
      path: location.pathname,
    });
  }, [location.pathname]);

  const trackConversion = useCallback((goal: string, value?: number) => {
    analytics.trackEngagement('conversion', {
      goal,
      value,
      path: location.pathname,
    });
  }, [location.pathname]);

  return {
    trackCustomEvent,
    trackConversion,
  };
};

// Hook for tracking form interactions
export const useFormAnalytics = (formName: string) => {
  const { trackCustomEvent } = useAnalytics({ trackPageViews: false });

  const trackFormStart = useCallback(() => {
    trackCustomEvent('form_start', { formName });
  }, [formName, trackCustomEvent]);

  const trackFormComplete = useCallback(() => {
    trackCustomEvent('form_complete', { formName });
  }, [formName, trackCustomEvent]);

  const trackFormAbandonment = useCallback((step: string) => {
    trackCustomEvent('form_abandon', { formName, step });
  }, [formName, trackCustomEvent]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    trackCustomEvent('field_focus', { formName, fieldName });
  }, [formName, trackCustomEvent]);

  return {
    trackFormStart,
    trackFormComplete,
    trackFormAbandonment,
    trackFieldFocus,
  };
};
