// Health Check Endpoint
// Used by uptime monitors and load balancers to verify system status
// URL: https://[project].supabase.co/functions/v1/health-check

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; responseTime?: number; error?: string };
    environment: { status: string; missingVars?: string[] };
    stripe?: { status: string; configured: boolean };
  };
  uptime: number;
}

const startTime = Date.now();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const healthCheck: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: Deno.env.get('APP_VERSION') || '1.0.0',
    checks: {
      database: { status: 'unknown' },
      environment: { status: 'unknown' },
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  let overallHealthy = true;

  // Check 1: Database connectivity
  try {
    const dbStart = Date.now();
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Simple query to test database
    const { error, count } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const responseTime = Date.now() - dbStart;

    if (error) {
      healthCheck.checks.database = {
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
      overallHealthy = false;
    } else {
      healthCheck.checks.database = {
        status: 'healthy',
        responseTime,
      };
    }
  } catch (error) {
    healthCheck.checks.database = {
      status: 'unhealthy',
      error: error.message,
    };
    overallHealthy = false;
  }

  // Check 2: Required environment variables
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !Deno.env.get(varName)
  );

  if (missingVars.length > 0) {
    healthCheck.checks.environment = {
      status: 'degraded',
      missingVars,
    };
    if (!overallHealthy) {
      healthCheck.status = 'degraded';
    }
  } else {
    healthCheck.checks.environment = {
      status: 'healthy',
    };
  }

  // Check 3: Stripe configuration (optional)
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (stripeKey) {
    healthCheck.checks.stripe = {
      status: 'healthy',
      configured: true,
    };
  } else {
    healthCheck.checks.stripe = {
      status: 'not configured',
      configured: false,
    };
  }

  // Set overall status
  if (!overallHealthy) {
    healthCheck.status = 'unhealthy';
  } else if (missingVars.length > 0) {
    healthCheck.status = 'degraded';
  }

  // Return appropriate HTTP status code
  const httpStatus = healthCheck.status === 'healthy' ? 200 :
    healthCheck.status === 'degraded' ? 200 : 503;

  return new Response(JSON.stringify(healthCheck, null, 2), {
    status: httpStatus,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});
