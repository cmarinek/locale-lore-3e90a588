#!/usr/bin/env node

/**
 * Stripe Integration Verification Script
 *
 * Tests Stripe configuration and integration
 * Verifies products, prices, and webhook configuration
 *
 * Usage:
 *   node scripts/verify-stripe.mjs              # Check configuration
 *   node scripts/verify-stripe.mjs --test       # Run test mode checks
 *   node scripts/verify-stripe.mjs --production # Verify production setup
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const isProduction = process.argv.includes('--production');
const isTest = process.argv.includes('--test');

console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║          💳 STRIPE INTEGRATION VERIFICATION 💳          ║${colors.reset}`);
console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

// Load environment variables
function loadEnvVars() {
  const envVars = {};
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

  // Merge with process.env
  return { ...envVars, ...process.env };
}

const env = loadEnvVars();

// Get Stripe key
const stripePublishableKey = env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripeSecretKey = env.STRIPE_SECRET_KEY;

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

function addCheck(status, name, message, fix = null) {
  const check = { name, message, fix };

  if (status === 'pass') {
    checks.passed.push(check);
    console.log(`${colors.green}✅ ${name}${colors.reset}`);
    if (message) console.log(`   ${colors.green}${message}${colors.reset}`);
  } else if (status === 'fail') {
    checks.failed.push(check);
    console.log(`${colors.red}❌ ${name}${colors.reset}`);
    if (message) console.log(`   ${colors.red}${message}${colors.reset}`);
    if (fix) console.log(`   ${colors.blue}Fix: ${fix}${colors.reset}`);
  } else if (status === 'warn') {
    checks.warnings.push(check);
    console.log(`${colors.yellow}⚠️  ${name}${colors.reset}`);
    if (message) console.log(`   ${colors.yellow}${message}${colors.reset}`);
  }
}

// Check 1: Publishable key configured
console.log(`${colors.magenta}━━━ CONFIGURATION CHECKS ━━━${colors.reset}\n`);

if (!stripePublishableKey || stripePublishableKey.includes('your-key')) {
  addCheck('fail', 'Publishable Key', 'Not configured', 'Set VITE_STRIPE_PUBLISHABLE_KEY in .env');
} else {
  const keyType = stripePublishableKey.startsWith('pk_live_') ? 'LIVE' : 'TEST';
  addCheck('pass', 'Publishable Key', `Configured (${keyType} mode)`);

  // Production check
  if (isProduction && !stripePublishableKey.startsWith('pk_live_')) {
    addCheck('fail', 'Production Key Check', 'Using test key in production mode',
      'Switch to live key (pk_live_...)');
  }
}

// Check 2: Secret key configured (for backend)
if (!stripeSecretKey || stripeSecretKey.includes('your-key')) {
  addCheck('warn', 'Secret Key', 'Not configured (required for backend)',
    'Set STRIPE_SECRET_KEY in Supabase Edge Functions');
} else {
  const keyType = stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  addCheck('pass', 'Secret Key', `Configured (${keyType} mode)`);
}

// Check 3: Keys match mode
if (stripePublishableKey && stripeSecretKey) {
  const pubIsLive = stripePublishableKey.startsWith('pk_live_');
  const secretIsLive = stripeSecretKey.startsWith('sk_live_');

  if (pubIsLive !== secretIsLive) {
    addCheck('fail', 'Key Mode Match', 'Publishable and secret keys are in different modes',
      'Ensure both keys are either test or live mode');
  } else {
    addCheck('pass', 'Key Mode Match', 'Keys are in matching modes');
  }
}

// Check 4: Webhook secret
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret || webhookSecret.includes('your-')) {
  addCheck('warn', 'Webhook Secret', 'Not configured',
    'Set STRIPE_WEBHOOK_SECRET from Stripe Dashboard');
} else {
  addCheck('pass', 'Webhook Secret', 'Configured');
}

// Check 5: Price IDs
console.log(`\n${colors.magenta}━━━ PRODUCT CONFIGURATION ━━━${colors.reset}\n`);

const priceIds = {
  basic: env.STRIPE_PRICE_ID_BASIC,
  premium: env.STRIPE_PRICE_ID_PREMIUM,
  pro: env.STRIPE_PRICE_ID_PRO,
};

Object.entries(priceIds).forEach(([tier, priceId]) => {
  if (!priceId || priceId.includes('price_...')) {
    addCheck('warn', `${tier.toUpperCase()} Price ID`, 'Not configured',
      `Set STRIPE_PRICE_ID_${tier.toUpperCase()} in .env`);
  } else {
    addCheck('pass', `${tier.toUpperCase()} Price ID`, `Configured: ${priceId}`);
  }
});

// If we have a secret key, try to verify with Stripe API
if (stripeSecretKey && !stripeSecretKey.includes('your-key')) {
  console.log(`\n${colors.magenta}━━━ STRIPE API CHECKS ━━━${colors.reset}\n`);
  console.log(`${colors.blue}Connecting to Stripe API...${colors.reset}\n`);

  // Test API connection
  const testStripeAPI = () => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.stripe.com',
        path: '/v1/products?limit=3',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  };

  try {
    const products = await testStripeAPI();
    addCheck('pass', 'Stripe API Connection', `Successfully connected (${products.data.length} products found)`);

    // List products
    if (products.data.length > 0) {
      console.log(`\n${colors.blue}Products in Stripe:${colors.reset}`);
      products.data.forEach(product => {
        console.log(`  • ${product.name} (${product.id})`);
      });

      // Check for LocaleLore products
      const hasBasic = products.data.some(p => p.name.toLowerCase().includes('basic'));
      const hasPremium = products.data.some(p => p.name.toLowerCase().includes('premium'));
      const hasPro = products.data.some(p => p.name.toLowerCase().includes('pro'));

      if (hasBasic && hasPremium && hasPro) {
        addCheck('pass', 'Subscription Products', 'All tiers configured (Basic, Premium, Pro)');
      } else {
        const missing = [];
        if (!hasBasic) missing.push('Basic');
        if (!hasPremium) missing.push('Premium');
        if (!hasPro) missing.push('Pro');

        addCheck('warn', 'Subscription Products', `Missing tiers: ${missing.join(', ')}`,
          'Create products in Stripe Dashboard');
      }
    } else {
      addCheck('warn', 'Subscription Products', 'No products found in Stripe',
        'Create products using docs/STRIPE_PRODUCTION_SETUP.md');
    }
  } catch (error) {
    addCheck('fail', 'Stripe API Connection', `Failed: ${error.message}`,
      'Verify secret key is correct');
  }

  // Test webhook endpoint (if URL is provided)
  if (env.VITE_SUPABASE_URL) {
    console.log(`\n${colors.magenta}━━━ WEBHOOK CHECKS ━━━${colors.reset}\n`);

    const webhookUrl = `${env.VITE_SUPABASE_URL}/functions/v1/stripe-webhooks`;
    console.log(`${colors.blue}Webhook URL: ${webhookUrl}${colors.reset}\n`);

    // Check if webhook endpoint exists
    const testWebhookEndpoint = () => {
      return new Promise((resolve, reject) => {
        const url = new URL(webhookUrl);
        const options = {
          hostname: url.hostname,
          path: url.pathname,
          method: 'GET',
          timeout: 5000,
        };

        const req = https.request(options, (res) => {
          resolve({ status: res.statusCode, headers: res.headers });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });

        req.end();
      });
    };

    try {
      const response = await testWebhookEndpoint();
      if (response.status === 200 || response.status === 400) {
        addCheck('pass', 'Webhook Endpoint', 'Endpoint is accessible');
      } else {
        addCheck('warn', 'Webhook Endpoint', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      addCheck('warn', 'Webhook Endpoint', `Could not reach endpoint: ${error.message}`,
        'Ensure Edge Function is deployed');
    }
  }
}

// Summary
console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║                      SUMMARY                             ║${colors.reset}`);
console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

console.log(`${colors.green}✅ Passed:   ${checks.passed.length}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Warnings: ${checks.warnings.length}${colors.reset}`);
console.log(`${colors.red}❌ Failed:   ${checks.failed.length}${colors.reset}\n`);

// Recommendations
if (checks.failed.length > 0) {
  console.log(`${colors.red}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.red}║            🚫 STRIPE NOT READY 🚫                       ║${colors.reset}`);
  console.log(`${colors.red}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.red}Critical issues found. Payment processing will not work.${colors.reset}\n`);

  console.log(`${colors.blue}Next steps:${colors.reset}`);
  console.log(`  1. Follow docs/STRIPE_PRODUCTION_SETUP.md`);
  console.log(`  2. Fix all failed checks above`);
  console.log(`  3. Run this script again to verify\n`);

  process.exit(1);
} else if (checks.warnings.length > 0) {
  console.log(`${colors.yellow}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.yellow}║          ⚠️  STRIPE PARTIALLY READY ⚠️                  ║${colors.reset}`);
  console.log(`${colors.yellow}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.yellow}Basic configuration complete, but some items need attention.${colors.reset}\n`);

  console.log(`${colors.blue}Recommendations:${colors.reset}`);
  checks.warnings.forEach(w => {
    console.log(`  • ${w.name}: ${w.message}`);
    if (w.fix) console.log(`    → ${w.fix}`);
  });

  console.log(`\n${colors.green}You can proceed, but complete setup is recommended.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.green}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║          ✅ STRIPE READY FOR PRODUCTION! ✅             ║${colors.reset}`);
  console.log(`${colors.green}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.green}All Stripe checks passed! Payment processing is ready.${colors.reset}\n`);

  console.log(`${colors.blue}Before going live:${colors.reset}`);
  console.log(`  1. Test a subscription in production`);
  console.log(`  2. Verify webhook delivery in Stripe Dashboard`);
  console.log(`  3. Test subscription cancellation`);
  console.log(`  4. Refund the test payment\n`);

  console.log(`${colors.blue}Reference: docs/STRIPE_PRODUCTION_SETUP.md (Test Checklist)${colors.reset}\n`);
  process.exit(0);
}
