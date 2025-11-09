
export interface EnvironmentConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  stripePublishableKey: string;
  sentryDsn?: string;
  analyticsId?: string;
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const development: EnvironmentConfig = {
  apiUrl: 'http://localhost:3000/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  environment: 'development',
  enableAnalytics: false,
  enableErrorTracking: false,
  logLevel: 'debug',
};

const staging: EnvironmentConfig = {
  apiUrl: 'https://staging-api.example.com',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  environment: 'staging',
  enableAnalytics: true,
  enableErrorTracking: true,
  logLevel: 'info',
};

const production: EnvironmentConfig = {
  apiUrl: 'https://api.example.com',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  environment: 'production',
  enableAnalytics: true,
  enableErrorTracking: true,
  logLevel: 'error',
};

const getEnvironment = (): EnvironmentConfig => {
  const env = import.meta.env.MODE || 'development';
  
  switch (env) {
    case 'staging':
      return staging;
    case 'production':
      return production;
    default:
      return development;
  }
};

export const config = getEnvironment();
