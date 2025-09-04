import { productionConfig } from '@/config/production';

export interface ProductionReadinessCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

export const runProductionReadinessChecks = (): ProductionReadinessCheck[] => {
  const checks: ProductionReadinessCheck[] = [];

  // Environment checks
  checks.push({
    name: 'Environment Variables',
    status: process.env.NODE_ENV === 'production' ? 'pass' : 'warning',
    message: process.env.NODE_ENV === 'production' 
      ? 'Running in production mode' 
      : 'Not running in production mode',
    critical: false
  });

  // Security checks
  checks.push({
    name: 'HTTPS Enforcement',
    status: window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'pass' : 'fail',
    message: window.location.protocol === 'https:' 
      ? 'HTTPS is enabled' 
      : 'HTTPS is not enabled - required for production',
    critical: true
  });

  // Performance checks
  checks.push({
    name: 'Service Worker',
    status: 'serviceWorker' in navigator ? 'pass' : 'warning',
    message: 'serviceWorker' in navigator 
      ? 'Service worker support available' 
      : 'Service worker not supported',
    critical: false
  });

  // Error tracking
  checks.push({
    name: 'Error Tracking',
    status: productionConfig.ENABLE_ERROR_TRACKING ? 'pass' : 'warning',
    message: productionConfig.ENABLE_ERROR_TRACKING 
      ? 'Error tracking enabled' 
      : 'Error tracking disabled',
    critical: false
  });

  // Database connection
  checks.push({
    name: 'Database Connection',
    status: 'warning', // This would need to be checked dynamically
    message: 'Database connection should be verified',
    critical: true
  });

  return checks;
};

export const getProductionReadinessScore = (): number => {
  const checks = runProductionReadinessChecks();
  const passedChecks = checks.filter(check => check.status === 'pass').length;
  return Math.round((passedChecks / checks.length) * 100);
};

export const getCriticalIssues = (): ProductionReadinessCheck[] => {
  return runProductionReadinessChecks().filter(
    check => check.critical && check.status === 'fail'
  );
};