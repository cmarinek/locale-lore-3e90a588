#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const requiredEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];

const results = [];

const log = (status, message) => {
  const prefix = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`${prefix} [${status}] ${message}`);
};

const check = (description, predicate, critical = false) => {
  const passed = Boolean(predicate());
  results.push({ description, passed, critical });
  if (passed) {
    log('PASS', description);
  } else {
    log(critical ? 'FAIL' : 'WARN', description);
  }
};

check('Project root contains package.json', () => existsSync(path.join(projectRoot, 'package.json')), true);

check(
  'Monitoring dashboard is provisioned (monitoring/grafana-dashboard.json)',
  () => existsSync(path.join(projectRoot, 'monitoring', 'grafana-dashboard.json')),
  true
);

check('Service worker is bundled (public/sw.js)', () => existsSync(path.join(projectRoot, 'public', 'sw.js')), true);

check('PWA manifest is available (public/manifest.json)', () => existsSync(path.join(projectRoot, 'public', 'manifest.json')));

check('Offline fallback page exists (public/offline.html)', () => existsSync(path.join(projectRoot, 'public', 'offline.html')));

check('Production readiness report present', () => existsSync(path.join(projectRoot, 'PRODUCTION_READINESS_REPORT.md')));

check('Supabase configuration values are set in the environment', () => {
  return requiredEnv.every((key) => {
    if (process.env[key]) {
      return true;
    }

    // Support .env files loaded via Vite by checking for fallback config
    const envPath = path.join(projectRoot, '.env');
    if (existsSync(envPath)) {
      const envContents = readFileSync(envPath, 'utf-8');
      return envContents.split('\n').some((line) => line.trim().startsWith(`${key}=`));
    }

    return false;
  });
}, true);

check('Sentry DSN configured for monitoring (VITE_SENTRY_DSN)', () => {
  return Boolean(process.env.VITE_SENTRY_DSN);
});

const failures = results.filter((result) => result.critical && !result.passed);

console.log('\n==== Production Monitoring Summary ====');
console.log(`Checks passed: ${results.filter((result) => result.passed).length}/${results.length}`);

if (failures.length > 0) {
  console.error(`❌ Critical checks failing: ${failures.map((failure) => failure.description).join(', ')}`);
  process.exit(1);
}

console.log('✅ All critical monitoring checks passed.');
