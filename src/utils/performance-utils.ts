/**
 * Performance Optimization Utilities
 * 
 * Tools for measuring and optimizing app performance
 */

/**
 * Core Web Vitals monitoring
 */
export interface WebVitals {
  LCP: number; // Largest Contentful Paint - should be <2.5s
  FID: number; // First Input Delay - should be <100ms
  CLS: number; // Cumulative Layout Shift - should be <0.1
  TTFB: number; // Time to First Byte
  FCP: number; // First Contentful Paint
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  webVitals: WebVitals;
  resourceTiming: {
    totalResources: number;
    totalSize: number;
    scriptSize: number;
    styleSize: number;
    imageSize: number;
    fontSize: number;
  };
  renderMetrics: {
    totalRenderTime: number;
    componentRenderCount: number;
    reRenderCount: number;
  };
}

/**
 * Measure Core Web Vitals using Web Vitals API
 */
export function measureWebVitals(): Promise<Partial<WebVitals>> {
  return new Promise((resolve) => {
    const vitals: Partial<WebVitals> = {};
    
    // Use web-vitals library if available
    if ('web-vitals' in window) {
      import('web-vitals').then(({ onLCP, onINP, onCLS, onTTFB, onFCP }) => {
        onLCP((metric) => { vitals.LCP = metric.value; });
        onINP((metric) => { vitals.FID = metric.value; }); // INP replaced FID in web-vitals v3
        onCLS((metric) => { vitals.CLS = metric.value; });
        onTTFB((metric) => { vitals.TTFB = metric.value; });
        onFCP((metric) => { vitals.FCP = metric.value; });
        
        setTimeout(() => resolve(vitals), 1000);
      }).catch(() => {
        // Fallback if web-vitals fails to load
        resolve(vitals);
      });
    } else {
      // Fallback to Performance API
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            vitals.LCP = entry.startTime;
          } else if (entry.entryType === 'first-input') {
            vitals.FID = (entry as any).processingStart - entry.startTime;
          } else if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            vitals.CLS = (vitals.CLS || 0) + (entry as any).value;
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        vitals.TTFB = navigation.responseStart - navigation.requestStart;
        vitals.FCP = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      }
      
      setTimeout(() => {
        observer.disconnect();
        resolve(vitals);
      }, 3000);
    }
  });
}

/**
 * Analyze resource performance
 */
export function analyzeResources(): PerformanceMetrics['resourceTiming'] {
  const resources = performance.getEntriesByType('resource');
  
  const timing = {
    totalResources: resources.length,
    totalSize: 0,
    scriptSize: 0,
    styleSize: 0,
    imageSize: 0,
    fontSize: 0,
  };
  
  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    timing.totalSize += size;
    
    if (resource.name.includes('.js')) {
      timing.scriptSize += size;
    } else if (resource.name.includes('.css')) {
      timing.styleSize += size;
    } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)/)) {
      timing.imageSize += size;
    } else if (resource.name.match(/\.(woff|woff2|ttf|otf)/)) {
      timing.fontSize += size;
    }
  });
  
  return timing;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100  } ${  sizes[i]}`;
}

/**
 * Check if Core Web Vitals meet targets
 */
export function checkWebVitalsTargets(vitals: Partial<WebVitals>): {
  passed: boolean;
  results: Record<string, { value: number; target: number; passed: boolean }>;
} {
  const targets = {
    LCP: { value: vitals.LCP || 0, target: 2500, passed: (vitals.LCP || Infinity) < 2500 },
    FID: { value: vitals.FID || 0, target: 100, passed: (vitals.FID || Infinity) < 100 },
    CLS: { value: vitals.CLS || 0, target: 0.1, passed: (vitals.CLS || Infinity) < 0.1 },
  };
  
  const passed = Object.values(targets).every(t => t.passed);
  
  return { passed, results: targets };
}

/**
 * Image optimization checker
 */
export function checkImageOptimization(): {
  total: number;
  unoptimized: Array<{ src: string; size?: number; format: string }>;
  recommendations: string[];
} {
  const images = document.querySelectorAll('img');
  const unoptimized: Array<{ src: string; size?: number; format: string }> = [];
  const recommendations: string[] = [];
  
  images.forEach((img) => {
    const src = img.src;
    
    // Check if not lazy loaded
    if (!img.loading || img.loading !== 'lazy') {
      recommendations.push(`Image ${src} should use loading="lazy"`);
    }
    
    // Check format
    const format = src.split('.').pop()?.toLowerCase() || '';
    if (!['webp', 'avif'].includes(format)) {
      unoptimized.push({ src, format });
    }
    
    // Check if proper width/height set
    if (!img.width || !img.height) {
      recommendations.push(`Image ${src} missing width/height (causes CLS)`);
    }
  });
  
  return {
    total: images.length,
    unoptimized,
    recommendations,
  };
}

/**
 * Check for render-blocking resources
 */
export function checkRenderBlocking(): {
  blocking: Array<{ url: string; type: string; size: number }>;
  recommendations: string[];
} {
  const resources = performance.getEntriesByType('resource');
  const blocking: Array<{ url: string; type: string; size: number }> = [];
  const recommendations: string[] = [];

  resources.forEach((resource) => {
    // Check for synchronous scripts (blocking by nature if not async/defer)
    if (resource.name.includes('.js') && resource.initiatorType === 'script') {
      blocking.push({
        url: resource.name,
        type: 'script',
        size: resource.transferSize,
      });
      recommendations.push(`Script ${resource.name} may be render-blocking. Consider async/defer.`);
    }
    
    // Check for stylesheets (blocking by nature)
    if (resource.name.includes('.css') && resource.initiatorType === 'link') {
      blocking.push({
        url: resource.name,
        type: 'stylesheet',
        size: resource.transferSize,
      });
      recommendations.push(`Stylesheet ${resource.name} is render-blocking. Consider critical CSS.`);
    }
  });
  
  return { blocking, recommendations };
}

/**
 * Bundle size analyzer
 */
export function analyzeBundleSize(): {
  totalJSSize: number;
  totalCSSSize: number;
  vendorSize: number;
  appSize: number;
  recommendations: string[];
} {
  const resources = performance.getEntriesByType('resource');
  const recommendations: string[] = [];
  
  let totalJSSize = 0;
  let totalCSSSize = 0;
  let vendorSize = 0;
  let appSize = 0;
  
  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    
    if (resource.name.includes('.js')) {
      totalJSSize += size;
      
      if (resource.name.includes('vendor') || resource.name.includes('node_modules')) {
        vendorSize += size;
      } else {
        appSize += size;
      }
    } else if (resource.name.includes('.css')) {
      totalCSSSize += size;
    }
  });
  
  // Check if JS bundle is too large
  if (totalJSSize > 500000) { // 500KB
    recommendations.push('JavaScript bundle exceeds 500KB. Consider code splitting.');
  }
  
  // Check if vendor chunk is too large
  if (vendorSize > 300000) { // 300KB
    recommendations.push('Vendor bundle exceeds 300KB. Consider splitting vendor chunks.');
  }
  
  return {
    totalJSSize,
    totalCSSSize,
    vendorSize,
    appSize,
    recommendations,
  };
}

/**
 * Generate performance report
 */
export async function generatePerformanceReport(): Promise<{
  timestamp: string;
  url: string;
  webVitals: Partial<WebVitals>;
  webVitalsTargets: ReturnType<typeof checkWebVitalsTargets>;
  resources: ReturnType<typeof analyzeResources>;
  images: ReturnType<typeof checkImageOptimization>;
  renderBlocking: ReturnType<typeof checkRenderBlocking>;
  bundleSize: ReturnType<typeof analyzeBundleSize>;
  overallScore: number;
}> {
  const webVitals = await measureWebVitals();
  const webVitalsTargets = checkWebVitalsTargets(webVitals);
  const resources = analyzeResources();
  const images = checkImageOptimization();
  const renderBlocking = checkRenderBlocking();
  const bundleSize = analyzeBundleSize();
  
  // Calculate overall score (0-100)
  let score = 100;
  
  // Deduct for Web Vitals failures
  if (!webVitalsTargets.results.LCP.passed) score -= 20;
  if (!webVitalsTargets.results.FID.passed) score -= 20;
  if (!webVitalsTargets.results.CLS.passed) score -= 20;
  
  // Deduct for unoptimized images
  if (images.unoptimized.length > 0) score -= 10;
  
  // Deduct for render-blocking resources
  if (renderBlocking.blocking.length > 0) score -= 15;
  
  // Deduct for large bundles
  if (bundleSize.totalJSSize > 500000) score -= 15;
  
  return {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    webVitals,
    webVitalsTargets,
    resources,
    images,
    renderBlocking,
    bundleSize,
    overallScore: Math.max(0, score),
  };
}

/**
 * Log performance report to console
 */
export function logPerformanceReport(report: Awaited<ReturnType<typeof generatePerformanceReport>>): void {
  console.group('🚀 Performance Report');
  console.log('URL:', report.url);
  console.log('Timestamp:', report.timestamp);
  console.log('Overall Score:', report.overallScore, '/100');
  
  console.group('📊 Core Web Vitals');
  Object.entries(report.webVitalsTargets.results).forEach(([key, value]) => {
    const icon = value.passed ? '✅' : '❌';
    console.log(`${icon} ${key}:`, value.value.toFixed(2), '/', value.target, value.passed ? 'PASS' : 'FAIL');
  });
  console.groupEnd();
  
  console.group('📦 Bundle Sizes');
  console.log('Total JS:', formatBytes(report.bundleSize.totalJSSize));
  console.log('Vendor:', formatBytes(report.bundleSize.vendorSize));
  console.log('App:', formatBytes(report.bundleSize.appSize));
  console.log('Total CSS:', formatBytes(report.bundleSize.totalCSSSize));
  console.groupEnd();
  
  console.group('🖼️ Images');
  console.log('Total Images:', report.images.total);
  console.log('Unoptimized:', report.images.unoptimized.length);
  if (report.images.recommendations.length > 0) {
    console.warn('Recommendations:', report.images.recommendations);
  }
  console.groupEnd();
  
  console.group('🚦 Render Blocking');
  console.log('Blocking Resources:', report.renderBlocking.blocking.length);
  if (report.renderBlocking.recommendations.length > 0) {
    console.warn('Recommendations:', report.renderBlocking.recommendations);
  }
  console.groupEnd();
  
  console.groupEnd();
}
