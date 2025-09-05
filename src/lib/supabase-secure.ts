// Security monitoring for Supabase client
import { supabase } from '@/integrations/supabase/client';
import { auditRLSStatus } from '@/utils/security-monitor';

// Initialize security monitoring on app start
export const initializeSecurityMonitoring = () => {
  console.log('[SECURITY] Initializing security monitoring...');
  
  try {
    // Run initial RLS audit
    auditRLSStatus();
    
    // Set up periodic security checks (every hour)
    setInterval(() => {
      auditRLSStatus();
    }, 60 * 60 * 1000);
  } catch (error) {
    console.error('[SECURITY] Failed to initialize monitoring:', error);
  }
};

// Re-export the supabase client
export { supabase };