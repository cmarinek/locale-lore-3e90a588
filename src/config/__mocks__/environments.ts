export const config = {
  apiUrl: 'http://localhost:3000/api',
  supabaseUrl: 'http://localhost',
  supabaseKey: 'test-key',
  environment: 'development' as const,
  enableAnalytics: false,
  enableErrorTracking: false,
  logLevel: 'debug' as const,
};
