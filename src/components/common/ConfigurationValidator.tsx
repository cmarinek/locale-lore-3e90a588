import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { config } from '@/config/environments';

interface ConfigIssue {
  variable: string;
  isSet: boolean;
  required: boolean;
}

/**
 * ConfigurationValidator component
 *
 * Checks for missing environment variables and displays a user-friendly error message
 * instead of crashing the entire application. This prevents the "white screen of death"
 * in production when configuration is incomplete.
 */
export const ConfigurationValidator = ({ children }: { children: React.ReactNode }) => {
  const [configIssues, setConfigIssues] = useState<ConfigIssue[]>([]);

  useEffect(() => {
    const issues: ConfigIssue[] = [];

    // Check critical environment variables
    if (!config.supabaseUrl || config.supabaseUrl === '') {
      issues.push({
        variable: 'VITE_SUPABASE_URL',
        isSet: false,
        required: true
      });
    }

    if (!config.supabaseKey || config.supabaseKey === '') {
      issues.push({
        variable: 'VITE_SUPABASE_PUBLISHABLE_KEY',
        isSet: false,
        required: true
      });
    }

    // Check if Supabase client was initialized with placeholder values
    if (!isSupabaseConfigured()) {
      console.warn('[ConfigurationValidator] Supabase is not properly configured');
    }

    // Check optional but important variables
    if (!config.stripePublishableKey) {
      issues.push({
        variable: 'VITE_STRIPE_PUBLISHABLE_KEY',
        isSet: false,
        required: false
      });
    }

    setConfigIssues(issues);
  }, []);

  // If there are critical issues, show error screen
  const criticalIssues = configIssues.filter(issue => issue.required);

  if (criticalIssues.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-xl mb-2">Configuration Error</AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="font-semibold">
                The application is missing required environment variables.
              </p>

              <div className="bg-destructive/10 p-4 rounded-md">
                <p className="font-mono text-sm mb-2">Missing required variables:</p>
                <ul className="list-disc list-inside space-y-1 font-mono text-sm">
                  {criticalIssues.map(issue => (
                    <li key={issue.variable} className="text-destructive-foreground">
                      {issue.variable}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">How to fix this:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Create a <code className="bg-muted px-1 rounded">.env.production</code> file in the project root
                  </li>
                  <li>
                    Add the following environment variables:
                    <pre className="bg-muted p-3 rounded mt-2 overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key (optional)
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_key (optional)
VITE_SENTRY_DSN=your_sentry_dsn (optional)`}
                    </pre>
                  </li>
                  <li>Rebuild the application with <code className="bg-muted px-1 rounded">npm run build</code></li>
                  <li>Deploy the updated build</li>
                </ol>
              </div>

              {config.environment === 'development' && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Development tip:</strong> You can create a <code>.env.local</code> file for local development.
                  </p>
                </div>
              )}

              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            </AlertDescription>
          </Alert>

          {/* Show warnings for non-critical missing variables */}
          {configIssues.length > criticalIssues.length && (
            <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                Optional Configuration Missing
              </AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                <p className="text-sm mb-2">
                  The following optional features are not configured:
                </p>
                <ul className="list-disc list-inside text-sm">
                  {configIssues
                    .filter(issue => !issue.required)
                    .map(issue => (
                      <li key={issue.variable}>
                        {issue.variable}
                        {issue.variable.includes('STRIPE') && ' (required for payments)'}
                        {issue.variable.includes('HCAPTCHA') && ' (required for bot protection)'}
                        {issue.variable.includes('SENTRY') && ' (recommended for error tracking)'}
                      </li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  // If there are only warnings (no critical issues), show the app but log warnings
  if (configIssues.length > 0) {
    console.warn(
      '[ConfigurationValidator] Non-critical configuration issues detected:',
      configIssues.filter(i => !i.required)
    );
  }

  return <>{children}</>;
};
