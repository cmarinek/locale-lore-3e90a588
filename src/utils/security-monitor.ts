// Security monitoring utilities
import { supabase } from '@/integrations/supabase/client';

/**
 * List of PostGIS system tables that are expected to have RLS disabled
 * These tables contain reference data and are not user-modifiable
 */
export const POSTGIS_SYSTEM_TABLES = [
  'spatial_ref_sys',
  'geometry_columns', 
  'geography_columns'
];

/**
 * Monitor and log access to system tables
 * This helps track if any unauthorized access patterns emerge
 */
export const logSystemTableAccess = async (tableName: string, operation: string) => {
  if (POSTGIS_SYSTEM_TABLES.includes(tableName)) {
    console.warn(`[SECURITY] Access to PostGIS system table: ${tableName} (${operation})`);
    
    // Log to analytics if needed for monitoring
    try {
      await supabase
        .from('user_activity_log')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          activity_type: 'system_table_access',
          metadata: {
            table_name: tableName,
            operation,
            timestamp: new Date().toISOString(),
            warning: 'PostGIS system table accessed'
          }
        });
    } catch (error) {
      console.error('Failed to log system table access:', error);
    }
  }
};

/**
 * Validate that queries don't directly access restricted system tables
 * This is a client-side check - server-side restrictions are the primary defense
 */
export const validateQuery = (query: string): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check for direct access to system tables
  for (const table of POSTGIS_SYSTEM_TABLES) {
    if (normalizedQuery.includes(`from ${table}`) || 
        normalizedQuery.includes(`join ${table}`) ||
        normalizedQuery.includes(`update ${table}`) ||
        normalizedQuery.includes(`insert into ${table}`) ||
        normalizedQuery.includes(`delete from ${table}`)) {
      
      console.error(`[SECURITY] Blocked direct access to system table: ${table}`);
      logSystemTableAccess(table, 'blocked_direct_access');
      return false;
    }
  }
  
  return true;
};

/**
 * Security audit function to check RLS status
 */
export const auditRLSStatus = async () => {
  try {
    // Call the database function to check RLS status
    const { data, error } = await supabase.rpc('check_rls_status');
    
    if (error) {
      console.error('RLS audit failed:', error);
      return;
    }
    
    console.log('[SECURITY] RLS audit completed', data);
    
    // Check for any tables with RLS disabled (excluding known system tables)
    const disabledRLS = data?.filter(table => 
      !table.rls_enabled && !table.is_system_table
    );
    
    if (disabledRLS && disabledRLS.length > 0) {
      console.error('[SECURITY] Tables with RLS disabled:', disabledRLS);
    }
    
    return data;
  } catch (error) {
    console.error('Security audit error:', error);
    
    // Fallback: just test database connectivity
    try {
      const { error: testError } = await supabase
        .from('user_activity_log')
        .select('count')
        .limit(1);
      
      if (!testError) {
        console.log('[SECURITY] Fallback audit - database accessible');
      }
    } catch (fallbackError) {
      console.error('Database connectivity test failed:', fallbackError);
    }
  }
};