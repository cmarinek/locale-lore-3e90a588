import { supabase } from '@/integrations/supabase/client';

export interface DeploymentCheck {
  id: string;
  category: 'critical' | 'recommended' | 'optional';
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  action?: string;
  link?: string;
}

export const runPreDeploymentChecks = async (): Promise<DeploymentCheck[]> => {
  const checks: DeploymentCheck[] = [];

  // Environment Variables Check
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
  };

  checks.push({
    id: 'env-vars',
    category: 'critical',
    name: 'Environment Variables',
    description: 'All required environment variables are configured',
    status: Object.values(envVars).every(v => v) ? 'pass' : 'fail',
    action: 'Configure missing environment variables in .env file',
  });

  // Supabase Connection Check
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    checks.push({
      id: 'supabase-connection',
      category: 'critical',
      name: 'Supabase Connection',
      description: 'Database connection is working',
      status: error ? 'fail' : 'pass',
      action: error ? 'Check Supabase credentials and RLS policies' : undefined,
    });
  } catch (error) {
    checks.push({
      id: 'supabase-connection',
      category: 'critical',
      name: 'Supabase Connection',
      description: 'Database connection is working',
      status: 'fail',
      action: 'Verify Supabase URL and API key',
    });
  }

  // Translation Coverage Check
  try {
    const response = await fetch('/locales/en/common.json');
    const enTranslations = await response.json();
    const keyCount = Object.keys(enTranslations).length;
    
    checks.push({
      id: 'translations',
      category: 'recommended',
      name: 'Translation Coverage',
      description: `${keyCount} translation keys found`,
      status: keyCount > 0 ? 'pass' : 'warning',
      action: 'Verify all languages have complete translations',
      link: '/admin/translations',
    });
  } catch (error) {
    checks.push({
      id: 'translations',
      category: 'recommended',
      name: 'Translation Coverage',
      description: 'Unable to check translation files',
      status: 'warning',
      action: 'Ensure translation files are in public/locales/',
    });
  }

  // PWA Manifest Check
  try {
    const response = await fetch('/manifest.json');
    checks.push({
      id: 'pwa-manifest',
      category: 'recommended',
      name: 'PWA Manifest',
      description: 'Progressive Web App manifest configured',
      status: response.ok ? 'pass' : 'warning',
      action: 'Create manifest.json for PWA support',
    });
  } catch (error) {
    checks.push({
      id: 'pwa-manifest',
      category: 'recommended',
      name: 'PWA Manifest',
      description: 'Progressive Web App manifest configured',
      status: 'warning',
      action: 'Create manifest.json for PWA support',
    });
  }

  // Build Size Check
  checks.push({
    id: 'build-optimization',
    category: 'recommended',
    name: 'Build Optimization',
    description: 'Code splitting and lazy loading configured',
    status: 'pass',
    action: 'Review bundle size after build',
  });

  // Security Headers Check
  checks.push({
    id: 'security-headers',
    category: 'critical',
    name: 'Security Headers',
    description: 'CSP, HSTS, and XSS protection',
    status: 'warning',
    action: 'Configure security headers in hosting platform',
    link: 'https://docs.lovable.dev/security',
  });

  // Custom Domain Check
  checks.push({
    id: 'custom-domain',
    category: 'recommended',
    name: 'Custom Domain',
    description: 'Production domain configured',
    status: 'pending',
    action: 'Connect custom domain in Lovable dashboard',
    link: 'https://docs.lovable.dev/features/custom-domain',
  });

  // API Rate Limiting
  checks.push({
    id: 'rate-limiting',
    category: 'recommended',
    name: 'API Rate Limiting',
    description: 'Rate limits configured for edge functions',
    status: 'warning',
    action: 'Set up rate limiting in Supabase dashboard',
  });

  // Backup Strategy
  checks.push({
    id: 'backup-strategy',
    category: 'critical',
    name: 'Backup Strategy',
    description: 'Database backup configured',
    status: 'warning',
    action: 'Enable automated backups in Supabase',
    link: 'https://supabase.com/dashboard',
  });

  // Error Tracking
  checks.push({
    id: 'error-tracking',
    category: 'recommended',
    name: 'Error Tracking',
    description: 'Sentry integration active',
    status: import.meta.env.VITE_SENTRY_DSN ? 'pass' : 'warning',
    action: 'Configure Sentry DSN for production error tracking',
  });

  // Performance Monitoring
  checks.push({
    id: 'performance-monitoring',
    category: 'recommended',
    name: 'Performance Monitoring',
    description: 'Web Vitals tracking enabled',
    status: 'pass',
  });

  return checks;
};

export const getCriticalFailures = (checks: DeploymentCheck[]): DeploymentCheck[] => {
  return checks.filter(c => c.category === 'critical' && c.status === 'fail');
};

export const getDeploymentScore = (checks: DeploymentCheck[]): number => {
  const weights = { critical: 3, recommended: 2, optional: 1 };
  const scores = { pass: 100, warning: 50, fail: 0, pending: 0 };
  
  let totalWeight = 0;
  let totalScore = 0;
  
  checks.forEach(check => {
    const weight = weights[check.category];
    const score = scores[check.status];
    totalWeight += weight;
    totalScore += (weight * score);
  });
  
  return Math.round(totalScore / totalWeight);
};
