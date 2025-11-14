#!/usr/bin/env node

/**
 * Production Readiness Master Check
 *
 * Runs all verification scripts and provides overall readiness score
 * This is your one-command solution to verify production readiness
 *
 * Usage: node scripts/production-ready.mjs [--quick]
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
  bold: '\x1b[1m',
};

const isQuick = process.argv.includes('--quick');

console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}║                                                                ║${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}║          🚀 PRODUCTION READINESS ASSESSMENT 🚀                ║${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}║                                                                ║${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

const results = {
  environment: null,
  stripe: null,
  deployment: null,
};

let totalScore = 0;
let maxScore = 0;

// Run environment check
async function checkEnvironment() {
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}1. ENVIRONMENT CONFIGURATION${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    const { stdout, stderr } = await execAsync('node scripts/verify-environment.mjs --production');
    console.log(stdout);

    // Parse output to count passes/failures
    const passed = (stdout.match(/✅/g) || []).length;
    const failed = (stdout.match(/❌/g) || []).length;
    const warnings = (stdout.match(/⚠️/g) || []).length;

    results.environment = {
      passed,
      failed,
      warnings,
      score: passed / (passed + failed + warnings) * 100,
    };

    return { success: failed === 0, score: results.environment.score };
  } catch (error) {
    console.log(error.stdout || error.stderr);
    results.environment = { passed: 0, failed: 10, warnings: 0, score: 0 };
    return { success: false, score: 0 };
  }
}

// Run Stripe check
async function checkStripe() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}2. STRIPE PAYMENT INTEGRATION${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    const { stdout } = await execAsync('node scripts/verify-stripe.mjs --production');
    console.log(stdout);

    const passed = (stdout.match(/✅/g) || []).length;
    const failed = (stdout.match(/❌/g) || []).length;
    const warnings = (stdout.match(/⚠️/g) || []).length;

    results.stripe = {
      passed,
      failed,
      warnings,
      score: passed / (passed + failed + warnings) * 100,
    };

    return { success: failed === 0, score: results.stripe.score };
  } catch (error) {
    console.log(error.stdout || error.stderr);
    results.stripe = { passed: 0, failed: 10, warnings: 0, score: 0 };
    return { success: false, score: 0 };
  }
}

// Run deployment check
async function checkDeployment() {
  if (isQuick) {
    console.log(`\n${colors.yellow}⏭️  Skipping deployment checks (--quick mode)${colors.reset}\n`);
    results.deployment = { passed: 0, failed: 0, warnings: 0, score: 100 };
    return { success: true, score: 100, skipped: true };
  }

  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}3. DEPLOYMENT READINESS${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    const { stdout } = await execAsync('node scripts/pre-deployment-check.mjs', {
      maxBuffer: 10 * 1024 * 1024,
    });
    console.log(stdout);

    const passed = (stdout.match(/✅/g) || []).length;
    const failed = (stdout.match(/❌/g) || []).length;
    const warnings = (stdout.match(/⚠️/g) || []).length;

    results.deployment = {
      passed,
      failed,
      warnings,
      score: passed / (passed + failed + warnings) * 100,
    };

    return { success: failed === 0, score: results.deployment.score };
  } catch (error) {
    console.log(error.stdout || error.stderr);
    const passed = ((error.stdout || '').match(/✅/g) || []).length;
    const failed = ((error.stdout || '').match(/❌/g) || []).length;
    const warnings = ((error.stdout || '').match(/⚠️/g) || []).length;

    results.deployment = {
      passed,
      failed,
      warnings,
      score: failed === 0 ? 100 : (passed / (passed + failed + warnings) * 100),
    };

    return { success: false, score: results.deployment.score };
  }
}

// Calculate overall readiness
function calculateReadiness() {
  const weights = {
    environment: 0.3,
    stripe: 0.4,
    deployment: 0.3,
  };

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(results).forEach(([key, result]) => {
    if (result && result.score !== undefined) {
      weightedScore += result.score * weights[key];
      totalWeight += weights[key];
    }
  });

  return Math.round(weightedScore / totalWeight);
}

// Print final report
function printFinalReport(overallScore) {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║                     FINAL ASSESSMENT                           ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Category scores
  console.log(`${colors.bold}Category Scores:${colors.reset}\n`);

  if (results.environment) {
    const color = results.environment.score >= 90 ? colors.green :
      results.environment.score >= 70 ? colors.yellow : colors.red;
    console.log(`  ${color}Environment:  ${Math.round(results.environment.score)}%${colors.reset} ` +
      `(${results.environment.passed} passed, ${results.environment.failed} failed, ${results.environment.warnings} warnings)`);
  }

  if (results.stripe) {
    const color = results.stripe.score >= 90 ? colors.green :
      results.stripe.score >= 70 ? colors.yellow : colors.red;
    console.log(`  ${color}Stripe:       ${Math.round(results.stripe.score)}%${colors.reset} ` +
      `(${results.stripe.passed} passed, ${results.stripe.failed} failed, ${results.stripe.warnings} warnings)`);
  }

  if (results.deployment && !isQuick) {
    const color = results.deployment.score >= 90 ? colors.green :
      results.deployment.score >= 70 ? colors.yellow : colors.red;
    console.log(`  ${color}Deployment:   ${Math.round(results.deployment.score)}%${colors.reset} ` +
      `(${results.deployment.passed} passed, ${results.deployment.failed} failed, ${results.deployment.warnings} warnings)`);
  }

  // Overall score
  console.log(`\n${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const scoreColor = overallScore >= 90 ? colors.green :
    overallScore >= 70 ? colors.yellow : colors.red;

  console.log(`${colors.bold}${scoreColor}OVERALL PRODUCTION READINESS: ${overallScore}%${colors.reset}\n`);

  // Readiness level
  let readinessLevel, statusIcon, statusColor;

  if (overallScore >= 95) {
    readinessLevel = 'READY TO LAUNCH';
    statusIcon = '🚀';
    statusColor = colors.green;
  } else if (overallScore >= 80) {
    readinessLevel = 'ALMOST READY';
    statusIcon = '⚠️';
    statusColor = colors.yellow;
  } else if (overallScore >= 60) {
    readinessLevel = 'NEEDS WORK';
    statusIcon = '🔧';
    statusColor = colors.yellow;
  } else {
    readinessLevel = 'NOT READY';
    statusIcon = '❌';
    statusColor = colors.red;
  }

  console.log(`${colors.bold}${statusColor}STATUS: ${statusIcon} ${readinessLevel} ${statusIcon}${colors.reset}\n`);

  // Recommendations
  console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (overallScore >= 95) {
    console.log(`${colors.green}✅ You're ready to launch!${colors.reset}\n`);
    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log(`  1. Review: docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md`);
    console.log(`  2. Deploy: git push origin production`);
    console.log(`  3. Monitor: Set up Sentry and uptime monitoring`);
    console.log(`  4. Test: Run one subscription with real payment`);
    console.log(`  5. Launch: Open to public! 🎉\n`);
  } else if (overallScore >= 80) {
    console.log(`${colors.yellow}You're close! Fix remaining issues before launching.${colors.reset}\n`);
    console.log(`${colors.blue}Priority actions:${colors.reset}`);

    if (results.environment && results.environment.failed > 0) {
      console.log(`  • Fix ${results.environment.failed} environment variable issue(s)`);
    }
    if (results.stripe && results.stripe.failed > 0) {
      console.log(`  • Complete Stripe configuration (${results.stripe.failed} issue(s))`);
    }
    if (results.deployment && results.deployment.failed > 0) {
      console.log(`  • Resolve ${results.deployment.failed} deployment issue(s)`);
    }

    console.log(`\n${colors.blue}Then run this script again to verify.${colors.reset}\n`);
  } else {
    console.log(`${colors.red}Several critical issues need to be resolved.${colors.reset}\n`);
    console.log(`${colors.blue}Start here:${colors.reset}`);
    console.log(`  1. Follow: docs/LAUNCH_CHECKLIST.md`);
    console.log(`  2. Configure: Stripe (docs/STRIPE_PRODUCTION_SETUP.md)`);
    console.log(`  3. Set: Environment variables (.env.production.example)`);
    console.log(`  4. Fix: Build and test errors`);
    console.log(`  5. Re-run: node scripts/production-ready.mjs\n`);
  }

  // Progress bar
  const barLength = 50;
  const filledLength = Math.round(barLength * (overallScore / 100));
  const emptyLength = barLength - filledLength;

  const barColor = overallScore >= 90 ? colors.green :
    overallScore >= 70 ? colors.yellow : colors.red;

  const progressBar = barColor + '█'.repeat(filledLength) + colors.reset +
    '░'.repeat(emptyLength);

  console.log(`${colors.bold}Progress to 100%:${colors.reset}`);
  console.log(`[${progressBar}] ${overallScore}%\n`);

  // Save results
  const reportPath = path.join(__dirname, '..', '.production-readiness.json');
  const report = {
    timestamp: new Date().toISOString(),
    overallScore,
    results,
    status: readinessLevel,
  };

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`${colors.blue}📊 Report saved to: .production-readiness.json${colors.reset}\n`);
  } catch (error) {
    // Non-critical, just skip
  }
}

// Main execution
async function main() {
  const startTime = Date.now();

  try {
    // Run all checks
    const envResult = await checkEnvironment();
    const stripeResult = await checkStripe();
    const deployResult = await checkDeployment();

    // Calculate overall readiness
    const overallScore = calculateReadiness();

    // Print report
    printFinalReport(overallScore);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`${colors.blue}⏱️  Completed in ${duration}s${colors.reset}\n`);

    // Exit code based on readiness
    if (overallScore >= 95) {
      process.exit(0); // Ready to launch
    } else if (overallScore >= 80) {
      process.exit(0); // Close enough, warnings only
    } else {
      process.exit(1); // Not ready
    }
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during readiness check:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main();
