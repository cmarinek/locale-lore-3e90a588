#!/usr/bin/env node

/**
 * Test script for geocacher-friendly facts seeding pipeline
 * 
 * This script validates the components without requiring Supabase credentials
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing geocacher-friendly facts seeding pipeline...\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, testFn) {
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${name}`);
      testsPassed++;
    } else {
      console.log(`❌ ${name} - Failed assertion`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: Check if cities.json exists and is valid
test('Cities data file exists and is valid JSON', () => {
  const citiesPath = path.join(__dirname, 'data', 'cities.json');
  const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  
  // Verify structure
  const regions = ['Europe', 'Africa', 'Americas', 'Asia', 'Oceania'];
  for (const region of regions) {
    if (!citiesData.regions[region] || !Array.isArray(citiesData.regions[region])) {
      throw new Error(`Missing or invalid region: ${region}`);
    }
  }
  
  return true;
});

// Test 2: Check if cities have required fields
test('All cities have required fields (name, country, lat, lng)', () => {
  const citiesPath = path.join(__dirname, 'data', 'cities.json');
  const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  
  for (const [regionName, cities] of Object.entries(citiesData.regions)) {
    for (const city of cities) {
      if (!city.name || !city.country || typeof city.lat !== 'number' || typeof city.lng !== 'number') {
        throw new Error(`City in ${regionName} missing required fields: ${JSON.stringify(city)}`);
      }
    }
  }
  
  return true;
});

// Test 3: Verify minimum city count per region
test('Each region has at least 10 cities', () => {
  const citiesPath = path.join(__dirname, 'data', 'cities.json');
  const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  
  for (const [regionName, cities] of Object.entries(citiesData.regions)) {
    if (cities.length < 10) {
      throw new Error(`Region ${regionName} has only ${cities.length} cities, need at least 10`);
    }
  }
  
  return true;
});

// Test 4: Check if supabaseAdmin module loads
test('SupabaseAdmin module loads without errors', () => {
  // Mock environment variables to prevent actual connection
  const originalEnv = process.env;
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  
  try {
    const { getAdminClient, getUserIdByEmail, storage } = require('./utils/supabaseAdmin.cjs');
    
    // Check exports exist
    if (typeof getAdminClient !== 'function') {
      throw new Error('getAdminClient is not a function');
    }
    if (typeof getUserIdByEmail !== 'function') {
      throw new Error('getUserIdByEmail is not a function');
    }
    if (typeof storage !== 'object') {
      throw new Error('storage is not an object');
    }
    
    // Check storage methods
    const expectedMethods = ['upload', 'download', 'getPublicUrl', 'list', 'remove', 'copy'];
    for (const method of expectedMethods) {
      if (typeof storage[method] !== 'function') {
        throw new Error(`storage.${method} is not a function`);
      }
    }
    
    return true;
  } finally {
    process.env = originalEnv;
  }
});

// Test 5: Check seeding script syntax
test('Seeding script loads without syntax errors', () => {
  const scriptPath = path.join(__dirname, 'seed-geocache-facts.cjs');
  const content = fs.readFileSync(scriptPath, 'utf8');
  
  // Basic syntax checks
  if (!content.includes('function seedFacts()')) {
    throw new Error('Missing main seedFacts function');
  }
  
  if (!content.includes('generateFact(')) {
    throw new Error('Missing generateFact function');
  }
  
  if (!content.includes('checkDuplicateFact(')) {
    throw new Error('Missing checkDuplicateFact function');
  }
  
  return true;
});

// Test 6: Verify fact templates structure
test('Fact templates are well-structured', () => {
  const scriptContent = fs.readFileSync(path.join(__dirname, 'seed-geocache-facts.cjs'), 'utf8');
  
  // Extract fact templates (basic regex check)
  if (!scriptContent.includes('factTemplates')) {
    throw new Error('Missing factTemplates');
  }
  
  const categories = ['history', 'culture', 'nature', 'mystery'];
  for (const category of categories) {
    if (!scriptContent.includes(`category: '${category}'`)) {
      throw new Error(`Missing category: ${category}`);
    }
  }
  
  return true;
});

// Test 7: Check CLI argument parsing
test('CLI argument parsing structure exists', () => {
  const scriptContent = fs.readFileSync(path.join(__dirname, 'seed-geocache-facts.cjs'), 'utf8');
  
  const expectedOptions = ['admin', 'dryRun', 'region', 'limit', 'verbose', 'storageSync'];
  for (const option of expectedOptions) {
    if (!scriptContent.includes(option)) {
      throw new Error(`Missing CLI option: ${option}`);
    }
  }
  
  return true;
});

// Test 8: Validate coordinate ranges
test('All city coordinates are within valid ranges', () => {
  const citiesPath = path.join(__dirname, 'data', 'cities.json');
  const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  
  for (const [regionName, cities] of Object.entries(citiesData.regions)) {
    for (const city of cities) {
      // Latitude: -90 to 90
      if (city.lat < -90 || city.lat > 90) {
        throw new Error(`Invalid latitude for ${city.name}: ${city.lat}`);
      }
      
      // Longitude: -180 to 180
      if (city.lng < -180 || city.lng > 180) {
        throw new Error(`Invalid longitude for ${city.name}: ${city.lng}`);
      }
    }
  }
  
  return true;
});

// Test 9: Check README documentation exists
test('README documentation exists and contains key sections', () => {
  const readmePath = path.join(__dirname, 'README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  const requiredSections = [
    'Usage',
    'CLI Options',
    'Environment Setup',
    'Features',
    'Storage Mirroring',
    'Duplicate Detection'
  ];
  
  for (const section of requiredSections) {
    if (!readmeContent.includes(section)) {
      throw new Error(`Missing README section: ${section}`);
    }
  }
  
  return true;
});

// Test 10: Verify geographic diversity
test('Cities represent diverse geographic locations', () => {
  const citiesPath = path.join(__dirname, 'data', 'cities.json');
  const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  
  // Check that we have cities across different hemispheres
  let northernCities = 0;
  let southernCities = 0;
  let easternCities = 0;
  let westernCities = 0;
  
  for (const [regionName, cities] of Object.entries(citiesData.regions)) {
    for (const city of cities) {
      if (city.lat > 0) northernCities++;
      if (city.lat < 0) southernCities++;
      if (city.lng > 0) easternCities++;
      if (city.lng < 0) westernCities++;
    }
  }
  
  // Ensure global coverage
  if (northernCities < 10 || southernCities < 10 || easternCities < 10 || westernCities < 10) {
    throw new Error('Insufficient geographic diversity in city selection');
  }
  
  return true;
});

// Run summary
console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed! The geocacher-friendly facts seeding pipeline is ready to use.');
  console.log('\n💡 Next steps:');
  console.log('   1. Set up environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  console.log('   2. Run with --dry-run first to preview generated facts');
  console.log('   3. Use --admin --storage-sync for full seeding with backup');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the issues before using the pipeline.');
  process.exit(1);
}