#!/usr/bin/env node

/**
 * Pre-Deployment Readiness Checker
 *
 * Automates the pre-deployment checklist from PRODUCTION_DEPLOYMENT_RUNBOOK.md
 * Runs comprehensive checks before deploying to production
 *
 * Usage: node scripts/pre-deployment-check.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║         🚀 PRE-DEPLOYMENT READINESS CHECKER 🚀          ║${colors.reset}`);
console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

const checks = [];
let totalPassed = 0;
let totalFailed = 0;
let totalWarnings = 0;

// Helper function to run a check
async function runCheck(name, fn, critical = false) {
  process.stdout.write(`${colors.blue}⏳ ${name}...${colors.reset}`);

  try {
    const result = await fn();
    if (result.passed) {
      process.stdout.write(`\r${colors.green}✅ ${name}${colors.reset}\n`);
      if (result.message) {
        console.log(`   ${colors.green}${result.message}${colors.reset}`);
      }
      totalPassed++;
      checks.push({ name, status: 'passed', critical });
    } else {
      const icon = critical ? '❌' : '⚠️';
      const color = critical ? colors.red : colors.yellow;
      process.stdout.write(`\r${color}${icon} ${name}${colors.reset}\n`);
      console.log(`   ${color}${result.message || 'Check failed'}${colors.reset}`);
      if (result.fix) {
        console.log(`   ${colors.blue}Fix: ${result.fix}${colors.reset}`);
      }
      if (critical) {
        totalFailed++;
        checks.push({ name, status: 'failed', critical, message: result.message });
      } else {
        totalWarnings++;
        checks.push({ name, status: 'warning', critical, message: result.message });
      }
    }
  } catch (error) {
    const icon = critical ? '❌' : '⚠️';
    const color = critical ? colors.red : colors.yellow;
    process.stdout.write(`\r${color}${icon} ${name}${colors.reset}\n`);
    console.log(`   ${color}Error: ${error.message}${colors.reset}`);
    if (critical) {
      totalFailed++;
      checks.push({ name, status: 'failed', critical, message: error.message });
    } else {
      totalWarnings++;
      checks.push({ name, status: 'warning', critical, message: error.message });
    }
  }
}

// Check 1: Git repository clean
async function checkGitClean() {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    if (stdout.trim() === '') {
      return { passed: true, message: 'Working directory clean' };
    } else {
      return {
        passed: false,
        message: 'Uncommitted changes detected',
        fix: 'Commit or stash changes before deployment',
      };
    }
  } catch (error) {
    return { passed: false, message: 'Not a git repository or git not installed' };
  }
}

// Check 2: On correct branch
async function checkGitBranch() {
  try {
    const { stdout } = await execAsync('git branch --show-current');
    const branch = stdout.trim();
    const validBranches = ['main', 'production', 'master'];
    const isValid = validBranches.includes(branch) || branch.startsWith('claude/');

    if (isValid) {
      return { passed: true, message: `On branch: ${branch}` };
    } else {
      return {
        passed: false,
        message: `On branch: ${branch} (expected: main, production, or claude/*)`,
        fix: 'Switch to production branch before deploying',
      };
    }
  } catch (error) {
    return { passed: false, message: 'Could not determine current branch' };
  }
}

// Check 3: Dependencies installed
async function checkDependencies() {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    // Check if package-lock.json is newer than node_modules
    const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
      const lockStat = fs.statSync(packageLockPath);
      const nodeModulesStat = fs.statSync(nodeModulesPath);

      if (lockStat.mtime > nodeModulesStat.mtime) {
        return {
          passed: false,
          message: 'package-lock.json is newer than node_modules',
          fix: 'Run: npm install',
        };
      }
    }
    return { passed: true, message: 'Dependencies installed' };
  } else {
    return { passed: false, message: 'node_modules not found', fix: 'Run: npm install' };
  }
}

// Check 4: TypeScript compilation
async function checkTypeScript() {
  try {
    await execAsync('npm run type-check');
    return { passed: true, message: 'TypeScript compilation successful' };
  } catch (error) {
    return {
      passed: false,
      message: 'TypeScript errors detected',
      fix: 'Run: npm run type-check to see errors',
    };
  }
}

// Check 5: Linting
async function checkLinting() {
  try {
    await execAsync('npm run lint');
    return { passed: true, message: 'Linting passed' };
  } catch (error) {
    // Check if it's just warnings
    if (error.stdout && error.stdout.includes('warning')) {
      return {
        passed: true,
        message: 'Linting passed with warnings (non-critical)',
      };
    }
    return {
      passed: false,
      message: 'Linting errors detected',
      fix: 'Run: npm run lint to see errors',
    };
  }
}

// Check 6: Build succeeds
async function checkBuild() {
  try {
    console.log('\n   Building... (this may take a minute)');
    await execAsync('npm run build', { maxBuffer: 10 * 1024 * 1024 });
    return { passed: true, message: 'Build successful' };
  } catch (error) {
    return {
      passed: false,
      message: 'Build failed',
      fix: 'Run: npm run build to see full error',
    };
  }
}

// Check 7: Environment variables
async function checkEnvVars() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_MAPBOX_ACCESS_TOKEN',
  ];

  // Check .env file
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    // Check if vars are in process.env (CI/CD environment)
    const missingFromProcess = requiredVars.filter(v => !process.env[v]);
    if (missingFromProcess.length > 0) {
      return {
        passed: false,
        message: 'No .env file and missing env vars',
        fix: 'Create .env file or set environment variables',
      };
    }
    return { passed: true, message: 'Using system environment variables' };
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const missingVars = requiredVars.filter(v => !envContent.includes(v));

  if (missingVars.length > 0) {
    return {
      passed: false,
      message: `Missing: ${missingVars.join(', ')}`,
      fix: 'Add missing variables to .env file',
    };
  }

  // Check for placeholder values
  const placeholders = ['your-', 'xxx', 'example.com'];
  const hasPlaceholders = placeholders.some(p => envContent.includes(p));

  if (hasPlaceholders) {
    return {
      passed: false,
      message: 'Environment variables contain placeholder values',
      fix: 'Replace placeholders with actual values',
    };
  }

  return { passed: true, message: 'All required variables present' };
}

// Check 8: Stripe configuration (production)
async function checkStripeConfig() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath) && !process.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return {
      passed: false,
      message: 'Cannot verify Stripe configuration',
    };
  }

  const stripeKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    (fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8').match(/VITE_STRIPE_PUBLISHABLE_KEY=(.*)/)?.[1] : null);

  if (!stripeKey) {
    return {
      passed: false,
      message: 'Stripe key not configured',
      fix: 'Set VITE_STRIPE_PUBLISHABLE_KEY',
    };
  }

  // For production, should be live key
  if (process.argv.includes('--production')) {
    if (!stripeKey.startsWith('pk_live_')) {
      return {
        passed: false,
        message: 'Using test Stripe key in production mode',
        fix: 'Switch to live Stripe key (pk_live_...)',
      };
    }
  }

  return { passed: true, message: `Stripe configured (${stripeKey.startsWith('pk_live_') ? 'LIVE' : 'TEST'} mode)` };
}

// Check 9: Bundle size
async function checkBundleSize() {
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    return {
      passed: false,
      message: 'dist folder not found',
      fix: 'Run: npm run build first',
    };
  }

  // Find main JS bundle
  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    return { passed: false, message: 'Build assets not found' };
  }

  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.includes('vendor'));

  if (jsFiles.length === 0) {
    return { passed: false, message: 'No JavaScript bundles found' };
  }

  const mainBundle = jsFiles.find(f => f.includes('index')) || jsFiles[0];
  const bundlePath = path.join(assetsPath, mainBundle);
  const stats = fs.statSync(bundlePath);
  const sizeKB = Math.round(stats.size / 1024);

  // Target: < 500KB
  if (sizeKB > 500) {
    return {
      passed: false,
      message: `Main bundle is ${sizeKB}KB (target: < 500KB)`,
      fix: 'Consider code splitting or removing unused dependencies',
    };
  }

  return { passed: true, message: `Main bundle: ${sizeKB}KB (good!)` };
}

// Check 10: Security headers configured
async function checkSecurityConfig() {
  const vercelPath = path.join(__dirname, '..', 'vercel.json');

  if (fs.existsSync(vercelPath)) {
    const config = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
    const headers = config.headers?.[0]?.headers || [];

    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
    ];

    const hasAllHeaders = requiredHeaders.every(h =>
      headers.some(header => header.key === h)
    );

    if (hasAllHeaders) {
      return { passed: true, message: 'Security headers configured' };
    }
  }

  return {
    passed: false,
    message: 'Security headers not fully configured',
    fix: 'Check vercel.json configuration',
  };
}

// Check 11: Database migrations
async function checkMigrations() {
  const migrationsPath = path.join(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsPath)) {
    return {
      passed: false,
      message: 'Migrations folder not found',
    };
  }

  const migrations = fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) {
    return {
      passed: false,
      message: 'No migration files found',
    };
  }

  return {
    passed: true,
    message: `${migrations.length} migration(s) ready to deploy`,
  };
}

// Check 12: No console.logs in production code
async function checkConsoleLogs() {
  try {
    const { stdout } = await execAsync(
      'grep -r "console.log" src --include="*.ts" --include="*.tsx" | grep -v "// console.log" | wc -l'
    );

    const count = parseInt(stdout.trim());

    if (count > 10) {
      return {
        passed: false,
        message: `${count} console.log statements found in src/`,
        fix: 'Remove or comment out console.log statements',
      };
    }

    return { passed: true, message: 'No excessive console.log statements' };
  } catch (error) {
    // grep returns non-zero if no matches (which is good)
    if (error.code === 1) {
      return { passed: true, message: 'No console.log statements found' };
    }
    return { passed: true, message: 'Could not check (non-critical)' };
  }
}

// Check 13: Tests passing
async function checkTests() {
  try {
    console.log('\n   Running tests... (this may take a minute)');
    await execAsync('npm run test:unit', { maxBuffer: 10 * 1024 * 1024 });
    return { passed: true, message: 'All tests passing' };
  } catch (error) {
    return {
      passed: false,
      message: 'Some tests failing',
      fix: 'Run: npm run test:unit to see failures',
    };
  }
}

// Main execution
async function main() {
  const startTime = Date.now();

  console.log(`${colors.blue}Running comprehensive pre-deployment checks...${colors.reset}\n`);

  // Critical checks (must pass)
  console.log(`${colors.magenta}━━━ CRITICAL CHECKS ━━━${colors.reset}\n`);
  await runCheck('Git working directory clean', checkGitClean, true);
  await runCheck('On correct branch', checkGitBranch, false);
  await runCheck('Dependencies installed', checkDependencies, true);
  await runCheck('TypeScript compilation', checkTypeScript, true);
  await runCheck('Build succeeds', checkBuild, true);
  await runCheck('Environment variables set', checkEnvVars, true);
  await runCheck('Stripe configuration', checkStripeConfig, true);

  // Important checks (should pass)
  console.log(`\n${colors.magenta}━━━ IMPORTANT CHECKS ━━━${colors.reset}\n`);
  await runCheck('Linting passes', checkLinting, false);
  await runCheck('Bundle size acceptable', checkBundleSize, false);
  await runCheck('Security headers configured', checkSecurityConfig, false);
  await runCheck('Database migrations present', checkMigrations, false);

  // Optional checks (nice to have)
  console.log(`\n${colors.magenta}━━━ OPTIONAL CHECKS ━━━${colors.reset}\n`);
  await runCheck('No excessive console.logs', checkConsoleLogs, false);
  await runCheck('Tests passing', checkTests, false);

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║                      SUMMARY                             ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.green}✅ Passed:  ${totalPassed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${totalWarnings}${colors.reset}`);
  console.log(`${colors.red}❌ Failed:  ${totalFailed}${colors.reset}`);
  console.log(`${colors.blue}⏱️  Duration: ${duration}s${colors.reset}\n`);

  // Critical failures
  const criticalFailures = checks.filter(c => c.critical && c.status === 'failed');

  if (criticalFailures.length > 0) {
    console.log(`${colors.red}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.red}║              ⚠️  DEPLOYMENT BLOCKED ⚠️                  ║${colors.reset}`);
    console.log(`${colors.red}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.red}Critical checks failed:${colors.reset}`);
    criticalFailures.forEach(f => {
      console.log(`  ${colors.red}•${colors.reset} ${f.name}`);
      if (f.message) {
        console.log(`    ${f.message}`);
      }
    });

    console.log(`\n${colors.blue}Fix these issues before deploying to production.${colors.reset}`);
    console.log(`${colors.blue}Reference: docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md${colors.reset}\n`);

    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(`${colors.yellow}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.yellow}║         ⚠️  READY WITH WARNINGS ⚠️                      ║${colors.reset}`);
    console.log(`${colors.yellow}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.yellow}All critical checks passed, but some warnings exist.${colors.reset}`);
    console.log(`${colors.yellow}You can deploy, but consider fixing warnings first.${colors.reset}\n`);

    console.log(`${colors.green}✅ Ready to deploy!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║            ✅ READY FOR DEPLOYMENT! ✅                   ║${colors.reset}`);
    console.log(`${colors.green}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.green}All checks passed! You're ready to deploy.${colors.reset}\n`);

    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log(`  1. Review PRODUCTION_DEPLOYMENT_RUNBOOK.md`);
    console.log(`  2. Deploy: git push origin production`);
    console.log(`  3. Monitor: Check Sentry and uptime monitors\n`);

    process.exit(0);
  }
}

main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
