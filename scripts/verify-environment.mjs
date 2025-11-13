#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 *
 * Validates all required environment variables are present and correctly formatted
 * Run before deployment to ensure configuration is complete
 *
 * Usage: node scripts/verify-environment.mjs [--production]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const isProduction = process.argv.includes('--production');
const mode = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';

console.log(`\n${colors.cyan}🔍 Environment Variables Verification${colors.reset}`);
console.log(`${colors.blue}Mode: ${mode}${colors.reset}\n`);

// Define required environment variables with validation rules
const requiredVars = {
  // App Configuration
  VITE_APP_TITLE: {
    required: true,
    description: 'Application title',
    example: 'LocaleLore',
  },
  VITE_APP_URL: {
    required: true,
    description: 'Application URL',
    validate: (val) => val.startsWith('http'),
    example: 'https://localelore.com',
  },

  // Supabase (Critical)
  VITE_SUPABASE_URL: {
    required: true,
    critical: true,
    description: 'Supabase project URL',
    validate: (val) => val.includes('supabase.co'),
    example: 'https://xxx.supabase.co',
  },
  VITE_SUPABASE_PUBLISHABLE_KEY: {
    required: true,
    critical: true,
    description: 'Supabase anon/public key',
    validate: (val) => val.startsWith('eyJ'),
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },

  // Stripe (Critical for payments)
  VITE_STRIPE_PUBLISHABLE_KEY: {
    required: true,
    critical: true,
    description: 'Stripe publishable key',
    validate: (val) => {
      if (isProduction) {
        return val.startsWith('pk_live_');
      }
      return val.startsWith('pk_test_') || val.startsWith('pk_live_');
    },
    example: isProduction ? 'pk_live_...' : 'pk_test_...',
    productionCheck: (val) => val.startsWith('pk_live_'),
  },

  // Mapbox (Critical for maps)
  VITE_MAPBOX_ACCESS_TOKEN: {
    required: true,
    critical: true,
    description: 'Mapbox access token',
    validate: (val) => val.startsWith('pk.'),
    example: 'pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbG...',
  },

  // Monitoring (Highly Recommended)
  VITE_SENTRY_DSN: {
    required: isProduction,
    recommended: true,
    description: 'Sentry error tracking DSN',
    validate: (val) => val.includes('sentry.io') || val.includes('ingest.sentry.io'),
    example: 'https://xxx@xxx.ingest.sentry.io/xxx',
  },
  VITE_SENTRY_TRACES_SAMPLE_RATE: {
    required: false,
    description: 'Sentry performance traces sample rate',
    validate: (val) => {
      const num = parseFloat(val);
      return num >= 0 && num <= 1;
    },
    example: '0.1',
  },

  // Feature Flags
  VITE_MAINTENANCE_MODE: {
    required: false,
    description: 'Maintenance mode flag',
    validate: (val) => val === 'true' || val === 'false',
    example: 'false',
    productionCheck: (val) => val === 'false',
  },
  VITE_DEBUG_MODE: {
    required: false,
    description: 'Debug mode flag',
    validate: (val) => val === 'true' || val === 'false',
    example: 'false',
    productionCheck: (val) => val === 'false',
  },

  // Analytics (Optional but recommended)
  VITE_ANALYTICS_ID: {
    required: false,
    recommended: true,
    description: 'Google Analytics ID',
    validate: (val) => !val || val.startsWith('G-') || val.startsWith('UA-'),
    example: 'G-XXXXXXXXXX',
  },
};

// Load environment variables
function loadEnvVars() {
  const envVars = {};

  // Try to load from .env file
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
      }
    });
  }

  // Also check process.env (runtime environment variables)
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('VITE_') || key.startsWith('NODE_')) {
      envVars[key] = process.env[key];
    }
  });

  return envVars;
}

// Verify environment variables
function verifyEnvironment() {
  const envVars = loadEnvVars();
  const results = {
    passed: [],
    failed: [],
    warnings: [],
    missing: [],
  };

  Object.entries(requiredVars).forEach(([key, config]) => {
    const value = envVars[key];
    const isCritical = config.critical;
    const isRequired = config.required;
    const isRecommended = config.recommended;

    // Check if variable exists
    if (!value || value === '' || value.includes('your-') || value.includes('xxx')) {
      if (isRequired || isCritical) {
        results.failed.push({
          key,
          reason: 'Missing or using placeholder value',
          config,
        });
      } else if (isRecommended) {
        results.warnings.push({
          key,
          reason: 'Recommended but not set',
          config,
        });
      } else {
        results.missing.push({
          key,
          config,
        });
      }
      return;
    }

    // Validate format if validator exists
    if (config.validate && !config.validate(value)) {
      results.failed.push({
        key,
        reason: 'Invalid format',
        config,
        value: value.substring(0, 20) + '...',
      });
      return;
    }

    // Production-specific checks
    if (isProduction && config.productionCheck && !config.productionCheck(value)) {
      results.failed.push({
        key,
        reason: 'Not suitable for production',
        config,
        value: value.substring(0, 20) + '...',
      });
      return;
    }

    results.passed.push({
      key,
      config,
    });
  });

  return results;
}

// Print results
function printResults(results) {
  console.log(`${colors.green}✅ Passed: ${results.passed.length}${colors.reset}`);
  results.passed.forEach(({ key }) => {
    console.log(`  ${colors.green}✓${colors.reset} ${key}`);
  });

  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  Warnings: ${results.warnings.length}${colors.reset}`);
    results.warnings.forEach(({ key, reason, config }) => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${key}`);
      console.log(`    ${reason}`);
      console.log(`    ${colors.blue}Example: ${config.example}${colors.reset}`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`\n${colors.red}❌ Failed: ${results.failed.length}${colors.reset}`);
    results.failed.forEach(({ key, reason, config, value }) => {
      console.log(`  ${colors.red}✗${colors.reset} ${key}`);
      console.log(`    ${reason}`);
      if (value) {
        console.log(`    Current: ${value}`);
      }
      console.log(`    ${colors.blue}Example: ${config.example}${colors.reset}`);
    });
  }

  if (results.missing.length > 0) {
    console.log(`\n${colors.cyan}ℹ️  Optional (not set): ${results.missing.length}${colors.reset}`);
    results.missing.forEach(({ key, config }) => {
      console.log(`  ${colors.cyan}○${colors.reset} ${key} - ${config.description}`);
    });
  }
}

// Print summary and exit
function printSummary(results) {
  console.log('\n' + '='.repeat(60));

  const totalChecked = Object.keys(requiredVars).length;
  const criticalFailed = results.failed.filter(r => r.config.critical).length;

  if (results.failed.length === 0) {
    console.log(`${colors.green}✅ ALL CHECKS PASSED!${colors.reset}`);
    console.log(`${colors.green}Environment is properly configured for ${mode}.${colors.reset}`);

    if (results.warnings.length > 0) {
      console.log(`\n${colors.yellow}Note: ${results.warnings.length} recommended variable(s) not set.${colors.reset}`);
      console.log(`${colors.yellow}Consider setting these for better monitoring and analytics.${colors.reset}`);
    }

    console.log('\n' + '='.repeat(60));
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ ENVIRONMENT VALIDATION FAILED${colors.reset}`);
    console.log(`${results.failed.length} of ${totalChecked} checks failed.`);

    if (criticalFailed > 0) {
      console.log(`\n${colors.red}⚠️  ${criticalFailed} CRITICAL variable(s) missing!${colors.reset}`);
      console.log(`${colors.red}Application will not function without these.${colors.reset}`);
    }

    console.log(`\n${colors.blue}Next steps:${colors.reset}`);
    console.log(`1. Set the missing/invalid environment variables`);
    console.log(`2. Reference: .env.${isProduction ? 'production.' : ''}example`);
    console.log(`3. Run this script again to verify`);

    console.log('\n' + '='.repeat(60));
    process.exit(1);
  }
}

// Additional checks
function additionalChecks(results) {
  console.log(`\n${colors.cyan}🔧 Additional Checks${colors.reset}\n`);

  // Check for .env file
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    console.log(`${colors.green}✓${colors.reset} .env file exists`);
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} No .env file found (using system environment variables)`);
  }

  // Check for .env.local
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    console.log(`${colors.green}✓${colors.reset} .env.local file exists`);
  }

  // Check .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (gitignore.includes('.env')) {
      console.log(`${colors.green}✓${colors.reset} .env files are gitignored`);
    } else {
      console.log(`${colors.red}✗${colors.reset} WARNING: .env files might not be gitignored!`);
      results.warnings.push({
        key: '.gitignore',
        reason: 'Add .env to .gitignore to prevent committing secrets',
      });
    }
  }

  // Check package.json for required dependencies
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const requiredDeps = ['@supabase/supabase-js', '@stripe/stripe-js', 'mapbox-gl'];
    const missing = requiredDeps.filter(dep => !pkg.dependencies[dep]);

    if (missing.length === 0) {
      console.log(`${colors.green}✓${colors.reset} All required dependencies installed`);
    } else {
      console.log(`${colors.red}✗${colors.reset} Missing dependencies: ${missing.join(', ')}`);
    }
  }
}

// Main execution
function main() {
  try {
    const results = verifyEnvironment();
    printResults(results);
    additionalChecks(results);
    printSummary(results);
  } catch (error) {
    console.error(`${colors.red}Error running verification:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main();
