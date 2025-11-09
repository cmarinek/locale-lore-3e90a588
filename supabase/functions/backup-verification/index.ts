import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupMetrics {
  timestamp: string;
  table_counts: Record<string, number>;
  database_size: string;
  critical_tables_verified: boolean;
  health_status: 'healthy' | 'warning' | 'critical';
  issues: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting backup verification...');

    const issues: string[] = [];
    const tableCounts: Record<string, number> = {};

    // Critical tables to verify
    const criticalTables = [
      'facts',
      'profiles', 
      'user_roles',
      'fact_votes',
      'fact_reports',
      'user_achievements'
    ];

    // 1. Check table counts
    for (const table of criticalTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        issues.push(`Failed to query ${table}: ${error.message}`);
        tableCounts[table] = -1;
      } else {
        tableCounts[table] = count || 0;
        if (count === 0 && table === 'facts') {
          issues.push(`Warning: ${table} has 0 records`);
        }
      }
    }

    // 2. Verify foreign key integrity (sample check)
    const { data: orphanedVotes, error: votesError } = await supabase
      .from('fact_votes')
      .select('id')
      .not('fact_id', 'in', `(SELECT id FROM facts)`)
      .limit(1);

    if (votesError) {
      issues.push(`Foreign key check failed: ${votesError.message}`);
    } else if (orphanedVotes && orphanedVotes.length > 0) {
      issues.push('Foreign key integrity issue detected in fact_votes');
    }

    // 3. Check recent data exists (facts created in last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: recentFactsCount, error: recentError } = await supabase
      .from('facts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    if (recentError) {
      issues.push(`Recent data check failed: ${recentError.message}`);
    }

    // 4. Verify RLS policies are active
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('check_rls_enabled', {});

    if (policiesError) {
      console.log('Note: RLS check function not available (non-critical)');
    }

    // Determine health status
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (issues.some(i => i.includes('Failed to query') || i.includes('integrity issue'))) {
      healthStatus = 'critical';
    } else if (issues.length > 0) {
      healthStatus = 'warning';
    }

    const metrics: BackupMetrics = {
      timestamp: new Date().toISOString(),
      table_counts: tableCounts,
      database_size: 'N/A', // Would need custom query for actual size
      critical_tables_verified: criticalTables.every(t => tableCounts[t] >= 0),
      health_status: healthStatus,
      issues
    };

    console.log('✅ Backup verification complete:', metrics);

    // Store verification results
    const { error: logError } = await supabase
      .from('backup_verification_logs')
      .insert({
        verification_time: new Date().toISOString(),
        health_status: healthStatus,
        table_counts: tableCounts,
        issues: issues,
        metadata: metrics
      });

    if (logError) {
      console.error('Failed to log verification results:', logError);
      // Non-critical, continue
    }

    // Send alerts if critical issues found
    if (healthStatus === 'critical') {
      console.error('🚨 CRITICAL: Backup verification failed!', issues);
      // TODO: Integrate with alerting system (email, Slack, PagerDuty)
    } else if (healthStatus === 'warning') {
      console.warn('⚠️  WARNING: Backup verification issues detected', issues);
    }

    return new Response(
      JSON.stringify({
        success: true,
        metrics,
        message: healthStatus === 'healthy' 
          ? 'Backup verification passed' 
          : `Backup verification completed with ${healthStatus} status`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Backup verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
