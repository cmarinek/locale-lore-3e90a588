#!/usr/bin/env node

/**
 * Translation Audit Script
 * This script helps identify hardcoded strings that need translation
 * Run with: node scripts/translation-audit.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = 'src';
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];
const INCLUDE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Common patterns for hardcoded strings
const PATTERNS = [
  // JSX text content
  />\s*([A-Z][^<>{}]*[a-z][^<>{}]*)\s*</g,
  
  // String literals in JSX attributes
  /(?:placeholder|title|alt|aria-label)=['"]([^'"]+)['"]/g,
  
  // Error messages and notifications
  /(?:toast|error|message|notification).*['"]([^'"]+)['"]/g,
  
  // Button and link text
  /(?:Button|Link).*>([^<>{}]+)</g,
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hardcodedStrings = [];
  
  PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const string = match[1].trim();
      if (string.length > 3 && !isTranslationKey(string)) {
        hardcodedStrings.push({
          string,
          line: getLineNumber(content, match.index),
          pattern: pattern.source
        });
      }
    }
  });
  
  return hardcodedStrings;
}

function isTranslationKey(string) {
  // Check if string looks like a translation key
  return string.includes('t(') || 
         string.includes('{t(') ||
         string.includes('useT(') ||
         string.startsWith('navigation.') ||
         string.startsWith('auth.') ||
         string.startsWith('common.');
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function scanDirectory(dir) {
  const results = {};
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !EXCLUDE_DIRS.includes(file)) {
        walkDir(fullPath);
      } else if (stat.isFile() && INCLUDE_EXTENSIONS.some(ext => file.endsWith(ext))) {
        const hardcodedStrings = scanFile(fullPath);
        if (hardcodedStrings.length > 0) {
          results[fullPath] = hardcodedStrings;
        }
      }
    });
  }
  
  walkDir(dir);
  return results;
}

// Main execution
console.log('🔍 Scanning for hardcoded strings...');
const results = scanDirectory(SRC_DIR);

console.log('\n📊 Translation Audit Results');
console.log('=============================');

let totalStrings = 0;
Object.entries(results).forEach(([file, strings]) => {
  console.log(`\n📄 ${file}`);
  strings.forEach(({ string, line, pattern }) => {
    console.log(`   Line ${line}: "${string}"`);
    totalStrings++;
  });
});

console.log(`\n📈 Summary: Found ${totalStrings} potentially hardcoded strings in ${Object.keys(results).length} files`);

if (totalStrings > 0) {
  console.log('\n💡 Recommended actions:');
  console.log('1. Replace hardcoded strings with useTranslation or <T> components');
  console.log('2. Add corresponding entries to translation files');
  console.log('3. Test language switching functionality');
}

module.exports = { scanDirectory, scanFile };