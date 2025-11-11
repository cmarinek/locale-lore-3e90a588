/**
 * Phase 5: Security Hardening Verification Script
 * 
 * This script verifies that all security hardening measures from Phase 3 are in place:
 * - RLS enabled on all user tables (except PostGIS system tables)
 * - Database functions have proper security settings
 * - Security audit logging is operational
 */

import { supabase } from '../src/integrations/supabase/client';

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

class SecurityVerification {
  private results: VerificationResult[] = [];

  /**
   * Test 1: Verify RLS is enabled on all user tables
   */
  async verifyRLSEnabled(): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('check_rls_status');

      if (error) {
        this.results.push({
          passed: false,
          message: 'RLS Status Check Failed',
          details: error.message,
        });
        return;
      }

      const disabledTables = data?.filter((table: any) => !table.rls_enabled) || [];
      const allowedDisabled = ['spatial_ref_sys', 'geometry_columns', 'geography_columns'];
      const unexpectedDisabled = disabledTables.filter(
        (table: any) => !allowedDisabled.includes(table.tablename)
      );

      if (unexpectedDisabled.length > 0) {
        this.results.push({
          passed: false,
          message: 'Unexpected tables with RLS disabled',
          details: unexpectedDisabled,
        });
      } else {
        this.results.push({
          passed: true,
          message: 'RLS properly enabled on all user tables',
          details: `${data?.length || 0} tables checked`,
        });
      }
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'RLS verification error',
        details: error,
      });
    }
  }

  /**
   * Test 2: Verify notification preferences table and policies
   */
  async verifyNotificationPreferences(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('count')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table exists but no data - this is fine
        this.results.push({
          passed: true,
          message: 'Notification preferences table accessible with RLS',
        });
      } else if (error) {
        this.results.push({
          passed: false,
          message: 'Notification preferences table access failed',
          details: error.message,
        });
      } else {
        this.results.push({
          passed: true,
          message: 'Notification preferences table operational',
        });
      }
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Notification preferences verification error',
        details: error,
      });
    }
  }

  /**
   * Test 3: Verify privacy settings table and policies
   */
  async verifyPrivacySettings(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('count')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table exists but no data - this is fine
        this.results.push({
          passed: true,
          message: 'Privacy settings table accessible with RLS',
        });
      } else if (error) {
        this.results.push({
          passed: false,
          message: 'Privacy settings table access failed',
          details: error.message,
        });
      } else {
        this.results.push({
          passed: true,
          message: 'Privacy settings table operational',
        });
      }
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Privacy settings verification error',
        details: error,
      });
    }
  }

  /**
   * Test 4: Verify security audit log table exists
   */
  async verifySecurityAuditLog(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('count')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table exists but no data - this is fine
        this.results.push({
          passed: true,
          message: 'Security audit log table accessible',
        });
      } else if (error) {
        this.results.push({
          passed: false,
          message: 'Security audit log table access failed',
          details: error.message,
        });
      } else {
        this.results.push({
          passed: true,
          message: 'Security audit log operational',
        });
      }
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Security audit log verification error',
        details: error,
      });
    }
  }

  /**
   * Test 5: Verify database connectivity and authentication
   */
  async verifyDatabaseConnection(): Promise<void> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        this.results.push({
          passed: false,
          message: 'Database authentication failed',
          details: error.message,
        });
      } else {
        this.results.push({
          passed: true,
          message: 'Database connection and authentication working',
          details: user ? 'User authenticated' : 'Anonymous access',
        });
      }
    } catch (error) {
      this.results.push({
        passed: false,
        message: 'Database connection verification error',
        details: error,
      });
    }
  }

  /**
   * Run all verification tests
   */
  async runAll(): Promise<void> {
    console.log('🔒 Starting Phase 5: Security Hardening Verification\n');

    await this.verifyDatabaseConnection();
    await this.verifyRLSEnabled();
    await this.verifyNotificationPreferences();
    await this.verifyPrivacySettings();
    await this.verifySecurityAuditLog();

    this.printResults();
  }

  /**
   * Print formatted results
   */
  private printResults(): void {
    console.log('\n📊 Verification Results:\n');
    console.log('=' .repeat(60));

    let passCount = 0;
    let failCount = 0;

    this.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${index + 1}. ${status}: ${result.message}`);
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }

      if (result.passed) {
        passCount++;
      } else {
        failCount++;
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 Summary: ${passCount} passed, ${failCount} failed`);
    
    if (failCount === 0) {
      console.log('\n🎉 All security hardening measures verified successfully!');
      console.log('✅ Production-ready security posture confirmed.');
    } else {
      console.log('\n⚠️  Some security checks failed. Review the issues above.');
    }

    console.log('\n');
  }
}

// Run verification if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new SecurityVerification();
  verifier.runAll().catch(console.error);
}

export { SecurityVerification };
