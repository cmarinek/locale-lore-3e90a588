/**
 * RBAC Testing Utilities
 * 
 * Comprehensive testing utilities for Role-Based Access Control
 * 
 * CRITICAL SECURITY FINDINGS:
 * 1. TWO CONFLICTING useUserRole hooks exist:
 *    - src/hooks/useUserRole.ts (legacy, returns object with role/isAdmin/etc)
 *    - src/lib/rbac/hooks.ts (new SSOT, returns Role directly)
 *    This could cause security bypasses! Must consolidate.
 * 
 * 2. GracefulFallback uses legacy useUserRole hook from src/hooks/useUserRole.ts
 *    while ProtectedRoute uses new one from src/lib/rbac/hooks.ts
 * 
 * 3. Preview mode in GracefulFallback shows content to unauthorized users
 *    (blurred but still visible) - potential information disclosure
 */

import { supabase } from '@/integrations/supabase/client';
import type { Role } from '@/config';

/**
 * Test account credentials
 */
export const TEST_ACCOUNTS = {
  PUBLIC: {
    email: 'public_test@test.com',
    password: 'TestPassword123!',
    role: null,
    description: 'Unauthenticated public user'
  },
  USER: {
    email: 'user_test@test.com',
    password: 'TestPassword123!',
    role: 'authenticated' as Role,
    description: 'Authenticated free user'
  },
  CONTRIBUTOR: {
    email: 'contributor_test@test.com',
    password: 'TestPassword123!',
    role: 'contributor' as Role,
    description: 'Contributor with premium features'
  },
  ADMIN: {
    email: 'admin_test@test.com',
    password: 'TestPassword123!',
    role: 'admin' as Role,
    description: 'Admin with full access'
  }
} as const;

/**
 * Route access matrix for testing
 */
export const ROUTE_ACCESS_MATRIX = {
  // Public routes - accessible to everyone
  PUBLIC_ROUTES: [
    { path: '/', name: 'Home' },
    { path: '/search', name: 'Search' },
    { path: '/map', name: 'Map' },
    { path: '/fact/:id', name: 'Fact Detail' },
    { path: '/stories', name: 'Stories' },
    { path: '/privacy', name: 'Privacy Policy' },
    { path: '/terms', name: 'Terms of Service' },
    { path: '/help', name: 'Help' },
    { path: '/support', name: 'Support' },
    { path: '/content-guidelines', name: 'Content Guidelines' },
  ],

  // Authenticated routes - requires login
  AUTHENTICATED_ROUTES: [
    { path: '/profile', name: 'Profile', requiresAuth: true },
    { path: '/submit', name: 'Submit Content', requiresAuth: true },
    { path: '/gamification', name: 'Gamification', requiresAuth: true },
    { path: '/social', name: 'Social', requiresAuth: true },
    { path: '/billing', name: 'Billing', requiresAuth: true },
    { path: '/settings', name: 'Settings', requiresAuth: true },
    { path: '/privacy-settings', name: 'Privacy Settings', requiresAuth: true },
  ],

  // Contributor routes - requires contributor role
  CONTRIBUTOR_ROUTES: [
    { path: '/contributor', name: 'Contributor Dashboard', contributorOnly: true },
  ],

  // Admin routes - requires admin role
  ADMIN_ROUTES: [
    { path: '/admin', name: 'Admin Dashboard', adminOnly: true },
    { path: '/monitoring', name: 'Monitoring', adminOnly: true },
    { path: '/security-audit', name: 'Security Audit', adminOnly: true },
    { path: '/performance', name: 'Performance', adminOnly: true },
    { path: '/admin/translations', name: 'Translation Manager', adminOnly: true },
  ],
} as const;

/**
 * Expected access results for each role
 */
export const EXPECTED_ACCESS = {
  public: {
    canAccess: ['PUBLIC_ROUTES'],
    shouldRedirect: ['AUTHENTICATED_ROUTES', 'CONTRIBUTOR_ROUTES', 'ADMIN_ROUTES'],
  },
  authenticated: {
    canAccess: ['PUBLIC_ROUTES', 'AUTHENTICATED_ROUTES'],
    shouldRedirect: ['CONTRIBUTOR_ROUTES', 'ADMIN_ROUTES'],
  },
  contributor: {
    canAccess: ['PUBLIC_ROUTES', 'AUTHENTICATED_ROUTES', 'CONTRIBUTOR_ROUTES'],
    shouldRedirect: ['ADMIN_ROUTES'],
  },
  admin: {
    canAccess: ['PUBLIC_ROUTES', 'AUTHENTICATED_ROUTES', 'CONTRIBUTOR_ROUTES', 'ADMIN_ROUTES'],
    shouldRedirect: [],
  },
} as const;

/**
 * Create or update test account
 */
export async function createTestAccount(
  email: string,
  password: string,
  role: Role | null
): Promise<{ userId: string | null; error: Error | null }> {
  try {
    // Try to sign in first (account might already exist)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    let userId: string;

    if (signInError) {
      // Account doesn't exist, create it
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            email_confirmed: true, // Auto-confirm for testing
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Failed to create user');
      
      userId = signUpData.user.id;
      console.log(`✅ Created test account: ${email}`);
    } else {
      userId = signInData.user.id;
      console.log(`ℹ️ Test account already exists: ${email}`);
    }

    // Assign role if specified
    if (role) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as any, // Type assertion for database enum
        })
        .select()
        .single();

      if (roleError && roleError.code !== '23505') { // Ignore duplicate key error
        console.error(`❌ Failed to assign role ${role} to ${email}:`, roleError);
      } else {
        console.log(`✅ Assigned role ${role} to ${email}`);
      }
    }

    // Sign out after setup
    await supabase.auth.signOut();

    return { userId, error: null };
  } catch (error) {
    console.error(`❌ Error creating test account ${email}:`, error);
    return { userId: null, error: error as Error };
  }
}

/**
 * Initialize all test accounts
 */
export async function initializeTestAccounts(): Promise<{
  success: boolean;
  results: Record<string, { userId: string | null; error: Error | null }>;
}> {
  console.log('🔧 Initializing test accounts...');
  
  const results: Record<string, { userId: string | null; error: Error | null }> = {};
  
  for (const [key, account] of Object.entries(TEST_ACCOUNTS)) {
    if (key === 'PUBLIC') continue; // Skip public user (no account needed)
    
    const result = await createTestAccount(account.email, account.password, account.role);
    results[key] = result;
  }

  const allSuccessful = Object.values(results).every(r => r.error === null);
  
  if (allSuccessful) {
    console.log('✅ All test accounts initialized successfully');
  } else {
    console.error('❌ Some test accounts failed to initialize');
  }

  return { success: allSuccessful, results };
}

/**
 * Test result interface
 */
export interface TestResult {
  route: string;
  routeName: string;
  role: string;
  expected: 'ALLOW' | 'REDIRECT';
  actual: 'ALLOW' | 'REDIRECT' | 'ERROR';
  passed: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Generate test report
 */
export function generateTestReport(results: TestResult[]): string {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  let report = `
╔════════════════════════════════════════════════════════════╗
║           RBAC TESTING REPORT                              ║
╠════════════════════════════════════════════════════════════╣
║ Total Tests: ${total.toString().padEnd(43)} ║
║ Passed: ${passed.toString().padEnd(48)} ║
║ Failed: ${failed.toString().padEnd(48)} ║
║ Success Rate: ${((passed / total) * 100).toFixed(1)}%${' '.repeat(41)} ║
╚════════════════════════════════════════════════════════════╝

`;

  if (failed > 0) {
    report += '\n❌ FAILED TESTS:\n';
    report += '═'.repeat(60) + '\n';
    
    results.filter(r => !r.passed).forEach(result => {
      report += `
Route: ${result.route} (${result.routeName})
Role: ${result.role}
Expected: ${result.expected}
Actual: ${result.actual}
${result.error ? `Error: ${result.error}` : ''}
${result.redirectTo ? `Redirect: ${result.redirectTo}` : ''}
${'─'.repeat(60)}
`;
    });
  }

  report += '\n✅ TEST SUMMARY BY ROLE:\n';
  report += '═'.repeat(60) + '\n';
  
  const roles = ['public', 'authenticated', 'contributor', 'admin'];
  roles.forEach(role => {
    const roleResults = results.filter(r => r.role === role);
    const rolePassed = roleResults.filter(r => r.passed).length;
    const roleTotal = roleResults.length;
    
    report += `
${role.toUpperCase()}: ${rolePassed}/${roleTotal} passed (${((rolePassed / roleTotal) * 100).toFixed(1)}%)
`;
  });

  return report;
}

/**
 * Log security issues found during testing
 */
export function logSecurityIssues(): void {
  console.warn(`
╔════════════════════════════════════════════════════════════╗
║          🚨 CRITICAL SECURITY ISSUES FOUND 🚨              ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ 1. DUPLICATE useUserRole HOOKS                            ║
║    - src/hooks/useUserRole.ts (legacy)                    ║
║    - src/lib/rbac/hooks.ts (new SSOT)                     ║
║    ⚠️  Different components use different hooks!          ║
║    ⚠️  This creates inconsistent security checks!         ║
║                                                            ║
║ 2. GRACEFUL FALLBACK SHOWS CONTENT                        ║
║    - GracefulFallback shows blurred content to            ║
║      unauthorized users when previewMode=true             ║
║    ⚠️  Potential information disclosure vulnerability!    ║
║                                                            ║
║ 3. INCONSISTENT ROLE CHECKING                             ║
║    - Some components check localStorage (insecure)        ║
║    - Some use database queries (secure)                   ║
║    ⚠️  Must standardize on database-only checks!          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
}

/**
 * Test helper: Sign in as test user
 */
export async function signInAsTestUser(
  accountKey: keyof typeof TEST_ACCOUNTS
): Promise<{ success: boolean; error: Error | null }> {
  if (accountKey === 'PUBLIC') {
    await supabase.auth.signOut();
    return { success: true, error: null };
  }

  const account = TEST_ACCOUNTS[accountKey];
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (error) throw error;
    
    console.log(`✅ Signed in as ${account.description} (${account.email})`);
    return { success: true, error: null };
  } catch (error) {
    console.error(`❌ Failed to sign in as ${account.email}:`, error);
    return { success: false, error: error as Error };
  }
}

/**
 * Cleanup test accounts (use with caution!)
 */
export async function cleanupTestAccounts(): Promise<void> {
  console.warn('⚠️ Cleaning up test accounts...');
  
  // Note: This requires admin access or service role key
  // For now, just log the emails that should be deleted
  
  const emails = Object.values(TEST_ACCOUNTS)
    .filter(a => a.email !== 'public_test@test.com')
    .map(a => a.email);
  
  console.log('Test accounts to cleanup:', emails);
  console.log('Use Supabase dashboard to delete these accounts if needed');
}
